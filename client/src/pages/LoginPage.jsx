import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../state/AuthContext';
import { fetchTeams, loginUser, registerUser } from '../services/api';

const roles = [
  { id: 'user', title: 'Fan', desc: 'View live auctions and stats', emoji: '👀', color: 'orange' },
  { id: 'owner', title: 'Owner', desc: 'Bid and manage squad', emoji: '🏆', color: 'orange' },
  { id: 'manager', title: 'Manager', desc: 'Assist owner with ops', emoji: '🛠️', color: 'orange' },
  { id: 'auctioneer', title: 'Auctioneer', desc: 'Run the live auction', emoji: '🔨', color: 'orange' },
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
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8" style={{background: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 50%, #0f0f0f 100%)'}}>
      <div className="w-full max-w-6xl">
        <div className="relative overflow-hidden rounded-2xl shadow-2xl" style={{background: 'linear-gradient(135deg, rgba(26, 26, 46, 0.98) 0%, rgba(15, 15, 23, 0.98) 100%)', border: '1px solid rgba(249, 115, 22, 0.2)', backdropFilter: 'blur(10px)'}}>
          {/* Decorative background elements */}
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-orange-500/10 rounded-full filter blur-3xl" aria-hidden="true"></div>
          <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-orange-600/5 rounded-full filter blur-3xl" aria-hidden="true"></div>
          
          <div className="relative z-10 p-8 sm:p-12">
            {/* Header */}
            <div className="text-center mb-10">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl mb-5 shadow-xl shadow-orange-500/30">
                <span className="text-4xl">🏏</span>
              </div>
              <h1 className="text-5xl font-bold mb-3" style={{background: 'linear-gradient(135deg, #f97316 0%, #fb923c 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text', fontFamily: 'system-ui, -apple-system, sans-serif', letterSpacing: '-0.02em'}}>
                {isRegistering ? 'Create Account' : 'Welcome Back'}
              </h1>
              <p className="text-gray-400 text-lg font-medium">{isRegistering ? 'Join the IPL auction platform' : 'Sign in to access your dashboard'}</p>
            </div>

          <form onSubmit={onSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-300 block">Username</label>
              <input 
                className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all" 
                placeholder="e.g. rohit_sharma" 
                aria-label="Username" 
                value={username} 
                onChange={(e)=>setUsername(e.target.value)}
                style={{fontSize: '15px', fontFamily: 'system-ui, -apple-system, sans-serif'}}
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-300 block">Password</label>
              <input 
                className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all" 
                type="password" 
                placeholder="Enter your password" 
                aria-label="Password" 
                value={password} 
                onChange={(e)=>setPassword(e.target.value)}
                style={{fontSize: '15px', fontFamily: 'system-ui, -apple-system, sans-serif'}}
              />
              {error && <p className="text-sm font-medium text-red-400 mt-2">{error}</p>}
            </div>

            <div className="space-y-4">
              <label className="text-sm font-semibold text-gray-300 block">Choose your role</label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {roles.map(r => {
                  const colorClasses = {
                    blue: {
                      selected: 'from-blue-500/20 to-blue-600/10 border-blue-500 shadow-blue-500/20',
                      selectedText: 'text-blue-400',
                      selectedBg: 'bg-blue-500/20',
                      checkmark: 'bg-blue-500'
                    },
                    purple: {
                      selected: 'from-purple-500/20 to-purple-600/10 border-purple-500 shadow-purple-500/20',
                      selectedText: 'text-purple-400',
                      selectedBg: 'bg-purple-500/20',
                      checkmark: 'bg-purple-500'
                    },
                    green: {
                      selected: 'from-green-500/20 to-green-600/10 border-green-500 shadow-green-500/20',
                      selectedText: 'text-green-400',
                      selectedBg: 'bg-green-500/20',
                      checkmark: 'bg-green-500'
                    },
                    orange: {
                      selected: 'from-orange-500/20 to-orange-600/10 border-orange-500 shadow-orange-500/20',
                      selectedText: 'text-orange-400',
                      selectedBg: 'bg-orange-500/20',
                      checkmark: 'bg-orange-500'
                    }
                  };
                  const colors = colorClasses[r.color];
                  
                  return (
                    <button 
                      type="button" 
                      key={r.id} 
                      onClick={()=>setRole(r.id)} 
                      className={`relative overflow-hidden rounded-xl p-6 text-left transition-all duration-300 ${
                        role===r.id 
                          ? `bg-gradient-to-br ${colors.selected} border-2 shadow-xl transform scale-[1.02]` 
                          : 'bg-gray-900/60 border-2 border-gray-800/80 hover:border-gray-700 hover:bg-gray-900/80'
                      }`}
                      style={{fontFamily: 'system-ui, -apple-system, sans-serif'}}
                    >
                      {role===r.id && (
                        <div className="absolute top-2 right-2">
                          <div className={`w-6 h-6 rounded-full ${colors.checkmark} flex items-center justify-center`}>
                            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                            </svg>
                          </div>
                        </div>
                      )}
                      <div className="flex items-start gap-4">
                        <div className={`w-14 h-14 rounded-xl flex items-center justify-center text-3xl transition-all ${
                          role===r.id ? colors.selectedBg : 'bg-gray-800/80'
                        }`}>
                          {r.emoji}
                        </div>
                        <div className="flex-1">
                          <div className={`font-bold text-xl mb-1.5 ${role===r.id ? colors.selectedText : 'text-white'}`} style={{letterSpacing: '-0.01em'}}>
                            {r.title}
                          </div>
                          <div className="text-gray-400 text-base leading-relaxed">
                            {r.desc}
                          </div>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
              <div className="mt-5 p-4 bg-gray-800/40 rounded-xl border border-gray-700/50">
                <div className="text-base text-gray-400 font-medium">
                  Selected Role: <span className={`font-bold text-lg ${
                    selected.color === 'blue' ? 'text-blue-400' :
                    selected.color === 'purple' ? 'text-purple-400' :
                    selected.color === 'green' ? 'text-green-400' :
                    'text-orange-400'
                  }`}>{selected.title}</span>
                </div>
              </div>
            </div>

            {(role === 'owner' || role === 'manager') && (
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-300 block">Select your franchise</label>
                <select 
                  className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all" 
                  value={teamId} 
                  onChange={(e)=>setTeamId(e.target.value)}
                  style={{fontSize: '15px', fontFamily: 'system-ui, -apple-system, sans-serif'}}
                >
                  <option value="">-- Select Team --</option>
                  {teams.map(t => (
                    <option key={t.Team_ID} value={t.Team_ID}>{t.Team_Name}</option>
                  ))}
                </select>
              </div>
            )}

            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4">
              <button 
                className={`w-full sm:w-auto px-8 py-3 rounded-lg font-bold text-base transition-all duration-300 ${isRegistering ? 'bg-gradient-to-r from-green-600 to-green-500 hover:from-green-500 hover:to-green-400 text-white shadow-lg shadow-green-500/30' : 'bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white shadow-lg shadow-blue-500/30'}`}
                type="submit" 
                disabled={loading}
                style={{fontFamily: 'system-ui, -apple-system, sans-serif'}}
              >
                {loading ? 'Please wait...' : (isRegistering ? 'Register' : 'Login')}
              </button>
              
              <div className="flex items-center gap-3">
                <span className="text-gray-400 text-base font-medium">
                  {isRegistering ? 'Already have an account?' : 'Need an account?'}
                </span>
                <button 
                  type="button" 
                  onClick={() => setIsRegistering(!isRegistering)}
                  className="px-5 py-2.5 rounded-lg bg-orange-500/10 border-2 border-orange-500/30 text-orange-400 font-bold text-base hover:bg-orange-500/20 hover:border-orange-500/50 transition-all duration-300"
                  style={{fontFamily: 'system-ui, -apple-system, sans-serif'}}
                >
                  {isRegistering ? 'Login' : 'Register'}
                </button>
              </div>
            </div>
          </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;

