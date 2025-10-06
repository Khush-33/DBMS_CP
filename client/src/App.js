import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/layout/Layout';
import LoginPage from './pages/LoginPage';
import OwnerDashboard from './pages/dashboards/OwnerDashboard';
import AuctioneerDashboard from './pages/dashboards/AuctioneerDashboard';
import UserDashboard from './pages/dashboards/UserDashboard';
import ProtectedRoute from './pages/ProtectedRoute';

// Import Pages
import HomePage from './pages/HomePage';
import TeamsPage from './pages/TeamsPage';
import PlayersPage from './pages/PlayersPage';
import AuctionsPage from './pages/AuctionsPage';
import BidsPage from './pages/BidsPage';
import SponsorsPage from './pages/SponsorsPage';
import VenuesPage from './pages/VenuesPage';
import PlayerStatsPage from './pages/PlayerStatsPage';
import TeamPlayersPage from './pages/TeamPlayersPage';
import AuctionPortalPage from './pages/AuctionPortalPage'; // <-- ADD THIS LINE


function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/dashboard/owner" element={<ProtectedRoute roles={["owner","manager"]}><OwnerDashboard /></ProtectedRoute>} />
          <Route path="/dashboard/auctioneer" element={<ProtectedRoute roles={["auctioneer"]}><AuctioneerDashboard /></ProtectedRoute>} />
          <Route path="/dashboard/user" element={<ProtectedRoute roles={["user","owner","manager","auctioneer"]}><UserDashboard /></ProtectedRoute>} />
          <Route path="/teams" element={<TeamsPage />} />
          <Route path="/players" element={<PlayersPage />} />
          <Route path="/auctions" element={<AuctionsPage />} />
          <Route path="/bids" element={<BidsPage />} />
          <Route path="/sponsors" element={<SponsorsPage />} />
          <Route path="/venues" element={<VenuesPage />} />
          <Route path="/player-stats" element={<PlayerStatsPage />} />
          <Route path="/team-players" element={<TeamPlayersPage />} />
          <Route path="/live-auction" element={<AuctionPortalPage />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;