import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const raw = localStorage.getItem('auth:user');
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    try {
      if (user) localStorage.setItem('auth:user', JSON.stringify(user));
      else localStorage.removeItem('auth:user');
    } catch {}
  }, [user]);

  const login = (username, role, team, token, userId) => {
    // Store token in localStorage for API requests
    if (token) {
      localStorage.setItem('auth:token', token);
    }
    setUser({ userId, username, role, team, token });
  };

  const logout = () => setUser(null);

  const value = useMemo(() => ({ user, login, logout }), [user]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
