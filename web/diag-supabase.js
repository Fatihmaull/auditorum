const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = "https://udiqusswsojtuwgnleru.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVkaXF1c3N3c29qdHV3Z25sZXJ1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MzkwNTcwMiwiZXhwIjoyMDg5NDgxNzAyfQ.YCjPIn23nwZrPPFAaK_bL1BnIxhalM0NniHlmTYlJ4k";

const supabase = createClient(supabaseUrl, supabaseKey);

async function diag() {
  console.log("--- Supabase Diagnostic V3 ---");
  const wallet = "Bmk7RrSYFm3DfLvGEouaVjfcK13HAKXftmmnwhSkjgCA"; // Super Admin 1

  // 1. Test Documents Table
  console.log("[DB] Testing documents table...");
  const { error: docError } = await supabase
    .from('documents')
    .insert({ 
        pubkey: "diag-doc-" + Date.now(),
        workspace_pubkey: "15955bda-f671-4c01-8aee-217a077065fd", // Existing Stripe?
        uploader_pubkey: wallet,
        document_hash: "hash-" + Math.random().toString(36).slice(2),
        file_cid: "cid-" + Math.random().toString(36).slice(2),
        category: "security",
        visibility: "internal"
    });

  if (docError) {
    console.error("[ERR] Documents insert:", docError.message);
  } else {
    console.log("[OK] Documents insert success.");
  }
}

diag();
