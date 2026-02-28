import { z } from 'zod';
import { detectDelayedShipments } from '../shipments/search-engine';

export const detectDelayedShipmentsSchema = {
  includeAtRisk: z
    .boolean()
    .optional()
    .describe(
      'Include at-risk shipments (stale tracking, past estimated delivery). Default true.',
    ),
  severityThreshold: z
    .enum(['low', 'medium', 'high', 'critical'])
    .optional()
    .describe('Minimum severity to include. Default "low" (all).'),
};

export async function detectDelayedShipmentsTool(params: {
  includeAtRisk?: boolean;
  severityThreshold?: string;
}) {
  const results = detectDelayedShipments(
    params.includeAtRisk ?? true,
    (params.severityThreshold as any) ?? 'low',
  );

  const bySeverity = {
    critical: results.filter(r => r.severity === 'critical').length,
    high: results.filter(r => r.severity === 'high').length,
    medium: results.filter(r => r.severity === 'medium').length,
    low: results.filter(r => r.severity === 'low').length,
  };

  return {
    content: [
      {
        type: 'text' as const,
        text: JSON.stringify(
          {
            total_flagged: results.length,
            by_severity: bySeverity,
            shipments: results.map(r => ({
              shipment_id: r.shipment.shipment_id,
              order_id: r.shipment.order_id,
              status: r.shipment.status,
              carrier: r.shipment.carrier,
              customer_name: r.shipment.customer.name,
              customer_email: r.shipment.customer.email,
              severity: r.severity,
              reason: r.reason,
              days_overdue: r.days_overdue,
              is_gift: r.shipment.flags.gift,
              estimated_delivery: r.shipment.dates.estimated_delivery,
              delay_reason: r.shipment.delay_reason,
            })),
          },
          null,
          2,
        ),
      },
    ],
  };
}
