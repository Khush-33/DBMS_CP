import React, { useState, useEffect, useMemo } from 'react';
import { fetchSponsors, adminAddSponsor } from '../services/api';

import CustomTable from '../components/ui/CustomTable';
import InfoCards from '../components/ui/InfoCards';

const SponsorsPage = () => {
  const [sponsors, setSponsors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddSponsor, setShowAddSponsor] = useState(false);
  const [sponsorName, setSponsorName] = useState('');
  const [amount, setAmount] = useState('');
  const [teamId, setTeamId] = useState('');
  const [saving, setSaving] = useState(false);

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

  const AddSponsorModal = ({ open, onClose, onSubmit, sponsorName, setSponsorName, amount, setAmount, teamId, setTeamId, saving }) => {
    if (!open) return null;
    return (
      <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
        <div className="bg-gray-900 border border-gray-700 rounded-xl p-6 w-full max-w-md">
          <h3 className="text-xl font-bold mb-4">Add Sponsor</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1">Sponsor Name</label>
              <input className="w-full input" value={sponsorName} onChange={e => setSponsorName(e.target.value)} placeholder="e.g., Tata" />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Amount (INR)</label>
              <input type="number" className="w-full input" value={amount} onChange={e => setAmount(e.target.value)} placeholder="e.g., 5000000" />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Team ID</label>
              <input type="number" className="w-full input" value={teamId} onChange={e => setTeamId(e.target.value)} placeholder="e.g., 1" />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button className="btn-outline" onClick={onClose} disabled={saving}>Cancel</button>
              <button className="btn-primary" onClick={onSubmit} disabled={saving || !sponsorName || !amount || !teamId}>{saving ? 'Saving…' : 'Create'}</button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="page-container px-4 py-8">
      <div className="container mx-auto max-w-6xl">
        <header className="mb-6 text-center">
          <h1 className="text-4xl font-extrabold tracking-tight mb-2">Team Sponsors</h1>
          <p className="text-gray-400">Sponsors, partnership deals and amounts</p>
          <div className="mt-4">
            <button className="btn-primary" onClick={() => setShowAddSponsor(true)}>Add Sponsor</button>
          </div>
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

      <AddSponsorModal
        open={showAddSponsor}
        onClose={() => setShowAddSponsor(false)}
        sponsorName={sponsorName}
        setSponsorName={setSponsorName}
        amount={amount}
        setAmount={setAmount}
        teamId={teamId}
        setTeamId={setTeamId}
        saving={saving}
        onSubmit={async () => {
          if (!sponsorName || !amount || !teamId) return;
          setSaving(true);
          try {
            await adminAddSponsor(sponsorName, Number(amount), Number(teamId));
            const response = await fetchSponsors();
            setSponsors(response.data);
            setShowAddSponsor(false);
            setSponsorName(''); setAmount(''); setTeamId('');
          } catch (e) { alert('Failed to add sponsor'); }
          finally { setSaving(false); }
        }}
      />
    </div>
  );
};

export default SponsorsPage;