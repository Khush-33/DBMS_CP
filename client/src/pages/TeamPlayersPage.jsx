import React, { useState, useEffect, useMemo } from 'react';
import { fetchTeams, fetchSquadByTeam } from '../services/api';
import CustomTable from '../components/ui/CustomTable';

const TeamPlayersPage = () => {
  const [squad, setSquad] = useState([]);
  const [teams, setTeams] = useState([]);
  const [selectedTeam, setSelectedTeam] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    // Fetch the list of teams for the dropdown
    const getTeams = async () => {
        try {
            const response = await fetchTeams();
            setTeams(response.data);
            if(response.data.length > 0) {
                setSelectedTeam(response.data[0].Team_ID); // Select the first team by default
            }
        } catch(err) {
            console.error("Could not fetch teams for dropdown.");
        }
    };
    getTeams();
  }, []);

  useEffect(() => {
    if (!selectedTeam) return;

    const getSquad = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetchSquadByTeam(selectedTeam);
        setSquad(response.data);
      } catch (err) {
        if (err && err.response && err.response.status === 404) {
          // No players for this team; show empty state without error banner
          setError(null);
          setSquad([]);
        } else {
          setError(`Failed to fetch squad for the selected team.`);
          setSquad([]);
        }
      } finally {
        setLoading(false);
      }
    };
    getSquad();
  }, [selectedTeam]); // Refetch when team changes

  const columns = useMemo(() => [
    { Header: 'Player Name', accessor: 'Name' },
    { Header: 'Role', accessor: 'Role' },
    { Header: 'Country', accessor: 'Country' },
    { Header: 'Price', accessor: 'Price' },
  ], []);
  
  const formattedSquad = squad.map(player => ({
    ...player,
    Price: `₹ ${(player.Price / 10000000).toFixed(2)} Cr`
  }));

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-cyan-400 border-t-transparent mx-auto mb-3"></div>
        <p className="text-lg text-gray-300">Loading players...</p>
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
          <h1 className="text-4xl font-extrabold tracking-tight mb-2">Team Players</h1>
          <p className="text-gray-400">Browse players by team. Choose a team to see its squad.</p>
        </header>

        <div className="mb-6">
          <div className="filter-bar">
            <div className="group">
              <span className="filter-label">Team</span>
              <select className="select-primary" value={selectedTeam} onChange={(e) => setSelectedTeam(e.target.value)}>
                <option value="">-- Select Team --</option>
                {teams.map((t) => (
                  <option value={t.Team_ID} key={t.Team_ID}>{t.Team_Name}</option>
                ))}
              </select>
            </div>
            <div className="group">
              <button onClick={() => { if(selectedTeam) { setSelectedTeam(selectedTeam); } }} className="btn-accent">Apply</button>
              <button onClick={() => { setSelectedTeam(''); setSquad([]); }} className="btn-outline">Reset</button>
            </div>
          </div>
        </div>

        <section className="bg-black/30 backdrop-blur-sm border border-gray-700/30 rounded-2xl p-6 shadow-lg">
          {formattedSquad.length === 0 ? (
            <div className="text-center text-gray-400">No players for selected team.</div>
          ) : (
            <CustomTable columns={columns} data={formattedSquad} />
          )}
        </section>
      </div>
    </div>
  );
};

export default TeamPlayersPage;