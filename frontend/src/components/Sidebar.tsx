interface Props {
  activeView: 'applications' | 'resume';
  onNavigate: (view: 'applications' | 'resume') => void;
  onAddNew: () => void;
  applicationCount: number;
  userEmail: string;
  onLogout: () => void;
}

export function Sidebar({ activeView, onNavigate, onAddNew, applicationCount, userEmail, onLogout }: Props) {
  const navItemStyle = (active: boolean): React.CSSProperties => ({
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '10px 12px', borderRadius: 8, cursor: 'pointer',
    background: active ? 'rgba(139, 109, 214, 0.12)' : 'transparent',
    color: active ? '#a88fd6' : '#a8a3b0',
    fontSize: 14, fontWeight: 600, marginBottom: 2,
  });

  return (
    <>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 28, padding: '0 4px' }}>
        <img src="/goblin-logo.png" alt="Joblin" style={{ width: 32, height: 32, borderRadius: 8 }} />
        <div>
          <div style={{ fontSize: 15, fontWeight: 700 }}>Joblin</div>
          <div className="text-muted" style={{ fontSize: 11 }}>AI Tracker</div>
        </div>
      </div>

      <div className="text-muted" style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.05em', padding: '0 12px', marginBottom: 8 }}>
        NAVIGATION
      </div>

      <div onClick={() => onNavigate('applications')} style={navItemStyle(activeView === 'applications')}>
        <span>Applications</span>
        <span style={{ fontSize: 11, background: 'rgba(56,52,63,0.8)', padding: '1px 7px', borderRadius: 9999 }}>{applicationCount}</span>
      </div>

      <div onClick={onAddNew} style={navItemStyle(false)}>
        <span>+ Add Application</span>
      </div>

      <div onClick={() => onNavigate('resume')} style={navItemStyle(activeView === 'resume')}>
        <span>Resume</span>
      </div>

      <div style={{ marginTop: 'auto', paddingTop: 16, borderTop: '1px solid #38343f' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 4px' }}>
          <div style={{ width: 32, height: 32, borderRadius: 8, background: '#8b6dd6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700 }}>
            {userEmail[0]?.toUpperCase()}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 12, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{userEmail}</div>
          </div>
        </div>
        <button onClick={onLogout} className="btn-ghost" style={{ width: '100%', justifyContent: 'center', fontSize: 12, padding: '6px', marginTop: 8 }}>
          Log out
        </button>
      </div>
    </>
  );
}