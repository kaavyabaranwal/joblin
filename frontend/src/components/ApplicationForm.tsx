import { useState } from 'react';

interface Props {
  onSubmit: (company: string, role: string, jobDescription: string) => Promise<void>;
}

export function ApplicationForm({ onSubmit }: Props) {
  const [company, setCompany] = useState('');
  const [role, setRole] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSubmit(company, role, jobDescription);
      setCompany('');
      setRole('');
      setJobDescription('');
    } catch (err) {
      console.error(err);
      alert('Failed to add application');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ marginBottom: 32 }}>
      <div style={{ marginBottom: 8 }}>
        <input placeholder="Company" value={company} onChange={(e) => setCompany(e.target.value)} required style={{ width: '100%', padding: 8 }} />
      </div>
      <div style={{ marginBottom: 8 }}>
        <input placeholder="Role" value={role} onChange={(e) => setRole(e.target.value)} required style={{ width: '100%', padding: 8 }} />
      </div>
      <div style={{ marginBottom: 8 }}>
        <textarea placeholder="Job description" value={jobDescription} onChange={(e) => setJobDescription(e.target.value)} style={{ width: '100%', padding: 8, minHeight: 80 }} />
      </div>
      <button type="submit" disabled={loading}>{loading ? 'Adding...' : 'Add Application'}</button>
    </form>
  );
}