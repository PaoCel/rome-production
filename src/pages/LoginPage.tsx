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
    <div className="flex min-h-dvh items-center justify-center overflow-hidden px-4 py-6">
      <div className="grid w-full max-w-5xl overflow-hidden rounded-[2rem] border border-slate-200/80 bg-white shadow-card-hover lg:grid-cols-[1.1fr_0.9fr]">
        <div className="relative hidden min-h-[34rem] overflow-hidden bg-brand-700 p-8 text-white lg:block">
          <div className="absolute inset-0 opacity-30">
            <div className="absolute -left-20 -top-20 h-64 w-64 rounded-full bg-white/30 blur-3xl" />
            <div className="absolute bottom-8 right-4 h-80 w-80 rounded-full bg-accent-400/40 blur-3xl" />
          </div>
          <div className="relative flex h-full flex-col justify-between">
            <div>
              <div className="mb-6 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-white/15 text-2xl shadow-sm backdrop-blur">
                🎬
              </div>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-white/70">
                {settings.productionSubtitle}
              </p>
              <h1 className="mt-3 max-w-md font-display text-4xl font-semibold tracking-tight">
                {settings.productionName}
              </h1>
              <p className="mt-4 max-w-md text-sm leading-6 text-white/75">
                Produzione, budget, opzioni e task in un unico workspace condiviso.
              </p>
            </div>
            <div className="grid grid-cols-3 gap-3 text-sm">
              <div className="rounded-2xl bg-white/10 p-3 backdrop-blur">
                <div className="text-2xl font-semibold">1</div>
                <div className="text-white/65">project hub</div>
              </div>
              <div className="rounded-2xl bg-white/10 p-3 backdrop-blur">
                <div className="text-2xl font-semibold">live</div>
                <div className="text-white/65">sync Firebase</div>
              </div>
              <div className="rounded-2xl bg-white/10 p-3 backdrop-blur">
                <div className="text-2xl font-semibold">2</div>
                <div className="text-white/65">owners</div>
              </div>
            </div>
          </div>
        </div>

        <div className="w-full p-5 sm:p-8">
          <div className="mb-6 lg:hidden">
            <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-600 text-2xl shadow-sm">
              🎬
            </div>
            <h1 className="font-display text-2xl font-semibold text-slate-900">{settings.productionName}</h1>
            <p className="mt-0.5 text-xs font-medium uppercase tracking-wider text-accent-600">
              {settings.productionSubtitle}
            </p>
          </div>

          <div className="mb-5">
            <p className="section-label">Accesso workspace</p>
            <h2 className="mt-1 font-display text-2xl font-semibold text-slate-900">
              {mode === 'login' ? 'Bentornato' : 'Crea il tuo accesso'}
            </h2>
            <p className="mt-1 text-sm text-slate-500">Sign in to manage the production.</p>
          </div>

          <div className="card p-5 sm:p-6">
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

          <div className="my-4 flex items-center gap-3 text-xs text-slate-400">
            <span className="h-px flex-1 bg-slate-200" />
            or
            <span className="h-px flex-1 bg-slate-200" />
          </div>

          <button className="btn-secondary w-full" onClick={google} disabled={busy}>
            Continue with Google
          </button>

          <p className="mt-4 text-center text-sm text-slate-500">
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
