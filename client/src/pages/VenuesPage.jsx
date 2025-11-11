import React, { useState, useEffect, useMemo } from 'react';
import { toast } from 'react-hot-toast';
import { fetchVenues, adminAddVenue } from '../services/api';

import CustomTable from '../components/ui/CustomTable';

const VenuesPage = () => {
  const [venues, setVenues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [venueName, setVenueName] = useState('');
  const [city, setCity] = useState('');
  const [capacity, setCapacity] = useState('');
  const [saving, setSaving] = useState(false);
  const [addError, setAddError] = useState(null);

  useEffect(() => {
    const getVenues = async () => {
      try {
        const response = await fetchVenues();
        setVenues(response.data);
      } catch (err) {
        setError('Failed to fetch venues.');
      } finally {
        setLoading(false);
      }
    };
    getVenues();
  }, []);

  const columns = useMemo(() => [
    { Header: 'Venue Name', accessor: 'Venue_Name' },
    { Header: 'City', accessor: 'City' },
    { Header: 'Capacity', accessor: 'Capacity' },
  ], []);

  const formattedVenues = venues.map(v => ({...v, Capacity: v.Capacity.toLocaleString()}));

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-cyan-400 border-t-transparent mx-auto mb-3"></div>
        <p className="text-lg text-gray-300">Loading venues...</p>
      </div>
    </div>
  );

  if (error) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="bg-red-600/10 border border-red-600/20 rounded-xl p-6 text-center">
        <div className="text-red-400 font-semibold mb-2">{error}</div>
        <button onClick={() => window.location.reload()} className="btn btn-secondary">Retry</button>
      </div>
    </div>
  );

  return (
    <div className="page-container px-4 py-8">
      <div className="container mx-auto max-w-6xl">
        <header className="mb-6 text-center">
          <h1 className="text-4xl font-extrabold tracking-tight mb-2">Auction Venues</h1>
          <p className="text-gray-400">List of venues, cities and capacities used in the auctions</p>
          <div className="mt-4">
            <button 
              className={showAddForm ? "btn btn-close" : "btn btn-add"} 
              onClick={() => setShowAddForm(v => !v)}
            >
              {showAddForm ? 'Close' : 'Add Venue'}
            </button>
          </div>
        </header>

        {showAddForm && (
          <div className="bg-black/20 backdrop-blur-sm border border-gray-700/30 rounded-2xl p-6 shadow-lg mb-6">
            <h3 className="text-lg font-bold mb-3">Add New Venue</h3>
            <form onSubmit={async (e) => {
              e.preventDefault();
              setAddError(null);
              if (!venueName || !city || !capacity) {
                setAddError('Please fill all fields');
                return;
              }
              setSaving(true);
              try {
                await adminAddVenue(venueName, city, Number(capacity));
                const res = await fetchVenues();
                setVenues(res.data);
                setShowAddForm(false);
                setVenueName(''); setCity(''); setCapacity('');
                toast.success('Venue added');
              } catch (e) { setAddError('Failed to add venue'); toast.error(e?.response?.data?.message || 'Failed to add venue'); }
              finally { setSaving(false); }
            }} className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <input value={venueName} onChange={(e)=>setVenueName(e.target.value)} placeholder="Venue name" className="bg-gray-800 border border-gray-600 rounded-lg px-4 py-2 text-white" />
              <input value={city} onChange={(e)=>setCity(e.target.value)} placeholder="City" className="bg-gray-800 border border-gray-600 rounded-lg px-4 py-2 text-white" />
              <input type="number" value={capacity} onChange={(e)=>setCapacity(e.target.value)} placeholder="Capacity" className="bg-gray-800 border border-gray-600 rounded-lg px-4 py-2 text-white" />
              <div className="md:col-span-4 flex items-center gap-3 mt-2">
                <button type="submit" disabled={saving} className={`btn btn-save ${saving ? 'opacity-60 cursor-not-allowed' : ''}`}>{saving ? 'Saving…' : 'Save'}</button>
                <button type="button" onClick={()=>{ setShowAddForm(false); setVenueName(''); setCity(''); setCapacity(''); setAddError(null); }} className="btn-outline">Cancel</button>
                {addError && <div className="text-red-400 ml-3">{addError}</div>}
              </div>
            </form>
          </div>
        )}

        <section className="bg-black/30 backdrop-blur-sm border border-gray-700/30 rounded-2xl p-6 shadow-lg">
          <CustomTable columns={columns} data={formattedVenues} />
        </section>

      </div>
    </div>
  );
};

export default VenuesPage;