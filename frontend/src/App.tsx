import './App.css';
import { useAuth } from './hooks/useAuth';
import { useApplications } from './hooks/useApplications';
import { AuthForm } from './components/AuthForm';
import { ApplicationForm } from './components/ApplicationForm';
import { ApplicationList } from './components/ApplicationList';

function App() {
  const { token, authMode, setAuthMode, authError, login, logout } = useAuth();
  const { applications, addApplication } = useApplications(token, logout);

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

  return (
    <div style={{ maxWidth: 700, margin: '40px auto', fontFamily: 'sans-serif' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1>Joblin</h1>
        <button onClick={logout} style={{ fontSize: 13, cursor: 'pointer' }}>Log out</button>
      </div>
      <ApplicationForm onSubmit={addApplication} />
      <ApplicationList applications={applications} token={token} />
    </div>
  );
}

export default App;