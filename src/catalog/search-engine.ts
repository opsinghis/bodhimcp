import type { Product, SearchFilters } from './types.js';
import { getCatalog } from './loader.js';

const COLLECTIONS = [
  'Pandora Moments',
  'Pandora ME',
  'Pandora Timeless',
  'Pandora Signature',
  'Pandora Disney',
] as const;

export function searchCatalog(filters: SearchFilters): Product[] {
  const {
    query,
    material,
    category,
    collection,
    minPrice,
    maxPrice,
    limit = 10,
  } = filters;

  const queryLower = query?.toLowerCase();
  const categoryLower = category?.toLowerCase();

  let results: Product[] = [];

  for (const p of getCatalog()) {
    // Material filter (exact match)
    if (material && p.material !== material) continue;

    // Collection filter (check category tags)
    if (collection && !p.category.some(c => c === collection)) continue;

    // Category filter (substring match on primary_category or category tags)
    if (categoryLower) {
      const inPrimary = p.primary_category.toLowerCase().includes(categoryLower);
      const inTags = p.category.some(c => c.toLowerCase().includes(categoryLower));
      if (!inPrimary && !inTags) continue;
    }

    // Price range filter
    if (minPrice != null && (p.price == null || p.price < minPrice)) continue;
    if (maxPrice != null && (p.price == null || p.price > maxPrice)) continue;

    // Text search (substring on name + description)
    if (queryLower) {
      const nameMatch = p.product_name.toLowerCase().includes(queryLower);
      const descMatch = p.description.toLowerCase().includes(queryLower);
      if (!nameMatch && !descMatch) continue;
    }

    results.push(p);
    if (results.length >= limit) break;
  }

  return results;
}

export function detectCollection(product: Product): string | null {
  for (const col of COLLECTIONS) {
    if (product.category.includes(col)) return col;
  }
  return null;
}
