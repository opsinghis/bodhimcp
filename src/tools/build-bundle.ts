import { z } from 'zod';
import { buildBundle } from '../shopping/bundle-engine';

export const buildBundleSchema = {
  seedProductId: z
    .string()
    .optional()
    .describe('Product ID to build the bundle around'),
  occasion: z
    .enum(['birthday', 'anniversary', 'valentines', 'mothers_day', 'graduation', 'self_treat'])
    .optional()
    .describe('Gift occasion to theme the bundle'),
  budget: z
    .enum(['under_50', '50_to_100', '100_to_200', 'over_200'])
    .optional()
    .describe('Total bundle budget in GBP'),
  size: z
    .number()
    .min(2)
    .max(5)
    .optional()
    .describe('Number of items in the bundle (default 3)'),
};

export async function buildBundleTool(params: {
  seedProductId?: string;
  occasion?: 'birthday' | 'anniversary' | 'valentines' | 'mothers_day' | 'graduation' | 'self_treat';
  budget?: 'under_50' | '50_to_100' | '100_to_200' | 'over_200';
  size?: number;
}) {
  if (!params.seedProductId && !params.occasion) {
    return {
      content: [
        {
          type: 'text' as const,
          text: JSON.stringify({
            error: 'Provide at least one of seedProductId or occasion to build a bundle',
          }),
        },
      ],
    };
  }

  const bundle = buildBundle(params);

  if (bundle.items.length === 0) {
    return {
      content: [
        {
          type: 'text' as const,
          text: JSON.stringify({
            error: 'Could not find products matching the criteria',
            params,
          }),
        },
      ],
    };
  }

  return {
    content: [
      {
        type: 'text' as const,
        text: JSON.stringify(bundle, null, 2),
      },
    ],
  };
}
