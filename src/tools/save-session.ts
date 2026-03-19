import { z } from 'zod';

export const saveSessionSchema = {
  sessionId: z.string().describe('Session ID (e.g. sess-customer@example.com)'),
  sessionData: z
    .object({
      session_id: z.string(),
      turn_number: z.number(),
      continue: z.boolean(),
      checkout_completed: z.boolean().optional(),
      updated_session: z.object({
        conversation_history: z.array(z.any()),
        cart: z.array(z.any()),
        accumulated_preferences: z.any(),
        products_viewed: z.array(z.string()),
        products_purchased: z.array(z.string()),
        last_intent: z.string().nullable(),
        last_agent_response_summary: z.string().nullable(),
      }),
    })
    .describe('The full session state to persist'),
};

export async function saveSession(params: {
  sessionId: string;
  sessionData: Record<string, unknown>;
}) {
  const { sessionId, sessionData } = params;
  const jsonContent = JSON.stringify(sessionData, null, 2);
  const timestamp = new Date().toISOString();

  try {
    const { put } = await import('@vercel/blob');
    const filename = `sessions/${sessionId}.json`;

    const blob = await put(filename, jsonContent, {
      access: 'public',
      contentType: 'application/json',
      addRandomSuffix: false,
    });

    return {
      content: [
        {
          type: 'text' as const,
          text: JSON.stringify({
            status: 'saved',
            sessionId,
            url: blob.url,
            size: jsonContent.length,
            timestamp,
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
            status: 'returned',
            message:
              'Vercel Blob not configured. Session data returned directly. Set BLOB_READ_WRITE_TOKEN to enable persistence.',
            sessionId,
            size: jsonContent.length,
            timestamp,
            sessionData,
          }),
        },
      ],
    };
  }
}
