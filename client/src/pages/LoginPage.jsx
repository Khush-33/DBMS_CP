import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../state/AuthContext';
import { fetchTeams } from '../services/api';

const roles = [
  { id: 'user', title: 'Fan', desc: 'View live auctions and stats', emoji: '👀' },
  { id: 'owner', title: 'Owner', desc: 'Bid and manage squad', emoji: '🏆' },
  { id: 'manager', title: 'Manager', desc: 'Assist owner with ops', emoji: '🛠️' },
  { id: 'auctioneer', title: 'Auctioneer', desc: 'Run the live auction', emoji: '🔨' },
];

const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [role, setRole] = useState('user');
  const [error, setError] = useState('');
  const [teams, setTeams] = useState([]);
  const [teamId, setTeamId] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetchTeams();
        setTeams(res.data || []);
      } catch {}
    };
    load();
  }, []);

  const onSubmit = (e) => {
    e.preventDefault();
    if (!username.trim()) {
      setError('Please enter your name');
      return;
    }
    setError('');
    if ((role === 'owner' || role === 'manager') && !teamId) {
      setError('Please select your team');
      return;
    }
    login(username.trim(), role, teamId || null);
    if (role === 'owner' || role === 'manager') navigate('/dashboard/owner');
    else if (role === 'auctioneer') navigate('/dashboard/auctioneer');
    else navigate('/dashboard/user');
  };

  const selected = roles.find(r => r.id === role);

  return (
    <div className="container" style={{maxWidth: 860, marginTop: 40}}>
      <div className="relative overflow-hidden card-elevated p-8 rounded-2xl">
        <div className="absolute -top-1/2 -right-1/4 w-2/3 h-2/3 bg-blue-900/30 rounded-full filter blur-3xl animate-pulse" aria-hidden></div>
        <div className="relative z-10">
          <h1 className="text-4xl font-extrabold gradient-text">Welcome back</h1>
          <p className="text-gray-300 mt-2">Sign in to access role-based dashboards and live auctions.</p>

          <form onSubmit={onSubmit} style={{display:'grid', gap: 16, marginTop: 20}}>
            <div style={{display:'grid', gap: 8}}>
              <label className="text-sm text-gray-300">Your name</label>
              <input className="newsletter-input" placeholder="e.g. Rohit" aria-label="Your name" value={username} onChange={(e)=>setUsername(e.target.value)} />
              {error && <span className="text-sm" style={{color:'#ef4444'}}>{error}</span>}
            </div>

            <div>
              <label className="text-sm text-gray-300">Choose your role</label>
              <div className="grid" style={{display:'grid', gridTemplateColumns:'repeat(4, minmax(0, 1fr))', gap:12, marginTop:8}}>
                {roles.map(r => (
                  <button type="button" key={r.id} onClick={()=>setRole(r.id)} className={`glass rounded-xl p-4 text-left transition-transform ${role===r.id ? 'gradient-border' : ''}`} style={{border: role===r.id ? '1px solid rgba(246,196,83,0.35)' : '1px solid rgba(255,255,255,0.06)'}}>
                    <div style={{display:'flex', alignItems:'center', gap:10}}>
                      <div className="w-10 h-10 rounded-lg bg-gray-800/40 flex items-center justify-center text-xl">{r.emoji}</div>
                      <div>
                        <div className="text-white font-semibold">{r.title}</div>
                        <div className="text-gray-400 text-sm">{r.desc}</div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
              <div className="text-sm text-gray-400" style={{marginTop:8}}>
                Selected: <span className="accent-cyan">{selected.title}</span>
              </div>
            </div>

            {(role === 'owner' || role === 'manager') && (
              <div style={{display:'grid', gap:8}}>
                <label className="text-sm text-gray-300">Select your franchise</label>
                <select className="newsletter-input" value={teamId} onChange={(e)=>setTeamId(e.target.value)}>
                  <option value="">-- Select Team --</option>
                  {teams.map(t => (
                    <option key={t.Team_ID} value={t.Team_ID}>{t.Team_Name}</option>
                  ))}
                </select>
              </div>
            )}

            <div style={{display:'flex', gap:12, alignItems:'center'}}>
              <button className="btn btn-secondary" type="submit">Continue</button>
              <span className="text-gray-400 text-sm">You can change roles later from the navbar.</span>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;

