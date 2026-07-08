import { createItem, findWhere, updateItem, where } from './firestore';
import type { EntityDoc } from '../types';

export type BudgetSourceType = 'location' | 'castingCandidate' | 'productionOption';

interface SourceConfig {
  category: string;
  nameField: string;
  estimateField: string;
  actualField: string;
}

const SOURCE_CONFIG: Record<BudgetSourceType, SourceConfig> = {
  location: {
    category: 'Locations',
    nameField: 'optionName',
    estimateField: 'costEstimate',
    actualField: 'actualCost',
  },
  castingCandidate: {
    category: 'Casting',
    nameField: 'candidateName',
    estimateField: 'feeEstimate',
    actualField: 'actualCost',
  },
  productionOption: {
    category: 'Production',
    nameField: 'optionSource',
    estimateField: 'costEstimate',
    actualField: 'actualCost',
  },
};

function paymentFromBudgetStatus(budgetStatus?: string) {
  if (budgetStatus === 'Paid') return 'Paid';
  return 'Not paid';
}

// Create or update a budget item derived from a selected entity.
// De-dups on sourceType + sourceId (updates the existing item instead).
export async function addToBudget(
  sourceType: BudgetSourceType,
  source: EntityDoc,
): Promise<'created' | 'updated'> {
  const cfg = SOURCE_CONFIG[sourceType];
  const budgetStatus = source.budgetStatus as string | undefined;

  const payload = {
    category: cfg.category,
    lineItem: source[cfg.nameField] || source.role || 'Untitled',
    estimatedCost: Number(source[cfg.estimateField]) || 0,
    actualCost: Number(source[cfg.actualField]) || 0,
    committed: budgetStatus === 'Committed' || budgetStatus === 'Paid',
    paymentStatus: paymentFromBudgetStatus(budgetStatus),
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
