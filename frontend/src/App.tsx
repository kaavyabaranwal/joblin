import { useEffect, useState } from 'react';
import './App.css';

const API_URL = 'http://localhost:4000';

// Temporary — until real auth exists, hardcode your test user's ID here
const TEMP_USER_ID = '8577bda1-812c-4a43-a8ce-74c5816a2ad8';

interface Application {
  id: string;
  company: string;
  role: string;
  status: string;
  jobDescription?: string;
  notes?: string;
  dateApplied: string;
}

function App() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [company, setCompany] = useState('');
  const [role, setRole] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [loading, setLoading] = useState(false);

  const fetchApplications = async () => {
    const res = await fetch(`${API_URL}/applications`);
    const data = await res.json();
    setApplications(data);
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await fetch(`${API_URL}/applications`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          company,
          role,
          jobDescription,
          userId: TEMP_USER_ID,
        }),
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

  return (
    <div style={{ maxWidth: 600, margin: '40px auto', fontFamily: 'sans-serif' }}>
      <h1>Joblin</h1>

      <form onSubmit={handleSubmit} style={{ marginBottom: 32 }}>
        <div style={{ marginBottom: 8 }}>
          <input
            placeholder="Company"
            value={company}
            onChange={(e) => setCompany(e.target.value)}
            required
            style={{ width: '100%', padding: 8 }}
          />
        </div>
        <div style={{ marginBottom: 8 }}>
          <input
            placeholder="Role"
            value={role}
            onChange={(e) => setRole(e.target.value)}
            required
            style={{ width: '100%', padding: 8 }}
          />
        </div>
        <div style={{ marginBottom: 8 }}>
          <textarea
            placeholder="Job description (optional)"
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
            style={{ width: '100%', padding: 8, minHeight: 80 }}
          />
        </div>
        <button type="submit" disabled={loading}>
          {loading ? 'Adding...' : 'Add Application'}
        </button>
      </form>

      <h2>Your Applications</h2>
      {applications.length === 0 && <p>No applications yet.</p>}
      <ul style={{ listStyle: 'none', padding: 0 }}>
        {applications.map((app) => (
          <li
            key={app.id}
            style={{
              border: '1px solid #ddd',
              borderRadius: 8,
              padding: 12,
              marginBottom: 8,
            }}
          >
            <strong>{app.role}</strong> at {app.company}
            <div style={{ fontSize: 12, color: '#666' }}>
              Status: {app.status} · Applied{' '}
              {new Date(app.dateApplied).toLocaleDateString()}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;