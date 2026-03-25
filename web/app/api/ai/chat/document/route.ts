import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY as string);

export async function POST(req: Request) {
  try {
    const { query, documentPubkey, workspacePubkey } = await req.json();

    if (!query || !documentPubkey || !workspacePubkey) {
      return NextResponse.json({ error: "Missing query, documentPubkey, or workspacePubkey" }, { status: 400 });
    }

    const supabase = createAdminClient();

    // 1. Generate embedding for query
    const embedModel = genAI.getGenerativeModel({ model: "gemini-embedding-001" });
    const embedResult = await embedModel.embedContent(query);
    const queryEmbedding = embedResult.embedding.values;

    // 2. Retrieve matched document chunks (RAG)
    const { data: chunks, error: rpcError } = await supabase.rpc('match_document_chunks', {
      query_embedding: queryEmbedding,
      match_count: 5,
      target_workspace_pubkey: workspacePubkey,
      target_document_pubkey: documentPubkey
    });

    if (rpcError) {
      console.error("Supabase RPC Error:", rpcError);
      return NextResponse.json({ error: "Failed to retrieve document contexts." }, { status: 500 });
    }

    if (!chunks || chunks.length === 0) {
      return NextResponse.json({ answer: "I could not find any relevant information in this document to answer your question." });
    }

    // 3. Assemble RAG Context
    const contextText = chunks.map((c: any) => c.content).join("\n\n---\n\n");

    // 4. Generate Answer via Gemini
    const model = genAI.getGenerativeModel({ 
      model: "gemini-2.5-flash",
      systemInstruction: "You are the Auditorum Trust Intelligence Engine. Answer the user's question based strictly on the provided document context. If the answer is not in the context, say so. Do not hallucinate external facts."
    });

    const prompt = `Context:\n${contextText}\n\nQuestion: ${query}\n\nAnswer concisely based only on the context above:`;

    const chatResult = await model.generateContent(prompt);
    const answer = chatResult.response.text();

    return NextResponse.json({ answer });

  } catch (error: any) {
    console.error("Chat Route Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
