import { useState } from 'react';
import type { Application } from '../types';
import { ApplicationCard } from './ApplicationCard';

interface Props {
  applications: Application[];
  onSelect: (app: Application) => void;
}

const ALL_STATUSES = ['APPLIED', 'INTERVIEWING', 'OFFER', 'REJECTED', 'GHOSTED'];

export function ApplicationList({ applications, onSelect }: Props) {
  const [filter, setFilter] = useState<string>('ALL');
  const [sort, setSort] = useState<'date' | 'company'>('date');
  const [search, setSearch] = useState('');

  const filtered = applications
    .filter((a) => filter === 'ALL' || a.status === filter)
    .filter((a) => !search || a.company.toLowerCase().includes(search.toLowerCase()) || a.role.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => {
      if (sort === 'company') return a.company.localeCompare(b.company);
      return new Date(b.dateApplied).getTime() - new Date(a.dateApplied).getTime();
    });

  const counts: Record<string, number> = { ALL: applications.length };
  ALL_STATUSES.forEach((s) => { counts[s] = applications.filter((a) => a.status === s).length; });

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h2 style={{ fontSize: 18, fontWeight: 700, margin: 0 }}>Applications</h2>
          <p className="text-muted" style={{ fontSize: 13, margin: '4px 0 0' }}>{applications.length} total</p>
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <input className="input-field" type="text" placeholder="Search companies, roles..." value={search} onChange={(e) => setSearch(e.target.value)} style={{ width: 200, height: 36 }} />
          <select value={sort} onChange={(e) => setSort(e.target.value as typeof sort)} style={{ background: '#26232b', border: '1px solid #38343f', borderRadius: 8, color: '#a8a3b0', padding: '8px 12px', fontSize: 13, fontFamily: 'Montserrat, sans-serif', cursor: 'pointer', outline: 'none', height: 36 }}>
            <option value="date">Sort: Recent</option>
            <option value="company">Sort: Company</option>
          </select>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 2, marginBottom: 20, borderBottom: '1px solid #38343f', overflowX: 'auto' }}>
        {['ALL', ...ALL_STATUSES].map((s) => (
          <button key={s} onClick={() => setFilter(s)} style={{ padding: '8px 14px', background: 'none', border: 'none', borderBottom: `2px solid ${filter === s ? '#8b6dd6' : 'transparent'}`, color: filter === s ? '#8b6dd6' : '#a8a3b0', fontSize: 13, fontWeight: 600, fontFamily: 'Montserrat, sans-serif', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, marginBottom: -1, whiteSpace: 'nowrap' }}>
            {s === 'ALL' ? 'All' : s.charAt(0) + s.slice(1).toLowerCase()}
            {counts[s] > 0 && <span style={{ fontSize: 10, fontWeight: 700, padding: '1px 6px', borderRadius: 9999, background: filter === s ? 'rgba(139, 109, 214, 0.2)' : 'rgba(56, 52, 63, 0.8)', color: filter === s ? '#8b6dd6' : '#6b6575' }}>{counts[s]}</span>}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="card" style={{ padding: 40, textAlign: 'center' }}>
          <div style={{ fontSize: 32, marginBottom: 8 }}>👾</div>
          <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 4 }}>Nothing here yet</div>
          <div className="text-muted" style={{ fontSize: 13 }}>{search ? `No applications match "${search}"` : 'The goblin awaits your first application.'}</div>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 14 }}>
          {filtered.map((app) => (
            <ApplicationCard key={app.id} app={app} onClick={() => onSelect(app)} />
          ))}
        </div>
      )}

      {applications.length > 0 && (
        <div style={{ display: 'flex', gap: 20, alignItems: 'center', marginTop: 20, paddingTop: 16, borderTop: '1px solid #38343f', flexWrap: 'wrap' }}>
          {ALL_STATUSES.map((s) => (
            <div key={s} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span className="text-muted" style={{ fontSize: 11 }}>{s.charAt(0) + s.slice(1).toLowerCase()}</span>
              <span style={{ fontSize: 11, fontWeight: 700 }}>{counts[s] ?? 0}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}