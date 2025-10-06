import React, { useState, useEffect, useMemo } from 'react';
import { fetchAuctions } from '../services/api';
import CustomTable from '../components/ui/CustomTable';
import InfoCards from '../components/ui/InfoCards';

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
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-cyan-400 border-t-transparent mx-auto mb-3"></div>
          <p className="text-lg text-gray-300 font-semibold">Loading auctions...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="bg-red-500/10 backdrop-blur-sm border border-red-400/20 rounded-xl p-8 text-center max-w-md">
          <div className="text-red-400 text-4xl mb-4">⚠️</div>
          <p className="text-red-300 text-lg font-medium">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-4 btn btn-secondary"
          >
            Try Again
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
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full mb-4 shadow-2xl">
            <span className="text-2xl">🏏</span>
          </div>
          <h1 className="text-4xl font-extrabold mb-2 text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400 tracking-tight">
            IPL Auctions
          </h1>
          <p className="text-gray-300 max-w-2xl mx-auto leading-relaxed">
            Explore the history of IPL auction events, venues, and seasons
          </p>
        </div>

        {/* Stats Cards */}
        <InfoCards items={[
          { label: 'Total Auctions', value: auctions.length },
          { label: 'Years of History', value: auctions.length > 0 ? new Date().getFullYear() - new Date(auctions[0]?.Auction_Date).getFullYear() + 1 : 0 },
          { label: 'Current Status', value: 'Live' }
        ]} />

        {/* Table Section */}
        <section className="bg-black/30 backdrop-blur-md border border-gray-600/30 rounded-3xl p-6 shadow-2xl">
          <div className="mb-4">
            <h2 className="text-2xl font-bold text-white mb-1">Auction History</h2>
            <p className="text-gray-400">Complete record of all IPL auction events</p>
          </div>
          <CustomTable columns={columns} data={formattedAuctions} />
        </section>
      </div>
    </div>
  );
};

export default AuctionsPage;