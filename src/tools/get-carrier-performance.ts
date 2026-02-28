import { z } from 'zod';
import { getCarrierPerformance } from '../shipments/search-engine';

export const getCarrierPerformanceSchema = {
  carrier: z
    .enum(['Royal Mail', 'DPD', 'Hermes/Evri', 'DHL', 'FedEx'])
    .optional()
    .describe('Filter to a specific carrier. Omit to get stats for all carriers.'),
};

export async function getCarrierPerformanceTool(params: { carrier?: string }) {
  const stats = getCarrierPerformance(params.carrier as any);

  if (stats.length === 0) {
    return {
      content: [
        {
          type: 'text' as const,
          text: JSON.stringify({
            error: 'No shipment data found for the specified carrier',
            carrier: params.carrier,
          }),
        },
      ],
    };
  }

  const totalShipments = stats.reduce((sum, s) => sum + s.total_shipments, 0);
  const totalDelivered = stats.reduce((sum, s) => sum + s.delivered, 0);
  const totalDelays = stats.reduce((sum, s) => sum + s.delay_count, 0);
  const totalExceptions = stats.reduce((sum, s) => sum + s.exception_count, 0);

  return {
    content: [
      {
        type: 'text' as const,
        text: JSON.stringify(
          {
            summary: {
              total_shipments: totalShipments,
              total_delivered: totalDelivered,
              total_delays: totalDelays,
              total_exceptions: totalExceptions,
            },
            carriers: stats,
          },
          null,
          2,
        ),
      },
    ],
  };
}
