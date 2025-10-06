import React, { useState, useEffect, useMemo } from 'react';
import { fetchStatsBySeason } from '../services/api';
import CustomTable from '../components/ui/CustomTable';
import InfoCards from '../components/ui/InfoCards';

const PlayerStatsPage = () => {
  const [stats, setStats] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [season, setSeason] = useState('2025');
  const [sortBy, setSortBy] = useState('runs');

  useEffect(() => {
    const getStats = async () => {
      if (!season) return;
      setLoading(true);
      setError(null);
      try {
        const response = await fetchStatsBySeason(season);
        setStats(response.data);
      } catch (err) {
        setError(`Failed to fetch stats for season ${season}.`);
        setStats([]);
      } finally {
        setLoading(false);
      }
    };
    getStats();
  }, [season]);

  const columns = useMemo(() => [
    { Header: 'Player', accessor: 'Player_Name' },
    { Header: 'Matches', accessor: 'Matches_Played' },
    { Header: 'Runs', accessor: 'Runs' },
    { Header: 'Wickets', accessor: 'Wickets' },
    { Header: 'Strike Rate', accessor: 'Strike_Rate' },
    { Header: 'Economy', accessor: 'Economy' },
  ], []);

  // Calculate aggregated stats
  const totalRuns = stats.reduce((sum, player) => sum + (player.Runs || 0), 0);
  const totalWickets = stats.reduce((sum, player) => sum + (player.Wickets || 0), 0);
  const avgStrikeRate = stats.length > 0 ? 
    stats.reduce((sum, player) => sum + (player.Strike_Rate || 0), 0) / stats.length : 0;

  // Top performers
  const topScorer = stats.reduce((top, player) => 
    (player.Runs > (top.Runs || 0)) ? player : top, {});
  const topWicketTaker = stats.reduce((top, player) => 
    (player.Wickets > (top.Wickets || 0)) ? player : top, {});

  const availableSeasons = ['2025', '2024', '2023', '2022', '2021', '2020'];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-bounce text-6xl mb-4">📊</div>
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-400 border-t-transparent mx-auto mb-3"></div>
          <p className="text-lg text-blue-300 font-semibold">Loading statistics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container px-4 py-8">
      <div className="container mx-auto max-w-7xl">
        {/* Header Section */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full mb-4 shadow-2xl">
            <span className="text-2xl">📊</span>
          </div>
          <h1 className="text-4xl font-extrabold mb-2 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 tracking-tight">
            Player Statistics
          </h1>
          <p className="text-gray-300 max-w-2xl mx-auto leading-relaxed">
            Dive deep into player performance metrics and season-by-season analytics
          </p>
        </div>

        {/* Season Selector */}
        <div className="bg-black/20 backdrop-blur-sm border border-gray-600/30 rounded-2xl p-6 mb-6">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="mb-4 md:mb-0">
              <h2 className="text-2xl font-bold text-white mb-2">Season Analytics</h2>
              <p className="text-gray-400">Select a season to view comprehensive player statistics</p>
            </div>
            <div className="flex items-center space-x-4">
              <label className="text-gray-300 font-semibold">Season:</label>
              <select
                value={season}
                onChange={(e) => setSeason(e.target.value)}
                className="bg-gray-800 border border-gray-600 rounded-xl px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-400 text-lg font-semibold min-w-[120px]"
              >
                {availableSeasons.map(s => (
                  <option key={s} value={s}>IPL {s}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-red-500/20 backdrop-blur-sm border border-red-400/30 rounded-xl p-6 mb-6 text-center">
            <div className="text-red-400 text-3xl mb-3">📈</div>
            <p className="text-red-300 text-lg font-medium">{error}</p>
          </div>
        )}

        {!loading && stats.length > 0 && (
          <>
            {/* Season Analytics: top summary cards */}
            <InfoCards items={[
              { label: 'Active Players', value: stats.length },
              { label: 'Total Runs', value: totalRuns.toLocaleString() },
              { label: 'Total Wickets', value: totalWickets }
            ]} />

            {/* Top Performers stat-cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
              <div className="stat-card">
                <div className="flex items-center mb-3">
                  <div style={{fontSize:28, marginRight:12}}>👑</div>
                  <div>
                    <div className="stat-title">Top Scorer</div>
                    <div className="stat-sub">Leading run scorer this season</div>
                  </div>
                </div>
                <div className="text-center">
                  <div className="stat-value">{topScorer.Runs || 0}</div>
                  <div className="text-white font-semibold mt-2">{topScorer.Player_Name || 'N/A'}</div>
                  <div className="stat-sub">{topScorer.Matches_Played ? `${topScorer.Matches_Played} matches` : ''}</div>
                </div>
              </div>

              <div className="stat-card">
                <div className="flex items-center mb-3">
                  <div style={{fontSize:28, marginRight:12}}>🎯</div>
                  <div>
                    <div className="stat-title">Top Wicket Taker</div>
                    <div className="stat-sub">Leading wicket taker this season</div>
                  </div>
                </div>
                <div className="text-center">
                  <div className="stat-value">{topWicketTaker.Wickets || 0}</div>
                  <div className="text-white font-semibold mt-2">{topWicketTaker.Player_Name || 'N/A'}</div>
                  <div className="stat-sub">{topWicketTaker.Matches_Played ? `${topWicketTaker.Matches_Played} matches` : ''}</div>
                </div>
              </div>
            </div>

            {/* Performance Categories */}
            <div className="bg-black/20 backdrop-blur-sm border border-gray-600/30 rounded-2xl p-6 mb-6">
              <h3 className="text-xl font-bold text-white mb-4">Quick Filters</h3>
              <div className="flex flex-wrap gap-3">
                <button 
                  onClick={() => setSortBy('runs')}
                  className={`px-4 py-2 rounded-lg border transition-all ${sortBy === 'runs' 
                    ? 'btn-accent' 
                    : 'bg-gray-800 border-gray-600 text-gray-400 hover:text-white'}`}
                >
                  Top Run Scorers
                </button>
                <button 
                  onClick={() => setSortBy('wickets')}
                  className={`px-4 py-2 rounded-lg border transition-all ${sortBy === 'wickets' 
                    ? 'btn-accent' 
                    : 'bg-gray-800 border-gray-600 text-gray-400 hover:text-white'}`}
                >
                  Top Wicket Takers
                </button>
                <button 
                  onClick={() => setSortBy('strike_rate')}
                  className={`px-4 py-2 rounded-lg border transition-all ${sortBy === 'strike_rate' 
                    ? 'btn-accent' 
                    : 'bg-gray-800 border-gray-600 text-gray-400 hover:text-white'}`}
                >
                  Best Strike Rates
                </button>
                <button 
                  onClick={() => setSortBy('economy')}
                  className={`px-4 py-2 rounded-lg border transition-all ${sortBy === 'economy' 
                    ? 'btn-accent' 
                    : 'bg-gray-800 border-gray-600 text-gray-400 hover:text-white'}`}
                >
                  Best Economy
                </button>
              </div>
            </div>

            {/* Table Section */}
            <div className="bg-black/30 backdrop-blur-md border border-gray-600/30 rounded-3xl p-6 shadow-2xl">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-2xl font-bold text-white mb-1">Season {season} Statistics</h2>
                  <p className="text-gray-400">Comprehensive player performance data</p>
                </div>
                <div className="bg-blue-500/20 border border-blue-400/30 rounded-lg px-4 py-2">
                  <span className="text-blue-400 font-semibold">{stats.length} Players</span>
                </div>
              </div>
              <CustomTable columns={columns} data={stats} />
            </div>
          </>
        )}

        {!loading && stats.length === 0 && !error && (
          <div className="bg-black/20 backdrop-blur-sm border border-gray-600/30 rounded-2xl p-12 text-center">
            <div className="text-6xl mb-4">📊</div>
            <h3 className="text-2xl font-bold text-white mb-4">No Statistics Available</h3>
            <p className="text-gray-400 mb-6">No player statistics found for IPL {season}.</p>
            <p className="text-gray-500">Try selecting a different season from the dropdown above.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PlayerStatsPage;