import { z } from 'zod';

export const searchCompetitorSchema = {
  brand: z.string().describe('Competitor brand name, e.g. "Swarovski", "Tiffany"'),
  query: z.string().describe('Product or category to search for, e.g. "charm bracelet"'),
  maxResults: z
    .number()
    .int()
    .min(1)
    .max(5)
    .default(3)
    .describe('Number of competitor pages to fetch (default 3)'),
};

export async function searchCompetitorContent(params: {
  brand: string;
  query: string;
  maxResults?: number;
}) {
  const { brand, query, maxResults = 3 } = params;
  const apiKey = process.env.SERPER_API_KEY;

  if (!apiKey) {
    return {
      content: [
        {
          type: 'text' as const,
          text: JSON.stringify({
            status: 'no_api_key',
            brand,
            query,
            message:
              'Competitor search requires the SERPER_API_KEY environment variable. Get a free key at https://serper.dev',
            manualAction: `Search Google for: "${brand} ${query}" and analyze the top product pages manually.`,
          }),
        },
      ],
    };
  }

  try {
    // Step 1: Search for competitor pages
    const searchRes = await fetch('https://google.serper.dev/search', {
      method: 'POST',
      headers: {
        'X-API-KEY': apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ q: `${brand} ${query}`, num: maxResults }),
    });

    if (!searchRes.ok) {
      throw new Error(`Serper API error: ${searchRes.status} ${searchRes.statusText}`);
    }

    const searchData = await searchRes.json();
    const organic = searchData.organic || [];

    // Step 2: Extract content from top results using Jina Reader
    const pages = await Promise.all(
      organic.slice(0, maxResults).map(async (result: any) => {
        let extractedContent = '';
        try {
          const contentRes = await fetch(`https://r.jina.ai/${result.link}`, {
            headers: { Accept: 'text/plain' },
          });
          if (contentRes.ok) {
            const fullText = await contentRes.text();
            extractedContent = fullText.slice(0, 3000);
          }
        } catch {
          extractedContent = 'Failed to extract page content';
        }

        return {
          url: result.link,
          title: result.title,
          snippet: result.snippet,
          content: extractedContent,
        };
      }),
    );

    return {
      content: [
        {
          type: 'text' as const,
          text: JSON.stringify({ brand, query, pages }, null, 2),
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
            brand,
            query,
            error: String(error),
          }),
        },
      ],
    };
  }
}
