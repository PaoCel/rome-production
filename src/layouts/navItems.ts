export interface NavItem {
  to: string;
  label: string;
  icon: string;
  group: string;
}

export const NAV_ITEMS: NavItem[] = [
  { to: '/', label: 'Dashboard', icon: '📊', group: 'Overview' },
  { to: '/tasks', label: 'Tasks', icon: '✅', group: 'Overview' },
  { to: '/budget', label: 'Budget', icon: '💶', group: 'Overview' },

  { to: '/locations', label: 'Locations', icon: '📍', group: 'Pre-production' },
  { to: '/casting', label: 'Casting', icon: '🎬', group: 'Pre-production' },
  { to: '/crew', label: 'Crew', icon: '🎥', group: 'Pre-production' },
  { to: '/props', label: 'Props & Wardrobe', icon: '🎭', group: 'Pre-production' },
  { to: '/production', label: 'Production', icon: '📦', group: 'Pre-production' },

  { to: '/contacts', label: 'Contacts', icon: '📇', group: 'Resources' },
  { to: '/risks', label: 'Risks & Decisions', icon: '⚠️', group: 'Resources' },

  { to: '/settings', label: 'Settings', icon: '⚙️', group: 'System' },
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
