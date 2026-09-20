import { useEffect, useState } from 'react';
import './App.css';

const API_URL = 'http://localhost:4000';
const TEMP_USER_ID = '8577bda1-812c-4a43-a8ce-74c5816a2ad8';

interface Application {
  id: string;
  company: string;
  role: string;
  status: string;
  jobDescription?: string;
  notes?: string;
  dateApplied: string;
  skills: string[];
  seniority: string | null;
  salaryRange: string | null;
  remotePolicy: string | null;
  parseStatus: string;
}

interface SimilarApplication {
  id: string;
  company: string;
  role: string;
  status: string;
  similarity: number;
}

function App() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [company, setCompany] = useState('');
  const [role, setRole] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [loading, setLoading] = useState(false);

  // Track which application's "similar" panel is open, and its results
  const [openSimilarId, setOpenSimilarId] = useState<string | null>(null);
  const [similarResults, setSimilarResults] = useState<SimilarApplication[]>([]);
  const [similarLoading, setSimilarLoading] = useState(false);

  const fetchApplications = async () => {
    const res = await fetch(`${API_URL}/applications`);
    const data = await res.json();
    setApplications(data);
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  useEffect(() => {
    const hasPending = applications.some((app) => app.parseStatus === 'pending');
    if (!hasPending) return;
    const interval = setInterval(fetchApplications, 3000);
    return () => clearInterval(interval);
  }, [applications]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await fetch(`${API_URL}/applications`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ company, role, jobDescription, userId: TEMP_USER_ID }),
      });
      setCompany('');
      setRole('');
      setJobDescription('');
      await fetchApplications();
    } catch (err) {
      console.error(err);
      alert('Failed to add application');
    } finally {
      setLoading(false);
    }
  };

  const toggleSimilar = async (appId: string) => {
    // Clicking the same one again closes it
    if (openSimilarId === appId) {
      setOpenSimilarId(null);
      setSimilarResults([]);
      return;
    }

    setOpenSimilarId(appId);
    setSimilarLoading(true);
    try {
      const res = await fetch(`${API_URL}/applications/${appId}/similar`);
      const data = await res.json();
      setSimilarResults(data);
    } catch (err) {
      console.error(err);
      setSimilarResults([]);
    } finally {
      setSimilarLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 700, margin: '40px auto', fontFamily: 'sans-serif' }}>
      <h1>Joblin</h1>

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

      <h2>Your Applications</h2>
      {applications.length === 0 && <p>No applications yet.</p>}
      <ul style={{ listStyle: 'none', padding: 0 }}>
        {applications.map((app) => (
          <li key={app.id} style={{ border: '1px solid #ddd', borderRadius: 8, padding: 12, marginBottom: 8 }}>
            <div><strong>{app.role}</strong> at {app.company}</div>
            <div style={{ fontSize: 12, color: '#666', marginBottom: 8 }}>
              Status: {app.status} · Applied {new Date(app.dateApplied).toLocaleDateString()}
            </div>

            {app.parseStatus === 'pending' && (
              <div style={{ fontSize: 12, color: '#999', fontStyle: 'italic' }}>AI is analyzing this job description...</div>
            )}
            {app.parseStatus === 'failed' && (
              <div style={{ fontSize: 12, color: '#c0392b' }}>AI parsing failed for this one.</div>
            )}
            {app.parseStatus === 'done' && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, alignItems: 'center', marginBottom: 8 }}>
                {app.seniority && <span style={badgeStyle('#e8f0fe', '#1a56db')}>{app.seniority}</span>}
                {app.remotePolicy && <span style={badgeStyle('#e6f4ea', '#137333')}>{app.remotePolicy}</span>}
                {app.salaryRange && <span style={badgeStyle('#fef7e0', '#b06000')}>{app.salaryRange}</span>}
                {app.skills.map((skill) => (
                  <span key={skill} style={badgeStyle('#f1f3f4', '#3c4043')}>{skill}</span>
                ))}
              </div>
            )}

            {app.parseStatus === 'done' && (
              <button
                onClick={() => toggleSimilar(app.id)}
                style={{ fontSize: 12, padding: '4px 10px', cursor: 'pointer' }}
              >
                {openSimilarId === app.id ? 'Hide similar' : 'Show similar applications'}
              </button>
            )}

            {openSimilarId === app.id && (
              <div style={{ marginTop: 10, paddingTop: 10, borderTop: '1px solid #eee' }}>
                {similarLoading && <div style={{ fontSize: 12, color: '#999' }}>Finding similar applications...</div>}
                {!similarLoading && similarResults.length === 0 && (
                  <div style={{ fontSize: 12, color: '#999' }}>No similar applications yet.</div>
                )}
                {!similarLoading &&
                  similarResults.map((sim) => (
                    <div key={sim.id} style={{ fontSize: 13, padding: '4px 0', display: 'flex', justifyContent: 'space-between' }}>
                      <span>{sim.role} at {sim.company}</span>
                      <span style={{ color: '#666' }}>{(sim.similarity * 100).toFixed(0)}% similar</span>
                    </div>
                  ))}
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

function badgeStyle(bg: string, color: string): React.CSSProperties {
  return { background: bg, color, fontSize: 12, padding: '3px 8px', borderRadius: 12, fontWeight: 500 };
}

export default App;