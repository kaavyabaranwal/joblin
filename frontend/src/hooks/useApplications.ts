import { useEffect, useState } from 'react';
import { API_URL, authHeaders } from '../api';
import type { Application } from '../types';

export function useApplications(token: string | null, onUnauthorized: () => void) {
  const [applications, setApplications] = useState<Application[]>([]);

  const fetchApplications = async () => {
    if (!token) return;
    const res = await fetch(`${API_URL}/applications`, { headers: authHeaders(token) });
    if (res.status === 401) {
      onUnauthorized();
      return;
    }
    const data = await res.json();
    setApplications(data);
  };

  useEffect(() => {
    fetchApplications();
  }, [token]);

  useEffect(() => {
    const hasPending = applications.some((app) => app.parseStatus === 'pending');
    if (!hasPending) return;
    const interval = setInterval(fetchApplications, 3000);
    return () => clearInterval(interval);
  }, [applications]);

  const addApplication = async (company: string, role: string, jobDescription: string) => {
    await fetch(`${API_URL}/applications`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...authHeaders(token) },
      body: JSON.stringify({ company, role, jobDescription }),
    });
    await fetchApplications();
  };

  return { applications, addApplication, refetch: fetchApplications };
}