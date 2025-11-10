import React, { useState, useEffect, useMemo } from 'react';
import { fetchTeams, adminAddTeam } from '../services/api';
import CustomTable from '../components/ui/CustomTable';
import InfoCards from '../components/ui/InfoCards';
import PageTitle from '../components/ui/PageTitle';

const TeamsPage = () => {
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [parallaxY, setParallaxY] = useState(0)
  const [showAddTeam, setShowAddTeam] = useState(false);
  const [teamName, setTeamName] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [saving, setSaving] = useState(false);

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
    { Header: 'Team Name', accessor: 'Team_Name' },
    { Header: 'Owner', accessor: 'Owner_Name' },
    { Header: 'Budget Remaining (in Cr)', accessor: 'Budget_Remaining' },
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
            <button className="btn-primary" onClick={() => setShowAddTeam(true)}>Add Team</button>
          </div>
        </header>

        <div className="mb-8">
          <InfoCards items={[
            { label: 'Total Teams', value: formattedTeams.length },
            { label: 'Average Budget', value: (formattedTeams.reduce((s,t)=> s + parseFloat(t.Budget_Remaining),0)/Math.max(formattedTeams.length,1)).toFixed(2) + ' Cr' },
            { label: 'Total Budget', value: (formattedTeams.reduce((s,t)=> s + parseFloat(t.Budget_Remaining),0)).toFixed(2) + ' Cr' }
          ]} />
        </div>

        <div className="card">
          <CustomTable columns={columns} data={formattedTeams} />
        </div>
      </div>

      <AddTeamModal 
        open={showAddTeam}
        onClose={() => setShowAddTeam(false)}
        teamName={teamName}
        setTeamName={setTeamName}
        ownerName={ownerName}
        setOwnerName={setOwnerName}
        saving={saving}
        onSubmit={async () => {
          if (!teamName || !ownerName) return;
          setSaving(true);
          try {
            await adminAddTeam(teamName, ownerName);
            const response = await fetchTeams();
            setTeams(response.data);
            setShowAddTeam(false);
            setTeamName('');
            setOwnerName('');
          } catch (e) {
            alert('Failed to add team');
          } finally {
            setSaving(false);
          }
        }}
      />
    </div>
  );
};

// Modal component for adding a team
const AddTeamModal = ({ open, onClose, onSubmit, teamName, setTeamName, ownerName, setOwnerName, saving }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <div className="bg-gray-900 border border-gray-700 rounded-xl p-6 w-full max-w-md">
        <h3 className="text-xl font-bold mb-4">Add Team</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm text-gray-400 mb-1">Team Name</label>
            <input className="w-full input" value={teamName} onChange={e=>setTeamName(e.target.value)} placeholder="e.g., Mumbai Indians" />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">Owner Name</label>
            <input className="w-full input" value={ownerName} onChange={e=>setOwnerName(e.target.value)} placeholder="e.g., Reliance Industries" />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button className="btn-outline" onClick={onClose} disabled={saving}>Cancel</button>
            <button className="btn-primary" onClick={onSubmit} disabled={saving || !teamName || !ownerName}>{saving ? 'Saving…' : 'Create'}</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeamsPage;