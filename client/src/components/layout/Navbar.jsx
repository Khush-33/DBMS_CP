import React from 'react'
import { NavLink, Link } from 'react-router-dom'
import { useAuth } from '../../state/AuthContext'

const Navbar = () => {
  const { user, logout } = useAuth()

  return (
    <header className="bg-gray-900 text-white shadow-md w-full">
      <div className="container mx-auto px-6 py-3">
        <div className="flex items-center justify-between whitespace-nowrap overflow-x-auto scrollbar-hide">
          
          {/* === Left: Logo === */}
          <Link
            to="/"
            className="flex items-center gap-2 font-bold text-lg flex-shrink-0"
          >
            <span role="img" aria-label="logo" style={{ fontSize: '24px' }}>🏏</span>
            <span className="text-orange-500">IPL</span>
            <span className="text-orange-400">Auction</span>
          </Link>

          {/* === Middle: Navigation Tabs === */}
          <nav className="flex items-center justify-center gap-6 text-sm font-medium flex-wrap md:flex-nowrap">
            {[
              { to: '/teams', label: 'Teams' },
              { to: '/players', label: 'Players' },
              { to: '/auctions', label: 'Auctions' },
              { to: '/bids', label: 'Bids' },
              { to: '/player-stats', label: 'Stats' },
              { to: '/sponsors', label: 'Sponsors' },
              { to: '/venues', label: 'Venues' },
              { to: '/team-players', label: 'Squads' },
              { to: '/reports', label: 'Reports' },
              { to: '/live-auction', label: (<><span style={{ color: '#ef4444' }}>●</span> Live</>) },
            ].map((item, index) => (
              <NavLink
                key={index}
                to={item.to}
                className={({ isActive }) =>
                  `hover:text-orange-400 ${
                    isActive ? 'text-orange-400 font-semibold' : 'text-gray-300'
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          {/* === Right: User Info & Actions === */}
          <div className="flex items-center gap-3 flex-shrink-0">
            {!user ? (
              <Link
                to="/login"
                className="bg-orange-600 hover:bg-orange-700 text-white px-3 py-1 rounded-md text-sm"
              >
                Sign In
              </Link>
            ) : (
              <div className="flex items-center gap-2">
                <span className="text-gray-400 text-sm whitespace-nowrap">
                  {user.username} ({user.role.charAt(0).toUpperCase() + user.role.slice(1)})
                </span>

                {user.role === 'owner' || user.role === 'manager' ? (
                  <Link
                    to="/dashboard/owner"
                    className="text-orange-400 hover:text-orange-500 font-semibold"
                  >
                    Dashboard
                  </Link>
                ) : user.role === 'auctioneer' ? (
                  <Link
                    to="/dashboard/auctioneer"
                    className="text-orange-400 hover:text-orange-500 font-semibold"
                  >
                    Console
                  </Link>
                ) : (
                  <Link
                    to="/dashboard/user"
                    className="text-orange-400 hover:text-orange-500 font-semibold"
                  >
                    Dashboard
                  </Link>
                )}

                {/* Compact, clean Logout button */}
                <button
                  onClick={logout}
                  className="bg-gray-700 hover:bg-gray-600 text-white text-sm px-2.5 py-1 rounded-md border border-gray-600 transition-all"
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}

export default Navbar
