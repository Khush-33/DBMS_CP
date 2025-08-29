import React, { useState, useEffect, useMemo } from 'react';
import { fetchSponsors } from '../services/api';
import CustomTable from '../components/ui/CustomTable';

const SponsorsPage = () => {
  const [sponsors, setSponsors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const getSponsors = async () => {
      try {
        const response = await fetchSponsors();
        setSponsors(response.data);
      } catch (err) {
        setError('Failed to fetch sponsors.');
      } finally {
        setLoading(false);
      }
    };
    getSponsors();
  }, []);

  const columns = useMemo(() => [
    { Header: 'Sponsor Name', accessor: 'Sponsor_Name' },
    { Header: 'Team', accessor: 'Team_Name' },
    { Header: 'Sponsorship Amount', accessor: 'Amount' },
  ], []);

  const formattedSponsors = sponsors.map(sponsor => ({
      ...sponsor,
      Amount: `₹ ${(sponsor.Amount / 10000000).toFixed(2)} Cr`
  }));

  if (loading) return <p className="text-center">Loading sponsors...</p>;
  if (error) return <p className="text-center text-red-500">{error}</p>;

  return (
    <div>
      <h1 className="text-4xl font-bold mb-6 text-center tracking-wide">Team Sponsors</h1>
      <CustomTable columns={columns} data={formattedSponsors} />
    </div>
  );
};

export default SponsorsPage;