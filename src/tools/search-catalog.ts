import { z } from 'zod';
import { searchCatalog as search } from '../catalog/search-engine';

export const searchCatalogSchema = {
  query: z.string().optional().describe('Text search across product name and description'),
  material: z
    .enum([
      'Gold',
      'Gold plated',
      'Grey',
      'No metal',
      'Rose gold plated',
      'Ruthenium plated',
      'Sterling silver',
      'Tri-tone',
      'Two-tone',
      'White gold',
    ])
    .optional()
    .describe('Filter by material'),
  category: z
    .string()
    .optional()
    .describe('Filter by category (e.g. "Charms", "Stackable Rings", "Stud Earrings")'),
  collection: z
    .enum([
      'Pandora Moments',
      'Pandora ME',
      'Pandora Timeless',
      'Pandora Signature',
      'Pandora Disney',
    ])
    .optional()
    .describe('Filter by Pandora collection'),
  minPrice: z.number().optional().describe('Minimum price in GBP'),
  maxPrice: z.number().optional().describe('Maximum price in GBP'),
  limit: z.number().int().min(1).max(50).default(10).describe('Max results to return (default 10)'),
};

export async function searchCatalog(params: {
  query?: string;
  material?: string;
  category?: string;
  collection?: string;
  minPrice?: number;
  maxPrice?: number;
  limit?: number;
}) {
  const results = search(params);

  return {
    content: [
      {
        type: 'text' as const,
        text: JSON.stringify(
          {
            totalResults: results.length,
            filters: {
              query: params.query || null,
              material: params.material || null,
              category: params.category || null,
              collection: params.collection || null,
              minPrice: params.minPrice ?? null,
              maxPrice: params.maxPrice ?? null,
            },
            products: results,
          },
          null,
          2,
        ),
      },
    ],
  };
}
