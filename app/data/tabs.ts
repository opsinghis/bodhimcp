export type TabData = {
  id: string;
  label: string;
  color: string;
  badge: string;
  title: string;
  description: string;
  stats: { value: string; label: string }[];
  tools: { name: string; description: string }[];
  workflowNodes: { label: string; description: string; type: string; parallel?: boolean; loopBack?: string }[];
  features: { title: string; description: string }[];
};

export type BuilderData = {
  id: string;
  label: string;
  color: string;
  badge: string;
  title: string;
  description: string;
  stats: { value: string; label: string }[];
  pipelineSteps: { label: string; description: string; type: 'ui' | 'agent' | 'output' }[];
  inputExample: string;
  outputExample: string;
  features: { title: string; description: string }[];
};

export const builders: BuilderData[] = [
  {
    id: 'design-builder',
    label: 'Design Doc Generator',
    color: 'var(--tab-design-builder)',
    badge: 'Brief → Design Doc',
    title: 'Generate Full Design Documents from a Brief',
    description:
      'Paste a 1-3 sentence requirement and get a complete workflow design document — with architecture diagrams, node specifications, full system prompts, MCP tool definitions, and edge maps. The same format used to build all three production workflows below.',
    stats: [
      { value: '9', label: 'Nodes' },
      { value: '5', label: 'Agents' },
      { value: '0', label: 'Tools Needed' },
    ],
    pipelineSteps: [
      { label: 'Brief Input', description: 'Paste your requirement, name the workflow, set complexity level (simple/medium/complex)', type: 'ui' },
      { label: 'Requirements Analyst', description: 'Expands brief into structured requirements: actors, capabilities, data needs, routing logic, tool inventory', type: 'agent' },
      { label: 'Architecture Designer', description: 'Designs node graph, ASCII diagram, phases, edge map, and design principles', type: 'agent' },
      { label: 'Node Spec Generator', description: 'Writes full system prompts (300-1500 words each) for every agent, with rules, output formats, and prohibited actions', type: 'agent' },
      { label: 'Tool Spec Generator', description: 'Designs MCP tools with parameters, returns, mock data schemas, and implementation notes', type: 'agent' },
      { label: 'Doc Assembler', description: 'Stitches everything into the exact markdown template used by production design docs', type: 'agent' },
      { label: 'Review & Export', description: 'Review the generated document, request changes, or approve for use with the Workflow Builder', type: 'output' },
    ],
    inputExample: 'A shipment tracking agent that detects delivery delays, notifies stakeholders, and handles customer complaints for Pandora e-commerce',
    outputExample: 'shipment-tracking-workflow-design.md — 8 nodes, 6 tools, switch routing, mock data for 75 shipments, full system prompts',
    features: [
      { title: 'Brief-to-detail expansion', description: 'A single sentence becomes a 2000+ word design document with architecture, node specs, and tool definitions — matching the quality of hand-written docs.' },
      { title: 'Full system prompt generation', description: 'Every agent gets a complete, actionable system prompt with role definition, extraction rules, JSON output format, constraints, and prohibited actions.' },
      { title: 'MCP tool design', description: 'Automatically designs new MCP tools with parameter schemas, return formats, mock data specifications, and implementation guidance.' },
      { title: 'Complexity-aware scaling', description: 'Set simple (4-6 nodes), medium (6-12 nodes), or complex (12-25 nodes) — the architecture adapts routing, phases, and tool count accordingly.' },
      { title: 'Production-format output', description: 'Output matches the exact markdown structure used by AEO, Shipment Tracking, and Shopping Assistant design docs — ready to feed into the Workflow Builder.' },
    ],
  },
  {
    id: 'workflow-builder',
    label: 'Workflow Builder',
    color: 'var(--tab-workflow-builder)',
    badge: 'Design Doc → Workflow JSON',
    title: 'Generate Production Workflow JSON from Design Docs',
    description:
      'Paste a design document and get a valid workflow JSON that runs directly in the Bodhi workflow engine. Includes 30-point schema validation, auto-fix for minor issues, and an MCP requirements report listing every tool endpoint your server needs.',
    stats: [
      { value: '11', label: 'Nodes' },
      { value: '6', label: 'Agents' },
      { value: '30', label: 'Validation Points' },
    ],
    pipelineSteps: [
      { label: 'Design Doc Input', description: 'Paste the full markdown design document with node descriptions, agent prompts, and edge maps', type: 'ui' },
      { label: 'MCP Config Input', description: 'Set the MCP server URL, name, and transport for the generated workflow (sensible defaults provided)', type: 'ui' },
      { label: 'Doc Parser', description: 'Parses markdown into structured IR: metadata, nodes with verbatim system prompts, edges, tool definitions with parameters', type: 'agent' },
      { label: 'Node Generator', description: 'Generates complete nodes[] array with all 6 node types, deterministic UUIDs, and variable interpolation', type: 'agent' },
      { label: 'Edge Generator', description: 'Generates edges[] array: sequential, switch routing, MCP tools connections, and parallel convergence', type: 'agent' },
      { label: 'Position Layout', description: 'Calculates x,y positions for left-to-right DAG layout with parallel branch fanning', type: 'agent' },
      { label: 'JSON Assembler', description: 'Combines positioned nodes + edges + viewport into the final workflow JSON structure', type: 'agent' },
      { label: 'Validator', description: '30-point schema validation, auto-fix for minor issues, cross-reference with design doc, MCP requirements report', type: 'agent' },
      { label: 'Review & Export', description: 'See validation score, MCP requirements checklist, and the complete JSON — approve or request changes', type: 'output' },
    ],
    inputExample: 'aeo-pandora-workflow-design.md (or any design doc in the standard format)',
    outputExample: 'workflow-aeo-pandora.json — 12 nodes, 20 edges, valid schema, positioned for the visual editor',
    features: [
      { title: '30-point schema validation', description: 'Checks structure, node schema, edge integrity, variable interpolation references, and DAG acyclicity — with a pass/fail score.' },
      { title: 'MCP requirements report', description: 'Lists every tool endpoint the workflow needs: name, purpose, parameters, returns, which agents call it, and an implementation checklist.' },
      { title: 'Auto-fix for minor issues', description: 'Automatically fixes missing selected:false, layoutDirection, auxiliaryHandlePosition, measured dimensions, and other boilerplate.' },
      { title: 'System prompt preservation', description: 'System prompts are preserved character-for-character through the entire pipeline — never summarized, truncated, or rephrased.' },
      { title: 'All 6 node types supported', description: 'Handles control-start, control-end, ui, agent-custom, switch, and mcp-tools nodes with correct schemas for each.' },
      { title: 'Visual editor ready', description: 'Generated JSON includes measured dimensions and calculated positions — import directly into the Bodhi visual workflow editor.' },
    ],
  },
];

