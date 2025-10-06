import React, { useState, useEffect, useMemo } from 'react';
import { fetchVenues } from '../services/api';
import CustomTable from '../components/ui/CustomTable';

const VenuesPage = () => {
  const [venues, setVenues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
        </header>

        <section className="bg-black/30 backdrop-blur-sm border border-gray-700/30 rounded-2xl p-6 shadow-lg">
          <CustomTable columns={columns} data={formattedVenues} />
        </section>
      </div>
    </div>
  );
};

export default VenuesPage;