const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const dotenv = require('dotenv');
const cors = require('cors');
const db = require('./config/db'); // Import the database connection

// Load env vars
dotenv.config();

// --- DATA (Fetched from the database) ---
let availablePlayers = [];
let teamsData = [];
let clients = new Map(); // Tracks connected clients and their roles

// --- AUCTION STATE ---
let auctionState = {
    status: 'pending', // pending, active, sold, finished
    currentPlayerIndex: -1,
    currentPlayer: null,
    currentBid: 0,
    highestBidder: null, // Team name
    highestBidderId: null, // Team ID
    timer: 10,
    soldHistory: [],
};
let timerInterval = null;

// --- DATABASE HYDRATION ---
const initializeAuctionData = async () => {
    try {
        await db.query("UPDATE Players SET Status = 'Available'");
        await db.query("DELETE FROM Team_Players");
        await db.query("DELETE FROM Bids");

        const [playersResult] = await db.query("SELECT Player_ID as id, Name as name, Country as country, Role as role, Base_Price as basePrice, Status as status FROM Players");
        availablePlayers = playersResult;

        const [teamsResult] = await db.query("SELECT Team_ID as id, Team_Name as name, Budget_Remaining as budget FROM Teams");
        teamsData = teamsResult;

        console.log('Successfully fetched and initialized data from the database.');
    } catch (error) {
        console.error('FATAL: Could not initialize data from database.', error);
        process.exit(1);
    }
};

// --- EXPRESS API SERVER ---
const app = express();
app.use(cors());
app.use(express.json());

// Mount routers
const teamRoutes = require('./routes/teams');
const playerRoutes = require('./routes/players');
const auctionRoutes = require('./routes/auctions');
const bidRoutes = require('./routes/bids');
const sponsorRoutes = require('./routes/sponsors');
const venueRoutes = require('./routes/venues');
const playerStatRoutes = require('./routes/playerStats');
const teamPlayerRoutes = require('./routes/teamPlayers');

app.use('/api/teams', teamRoutes);
app.use('/api/players', playerRoutes);
app.use('/api/auctions', auctionRoutes);
app.use('/api/bids', bidRoutes);
app.use('/api/sponsors', sponsorRoutes);
app.use('/api/venues', venueRoutes);
app.use('/api/stats', playerStatRoutes);
app.use('/api/squads', teamPlayerRoutes);

const server = http.createServer(app);

// --- WEBSOCKET SERVER ---
const wss = new WebSocket.Server({ server });

const broadcast = (data) => {
    wss.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify(data));
        }
    });
};

const broadcastAuctionState = () => broadcast({ type: 'AUCTION_STATE', state: auctionState });
const broadcastTeamsUpdate = () => broadcast({ type: 'TEAMS_UPDATE', teams: teamsData });
const broadcastConnectedTeams = () => {
    const connectedRoles = Array.from(clients.values()).map(c => c.role);
    broadcast({ type: 'CONNECTED_TEAMS', teams: connectedRoles });
};

const startTimer = () => {
    clearInterval(timerInterval);
    auctionState.timer = 10;
    broadcastAuctionState();

    timerInterval = setInterval(() => {
        auctionState.timer--;
        if (auctionState.timer <= 0) {
            clearInterval(timerInterval);
            sellPlayer();
        }
        broadcastAuctionState();
    }, 1000);
};

const sellPlayer = async () => {
    auctionState.status = 'sold';
    let soldMessage = `${auctionState.currentPlayer.name} goes UNSOLD.`;

    if (auctionState.highestBidderId) {
        soldMessage = `${auctionState.currentPlayer.name} SOLD to ${auctionState.highestBidder} for ₹${auctionState.currentBid.toLocaleString()}`;
        try {
            await db.query('INSERT INTO Team_Players (Team_ID, Player_ID, Auction_ID, Price) VALUES (?, ?, ?, ?)', [auctionState.highestBidderId, auctionState.currentPlayer.id, 1, auctionState.currentBid]);
            await db.query("UPDATE Players SET Status = 'Sold' WHERE Player_ID = ?", [auctionState.currentPlayer.id]);
            
            const winningTeam = teamsData.find(t => t.id === auctionState.highestBidderId);
            if (winningTeam) winningTeam.budget -= auctionState.currentBid;
            
            auctionState.soldHistory.push({
                player: auctionState.currentPlayer,
                team: auctionState.highestBidder,
                price: auctionState.currentBid,
            });

        } catch (error) {
            console.error("Database error during sellPlayer:", error);
        }
    } else {
        await db.query("UPDATE Players SET Status = 'Unsold' WHERE Player_ID = ?", [auctionState.currentPlayer.id]);
    }
    
    broadcastAuctionState();
    broadcastTeamsUpdate();
    broadcast({ type: 'SOLD_ANNOUNCEMENT', message: soldMessage });
};

