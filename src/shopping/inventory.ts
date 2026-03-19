import type { InventoryItem, InventoryStatus } from './types';

/**
 * Deterministic hash of a product ID to a number 0-99.
 * Same product_id always returns same result.
 */
function hashProductId(productId: string): number {
  let hash = 0;
  for (let i = 0; i < productId.length; i++) {
    const char = productId.charCodeAt(i);
    hash = ((hash << 5) - hash + char) | 0;
  }
  return Math.abs(hash) % 100;
}

/**
 * Deterministic mock inventory for a single product.
 * ~80% in_stock (qty 5-50), ~12% low_stock (qty 1-3), ~8% out_of_stock.
 */
export function getInventoryForProduct(productId: string): InventoryItem {
  const h = hashProductId(productId);

  let status: InventoryStatus;
  let quantity: number;
  let restock_date: string | undefined;

  if (h < 80) {
    // in_stock: quantity 5-50 based on hash
    status = 'in_stock';
    quantity = 5 + (h % 46); // 5..50
  } else if (h < 92) {
    // low_stock: quantity 1-3
    status = 'low_stock';
    quantity = 1 + (h % 3); // 1..3
  } else {
    // out_of_stock: restock in 5-14 days
    status = 'out_of_stock';
    quantity = 0;
    const restockDays = 5 + (h % 10); // 5..14
    const restockDate = new Date();
    restockDate.setDate(restockDate.getDate() + restockDays);
    restock_date = restockDate.toISOString().split('T')[0];
  }

  return { product_id: productId, status, quantity, restock_date };
}

/**
 * Check inventory for multiple products.
 */
export function checkInventoryBatch(productIds: string[]): InventoryItem[] {
  return productIds.map(getInventoryForProduct);
}
