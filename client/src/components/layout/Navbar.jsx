import React from 'react';
import { NavLink } from 'react-router-dom';

const Navbar = () => {
  // Base style for all links
  const linkStyle = "px-3 py-2 rounded-md text-sm font-medium text-gray-300 hover:text-white hover:bg-white/10 transition-colors duration-200";
  // Style for the currently active link
  const activeLinkStyle = "bg-amber-500 text-white";

  return (
    <nav className="bg-gray-900/70 backdrop-blur-lg shadow-md sticky top-0 z-50 border-b border-white/10">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex-shrink-0 text-white font-bold text-xl tracking-wider">
            <NavLink to="/">IPL AUCTION</NavLink>
          </div>
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-4">
              <NavLink to="/teams" className={({ isActive }) => isActive ? `${linkStyle} ${activeLinkStyle}` : linkStyle}>Teams</NavLink>
              <NavLink to="/players" className={({ isActive }) => isActive ? `${linkStyle} ${activeLinkStyle}` : linkStyle}>Players</NavLink>
              <NavLink to="/auctions" className={({ isActive }) => isActive ? `${linkStyle} ${activeLinkStyle}` : linkStyle}>Auctions</NavLink>
              <NavLink to="/bids" className={({ isActive }) => isActive ? `${linkStyle} ${activeLinkStyle}` : linkStyle}>Bids</NavLink>
              <NavLink to="/player-stats" className={({ isActive }) => isActive ? `${linkStyle} ${activeLinkStyle}` : linkStyle}>Stats</NavLink>
              <NavLink to="/sponsors" className={({ isActive }) => isActive ? `${linkStyle} ${activeLinkStyle}` : linkStyle}>Sponsors</NavLink>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;