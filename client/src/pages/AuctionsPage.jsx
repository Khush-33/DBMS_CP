import React, { useState, useEffect, useMemo } from 'react';
import { fetchAuctions, adminAddAuction } from '../services/api';

import CustomTable from '../components/ui/CustomTable';
import InfoCards from '../components/ui/InfoCards';

const AuctionsPage = () => {
  const [auctions, setAuctions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddAuction, setShowAddAuction] = useState(false);
  const [auctionDate, setAuctionDate] = useState('');
  const [season, setSeason] = useState('');
  const [venueId, setVenueId] = useState('');
  const [saving, setSaving] = useState(false);

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
          <div className="mt-4">
            <button className="btn-primary" onClick={() => setShowAddAuction(true)}>Add Auction</button>
          </div>
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

      {/* Add Auction Modal */}
      {showAddAuction && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-gray-900 border border-gray-700 rounded-xl p-6 w-full max-w-md">
            <h3 className="text-xl font-bold mb-4">Add Auction</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">Auction Date</label>
                <input type="date" className="w-full input" value={auctionDate} onChange={e=>setAuctionDate(e.target.value)} />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Season (Year)</label>
                <input type="number" className="w-full input" value={season} onChange={e=>setSeason(e.target.value)} placeholder="e.g., 2026" />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Venue ID</label>
                <input type="number" className="w-full input" value={venueId} onChange={e=>setVenueId(e.target.value)} placeholder="e.g., 1" />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button className="btn-outline" onClick={()=>setShowAddAuction(false)} disabled={saving}>Cancel</button>
                <button className="btn-primary" disabled={saving || !auctionDate || !season || !venueId}
                  onClick={async ()=>{
                    setSaving(true);
                    try {
                      await adminAddAuction(auctionDate, Number(season), Number(venueId));
                      const res = await fetchAuctions();
                      setAuctions(res.data);
                      setShowAddAuction(false);
                      setAuctionDate(''); setSeason(''); setVenueId('');
                    } catch(e) { alert('Failed to add auction'); }
                    finally { setSaving(false); }
                  }}
                >{saving ? 'Saving…' : 'Create'}</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AuctionsPage;