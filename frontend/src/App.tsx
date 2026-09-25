import { useState } from 'react';
import './App.css';
import { useAuth } from './hooks/useAuth';
import { useApplications } from './hooks/useApplications';
import { useResume } from './hooks/useResume';
import { AuthForm } from './components/AuthForm';
import { ApplicationForm } from './components/ApplicationForm';
import { ApplicationList } from './components/ApplicationList';
import { Sidebar } from './components/Sidebar';
import { ResumePage } from './components/ResumePage';

function App() {
  const { token, authMode, setAuthMode, authError, login, logout } = useAuth();
  const { applications, addApplication } = useApplications(token, logout);
  const resume = useResume(token);
  const [view, setView] = useState<'applications' | 'resume'>('applications');
  const [showAddForm, setShowAddForm] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (!token) {
    return (
      <AuthForm
        authMode={authMode}
        authError={authError}
        onToggleMode={() => setAuthMode(authMode === 'login' ? 'signup' : 'login')}
        onSubmit={login}
      />
    );
  }

  const userEmail = localStorage.getItem('userEmail') || 'you';

  const navigate = (v: 'applications' | 'resume') => {
    setView(v);
    setSidebarOpen(false);
  };

  return (
    <div className="app-shell">
      {sidebarOpen && <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)} />}

      <div className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <Sidebar
          activeView={view}
          onNavigate={navigate}
          onAddNew={() => { navigate('applications'); setShowAddForm(true); }}
          applicationCount={applications.length}
          userEmail={userEmail}
          onLogout={logout}
        />
      </div>

      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
        <div className="mobile-topbar">
          <button onClick={() => setSidebarOpen(true)} style={{ background: 'none', border: 'none', color: '#fff', fontSize: 20, cursor: 'pointer', padding: 4 }} aria-label="Open menu">☰</button>
          <img src="/goblin-logo.png" alt="Joblin" style={{ width: 24, height: 24, borderRadius: 6 }} />
          <span style={{ fontWeight: 700, fontSize: 15 }}>Joblin</span>
        </div>

        <div className="main-content" style={{ flex: 1, padding: '28px 32px', minWidth: 0 }}>
          {view === 'applications' && (
            <>
              {!resume.loading && !resume.hasResume && (
                <div
                  className="card"
                  onClick={() => navigate('resume')}
                  style={{
                    padding: 14, marginBottom: 20, display: 'flex', alignItems: 'center',
                    justifyContent: 'space-between', cursor: 'pointer',
                    border: '1px solid rgba(139, 109, 214, 0.3)', background: 'rgba(139, 109, 214, 0.06)',
                  }}
                >
                  <span style={{ fontSize: 13 }}>
                    📄 Upload your resume to unlock AI resume-fit analysis on every application
                  </span>
                  <span className="text-accent" style={{ fontSize: 13, fontWeight: 600, whiteSpace: 'nowrap' }}>Upload →</span>
                </div>
              )}

              {showAddForm && (
                <div style={{ marginBottom: 20 }}>
                  <ApplicationForm onSubmit={async (c, r, jd) => { await addApplication(c, r, jd); setShowAddForm(false); }} />
                </div>
              )}
              <ApplicationList applications={applications} token={token} />
            </>
          )}
          {view === 'resume' && (
            <ResumePage
              resumeText={resume.resumeText}
              loading={resume.loading}
              uploading={resume.uploading}
              error={resume.error}
              onUpload={resume.uploadResume}
            />
          )}
        </div>
      </div>
    </div>
  );
}

export default App;