const nextPlayer = () => {
    auctionState.currentPlayerIndex++;
    const nextAvailablePlayer = availablePlayers.find((p, index) => index >= auctionState.currentPlayerIndex && p.status === 'Available');

    if (!nextAvailablePlayer) {
        auctionState.status = 'finished';
        auctionState.currentPlayer = null;
        clearInterval(timerInterval);
    } else {
        auctionState.currentPlayer = nextAvailablePlayer;
        auctionState.currentPlayerIndex = availablePlayers.indexOf(nextAvailablePlayer);
        auctionState.status = 'active';
        auctionState.currentBid = 0;
        auctionState.highestBidder = null;
        auctionState.highestBidderId = null;
        startTimer();
    }
    broadcastAuctionState();
};

wss.on('connection', ws => {
    const clientId = Date.now(); // Simple unique ID for the connection
    clients.set(clientId, { ws, role: null });
    console.log('Client connected.');

    ws.send(JSON.stringify({ type: 'AUCTION_STATE', state: auctionState }));
    ws.send(JSON.stringify({ type: 'TEAMS_UPDATE', teams: teamsData }));
    broadcastConnectedTeams();

    ws.on('message', async (message) => {
        try {
            const data = JSON.parse(message);
            const clientInfo = clients.get(clientId);

            switch (data.type) {
                case 'REGISTER_ROLE':
                    clientInfo.role = data.role;
                    console.log(`Client registered as ${data.role}`);
                    broadcastConnectedTeams();
                    break;
                case 'START_AUCTION':
                    if (clientInfo.role === 'Auctioneer' && auctionState.status === 'pending') {
                        console.log('Auction started by Auctioneer!');
                        nextPlayer();
                    }
                    break;
                case 'NEXT_PLAYER':
                    if (clientInfo.role === 'Auctioneer' && auctionState.status === 'sold') {
                        console.log('Moving to next player');
                        nextPlayer();
                    }
                    break;
                case 'PLACE_BID':
                    if (auctionState.status === 'active' && clientInfo.role === data.team) {
                        const { team, amount } = data;
                        const biddingTeam = teamsData.find(t => t.name === team);
                        if (!biddingTeam || biddingTeam.budget < amount) return;

                        if (amount > (auctionState.currentBid || auctionState.currentPlayer.basePrice - 1)) {
                            auctionState.currentBid = amount;
                            auctionState.highestBidder = team;
                            auctionState.highestBidderId = biddingTeam.id;
                            
                            await db.query('INSERT INTO Bids (Auction_ID, Player_ID, Team_ID, Bid_Amount) VALUES (?, ?, ?, ?)', [1, auctionState.currentPlayer.id, biddingTeam.id, amount]);
                            
                            startTimer();
                            broadcast({ type: 'BID_LOG', log: { team, amount: `₹${amount.toLocaleString()}` } });
                        }
                    }
                    break;
            }
        } catch (error) {
            console.error('Failed to process message:', error);
        }
    });

    ws.on('close', () => {
        const clientInfo = clients.get(clientId);
        console.log(`Client ${clientInfo?.role || 'unknown'} disconnected`);
        clients.delete(clientId);
        broadcastConnectedTeams();
    });
});

// --- START THE SERVER ---
const PORT = process.env.PORT || 5000;
server.listen(PORT, async () => {
    await initializeAuctionData();
    console.log(`Server running on port ${PORT}`);
    console.log(`WebSocket server started on port ${PORT}`);
});

