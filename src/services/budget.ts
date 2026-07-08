import { createItem, findWhere, updateItem, where } from './firestore';
import type { EntityDoc } from '../types';

export type BudgetSourceType =
  | 'location'
  | 'castingCandidate'
  | 'productionOption'
  // Two-tier option sources
  | 'locationOption'
  | 'castingOption'
  | 'crewOption'
  | 'propOption';

interface SourceConfig {
  category: string;
  nameField: string;
  estimateField: string;
  actualField: string;
}

const SOURCE_CONFIG: Record<BudgetSourceType, SourceConfig> = {
  location: {
    category: 'Location',
    nameField: 'optionName',
    estimateField: 'costEstimate',
    actualField: 'actualCost',
  },
  castingCandidate: {
    category: 'Cast',
    nameField: 'candidateName',
    estimateField: 'feeEstimate',
    actualField: 'actualCost',
  },
  productionOption: {
    category: 'Local production',
    nameField: 'optionSource',
    estimateField: 'costEstimate',
    actualField: 'actualCost',
  },
  locationOption: {
    category: 'Location',
    nameField: 'optionName',
    estimateField: 'costEstimate',
    actualField: 'actualCost',
  },
  castingOption: {
    category: 'Cast',
    nameField: 'candidateName',
    estimateField: 'feeEstimate',
    actualField: 'actualCost',
  },
  crewOption: {
    category: 'Crew',
    nameField: 'candidateName',
    estimateField: 'feeEstimate',
    actualField: 'actualCost',
  },
  propOption: {
    category: 'Props / Wardrobe',
    nameField: 'optionSource',
    estimateField: 'costEstimate',
    actualField: 'actualCost',
  },
};

// Derive the committed flag / payment status from the option's budget stage
// (falls back to the older budgetStatus field for flat entities).
function paymentFromStage(stage?: string) {
  if (stage === 'Paid') return 'Paid';
  if (stage === 'Cancelled') return 'Not needed';
  return 'Not paid';
}

// Create or update a budget item derived from a selected entity / option.
// De-dups on sourceType + sourceId (updates the existing item instead).
export async function addToBudget(
  sourceType: BudgetSourceType,
  source: EntityDoc,
): Promise<'created' | 'updated'> {
  const cfg = SOURCE_CONFIG[sourceType];
  const stage = (source.budgetStage || source.budgetStatus) as string | undefined;

  const payload = {
    category: cfg.category,
    lineItem: source[cfg.nameField] || source.role || 'Untitled',
    estimatedCost: Number(source[cfg.estimateField]) || 0,
    actualCost: Number(source[cfg.actualField]) || 0,
    budgetStage: stage || 'Committed',
    committed: stage === 'Committed' || stage === 'Approved' || stage === 'Paid',
    paymentStatus: paymentFromStage(stage),
    supplierContact: source.contactName || '',
    sourceType,
    sourceId: source.id,
    notes: source.notes || '',
  };

  const existing = await findWhere(
    'budgetItems',
    where('sourceType', '==', sourceType),
    where('sourceId', '==', source.id),
  );

  if (existing.length > 0) {
    await updateItem('budgetItems', existing[0].id, payload);
    return 'updated';
  }

  await createItem('budgetItems', payload);
  return 'created';
}
