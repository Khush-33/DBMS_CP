import React from 'react'

const Footer = () => {
  return (
    <footer className="footer">
      <div className="container footer-grid">
        <div>
          <div className="brand-title">Cricket Auction</div>
          <div className="footer-desc">Premium platform for franchise auctions and player analytics.</div>
        </div>

        <div>
          <div className="footer-section-title">Explore</div>
          <div style={{display:'grid',gap:6}}>
            <a href="/live-auction">Live Auction</a>
            <a href="/players">Players</a>
            <a href="/teams">Teams</a>
          </div>
        </div>

        <div>
          <div className="footer-section-title">Company</div>
          <div style={{display:'grid',gap:6}}>
            <a href="#">About</a>
            <a href="#">Careers</a>
            <a href="#">Contact</a>
          </div>
        </div>

        <div>
          <div className="footer-section-title">Stay Updated</div>
          <div className="newsletter">
            <input className="newsletter-input" placeholder="Email address" aria-label="Email address" />
            <button className="btn btn-secondary">Subscribe</button>
          </div>
        </div>
      </div>

      <div className="copy">© {new Date().getFullYear()} Cricket Auction. All rights reserved.</div>
    </footer>
  )
}

export default Footer


