import React from 'react';
import { BidButton } from '../../components/ui/PrimaryButton';

const OwnerDashboard = () => {
  return (
    <div className="container">
      <div className="relative overflow-hidden card-elevated p-6 rounded-xl mb-8">
        <h2 className="text-3xl font-extrabold gradient-text">Owner & Manager</h2>
        <p className="text-gray-300 mt-2">Bid on players and manage your squad.</p>
      </div>
      <div className="grid" style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:16}}>
        <div className="stat-card">
          <div className="stat-title">Quick Actions</div>
          <div style={{display:'flex', gap: 8, marginTop: 10}}>
            <BidButton to="/live-auction">Open Live Auction</BidButton>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-title">Squad Summary</div>
          <div className="stat-sub">View your current players and budgets in Teams/Squads</div>
        </div>
      </div>
    </div>
  );
};

export default OwnerDashboard;

