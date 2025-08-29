import React, { useState, useEffect, useMemo } from 'react';
import { fetchTeams } from '../services/api';
import CustomTable from '../components/ui/CustomTable';

const TeamsPage = () => {
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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

  if (loading) return <p className="text-center">Loading...</p>;
  if (error) return <p className="text-center text-red-500">{error}</p>;

  return (
    <div>
      <h1 className="text-4xl font-bold mb-6 text-center tracking-wide">IPL Teams</h1>
      <CustomTable columns={columns} data={formattedTeams} />
    </div>
  );
};

export default TeamsPage;