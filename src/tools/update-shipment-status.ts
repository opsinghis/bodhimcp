import { z } from 'zod';
import { lookupByShipmentId, mutateShipment } from '../shipments/loader';
import type { ShipmentStatus, TrackingEvent } from '../shipments/types';

const VALID_TRANSITIONS: Record<ShipmentStatus, ShipmentStatus[]> = {
  ordered: ['picked', 'dispatched'],
  picked: ['dispatched'],
  dispatched: ['in_transit'],
  in_transit: ['out_for_delivery', 'delivered', 'delayed', 'exception', 'returned'],
  out_for_delivery: ['delivered', 'exception', 'returned'],
  delivered: ['returned'],
  delayed: ['in_transit', 'out_for_delivery', 'delivered', 'exception', 'returned'],
  exception: ['in_transit', 'delayed', 'returned'],
  returned: [],
};

export const updateShipmentStatusSchema = {
  shipmentId: z.string().describe('Shipment ID (e.g. "SHP-001")'),
  newStatus: z
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
    .describe('New status for the shipment'),
  location: z.string().optional().describe('Location for the tracking event'),
  notes: z.string().optional().describe('Additional notes for the tracking event'),
};

export async function updateShipmentStatus(params: {
  shipmentId: string;
  newStatus: string;
  location?: string;
  notes?: string;
}) {
  const current = lookupByShipmentId(params.shipmentId);

  if (!current) {
    return {
      content: [
        {
          type: 'text' as const,
          text: JSON.stringify({
            error: 'Shipment not found',
            shipmentId: params.shipmentId,
          }),
        },
      ],
    };
  }

  const allowed = VALID_TRANSITIONS[current.status] || [];
  if (!allowed.includes(params.newStatus as ShipmentStatus)) {
    return {
      content: [
        {
          type: 'text' as const,
          text: JSON.stringify({
            error: 'Invalid status transition',
            current_status: current.status,
            requested_status: params.newStatus,
            allowed_transitions: allowed,
          }),
        },
      ],
    };
  }

  const newEvent: TrackingEvent = {
    timestamp: new Date().toISOString(),
    status: params.newStatus,
    location: params.location || current.delivery_address.city,
    description: params.notes || `Status updated to ${params.newStatus}`,
  };

  const updated = mutateShipment(params.shipmentId, s => {
    s.status = params.newStatus as ShipmentStatus;
    s.tracking_events.push(newEvent);

    if (params.newStatus === 'delivered') {
      s.dates.actual_delivery = new Date().toISOString().split('T')[0];
    }
    if (params.newStatus === 'dispatched' && !s.dates.shipped) {
      s.dates.shipped = new Date().toISOString().split('T')[0];
    }
  });

  return {
    content: [
      {
        type: 'text' as const,
        text: JSON.stringify(
          {
            status: 'updated',
            shipment: updated,
            new_event: newEvent,
            note: 'This is an in-memory update — it will reset on server restart.',
          },
          null,
          2,
        ),
      },
    ],
  };
}
