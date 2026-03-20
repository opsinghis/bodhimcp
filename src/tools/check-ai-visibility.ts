import { z } from 'zod';

export const checkAiVisibilitySchema = {
  queries: z
    .array(z.string())
    .min(1)
    .max(5)
    .describe('AI search queries to check (1–5 queries)'),
  productName: z.string().describe('Product name to look for in results'),
};

export async function checkAiVisibility(params: {
  queries: string[];
  productName: string;
}) {
  const { queries, productName } = params;
  const apiKey = process.env.SERPER_API_KEY;

  if (!apiKey) {
    return {
      content: [
        {
          type: 'text' as const,
          text: JSON.stringify({
            status: 'no_api_key',
            message:
              'AI visibility check requires the SERPER_API_KEY environment variable. Get a free key at https://serper.dev',
            queries: queries.map(q => ({
              query: q,
              brandMentioned: null,
              brandPosition: null,
              productNameFound: null,
              topResults: [],
            })),
          }),
        },
      ],
    };
  }

  try {
    const results = await Promise.all(
      queries.map(async query => {
        const searchRes = await fetch('https://google.serper.dev/search', {
          method: 'POST',
          headers: {
            'X-API-KEY': apiKey,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ q: query, num: 10 }),
        });

        if (!searchRes.ok) {
          return {
            query,
            error: `Serper API error: ${searchRes.status}`,
            brandMentioned: null,
            brandPosition: null,
            productNameFound: null,
            topResults: [],
          };
        }

        const searchData = await searchRes.json();
        const organic = searchData.organic || [];

        const brandResults = organic.filter(
          (r: any) =>
            r.title?.toLowerCase().includes(productName.toLowerCase()) ||
            r.link?.includes(productName.toLowerCase()),
        );

        const productNameLower = productName.toLowerCase();

        return {
          query,
          brandMentioned: brandResults.length > 0,
          brandPosition:
            brandResults.length > 0
              ? organic.indexOf(brandResults[0]) + 1
              : null,
          productNameFound: organic.some(
            (r: any) =>
              r.title?.toLowerCase().includes(productNameLower) ||
              r.snippet?.toLowerCase().includes(productNameLower),
          ),
          topResults: organic.slice(0, 5).map((r: any, i: number) => ({
            position: i + 1,
            title: r.title,
            url: r.link,
            isBrand: !!r.link?.includes(productName.toLowerCase()),
          })),
          aiOverview: searchData.answerBox || searchData.knowledgeGraph || null,
        };
      }),
    );

    return {
      content: [
        {
          type: 'text' as const,
          text: JSON.stringify({ productName, results }, null, 2),
        },
      ],
    };
  } catch (error) {
    return {
      content: [
        {
          type: 'text' as const,
          text: JSON.stringify({
            status: 'error',
            error: String(error),
          }),
        },
      ],
    };
  }
}
