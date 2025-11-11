import React, { useState, useEffect, useMemo } from 'react';
import { fetchTeams, adminAddTeam } from '../services/api';
import EnhancedTable from '../components/ui/EnhancedTable';
import TableSkeleton from '../components/ui/TableSkeleton';
import InfoCards from '../components/ui/InfoCards';
import PageTitle from '../components/ui/PageTitle';

const TeamsPage = () => {
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [parallaxY, setParallaxY] = useState(0)
  const [showAddForm, setShowAddForm] = useState(false);
  const [teamName, setTeamName] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [saving, setSaving] = useState(false);
  const [addError, setAddError] = useState(null);

  useEffect(() => {
    const onScroll = () => setParallaxY(window.scrollY * 0.08)
    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll()
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    const getTeams = async () => {
      try {
        const response = await fetchTeams();
        setTeams(response.data);
      } catch (err) {
        setError('Failed to fetch teams. Please try again later.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    getTeams();
  }, []);

  const columns = useMemo(() => [
    { 
      header: 'Team Name', 
      accessorKey: 'Team_Name',
      cell: (info) => <span className="font-semibold text-orange-400">{info.getValue()}</span>
    },
    { header: 'Owner', accessorKey: 'Owner_Name' },
    { header: 'Budget Remaining', accessorKey: 'Budget_Remaining' },
  ], []);

  const formattedTeams = teams.map(team => ({
    ...team,
    Budget_Remaining: (team.Budget_Remaining / 10000000).toFixed(2) + ' Cr'
  }));

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-cyan-400 border-t-transparent mx-auto mb-3"></div>
        <p className="text-lg text-gray-300">Loading teams...</p>
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
    <div className="min-h-screen py-8">
      <div className="container">
        <header className="mb-8 text-center">
          <h1 className="text-4xl font-bold mb-3">IPL Teams</h1>
          <p className="text-gray-400">Franchise teams, ownership, and budget management</p>
          <div className="mt-4">
            <button 
              className={showAddForm ? "btn btn-close" : "btn btn-add"} 
              onClick={() => setShowAddForm(v => !v)}
            >
              {showAddForm ? 'Close' : 'Add Team'}
            </button>
          </div>
        </header>

        {showAddForm && (
          <div className="bg-black/20 backdrop-blur-sm border border-gray-600/30 rounded-2xl p-6 mb-6">
            <h3 className="text-lg font-bold mb-3">Add New Team</h3>
            <form onSubmit={async (e) => {
              e.preventDefault();
              setAddError(null);
              if (!teamName || !ownerName) {
                setAddError('Please enter team and owner name');
                return;
              }
              setSaving(true);
              try {
                await adminAddTeam(teamName, ownerName);
                const response = await fetchTeams();
                setTeams(response.data);
                setShowAddForm(false);
                setTeamName('');
                setOwnerName('');
              } catch (e) {
                setAddError('Failed to add team');
              } finally {
                setSaving(false);
              }
            }} className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <input value={teamName} onChange={(e)=>setTeamName(e.target.value)} placeholder="Team name" className="bg-gray-800 border border-gray-600 rounded-lg px-4 py-2 text-white" />
              <input value={ownerName} onChange={(e)=>setOwnerName(e.target.value)} placeholder="Owner name" className="bg-gray-800 border border-gray-600 rounded-lg px-4 py-2 text-white" />
              <div className="md:col-span-4 flex items-center gap-3 mt-2">
                <button type="submit" disabled={saving} className={`btn btn-save ${saving ? 'opacity-60 cursor-not-allowed' : ''}`}>{saving ? 'Saving…' : 'Save'}</button>
                <button type="button" onClick={() => { setShowAddForm(false); setTeamName(''); setOwnerName(''); setAddError(null); }} className="btn-outline">Cancel</button>
                {addError && <div className="text-red-400 ml-3">{addError}</div>}
              </div>
            </form>
          </div>
        )}

        <div className="mb-8">
          <InfoCards items={[
            { label: 'Total Teams', value: formattedTeams.length },
            { label: 'Average Budget', value: (formattedTeams.reduce((s,t)=> s + parseFloat(t.Budget_Remaining),0)/Math.max(formattedTeams.length,1)).toFixed(2) + ' Cr' },
            { label: 'Total Budget', value: (formattedTeams.reduce((s,t)=> s + parseFloat(t.Budget_Remaining),0)).toFixed(2) + ' Cr' }
          ]} />
        </div>

        <div className="card">
          {loading ? (
            <TableSkeleton rows={8} columns={4} />
          ) : (
            <EnhancedTable columns={columns} data={formattedTeams} />
          )}
        </div>
      </div>

      {/* Inline form replaces modal */}
    </div>
  );
};

export default TeamsPage;