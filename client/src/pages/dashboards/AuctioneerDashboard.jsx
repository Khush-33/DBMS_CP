import React from 'react';
import { ActionButton } from '../../components/ui/PrimaryButton';

const AuctioneerDashboard = () => {
  return (
    <div className="container">
      <div className="relative overflow-hidden card-elevated p-6 rounded-xl mb-8">
        <h2 className="text-3xl font-extrabold gradient-text">Auctioneer Console</h2>
        <p className="text-gray-300 mt-2">Start/advance auctions and manage entities.</p>
      </div>
      <div className="grid" style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:16}}>
        <div className="stat-card">
          <div className="stat-title">Controls</div>
          <div style={{display:'flex', gap: 8, marginTop: 10}}>
            <ActionButton to="/live-auction">Open Live Auction</ActionButton>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-title">Management</div>
          <div className="stat-sub">Use existing pages to add/update/remove players and teams.</div>
        </div>
      </div>
    </div>
  );
};

export default AuctioneerDashboard;

