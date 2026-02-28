import type { Shipment, ShipmentSearchFilters, DelayedShipmentResult, CarrierStats, Carrier } from './types';
import { getShipments } from './loader';

export function searchShipments(filters: ShipmentSearchFilters): Shipment[] {
  const { status, carrier, customerEmail, dateFrom, dateTo, flagGift, flagSignatureRequired, limit = 20 } = filters;
  const emailLower = customerEmail?.toLowerCase();

  const results: Shipment[] = [];

  for (const s of getShipments()) {
    if (status && s.status !== status) continue;
    if (carrier && s.carrier !== carrier) continue;
    if (emailLower && s.customer.email.toLowerCase() !== emailLower) continue;
    if (dateFrom && s.dates.ordered < dateFrom) continue;
    if (dateTo && s.dates.ordered > dateTo) continue;
    if (flagGift !== undefined && s.flags.gift !== flagGift) continue;
    if (flagSignatureRequired !== undefined && s.flags.signature_required !== flagSignatureRequired) continue;

    results.push(s);
    if (results.length >= limit) break;
  }

  return results;
}

export function detectDelayedShipments(
  includeAtRisk: boolean = true,
  severityThreshold: 'low' | 'medium' | 'high' | 'critical' = 'low',
): DelayedShipmentResult[] {
  const now = new Date('2026-02-28T12:00:00Z'); // Fixed reference for consistent results
  const results: DelayedShipmentResult[] = [];
  const severityOrder = { low: 0, medium: 1, high: 2, critical: 3 };

  for (const s of getShipments()) {
    let severity: DelayedShipmentResult['severity'] | null = null;
    let reason = '';
    let daysOverdue = 0;

    // Explicitly delayed shipments
    if (s.status === 'delayed') {
      const estimated = s.dates.estimated_delivery ? new Date(s.dates.estimated_delivery) : null;
      daysOverdue = estimated ? Math.max(0, Math.floor((now.getTime() - estimated.getTime()) / 86400000)) : 0;
      reason = s.delay_reason || 'Shipment marked as delayed';
      severity = s.flags.gift ? 'critical' : daysOverdue > 3 ? 'high' : 'medium';
    }

    // Exception shipments
    if (s.status === 'exception') {
      reason = s.delay_reason || 'Exception raised on shipment';
      severity = 'high';
      const estimated = s.dates.estimated_delivery ? new Date(s.dates.estimated_delivery) : null;
      daysOverdue = estimated ? Math.max(0, Math.floor((now.getTime() - estimated.getTime()) / 86400000)) : 0;
      // Lost parcels are critical
      if (s.delay_reason?.toLowerCase().includes('loss') || s.delay_reason?.toLowerCase().includes('lost')) {
        severity = 'critical';
      }
    }

    // At-risk detection: stale tracking (no update in 48h+ for in-transit shipments)
    if (includeAtRisk && s.status === 'in_transit' && s.tracking_events.length > 0) {
      const lastEvent = s.tracking_events[s.tracking_events.length - 1];
      const lastUpdate = new Date(lastEvent.timestamp);
      const hoursSinceUpdate = (now.getTime() - lastUpdate.getTime()) / 3600000;

      if (hoursSinceUpdate > 72) {
        severity = severity || 'high';
        reason = reason || `No tracking update for ${Math.floor(hoursSinceUpdate)} hours — possible stale tracking`;
        daysOverdue = Math.floor(hoursSinceUpdate / 24);
      } else if (hoursSinceUpdate > 48) {
        severity = severity || 'medium';
        reason = reason || `No tracking update for ${Math.floor(hoursSinceUpdate)} hours`;
        daysOverdue = Math.floor(hoursSinceUpdate / 24);
      }
    }

    // At-risk: estimated delivery date passed but not yet marked delayed
    if (includeAtRisk && s.status === 'in_transit' && s.dates.estimated_delivery && !severity) {
      const estimated = new Date(s.dates.estimated_delivery);
      if (now > estimated) {
        daysOverdue = Math.floor((now.getTime() - estimated.getTime()) / 86400000);
        severity = daysOverdue > 2 ? 'high' : 'medium';
        reason = `Estimated delivery date (${s.dates.estimated_delivery}) has passed by ${daysOverdue} day(s)`;
      }
    }

    if (severity && severityOrder[severity] >= severityOrder[severityThreshold]) {
      // Elevate gift orders
      if (s.flags.gift && severity !== 'critical') {
        const elevated = severityOrder[severity] + 1;
        severity = (['low', 'medium', 'high', 'critical'] as const)[Math.min(elevated, 3)];
        reason = `[GIFT ORDER] ${reason}`;
      }

      results.push({ shipment: s, severity, reason, days_overdue: daysOverdue });
    }
  }

  // Sort: critical first, then high, then medium, then low
  results.sort((a, b) => severityOrder[b.severity] - severityOrder[a.severity]);

  return results;
}

export function getCarrierPerformance(carrierFilter?: Carrier): CarrierStats[] {
  const statsMap = new Map<Carrier, {
    total: number;
    delivered: number;
    onTime: number;
    transitDaysSum: number;
    transitDaysCount: number;
    delays: number;
    exceptions: number;
  }>();

  for (const s of getShipments()) {
    if (carrierFilter && s.carrier !== carrierFilter) continue;

    let stats = statsMap.get(s.carrier);
    if (!stats) {
      stats = { total: 0, delivered: 0, onTime: 0, transitDaysSum: 0, transitDaysCount: 0, delays: 0, exceptions: 0 };
      statsMap.set(s.carrier, stats);
    }

    stats.total++;

    if (s.status === 'delivered') {
      stats.delivered++;
      if (s.dates.shipped && s.dates.actual_delivery) {
        const shipped = new Date(s.dates.shipped);
        const delivered = new Date(s.dates.actual_delivery);
        const transitDays = Math.max(0, Math.floor((delivered.getTime() - shipped.getTime()) / 86400000));
        stats.transitDaysSum += transitDays;
        stats.transitDaysCount++;
      }
      if (s.dates.estimated_delivery && s.dates.actual_delivery && s.dates.actual_delivery <= s.dates.estimated_delivery) {
        stats.onTime++;
      }
    }

    if (s.status === 'delayed') stats.delays++;
    if (s.status === 'exception') stats.exceptions++;
  }

  const results: CarrierStats[] = [];
  for (const [carrier, stats] of statsMap) {
    results.push({
      carrier,
      total_shipments: stats.total,
      delivered: stats.delivered,
      on_time_rate: stats.delivered > 0 ? Math.round((stats.onTime / stats.delivered) * 100) : 0,
      avg_transit_days: stats.transitDaysCount > 0 ? Math.round((stats.transitDaysSum / stats.transitDaysCount) * 10) / 10 : 0,
      delay_count: stats.delays,
      exception_count: stats.exceptions,
    });
  }

  return results;
}
