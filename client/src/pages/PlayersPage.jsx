import React, { useState, useEffect, useMemo } from 'react';
import { fetchPlayers } from '../services/api';
import CustomTable from '../components/ui/CustomTable';

const PlayersPage = () => {
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const getPlayers = async () => {
      try {
        const response = await fetchPlayers();
        setPlayers(response.data);
      } catch (err) {
        setError('Failed to fetch players.');
      } finally {
        setLoading(false);
      }
    };
    getPlayers();
  }, []);

  const columns = useMemo(() => [
    { Header: 'Name', accessor: 'Name' },
    { Header: 'Role', accessor: 'Role' },
    { Header: 'Country', accessor: 'Country' },
    { Header: 'Base Price', accessor: 'Base_Price' },
    { Header: 'Status', accessor: 'Status' },
  ], []);
  
  const formattedPlayers = players.map(player => ({
    ...player,
    Base_Price: `₹ ${(player.Base_Price / 100000).toFixed(2)} L`
  }));

  if (loading) return <p className="text-center">Loading players...</p>;
  if (error) return <p className="text-center text-red-500">{error}</p>;

  return (
    <div>
      <h1 className="text-4xl font-bold mb-6 text-center tracking-wide">Auction Players</h1>
      <CustomTable columns={columns} data={formattedPlayers} />
    </div>
  );
};

export default PlayersPage;