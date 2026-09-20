import { useState } from 'react';
import { API_URL, authHeaders } from '../api';
import type { Application, SimilarApplication } from '../types';

function badgeStyle(bg: string, color: string): React.CSSProperties {
  return { background: bg, color, fontSize: 12, padding: '3px 8px', borderRadius: 12, fontWeight: 500 };
}

interface Props {
  app: Application;
  token: string | null;
}

export function ApplicationCard({ app, token }: Props) {
  const [showSimilar, setShowSimilar] = useState(false);
  const [similarResults, setSimilarResults] = useState<SimilarApplication[]>([]);
  const [similarLoading, setSimilarLoading] = useState(false);

  const toggleSimilar = async () => {
    if (showSimilar) {
      setShowSimilar(false);
      return;
    }
    setShowSimilar(true);
    setSimilarLoading(true);
    try {
      const res = await fetch(`${API_URL}/applications/${app.id}/similar`, { headers: authHeaders(token) });
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
    <li style={{ border: '1px solid #ddd', borderRadius: 8, padding: 12, marginBottom: 8 }}>
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
        <button onClick={toggleSimilar} style={{ fontSize: 12, padding: '4px 10px', cursor: 'pointer' }}>
          {showSimilar ? 'Hide similar' : 'Show similar applications'}
        </button>
      )}

      {showSimilar && (
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
  );
}