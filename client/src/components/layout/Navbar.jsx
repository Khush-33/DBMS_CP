import React, { useState } from 'react'
import { NavLink, Link } from 'react-router-dom'
import { useAuth } from '../../state/AuthContext'

const Navbar = () => {
  const [open, setOpen] = useState(false)
  const { user, logout } = useAuth()

  return (
    <header className="app-navbar">
      <div className="container py-4">
        <div className="flex items-center justify-between">
          <Link to="/" className="brand">
            <div className="gradient-border">
              <span style={{ color: 'white', fontSize: '20px', fontWeight: 'bold' }}>🏏</span>
            </div>
            <span className="gradient-text">IPL Auction</span>
          </Link>

          <button 
            aria-label="Toggle menu" 
            onClick={() => setOpen(v => !v)} 
            className="mobile-menu-button"
          >
            ☰
          </button>

          <nav className={`nav-links ${open ? 'open' : ''}`}>
            <NavLink to="/teams" className="nav-link">Teams</NavLink>
            <NavLink to="/players" className="nav-link">Players</NavLink>
            <NavLink to="/auctions" className="nav-link">Auctions</NavLink>
            <NavLink to="/bids" className="nav-link">Bids</NavLink>
            <NavLink to="/player-stats" className="nav-link">Stats</NavLink>
            <NavLink to="/sponsors" className="nav-link">Sponsors</NavLink>
            <NavLink to="/team-players" className="nav-link">Squads</NavLink>
            <NavLink to="/live-auction" className="nav-link">
              <span style={{ color: '#ef4444' }}>●</span> Live
            </NavLink>
          </nav>

          <div className="nav-cta">
            {!user && (
              <Link to="/login" className="btn btn-primary">
                Sign In
              </Link>
            )}
            {user && (
              <div className="flex items-center gap-3">
                <span className="text-gray-400 text-sm">
                  {user.username} • {user.role}
                </span>
                {user.role === 'owner' || user.role === 'manager' ? (
                  <Link to="/dashboard/owner" className="btn btn-secondary">Dashboard</Link>
                ) : user.role === 'auctioneer' ? (
                  <Link to="/dashboard/auctioneer" className="btn btn-secondary">Console</Link>
                ) : (
                  <Link to="/dashboard/user" className="btn btn-secondary">Dashboard</Link>
                )}
                <button onClick={logout} className="btn btn-outline">Logout</button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}

export default Navbar


