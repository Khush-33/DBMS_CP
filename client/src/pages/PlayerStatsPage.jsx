import React, { useState, useEffect, useMemo } from 'react';
import { fetchStatsBySeason } from '../services/api';
import CustomTable from '../components/ui/CustomTable';

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
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-indigo-900 to-purple-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-bounce text-6xl mb-4">📊</div>
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-400 border-t-transparent mx-auto mb-4"></div>
          <p className="text-xl text-blue-300 font-semibold">Loading statistics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-indigo-900 to-purple-900 px-4 py-8">
      <div className="container mx-auto max-w-7xl">
        {/* Header Section */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full mb-6 shadow-2xl">
            <span className="text-3xl">📊</span>
          </div>
          <h1 className="text-6xl font-extrabold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 tracking-tight">
            Player Statistics
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto leading-relaxed">
            Dive deep into player performance metrics and season-by-season analytics
          </p>
          <div className="w-24 h-1 bg-gradient-to-r from-blue-400 to-purple-400 mx-auto mt-6 rounded-full"></div>
        </div>

        {/* Season Selector */}
        <div className="bg-black/20 backdrop-blur-sm border border-gray-600/30 rounded-2xl p-8 mb-8">
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
                className="bg-gray-800 border border-gray-600 rounded-xl px-6 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-400 text-lg font-semibold min-w-[120px]"
              >
                {availableSeasons.map(s => (
                  <option key={s} value={s}>IPL {s}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-red-500/20 backdrop-blur-sm border border-red-400/30 rounded-xl p-6 mb-8 text-center">
            <div className="text-red-400 text-4xl mb-3">📈</div>
            <p className="text-red-300 text-lg font-medium">{error}</p>
          </div>
        )}

        {!loading && stats.length > 0 && (
          <>
            {/* Overview Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
              <div className="bg-gradient-to-br from-green-500/20 to-emerald-600/20 backdrop-blur-sm border border-green-400/30 rounded-2xl p-6 text-center transform hover:scale-105 transition-all duration-300 shadow-xl">
                <div className="text-4xl font-bold text-green-400 mb-2">{stats.length}</div>
                <div className="text-gray-300 font-semibold">Active Players</div>
              </div>
              <div className="bg-gradient-to-br from-blue-500/20 to-cyan-600/20 backdrop-blur-sm border border-blue-400/30 rounded-2xl p-6 text-center transform hover:scale-105 transition-all duration-300 shadow-xl">
                <div className="text-4xl font-bold text-blue-400 mb-2">{totalRuns.toLocaleString()}</div>
                <div className="text-gray-300 font-semibold">Total Runs</div>
              </div>
              <div className="bg-gradient-to-br from-purple-500/20 to-pink-600/20 backdrop-blur-sm border border-purple-400/30 rounded-2xl p-6 text-center transform hover:scale-105 transition-all duration-300 shadow-xl">
                <div className="text-4xl font-bold text-purple-400 mb-2">{totalWickets}</div>
                <div className="text-gray-300 font-semibold">Total Wickets</div>
              </div>
              <div className="bg-gradient-to-br from-orange-500/20 to-red-600/20 backdrop-blur-sm border border-orange-400/30 rounded-2xl p-6 text-center transform hover:scale-105 transition-all duration-300 shadow-xl">
                <div className="text-4xl font-bold text-orange-400 mb-2">{avgStrikeRate.toFixed(1)}</div>
                <div className="text-gray-300 font-semibold">Avg Strike Rate</div>
              </div>
            </div>

            {/* Top Performers */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
              <div className="bg-gradient-to-br from-yellow-500/20 to-orange-600/20 backdrop-blur-sm border border-yellow-400/30 rounded-2xl p-8">
                <div className="flex items-center mb-4">
                  <span className="text-4xl mr-4">👑</span>
                  <div>
                    <h3 className="text-2xl font-bold text-yellow-400">Top Scorer</h3>
                    <p className="text-gray-400">Leading run scorer this season</p>
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-white mb-2">{topScorer.Player_Name}</div>
                  <div className="text-5xl font-extrabold text-yellow-400 mb-2">{topScorer.Runs}</div>
                  <div className="text-gray-300">runs in {topScorer.Matches_Played} matches</div>
                  <div className="text-sm text-gray-400 mt-2">Strike Rate: {topScorer.Strike_Rate}</div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-red-500/20 to-pink-600/20 backdrop-blur-sm border border-red-400/30 rounded-2xl p-8">
                <div className="flex items-center mb-4">
                  <span className="text-4xl mr-4">🎯</span>
                  <div>
                    <h3 className="text-2xl font-bold text-red-400">Top Wicket Taker</h3>
                    <p className="text-gray-400">Leading wicket taker this season</p>
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-white mb-2">{topWicketTaker.Player_Name}</div>
                  <div className="text-5xl font-extrabold text-red-400 mb-2">{topWicketTaker.Wickets}</div>
                  <div className="text-gray-300">wickets in {topWicketTaker.Matches_Played} matches</div>
                  <div className="text-sm text-gray-400 mt-2">Economy: {topWicketTaker.Economy}</div>
                </div>
              </div>
            </div>

            {/* Performance Categories */}
            <div className="bg-black/20 backdrop-blur-sm border border-gray-600/30 rounded-2xl p-6 mb-8">
              <h3 className="text-xl font-bold text-white mb-4">Quick Filters</h3>
              <div className="flex flex-wrap gap-3">
                <button 
                  onClick={() => setSortBy('runs')}
                  className={`px-4 py-2 rounded-lg border transition-all ${sortBy === 'runs' 
                    ? 'bg-blue-500/30 border-blue-400/50 text-blue-300' 
                    : 'bg-gray-800 border-gray-600 text-gray-400 hover:text-white'}`}
                >
                  Top Run Scorers
                </button>
                <button 
                  onClick={() => setSortBy('wickets')}
                  className={`px-4 py-2 rounded-lg border transition-all ${sortBy === 'wickets' 
                    ? 'bg-red-500/30 border-red-400/50 text-red-300' 
                    : 'bg-gray-800 border-gray-600 text-gray-400 hover:text-white'}`}
                >
                  Top Wicket Takers
                </button>
                <button 
                  onClick={() => setSortBy('strike_rate')}
                  className={`px-4 py-2 rounded-lg border transition-all ${sortBy === 'strike_rate' 
                    ? 'bg-green-500/30 border-green-400/50 text-green-300' 
                    : 'bg-gray-800 border-gray-600 text-gray-400 hover:text-white'}`}
                >
                  Best Strike Rates
                </button>
                <button 
                  onClick={() => setSortBy('economy')}
                  className={`px-4 py-2 rounded-lg border transition-all ${sortBy === 'economy' 
                    ? 'bg-purple-500/30 border-purple-400/50 text-purple-300' 
                    : 'bg-gray-800 border-gray-600 text-gray-400 hover:text-white'}`}
                >
                  Best Economy
                </button>
              </div>
            </div>

            {/* Table Section */}
            <div className="bg-black/30 backdrop-blur-md border border-gray-600/30 rounded-3xl p-8 shadow-2xl">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-white mb-2">Season {season} Statistics</h2>
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