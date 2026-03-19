import { z } from 'zod';
import { getRecommendations } from '../shopping/recommendation-engine';

export const getProductRecommendationsSchema = {
  occasion: z
    .enum(['birthday', 'anniversary', 'valentines', 'mothers_day', 'graduation', 'self_treat'])
    .optional()
    .describe('Gift occasion'),
  recipient: z
    .enum(['her', 'him', 'teen', 'child'])
    .optional()
    .describe('Who the gift is for'),
  style: z
    .enum(['classic', 'modern', 'bold', 'minimal'])
    .optional()
    .describe('Preferred jewelry style'),
  budget: z
    .enum(['under_50', '50_to_100', '100_to_200', 'over_200'])
    .optional()
    .describe('Budget range in GBP'),
  limit: z
    .number()
    .min(1)
    .max(20)
    .optional()
    .describe('Max number of recommendations (default 10)'),
};

export async function getProductRecommendations(params: {
  occasion?: 'birthday' | 'anniversary' | 'valentines' | 'mothers_day' | 'graduation' | 'self_treat';
  recipient?: 'her' | 'him' | 'teen' | 'child';
  style?: 'classic' | 'modern' | 'bold' | 'minimal';
  budget?: 'under_50' | '50_to_100' | '100_to_200' | 'over_200';
  limit?: number;
}) {
  const recommendations = getRecommendations(params);

  return {
    content: [
      {
        type: 'text' as const,
        text: JSON.stringify(
          {
            recommendations,
            total: recommendations.length,
            filters: {
              occasion: params.occasion || 'any',
              recipient: params.recipient || 'any',
              style: params.style || 'any',
              budget: params.budget || 'any',
            },
          },
          null,
          2,
        ),
      },
    ],
  };
}
