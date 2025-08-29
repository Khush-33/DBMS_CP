import React, { useState, useEffect, useMemo } from 'react';
import { fetchAuctions } from '../services/api';
import CustomTable from '../components/ui/CustomTable';

const AuctionsPage = () => {
  const [auctions, setAuctions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const getAuctions = async () => {
      try {
        const response = await fetchAuctions();
        setAuctions(response.data);
      } catch (err) {
        setError('Failed to fetch auction data.');
      } finally {
        setLoading(false);
      }
    };
    getAuctions();
  }, []);

  const columns = useMemo(() => [
    { Header: 'Season', accessor: 'Season' },
    { Header: 'Auction Date', accessor: 'Auction_Date' },
    { Header: 'Venue', accessor: 'Venue_Name' },
    { Header: 'City', accessor: 'City' },
  ], []);

  const formattedAuctions = auctions.map(auction => ({
    ...auction,
    Auction_Date: new Date(auction.Auction_Date).toLocaleDateString()
  }));

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-cyan-400 border-t-transparent mx-auto mb-4"></div>
          <p className="text-xl text-cyan-300 font-semibold">Loading auctions...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 flex items-center justify-center">
        <div className="bg-red-500/20 backdrop-blur-sm border border-red-400/30 rounded-xl p-8 text-center max-w-md">
          <div className="text-red-400 text-5xl mb-4">⚠️</div>
          <p className="text-red-300 text-lg font-medium">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-4 bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-lg transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 px-4 py-8">
      <div className="container mx-auto max-w-7xl">
        {/* Header Section */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full mb-6 shadow-2xl">
            <span className="text-3xl">🏏</span>
          </div>
          <h1 className="text-6xl font-extrabold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 tracking-tight">
            IPL Auctions
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto leading-relaxed">
            Explore the history of IPL auction events, venues, and seasons
          </p>
          <div className="w-24 h-1 bg-gradient-to-r from-cyan-400 to-purple-400 mx-auto mt-6 rounded-full"></div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-gradient-to-br from-cyan-500/20 to-blue-600/20 backdrop-blur-sm border border-cyan-400/30 rounded-2xl p-6 text-center transform hover:scale-105 transition-all duration-300 shadow-xl">
            <div className="text-4xl font-bold text-cyan-400 mb-2">{auctions.length}</div>
            <div className="text-gray-300 font-semibold">Total Auctions</div>
          </div>
          <div className="bg-gradient-to-br from-purple-500/20 to-pink-600/20 backdrop-blur-sm border border-purple-400/30 rounded-2xl p-6 text-center transform hover:scale-105 transition-all duration-300 shadow-xl">
            <div className="text-4xl font-bold text-purple-400 mb-2">
              {auctions.length > 0 ? new Date().getFullYear() - new Date(auctions[0]?.Auction_Date).getFullYear() + 1 : 0}
            </div>
            <div className="text-gray-300 font-semibold">Years of History</div>
          </div>
          <div className="bg-gradient-to-br from-green-500/20 to-emerald-600/20 backdrop-blur-sm border border-green-400/30 rounded-2xl p-6 text-center transform hover:scale-105 transition-all duration-300 shadow-xl">
            <div className="text-4xl font-bold text-green-400 mb-2">Live</div>
            <div className="text-gray-300 font-semibold">Current Status</div>
          </div>
        </div>

        {/* Table Section */}
        <div className="bg-black/30 backdrop-blur-md border border-gray-600/30 rounded-3xl p-8 shadow-2xl">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-white mb-2">Auction History</h2>
            <p className="text-gray-400">Complete record of all IPL auction events</p>
          </div>
          <CustomTable columns={columns} data={formattedAuctions} />
        </div>
      </div>
    </div>
  );
};

export default AuctionsPage;