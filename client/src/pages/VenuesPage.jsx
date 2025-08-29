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

  if (loading) return <p className="text-center">Loading venues...</p>;
  if (error) return <p className="text-center text-red-500">{error}</p>;

  return (
    <div>
      <h1 className="text-4xl font-bold mb-6 text-center tracking-wide">Auction Venues</h1>
      <CustomTable columns={columns} data={formattedVenues} />
    </div>
  );
};

export default VenuesPage;