import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../state/AuthContext';
import { fetchTeams, loginUser, registerUser } from '../services/api';

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
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('user');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [teams, setTeams] = useState([]);
  const [teamId, setTeamId] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetchTeams();
        setTeams(res.data || []);
      } catch {}
    };
    load();
  }, []);

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!username.trim() || !password) {
      setError('Please enter both username and password');
      return;
    }
    
    if ((role === 'owner' || role === 'manager') && !teamId) {
      setError('Please select your team');
      return;
    }

    try {
      setError('');
      setLoading(true);
      let userData;

      if (isRegistering) {
        const registerResponse = await registerUser({ 
          username: username.trim(), 
          password, 
          role,
          teamId: teamId || null
        });
        userData = registerResponse.data;
      } else {
        const loginResponse = await loginUser({ username: username.trim(), password });
        userData = loginResponse.data;
      }

      const { token, user } = userData;

      // Store token (key expected by axios interceptor)
      localStorage.setItem('auth:token', token);

      // Update auth context with server-returned teamId and userId
      login(user.username, user.role, user.teamId || null, token, user.userId);

      // Navigate based on role
      if (user.role === 'owner' || user.role === 'manager') navigate('/dashboard/owner');
      else if (user.role === 'auctioneer') navigate('/dashboard/auctioneer');
      else navigate('/dashboard/user');

    } catch (err) {
      setError(err.response?.data?.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const selected = roles.find(r => r.id === role);

  return (
    <div className="container" style={{maxWidth: 860, marginTop: 40}}>
      <div className="relative overflow-hidden card-elevated p-8 rounded-2xl">
        <div className="absolute -top-1/2 -right-1/4 w-2/3 h-2/3 bg-blue-900/30 rounded-full filter blur-3xl animate-pulse" aria-hidden></div>
        <div className="relative z-10">
          <h1 className="text-4xl font-extrabold gradient-text">{isRegistering ? 'Create Account' : 'Welcome Back'}</h1>
          <p className="text-gray-300 mt-2">{isRegistering ? 'Register to join the auction platform' : 'Sign in to access role-based dashboards and live auctions.'}</p>

          <form onSubmit={onSubmit} style={{display:'grid', gap: 16, marginTop: 20}}>
            <div style={{display:'grid', gap: 8}}>
              <label className="text-sm text-gray-300">Username</label>
              <input className="newsletter-input" placeholder="e.g. rohit_sharma" aria-label="Username" value={username} onChange={(e)=>setUsername(e.target.value)} />
            </div>
            
            <div style={{display:'grid', gap: 8}}>
              <label className="text-sm text-gray-300">Password</label>
              <input 
                className="newsletter-input" 
                type="password" 
                placeholder="Enter your password" 
                aria-label="Password" 
                value={password} 
                onChange={(e)=>setPassword(e.target.value)} 
              />
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

            <div style={{display:'flex', gap:12, alignItems:'center', justifyContent: 'space-between'}}>
              <div>
                <button className="btn btn-secondary" type="submit" disabled={loading}>
                  {loading ? 'Please wait...' : (isRegistering ? 'Register' : 'Login')}
                </button>
              </div>
              <div className="text-gray-400 text-sm">
                {isRegistering ? (
                  <span>Already have an account? <button type="button" onClick={() => setIsRegistering(false)} className="text-blue-400 hover:underline">Login</button></span>
                ) : (
                  <span>Need an account? <button type="button" onClick={() => setIsRegistering(true)} className="text-blue-400 hover:underline">Register</button></span>
                )}
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;

