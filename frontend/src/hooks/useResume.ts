import { useEffect, useState } from 'react';
import { API_URL, authHeaders } from '../api';

export function useResume(token: string | null) {
  const [resumeText, setResumeText] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  const fetchResume = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/user/resume`, { headers: authHeaders(token) });
      const data = await res.json();
      setResumeText(data.resumeText ?? null);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResume();
  }, [token]);

  const uploadResume = async (file: File) => {
    setUploading(true);
    setError('');
    try {
      const formData = new FormData();
      formData.append('resume', file);
      const res = await fetch(`${API_URL}/user/resume`, {
        method: 'POST',
        headers: authHeaders(token),
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Upload failed');
        return false;
      }
      await fetchResume();
      return true;
    } catch (err) {
      console.error(err);
      setError('Network error during upload');
      return false;
    } finally {
      setUploading(false);
    }
  };

  return { resumeText, loading, uploading, error, uploadResume, hasResume: !!resumeText };
}