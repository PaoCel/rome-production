import type { CollectionName, FieldConfig, RelatedType } from '../types';
import type { BudgetSourceType } from '../services/budget';
import {
  BUDGET_STATUSES,
  CASTING_STATUSES,
  CONTACT_TYPES,
  DECISION_STATUSES,
  PERMIT_OPTIONS,
  PRODUCTION_AREAS,
  RISK_PROBABILITIES,
  RISK_SEVERITIES,
  RISK_STATUSES,
  SELECTION_STATUSES,
} from './constants';

// Declarative config that drives the generic CRUD page, forms and detail panel.
export interface EntityConfig {
  collection: CollectionName;
  singular: string; // e.g. "Location"
  fields: FieldConfig[];
  titleField: string;
  subtitleFields?: string[];
  pillFields: string[]; // shown as status pills on cards + detail
  costField?: string; // estimate cost for money display
  filters: string[]; // field names used to build filter dropdowns
  relatedType?: RelatedType; // enables media / comments / related tasks
  media?: boolean;
  comments?: boolean;
  relatedTasks?: boolean;
  budgetSource?: BudgetSourceType; // enables "Add to budget"
  selectedField?: string; // boolean field marking selection
}

export const LOCATION_CONFIG: EntityConfig = {
  collection: 'locations',
  singular: 'Location',
  titleField: 'optionName',
  subtitleFields: ['requirement', 'address'],
  pillFields: ['status', 'budgetStatus', 'selected'],
  costField: 'costEstimate',
  filters: ['status', 'owner', 'permitNeeded', 'budgetStatus'],
  relatedType: 'location',
  media: true,
  comments: true,
  relatedTasks: true,
  budgetSource: 'location',
  selectedField: 'selected',
  fields: [
    { name: 'optionName', label: 'Option name', type: 'text', full: true },
    { name: 'requirement', label: 'Requirement', type: 'text' },
    { name: 'address', label: 'Address', type: 'text' },
    { name: 'contact', label: 'Contact', type: 'contact' },
    { name: 'availability', label: 'Availability', type: 'text' },
    { name: 'owner', label: 'Owner', type: 'owner' },
    { name: 'status', label: 'Status', type: 'select', options: SELECTION_STATUSES },
    { name: 'permitNeeded', label: 'Permit needed', type: 'select', options: PERMIT_OPTIONS },
    { name: 'permitStatus', label: 'Permit status', type: 'text' },
    { name: 'scoutingDate', label: 'Scouting date', type: 'date' },
    { name: 'costEstimate', label: 'Cost estimate', type: 'number' },
    { name: 'actualCost', label: 'Actual cost', type: 'number' },
    { name: 'budgetStatus', label: 'Budget status', type: 'select', options: BUDGET_STATUSES },
    { name: 'selected', label: 'Selected', type: 'checkbox' },
    { name: 'locationLink', label: 'Location link', type: 'text', full: true },
    { name: 'pros', label: 'Pros', type: 'textarea', full: true },
    { name: 'cons', label: 'Cons', type: 'textarea', full: true },
    { name: 'notes', label: 'Notes', type: 'textarea', full: true },
  ],
};

export const CASTING_CONFIG: EntityConfig = {
  collection: 'castingCandidates',
  singular: 'Candidate',
  titleField: 'candidateName',
  subtitleFields: ['role'],
  pillFields: ['status', 'budgetStatus', 'selected'],
  costField: 'feeEstimate',
  filters: ['status', 'owner', 'role', 'budgetStatus'],
  relatedType: 'castingCandidate',
  media: true,
  comments: true,
  relatedTasks: true,
  budgetSource: 'castingCandidate',
  selectedField: 'selected',
  fields: [
    { name: 'candidateName', label: 'Candidate name', type: 'text', full: true },
    { name: 'role', label: 'Role', type: 'text' },
    { name: 'contact', label: 'Contact', type: 'contact' },
    { name: 'availability', label: 'Availability', type: 'text' },
    { name: 'owner', label: 'Owner', type: 'owner' },
    { name: 'status', label: 'Status', type: 'select', options: CASTING_STATUSES },
    { name: 'feeEstimate', label: 'Fee estimate', type: 'number' },
    { name: 'actualCost', label: 'Actual cost', type: 'number' },
    { name: 'budgetStatus', label: 'Budget status', type: 'select', options: BUDGET_STATUSES },
    { name: 'selected', label: 'Selected', type: 'checkbox' },
    { name: 'reelLink', label: 'Reel link', type: 'text', full: true },
    { name: 'notes', label: 'Notes', type: 'textarea', full: true },
  ],
};

