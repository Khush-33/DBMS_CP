import React from 'react'
import { Link } from 'react-router-dom'

const Footer = () => {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          <div>
            <h3 className="footer-section-title">IPL Auction</h3>
            <p style={{ color: 'var(--gray-400)', marginBottom: '1rem', maxWidth: '300px' }}>
              Professional cricket auction platform for teams, players, and franchise management.
            </p>
          </div>

          <div>
            <h4 className="footer-section-title">Quick Links</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <Link to="/teams">Teams</Link>
              <Link to="/players">Players</Link>
              <Link to="/auctions">Auctions</Link>
              <Link to="/player-stats">Statistics</Link>
            </div>
          </div>

          <div>
            <h4 className="footer-section-title">Features</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <Link to="/live-auction">Live Bidding</Link>
              <Link to="/team-players">Squad Management</Link>
              <Link to="/bids">Bid History</Link>
              <Link to="/sponsors">Sponsors</Link>
            </div>
          </div>

          <div>
            <h4 className="footer-section-title">Support</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <a href="#">Help Center</a>
              <a href="#">Documentation</a>
              <a href="#">Contact Us</a>
            </div>
          </div>
        </div>

        <div className="copy">
          © {new Date().getFullYear()} IPL Auction Platform. All rights reserved.
        </div>
      </div>
    </footer>
  )
}

export default Footer


