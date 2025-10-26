import React, { useState, useEffect, useMemo } from 'react';
import { fetchPlayers, addPlayer, fetchTeams, postTeamPlayer } from '../services/api';
import CustomTable from '../components/ui/CustomTable';
import InfoCards from '../components/ui/InfoCards';
import PageTitle from '../components/ui/PageTitle';

const PlayersPage = () => {
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  // subtle parallax value for hero accent (must be before conditional returns)
  const [parallaxY, setParallaxY] = useState(0)

  useEffect(() => {
    const getPlayers = async () => {
      try {
        const response = await fetchPlayers();
        setPlayers(response.data);
      } catch (err) {
        setError('Failed to fetch players.');
      } finally {
        setLoading(false);
      }
    };
    getPlayers();
  }, []);

  useEffect(() => {
    const onScroll = () => setParallaxY(window.scrollY * 0.08)
    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll()
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const columns = useMemo(() => [
    { Header: 'Name', accessor: 'Name' },
    { Header: 'Role', accessor: 'Role' },
    { Header: 'Country', accessor: 'Country' },
    { Header: 'Base Price', accessor: 'Base_Price' },
    { Header: 'Status', accessor: 'Status' },
  ], []);
  
  const formattedPlayers = players.map(player => ({
    ...player,
    Base_Price: `₹ ${(player.Base_Price / 100000).toFixed(2)} L`
  }));

  // Add player form state
  const [showAddForm, setShowAddForm] = useState(false);
  const [newPlayer, setNewPlayer] = useState({ Name: '', Role: '', Base_Price: '', Country: '' });
  const [adding, setAdding] = useState(false);
  const [addError, setAddError] = useState(null);
  const [teamsList, setTeamsList] = useState([]);

  // Sell form state
  const [sellForm, setSellForm] = useState({ Player_ID: '', Team_ID: '', Price: '' });
  const [selling, setSelling] = useState(false);
  const [sellError, setSellError] = useState(null);

  useEffect(() => {
    const getTeams = async () => {
      try {
        const res = await fetchTeams();
        setTeamsList(res.data);
      } catch (err) {
        console.error('Could not fetch teams for sell form', err);
      }
    };
    getTeams();
  }, []);

  const handleSellChange = (field) => (e) => setSellForm(prev => ({ ...prev, [field]: e.target.value }));

  const submitSellPlayer = async (e) => {
    e.preventDefault();
    setSellError(null);
    if (!sellForm.Player_ID || !sellForm.Team_ID || !sellForm.Price) {
      setSellError('Please select player, team and price');
      return;
    }
    setSelling(true);
    try {
      const payload = {
        Team_ID: Number(sellForm.Team_ID),
        Player_ID: Number(sellForm.Player_ID),
        Price: Number(sellForm.Price),
        Auction_ID: 1
      };
      await postTeamPlayer(payload);
      // refresh players list
      const resp = await fetchPlayers();
      setPlayers(resp.data);
      setSellForm({ Player_ID: '', Team_ID: '', Price: '' });
    } catch (err) {
      console.error('Sell player failed', err);
      setSellError(err.response?.data?.message || 'Failed to record sale');
    } finally {
      setSelling(false);
    }
  };

  const handleAddChange = (field) => (e) => setNewPlayer(prev => ({ ...prev, [field]: e.target.value }));

  const submitAddPlayer = async (e) => {
    e.preventDefault();
    setAddError(null);
    if (!newPlayer.Name || !newPlayer.Role || !newPlayer.Base_Price || !newPlayer.Country) {
      setAddError('Please fill all fields');
      return;
    }
    setAdding(true);
    try {
      const payload = {
        Name: newPlayer.Name,
        Role: newPlayer.Role,
        Base_Price: Number(newPlayer.Base_Price),
        Country: newPlayer.Country
      };
      await addPlayer(payload);
      // refresh list
      const resp = await fetchPlayers();
      setPlayers(resp.data);
      setShowAddForm(false);
      setNewPlayer({ Name: '', Role: '', Base_Price: '', Country: '' });
    } catch (err) {
      console.error('Add player failed', err);
      setAddError(err.response?.data?.message || 'Failed to add player');
    } finally {
      setAdding(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-cyan-400 border-t-transparent mx-auto mb-3"></div>
        <p className="text-lg text-gray-300">Loading players...</p>
      </div>
    </div>
  );

  if (error) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="bg-red-600/10 border border-red-600/20 rounded-xl p-6 text-center">
        <div className="text-red-400 font-semibold mb-2">{error}</div>
        <button onClick={() => window.location.reload()} className="btn btn-secondary">Retry</button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen py-8">
      <div className="container">
        <header className="mb-8 text-center">
          <h1 className="text-4xl font-bold mb-3">Players Database</h1>
          <p className="text-gray-400">Browse all players, base prices, and auction status</p>
        </header>

        <div className="mb-8">
          <InfoCards items={[
            { label: 'Total Players', value: players.length },
            { label: 'Sold', value: players.filter(p => p.Status === 'Sold').length },
            { label: 'Unsold', value: players.filter(p => p.Status !== 'Sold').length },
          ]} />
        </div>

        <div className="mb-6 flex items-center justify-end gap-3">
          <button onClick={() => setShowAddForm(s => !s)} className="btn-accent">{showAddForm ? 'Close' : 'Add Player'}</button>
        </div>

        {showAddForm && (
          <div className="bg-black/20 backdrop-blur-sm border border-gray-600/30 rounded-2xl p-6 mb-6">
            <h3 className="text-lg font-bold mb-3">Add New Player</h3>
            <form onSubmit={submitAddPlayer} className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <input value={newPlayer.Name} onChange={handleAddChange('Name')} placeholder="Player name" className="bg-gray-800 border border-gray-600 rounded-lg px-4 py-2 text-white" />
              <input value={newPlayer.Role} onChange={handleAddChange('Role')} placeholder="Role (e.g. Batsman)" className="bg-gray-800 border border-gray-600 rounded-lg px-4 py-2 text-white" />
              <input value={newPlayer.Base_Price} onChange={handleAddChange('Base_Price')} placeholder="Base price (number)" type="number" className="bg-gray-800 border border-gray-600 rounded-lg px-4 py-2 text-white" />
              <input value={newPlayer.Country} onChange={handleAddChange('Country')} placeholder="Country" className="bg-gray-800 border border-gray-600 rounded-lg px-4 py-2 text-white" />

              <div className="md:col-span-4 flex items-center gap-3 mt-2">
                <button type="submit" disabled={adding} className={`btn-accent ${adding ? 'opacity-60 cursor-not-allowed' : ''}`}>Save</button>
                <button type="button" onClick={() => { setShowAddForm(false); setNewPlayer({ Name: '', Role: '', Base_Price: '', Country: '' }); }} className="btn-outline">Cancel</button>
                {addError && <div className="text-red-400 ml-3">{addError}</div>}
              </div>
            </form>
          </div>
        )}

        <div className="bg-black/20 backdrop-blur-sm border border-gray-600/30 rounded-2xl p-6 mb-6">
          <h3 className="text-lg font-bold mb-3">Record Sale / Assign Player</h3>
          <form onSubmit={submitSellPlayer} className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <select value={sellForm.Player_ID} onChange={handleSellChange('Player_ID')} className="bg-gray-800 border border-gray-600 rounded-lg px-4 py-2 text-white">
              <option value="">Select player</option>
              {players.map(p => (
                <option key={p.Player_ID} value={p.Player_ID}>{p.Name} ({p.Role})</option>
              ))}
            </select>
            <select value={sellForm.Team_ID} onChange={handleSellChange('Team_ID')} className="bg-gray-800 border border-gray-600 rounded-lg px-4 py-2 text-white">
              <option value="">Select team</option>
              {teamsList.map(t => (
                <option key={t.Team_ID} value={t.Team_ID}>{t.Team_Name}</option>
              ))}
            </select>
            <input value={sellForm.Price} onChange={handleSellChange('Price')} placeholder="Sale price" type="number" className="bg-gray-800 border border-gray-600 rounded-lg px-4 py-2 text-white" />
            <div className="md:col-span-4 flex items-center gap-3 mt-2">
              <button type="submit" disabled={selling} className={`btn-accent ${selling ? 'opacity-60 cursor-not-allowed' : ''}`}>Record Sale</button>
              <button type="button" onClick={() => setSellForm({ Player_ID: '', Team_ID: '', Price: '' })} className="btn-outline">Clear</button>
              {sellError && <div className="text-red-400 ml-3">{sellError}</div>}
            </div>
          </form>
        </div>

        <div className="card">
          <CustomTable columns={columns} data={formattedPlayers} />
        </div>

        <FranchiseTeams />
      </div>
    </div>
  );
};

const teams = [
  { name: 'Mumbai Kings', players: 18, budget: '₹12.5 Cr' },
  { name: 'Delhi Titans', players: 16, budget: '₹8.2 Cr' },
  { name: 'Rajasthan Royals', players: 20, budget: '₹5.4 Cr' },
  { name: 'Chennai Warriors', players: 17, budget: '₹10.1 Cr' }
]

const avatarLetters = (name) => name.split(' ').map(w => w[0]).slice(0,2).join('')

const FranchiseTeams = () => {
  return (
    <section id="teams" className="container" style={{marginTop: '40px'}}>
      <h2 className="section-title">Franchise Teams</h2>
      <p className="section-subtitle">Overview of squads and remaining budgets.</p>
      <div className="grid grid-4">
        {teams.map((t) => (
          <div className="card team-card" key={t.name}>
            <div className="team-head">
              <div className="team-logo">{avatarLetters(t.name)}</div>
              <div>
                <div style={{fontWeight:700}}>{t.name}</div>
                <div className="team-meta">
                  <span>{t.players} players</span>
                  <span>Budget: {t.budget}</span>
                </div>
              </div>
            </div>
            <div style={{display:'flex',gap:12,marginTop:6}}>
              <button className="btn btn-primary" style={{padding:'10px 14px'}}>View Squad</button>
              <button className="btn btn-secondary" style={{padding:'10px 14px'}}>Manage</button>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}




export default PlayersPage;