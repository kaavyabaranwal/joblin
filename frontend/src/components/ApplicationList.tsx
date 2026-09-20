import type { Application } from '../types';
import { ApplicationCard } from './ApplicationCard';

interface Props {
  applications: Application[];
  token: string | null;
}

export function ApplicationList({ applications, token }: Props) {
  return (
    <>
      <h2>Your Applications</h2>
      {applications.length === 0 && <p>No applications yet.</p>}
      <ul style={{ listStyle: 'none', padding: 0 }}>
        {applications.map((app) => (
          <ApplicationCard key={app.id} app={app} token={token} />
        ))}
      </ul>
    </>
  );
}