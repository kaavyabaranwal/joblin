import type { Application } from '../types';
import { StatusBadge } from './StatusBadge';

interface Props {
  app: Application;
  onClick: () => void;
}

export function ApplicationCard({ app, onClick }: Props) {
  return (
    <div className="card card-hover fade-in" style={{ padding: 18 }} onClick={onClick}>
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
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: '#a8a3b0', fontStyle: 'italic' }}>
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#8b6dd6', display: 'inline-block', animation: 'pulse 1.2s ease-in-out infinite' }} />
          AI is analyzing this posting...
        </div>
      )}
      {app.parseStatus === 'failed' && (
        <div style={{ fontSize: 12, color: '#e08a8a' }}>AI parsing failed for this one.</div>
      )}
      {app.parseStatus === 'done' && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {app.seniority && <span className="skill-tag" style={{ background: 'rgba(139, 109, 214, 0.15)', color: '#a88fd6' }}>{app.seniority}</span>}
          {app.remotePolicy && <span className="skill-tag" style={{ background: 'rgba(74, 124, 92, 0.15)', color: '#6aad84' }}>{app.remotePolicy}</span>}
          {app.salaryRange && <span className="skill-tag" style={{ background: 'rgba(168, 143, 214, 0.1)', color: '#c9b3f0' }}>{app.salaryRange}</span>}
          {app.skills.slice(0, 4).map((skill) => (
            <span key={skill} className="skill-tag" style={{ background: '#1c1a20', border: '1px solid #38343f', color: '#a8a3b0' }}>{skill}</span>
          ))}
          {app.skills.length > 4 && <span className="text-muted" style={{ fontSize: 11, alignSelf: 'center' }}>+{app.skills.length - 4}</span>}
        </div>
      )}
    </div>
  );
}