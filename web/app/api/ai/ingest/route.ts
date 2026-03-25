import { NextResponse } from "next/server";
import { processDocumentIntelligence } from "@/lib/ai/pipeline";

// Required to use Node.js runtime for pdf-parse (fs dependencies)
export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { documentPubkey, workspacePubkey, fileUrl } = body;

    if (!documentPubkey || !workspacePubkey || !fileUrl) {
      return NextResponse.json({ error: "Missing required fields: documentPubkey, workspacePubkey, fileUrl" }, { status: 400 });
    }

    // Trigger processing
    // Awaiting completion here for MVP to confirm it worked, but in prod this would likely be async/job queue.
    const result = await processDocumentIntelligence(documentPubkey, workspacePubkey, fileUrl);

    if (result.success) {
      return NextResponse.json({ success: true, message: "AI Analysis Complete", intelligence: result.intelligence });
    } else {
      return NextResponse.json({ success: false, error: result.error }, { status: 500 });
    }
  } catch (error: any) {
    console.error("Ingest Route Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
