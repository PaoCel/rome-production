import { useEffect } from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { landingPath } from '../data/access';
import { useSettings } from '../contexts/SettingsContext';
import AppIcon from '../components/icons/AppIcon';

export default function InvitePage() {
  const { token } = useParams();
  const { user, access } = useAuth();
  const { settings } = useSettings();

  useEffect(() => {
    if (token) window.localStorage.setItem('pendingInviteToken', token);
  }, [token]);

  if (user && access.role !== 'none') return <Navigate to={landingPath(access)} replace />;

  return (
    <div className="flex min-h-dvh items-center justify-center px-4 py-8">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-card-hover">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-600">
          <AppIcon name="casting" className="h-14 w-14" />
        </div>
        <p className="section-label">{settings.productionSubtitle}</p>
        <h1 className="mt-2 font-display text-2xl font-semibold text-slate-900">
          You're invited to {settings.productionName}
        </h1>
        <p className="mt-2 text-sm leading-6 text-slate-500">
          Sign in or create an account with the invited email address. Your workspace will show only the categories shared with you.
        </p>
        <Link to="/login" className="btn-primary mt-5 w-full">
          Continue to sign in
        </Link>
      </div>
    </div>
  );
}
