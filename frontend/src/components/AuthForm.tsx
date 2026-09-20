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
    <div style={{ maxWidth: 360, margin: '80px auto', fontFamily: 'sans-serif' }}>
      <h1>Joblin</h1>
      <h2 style={{ fontSize: 18 }}>{authMode === 'login' ? 'Log in' : 'Sign up'}</h2>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: 8 }}>
          <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required style={{ width: '100%', padding: 8 }} />
        </div>
        <div style={{ marginBottom: 8 }}>
          <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required style={{ width: '100%', padding: 8 }} />
        </div>
        {authError && <div style={{ color: '#c0392b', fontSize: 13, marginBottom: 8 }}>{authError}</div>}
        <button type="submit" style={{ width: '100%', padding: 8 }}>
          {authMode === 'login' ? 'Log in' : 'Sign up'}
        </button>
      </form>
      <button onClick={onToggleMode} style={{ marginTop: 12, background: 'none', border: 'none', color: '#1a56db', cursor: 'pointer' }}>
        {authMode === 'login' ? "Don't have an account? Sign up" : 'Already have an account? Log in'}
      </button>
    </div>
  );
}