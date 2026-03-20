import { z } from 'zod';
import { lookupById } from '../catalog/loader';
import { checkInventoryBatch } from '../shopping/inventory';

export const checkInventorySchema = {
  productIds: z
    .array(z.string())
    .min(1)
    .max(20)
    .describe('Array of 1-20 product IDs to check inventory for'),
};

export async function checkInventory(params: { productIds: string[] }) {
  const { productIds } = params;

  // Validate product IDs exist
  const notFound: string[] = [];
  const validIds: string[] = [];
  for (const id of productIds) {
    if (lookupById(id)) {
      validIds.push(id);
    } else {
      notFound.push(id);
    }
  }

  const inventory = checkInventoryBatch(validIds);

  const summary = {
    in_stock: inventory.filter(i => i.status === 'in_stock').length,
    low_stock: inventory.filter(i => i.status === 'low_stock').length,
    out_of_stock: inventory.filter(i => i.status === 'out_of_stock').length,
  };

  const result: Record<string, unknown> = {
    inventory,
    summary,
    checked: validIds.length,
  };

  if (notFound.length > 0) {
    result.not_found = notFound;
  }

  return {
    content: [
      {
        type: 'text' as const,
        text: JSON.stringify(result, null, 2),
      },
    ],
  };
}
