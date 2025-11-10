import React, { useEffect, useState } from 'react';
import { 
  fetchSoldPlayerDetails, 
  fetchTeamBudgetSummary, 
  fetchPlayerPerformanceSummary,
  fetchPlayerCareerSummary,
  fetchPlayerAuditLog,
} from '../services/api';
import PageTitle from '../components/ui/PageTitle';
import CustomTable from '../components/ui/CustomTable';

const ReportsPage = () => {
  const [sold, setSold] = useState([]);
  const [budgets, setBudgets] = useState([]);
  const [perf, setPerf] = useState([]);
  const [career, setCareer] = useState([]);
  const [audit, setAudit] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const [s, b, p, c, a] = await Promise.all([
          fetchSoldPlayerDetails(),
          fetchTeamBudgetSummary(),
          fetchPlayerPerformanceSummary(2025),
          fetchPlayerCareerSummary(),
          fetchPlayerAuditLog(),
        ]);
        setSold(s.data || []);
        setBudgets(b.data || []);
        setPerf(p.data || []);
        setCareer(c.data || []);
        setAudit(a.data || []);
      } catch (e) {
        setError('Failed to load reports');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return (
    <div className="container py-6">
      <PageTitle title="Reports" subtitle="Auction summaries and insights" />
      {error && <div className="alert alert-error mb-4">{error}</div>}
      {loading ? (
        <div className="text-gray-400">Loading...</div>
      ) : (
        <>
          <section className="mb-8">
            <h2 className="section-title">Sold Player Details</h2>
            <CustomTable
              data={sold}
              columns={[
                { key: 'Player_ID', label: 'Player ID' },
                { key: 'Player_Name', label: 'Player' },
                { key: 'Role', label: 'Role' },
                { key: 'Country', label: 'Country' },
                { key: 'Team_ID', label: 'Team ID' },
                { key: 'Team_Name', label: 'Team' },
                { key: 'Sold_Price', label: 'Price' },
                { key: 'Auction_ID', label: 'Auction' },
              ]}
            />
          </section>

          <section className="mb-8">
            <h2 className="section-title">Team Budget Summary</h2>
            <CustomTable
              data={budgets}
              columns={[
                { key: 'Team_ID', label: 'Team ID' },
                { key: 'Team_Name', label: 'Team' },
                { key: 'Budget_Remaining', label: 'Budget Remaining' },
                { key: 'Total_Spent', label: 'Total Spent' },
              ]}
            />
          </section>

          <section className="mb-8">
            <h2 className="section-title">Player Performance (2025)</h2>
            <CustomTable
              data={perf}
              columns={[
                { key: 'Player_ID', label: 'Player ID' },
                { key: 'Name', label: 'Player' },
                { key: 'Role', label: 'Role' },
                { key: 'Country', label: 'Country' },
                { key: 'Status', label: 'Status' },
                { key: 'Matches_Played', label: 'Matches' },
                { key: 'Runs', label: 'Runs' },
                { key: 'Wickets', label: 'Wkts' },
                { key: 'Strike_Rate', label: 'SR' },
                { key: 'Economy', label: 'Eco' },
              ]}
            />
          </section>

          <section className="mb-8">
            <h2 className="section-title">Player Career Summary</h2>
            <CustomTable
              data={career}
              columns={[
                { key: 'Player_ID', label: 'Player ID' },
                { key: 'Name', label: 'Player' },
                { key: 'Role', label: 'Role' },
                { key: 'Country', label: 'Country' },
                { key: 'PlayerTier', label: 'Tier' },
                { key: 'Seasons_Played', label: 'Seasons' },
                { key: 'Career_Matches', label: 'Matches' },
                { key: 'Career_Runs', label: 'Runs' },
                { key: 'Career_Balls_Faced', label: 'Balls' },
                { key: 'Career_Wickets', label: 'Wkts' },
                { key: 'Career_Overs_Bowled', label: 'Overs' },
                { key: 'Career_Strike_Rate', label: 'SR' },
                { key: 'Career_Economy_Rate', label: 'Eco' },
              ]}
            />
          </section>

          <section className="mb-8">
            <h2 className="section-title">Player Audit Log</h2>
            <CustomTable
              data={audit}
              columns={[
                { key: 'Log_ID', label: 'Log ID' },
                { key: 'Player_ID', label: 'Player ID' },
                { key: 'Changed_By_User', label: 'Changed By' },
                { key: 'Change_Timestamp', label: 'When' },
                { key: 'Field_Changed', label: 'Field' },
                { key: 'Old_Value', label: 'Old' },
                { key: 'New_Value', label: 'New' },
              ]}
            />
          </section>
        </>
      )}
    </div>
  );
};

export default ReportsPage;
