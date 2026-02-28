export type ShipmentStatus =
  | 'ordered'
  | 'picked'
  | 'dispatched'
  | 'in_transit'
  | 'out_for_delivery'
  | 'delivered'
  | 'delayed'
  | 'exception'
  | 'returned';

export type Carrier = 'Royal Mail' | 'DPD' | 'Hermes/Evri' | 'DHL' | 'FedEx';

export interface TrackingEvent {
  timestamp: string;
  status: string;
  location: string;
  description: string;
}

export interface ShipmentItem {
  product_id: string;
  product_name: string;
  quantity: number;
  price: number;
}

export interface ShipmentCustomer {
  name: string;
  email: string;
  phone: string;
}

export interface ShipmentAddress {
  line1: string;
  line2?: string;
  city: string;
  postcode: string;
  country: string;
}

export interface Shipment {
  shipment_id: string;
  order_id: string;
  tracking_number: string;
  status: ShipmentStatus;
  carrier: Carrier;
  customer: ShipmentCustomer;
  shipping_address: ShipmentAddress;
  delivery_address: ShipmentAddress;
  items: ShipmentItem[];
  dates: {
    ordered: string;
    shipped?: string;
    estimated_delivery?: string;
    actual_delivery?: string;
  };
  tracking_events: TrackingEvent[];
  flags: {
    gift: boolean;
    signature_required: boolean;
    insurance: boolean;
  };
  delay_reason?: string;
}

export interface ShipmentSearchFilters {
  status?: ShipmentStatus;
  carrier?: Carrier;
  customerEmail?: string;
  dateFrom?: string;
  dateTo?: string;
  flagGift?: boolean;
  flagSignatureRequired?: boolean;
  limit?: number;
}

export interface DelayedShipmentResult {
  shipment: Shipment;
  severity: 'critical' | 'high' | 'medium' | 'low';
  reason: string;
  days_overdue: number;
}

export interface CarrierStats {
  carrier: Carrier;
  total_shipments: number;
  delivered: number;
  on_time_rate: number;
  avg_transit_days: number;
  delay_count: number;
  exception_count: number;
}

export interface Notification {
  id: string;
  shipment_id: string;
  channel: 'email' | 'sms' | 'internal';
  audience: 'customer' | 'ops';
  message: string;
  timestamp: string;
  status: 'sent';
}
