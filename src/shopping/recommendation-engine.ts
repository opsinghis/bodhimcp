import type { Product } from '../catalog/types';
import type { RecommendationRequest, ScoredProduct, Budget, Occasion, Recipient, Style } from './types';
import { searchCatalog } from '../catalog/search-engine';

/** Map occasion + recipient to preferred categories */
const OCCASION_CATEGORIES: Record<Occasion, string[]> = {
  birthday: ['Charms', 'Bracelets', 'Rings', 'Necklaces'],
  anniversary: ['Rings', 'Necklaces', 'Earrings'],
  valentines: ['Charms', 'Necklaces', 'Rings', 'Bracelets'],
  mothers_day: ['Necklaces', 'Earrings', 'Bracelets', 'Charms'],
  graduation: ['Necklaces', 'Rings', 'Charms'],
  self_treat: ['Rings', 'Earrings', 'Bracelets', 'Necklaces'],
};

const RECIPIENT_CATEGORIES: Record<Recipient, string[]> = {
  her: ['Necklaces', 'Rings', 'Earrings', 'Bracelets', 'Charms'],
  him: ['Bracelets', 'Rings', 'Necklaces'],
  teen: ['Charms', 'Bracelets', 'Rings'],
  child: ['Charms', 'Bracelets'],
};

const STYLE_MATERIALS: Record<Style, string[]> = {
  classic: ['Sterling silver', 'Gold'],
  modern: ['Rose gold plated', 'Two-tone', 'Ruthenium plated'],
  bold: ['Gold', 'Gold plated', 'Two-tone', 'Tri-tone'],
  minimal: ['Sterling silver', 'Rose gold plated', 'White gold'],
};

const BUDGET_RANGES: Record<Budget, { min?: number; max?: number }> = {
  under_50: { max: 50 },
  '50_to_100': { min: 50, max: 100 },
  '100_to_200': { min: 100, max: 200 },
  over_200: { min: 200 },
};

export function getRecommendations(request: RecommendationRequest): ScoredProduct[] {
  const { occasion, recipient, style, budget, limit = 10 } = request;

  // Determine target categories
  let targetCategories: string[] = [];
  if (occasion) targetCategories.push(...OCCASION_CATEGORIES[occasion]);
  if (recipient) targetCategories.push(...RECIPIENT_CATEGORIES[recipient]);
  if (targetCategories.length === 0) {
    targetCategories = ['Necklaces', 'Rings', 'Earrings', 'Bracelets', 'Charms'];
  }
  // Deduplicate
  targetCategories = [...new Set(targetCategories)];

  // Determine price range
  const priceRange = budget ? BUDGET_RANGES[budget] : {};

  // Determine preferred materials
  const preferredMaterials = style ? STYLE_MATERIALS[style] : [];

  // Search across target categories, collect candidates
  const candidates: Map<string, { product: Product; score: number; reasons: string[] }> = new Map();

  for (const cat of targetCategories) {
    const results = searchCatalog({
      category: cat,
      minPrice: priceRange.min,
      maxPrice: priceRange.max,
      limit: 20,
    });

    for (const product of results) {
      if (candidates.has(product.product_id)) continue;

      let score = 0;
      const reasons: string[] = [];

      // Category relevance: boost if matches top categories
      const catIndex = targetCategories.indexOf(cat);
      if (catIndex !== -1) {
        score += (targetCategories.length - catIndex) * 10;
        reasons.push(`Matches ${occasion || recipient || 'general'} preference: ${cat}`);
      }

      // Material bonus
      if (preferredMaterials.length > 0 && preferredMaterials.includes(product.material)) {
        score += 15;
        reasons.push(`${style} style material: ${product.material}`);
      }

      // Price bonus (prefer mid-range within budget)
      if (product.price != null) {
        score += 5;
        if (budget === 'under_50' && product.price >= 20) score += 5;
        if (budget === '50_to_100' && product.price >= 60 && product.price <= 90) score += 5;
        if (budget === '100_to_200' && product.price >= 120 && product.price <= 180) score += 5;
      }

      candidates.set(product.product_id, { product, score, reasons });
    }
  }

  // Sort by score desc, take top N
  const sorted = [...candidates.values()]
    .sort((a, b) => b.score - a.score)
    .slice(0, Math.min(limit, 20));

  return sorted.map(({ product, score, reasons }) => ({
    product_id: product.product_id,
    product_name: product.product_name,
    price: product.price,
    material: product.material,
    primary_category: product.primary_category,
    relevance_score: score,
    reason: reasons[0] || 'General recommendation',
  }));
}
