import React from 'react';
import { ActionButton } from '../../components/ui/PrimaryButton';

const OwnerDashboard = () => {
  return (
    <div className="min-h-screen py-8">
      <div className="container">
        <header className="mb-8">
          <h1 className="text-4xl font-bold mb-3">Owner Dashboard</h1>
          <p className="text-gray-400">Manage your team, bid on players, and track your squad</p>
        </header>

        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <div className="card">
            <h2 className="text-2xl font-bold mb-4">Quick Actions</h2>
            <div className="flex gap-3">
              <ActionButton to="/live-auction">🔴 Live Auction</ActionButton>
              <ActionButton to="/team-players">View Squad</ActionButton>
            </div>
          </div>

          <div className="card">
            <h2 className="text-2xl font-bold mb-4">Team Overview</h2>
            <p className="text-gray-400">
              Access your team details, budget information, and player roster from the Teams and Squads sections.
            </p>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <div className="card text-center">
            <div className="text-4xl mb-3">👥</div>
            <h3 className="text-lg font-semibold mb-2">Players</h3>
            <p className="text-gray-400 text-sm mb-4">Browse available players</p>
            <ActionButton to="/players" size="small">View Players</ActionButton>
          </div>

          <div className="card text-center">
            <div className="text-4xl mb-3">💰</div>
            <h3 className="text-lg font-semibold mb-2">Budget</h3>
            <p className="text-gray-400 text-sm mb-4">Track team spending</p>
            <ActionButton to="/teams" size="small">View Budget</ActionButton>
          </div>

          <div className="card text-center">
            <div className="text-4xl mb-3">📊</div>
            <h3 className="text-lg font-semibold mb-2">Statistics</h3>
            <p className="text-gray-400 text-sm mb-4">Player performance data</p>
            <ActionButton to="/player-stats" size="small">View Stats</ActionButton>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OwnerDashboard;

