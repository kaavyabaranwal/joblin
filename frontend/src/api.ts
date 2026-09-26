export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

export function authHeaders(token: string | null): HeadersInit {
  return token ? { Authorization: `Bearer ${token}` } : {};
}