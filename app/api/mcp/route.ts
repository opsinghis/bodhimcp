import { createMcpHandler } from 'mcp-handler';
import { lookupProduct, lookupProductSchema } from '@/src/tools/lookup-product';
import { searchCatalog, searchCatalogSchema } from '@/src/tools/search-catalog';
import {
  searchCompetitorContent,
  searchCompetitorSchema,
} from '@/src/tools/search-competitor';
import {
  checkAiVisibility,
  checkAiVisibilitySchema,
} from '@/src/tools/check-ai-visibility';
import { saveAeoOutput, saveAeoOutputSchema } from '@/src/tools/save-aeo-output';
import { trackShipment, trackShipmentSchema } from '@/src/tools/track-shipment';
import { searchShipments, searchShipmentsSchema } from '@/src/tools/search-shipments';
import { getCarrierPerformanceTool, getCarrierPerformanceSchema } from '@/src/tools/get-carrier-performance';
import { detectDelayedShipmentsTool, detectDelayedShipmentsSchema } from '@/src/tools/detect-delayed-shipments';
import { notifyStakeholder, notifyStakeholderSchema } from '@/src/tools/notify-stakeholder';
import {
  updateShipmentStatus,
  updateShipmentStatusSchema,
} from '@/src/tools/update-shipment-status';

const handler = createMcpHandler(
  server => {
    // ── AEO Tools (5) ──────────────────────────────────────────

    server.tool(
      'lookup_product',
      'Look up a Pandora product by product_id from the catalog of 9,488 products. Returns product name, price (GBP), material, description, primary category, and category tags.',
      lookupProductSchema,
      async params => lookupProduct(params),
    );

    server.tool(
      'search_catalog',
      'Search the Pandora jewelry catalog (9,488 products) by keyword, material, category, collection, or price range. Materials: Gold, Gold plated, Sterling silver, Rose gold plated, Ruthenium plated, Two-tone, Tri-tone, White gold, Grey, No metal. Collections: Pandora Moments, Pandora ME, Pandora Timeless, Pandora Signature, Pandora Disney. Prices in GBP.',
      searchCatalogSchema,
      async params => searchCatalog(params),
    );

    server.tool(
      'search_competitor_content',
      'Fetch competitor product pages (Swarovski, Tiffany, Kay Jewelers, etc.) for AEO gap analysis. Searches the web and extracts page content. Requires SERPER_API_KEY env var.',
      searchCompetitorSchema,
      async params => searchCompetitorContent(params),
    );

    server.tool(
      'check_ai_visibility',
      'Check how a Pandora product appears in Google search results for specific queries. Returns ranking position, whether Pandora is mentioned, and top 5 results. Requires SERPER_API_KEY env var.',
      checkAiVisibilitySchema,
      async params => checkAiVisibility(params),
    );

    server.tool(
      'save_aeo_output',
      'Persist the final AEO optimization package (schema, content, FAQs, competitor analysis, scores) to Vercel Blob storage. Returns the package directly if Blob is not configured.',
      saveAeoOutputSchema,
      async params => saveAeoOutput(params),
    );

    // ── Shipment Tracking Tools (6) ────────────────────────────

    server.tool(
      'track_shipment',
      'Look up a Pandora shipment by shipment ID (SHP-XXX), order ID (ORD-XXXXX), or tracking number. Returns full shipment details including status, carrier, items, tracking events, and delivery dates.',
      trackShipmentSchema,
      async params => trackShipment(params),
    );

    server.tool(
      'search_shipments',
      'Search shipments by status (ordered/picked/dispatched/in_transit/out_for_delivery/delivered/delayed/exception/returned), carrier (Royal Mail/DPD/Hermes-Evri/DHL/FedEx), customer email, date range, or flags (gift, signature_required).',
      searchShipmentsSchema,
      async params => searchShipments(params),
    );

    server.tool(
      'get_carrier_performance',
      'Get carrier performance analytics: on-time delivery rate, average transit days, delay frequency, and exception count. Filter by carrier or get stats for all 5 carriers.',
      getCarrierPerformanceSchema,
      async params => getCarrierPerformanceTool(params),
    );

    server.tool(
      'detect_delayed_shipments',
      'Proactively detect delayed, at-risk, and exception shipments. Identifies stale tracking (no update in 48h+), missed delivery dates, weather/carrier delays, and gift orders at risk. Returns severity-ranked results.',
      detectDelayedShipmentsSchema,
      async params => detectDelayedShipmentsTool(params),
    );

    server.tool(
      'notify_stakeholder',
      'Send a mock notification (email/SMS/internal alert) to a customer or ops team about a shipment event. Records notification in session memory. No actual messages are sent.',
      notifyStakeholderSchema,
      async params => notifyStakeholder(params),
    );

    server.tool(
      'update_shipment_status',
      'Update a shipment status and append a tracking event. Validates status transitions. In-memory only — resets on server restart. Statuses: ordered → picked → dispatched → in_transit → out_for_delivery → delivered.',
      updateShipmentStatusSchema,
      async params => updateShipmentStatus(params),
    );
  },
  {
    serverInfo: {
      name: 'pandora-aeo',
      version: '1.0.0',
    },
  },
  {
    basePath: '/api',
  },
);

export { handler as GET, handler as POST, handler as DELETE };
