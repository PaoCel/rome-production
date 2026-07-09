import type { Section } from '../data/access';

export interface NavItem {
  to: string;
  label: string;
  icon: string;
  group: string;
  section: Section;
}

export const NAV_ITEMS: NavItem[] = [
  { to: '/', label: 'Dashboard', icon: '📊', group: 'Overview', section: 'dashboard' },
  { to: '/tasks', label: 'Tasks', icon: '✅', group: 'Overview', section: 'tasks' },
  { to: '/budget', label: 'Budget', icon: '💶', group: 'Overview', section: 'budget' },
  { to: '/invoices', label: 'Invoices', icon: '🧾', group: 'Overview', section: 'invoices' },

  { to: '/locations', label: 'Locations', icon: '📍', group: 'Pre-production', section: 'locations' },
  { to: '/casting', label: 'Casting', icon: '🎬', group: 'Pre-production', section: 'casting' },
  { to: '/crew', label: 'Crew', icon: '🎥', group: 'Pre-production', section: 'crew' },
  { to: '/props', label: 'Props & Wardrobe', icon: '🎭', group: 'Pre-production', section: 'props' },
  { to: '/production', label: 'Production', icon: '📦', group: 'Pre-production', section: 'production' },

  { to: '/contacts', label: 'Contacts', icon: '📇', group: 'Resources', section: 'contacts' },
  { to: '/risks', label: 'Risks & Decisions', icon: '⚠️', group: 'Resources', section: 'risks' },

  { to: '/settings', label: 'Settings', icon: '⚙️', group: 'System', section: 'settings' },
];

// Nav grouped by section, preserving order — used to render the sidebar.
export const NAV_GROUPS: { group: string; items: NavItem[] }[] = NAV_ITEMS.reduce(
  (acc, item) => {
    const last = acc[acc.length - 1];
    if (last && last.group === item.group) last.items.push(item);
    else acc.push({ group: item.group, items: [item] });
    return acc;
  },
  [] as { group: string; items: NavItem[] }[],
);
