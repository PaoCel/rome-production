import type { Section } from '../data/access';
import type { AppIconName } from '../components/icons/AppIcon';

export interface NavItem {
  to: string;
  label: string;
  icon: AppIconName;
  group: string;
  section: Section;
}

export const NAV_ITEMS: NavItem[] = [
  { to: '/', label: 'Dashboard', icon: 'dashboard', group: 'Overview', section: 'dashboard' },
  { to: '/tasks', label: 'Tasks', icon: 'tasks', group: 'Overview', section: 'tasks' },
  { to: '/budget', label: 'Budget', icon: 'budget', group: 'Overview', section: 'budget' },
  { to: '/invoices', label: 'Invoices', icon: 'invoices', group: 'Overview', section: 'invoices' },

  { to: '/locations', label: 'Locations', icon: 'locations', group: 'Pre-production', section: 'locations' },
  { to: '/casting', label: 'Casting', icon: 'casting', group: 'Pre-production', section: 'casting' },
  { to: '/crew', label: 'Crew', icon: 'crew', group: 'Pre-production', section: 'crew' },
  { to: '/props', label: 'Props & Wardrobe', icon: 'props', group: 'Pre-production', section: 'props' },
  { to: '/production', label: 'Production', icon: 'production', group: 'Pre-production', section: 'production' },

  { to: '/contacts', label: 'Contacts', icon: 'contacts', group: 'Resources', section: 'contacts' },
  { to: '/risks', label: 'Risks & Decisions', icon: 'risks', group: 'Resources', section: 'risks' },

  { to: '/settings', label: 'Settings', icon: 'settings', group: 'System', section: 'settings' },
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