export const tabs: TabData[] = [
  {
    id: 'aeo',
    label: 'AEO',
    color: 'var(--tab-aeo)',
    badge: 'Answer Engine Optimization',
    title: 'AI-Visibility Pipeline for Product Catalog',
    description:
      'Transforms raw product data into AI-citation-friendly content with structured data, competitive analysis, and a 6-dimension AEO scoring framework — all orchestrated as an MCP workflow.',
    stats: [
      { value: '9,488', label: 'Products' },
      { value: '5', label: 'Tools' },
      { value: '11', label: 'Nodes' },
    ],
    tools: [
      { name: 'lookup_product', description: 'Retrieve a single product by SKU with full enrichment data including category, materials, price, and images.' },
      { name: 'search_catalog', description: 'Search the product catalog by keyword, category, or material with paginated results and facet filtering.' },
      { name: 'search_competitor_content', description: 'Analyze competitor product pages for SEO patterns, structured data usage, and content gaps.' },
      { name: 'check_ai_visibility', description: 'Audit a product\'s current AI-engine visibility across 6 AEO dimensions and return a scored report.' },
      { name: 'save_aeo_output', description: 'Persist the final AEO-optimized content bundle (JSON-LD, FAQ, copy) to Vercel Blob storage.' },
    ],
    workflowNodes: [
      { label: 'Product Input', description: 'Receive SKU or search query from user', type: 'ui' },
      { label: 'Data Enrichment', description: 'Fetch full product record with materials, pricing, images', type: 'agent' },
      { label: 'Query Generation', description: 'Generate natural-language queries a customer might ask about this product', type: 'agent' },
      { label: 'AEO Audit', description: 'Score current AI visibility across 6 dimensions', type: 'agent' },
      { label: 'Optimization Router', description: 'Route to parallel optimization nodes based on audit gaps', type: 'router' },
      { label: 'Schema Markup', description: 'Generate JSON-LD Product structured data', type: 'agent', parallel: true },
      { label: 'Content Optimization', description: 'Rewrite product copy for AI-citation friendliness', type: 'agent', parallel: true },
      { label: 'FAQ Generation', description: 'Create question-answer pairs from product attributes', type: 'agent', parallel: true },
      { label: 'Competitor Analysis', description: 'Identify content gaps vs. competitor listings', type: 'agent', parallel: true },
      { label: 'AEO Assembly', description: 'Merge all optimized artifacts into a single output bundle', type: 'agent' },
      { label: 'End', description: 'Save to blob storage and return AEO report', type: 'ui' },
    ],
    features: [
      { title: 'Data-quality awareness', description: 'Detects missing fields, low-res images, and incomplete descriptions before optimization begins.' },
      { title: 'JSON-LD structured data', description: 'Generates schema.org Product markup that search engines and AI assistants can directly consume.' },
      { title: 'AI-citation-friendly content', description: 'Rewrites product copy into concise, factual statements optimized for LLM retrieval.' },
      { title: 'Competitor gap analysis', description: 'Compares your product pages against competitors to find missing structured data and content opportunities.' },
      { title: '6-dimension AEO scoring', description: 'Scores products across Schema, Content, FAQ, Freshness, Authority, and Technical dimensions.' },
    ],
  },
  {
    id: 'shipment',
    label: 'Shipment Tracking',
    color: 'var(--tab-shipment)',
    badge: 'Shipment Intelligence',
    title: 'Conversational Shipment Tracking & Analytics',
    description:
      'A natural-language interface for tracking shipments, detecting delays, triaging complaints by severity, and surfacing carrier performance analytics — with gift-order awareness and audience-specific formatting.',
    stats: [
      { value: '6', label: 'Tools' },
      { value: '8', label: 'Nodes' },
      { value: '5', label: 'Carriers' },
    ],
    tools: [
      { name: 'track_shipment', description: 'Get real-time tracking status for a shipment by order ID, including carrier, location, and estimated delivery.' },
      { name: 'search_shipments', description: 'Search shipments by customer email, status, date range, or carrier with flexible filtering.' },
      { name: 'get_carrier_performance', description: 'Return delivery performance metrics for a carrier: on-time rate, average transit days, delay patterns.' },
      { name: 'detect_delayed_shipments', description: 'Scan active shipments to find those behind schedule with severity classification and root-cause hints.' },
      { name: 'notify_stakeholder', description: 'Send formatted delay notifications to customers or internal teams with audience-appropriate messaging.' },
      { name: 'update_shipment_status', description: 'Manually update a shipment\'s status and add internal notes for exception handling.' },
    ],
    workflowNodes: [
      { label: 'Query Input', description: 'Receive natural-language shipment question from user', type: 'ui' },
      { label: 'Intent Classification', description: 'Determine if query is status check, complaint, analytics, or monitoring', type: 'agent' },
      { label: 'Query Router', description: 'Route to the appropriate fulfillment branch', type: 'router' },
      { label: 'Status Check', description: 'Look up shipment and return current tracking information', type: 'agent', parallel: true },
      { label: 'Delay Complaint', description: 'Triage severity, detect gift orders, escalate if needed', type: 'agent', parallel: true },
      { label: 'General Inquiry', description: 'Handle policy questions, carrier info, and general help', type: 'agent', parallel: true },
      { label: 'Proactive Monitor', description: 'Scan for at-risk shipments and surface emerging delay patterns', type: 'agent', parallel: true },
      { label: 'Response Assembly', description: 'Format response for audience (customer vs. internal) and return', type: 'ui' },
    ],
    features: [
      { title: 'Severity triage', description: 'Classifies delays into Low / Medium / High / Critical based on days late, order value, and gift status.' },
      { title: 'Gift order escalation', description: 'Automatically elevates priority when a delayed shipment is flagged as a gift with an upcoming occasion.' },
      { title: 'Audience-aware formatting', description: 'Returns empathetic customer-facing copy or data-dense internal reports depending on the audience.' },
      { title: 'Carrier analytics', description: 'Aggregates on-time rates, transit times, and delay causes per carrier for operational dashboards.' },
      { title: 'Proactive delay detection', description: 'Identifies shipments likely to miss their delivery window before the customer even asks.' },
    ],
  },
  {
    id: 'shopping',
    label: 'Shopping Assistant',
    color: 'var(--tab-shopping)',
    badge: 'Agentic Commerce',
    title: 'Conversational AI Shopping Experience',
    description:
      'A multi-turn agentic commerce workflow that maintains conversation context across turns — handling discovery, comparison, gift curation, expert advice, and checkout as a continuous dialogue with session memory, refinement loops, and purchase-readiness scoring.',
    stats: [
      { value: '18', label: 'Total Tools' },
      { value: '22', label: 'Nodes' },
      { value: '6', label: 'Phases' },
    ],
    tools: [
      { name: 'get_product_recommendations', description: 'Return personalized product suggestions based on occasion, budget, recipient, and browsing context.' },
      { name: 'compare_products', description: 'Side-by-side comparison of 2–4 products across price, materials, dimensions, and reviews.' },
      { name: 'build_bundle', description: 'Compose a gift bundle from compatible products with combined pricing and packaging options.' },
      { name: 'check_inventory', description: 'Verify real-time stock availability for one or more SKUs across warehouses.' },
      { name: 'create_order', description: 'Submit a finalized order with validated items, shipping address, and payment method reference.' },
      { name: 'load_session', description: 'Load persisted session state (conversation history, cart, preferences) from Vercel Blob by session ID for multi-turn continuity.' },
      { name: 'save_session', description: 'Persist session state to Vercel Blob at end of each turn, enabling seamless conversation across workflow re-invocations.' },
    ],
    workflowNodes: [
      // Phase 1: Intake
      { label: 'User Message', description: 'Receive natural-language shopping request or follow-up', type: 'ui' },
      { label: 'Session Memory', description: 'Call load_session to restore conversation history, cart state, and preferences from prior turns via Vercel Blob', type: 'agent' },
      { label: 'Context Extraction', description: 'NLU agent — parse customer message into structured intent, product IDs, preferences, and purchase readiness', type: 'agent' },
      { label: 'Context Merger', description: 'Merge new extraction with session memory — resolve references like "the first one" or "something cheaper" using prior turn context', type: 'agent' },
      // Phase 2: Understanding
      { label: 'Intent Router', description: 'Route to one of 5 fulfillment paths, or handle clarification / refinement of a previous result', type: 'router' },
      // Phase 3: Fulfillment
      { label: 'Product Discovery', description: 'Search catalog and return personalized recommendations', type: 'agent', parallel: true },
      { label: 'Product Comparison', description: 'Build side-by-side comparison tables for shortlisted items', type: 'agent', parallel: true },
      { label: 'Gift Curator', description: 'Assemble gift bundles with wrapping and occasion-appropriate messaging', type: 'agent', parallel: true },
      { label: 'Style Expert', description: 'Provide expert jewelry advice on materials, sizing, and care', type: 'agent', parallel: true },
      { label: 'Order Tracker', description: 'Check status of existing orders via shipment tracking tools', type: 'agent', parallel: true },
      // Phase 4: Validation + Conversion
      { label: 'Inventory Gate', description: 'Validate stock availability before proceeding to checkout', type: 'agent' },
      { label: 'Purchase Readiness', description: 'Score whether the customer is ready to buy or needs more info', type: 'router' },
      { label: 'Checkout Flow', description: 'Guide the customer through address, payment, and order confirmation', type: 'agent' },
      { label: 'Nurture Path', description: 'Provide additional information, alternatives, or save for later', type: 'agent' },
      { label: 'Response Composer', description: 'Assemble branded, on-tone response with product cards and CTAs', type: 'agent' },
      // Phase 5: Follow-up Interaction
      { label: 'Customer Follow-Up', description: 'Show results and capture customer response — select a product, refine search, or exit', type: 'ui' },
      { label: 'Follow-Up Router', description: 'Route by follow-up intent: SELECT_PRODUCT → checkout, REFINE → save & exit, EXIT → end session', type: 'router' },
      { label: 'Selection Handler', description: 'Resolve product selection from follow-up ("the first one", product ID), verify inventory, and create order', type: 'agent' },
      { label: 'Follow-Up Composer', description: 'Compose branded order confirmation or selection clarification response', type: 'agent' },
      // Phase 6: Conversation Loop
      { label: 'Session Update', description: 'Call save_session to persist updated cart, preferences, and conversation history to Vercel Blob', type: 'agent' },
      { label: 'Conversation Router', description: 'Workflow ends; if continue=true, session is saved and next user message re-triggers the workflow with full context restored', type: 'router', loopBack: 'User Message' },
      { label: 'End', description: 'Session complete — return order confirmation or farewell with saved preferences', type: 'ui' },
    ],
    features: [
      { title: 'Multi-turn session memory', description: 'Persists conversation history, cart contents, and preferences to Vercel Blob via load_session/save_session tools — enabling references like "show me something cheaper" across workflow re-invocations.' },
      { title: 'Contextual reference resolution', description: 'Resolves anaphora and relative references ("the blue one", "similar but in gold") by merging new input with full session context.' },
      { title: '5-way intent routing', description: 'Routes to Discovery, Comparison, Gift Curation, Expert Advice, or Order Tracking — and re-routes on follow-up turns without restarting.' },
      { title: 'Inventory validation gate', description: 'Blocks checkout for out-of-stock items and suggests available alternatives automatically.' },
      { title: 'Purchase readiness scoring', description: 'Scores customer readiness each turn and routes to checkout when confident, or continues the conversation to gather more signal.' },
      { title: 'In-workflow product selection', description: 'After showing results, a follow-up UI captures the customer\'s choice. Selection Handler resolves "the first one" or product names to IDs, verifies inventory, and completes checkout — all in one workflow run.' },
      { title: 'External re-invocation loop', description: 'Each turn saves session state to Vercel Blob. Next user message re-triggers the workflow from start — Session Memory restores full context. Graceful exit after order, farewell, or 10 turns.' },
      { title: 'Branded response composition', description: 'Assembles responses in the brand\'s voice with product cards, imagery, and contextual CTAs — adapting tone as the conversation progresses.' },
    ],
  },
];
