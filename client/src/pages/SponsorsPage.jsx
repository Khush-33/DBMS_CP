import React, { useState, useEffect, useMemo } from 'react';
import { toast } from 'react-hot-toast';
import { fetchSponsors, fetchTeams, adminAddSponsor } from '../services/api';

import CustomTable from '../components/ui/CustomTable';
import InfoCards from '../components/ui/InfoCards';

const SponsorsPage = () => {
  const [sponsors, setSponsors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [sponsorName, setSponsorName] = useState('');
  const [amount, setAmount] = useState('');
  const [teamId, setTeamId] = useState('');
  const [saving, setSaving] = useState(false);
  const [addError, setAddError] = useState(null);
  const [teams, setTeams] = useState([]);

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
    // load teams for dropdown
    (async () => {
      try {
        const res = await fetchTeams();
        setTeams(res.data || []);
      } catch (e) {
        // ignore
      }
    })();
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
          <div className="mt-4">
            <button 
              className={showAddForm ? "btn btn-close" : "btn btn-add"} 
              onClick={() => setShowAddForm(v => !v)}
            >
              {showAddForm ? 'Close' : 'Add Sponsor'}
            </button>
          </div>
        </header>

        {showAddForm && (
          <div className="bg-black/20 backdrop-blur-sm border border-gray-700/30 rounded-2xl p-6 shadow-lg mb-6">
            <h3 className="text-lg font-bold mb-3">Add New Sponsor</h3>
            <form onSubmit={async (e) => {
              e.preventDefault();
              setAddError(null);
              if (!sponsorName || !amount || !teamId) {
                setAddError('Please fill all fields');
                return;
              }
              setSaving(true);
              try {
                await adminAddSponsor(sponsorName, Number(amount), Number(teamId));
                const response = await fetchSponsors();
                setSponsors(response.data);
                setShowAddForm(false);
                setSponsorName(''); setAmount(''); setTeamId('');
                toast.success('Sponsor added');
              } catch (e) { 
                setAddError('Failed to add sponsor'); 
                toast.error(e?.response?.data?.message || 'Failed to add sponsor');
              }
              finally { setSaving(false); }
            }} className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <input value={sponsorName} onChange={(e)=>setSponsorName(e.target.value)} placeholder="Sponsor name" className="bg-gray-800 border border-gray-600 rounded-lg px-4 py-2 text-white" />
              <input type="number" value={amount} onChange={(e)=>setAmount(e.target.value)} placeholder="Amount (INR)" className="bg-gray-800 border border-gray-600 rounded-lg px-4 py-2 text-white" />
              <select value={teamId} onChange={(e)=>setTeamId(e.target.value)} className="bg-gray-800 border border-gray-600 rounded-lg px-4 py-2 text-white">
                <option value="">Select team</option>
                {teams.map(t => (
                  <option key={t.Team_ID} value={t.Team_ID}>{t.Team_Name}</option>
                ))}
              </select>
              <div className="md:col-span-4 flex items-center gap-3 mt-2">
                <button type="submit" disabled={saving} className={`btn btn-save ${saving ? 'opacity-60 cursor-not-allowed' : ''}`}>{saving ? 'Saving…' : 'Save'}</button>
                <button type="button" onClick={()=>{ setShowAddForm(false); setSponsorName(''); setAmount(''); setTeamId(''); setAddError(null); }} className="btn-outline">Cancel</button>
                {addError && <div className="text-red-400 ml-3">{addError}</div>}
              </div>
            </form>
          </div>
        )}

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