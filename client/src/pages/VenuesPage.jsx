import React, { useState, useEffect, useMemo } from 'react';
import { fetchVenues, adminAddVenue } from '../services/api';

import CustomTable from '../components/ui/CustomTable';

const VenuesPage = () => {
  const [venues, setVenues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddVenue, setShowAddVenue] = useState(false);
  const [venueName, setVenueName] = useState('');
  const [city, setCity] = useState('');
  const [capacity, setCapacity] = useState('');
  const [saving, setSaving] = useState(false);

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
      {/* Modal */}
      {showAddVenue && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-gray-900 border border-gray-700 rounded-xl p-6 w-full max-w-md">
            <h3 className="text-xl font-bold mb-4">Add Venue</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">Venue Name</label>
                <input className="w-full input" value={venueName} onChange={e=>setVenueName(e.target.value)} placeholder="e.g., Wankhede Stadium" />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">City</label>
                <input className="w-full input" value={city} onChange={e=>setCity(e.target.value)} placeholder="e.g., Mumbai" />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Capacity</label>
                <input type="number" className="w-full input" value={capacity} onChange={e=>setCapacity(e.target.value)} placeholder="e.g., 33000" />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button className="btn-outline" onClick={()=>setShowAddVenue(false)} disabled={saving}>Cancel</button>
                <button className="btn-primary" disabled={saving || !venueName || !city || !capacity}
                  onClick={async ()=>{
                    setSaving(true);
                    try {
                      await adminAddVenue(venueName, city, Number(capacity));
                      const res = await fetchVenues();
                      setVenues(res.data);
                      setShowAddVenue(false);
                      setVenueName(''); setCity(''); setCapacity('');
                    } catch(e){ alert('Failed to add venue'); }
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
            <button className="btn-primary" onClick={() => setShowAddVenue(true)}>Add Venue</button>
          </div>
        </header>

        <section className="bg-black/30 backdrop-blur-sm border border-gray-700/30 rounded-2xl p-6 shadow-lg">
          <CustomTable columns={columns} data={formattedVenues} />
        </section>
      </div>
    </div>
  );
};

export default VenuesPage;