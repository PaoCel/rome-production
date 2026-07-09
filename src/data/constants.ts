// Shared option lists and colour maps used across the app.

export const TASK_STATUSES = ['To do', 'In progress', 'Waiting', 'Blocked', 'Done'];
export const TASK_PRIORITIES = ['High', 'Medium', 'Low'];

export const SELECTION_STATUSES = [
  'Researching',
  'Longlist',
  'Shortlisted',
  'Selected',
  'Confirmed',
  'Rejected',
];

export const CASTING_STATUSES = [
  'Longlist',
  'Shortlisted',
  'Selected',
  'Confirmed',
  'Rejected',
];

export const BUDGET_STATUSES = ['Estimate only', 'Committed', 'Paid'];
export const PAYMENT_STATUSES = ['Not paid', 'Partially paid', 'Paid', 'Not needed'];

// Budget stage — the lifecycle of a real budget commitment (richer than BUDGET_STATUSES).
export const BUDGET_STAGES = ['Estimate only', 'Committed', 'Approved', 'Paid', 'Cancelled'];

// Master list of budget categories (from Excel 19_BUDGET_CATEGORIES).
export const BUDGET_CATEGORIES = [
  'Cast',
  'Location',
  'Permits',
  'Props / Wardrobe',
  'Crew',
  'Equipment',
  'Transport',
  'Catering',
  'Local production',
  'Insurance',
];

// Shared status vocabularies for the two-tier (requirement → option) model.
// One requirement list and one option list keeps the app simple to read.
export const REQUIREMENT_STATUSES = [
  'Researching',
  'To source',
  'Shortlisted',
  'Selected',
  'Confirmed',
  'On hold',
  'Done',
  'Cancelled',
];
export const OPTION_STATUSES = [
  'To source',
  'Longlist',
  'Shortlisted',
  'Selected',
  'Confirmed',
  'Unavailable',
  'Not selected',
];

export const AVAILABILITY_OPTIONS = ['To check', 'Available', 'Unavailable', 'TBC'];
export const PERMIT_STATUSES = [
  'Not checked',
  'Needed',
  'Requested',
  'Approved',
  'Rejected',
  'Not needed',
];
export const DEPARTMENTS = [
  'Production',
  'Locations',
  'Casting',
  'Crew',
  'Art/Props',
  'Wardrobe',
  'Producer',
  'Assistant Producer',
  'Camera',
  'Lighting',
];

export const PRODUCTION_AREAS = [
  'Insurance',
  'Permits',
  'Transport',
  'Catering',
  'Legal',
  'Supplier',
  'Other',
];

export const RISK_SEVERITIES = ['Critical', 'High', 'Medium', 'Low'];
export const RISK_PROBABILITIES = ['High', 'Medium', 'Low'];
export const RISK_STATUSES = ['Open', 'Monitoring', 'Resolved'];

export const DECISION_STATUSES = ['Needed', 'Pending', 'Decided'];

export const PERMIT_OPTIONS = ['Yes', 'No', 'TBD'];

export const CONTACT_TYPES = [
  'Location owner',
  'Talent / Agency',
  'Crew',
  'Supplier',
  'Insurance',
  'Authority',
  'Catering',
  'Transport',
  'Other',
];

