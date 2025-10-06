import React, { useState, useEffect, useMemo } from 'react';
import { fetchBids } from '../services/api';
import CustomTable from '../components/ui/CustomTable';
import InfoCards from '../components/ui/InfoCards';

const BidsPage = () => {
  const [bids, setBids] = useState([]);
  const [filteredBids, setFilteredBids] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [teamFilter, setTeamFilter] = useState('All Teams');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const getBids = async () => {
      try {
        const response = await fetchBids();
  setBids(response.data);
  setFilteredBids(response.data);
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

  // Apply client-side filters
  const applyFilters = () => {
    let result = bids.slice();
    if (teamFilter && teamFilter !== 'All Teams') {
      result = result.filter(b => b.Team_Name === teamFilter);
    }
    if (searchTerm && searchTerm.trim() !== '') {
      const s = searchTerm.trim().toLowerCase();
      result = result.filter(b => (b.Player_Name || '').toLowerCase().includes(s));
    }
    setFilteredBids(result);
  };

  const resetFilters = () => {
    setTeamFilter('All Teams');
    setSearchTerm('');
    setFilteredBids(bids.slice());
  };

  // Stats derived from filtered data for sidebar
  const filteredTotalValue = filteredBids.reduce((sum, bid) => sum + bid.Bid_Amount, 0);
  const filteredHighestBid = filteredBids.length > 0 ? Math.max(...filteredBids.map(bid => bid.Bid_Amount)) : 0;

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
    <div className="page-container px-4 py-8">
      <div className="container mx-auto max-w-7xl">
        {/* Header Section */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-orange-400 to-red-500 rounded-full mb-4 shadow-2xl animate-pulse">
            <span className="text-2xl">💰</span>
          </div>
          <h1 className="text-4xl font-extrabold mb-2 text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-pink-400 tracking-tight">
            Auction Bid History
          </h1>
          <p className="text-gray-300 max-w-2xl mx-auto leading-relaxed">
            Track real-time bidding wars and record-breaking player purchases
          </p>
        </div>

        {/* Stats Cards */}
        <InfoCards items={[
          { label: 'Total Bids', value: filteredBids.length },
          { label: 'Total Value (Cr)', value: (filteredTotalValue / 10000000).toFixed(0) },
          { label: 'Highest Bid (Cr)', value: (filteredHighestBid / 10000000).toFixed(1) },
          { label: 'Auction Status', value: 'Live' }
        ]} />

        {/* Filter Section */}
        <div className="bg-black/20 backdrop-blur-sm border border-gray-600/30 rounded-2xl p-6 mb-6">
          <div className="flex flex-wrap gap-4 items-center justify-between">
              <div className="flex items-center space-x-4">
              <span className="text-gray-300 font-semibold">Filter by:</span>
              <select value={teamFilter} onChange={(e) => setTeamFilter(e.target.value)} className="bg-gray-800 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-primary-cyan">
                <option>All Teams</option>
                {/* derive options from data if present */}
                {[...new Set(bids.map(b => b.Team_Name))].map(t => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
              <input 
                type="text" 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search player..." 
                className="bg-gray-800 border border-gray-600 rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-cyan"
              />
            </div>
            <div className="flex items-center space-x-2">
              <div className="flex items-center gap-3">
                <button onClick={() => applyFilters()} className="btn-accent">Apply</button>
                <button onClick={() => resetFilters()} className="btn-outline">Reset</button>
              </div>
              <span className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></span>
              <span className="text-green-400 font-semibold">Live Updates</span>
            </div>
          </div>
        </div>

        {/* Table Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <div className="stat-card lg:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-2xl font-bold text-white mb-2">Auction Bid History</h2>
                <p className="text-gray-400">Complete timeline of bids placed during the auctions</p>
              </div>
              <div className="text-sm text-gray-300">{filteredBids.length} records</div>
            </div>
            <div>
              {/* Table inside card */}
              <CustomTable columns={columns} data={formattedBids.filter(row => filteredBids.find(f => f.Bid_ID === row.Bid_ID))} />
            </div>
          </div>

          <div className="stat-card">
            <div className="flex items-center mb-3">
              <div style={{fontSize:24, marginRight:10}}>⚡</div>
              <div>
                <div className="stat-title">Bid Activity</div>
                <div className="stat-sub">Live updates and recent actions</div>
              </div>
            </div>
            <div className="mt-3">
              <div className="text-3xl font-bold text-primary-cyan">{filteredBids.length}</div>
              <div className="text-gray-300">Total Bids</div>
              <div className="mt-4">
                <div className="text-sm text-gray-400">Top Bid: ₹{(filteredHighestBid / 10000000).toFixed(1)} Cr</div>
                <div className="text-sm text-gray-400 mt-2">Total Value: ₹{(filteredTotalValue / 10000000).toFixed(0)} Cr</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BidsPage;