import type { CollectionName, EntityDoc, FieldConfig, RelatedType } from '../types';
import type { BudgetSourceType } from '../services/budget';
import {
  AVAILABILITY_OPTIONS,
  BUDGET_CATEGORIES,
  BUDGET_STAGES,
  BUDGET_STATUSES,
  INVOICE_STATUSES,
  DECISION_STATUSES,
  DEPARTMENTS,
  PERMIT_OPTIONS,
  PERMIT_STATUSES,
  PRODUCTION_AREAS,
  REQUIREMENT_STATUSES,
  RISK_PROBABILITIES,
  RISK_SEVERITIES,
  RISK_STATUSES,
  SELECTION_STATUSES,
  TASK_PRIORITIES,
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

  // Two-tier (requirement → option) support.
  optionConfig?: EntityConfig; // child options config; presence marks a requirement
  requirementLinkField?: string; // field on the option pointing to its requirement (default 'requirementId')
  selectedOptionField?: string; // field on the requirement holding the chosen option id (default 'selectedOptionId')
  multiRequirement?: boolean; // option can link to several requirements at once (requirementLinkField holds an array)
  emphasizeRequirement?: boolean; // show the linked requirement's name as the card heading instead of the option's own title
  layout?: 'grid' | 'list'; // OptionsGallery display: photo-first cards (default) or a compact scannable list
}

// Normalizes an option's requirement link (scalar or array) into a list of ids.
export function linkedRequirementIds(option: EntityDoc, optionConfig: EntityConfig): string[] {
  const field = optionConfig.requirementLinkField || 'requirementId';
  const raw = option[field];
  if (Array.isArray(raw)) return raw.filter(Boolean);
  if (typeof raw === 'string' && raw) return [raw];
  return [];
}

// ── Locations (two-tier: requirement → options) ──────────────────────────────

export const LOCATION_OPTION_CONFIG: EntityConfig = {
  collection: 'locationOptions',
  singular: 'Location option',
  titleField: 'optionName',
  subtitleFields: ['address'],
  pillFields: ['budgetStage', 'permitStatus'],
  costField: 'costEstimate',
  filters: ['budgetStage'],
  relatedType: 'locationOption',
  requirementLinkField: 'requirementId',
  media: true,
  comments: true,
  budgetSource: 'locationOption',
  fields: [
    { name: 'optionName', label: 'Option name', type: 'text', full: true },
    { name: 'address', label: 'Address', type: 'text' },
    { name: 'availability', label: 'Availability', type: 'select', options: AVAILABILITY_OPTIONS },
    { name: 'permitNeeded', label: 'Permit needed', type: 'select', options: PERMIT_OPTIONS },
    { name: 'permitStatus', label: 'Permit status', type: 'select', options: PERMIT_STATUSES },
    { name: 'costEstimate', label: 'Cost estimate', type: 'number' },
    { name: 'actualCost', label: 'Actual cost', type: 'number' },
    { name: 'budgetStage', label: 'Budget stage', type: 'select', options: BUDGET_STAGES },
    { name: 'link', label: 'Link', type: 'text', full: true },
    { name: 'notes', label: 'Notes', type: 'textarea', full: true },
  ],
};

export const LOCATION_REQ_CONFIG: EntityConfig = {
  collection: 'locationRequirements',
  singular: 'Location',
  titleField: 'requirement',
  subtitleFields: ['scenes', 'timeLook'],
  pillFields: ['priority', 'status'],
  costField: 'costEstimate',
  filters: ['status', 'owner', 'priority', 'permitNeed'],
  relatedType: 'locationRequirement',
  comments: true,
  relatedTasks: true,
  optionConfig: LOCATION_OPTION_CONFIG,
  selectedOptionField: 'selectedOptionId',
  fields: [
    { name: 'requirement', label: 'Location requirement', type: 'text', full: true },
    { name: 'scenes', label: 'Scene(s)', type: 'text' },
    { name: 'timeLook', label: 'Time / look', type: 'text' },
    { name: 'priority', label: 'Priority', type: 'select', options: TASK_PRIORITIES },
    { name: 'owner', label: 'Owner', type: 'owner' },
    { name: 'status', label: 'Status', type: 'select', options: REQUIREMENT_STATUSES },
    { name: 'permitNeed', label: 'Permit need', type: 'select', options: PERMIT_OPTIONS },
    { name: 'costEstimate', label: 'Cost estimate', type: 'number' },
    { name: 'actualCost', label: 'Actual cost', type: 'number' },
    { name: 'notes', label: 'Notes', type: 'textarea', full: true },
  ],
};

