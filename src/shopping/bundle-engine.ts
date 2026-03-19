import type { Product } from '../catalog/types';
import type { BundleRequest, Bundle, BundleItem, Occasion, Budget } from './types';
import { lookupById } from '../catalog/loader';
import { searchCatalog } from '../catalog/search-engine';

/** Complementary categories: given a category, what goes well with it */
const COMPLEMENTS: Record<string, string[]> = {
  Necklaces: ['Earrings', 'Bracelets', 'Rings'],
  Earrings: ['Necklaces', 'Rings', 'Bracelets'],
  Bracelets: ['Charms', 'Necklaces', 'Earrings'],
  Rings: ['Earrings', 'Necklaces', 'Bracelets'],
  Charms: ['Bracelets', 'Necklaces', 'Earrings'],
};

/** Default category sets for occasions */
const OCCASION_BUNDLES: Record<Occasion, string[]> = {
  birthday: ['Charms', 'Bracelets', 'Earrings'],
  anniversary: ['Necklaces', 'Earrings', 'Rings'],
  valentines: ['Necklaces', 'Earrings', 'Charms'],
  mothers_day: ['Necklaces', 'Earrings', 'Bracelets'],
  graduation: ['Necklaces', 'Rings'],
  self_treat: ['Rings', 'Earrings', 'Bracelets'],
};

const BUDGET_MAX: Record<Budget, number> = {
  under_50: 50,
  '50_to_100': 100,
  '100_to_200': 200,
  over_200: 500,
};

function productToBundleItem(product: Product, role: string): BundleItem {
  return {
    product_id: product.product_id,
    product_name: product.product_name,
    price: product.price,
    material: product.material,
    primary_category: product.primary_category,
    role,
  };
}

export function buildBundle(request: BundleRequest): Bundle {
  const { seedProductId, occasion, budget, size = 3 } = request;
  const targetSize = Math.min(Math.max(size, 2), 5);
  const maxBudget = budget ? BUDGET_MAX[budget] : undefined;

  const items: BundleItem[] = [];
  const usedCategories = new Set<string>();
  const usedIds = new Set<string>();
  let totalPrice = 0;

  // Per-item budget cap to distribute evenly
  const perItemMax = maxBudget ? Math.ceil(maxBudget / targetSize) * 1.5 : undefined;

  // Step 1: If seed product provided, use it as anchor
  let preferredMaterial: string | undefined;
  if (seedProductId) {
    const seed = lookupById(seedProductId);
    if (seed) {
      items.push(productToBundleItem(seed, 'anchor'));
      usedCategories.add(seed.primary_category);
      usedIds.add(seed.product_id);
      totalPrice += seed.price ?? 0;
      preferredMaterial = seed.material;
    }
  }

  // Step 2: Determine which categories to fill
  let targetCategories: string[];
  if (items.length > 0) {
    const anchorCat = items[0].primary_category;
    targetCategories = COMPLEMENTS[anchorCat] || ['Necklaces', 'Earrings', 'Bracelets'];
  } else if (occasion) {
    targetCategories = OCCASION_BUNDLES[occasion];
  } else {
    targetCategories = ['Necklaces', 'Earrings', 'Bracelets'];
  }

  // Step 3: Fill remaining slots
  for (const cat of targetCategories) {
    if (items.length >= targetSize) break;
    if (usedCategories.has(cat)) continue;

    const results = searchCatalog({
      category: cat,
      material: preferredMaterial,
      maxPrice: perItemMax,
      limit: 10,
    });

    // If material filter yields no results, try without it
    const pool = results.length > 0 ? results : searchCatalog({
      category: cat,
      maxPrice: perItemMax,
      limit: 10,
    });

    for (const product of pool) {
      if (usedIds.has(product.product_id)) continue;
      if (maxBudget && totalPrice + (product.price ?? 0) > maxBudget) continue;

      const role = items.length === 0 ? 'anchor' : items.length === targetSize - 1 ? 'accent' : 'complement';
      items.push(productToBundleItem(product, role));
      usedCategories.add(product.primary_category);
      usedIds.add(product.product_id);
      totalPrice += product.price ?? 0;
      break;
    }
  }

  // Step 4: If still under target size, fill from any category
  if (items.length < targetSize) {
    const fillResults = searchCatalog({
      maxPrice: perItemMax,
      limit: 30,
    });
    for (const product of fillResults) {
      if (items.length >= targetSize) break;
      if (usedIds.has(product.product_id)) continue;
      if (maxBudget && totalPrice + (product.price ?? 0) > maxBudget) continue;

      items.push(productToBundleItem(product, 'complement'));
      usedIds.add(product.product_id);
      totalPrice += product.price ?? 0;
    }
  }

  // Build savings narrative
  const savings_narrative = items.length >= 2
    ? `This curated ${items.length}-piece ${occasion ? occasion.replace('_', ' ') + ' ' : ''}gift set is valued at £${totalPrice.toFixed(2)}. Coordinated ${preferredMaterial || 'mixed material'} pieces that complement each other beautifully.`
    : 'Add more items to build a complete gift set.';

  return {
    items,
    total_price: Math.round(totalPrice * 100) / 100,
    item_count: items.length,
    occasion: occasion?.replace('_', ' '),
    savings_narrative,
  };
}
