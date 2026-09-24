import type { Application } from '../types';
import { ApplicationCard } from './ApplicationCard';

interface Props {
  applications: Application[];
  token: string | null;
}

export function ApplicationList({ applications, token }: Props) {
  if (applications.length === 0) {
    return (
      <div className="card" style={{ padding: 40, textAlign: 'center' }}>
        <div style={{ fontSize: 32, marginBottom: 8 }}>📭</div>
        <div className="text-muted" style={{ fontSize: 14 }}>No applications yet. Add your first one above.</div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {applications.map((app) => (
        <ApplicationCard key={app.id} app={app} token={token} />
      ))}
    </div>
  );
}