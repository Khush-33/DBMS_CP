import React from 'react';
import Navbar from './Navbar';
import Footer from './Footer';

const QuickDock = () => (
  <div className="fixed right-4 bottom-4 z-50">
    <div className="card-elevated rounded-xl p-2 bg-gray-900/70 backdrop-blur-lg flex flex-col gap-2">
      <a href="/live-auction" className="btn-accent" style={{display:'inline-flex', alignItems:'center', gap:6}}>
        <span>🔴</span> <span>Live</span>
      </a>
      <a href="/players" className="btn-outline" style={{display:'inline-flex', alignItems:'center', gap:6}}>
        <span>⭐</span> <span>Players</span>
      </a>
      <a href="/teams" className="btn-outline" style={{display:'inline-flex', alignItems:'center', gap:6}}>
        <span>🏏</span> <span>Teams</span>
      </a>
    </div>
  </div>
)

const StatsRibbon = () => (
  <div className="w-full" style={{position:'sticky', top:0, zIndex:30}}>
    <div className="container" style={{padding: '8px 16px'}}>
      <div className="glass rounded-lg p-2 gradient-border animate-fade-in-up" style={{display:'flex', alignItems:'center', justifyContent:'space-between'}}>
        <div className="text-sm text-gray-300"><span className="accent-cyan">Live</span> Auction • Next lot starts soon</div>
        <div className="text-sm text-gray-300" style={{display:'flex', gap:12}}>
          <span>Teams: <strong>10</strong></span>
          <span>Players: <strong>250+</strong></span>
          <span>Sold: <strong>87</strong></span>
        </div>
      </div>
    </div>
  </div>
)

const Layout = ({ children }) => {
  return (
    // Assumes you've added 'font-poppins' to your tailwind.config.js or are using a global CSS import
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <StatsRibbon />
      <main className="container mx-auto px-4 py-8 flex-grow">
        {children}
      </main>
      <Footer />
      <QuickDock />
    </div>
  );
};

export default Layout;