import React, { useState, useEffect, useMemo } from 'react';
import { fetchPlayers } from '../services/api';
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
    <div className="page-container px-4 py-8 page-bg-players">
      <div className="container mx-auto max-w-6xl">
        {/* Hero banner */}
        <div className="relative overflow-hidden card-elevated p-6 rounded-xl mb-8 animate-fade-in-scale">
          <div className="absolute -top-1/2 -left-1/4 bg-green-700/30 rounded-full filter blur-3xl animate-pulse" style={{ width: '66%', height: '66%', transform: `translateY(${parallaxY * 0.6}px)` }}></div>
          <div className="relative z-10">
            <h2 className="text-3xl font-extrabold gradient-text">Discover Players</h2>
            <p className="text-gray-300 mt-2">Filter through star players and rising talents to build your perfect squad.</p>
          </div>
        </div>
        <header className="mb-8 text-center animate-fade-in-up">
          <PageTitle>Auction Players</PageTitle>
          <p className="text-gray-400">Browse all players, their base prices and auction status</p>
        </header>

        <div className="mb-6 animate-fade-in-up">
          <InfoCards items={[
            { label: 'Total Players', value: players.length },
            { label: 'Sold Players', value: players.filter(p => p.Status === 'Sold').length },
            { label: 'Unsold Players', value: players.filter(p => p.Status !== 'Sold').length },
          ]} />
        </div>

        <section className="bg-black/30 backdrop-blur-sm border border-gray-700/30 rounded-2xl p-6 shadow-lg">
          <CustomTable columns={columns} data={formattedPlayers} />
        </section>

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