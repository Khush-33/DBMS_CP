import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../state/AuthContext';

const AuctionPortalPage = () => {
    const { user } = useAuth();
    const [auctionState, setAuctionState] = useState(null);
    const [teams, setTeams] = useState([]);
    const [connectedTeams, setConnectedTeams] = useState([]);
    const [bidHistory, setBidHistory] = useState([]);
    const [soldAnnouncement, setSoldAnnouncement] = useState('');
    const [role, setRole] = useState(null); // 'Auctioneer' or a team name
    const ws = useRef(null);

    useEffect(() => {
        // Connect to WebSocket server
        ws.current = new WebSocket('ws://localhost:5000');

        ws.current.onopen = () => console.log('WebSocket connected!');
        ws.current.onclose = () => console.log('WebSocket disconnected.');

        ws.current.onmessage = (event) => {
            const data = JSON.parse(event.data);
            switch (data.type) {
                case 'AUCTION_STATE':
                    setAuctionState(data.state);
                    if (data.state.status === 'sold') {
                        setBidHistory([]); // Clear bid history for next player
                    }
                    break;
                case 'TEAMS_UPDATE':
                    setTeams(data.teams);
                    break;
                case 'CONNECTED_TEAMS':
                    setConnectedTeams(data.teams);
                    break;
                case 'BID_LOG':
                    setBidHistory(prev => [data.log, ...prev]);
                    break;
                case 'SOLD_ANNOUNCEMENT':
                    setSoldAnnouncement(data.message);
                    setTimeout(() => setSoldAnnouncement(''), 4000); // Hide after 4s
                    break;
                default:
                    break;
            }
        };

        return () => {
            if (ws.current) {
                ws.current.close();
            }
        };
    }, []);

    const sendMessage = (data) => {
        if (ws.current && ws.current.readyState === WebSocket.OPEN) {
            ws.current.send(JSON.stringify(data));
        }
    };

    const handleSetRole = (selectedRole) => {
        setRole(selectedRole);
        sendMessage({ type: 'REGISTER_ROLE', role: selectedRole });
    };

    const placeBid = (amount) => {
        const myTeam = teams.find(t => t.name === role);
        if (myTeam && myTeam.budget >= amount) {
            sendMessage({ type: 'PLACE_BID', team: role, amount });
        }
    };

    if (!role) {
        return <RoleSelectionScreen teams={teams} onSelectRole={handleSetRole} canSelectAuctioneer={user?.role === 'auctioneer'} />;
    }

    return (
        <div className="min-h-screen bg-gray-900 text-white p-4 lg:p-8 font-sans flex flex-col">
            {soldAnnouncement && <SoldOverlay message={soldAnnouncement} />}
            <Header role={role} />
            <div className="flex-grow grid grid-cols-1 lg:grid-cols-4 gap-6 mt-6">
                <div className="lg:col-span-3 grid grid-rows-3 gap-6">
                    <div className="row-span-2">
                        <CurrentPlayerStage auctionState={auctionState} />
                    </div>
                    <div className="row-span-1">
                        <TeamPaddles teams={teams} auctionState={auctionState} role={role} placeBid={placeBid} connectedTeams={connectedTeams} />
                    </div>
                </div>
                <div className="lg:col-span-1 flex flex-col gap-6">
                    <BidHistory bids={bidHistory} />
                    <SoldPlayers history={auctionState?.soldHistory || []} />
                    {user?.role === 'auctioneer' && role === 'Auctioneer' && (
                        <AuctioneerControls auctionState={auctionState} onStart={() => sendMessage({ type: 'START_AUCTION' })} onNext={() => sendMessage({ type: 'NEXT_PLAYER' })} />
                    )}
                </div>
            </div>
        </div>
    );
};

// --- Sub-components ---

const RoleSelectionScreen = ({ teams, onSelectRole, canSelectAuctioneer }) => (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-95 flex flex-col items-center justify-center z-50">
        <h1 className="text-5xl font-extrabold text-white mb-4">Select Your Role</h1>
        <p className="text-gray-400 mb-10">Choose to be the Auctioneer or represent a team.</p>
        <div className="w-full max-w-4xl p-4">
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 text-center">
                {canSelectAuctioneer && (
                    <div className="col-span-full">
                        <button onClick={() => onSelectRole('Auctioneer')} className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-4 px-6 rounded-lg transition-transform transform hover:scale-105">
                            AUCTIONEER
                        </button>
                    </div>
                )}
                {teams.map(team => (
                    <button key={team.id} onClick={() => onSelectRole(team.name)} className="bg-gray-800 hover:bg-gray-700 text-white font-semibold py-3 px-4 rounded-lg transition-transform transform hover:scale-105">
                        {team.name}
                    </button>
                ))}
            </div>
        </div>
    </div>
);

const Header = ({ role }) => (
    <div className="flex justify-between items-center bg-black bg-opacity-20 p-4 rounded-xl border border-gray-700">
        <h1 className="text-3xl font-extrabold tracking-wider uppercase">IPL Live Auction</h1>
        <div className="text-right">
            <p className="text-sm text-gray-400">Your Role</p>
            <p className="font-bold text-lg text-orange-400">{role}</p>
        </div>
    </div>
);

