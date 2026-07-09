import { useState, type FormEvent } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useSettings } from '../contexts/SettingsContext';

export default function LoginPage() {
  const { user, loading, login, register, loginWithGoogle } = useAuth();
  const { settings } = useSettings();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  if (!loading && user) return <Navigate to="/" replace />;

  async function submit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      if (mode === 'login') await login(email, password);
      else await register(email, password);
    } catch (err: any) {
      setError(friendlyError(err?.code || err?.message));
    } finally {
      setBusy(false);
    }
  }

  async function google() {
    setError('');
    setBusy(true);
    try {
      await loginWithGoogle();
    } catch (err: any) {
      setError(friendlyError(err?.code || err?.message));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex min-h-dvh items-center justify-center bg-surface-2 px-4 py-6">
      <div className="w-full max-w-sm">
        <div className="mb-6 text-center">
          <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-600 text-2xl shadow-sm">
            🎬
          </div>
          <h1 className="font-display text-2xl font-semibold text-ink">
            {settings.productionName}
          </h1>
          <p className="mt-0.5 text-xs font-medium uppercase tracking-wider text-accent-600">
            {settings.productionSubtitle}
          </p>
          <p className="mt-1 text-sm text-muted">Sign in to manage the production</p>
        </div>

        <div className="card p-6">
          <form onSubmit={submit} className="space-y-4">
            <div>
              <label className="label">Email</label>
              <input
                type="email"
                className="input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </div>
            <div>
              <label className="label">Password</label>
              <input
                type="password"
                className="input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
              />
            </div>

            {error && <p className="text-sm text-red-600">{error}</p>}

            <button type="submit" className="btn-primary w-full" disabled={busy}>
              {busy ? 'Please wait…' : mode === 'login' ? 'Sign in' : 'Create account'}
            </button>
          </form>

          <div className="my-4 flex items-center gap-3 text-xs text-faint">
            <span className="h-px flex-1 bg-line" />
            or
            <span className="h-px flex-1 bg-line" />
          </div>

          <button className="btn-secondary w-full" onClick={google} disabled={busy}>
            Continue with Google
          </button>

          <p className="mt-4 text-center text-sm text-muted">
            {mode === 'login' ? "Don't have an account?" : 'Already have an account?'}{' '}
            <button
              className="font-medium text-brand-600 hover:underline"
              onClick={() => {
                setMode(mode === 'login' ? 'register' : 'login');
                setError('');
              }}
            >
              {mode === 'login' ? 'Register' : 'Sign in'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}

function friendlyError(code = ''): string {
  if (code.includes('not-approved'))
    return 'This account is not approved yet. Ask an admin to grant access.';
  if (code.includes('invalid-credential') || code.includes('wrong-password'))
    return 'Incorrect email or password.';
  if (code.includes('user-not-found')) return 'No account found for this email.';
  if (code.includes('email-already-in-use')) return 'This email is already registered.';
  if (code.includes('weak-password')) return 'Password should be at least 6 characters.';
  if (code.includes('popup-closed')) return 'Google sign-in was cancelled.';
  return 'Something went wrong. Please try again.';
}
