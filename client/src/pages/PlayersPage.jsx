import React, { useState, useEffect, useMemo } from 'react';
import { fetchPlayers, addPlayer, fetchTeams, postTeamPlayer, searchPlayers } from '../services/api';
import EnhancedTable from '../components/ui/EnhancedTable';
import TableSkeleton from '../components/ui/TableSkeleton';
import { toast } from 'react-hot-toast';
import InfoCards from '../components/ui/InfoCards';
import PageTitle from '../components/ui/PageTitle';
import Badge from '../components/ui/Badge';
import FilterChip from '../components/ui/FilterChip';

const PlayersPage = () => {
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searching, setSearching] = useState(false);
  const [roleFilter, setRoleFilter] = useState('All Roles');
  const [countryFilter, setCountryFilter] = useState('All Countries');
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
    { 
      header: 'Name', 
      accessorKey: 'Name',
      cell: (info) => <span className="font-medium">{info.getValue()}</span>
    },
    { header: 'Role', accessorKey: 'Role' },
    { header: 'Country', accessorKey: 'Country' },
    { header: 'Base Price', accessorKey: 'Base_Price' },
    { 
      header: 'Status', 
      accessorKey: 'Status',
      cell: (info) => (
        <Badge 
          variant={
            info.getValue() === 'Sold' ? 'error' : 
            info.getValue() === 'Available' ? 'success' : 
            'default'
          }
          size="sm"
        >
          {info.getValue()}
        </Badge>
      )
    },
  ], []);

  const roles = Array.from(new Set(players.map(p => p.Role))).filter(Boolean).sort();
  const countries = Array.from(new Set(players.map(p => p.Country))).filter(Boolean).sort();

  // Role options for add form (merge known roles with defaults)
  const roleOptionsDefault = ['Batsman','Bowler','All-Rounder','Wicket-Keeper'];
  const roleOptions = Array.from(new Set([...roleOptionsDefault, ...roles]));

  const filteredPlayers = players.filter(p => {
    const roleOk = roleFilter === 'All Roles' || p.Role === roleFilter;
    const countryOk = countryFilter === 'All Countries' || p.Country === countryFilter;
    return roleOk && countryOk;
  });

  const activeFilters = [];
  if (roleFilter !== 'All Roles') activeFilters.push({ type: 'role', label: `Role: ${roleFilter}` });
  if (countryFilter !== 'All Countries') activeFilters.push({ type: 'country', label: `Country: ${countryFilter}` });

  const clearAllFilters = () => {
    setRoleFilter('All Roles');
    setCountryFilter('All Countries');
  };

  const removeFilter = (type) => {
    if (type === 'role') setRoleFilter('All Roles');
    if (type === 'country') setCountryFilter('All Countries');
  };

  const formattedPlayers = filteredPlayers.map(player => ({
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
      toast.success('Player sold');
    } catch (err) {
      console.error('Sell player failed', err);
      const msg = err.response?.data?.message || 'Failed to record sale';
      setSellError(msg);
      toast.error(msg);
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
      toast.success('Player added');
    } catch (err) {
      console.error('Add player failed', err);
      const msg = err.response?.data?.message || 'Failed to add player';
      setAddError(msg);
      toast.error(msg);
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

        <div className="mb-6 space-y-4">
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex-1 min-w-[240px]">
              <label htmlFor="player-search" className="sr-only">Search players</label>
              <input
                id="player-search"
                type="text"
                value={searchQuery}
                onChange={async (e) => {
                  const query = e.target.value;
                  setSearchQuery(query);
                  setSearching(true);
                  try {
                    if (query.trim()) {
                      const response = await searchPlayers(query);
                      setPlayers(response.data);
                    } else {
                      const response = await fetchPlayers();
                      setPlayers(response.data);
                    }
                  } catch (err) {
                    setError('Search failed');
                  } finally {
                    setSearching(false);
                  }
                }}
                placeholder="Search by name, role, or country..."
                className="w-full bg-gray-800 border border-gray-600 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                aria-label="Search players by name, role, or country"
              />
            </div>
            <label htmlFor="role-filter" className="sr-only">Filter by role</label>
            <select 
              id="role-filter"
              value={roleFilter} 
              onChange={(e)=>setRoleFilter(e.target.value)} 
              className="bg-gray-800 border border-gray-600 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-orange-500"
              aria-label="Filter players by role"
            >
              <option>All Roles</option>
              {roles.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
            <label htmlFor="country-filter" className="sr-only">Filter by country</label>
            <select 
              id="country-filter"
              value={countryFilter} 
              onChange={(e)=>setCountryFilter(e.target.value)} 
              className="bg-gray-800 border border-gray-600 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-orange-500"
              aria-label="Filter players by country"
            >
              <option>All Countries</option>
              {countries.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <button 
              onClick={() => setShowAddForm(s => !s)} 
              className={showAddForm ? "btn btn-close" : "btn btn-add"}
            >
              {showAddForm ? 'Close' : 'Add Player'}
            </button>
          </div>
          {activeFilters.length > 0 && (
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm text-gray-400">Active filters:</span>
              {activeFilters.map((filter) => (
                <FilterChip
                  key={filter.type}
                  label={filter.label}
                  onRemove={() => removeFilter(filter.type)}
                />
              ))}
              <button
                onClick={clearAllFilters}
                className="text-sm text-orange-400 hover:text-orange-300 underline"
              >
                Clear all
              </button>
            </div>
          )}
        </div>

        {showAddForm && (
          <div className="bg-black/20 backdrop-blur-sm border border-gray-600/30 rounded-2xl p-6 mb-6">
            <h3 className="text-lg font-bold mb-3">Add New Player</h3>
            <form onSubmit={submitAddPlayer} className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <input value={newPlayer.Name} onChange={handleAddChange('Name')} placeholder="Player name" className="bg-gray-800 border border-gray-600 rounded-lg px-4 py-2 text-white" />
              <select value={newPlayer.Role} onChange={handleAddChange('Role')} className="bg-gray-800 border border-gray-600 rounded-lg px-4 py-2 text-white">
                <option value="">Select role</option>
                {roleOptions.map(r => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
              <input value={newPlayer.Base_Price} onChange={handleAddChange('Base_Price')} placeholder="Base price (number)" type="number" className="bg-gray-800 border border-gray-600 rounded-lg px-4 py-2 text-white" />
              <input value={newPlayer.Country} onChange={handleAddChange('Country')} placeholder="Country" className="bg-gray-800 border border-gray-600 rounded-lg px-4 py-2 text-white" />

              <div className="md:col-span-4 flex items-center gap-3 mt-2">
                <button type="submit" disabled={adding} className={`btn btn-save ${adding ? 'opacity-60 cursor-not-allowed' : ''}`}>Save</button>
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
              <button type="submit" disabled={selling} className={`btn btn-save ${selling ? 'opacity-60 cursor-not-allowed' : ''}`}>Record Sale</button>
              <button type="button" onClick={() => setSellForm({ Player_ID: '', Team_ID: '', Price: '' })} className="btn-outline">Clear</button>
              {sellError && <div className="text-red-400 ml-3">{sellError}</div>}
            </div>
          </form>
        </div>

        <div className="card">
          {loading ? (
            <TableSkeleton rows={10} columns={5} />
          ) : (
            <EnhancedTable columns={columns} data={formattedPlayers} />
          )}
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