// Tailwind classes for status / priority pills. Fallback is neutral grey.
export const PILL_COLORS: Record<string, string> = {
  // Priority
  High: 'bg-red-100 text-red-700 ring-red-600/20',
  Medium: 'bg-amber-100 text-amber-700 ring-amber-600/20',
  Low: 'bg-blue-100 text-blue-700 ring-blue-600/20',

  // Task status
  'To do': 'bg-slate-100 text-slate-700 ring-slate-600/20',
  'In progress': 'bg-indigo-100 text-indigo-700 ring-indigo-600/20',
  Waiting: 'bg-amber-100 text-amber-700 ring-amber-600/20',
  Blocked: 'bg-red-100 text-red-700 ring-red-600/20',
  Done: 'bg-emerald-100 text-emerald-700 ring-emerald-600/20',

  // Selection status
  Researching: 'bg-slate-100 text-slate-700 ring-slate-600/20',
  Longlist: 'bg-blue-100 text-blue-700 ring-blue-600/20',
  Shortlisted: 'bg-violet-100 text-violet-700 ring-violet-600/20',
  Selected: 'bg-emerald-100 text-emerald-700 ring-emerald-600/20',
  Confirmed: 'bg-emerald-100 text-emerald-800 ring-emerald-600/30',
  Rejected: 'bg-slate-200 text-slate-500 ring-slate-500/20',

  // Budget / payment / stage
  'Estimate only': 'bg-slate-100 text-slate-700 ring-slate-600/20',
  Committed: 'bg-amber-100 text-amber-700 ring-amber-600/20',
  Approved: 'bg-teal-100 text-teal-700 ring-teal-600/20',
  Paid: 'bg-emerald-100 text-emerald-700 ring-emerald-600/20',
  Cancelled: 'bg-slate-200 text-slate-500 ring-slate-500/20',
  'Not paid': 'bg-slate-100 text-slate-700 ring-slate-600/20',
  'Partially paid': 'bg-amber-100 text-amber-700 ring-amber-600/20',
  'Not needed': 'bg-slate-100 text-slate-500 ring-slate-500/20',

  // Two-tier statuses (requirement + option) & availability / permits
  'To source': 'bg-slate-100 text-slate-700 ring-slate-600/20',
  'On hold': 'bg-amber-100 text-amber-700 ring-amber-600/20',
  'Not selected': 'bg-slate-200 text-slate-500 ring-slate-500/20',
  Unavailable: 'bg-rose-100 text-rose-700 ring-rose-600/20',
  Available: 'bg-emerald-100 text-emerald-700 ring-emerald-600/20',
  'To check': 'bg-slate-100 text-slate-600 ring-slate-500/20',
  TBC: 'bg-slate-100 text-slate-600 ring-slate-500/20',
  'Not checked': 'bg-slate-100 text-slate-600 ring-slate-500/20',
  Requested: 'bg-blue-100 text-blue-700 ring-blue-600/20',

  // Risk
  Critical: 'bg-red-100 text-red-800 ring-red-600/30',
  Open: 'bg-red-100 text-red-700 ring-red-600/20',
  Monitoring: 'bg-amber-100 text-amber-700 ring-amber-600/20',
  Resolved: 'bg-emerald-100 text-emerald-700 ring-emerald-600/20',

  // Decision
  Needed: 'bg-red-100 text-red-700 ring-red-600/20',
  Pending: 'bg-amber-100 text-amber-700 ring-amber-600/20',
  Decided: 'bg-emerald-100 text-emerald-700 ring-emerald-600/20',
};

export const NEUTRAL_PILL = 'bg-slate-100 text-slate-600 ring-slate-500/20';

// Theme-aware pill tone per status value → maps to .pill-<tone> in index.css.
// Values not listed fall back to 'neutral'.
export type PillTone = 'crit' | 'warn' | 'good' | 'info' | 'violet' | 'neutral';
export const PILL_TONE: Record<string, PillTone> = {
  // Priority
  High: 'crit',
  Medium: 'warn',
  Low: 'info',
  // Task status
  'To do': 'neutral',
  'In progress': 'info',
  Waiting: 'warn',
  Blocked: 'crit',
  Done: 'good',
  // Selection / requirement / option
  Researching: 'neutral',
  Longlist: 'info',
  Shortlisted: 'violet',
  Selected: 'good',
  Confirmed: 'good',
  Rejected: 'neutral',
  'To source': 'neutral',
  'On hold': 'warn',
  'Not selected': 'neutral',
  Unavailable: 'crit',
  Available: 'good',
  'To check': 'neutral',
  TBC: 'neutral',
  'Not checked': 'neutral',
  Requested: 'info',
  // Budget / payment / stage
  'Estimate only': 'neutral',
  Committed: 'warn',
  Approved: 'good',
  Paid: 'good',
  Cancelled: 'neutral',
  'Not paid': 'neutral',
  'Partially paid': 'warn',
  'Not needed': 'neutral',
  // Risk
  Critical: 'crit',
  Open: 'crit',
  Monitoring: 'warn',
  Resolved: 'good',
  // Decision
  Needed: 'crit',
  Pending: 'warn',
  Decided: 'good',
  // Contact status
  Active: 'info',
  Preferred: 'good',
  Inactive: 'neutral',
};
