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
    <div className="page-container login-page-wrapper">
      {/* Animated background elements */}
      <div className="login-bg-gradient login-bg-1" aria-hidden></div>
      <div className="login-bg-gradient login-bg-2" aria-hidden></div>
      
      <div className="container" style={{maxWidth: 950, marginBottom: 60, position: 'relative', zIndex: 10}}>
        <div className="login-card">
          {/* Top decorative elements */}
          <div className="absolute -top-1/3 -left-1/4 w-96 h-96 bg-blue-900/20 rounded-full filter blur-3xl opacity-60" aria-hidden></div>
          <div className="absolute -bottom-1/4 -right-1/3 w-80 h-80 bg-cyan-900/20 rounded-full filter blur-3xl opacity-40" aria-hidden></div>
          
          <div className="relative z-10">
            {/* Header Section */}
            <div className="login-header">
              <h1 className="text-5xl font-extrabold gradient-text" style={{marginBottom: 12}}>Welcome back</h1>
              <p className="text-gray-400 text-lg"  style={{fontFamily:" 'DM Mono', monospace",fontWeight: 300,fontStyle: 'normal'}}>Sign in to access role-based dashboards and live auctions.</p>
            </div>

            <form onSubmit={onSubmit} style={{display:'grid', gap: 32}}>
              {/* Name Input */}
              <div className="form-group">
                <label className="form-label">Your name</label>
                <div className="input-wrapper">
                  <input 
                    className="login-input" 
                    placeholder="e.g. Rohit Sharma" 
                    aria-label="Your name" 
                    value={username} 
                    onChange={(e)=>setUsername(e.target.value)} 
                    type="text"
                  />
                  <div className="input-underline"></div>
                </div>
                {error && <span className="form-error">{error}</span>}
              </div>

              {/* Role Selection */}
              <div className="form-group">
                <label className="form-label">Choose your role</label>
                <p className="form-sublabel">Pick a role that best describes your involvement</p>
                <div className="roles-grid">
                  {roles.map(r => (
                    <button 
                      type="button" 
                      key={r.id} 
                      onClick={()=>setRole(r.id)} 
                      className={`role-card-button ${role===r.id ? 'role-card-active' : ''}`}
                      aria-pressed={role === r.id}
                    >
                      <div className="role-card-inner">
                        <div className={`role-emoji-badge ${role===r.id ? 'active' : ''}`}>{r.emoji}</div>
                        <div className="role-content">
                          <div className="role-title">{r.title}</div>
                          <div className="role-description">{r.desc}</div>
                        </div>
                        {role===r.id && <div className="role-checkmark">✓</div>}
                      </div>
                    </button>
                  ))}
                </div>
                <div className="selected-role-badge">
                  <span className="badge-label">Selected:</span>
                  <span className="badge-value">{selected.title}</span>
                </div>
              </div>

              {/* Team Selection */}
              {(role === 'owner' || role === 'manager') && (
                <div className="form-group team-selection-animated">
                  <label className="form-label">Select your franchise</label>
                  <div className="input-wrapper">
                    <select 
                      className="login-input login-select" 
                      value={teamId} 
                      onChange={(e)=>setTeamId(e.target.value)}
                    >
                      <option value="">-- Select Team --</option>
                      {teams.map(t => (
                        <option key={t.Team_ID} value={t.Team_ID}>{t.Team_Name}</option>
                      ))}
                    </select>
                    <div className="input-underline"></div>
                  </div>
                </div>
              )}

              {/* Action Section */}
              <div className="form-actions">
                <button className="btn btn-primary login-submit-btn" type="submit">
                  <span>Continue</span>
                  <span className="btn-arrow">→</span>
                </button>
                <p className="form-hint">You can change roles later from the navbar.</p>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;

