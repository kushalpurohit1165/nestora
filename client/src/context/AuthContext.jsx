/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState } from 'react';
import api from '../api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  // Start from localStorage so the user stays logged in after a page refresh
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('nestora_user'));
    } catch {
      return null;
    }
  });

  const saveSession = (data) => {
    localStorage.setItem('nestora_token', data.token);
    localStorage.setItem('nestora_user', JSON.stringify(data.user));
    setUser(data.user);
  };

  const login = async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password });
    saveSession(data);
    return data.user;
  };

  const register = async (form) => {
    const { data } = await api.post('/auth/register', form);
    saveSession(data);
    return data.user;
  };

  const logout = () => {
    localStorage.removeItem('nestora_token');
    localStorage.removeItem('nestora_user');
    setUser(null);
  };

  const value = {
    user,
    isLoggedIn: !!user,
    isWarden: user?.role === 'warden',
    login,
    register,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Custom hook:  const { user, login, logout } = useAuth();
export const useAuth = () => useContext(AuthContext);