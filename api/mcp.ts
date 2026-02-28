import { createMcpHandler } from 'mcp-handler';
import { lookupProduct, lookupProductSchema } from '../src/tools/lookup-product.js';
import { searchCatalog, searchCatalogSchema } from '../src/tools/search-catalog.js';
import {
  searchCompetitorContent,
  searchCompetitorSchema,
} from '../src/tools/search-competitor.js';
import {
  checkAiVisibility,
  checkAiVisibilitySchema,
} from '../src/tools/check-ai-visibility.js';
import { saveAeoOutput, saveAeoOutputSchema } from '../src/tools/save-aeo-output.js';

const handler = createMcpHandler(
  server => {
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
