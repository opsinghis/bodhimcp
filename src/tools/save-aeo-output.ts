import { z } from 'zod';

export const saveAeoOutputSchema = {
  productId: z.string().describe('Product ID this AEO package is for'),
  aeoPackage: z
    .object({
      summary: z.string(),
      product: z.any(),
      schema: z.any().optional(),
      content: z.any().optional(),
      faqs: z.array(z.any()).optional(),
      competitorActions: z.array(z.any()).optional(),
      dataQualityBlockers: z.array(z.any()).optional(),
      implementationOrder: z.array(z.string()).optional(),
      scores: z
        .object({
          before: z.number(),
          projectedAfter: z.number(),
        })
        .optional(),
    })
    .describe('The complete AEO optimization package'),
};

export async function saveAeoOutput(params: {
  productId: string;
  aeoPackage: Record<string, unknown>;
}) {
  const { productId, aeoPackage } = params;
  const jsonContent = JSON.stringify(aeoPackage, null, 2);
  const timestamp = new Date().toISOString();

  // Try Vercel Blob if available
  try {
    const { put } = await import('@vercel/blob');
    const filename = `aeo/${productId}/${Date.now()}.json`;

    const blob = await put(filename, jsonContent, {
      access: 'public',
      contentType: 'application/json',
    });

    return {
      content: [
        {
          type: 'text' as const,
          text: JSON.stringify({
            status: 'saved',
            productId,
            url: blob.url,
            size: jsonContent.length,
            timestamp,
          }),
        },
      ],
    };
  } catch {
    // Fallback: return the package directly so the calling agent still has the data
    return {
      content: [
        {
          type: 'text' as const,
          text: JSON.stringify({
            status: 'returned',
            message:
              'Vercel Blob not configured. AEO package returned directly. Set BLOB_READ_WRITE_TOKEN to enable persistence.',
            productId,
            size: jsonContent.length,
            timestamp,
            aeoPackage,
          }),
        },
      ],
    };
  }
}
