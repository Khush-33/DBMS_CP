import React, { useState, useEffect, useMemo } from 'react';
import { fetchTeams, fetchSquadByTeam } from '../services/api';
import CustomTable from '../components/ui/CustomTable';

const TeamPlayersPage = () => {
  const [squad, setSquad] = useState([]);
  const [teams, setTeams] = useState([]);
  const [selectedTeam, setSelectedTeam] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

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
        setError(`Failed to fetch squad for the selected team.`);
        setSquad([]);
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

  return (
    <div>
      <h1 className="text-4xl font-bold mb-6 text-center tracking-wide">Team Squads</h1>
      <div className="flex justify-center mb-6">
        <label htmlFor="team" className="mr-2 self-center font-semibold">Select Team:</label>
        <select
          id="team"
          value={selectedTeam}
          onChange={(e) => setSelectedTeam(e.target.value)}
          className="bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white"
        >
          <option value="" disabled>-- Select a Team --</option>
          {teams.map(team => (
              <option key={team.Team_ID} value={team.Team_ID}>{team.Team_Name}</option>
          ))}
        </select>
      </div>

      {loading && <p className="text-center">Loading squad...</p>}
      {error && <p className="text-center text-red-500">{error}</p>}
      {!loading && <CustomTable columns={columns} data={formattedSquad} />}
    </div>
  );
};

export default TeamPlayersPage;