const CurrentPlayerStage = ({ auctionState }) => {
    if (auctionState?.status === 'pending') {
        return <div className="h-full flex items-center justify-center bg-black bg-opacity-20 rounded-xl border-2 border-dashed border-gray-700"><p className="text-2xl text-gray-500">Auction is about to begin...</p></div>;
    }
    if (auctionState?.status === 'finished') {
        return <div className="h-full flex items-center justify-center bg-black bg-opacity-20 rounded-xl border border-gray-700"><p className="text-4xl font-bold text-orange-500">AUCTION FINISHED!</p></div>;
    }
    if (!auctionState?.currentPlayer) {
        return <div className="h-full flex items-center justify-center bg-black bg-opacity-20 rounded-xl border border-gray-700"><p className="text-2xl text-gray-500">Waiting for next player...</p></div>;
    }

    const { currentPlayer, currentBid, highestBidder, timer } = auctionState;
    const timerColor = timer <= 3 ? 'text-red-500' : 'text-gray-300';

    return (
        <div className="h-full bg-black bg-opacity-20 rounded-xl border border-gray-700 p-6 flex flex-col justify-between relative overflow-hidden">
             <div className="absolute -top-1/2 -right-1/4 w-3/4 h-3/4 bg-blue-900/30 rounded-full filter blur-3xl animate-pulse"></div>
            <div className="flex justify-between items-start">
                <div>
                    <p className="font-semibold text-gray-400">{currentPlayer.role} - {currentPlayer.country}</p>
                    <h2 className="text-5xl font-extrabold text-white">{currentPlayer.name}</h2>
                    <p className="mt-2 text-lg text-gray-400">Base Price: <span className="font-bold text-white">₹{currentPlayer.basePrice.toLocaleString()}</span></p>
                </div>
                <div className={`text-6xl font-black ${timerColor} transition-colors`}>{timer}</div>
            </div>
            <div className="text-center">
                <p className="text-lg text-gray-400">Current Bid</p>
                <p className="text-7xl font-extrabold text-orange-400">₹{currentBid.toLocaleString()}</p>
                <p className="mt-2 text-lg text-gray-400">
                    Highest Bidder: <span className="font-bold text-white">{highestBidder || 'None'}</span>
                </p>
            </div>
        </div>
    );
};

const TeamPaddles = ({ teams, auctionState, role, placeBid, connectedTeams }) => (
    <div className="grid grid-cols-5 gap-3 h-full">
        {teams.map(team => {
            const isHighestBidder = auctionState?.highestBidder === team.name;
            const canAfford = auctionState?.currentBid > 0 ? team.budget >= auctionState.currentBid : true;
            const isMyTeam = team.name === role;
            const isConnected = connectedTeams.includes(team.name);
            
            const nextBidAmount = auctionState?.currentBid > 0 ? auctionState.currentBid + 200000 : auctionState?.currentPlayer?.basePrice || 200000;

            let borderColor = 'border-gray-700';
            if (isHighestBidder) borderColor = 'border-orange-500 ring-2 ring-orange-500';
            else if (isMyTeam) borderColor = 'border-blue-500';

            return (
                <div key={team.id} className={`bg-black bg-opacity-20 rounded-lg p-3 flex flex-col justify-between border ${borderColor} ${!canAfford ? 'opacity-30' : ''} transition-all relative`}>
                    <div className={`absolute top-1 right-1 w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-gray-600'}`}></div>
                    <div>
                        <p className="font-bold text-sm truncate">{team.name}</p>
                        <p className="text-xs text-gray-400">₹{team.budget.toLocaleString()}</p>
                    </div>
                    {isMyTeam && auctionState?.status === 'active' && canAfford && (
                        <button onClick={() => placeBid(nextBidAmount)} className="w-full mt-2 bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-2 text-xs rounded-md transition-transform transform hover:scale-105">
                            BID ₹{nextBidAmount.toLocaleString()}
                        </button>
                    )}
                </div>
            );
        })}
    </div>
);

const BidHistory = ({ bids }) => (
    <div className="bg-black bg-opacity-20 rounded-xl p-4 border border-gray-700 flex-grow">
        <h3 className="font-bold text-lg mb-2">🔄 Bid History</h3>
        <div className="space-y-2 text-sm overflow-y-auto h-32">
            {bids.length === 0 && <p className="text-gray-500">No bids yet for this player.</p>}
            {bids.map((bid, i) => (
                <p key={i}><span className="font-semibold text-orange-400">{bid.team}</span> bids {bid.amount}</p>
            ))}
        </div>
    </div>
);

const SoldPlayers = ({ history }) => (
    <div className="bg-black bg-opacity-20 rounded-xl p-4 border border-gray-700 flex-grow">
        <h3 className="font-bold text-lg mb-2">🏆 Players Sold</h3>
        <div className="space-y-2 text-sm overflow-y-auto h-48">
             {history.length === 0 && <p className="text-gray-500">No players sold yet.</p>}
            {history.map((item, i) => (
                <div key={i}>
                    <p className="font-semibold text-white">{item.player.name}</p>
                    <p className="text-xs text-gray-400">to {item.team} for ₹{item.price.toLocaleString()}</p>
                </div>
            ))}
        </div>
    </div>
);

const AuctioneerControls = ({ auctionState, onStart, onNext }) => (
    <div className="bg-black bg-opacity-20 rounded-xl p-4 border border-gray-700">
        <h3 className="font-bold text-lg mb-3">Auctioneer Controls</h3>
        {auctionState?.status === 'pending' && <button onClick={onStart} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg">START AUCTION</button>}
        {auctionState?.status === 'sold' && <button onClick={onNext} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg">NEXT PLAYER</button>}
    </div>
);

const SoldOverlay = ({ message }) => (
    <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 animate-fade-in-out">
        <div className="text-center">
            <div className="text-6xl mb-4">🔨</div>
            <h2 className="text-6xl font-extrabold text-orange-400">{message}</h2>
        </div>
    </div>
);

export default AuctionPortalPage;

