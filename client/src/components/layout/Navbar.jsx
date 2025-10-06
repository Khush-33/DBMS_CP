import React, { useState } from 'react'
import { NavLink, Link } from 'react-router-dom'
import { useAuth } from '../../state/AuthContext'

// Simple, reusable link styles. Adjust classNames to match your project's CSS or Tailwind setup.
const linkBase = 'nav-link px-3 py-2 rounded transition-colors duration-150'
const linkActive = 'text-blue-600 font-semibold'

const Navbar = () => {
  const [open, setOpen] = useState(false)
  const { user, logout } = useAuth()

  return (
    <header className="app-navbar" style={{borderBottom: '1px solid rgba(0,0,0,0.06)'}}>
      <div className="container" style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px'}}>
        <Link to="/" className="brand group" style={{display: 'flex', alignItems: 'center', gap: 10, textDecoration:'none'}}>
          <div className="gradient-border" style={{width:36, height:36, borderRadius:10, position:'relative'}} aria-hidden>
            <div style={{position:'absolute', inset:2, borderRadius:8, background:'linear-gradient(135deg, #06b6d4, #2563eb)'}} />
          </div>
          <span className="gradient-text" style={{fontWeight: 800, fontSize: 18}}>Cricket Auction</span>
        </Link>

        <button aria-label="Toggle menu" onClick={() => setOpen(v => !v)} className="mobile-menu-button">☰</button>

        <nav className={`nav-links ${open ? 'open' : ''}`} style={{display: 'flex', gap: 6, alignItems: 'center'}}>
          <NavLink to="/teams" className={({ isActive }) => isActive ? `${linkBase} ${linkActive}` : linkBase}>Teams</NavLink>
          <NavLink to="/players" className={({ isActive }) => isActive ? `${linkBase} ${linkActive}` : linkBase}>Players</NavLink>
          <NavLink to="/auctions" className={({ isActive }) => isActive ? `${linkBase} ${linkActive}` : linkBase}>Auctions</NavLink>
          <NavLink to="/bids" className={({ isActive }) => isActive ? `${linkBase} ${linkActive}` : linkBase}>Bids</NavLink>
          <NavLink to="/player-stats" className={({ isActive }) => isActive ? `${linkBase} ${linkActive}` : linkBase}>Stats</NavLink>
          <NavLink to="/sponsors" className={({ isActive }) => isActive ? `${linkBase} ${linkActive}` : linkBase}>Sponsors</NavLink>
          <NavLink to="/team-players" className={({ isActive }) => isActive ? `${linkBase} ${linkActive}` : linkBase}>Squads</NavLink>
          <NavLink to="/live-auction" className={({ isActive }) => isActive ? `${linkBase} ${linkActive}` : linkBase}>🔴 LIVE</NavLink>
        </nav>

        <div className="nav-cta" style={{marginLeft: 12, display:'flex', gap:8, alignItems:'center'}}>
          {!user && <Link to="/login" className="btn btn-secondary" style={{padding: '8px 12px', textDecoration:'none'}}>Sign in</Link>}
          {user && (
            <>
              <span className="text-gray-300" style={{fontSize:12}}>Hi, {user.username} · {user.role}{user.team ? ` · Team ${user.team}` : ''}</span>
              {user.role === 'owner' || user.role === 'manager' ? (
                <Link to="/dashboard/owner" className="btn btn-secondary" style={{padding:'8px 12px'}}>Dashboard</Link>
              ) : user.role === 'auctioneer' ? (
                <Link to="/dashboard/auctioneer" className="btn btn-secondary" style={{padding:'8px 12px'}}>Console</Link>
              ) : (
                <Link to="/dashboard/user" className="btn btn-secondary" style={{padding:'8px 12px'}}>Dashboard</Link>
              )}
              <button onClick={logout} className="btn btn-outline" style={{padding:'8px 12px'}}>Logout</button>
            </>
          )}
        </div>
      </div>
    </header>
  )
}

export default Navbar


