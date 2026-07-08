// Per-user section access — the "custom view" layer.
//
// The email allowlist (approvedEmails.ts) controls WHO can log in.
// This controls WHAT each person sees once logged in: the team gets 'all',
// external collaborators get a limited set of sections.
//
// NOTE: this gates the UI (nav + routes). It hides sections from view but does
// not yet block a determined logged-in user from reading hidden data directly
// in Firestore. For hard data isolation against untrusted external people, a
// per-collection Firestore rules layer is the follow-up step.

export type Section =
  | 'dashboard'
  | 'tasks'
  | 'budget'
  | 'invoices'
  | 'locations'
  | 'casting'
  | 'crew'
  | 'props'
  | 'production'
  | 'contacts'
  | 'risks'
  | 'settings';

// Full section list, in sidebar order (used to resolve the landing page).
export const ALL_SECTIONS: Section[] = [
  'dashboard',
  'tasks',
  'budget',
  'invoices',
  'locations',
  'casting',
  'crew',
  'props',
  'production',
  'contacts',
  'risks',
  'settings',
];

// email (lowercase) -> allowed sections, or 'all' for the full app.
// Add an external collaborator here with just the sections they should see,
// e.g. 'client@example.com': ['budget', 'invoices']. Then redeploy.
export const ACCESS: Record<string, Section[] | 'all'> = {
  'paolocelestini23@gmail.com': 'all',
  'spaminutili24@gmail.com': 'all',
};

// Sections an approved user gets if they are not listed in ACCESS above.
// Kept minimal so a new/unknown login can't see everything by default.
export const DEFAULT_SECTIONS: Section[] = ['dashboard'];

export function allowedSections(email?: string | null): Section[] {
  if (!email) return [];
  const entry = ACCESS[email.trim().toLowerCase()];
  if (entry === 'all') return ALL_SECTIONS;
  return entry ?? DEFAULT_SECTIONS;
}

export function canAccess(email: string | null | undefined, section: Section): boolean {
  return allowedSections(email).includes(section);
}

// The path an email should land on (first section they can access).
export function landingPath(email?: string | null): string {
  const first = allowedSections(email)[0] || 'dashboard';
  return first === 'dashboard' ? '/' : `/${first}`;
}
