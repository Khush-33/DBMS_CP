import React, { useState, useEffect, useMemo } from 'react';
import { fetchBids } from '../services/api';
import CustomTable from '../components/ui/CustomTable';

const BidsPage = () => {
  const [bids, setBids] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const getBids = async () => {
      try {
        const response = await fetchBids();
        setBids(response.data);
      } catch (err) {
        setError('Failed to fetch bid history.');
      } finally {
        setLoading(false);
      }
    };
    getBids();
  }, []);

  const columns = useMemo(() => [
    { Header: 'Player Name', accessor: 'Player_Name' },
    { Header: 'Team', accessor: 'Team_Name' },
    { Header: 'Bid Amount', accessor: 'Bid_Amount' },
    { Header: 'Bid Time', accessor: 'Bid_Time' },
  ], []);

  const formattedBids = bids.map(bid => ({
    ...bid,
    Bid_Amount: `₹ ${(bid.Bid_Amount / 10000000).toFixed(2)} Cr`,
    Bid_Time: new Date(bid.Bid_Time).toLocaleString()
  }));

  // Calculate total value and highest bid
  const totalValue = bids.reduce((sum, bid) => sum + bid.Bid_Amount, 0);
  const highestBid = bids.length > 0 ? Math.max(...bids.map(bid => bid.Bid_Amount)) : 0;

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-900 via-red-900 to-pink-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-pulse text-6xl mb-4">💰</div>
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-orange-400 border-t-transparent mx-auto mb-4"></div>
          <p className="text-xl text-orange-300 font-semibold">Loading bid history...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-900 via-red-900 to-pink-900 flex items-center justify-center">
        <div className="bg-red-500/20 backdrop-blur-sm border border-red-400/30 rounded-xl p-8 text-center max-w-md">
          <div className="text-red-400 text-5xl mb-4">📊</div>
          <p className="text-red-300 text-lg font-medium">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-4 bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-lg transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-900 via-red-900 to-pink-900 px-4 py-8">
      <div className="container mx-auto max-w-7xl">
        {/* Header Section */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-orange-400 to-red-500 rounded-full mb-6 shadow-2xl animate-pulse">
            <span className="text-3xl">💰</span>
          </div>
          <h1 className="text-6xl font-extrabold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-red-400 to-pink-400 tracking-tight">
            Auction Bid History
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto leading-relaxed">
            Track real-time bidding wars and record-breaking player purchases
          </p>
          <div className="w-24 h-1 bg-gradient-to-r from-orange-400 to-red-400 mx-auto mt-6 rounded-full"></div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          <div className="bg-gradient-to-br from-orange-500/20 to-red-600/20 backdrop-blur-sm border border-orange-400/30 rounded-2xl p-6 text-center transform hover:scale-105 transition-all duration-300 shadow-xl">
            <div className="text-3xl font-bold text-orange-400 mb-2">{bids.length}</div>
            <div className="text-gray-300 font-semibold text-sm">Total Bids</div>
          </div>
          <div className="bg-gradient-to-br from-green-500/20 to-emerald-600/20 backdrop-blur-sm border border-green-400/30 rounded-2xl p-6 text-center transform hover:scale-105 transition-all duration-300 shadow-xl">
            <div className="text-3xl font-bold text-green-400 mb-2">
              ₹{(totalValue / 10000000).toFixed(0)}Cr
            </div>
            <div className="text-gray-300 font-semibold text-sm">Total Value</div>
          </div>
          <div className="bg-gradient-to-br from-purple-500/20 to-pink-600/20 backdrop-blur-sm border border-purple-400/30 rounded-2xl p-6 text-center transform hover:scale-105 transition-all duration-300 shadow-xl">
            <div className="text-3xl font-bold text-purple-400 mb-2">
              ₹{(highestBid / 10000000).toFixed(1)}Cr
            </div>
            <div className="text-gray-300 font-semibold text-sm">Highest Bid</div>
          </div>
          <div className="bg-gradient-to-br from-cyan-500/20 to-blue-600/20 backdrop-blur-sm border border-cyan-400/30 rounded-2xl p-6 text-center transform hover:scale-105 transition-all duration-300 shadow-xl">
            <div className="text-3xl font-bold text-cyan-400 mb-2">Live</div>
            <div className="text-gray-300 font-semibold text-sm">Auction Status</div>
          </div>
        </div>

        {/* Filter Section */}
        <div className="bg-black/20 backdrop-blur-sm border border-gray-600/30 rounded-2xl p-6 mb-8">
          <div className="flex flex-wrap gap-4 items-center justify-between">
            <div className="flex items-center space-x-4">
              <span className="text-gray-300 font-semibold">Filter by:</span>
              <select className="bg-gray-800 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-orange-400">
                <option>All Teams</option>
                <option>Mumbai Indians</option>
                <option>Chennai Super Kings</option>
                <option>Royal Challengers Bangalore</option>
              </select>
              <input 
                type="text" 
                placeholder="Search player..." 
                className="bg-gray-800 border border-gray-600 rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-400"
              />
            </div>
            <div className="flex items-center space-x-2">
              <span className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></span>
              <span className="text-green-400 font-semibold">Live Updates</span>
            </div>
          </div>
        </div>

        {/* Table Section */}
        <div className="bg-black/30 backdrop-blur-md border border-gray-600/30 rounded-3xl p-8 shadow-2xl">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-white mb-2">Bid Activity</h2>
              <p className="text-gray-400">Real-time bidding history and player transactions</p>
            </div>
            <div className="flex items-center space-x-2 bg-orange-500/20 border border-orange-400/30 rounded-lg px-4 py-2">
              <span className="w-2 h-2 bg-orange-400 rounded-full animate-bounce"></span>
              <span className="text-orange-400 font-semibold text-sm">Auto-refreshing</span>
            </div>
          </div>
          <CustomTable columns={columns} data={formattedBids} />
        </div>
      </div>
    </div>
  );
};

export default BidsPage;