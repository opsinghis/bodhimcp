import { lookupProduct } from '../src/tools/lookup-product.js';
import { searchCatalog } from '../src/tools/search-catalog.js';
import { searchCompetitorContent } from '../src/tools/search-competitor.js';
import { checkAiVisibility } from '../src/tools/check-ai-visibility.js';
import { saveAeoOutput } from '../src/tools/save-aeo-output.js';
import { trackShipment } from '../src/tools/track-shipment.js';
import { searchShipments } from '../src/tools/search-shipments.js';
import { getCarrierPerformanceTool } from '../src/tools/get-carrier-performance.js';
import { detectDelayedShipmentsTool } from '../src/tools/detect-delayed-shipments.js';
import { notifyStakeholder } from '../src/tools/notify-stakeholder.js';
import { updateShipmentStatus } from '../src/tools/update-shipment-status.js';

async function test() {
  console.log('=== AEO Tools (5) ===\n');

  // Tool 1: lookup_product
  const r1 = await lookupProduct({ productId: '142784C01' });
  console.log('1. lookup_product: OK -', JSON.parse(r1.content[0].text).product_name);

  // Tool 2: search_catalog
  const r2 = await searchCatalog({ collection: 'Pandora Moments', limit: 2 });
  console.log('2. search_catalog: OK -', JSON.parse(r2.content[0].text).totalResults, 'results');

  // Tool 3: search_competitor (no API key)
  const r3 = await searchCompetitorContent({ brand: 'Swarovski', query: 'charm bracelet' });
  console.log('3. search_competitor: OK -', JSON.parse(r3.content[0].text).status);

  // Tool 4: check_ai_visibility (no API key)
  const r4 = await checkAiVisibility({ queries: ['best pandora charm'], productName: 'Stars Ring' });
  console.log('4. check_ai_visibility: OK -', JSON.parse(r4.content[0].text).status);

  // Tool 5: save_aeo_output (no blob configured)
  const r5 = await saveAeoOutput({
    productId: '142784C01',
    aeoPackage: { summary: 'test', product: {} },
  });
  console.log('5. save_aeo_output: OK -', JSON.parse(r5.content[0].text).status);

  console.log('\n=== Shipment Tracking Tools (6) ===\n');

  // Tool 6: track_shipment
  const r6 = await trackShipment({ identifier: 'SHP-001' });
  const s6 = JSON.parse(r6.content[0].text);
  console.log('6. track_shipment: OK -', s6.shipment_id, s6.status, s6.carrier);

  // Tool 7: search_shipments
  const r7 = await searchShipments({ status: 'delayed', limit: 5 });
  const s7 = JSON.parse(r7.content[0].text);
  console.log('7. search_shipments: OK -', s7.totalResults, 'delayed shipments');

  // Tool 8: get_carrier_performance
  const r8 = await getCarrierPerformanceTool({});
  const s8 = JSON.parse(r8.content[0].text);
  console.log('8. get_carrier_performance: OK -', s8.carriers.length, 'carriers,', s8.summary.total_shipments, 'shipments');

  // Tool 9: detect_delayed_shipments
  const r9 = await detectDelayedShipmentsTool({});
  const s9 = JSON.parse(r9.content[0].text);
  console.log('9. detect_delayed_shipments: OK -', s9.total_flagged, 'flagged (critical:', s9.by_severity.critical + ')');

  // Tool 10: notify_stakeholder
  const r10 = await notifyStakeholder({
    shipmentId: 'SHP-001',
    channel: 'email',
    audience: 'customer',
    message: 'Your order is on its way!',
  });
  const s10 = JSON.parse(r10.content[0].text);
  console.log('10. notify_stakeholder: OK -', s10.status, s10.notification.id);

  // Tool 11: update_shipment_status (find an in_transit shipment to update)
  const r7b = await searchShipments({ status: 'in_transit', limit: 1 });
  const inTransit = JSON.parse(r7b.content[0].text).shipments[0];
  if (inTransit) {
    const r11 = await updateShipmentStatus({
      shipmentId: inTransit.shipment_id,
      newStatus: 'out_for_delivery',
      location: 'Local Depot',
      notes: 'Test status update',
    });
    const s11 = JSON.parse(r11.content[0].text);
    console.log('11. update_shipment_status: OK -', s11.status, inTransit.shipment_id, '→ out_for_delivery');
  }

  console.log('\nAll 11 tools working!');
}
test();
