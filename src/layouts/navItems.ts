export interface NavItem {
  to: string;
  label: string;
  icon: string;
}

export const NAV_ITEMS: NavItem[] = [
  { to: '/', label: 'Dashboard', icon: '📊' },
  { to: '/tasks', label: 'Tasks', icon: '✅' },
  { to: '/budget', label: 'Budget', icon: '💶' },
  { to: '/locations', label: 'Location Scouting', icon: '📍' },
  { to: '/casting', label: 'Casting', icon: '🎬' },
  { to: '/production', label: 'Production Options', icon: '📦' },
  { to: '/contacts', label: 'Contacts', icon: '📇' },
  { to: '/risks', label: 'Risks & Decisions', icon: '⚠️' },
];
