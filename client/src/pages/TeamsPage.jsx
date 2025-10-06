import React, { useState, useEffect, useMemo } from 'react';
import { fetchTeams } from '../services/api';
import CustomTable from '../components/ui/CustomTable';
import InfoCards from '../components/ui/InfoCards';
import PageTitle from '../components/ui/PageTitle';

const TeamsPage = () => {
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [parallaxY, setParallaxY] = useState(0)

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
    <div className="page-container px-4 py-8 page-bg-teams">
      <div className="container mx-auto max-w-6xl">
        {/* Hero banner */}
        <div className="relative overflow-hidden card-elevated p-6 rounded-xl mb-8 animate-fade-in-scale">
          <div className="absolute -top-1/2 -right-1/4 bg-blue-700/30 rounded-full filter blur-3xl animate-pulse" style={{ width: '66%', height: '66%', transform: `translateY(${parallaxY * 0.6}px)` }}></div>
          <div className="relative z-10">
            <h2 className="text-3xl font-extrabold gradient-text">Franchise Teams</h2>
            <p className="text-gray-300 mt-2">Analyze budgets and manage squads with a cinematic interface.</p>
          </div>
        </div>
        <header className="mb-6 text-center animate-fade-in-up">
          <PageTitle>IPL Teams</PageTitle>
          <p className="text-gray-400">Team rosters, ownership and remaining budgets</p>
        </header>

        <div className="mb-6 animate-fade-in-up">
          <InfoCards items={[
            { label: 'Registered Teams', value: formattedTeams.length },
            { label: 'Average Budget (Cr)', value: (formattedTeams.reduce((s,t)=> s + parseFloat(t.Budget_Remaining),0)/Math.max(formattedTeams.length,1)).toFixed(2) },
            { label: 'Total Budget (Cr)', value: (formattedTeams.reduce((s,t)=> s + parseFloat(t.Budget_Remaining),0)).toFixed(2) }
          ]} />
        </div>

        <section className="bg-black/30 backdrop-blur-sm border border-gray-700/30 rounded-2xl p-6 shadow-lg">
          <CustomTable columns={columns} data={formattedTeams} />
        </section>
      </div>
    </div>
  );
};

export default TeamsPage;