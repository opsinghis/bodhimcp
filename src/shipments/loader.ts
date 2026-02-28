import type { Shipment } from './types';

let shipments: Shipment[] | null = null;
let shipmentIdMap: Map<string, Shipment> | null = null;
let orderIdMap: Map<string, Shipment> | null = null;
let trackingNumberMap: Map<string, Shipment> | null = null;

function ensureLoaded(): Shipment[] {
  if (!shipments) {
    shipments = require('../../shipments.json') as Shipment[];
    shipmentIdMap = new Map();
    orderIdMap = new Map();
    trackingNumberMap = new Map();
    for (const s of shipments) {
      shipmentIdMap.set(s.shipment_id, s);
      orderIdMap.set(s.order_id, s);
      trackingNumberMap.set(s.tracking_number, s);
    }
  }
  return shipments;
}

export function getShipments(): Shipment[] {
  return ensureLoaded();
}

export function lookupByShipmentId(id: string): Shipment | undefined {
  ensureLoaded();
  return shipmentIdMap!.get(id);
}

export function lookupByOrderId(id: string): Shipment | undefined {
  ensureLoaded();
  return orderIdMap!.get(id);
}

export function lookupByTrackingNumber(tn: string): Shipment | undefined {
  ensureLoaded();
  return trackingNumberMap!.get(tn);
}

export function lookupByAnyIdentifier(identifier: string): Shipment | undefined {
  return (
    lookupByShipmentId(identifier) ||
    lookupByOrderId(identifier) ||
    lookupByTrackingNumber(identifier)
  );
}

/**
 * Apply an in-memory mutation to a shipment. Returns the updated shipment
 * or undefined if not found. Mutations persist for the server session only.
 */
export function mutateShipment(
  shipmentId: string,
  updater: (s: Shipment) => void,
): Shipment | undefined {
  const s = lookupByShipmentId(shipmentId);
  if (s) updater(s);
  return s;
}
