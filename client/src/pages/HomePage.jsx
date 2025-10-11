import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ActionButton, OutlineButton } from '../components/ui/PrimaryButton';
import InfoCards from '../components/ui/InfoCards';
import Icon from '../components/ui/Icon';
import { fetchTeams, fetchPlayers, fetchAuctions, fetchBids } from '../services/api';

// Small section wrapper to keep a consistent, minimal card look
const SectionBox = ({ children, className = '' }) => (
  <div className={`stat-card glass ${className}`}>{children}</div>
);

// Clean, minimal Sports Card used for navigation
const SportsCard = ({ title, subtitle, image, stats, link, category }) => (
  <Link to={link} className="group block">
    <article className="stat-card overflow-hidden transition-all duration-200 hover:translate-y-0.5">
      <div className="p-4 flex items-center gap-4">
        <div className="w-12 h-12 rounded-lg bg-gray-800/40 flex items-center justify-center text-xl">{image}</div>
        <div className="flex-1">
          <h3 className="font-semibold text-lg text-white mb-1">{title}</h3>
          <div className="text-sm text-gray-400">{subtitle}</div>
        </div>
        {stats && (
          <div className="text-right text-sm text-gray-300">
            {stats[0] ? <div className="font-bold">{stats[0].value}</div> : null}
            {stats[1] ? <div className="text-xs text-gray-400">{stats[1].label}</div> : null}
          </div>
        )}
      </div>
    </article>
  </Link>
);

// News Article Component — simplified layout
const NewsCard = ({ title, excerpt, category, time, image }) => (
  <article className="group cursor-pointer">
    <div className="flex space-x-4">
      <div className="flex-shrink-0">
        <div className="w-16 h-16 bg-gray-800/30 rounded-lg flex items-center justify-center text-lg">{image}</div>
      </div>
      <div className="flex-1">
        <div className="flex items-center space-x-2 mb-1">
          <span className="text-gray-400 text-xs uppercase">{category}</span>
          <span className="text-gray-500 text-xs">{time}</span>
        </div>
        <h3 className="font-semibold text-gray-100 group-hover:text-orange-400 transition-colors line-clamp-2">{title}</h3>
        <p className="text-gray-400 text-sm mt-1 line-clamp-2">{excerpt}</p>
      </div>
    </div>
  </article>
);

const HomePage = () => {
  const [stats, setStats] = useState({ teams: null, players: null, auctions: null, bids: null });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    setLoading(true);

    Promise.all([fetchTeams(), fetchPlayers(), fetchAuctions(), fetchBids()])
      .then(([teamsRes, playersRes, auctionsRes, bidsRes]) => {
        if (!mounted) return;
        setStats({
          teams: Array.isArray(teamsRes.data) ? teamsRes.data.length : (teamsRes.data.count || null),
          players: Array.isArray(playersRes.data) ? playersRes.data.length : (playersRes.data.count || null),
          auctions: Array.isArray(auctionsRes.data) ? auctionsRes.data.length : (auctionsRes.data.count || null),
          bids: Array.isArray(bidsRes.data) ? bidsRes.data.length : (bidsRes.data.count || null),
        });
      })
      .catch((err) => {
        console.error('Failed to load home stats', err);
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => { mounted = false };
  }, []);

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="container py-16">
        <div className="text-center max-w-4xl mx-auto">
          <h1 className="text-5xl font-bold mb-6">IPL Auction Platform</h1>
          <p className="text-xl text-gray-300 mb-8">
            Professional auction management system for teams, players, and live bidding
          </p>
          <div className="flex justify-center gap-4">
            <ActionButton to="/live-auction">Start Live Auction</ActionButton>
            <OutlineButton to="/players">Browse Players</OutlineButton>
          </div>
        </div>
      </section>

      <main className="container py-8">
        {/* Stats Summary */}
        <InfoCards items={[
          { label: 'Teams Active', value: stats.teams, loading },
          { label: 'Players', value: stats.players, loading },
          { label: 'Auctions', value: stats.auctions, loading },
          { label: 'Bids', value: stats.bids, loading }
        ]} />

        {/* Quick Access Cards */}
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12 animate-fade-in-up">
          <Link to="/teams" className="card text-center group">
            <div className="text-4xl mb-3">🏆</div>
            <h3 className="text-lg font-semibold mb-2">Teams</h3>
            <p className="text-gray-400 text-sm">Manage franchises and budgets</p>
          </Link>
          
          <Link to="/players" className="card text-center group">
            <div className="text-4xl mb-3">👥</div>
            <h3 className="text-lg font-semibold mb-2">Players</h3>
            <p className="text-gray-400 text-sm">Browse player database</p>
          </Link>
          
          <Link to="/auctions" className="card text-center group">
            <div className="text-4xl mb-3">⚡</div>
            <h3 className="text-lg font-semibold mb-2">Auctions</h3>
            <p className="text-gray-400 text-sm">View auction history</p>
          </Link>
          
          <Link to="/player-stats" className="card text-center group">
            <div className="text-4xl mb-3">📊</div>
            <h3 className="text-lg font-semibold mb-2">Statistics</h3>
            <p className="text-gray-400 text-sm">Player performance data</p>
          </Link>
        </section>

        {/* Featured Section */}
        <div className="grid lg:grid-cols-3 gap-8 mb-12">
          <div className="lg:col-span-2">
            <div className="card mb-6">
              <h2 className="text-2xl font-bold mb-4">Recent Activity</h2>
              <div className="space-y-4">
                <div className="pb-4 border-b border-gray-800">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-semibold">Record-Breaking Bid</h3>
                    <span className="text-sm text-gray-400">2 hours ago</span>
                  </div>
                  <p className="text-gray-400 text-sm">
                    Star player acquired for ₹17 Crores in intense bidding war
                  </p>
                </div>
                
                <div className="pb-4 border-b border-gray-800">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-semibold">Squad Complete</h3>
                    <span className="text-sm text-gray-400">5 hours ago</span>
                  </div>
                  <p className="text-gray-400 text-sm">
                    Mumbai Indians finalize their 25-player roster
                  </p>
                </div>
                
                <div className="pb-4">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-semibold">New Auction Scheduled</h3>
                    <span className="text-sm text-gray-400">1 day ago</span>
                  </div>
                  <p className="text-gray-400 text-sm">
                    Next auction session begins February 15, 2024
                  </p>
                </div>
              </div>
            </div>
          </div>

          <aside>
            <div className="card mb-6">
              <h3 className="text-xl font-bold mb-4">Top Players</h3>
              <div className="space-y-3">
                {[
                  { name: 'Virat Kohli', team: 'RCB', price: '₹17 Cr' },
                  { name: 'MS Dhoni', team: 'CSK', price: '₹15 Cr' },
                  { name: 'Rohit Sharma', team: 'MI', price: '₹16 Cr' }
                ].map((p, i) => (
                  <div key={i} className="flex items-center justify-between py-2 border-b border-gray-800 last:border-0">
                    <div>
                      <div className="font-semibold">{p.name}</div>
                      <div className="text-sm text-gray-400">{p.team}</div>
                    </div>
                    <div className="font-bold text-primary">{p.price}</div>
                  </div>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
};

export default HomePage;