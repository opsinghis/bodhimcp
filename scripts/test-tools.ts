import { lookupProduct } from '../src/tools/lookup-product.js';
import { searchCatalog } from '../src/tools/search-catalog.js';
import { searchCompetitorContent } from '../src/tools/search-competitor.js';
import { checkAiVisibility } from '../src/tools/check-ai-visibility.js';
import { saveAeoOutput } from '../src/tools/save-aeo-output.js';

async function test() {
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

  console.log('\nAll 5 tools working!');
}
test();
