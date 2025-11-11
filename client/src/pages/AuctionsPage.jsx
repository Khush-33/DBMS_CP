import React, { useState, useEffect, useMemo } from 'react';
import { toast } from 'react-hot-toast';
import { fetchAuctions, fetchVenues, adminAddAuction } from '../services/api';

import CustomTable from '../components/ui/CustomTable';
import InfoCards from '../components/ui/InfoCards';

const AuctionsPage = () => {
  const [auctions, setAuctions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [auctionDate, setAuctionDate] = useState('');
  const [season, setSeason] = useState('');
  const [venueId, setVenueId] = useState('');
  const [saving, setSaving] = useState(false);
  const [addError, setAddError] = useState(null);
  const [venues, setVenues] = useState([]);

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
    // load venues for dropdown
    (async () => {
      try {
        const res = await fetchVenues();
        setVenues(res.data || []);
      } catch (e) {
        // non-fatal
      }
    })();
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
            <button 
              className={showAddForm ? "btn btn-close" : "btn btn-add"} 
              onClick={() => setShowAddForm(v => !v)}
            >
              {showAddForm ? 'Close' : 'Add Auction'}
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <InfoCards items={[
          { label: 'Total Auctions', value: auctions.length },
          { label: 'Years of History', value: auctions.length > 0 ? new Date().getFullYear() - new Date(auctions[0]?.Auction_Date).getFullYear() + 1 : 0 },
          { label: 'Current Status', value: 'Live' }
        ]} />

        {showAddForm && (
          <div className="bg-black/20 backdrop-blur-sm border border-gray-600/30 rounded-2xl p-6 mb-6">
            <h3 className="text-lg font-bold mb-3">Add New Auction</h3>
            <form onSubmit={async (e) => {
              e.preventDefault();
              setAddError(null);
              if (!auctionDate || !season || !venueId) {
                setAddError('Please fill all fields');
                return;
              }
              setSaving(true);
              try {
                await adminAddAuction(auctionDate, Number(season), Number(venueId));
                const res = await fetchAuctions();
                setAuctions(res.data);
                setShowAddForm(false);
                setAuctionDate(''); setSeason(''); setVenueId('');
                toast.success('Auction added');
              } catch (e) { setAddError('Failed to add auction'); toast.error(e?.response?.data?.message || 'Failed to add auction'); }
              finally { setSaving(false); }
            }} className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <input type="date" value={auctionDate} onChange={(e)=>setAuctionDate(e.target.value)} className="bg-gray-800 border border-gray-600 rounded-lg px-4 py-2 text-white" />
              <input type="number" value={season} onChange={(e)=>setSeason(e.target.value)} placeholder="Season (year)" className="bg-gray-800 border border-gray-600 rounded-lg px-4 py-2 text-white" />
              <select value={venueId} onChange={(e)=>setVenueId(e.target.value)} className="bg-gray-800 border border-gray-600 rounded-lg px-4 py-2 text-white">
                <option value="">Select venue</option>
                {venues.map(v => (
                  <option key={v.Venue_ID} value={v.Venue_ID}>{v.Venue_Name} ({v.City})</option>
                ))}
              </select>
              <div className="md:col-span-4 flex items-center gap-3 mt-2">
                <button type="submit" disabled={saving} className={`btn btn-save ${saving ? 'opacity-60 cursor-not-allowed' : ''}`}>{saving ? 'Saving…' : 'Save'}</button>
                <button type="button" onClick={()=>{ setShowAddForm(false); setAuctionDate(''); setSeason(''); setVenueId(''); setAddError(null); }} className="btn-outline">Cancel</button>
                {addError && <div className="text-red-400 ml-3">{addError}</div>}
              </div>
            </form>
          </div>
        )}

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