import { useState } from 'react';
import { API_URL } from '../api';

export function useAuth() {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('token'));
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [authError, setAuthError] = useState('');

  const login = async (email: string, password: string) => {
    setAuthError('');
    try {
      const res = await fetch(`${API_URL}/auth/${authMode}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setAuthError(data.error || 'Something went wrong');
        return false;
      }
      localStorage.setItem('token', data.token);
      setToken(data.token);
      return true;
    } catch (err) {
      console.error(err);
      setAuthError('Network error');
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
  };

  return { token, authMode, setAuthMode, authError, login, logout };
}