import { z } from 'zod';
import { searchShipments as search } from '../shipments/search-engine';

export const searchShipmentsSchema = {
  status: z
    .enum([
      'ordered',
      'picked',
      'dispatched',
      'in_transit',
      'out_for_delivery',
      'delivered',
      'delayed',
      'exception',
      'returned',
    ])
    .optional()
    .describe('Filter by shipment status'),
  carrier: z
    .enum(['Royal Mail', 'DPD', 'Hermes/Evri', 'DHL', 'FedEx'])
    .optional()
    .describe('Filter by carrier name'),
  customerEmail: z.string().optional().describe('Filter by customer email address'),
  dateFrom: z.string().optional().describe('Filter orders placed on or after this date (YYYY-MM-DD)'),
  dateTo: z.string().optional().describe('Filter orders placed on or before this date (YYYY-MM-DD)'),
  flagGift: z.boolean().optional().describe('Filter by gift flag'),
  flagSignatureRequired: z.boolean().optional().describe('Filter by signature required flag'),
  limit: z.number().min(1).max(75).optional().describe('Max results to return (default 20)'),
};

export async function searchShipments(params: {
  status?: string;
  carrier?: string;
  customerEmail?: string;
  dateFrom?: string;
  dateTo?: string;
  flagGift?: boolean;
  flagSignatureRequired?: boolean;
  limit?: number;
}) {
  const results = search(params as any);

  return {
    content: [
      {
        type: 'text' as const,
        text: JSON.stringify(
          {
            totalResults: results.length,
            filters: Object.fromEntries(Object.entries(params).filter(([, v]) => v !== undefined)),
            shipments: results,
          },
          null,
          2,
        ),
      },
    ],
  };
}
