import { z } from 'zod';
import { lookupByShipmentId } from '../shipments/loader';
import type { Notification } from '../shipments/types';

// In-memory notification log (session-scoped)
const notificationLog: Notification[] = [];
let notifCounter = 0;

export const notifyStakeholderSchema = {
  shipmentId: z.string().describe('Shipment ID (e.g. "SHP-001")'),
  channel: z.enum(['email', 'sms', 'internal']).describe('Notification channel'),
  audience: z.enum(['customer', 'ops']).describe('Target audience'),
  message: z.string().describe('Notification message content'),
};

export async function notifyStakeholder(params: {
  shipmentId: string;
  channel: string;
  audience: string;
  message: string;
}) {
  const shipment = lookupByShipmentId(params.shipmentId);

  if (!shipment) {
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

  notifCounter++;
  const notification: Notification = {
    id: `NOTIF-${String(notifCounter).padStart(4, '0')}`,
    shipment_id: params.shipmentId,
    channel: params.channel as Notification['channel'],
    audience: params.audience as Notification['audience'],
    message: params.message,
    timestamp: new Date().toISOString(),
    status: 'sent',
  };

  notificationLog.push(notification);

  const recipient =
    params.audience === 'customer'
      ? { name: shipment.customer.name, email: shipment.customer.email, phone: shipment.customer.phone }
      : { team: 'Operations', channel: 'ops-alerts' };

  return {
    content: [
      {
        type: 'text' as const,
        text: JSON.stringify(
          {
            status: 'sent',
            notification,
            recipient,
            shipment_summary: {
              shipment_id: shipment.shipment_id,
              order_id: shipment.order_id,
              status: shipment.status,
              carrier: shipment.carrier,
              is_gift: shipment.flags.gift,
            },
            note: 'This is a mock notification — no actual message was sent.',
          },
          null,
          2,
        ),
      },
    ],
  };
}
