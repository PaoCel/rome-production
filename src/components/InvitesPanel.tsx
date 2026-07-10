import { useMemo, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { INVITABLE_SECTIONS, type Section } from '../data/access';
import { useCollection } from '../hooks/useCollection';
import { createInvite, setInviteStatus } from '../services/invites';
import type { EntityDoc } from '../types';

const SECTION_LABELS: Record<Section, string> = {
  dashboard: 'Dashboard',
  tasks: 'Tasks',
  budget: 'Budget',
  invoices: 'Invoices',
  locations: 'Locations',
  casting: 'Casting',
  crew: 'Crew',
  props: 'Props & Wardrobe',
  production: 'Production',
  contacts: 'Contacts',
  risks: 'Risks & Decisions',
  settings: 'Settings',
};

export default function InvitesPanel() {
  const { user } = useAuth();
  const { items: invites } = useCollection('invites');
  const [email, setEmail] = useState('');
  const [company, setCompany] = useState('');
  const [sections, setSections] = useState<Section[]>(['tasks', 'locations', 'casting']);
  const [busy, setBusy] = useState(false);
  const [copiedId, setCopiedId] = useState('');

  const sortedInvites = useMemo(
    () => [...invites].sort((a, b) => String(a.email).localeCompare(String(b.email))),
    [invites],
  );

  const toggleSection = (section: Section) => {
    setSections((prev) =>
      prev.includes(section) ? prev.filter((s) => s !== section) : [...prev, section],
    );
  };

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim() || sections.length === 0 || busy) return;
    setBusy(true);
    try {
      await createInvite({
        email,
        company,
        sections,
        createdBy: user?.email || undefined,
      });
      setEmail('');
      setCompany('');
      setSections(['tasks', 'locations', 'casting']);
    } finally {
      setBusy(false);
    }
  }

  async function copy(invite: EntityDoc) {
    const link = inviteLink(invite);
    await navigator.clipboard.writeText(link);
    setCopiedId(invite.id);
    window.setTimeout(() => setCopiedId(''), 1800);
  }

  return (
    <div className="space-y-5">
      <form onSubmit={submit} className="rounded-xl border border-slate-200 p-4">
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label className="label">Invite email</label>
            <input
              className="input"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="producer@example.com"
              required
            />
          </div>
          <div>
            <label className="label">Company / label</label>
            <input
              className="input"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              placeholder="Production company"
            />
          </div>
        </div>

        <div className="mt-4">
          <div className="mb-2 text-xs font-medium text-slate-500">Visible categories</div>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {INVITABLE_SECTIONS.map((section) => (
              <label
                key={section}
                className="flex cursor-pointer items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
              >
                <input
                  type="checkbox"
                  checked={sections.includes(section)}
                  onChange={() => toggleSection(section)}
                  className="h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-200"
                />
                {SECTION_LABELS[section]}
              </label>
            ))}
          </div>
        </div>

        <button className="btn-primary mt-4" disabled={busy || sections.length === 0}>
          {busy ? 'Creating...' : 'Create invite'}
        </button>
      </form>

      <div className="space-y-2">
        {sortedInvites.length === 0 ? (
          <p className="rounded-lg border border-dashed border-slate-200 py-5 text-center text-sm text-slate-400">
            No invites yet.
          </p>
        ) : (
          sortedInvites.map((invite) => (
            <div key={invite.id} className="rounded-xl border border-slate-200 p-3">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0">
                  <div className="break-words text-sm font-semibold text-slate-800">{invite.email}</div>
                  {invite.company && <div className="text-xs text-slate-400">{invite.company}</div>}
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {(invite.sections || []).map((section: Section) => (
                      <span key={section} className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-600">
                        {SECTION_LABELS[section] || section}
                      </span>
                    ))}
                  </div>
                  <div className="mt-2 truncate text-xs text-slate-400" title={inviteLink(invite)}>
                    {inviteLink(invite)}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 sm:flex sm:shrink-0">
                  <button type="button" className="btn-secondary px-2.5 py-1.5 text-xs" onClick={() => copy(invite)}>
                    {copiedId === invite.id ? 'Copied' : 'Copy link'}
                  </button>
                  <button
                    type="button"
                    className={invite.status === 'active' ? 'btn-danger px-2.5 py-1.5 text-xs' : 'btn-secondary px-2.5 py-1.5 text-xs'}
                    onClick={() => setInviteStatus(invite.id, invite.status === 'active' ? 'disabled' : 'active')}
                  >
                    {invite.status === 'active' ? 'Disable' : 'Enable'}
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function inviteLink(invite: EntityDoc) {
  return `${window.location.origin}/invite/${invite.token}`;
}
