// seed-graph.js
// Synthesizes graph_nodes and graph_edges from document_intelligence and workspaces
require('dotenv').config({ path: '.env.local' });
require('dotenv').config();

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("❌ Error: Supabase credentials missing.");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function seedGraph() {
  console.log("🕸️ Starting Intelligence Graph Synthesis...");

  try {
    // 1. Clear existing graph
    await supabase.from('graph_edges').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('graph_nodes').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    console.log("Cleared existing graph data.");

    // 2. Fetch Workspaces (Companies)
    const { data: workspaces } = await supabase.from('workspaces').select('*');
    if (!workspaces) return console.log("No workspaces found.");

    const nodeCache = new Map(); // key -> uuid

    async function getOrCreateNode(idKey, type, label) {
      if (nodeCache.has(idKey)) return nodeCache.get(idKey);
      
      // Upsert to handle potential conflicts, but we just cleared it
      const { data, error } = await supabase.from('graph_nodes')
        .insert({ type, label })
        .select()
        .single();
        
      if (error) throw error;
      nodeCache.set(idKey, data.id);
      return data.id;
    }

    async function createEdge(sourceId, targetId, relationship, weight = 1.0) {
      await supabase.from('graph_edges').insert({
        source_id: sourceId,
        target_id: targetId,
        relationship,
        weight
      });
    }

    // A. Create Company Nodes
    for (const ws of workspaces) {
      await getOrCreateNode(`COMP_${ws.pubkey}`, 'COMPANY', ws.company_name);
    }
    console.log(`Created ${workspaces.length} COMPANY nodes.`);

    // 3. Fetch Documents
    const { data: documents } = await supabase.from('documents').select('pubkey, workspace_pubkey, document_hash');
    if (!documents) return console.log("No documents found.");

    for (const doc of documents) {
      const docLabel = `Doc ${doc.document_hash.substring(0, 8)}`;
      const docNodeId = await getOrCreateNode(`DOC_${doc.pubkey}`, 'DOCUMENT', docLabel);
      
      const compNodeId = nodeCache.get(`COMP_${doc.workspace_pubkey}`);
      if (compNodeId) {
        await createEdge(docNodeId, compNodeId, 'BELONGS_TO');
      }
    }
    console.log(`Created ${documents.length} DOCUMENT nodes and linked to companies.`);

    // 4. Fetch Intelligence to build Risks
    const { data: intelligence } = await supabase.from('document_intelligence').select('*');
    if (!intelligence) return console.log("No intelligence found.");

    let riskEdges = 0;
    for (const intel of intelligence) {
      const docNodeId = nodeCache.get(`DOC_${intel.document_pubkey}`);
      if (!docNodeId) continue;

      // Extract Risk Level as a Macro Node
      const riskLevelNodeId = await getOrCreateNode(`LEVEL_${intel.risk_level}`, 'RISK_LEVEL', `${intel.risk_level} RISK`);
      await createEdge(docNodeId, riskLevelNodeId, 'HAS_SEVERITY', intel.risk_score / 100.0);

      // Extract Compliance Flags
      const flags = intel.compliance_flags || [];
      for (const flag of flags) {
        if (!flag.category) continue;
        const categoryKey = flag.category.toUpperCase().replace(/\s+/g, '_');
        
        const riskKeywordNodeId = await getOrCreateNode(`KEYWORD_${categoryKey}`, 'KEYWORD', flag.category);
        await createEdge(docNodeId, riskKeywordNodeId, 'HAS_RISK_FACTOR', 1.0);
        riskEdges++;
      }
    }
    console.log(`Created ${nodeCache.size} total active Nodes and linked ${riskEdges} specific Risk Factor vectors.`);
    
    console.log("✅ Graph Synthesis Complete!");

  } catch (err) {
    console.error("Graph generation failed:", err);
  }
}

seedGraph();
