import { useState } from 'react';

interface Props {
  onSubmit: (company: string, role: string, jobDescription: string) => Promise<void>;
}

export function ApplicationForm({ onSubmit }: Props) {
  const [company, setCompany] = useState('');
  const [role, setRole] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSubmit(company, role, jobDescription);
      setCompany('');
      setRole('');
      setJobDescription('');
      setExpanded(false);
    } catch (err) {
      console.error(err);
      alert('Failed to add application');
    } finally {
      setLoading(false);
    }
  };

  if (!expanded) {
    return (
      <button
        onClick={() => setExpanded(true)}
        className="btn-primary"
        style={{ marginBottom: 24 }}
      >
        + Add Application
      </button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="card fade-in" style={{ padding: 20, marginBottom: 24, display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ fontSize: 16, fontWeight: 600, margin: 0 }}>New Application</h2>
        <button
          type="button"
          onClick={() => setExpanded(false)}
          style={{ background: 'none', border: 'none', color: '#a8a3b0', cursor: 'pointer', fontSize: 18, lineHeight: 1 }}
          aria-label="Close"
        >
          ×
        </button>
      </div>

      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
        <input
          placeholder="Company"
          value={company}
          onChange={(e) => setCompany(e.target.value)}
          required
          className="input-field"
          style={{ flex: '1 1 200px' }}
        />
        <input
          placeholder="Role"
          value={role}
          onChange={(e) => setRole(e.target.value)}
          required
          className="input-field"
          style={{ flex: '1 1 200px' }}
        />
      </div>

      <textarea
        placeholder="Paste the job description here — this powers AI parsing and semantic search"
        value={jobDescription}
        onChange={(e) => setJobDescription(e.target.value)}
        className="input-field"
        style={{ minHeight: 100, resize: 'vertical', fontFamily: 'Montserrat, sans-serif' }}
      />

      <button type="submit" disabled={loading} className="btn-primary" style={{ justifyContent: 'center', alignSelf: 'flex-start' }}>
        {loading ? 'Adding...' : 'Add Application'}
      </button>
    </form>
  );
}