// ── Cast (two-tier: role/character → casting options) ────────────────────────

export const CASTING_OPTION_CONFIG: EntityConfig = {
  collection: 'castingOptions',
  singular: 'Casting option',
  titleField: 'candidateName',
  subtitleFields: ['age'],
  pillFields: ['budgetStage'],
  costField: 'feeEstimate',
  filters: ['budgetStage'],
  relatedType: 'castingOption',
  requirementLinkField: 'requirementId',
  media: true,
  comments: true,
  budgetSource: 'castingOption',
  fields: [
    { name: 'candidateName', label: 'Candidate name', type: 'text', full: true },
    { name: 'phone', label: 'Phone', type: 'text' },
    { name: 'email', label: 'Email', type: 'text' },
    { name: 'city', label: 'City', type: 'text' },
    { name: 'age', label: 'Age', type: 'text' },
    { name: 'description', label: 'Bio / description', type: 'textarea', full: true },
    { name: 'languages', label: 'Languages', type: 'languages', full: true },
    { name: 'availability', label: 'Availability', type: 'select', options: AVAILABILITY_OPTIONS },
    { name: 'feeEstimate', label: 'Fee estimate', type: 'number' },
    { name: 'travelNeeded', label: 'Travel needed', type: 'text' },
    { name: 'budgetStage', label: 'Budget stage', type: 'select', options: BUDGET_STAGES },
    { name: 'reelLink', label: 'Reel / link', type: 'text', full: true },
    { name: 'notes', label: 'Notes', type: 'textarea', full: true },
  ],
};

export const CAST_ROLE_CONFIG: EntityConfig = {
  collection: 'castRoles',
  singular: 'Role',
  titleField: 'role',
  subtitleFields: ['type', 'ageRange'],
  pillFields: ['type', 'status'],
  costField: 'feeEstimate',
  filters: ['status', 'type'],
  relatedType: 'castRole',
  comments: true,
  relatedTasks: true,
  optionConfig: CASTING_OPTION_CONFIG,
  selectedOptionField: 'selectedOptionId',
  fields: [
    { name: 'role', label: 'Role / character', type: 'text', full: true },
    { name: 'type', label: 'Type', type: 'text' },
    { name: 'qty', label: 'Qty', type: 'number' },
    { name: 'ageRange', label: 'Age range', type: 'text' },
    { name: 'gender', label: 'Gender', type: 'text' },
    { name: 'status', label: 'Casting status', type: 'select', options: REQUIREMENT_STATUSES },
    { name: 'feeEstimate', label: 'Fee estimate', type: 'number' },
    { name: 'actualFee', label: 'Actual fee', type: 'number' },
    { name: 'notes', label: 'Notes', type: 'textarea', full: true },
  ],
};

// ── Crew (two-tier: role → candidates) ────────────────────────────────────

export const CREW_OPTION_CONFIG: EntityConfig = {
  collection: 'crewOptions',
  singular: 'Crew option',
  titleField: 'candidateName',
  subtitleFields: ['role'],
  pillFields: ['budgetStage'],
  costField: 'feeEstimate',
  filters: ['budgetStage'],
  relatedType: 'crewOption',
  requirementLinkField: 'requirementIds',
  multiRequirement: true,
  layout: 'list',
  media: true,
  comments: true,
  budgetSource: 'crewOption',
  fields: [
    { name: 'candidateName', label: 'Candidate / supplier name', type: 'text', full: true },
    { name: 'role', label: 'Role', type: 'text' },
    { name: 'phone', label: 'Phone', type: 'text' },
    { name: 'email', label: 'Email', type: 'text' },
    { name: 'city', label: 'City', type: 'text' },
    { name: 'languages', label: 'Languages', type: 'languages', full: true },
    { name: 'availability', label: 'Availability', type: 'select', options: AVAILABILITY_OPTIONS },
    { name: 'feeEstimate', label: 'Fee estimate', type: 'number' },
    { name: 'travelNeeded', label: 'Travel needed', type: 'text' },
    { name: 'budgetStage', label: 'Budget stage', type: 'select', options: BUDGET_STAGES },
    { name: 'link', label: 'Link', type: 'text', full: true },
    { name: 'notes', label: 'Notes', type: 'textarea', full: true },
  ],
};

export const CREW_REQ_CONFIG: EntityConfig = {
  collection: 'crewRequirements',
  singular: 'Crew role',
  titleField: 'role',
  subtitleFields: ['department', 'neededFor'],
  pillFields: ['department', 'priority', 'status'],
  filters: ['department', 'status', 'priority'],
  relatedType: 'crewRequirement',
  comments: true,
  relatedTasks: true,
  optionConfig: CREW_OPTION_CONFIG,
  selectedOptionField: 'selectedOptionId',
  fields: [
    { name: 'role', label: 'Role', type: 'text', full: true },
    { name: 'department', label: 'Department', type: 'select', options: DEPARTMENTS },
    { name: 'qty', label: 'Qty', type: 'number' },
    { name: 'neededFor', label: 'Needed for', type: 'text' },
    { name: 'responsibilities', label: 'Responsibilities', type: 'textarea', full: true },
    { name: 'priority', label: 'Priority', type: 'select', options: TASK_PRIORITIES },
    { name: 'status', label: 'Status', type: 'select', options: REQUIREMENT_STATUSES },
    { name: 'owner', label: 'Owner', type: 'owner' },
    { name: 'notes', label: 'Notes', type: 'textarea', full: true },
  ],
};

// ── Props & Wardrobe (two-tier: item → sourcing options) ──────────────────

export const PROP_OPTION_CONFIG: EntityConfig = {
  collection: 'propOptions',
  singular: 'Prop source',
  titleField: 'optionSource',
  subtitleFields: ['supplier'],
  pillFields: ['budgetStage'],
  costField: 'costEstimate',
  filters: ['budgetStage'],
  relatedType: 'propOption',
  requirementLinkField: 'requirementId',
  emphasizeRequirement: true,
  media: true,
  comments: true,
  budgetSource: 'propOption',
  fields: [
    { name: 'optionSource', label: 'Option / source', type: 'text', full: true },
    { name: 'supplier', label: 'Owner / supplier', type: 'text' },
    { name: 'costEstimate', label: 'Cost estimate', type: 'number' },
    { name: 'actualCost', label: 'Actual cost', type: 'number' },
    { name: 'availability', label: 'Availability', type: 'select', options: AVAILABILITY_OPTIONS },
    { name: 'budgetStage', label: 'Budget stage', type: 'select', options: BUDGET_STAGES },
    { name: 'link', label: 'Link', type: 'text', full: true },
    { name: 'notes', label: 'Notes', type: 'textarea', full: true },
  ],
};

export const PROP_ITEM_CONFIG: EntityConfig = {
  collection: 'propItems',
  singular: 'Prop',
  titleField: 'item',
  subtitleFields: ['category', 'sceneUse'],
  pillFields: ['priority', 'status'],
  filters: ['status', 'priority'],
  relatedType: 'propItem',
  comments: true,
  relatedTasks: true,
  optionConfig: PROP_OPTION_CONFIG,
  selectedOptionField: 'selectedOptionId',
  fields: [
    { name: 'item', label: 'Item', type: 'text', full: true },
    { name: 'category', label: 'Category', type: 'text' },
    { name: 'sceneUse', label: 'Scene / use', type: 'text' },
    { name: 'priority', label: 'Priority', type: 'select', options: TASK_PRIORITIES },
    { name: 'owner', label: 'Owner', type: 'owner' },
    { name: 'status', label: 'Status', type: 'select', options: REQUIREMENT_STATUSES },
    { name: 'costEstimate', label: 'Estimated cost', type: 'number' },
    { name: 'actualCost', label: 'Actual cost', type: 'number' },
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

export const INVOICE_CONFIG: EntityConfig = {
  collection: 'invoices',
  singular: 'Invoice',
  titleField: 'vendor',
  subtitleFields: ['invoiceNumber', 'category'],
  pillFields: ['status', 'category'],
  costField: 'amount',
  filters: ['status', 'category'],
  relatedType: 'invoice',
  media: true,
  comments: true,
  fields: [
    { name: 'vendor', label: 'Vendor / supplier', type: 'text', full: true },
    { name: 'invoiceNumber', label: 'Invoice number', type: 'text' },
    { name: 'category', label: 'Category', type: 'select', options: BUDGET_CATEGORIES },
    { name: 'amount', label: 'Amount', type: 'number' },
    { name: 'status', label: 'Payment status', type: 'select', options: INVOICE_STATUSES },
    { name: 'issueDate', label: 'Issue date', type: 'date' },
    { name: 'dueDate', label: 'Due date', type: 'date' },
    { name: 'owner', label: 'Owner', type: 'owner' },
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
