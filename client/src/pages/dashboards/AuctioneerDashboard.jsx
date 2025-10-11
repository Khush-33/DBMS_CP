import React from 'react';
import { ActionButton } from '../../components/ui/PrimaryButton';

const AuctioneerDashboard = () => {
  return (
    <div className="min-h-screen py-8">
      <div className="container">
        <header className="mb-8">
          <h1 className="text-4xl font-bold mb-3">Auctioneer Console</h1>
          <p className="text-gray-400">Manage auctions, players, and teams</p>
        </header>

        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <div className="card">
            <h2 className="text-2xl font-bold mb-4">Auction Controls</h2>
            <div className="flex gap-3">
              <ActionButton to="/live-auction">🔴 Start Auction</ActionButton>
              <ActionButton to="/auctions">View History</ActionButton>
            </div>
          </div>

          <div className="card">
            <h2 className="text-2xl font-bold mb-4">Quick Stats</h2>
            <div className="space-y-2">
              <div className="flex justify-between py-2 border-b border-gray-800">
                <span className="text-gray-400">Total Bids</span>
                <span className="font-semibold">—</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-gray-400">Active Teams</span>
                <span className="font-semibold">—</span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <div className="card text-center">
            <div className="text-4xl mb-3">👥</div>
            <h3 className="text-lg font-semibold mb-2">Manage Players</h3>
            <p className="text-gray-400 text-sm mb-4">Add, edit, or remove players</p>
            <ActionButton to="/players" size="small">Players</ActionButton>
          </div>

          <div className="card text-center">
            <div className="text-4xl mb-3">🏆</div>
            <h3 className="text-lg font-semibold mb-2">Manage Teams</h3>
            <p className="text-gray-400 text-sm mb-4">Oversee team rosters</p>
            <ActionButton to="/teams" size="small">Teams</ActionButton>
          </div>

          <div className="card text-center">
            <div className="text-4xl mb-3">📊</div>
            <h3 className="text-lg font-semibold mb-2">View Reports</h3>
            <p className="text-gray-400 text-sm mb-4">Auction analytics</p>
            <ActionButton to="/bids" size="small">Bids</ActionButton>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuctioneerDashboard;