export const PRODUCTION_OPTION_CONFIG: EntityConfig = {
  collection: 'productionOptions',
  singular: 'Production option',
  titleField: 'optionSource',
  subtitleFields: ['area', 'requirement'],
  pillFields: ['area', 'status', 'budgetStatus', 'selected'],
  costField: 'costEstimate',
  filters: ['area', 'status', 'owner', 'budgetStatus'],
  relatedType: 'productionOption',
  media: true,
  comments: true,
  relatedTasks: true,
  budgetSource: 'productionOption',
  selectedField: 'selected',
  fields: [
    { name: 'optionSource', label: 'Option / supplier', type: 'text', full: true },
    { name: 'area', label: 'Area', type: 'select', options: PRODUCTION_AREAS },
    { name: 'requirement', label: 'Requirement', type: 'text' },
    { name: 'contact', label: 'Contact', type: 'contact' },
    { name: 'availability', label: 'Availability', type: 'text' },
    { name: 'owner', label: 'Owner', type: 'owner' },
    { name: 'status', label: 'Status', type: 'select', options: SELECTION_STATUSES },
    { name: 'costEstimate', label: 'Cost estimate', type: 'number' },
    { name: 'actualCost', label: 'Actual cost', type: 'number' },
    { name: 'budgetStatus', label: 'Budget status', type: 'select', options: BUDGET_STATUSES },
    { name: 'selected', label: 'Selected', type: 'checkbox' },
    { name: 'link', label: 'Link', type: 'text', full: true },
    { name: 'notes', label: 'Notes', type: 'textarea', full: true },
  ],
};

export const CONTACT_CONFIG: EntityConfig = {
  collection: 'contacts',
  singular: 'Contact',
  titleField: 'name',
  subtitleFields: ['type', 'contactPerson'],
  pillFields: ['type', 'status'],
  filters: ['type', 'status'],
  relatedType: 'contact',
  comments: true,
  fields: [
    { name: 'name', label: 'Name', type: 'text', full: true },
    { name: 'type', label: 'Type', type: 'select', options: CONTACT_TYPES },
    { name: 'contactPerson', label: 'Contact person', type: 'text' },
    { name: 'phone', label: 'Phone', type: 'text' },
    { name: 'email', label: 'Email', type: 'text' },
    { name: 'website', label: 'Website', type: 'text' },
    { name: 'status', label: 'Status', type: 'select', options: ['Active', 'Preferred', 'Inactive'] },
    { name: 'notes', label: 'Notes', type: 'textarea', full: true },
  ],
};

export const RISK_CONFIG: EntityConfig = {
  collection: 'risks',
  singular: 'Risk',
  titleField: 'title',
  subtitleFields: ['area'],
  pillFields: ['severity', 'probability', 'status'],
  filters: ['severity', 'status', 'owner'],
  relatedType: 'risk',
  comments: true,
  relatedTasks: true,
  fields: [
    { name: 'title', label: 'Title', type: 'text', full: true },
    { name: 'area', label: 'Area', type: 'text' },
    { name: 'owner', label: 'Owner', type: 'owner' },
    { name: 'severity', label: 'Severity', type: 'select', options: RISK_SEVERITIES },
    { name: 'probability', label: 'Probability', type: 'select', options: RISK_PROBABILITIES },
    { name: 'status', label: 'Status', type: 'select', options: RISK_STATUSES },
    { name: 'description', label: 'Description', type: 'textarea', full: true },
    { name: 'mitigation', label: 'Mitigation', type: 'textarea', full: true },
    { name: 'notes', label: 'Notes', type: 'textarea', full: true },
  ],
};

export const DECISION_CONFIG: EntityConfig = {
  collection: 'decisions',
  singular: 'Decision',
  titleField: 'title',
  pillFields: ['status'],
  filters: ['status', 'owner'],
  relatedType: 'decision',
  comments: true,
  relatedTasks: true,
  fields: [
    { name: 'title', label: 'Title', type: 'text', full: true },
    { name: 'owner', label: 'Owner', type: 'owner' },
    { name: 'deadline', label: 'Deadline', type: 'date' },
    { name: 'status', label: 'Status', type: 'select', options: DECISION_STATUSES },
    { name: 'description', label: 'Description', type: 'textarea', full: true },
    { name: 'impactOnBudget', label: 'Impact on budget', type: 'textarea', full: true },
    { name: 'impactOnSchedule', label: 'Impact on schedule', type: 'textarea', full: true },
    { name: 'notes', label: 'Notes', type: 'textarea', full: true },
  ],
};
