import { z } from 'zod';

export const loadSessionSchema = {
  sessionId: z.string().describe('Session ID to load (e.g. sess-customer@example.com)'),
};

export async function loadSession(params: { sessionId: string }) {
  const { sessionId } = params;

  try {
    const { list, head } = await import('@vercel/blob');
    const filename = `sessions/${sessionId}.json`;

    // List blobs matching this session
    const { blobs } = await list({ prefix: filename, limit: 1 });

    if (blobs.length === 0) {
      return {
        content: [
          {
            type: 'text' as const,
            text: JSON.stringify({
              status: 'not_found',
              sessionId,
              message: 'No prior session found. This is a new conversation.',
              sessionData: null,
            }),
          },
        ],
      };
    }

    // Fetch the session data
    const blobMeta = await head(blobs[0].url);
    const response = await fetch(blobMeta.url);
    const sessionData = await response.json();

    return {
      content: [
        {
          type: 'text' as const,
          text: JSON.stringify({
            status: 'found',
            sessionId,
            sessionData,
          }),
        },
      ],
    };
  } catch {
    return {
      content: [
        {
          type: 'text' as const,
          text: JSON.stringify({
            status: 'not_found',
            sessionId,
            message:
              'Vercel Blob not configured or session not found. Treating as new conversation.',
            sessionData: null,
          }),
        },
      ],
    };
  }
}
