import { z } from 'zod';
import { lookupById } from '../catalog/loader';
import { detectCollection } from '../catalog/search-engine';
import type { ComparisonProduct, ComparisonResult } from '../shopping/types';

export const compareProductsSchema = {
  productIds: z
    .array(z.string())
    .min(2)
    .max(5)
    .describe('Array of 2-5 Pandora product IDs to compare'),
};

export async function compareProducts(params: { productIds: string[] }) {
  const { productIds } = params;

  const products: ComparisonProduct[] = [];
  const notFound: string[] = [];

  for (const id of productIds) {
    const product = lookupById(id);
    if (!product) {
      notFound.push(id);
      continue;
    }
    products.push({
      product_id: product.product_id,
      product_name: product.product_name,
      price: product.price,
      material: product.material,
      primary_category: product.primary_category,
      collection: detectCollection(product),
      categories: product.category,
    });
  }

  if (products.length < 2) {
    return {
      content: [
        {
          type: 'text' as const,
          text: JSON.stringify({
            error: 'Need at least 2 valid products to compare',
            found: products.length,
            not_found: notFound,
          }),
        },
      ],
    };
  }

  // Compute highlights
  const withPrice = products.filter(p => p.price != null);
  const cheapest = withPrice.length > 0
    ? withPrice.reduce((a, b) => (a.price! < b.price! ? a : b)).product_id
    : null;
  const mostPremium = withPrice.length > 0
    ? withPrice.reduce((a, b) => (a.price! > b.price! ? a : b)).product_id
    : null;

  const uniqueMaterials = [...new Set(products.map(p => p.material))];

  const result: ComparisonResult = {
    products,
    highlights: {
      cheapest,
      most_premium: mostPremium,
      material_differences: uniqueMaterials.length > 1,
      unique_materials: uniqueMaterials,
    },
    product_count: products.length,
  };

  if (notFound.length > 0) {
    return {
      content: [
        {
          type: 'text' as const,
          text: JSON.stringify({ ...result, not_found: notFound }, null, 2),
        },
      ],
    };
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
