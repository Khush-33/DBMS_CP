import React from 'react';
import { Link } from 'react-router-dom';

const UserDashboard = () => {
  return (
    <div className="min-h-screen py-8">
      <div className="container">
        <header className="mb-8">
          <h1 className="text-4xl font-bold mb-3">Fan Dashboard</h1>
          <p className="text-gray-400">Explore teams, players, and live auction updates</p>
        </header>

        <div className="card mb-8">
          <h2 className="text-2xl font-bold mb-4">Welcome, Fan!</h2>
          <p className="text-gray-400">
            Browse all available sections and follow the latest auction updates. View-only access for this role.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <Link to="/teams" className="card text-center group">
            <div className="text-4xl mb-3">🏆</div>
            <h3 className="text-lg font-semibold mb-2">Teams</h3>
            <p className="text-gray-400 text-sm">View all franchises</p>
          </Link>

          <Link to="/players" className="card text-center group">
            <div className="text-4xl mb-3">👥</div>
            <h3 className="text-lg font-semibold mb-2">Players</h3>
            <p className="text-gray-400 text-sm">Browse player database</p>
          </Link>

          <Link to="/live-auction" className="card text-center group">
            <div className="text-4xl mb-3">⚡</div>
            <h3 className="text-lg font-semibold mb-2">Live Auction</h3>
            <p className="text-gray-400 text-sm">Watch auction live</p>
          </Link>

          <Link to="/player-stats" className="card text-center group">
            <div className="text-4xl mb-3">📊</div>
            <h3 className="text-lg font-semibold mb-2">Statistics</h3>
            <p className="text-gray-400 text-sm">Player performance</p>
          </Link>

          <Link to="/venues" className="card text-center group">
            <div className="text-4xl mb-3">🏟️</div>
            <h3 className="text-lg font-semibold mb-2">Venues</h3>
            <p className="text-gray-400 text-sm">Stadium information</p>
          </Link>

          <Link to="/sponsors" className="card text-center group">
            <div className="text-4xl mb-3">🤝</div>
            <h3 className="text-lg font-semibold mb-2">Sponsors</h3>
            <p className="text-gray-400 text-sm">View sponsors</p>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;

