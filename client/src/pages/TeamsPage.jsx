import React, { useState, useEffect, useMemo } from 'react';
import { fetchTeams, fetchTeamSummary } from '../services/api';
import CustomTable from '../components/ui/CustomTable';
import InfoCards from '../components/ui/InfoCards';
import PageTitle from '../components/ui/PageTitle';
import BackgroundGlow from '../components/ui/BackgroundGlow';

const TeamsPage = () => {
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [parallaxY, setParallaxY] = useState(0)
  const [summary, setSummary] = useState({ totalTeams: 0, avgBudgetCr: 0, totalBudgetCr: 0 });
  const [summaryLoading, setSummaryLoading] = useState(true);

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
    Team_Name: team.Team_Name,
    Owner_Name: team.Owner_Name,
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
          <CustomTable columns={columns} data={formattedTeams} />
        </div>
      </div>
    </div>
  );
};

export default TeamsPage;