import React, { useState, useEffect, useMemo } from 'react';
import { fetchTeams, fetchTeamSummary, fetchTeamDetails } from '../services/api';
import CustomTable from '../components/ui/CustomTable';
import InfoCards from '../components/ui/InfoCards';
import BackgroundGlow from '../components/ui/BackgroundGlow';

const TeamsPage = () => {
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [parallaxY, setParallaxY] = useState(0)
  const [summary, setSummary] = useState({ totalTeams: 0, avgBudgetCr: 0, totalBudgetCr: 0 });
  const [summaryLoading, setSummaryLoading] = useState(true);
  const [selectedTeamId, setSelectedTeamId] = useState(null);
  const [teamDetailsById, setTeamDetailsById] = useState({});
  const [teamDetailsLoading, setTeamDetailsLoading] = useState(false);
  const [teamDetailsError, setTeamDetailsError] = useState(null);

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

  useEffect(() => {
    const getSummary = async () => {
      try {
        const { data } = await fetchTeamSummary();
        setSummary({
          totalTeams: data?.totalTeams ?? 0,
          avgBudgetCr: data?.avgBudgetCr ?? 0,
          totalBudgetCr: data?.totalBudgetCr ?? 0
        });
      } catch (err) {
        console.error('Failed to fetch team summary:', err);
      } finally {
        setSummaryLoading(false);
      }
    };

    getSummary();
  }, []);

  const columns = useMemo(() => [
    { Header: 'Team Name', accessor: 'Team_Name' },
    { Header: 'Owner', accessor: 'Owner_Name' },
    { Header: 'Budget Remaining (in Cr)', accessor: 'Budget_Remaining' },
  ], []);

  const formattedTeams = teams.map(team => ({
    teamId: team.Team_ID,
    Team_Name: team.Team_Name,
    Owner_Name: team.Owner_Name,
    Budget_Remaining: (team.Budget_Remaining / 10000000).toFixed(2) + ' Cr'
  }));

  const selectedTeam = selectedTeamId ? teamDetailsById[selectedTeamId] : null;

  const handleTeamRowClick = async (row) => {
    const teamId = row?.teamId;
    if (!teamId) return;

    if (teamId === selectedTeamId) {
      setSelectedTeamId(null);
      setTeamDetailsError(null);
      return;
    }

    setSelectedTeamId(teamId);
    setTeamDetailsError(null);

    if (teamDetailsById[teamId]) {
      setTeamDetailsLoading(false);
      return;
    }

    setTeamDetailsLoading(true);
    try {
      const { data } = await fetchTeamDetails(teamId);
      setTeamDetailsById(prev => ({ ...prev, [teamId]: data }));
    } catch (err) {
      console.error('Failed to fetch team details:', err);
      setTeamDetailsError('Failed to load team details. Please try again.');
    } finally {
      setTeamDetailsLoading(false);
    }
  };

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
    <div className="min-h-screen py-8 relative">
      <BackgroundGlow />
      <div className="container relative z-10">
        <header className="mb-8 text-center">
          <h1 className="text-4xl font-bold mb-3">IPL Teams</h1>
          <p className="text-gray-400"  style={{fontFamily:" 'DM Mono', monospace",fontWeight: 300,fontStyle: 'normal'}}>Franchise teams, ownership, and budget management</p>
        </header>

        <div className="mb-8">
          <InfoCards items={[
            { label: 'Total Teams', value: summary.totalTeams, loading: loading || summaryLoading },
            { label: 'Average Budget', value: summary.avgBudgetCr, precision: 2, sub: 'in Cr', loading: loading || summaryLoading },
            { label: 'Total Budget', value: summary.totalBudgetCr, precision: 2, sub: 'in Cr', loading: loading || summaryLoading }
          ]} />
        </div>

        <div className="card">
          <CustomTable
            columns={columns}
            data={formattedTeams}
            onRowClick={handleTeamRowClick}
            getRowId={(row) => row.teamId}
            selectedRowId={selectedTeamId}
          />
        </div>

        <TeamDetailsPanel
          details={selectedTeam}
          loading={teamDetailsLoading}
          error={teamDetailsError}
        />
      </div>
    </div>
  );
};

const TeamDetailsPanel = ({ details, loading, error }) => {
  if (!details && !loading && !error) {
    return null;
  }

  return (
    <div className="card mt-8 p-6">
      {loading && (
        <div className="flex items-center space-x-3 text-gray-300">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-cyan-400 border-t-transparent"></div>
          <span>Loading team details...</span>
        </div>
      )}
      {!loading && error && (
        <div className="bg-red-600/10 border border-red-600/20 rounded-lg p-4 text-red-400">
          {error}
        </div>
      )}
      {!loading && !error && details && (
        <div className="space-y-6">
          <div>
            <h2 className="text-2xl font-semibold text-white mb-2">{details.team?.Team_Name}</h2>
            <p className="text-gray-400">Owner: {details.team?.Owner_Name || 'N/A'}</p>
            <p className="text-gray-400">Budget Remaining: {(Number(details.team?.Budget_Remaining || 0) / 10000000).toFixed(2)} Cr</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-semibold text-white mb-3">Squad</h3>
              <div className="bg-slate-900/50 rounded-lg p-4 max-h-60 overflow-auto space-y-2">
                {details.players && details.players.length > 0 ? (
                  details.players.map((player) => (
                    <div key={player.Player_ID} className="flex items-center justify-between text-sm text-gray-300">
                      <span className="font-medium text-white">{player.Name}</span>
                      <span className="text-xs text-gray-400">{player.Role} &bull; ₹{Number(player.Price || 0).toLocaleString('en-IN')}</span>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 text-sm">No players listed.</p>
                )}
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-white mb-3">Sponsors</h3>
              <div className="bg-slate-900/50 rounded-lg p-4 max-h-60 overflow-auto space-y-2">
                {details.sponsors && details.sponsors.length > 0 ? (
                  details.sponsors.map((sponsor, index) => (
                    <div key={`${sponsor.Sponsor_Name}-${index}`} className="flex items-center justify-between text-sm text-gray-300">
                      <span className="font-medium text-white">{sponsor.Sponsor_Name}</span>
                      <span className="text-xs text-gray-400">₹{Number(sponsor.Amount || 0).toLocaleString('en-IN')}</span>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 text-sm">No sponsors recorded.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeamsPage;