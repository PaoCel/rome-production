// Shared types for the app.
// Entities are kept loose (index signature) so shared CRUD utilities and the
// schema-driven forms can work generically across every collection.

export type EntityDoc = {
  id: string;
  createdAt?: any;
  updatedAt?: any;
  [key: string]: any;
};

export type CollectionName =
  | 'tasks'
  | 'budgetItems'
  | 'locations'
  | 'castingCandidates'
  | 'castingVotes'
  | 'productionOptions'
  | 'risks'
  | 'decisions'
  | 'invoices'
  | 'invites'
  | 'media'
  | 'comments'
  // Two-tier (requirement → option) collections
  | 'locationRequirements'
  | 'locationOptions'
  | 'castRoles'
  | 'castingOptions'
  | 'crewRequirements'
  | 'crewOptions'
  | 'propItems'
  | 'propOptions';

export type RelatedType =
  | 'task'
  | 'location'
  | 'castingCandidate'
  | 'productionOption'
  | 'risk'
  | 'decision'
  | 'invoice'
  // Two-tier related types
  | 'locationRequirement'
  | 'locationOption'
  | 'castRole'
  | 'castingOption'
  | 'crewRequirement'
  | 'crewOption'
  | 'propItem'
  | 'propOption';

export type MediaType = 'image' | 'video' | 'document';

export interface Media extends EntityDoc {
  fileName: string;
  storagePath: string;
  downloadUrl: string;
  type: MediaType;
  posterStoragePath?: string;
  posterUrl?: string;
  isThumbnail?: boolean;
  relatedType: RelatedType;
  relatedId: string;
  uploadedBy?: string;
}

export interface Comment extends EntityDoc {
  relatedType: RelatedType;
  relatedId: string;
  text: string;
  authorName: string;
}

export interface Invite extends EntityDoc {
  email: string;
  emailLower: string;
  company?: string;
  token: string;
  sections: string[];
  status: 'active' | 'disabled';
  createdBy?: string;
}

// Field schema used by the generic EntityForm and detail panels.
export type FieldType =
  | 'text'
  | 'textarea'
  | 'number'
  | 'select'
  | 'checkbox'
  | 'date'
  | 'owner'
  | 'languages';

export interface LanguageEntry {
  language: string;
  level: string;
}

export interface FieldConfig {
  name: string;
  label: string;
  type: FieldType;
  options?: string[];
  placeholder?: string;
  full?: boolean; // span full width in the form grid
  hideInDetail?: boolean;
}
