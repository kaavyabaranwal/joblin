import { useState } from 'react';
import { API_URL, authHeaders } from '../api';
import type { Application, SimilarApplication } from '../types';
import { StatusBadge } from './StatusBadge';

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
    <div className="card card-hover fade-in" style={{ padding: 18 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6, gap: 12, flexWrap: 'wrap' }}>
        <div>
          <div style={{ fontSize: 16, fontWeight: 600 }}>{app.role}</div>
          <div className="text-muted" style={{ fontSize: 13 }}>{app.company}</div>
        </div>
        <StatusBadge status={app.status} />
      </div>

      <div className="text-muted" style={{ fontSize: 12, marginBottom: 12 }}>
        Applied {new Date(app.dateApplied).toLocaleDateString()}
      </div>

      {app.parseStatus === 'pending' && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: '#a8a3b0', fontStyle: 'italic', marginBottom: 8 }}>
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#8b6dd6', display: 'inline-block', animation: 'pulse 1.2s ease-in-out infinite' }} />
          AI is analyzing this posting...
        </div>
      )}

      {app.parseStatus === 'failed' && (
        <div style={{ fontSize: 12, color: '#e08a8a', marginBottom: 8 }}>AI parsing failed for this one.</div>
      )}

      {app.parseStatus === 'done' && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 12 }}>
          {app.seniority && (
            <span className="skill-tag" style={{ background: 'rgba(139, 109, 214, 0.15)', color: '#a88fd6' }}>{app.seniority}</span>
          )}
          {app.remotePolicy && (
            <span className="skill-tag" style={{ background: 'rgba(74, 124, 92, 0.15)', color: '#6aad84' }}>{app.remotePolicy}</span>
          )}
          {app.salaryRange && (
            <span className="skill-tag" style={{ background: 'rgba(168, 143, 214, 0.1)', color: '#c9b3f0' }}>{app.salaryRange}</span>
          )}
          {app.skills.map((skill) => (
            <span key={skill} className="skill-tag" style={{ background: '#1c1a20', border: '1px solid #38343f', color: '#a8a3b0' }}>
              {skill}
            </span>
          ))}
        </div>
      )}

      {app.parseStatus === 'done' && (
        <button onClick={toggleSimilar} className="btn-ghost" style={{ fontSize: 12, padding: '6px 14px' }}>
          {showSimilar ? 'Hide similar' : 'Show similar applications'}
        </button>
      )}

      {showSimilar && (
        <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px solid #38343f' }}>
          {similarLoading && <div className="text-muted" style={{ fontSize: 12 }}>Finding similar applications...</div>}
          {!similarLoading && similarResults.length === 0 && (
            <div className="text-muted" style={{ fontSize: 12 }}>No similar applications yet.</div>
          )}
          {!similarLoading &&
            similarResults.map((sim) => (
              <div key={sim.id} style={{ fontSize: 13, padding: '6px 0', display: 'flex', justifyContent: 'space-between' }}>
                <span>{sim.role} at {sim.company}</span>
                <span className="text-accent" style={{ fontWeight: 600 }}>{(sim.similarity * 100).toFixed(0)}%</span>
              </div>
            ))}
        </div>
      )}
    </div>
  );
}