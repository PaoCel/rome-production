// Per-user section access — the custom view layer.

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

export type AccessRole = 'owner' | 'invitee' | 'none';

export interface AccessProfile {
  role: AccessRole;
  sections: Section[];
}

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

export const INVITABLE_SECTIONS: Exclude<Section, 'dashboard' | 'settings'>[] = [
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
];

export const OWNER_EMAILS = [
  'paolocelestini23@gmail.com',
  'spaminutili24@gmail.com',
];

export const OWNER_PROFILE: AccessProfile = { role: 'owner', sections: ALL_SECTIONS };
export const NO_ACCESS_PROFILE: AccessProfile = { role: 'none', sections: [] };

export function isOwnerEmail(email?: string | null): boolean {
  if (!email) return false;
  return OWNER_EMAILS.includes(email.trim().toLowerCase());
}

export function sectionsFromInvite(sections: unknown): Section[] {
  if (!Array.isArray(sections)) return ['dashboard'];
  const allowed = sections.filter((s): s is Section =>
    typeof s === 'string' && INVITABLE_SECTIONS.includes(s as any),
  );
  return Array.from(new Set<Section>(['dashboard', ...allowed]));
}

export function canAccess(profile: AccessProfile | null | undefined, section: Section): boolean {
  return !!profile && profile.sections.includes(section);
}

// The path an email should land on (first section they can access).
export function landingPath(profile?: AccessProfile | null): string {
  const first = profile?.sections[0] || 'dashboard';
  return first === 'dashboard' ? '/' : `/${first}`;
}
