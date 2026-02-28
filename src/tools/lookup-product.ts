import { z } from 'zod';
import { lookupById } from '../catalog/loader';

export const lookupProductSchema = {
  productId: z.string().describe('Pandora product ID, e.g. "142784C01" or "149591C00"'),
};

export async function lookupProduct({ productId }: { productId: string }) {
  const product = lookupById(productId);

  if (!product) {
    return {
      content: [
        {
          type: 'text' as const,
          text: JSON.stringify({
            error: 'Product not found',
            productId,
            suggestion: 'Check the product ID format. Examples: 142784C01, 149591C00, 150100',
          }),
        },
      ],
    };
  }

  return {
    content: [
      {
        type: 'text' as const,
        text: JSON.stringify(product, null, 2),
      },
    ],
  };
}
