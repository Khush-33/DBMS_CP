import React, { useState, useEffect, useMemo } from 'react';
import { fetchSponsors } from '../services/api';
import CustomTable from '../components/ui/CustomTable';
import InfoCards from '../components/ui/InfoCards';

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

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-cyan-400 border-t-transparent mx-auto mb-3"></div>
        <p className="text-lg text-gray-300">Loading sponsors...</p>
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
          <h1 className="text-4xl font-extrabold tracking-tight mb-2">Team Sponsors</h1>
          <p className="text-gray-400">Sponsors, partnership deals and amounts</p>
        </header>

        <div className="mb-6">
          <InfoCards items={[
            { label: 'Total Sponsors', value: sponsors.length },
            { label: 'Total Amount (Cr)', value: (sponsors.reduce((s, a) => s + (a.Amount || 0), 0) / 10000000).toFixed(2) },
            { label: 'Active Deals', value: sponsors.length }
          ]} />
        </div>

        <section className="bg-black/30 backdrop-blur-sm border border-gray-700/30 rounded-2xl p-6 shadow-lg">
          <CustomTable columns={columns} data={formattedSponsors} />
        </section>
      </div>
    </div>
  );
};

export default SponsorsPage;