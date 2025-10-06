import React from 'react';

const UserDashboard = () => {
  return (
    <div className="container">
      <div className="relative overflow-hidden card-elevated p-6 rounded-xl mb-8">
        <h2 className="text-3xl font-extrabold gradient-text">Fan Dashboard</h2>
        <p className="text-gray-300 mt-2">Explore teams, players, venues, and live auction updates.</p>
      </div>
      <div className="stat-card">
        <div className="stat-title">What you can do</div>
        <div className="stat-sub">Browse all site sections. Auction actions are disabled for this role.</div>
      </div>
    </div>
  );
};

export default UserDashboard;

