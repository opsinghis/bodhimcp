import { z } from 'zod';
import { lookupByAnyIdentifier } from '../shipments/loader';

export const trackShipmentSchema = {
  identifier: z
    .string()
    .describe(
      'Shipment ID (e.g. "SHP-001"), order ID (e.g. "ORD-10001"), or tracking number (e.g. "RM123456789GB")',
    ),
};

export async function trackShipment({ identifier }: { identifier: string }) {
  const shipment = lookupByAnyIdentifier(identifier);

  if (!shipment) {
    return {
      content: [
        {
          type: 'text' as const,
          text: JSON.stringify({
            error: 'Shipment not found',
            identifier,
            suggestion:
              'Check the identifier format. Use a shipment ID (SHP-XXX), order ID (ORD-XXXXX), or tracking number.',
          }),
        },
      ],
    };
  }

  return {
    content: [
      {
        type: 'text' as const,
        text: JSON.stringify(shipment, null, 2),
      },
    ],
  };
}
