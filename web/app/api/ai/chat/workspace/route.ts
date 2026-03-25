import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY as string);

export async function POST(req: Request) {
  try {
    const { query, workspacePubkey, documentPubkey } = await req.json();

    if (!query || !workspacePubkey) {
      return NextResponse.json({ error: "Missing query or workspacePubkey" }, { status: 400 });
    }

    const supabase = createAdminClient();

    // 1. Generate embedding for query
    const embedModel = genAI.getGenerativeModel({ model: "gemini-embedding-001" });
    const embedResult = await embedModel.embedContent(query);
    const queryEmbedding = embedResult.embedding.values;

    // 2. Retrieve matched document chunks (RAG) across the ENTIRE WORKSPACE
    // OR restrict to a specific document if documentPubkey is provided
    const { data: chunks, error: rpcError } = await supabase.rpc('match_document_chunks', {
      query_embedding: queryEmbedding,
      match_count: 8, 
      target_workspace_pubkey: workspacePubkey, 
      target_document_pubkey: documentPubkey || null
    });

    if (rpcError) {
      console.error("Supabase RPC Error:", rpcError);
      return NextResponse.json({ error: "Failed to retrieve workspace contexts." }, { status: 500 });
    }

    if (!chunks || chunks.length === 0) {
      return NextResponse.json({ answer: "I could not find any relevant information across your workspace documents to answer your question." });
    }

    // 3. Assemble RAG Context
    // To provide the AI with macro-context, we also fetch the file names if we can, 
    // but chunks only have raw text. The text usually contains enough context.
    const contextText = chunks.map((c: any) => c.content).join("\n\n---\n\n");

    // 4. Generate Answer via Gemini Flash
    const model = genAI.getGenerativeModel({ 
      model: "gemini-2.5-flash",
      systemInstruction: "You are the Auditorum AI Copilot, a senior enterprise auditor agent guarding a corporate workspace. If the user says hello or greets you, greet them back professionally and ask how you can assist with their audit. For all other queries, answer based strictly on the provided workspace context chunks. If the answer is not in the context, state clearly that the registry does not contain that information. Do not hallucinate external facts. Format your answers clearly with markdown."
    });

    const prompt = documentPubkey
      ? `Focused Document Context:\n${contextText}\n\nQuestion: ${query}\n\nAnswer comprehensively based only on the focused context above:`
      : `Workspace Context Data:\n${contextText}\n\nCopilot Question: ${query}\n\nAnswer comprehensively based only on the context above:`;

    const chatResult = await model.generateContent(prompt);
    const answer = chatResult.response.text();

    return NextResponse.json({ answer });

  } catch (error: any) {
    console.error("Workspace Chat Route Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
