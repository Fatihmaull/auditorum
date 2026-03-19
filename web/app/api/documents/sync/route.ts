import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getSession } from "@/lib/auth";

// In a real production environment, this would be triggered by a Helius webhook.
// For the MVP, the client calls this route immediately after their Solana transaction succeeds.
export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { txSig, workspacePubkey, documentHash, fileCid, category, visibility, title } = await request.json();

    if (!txSig || !workspacePubkey || !documentHash || !fileCid) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const supabase = createAdminClient();

    // Upsert the document metadata to the indexer database
    const { error: docError } = await supabase.from("documents").upsert({
      pubkey: documentHash, // Using hash as unique ID in DB for simplicity MVP
      workspace_pubkey: workspacePubkey,
      uploader_pubkey: session.wallet,
      document_hash: documentHash,
      file_cid: fileCid,
      category: category === 0 ? "financial" : category === 1 ? "security" : "compliance",
      visibility: visibility === 0 ? "public" : visibility === 1 ? "internal" : "restricted",
    });

    if (docError) throw docError;

    // Log the activity
    const { error: logError } = await supabase.from("activity_logs").insert({
      workspace_pubkey: workspacePubkey,
      actor_pubkey: session.wallet,
      action: "UPLOAD_DOCUMENT",
      target_pubkey: documentHash,
      signature: txSig,
      metadata: { title },
    });

    if (logError) throw logError;

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Indexer Sync Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
