import { useState } from 'react';

interface Props {
  authMode: 'login' | 'signup';
  authError: string;
  onToggleMode: () => void;
  onSubmit: (email: string, password: string) => void;
}

export function AuthForm({ authMode, authError, onToggleMode, onSubmit }: Props) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(email, password);
    setEmail('');
    setPassword('');
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
      <div className="card fade-in" style={{ width: '100%', maxWidth: 380, padding: 36 }}>
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <img src="/goblin-logo.png" alt="Joblin" style={{ width: 56, height: 56, margin: '0 auto 12px', display: 'block', borderRadius: 12 }} />
          <h1 style={{ fontSize: 24, fontWeight: 700, margin: 0 }}>Joblin</h1>
          <p className="text-muted" style={{ fontSize: 13, marginTop: 4 }}>
            {authMode === 'login' ? 'Welcome back' : 'Track your job hunt smarter'}
          </p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="input-field"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="input-field"
          />
          {authError && (
            <div style={{ fontSize: 13, color: '#e08a8a', background: 'rgba(224, 138, 138, 0.1)', border: '1px solid rgba(224, 138, 138, 0.25)', borderRadius: 8, padding: '8px 12px' }}>
              {authError}
            </div>
          )}
          <button type="submit" className="btn-primary" style={{ justifyContent: 'center', marginTop: 4 }}>
            {authMode === 'login' ? 'Log in' : 'Sign up'}
          </button>
        </form>

        <button
          onClick={onToggleMode}
          style={{ background: 'none', border: 'none', color: '#8b6dd6', cursor: 'pointer', fontSize: 13, marginTop: 18, width: '100%', textAlign: 'center', fontFamily: 'Montserrat, sans-serif' }}
        >
          {authMode === 'login' ? "Don't have an account? Sign up" : 'Already have an account? Log in'}
        </button>
      </div>
    </div>
  );
}