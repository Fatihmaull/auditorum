import { createAdminClient } from "../supabase/admin";
import { extractTextFromPDF, chunkText } from "./extraction";
import { extractMetricsAndSummary, generateEmbeddings } from "./llm";

export async function processDocumentIntelligence(documentPubkey: string, workspacePubkey: string, pdfUrl: string) {
  const supabase = createAdminClient();
  
  try {
    console.log(`[AI Pipeline] Starting processing for document ${documentPubkey}`);
    
    // 1. Download PDF Buffer
    let buffer: Buffer;
    
    if (pdfUrl.startsWith('http')) {
      // It's a public URL or Pinata IPFS Gateway
      console.log("[AI Pipeline] Fetching via public URL:", pdfUrl);
      const res = await fetch(pdfUrl);
      if (!res.ok) throw new Error(`Failed to fetch PDF via URL: ${res.statusText}`);
      const arrayBuffer = await res.arrayBuffer();
      buffer = Buffer.from(arrayBuffer);
    } else {
      // Assume it's a Supabase storage path
      console.log("[AI Pipeline] Fetching via Supabase Storage:", pdfUrl);
      const { data: fileData, error: downloadError } = await supabase
        .storage
        .from('documents')
        .download(pdfUrl);

      if (downloadError || !fileData) {
        throw new Error(`Failed to download from Supabase Storage: ${downloadError?.message}`);
      }
      const arrayBuffer = await fileData.arrayBuffer();
      buffer = Buffer.from(arrayBuffer);
    }

    // 2. Parse Text
    console.log(`[AI Pipeline] Extracting text...`);
    const text = await extractTextFromPDF(buffer);

    if (!text || text.trim().length === 0) {
      throw new Error("Extracted text is empty");
    }

    // 3. Analyze Document (Summary + Metrics)
    console.log(`[AI Pipeline] Generating summary and fast metrics...`);
    const intelligence = await extractMetricsAndSummary(text);

    // Save to document_intelligence table
    const { error: intelError } = await supabase
      .from('document_intelligence')
      .upsert({
        document_pubkey: documentPubkey,
        executive_summary: intelligence.executive_summary || '',
        risk_level: intelligence.risk_level || 'LOW',
        risk_score: intelligence.risk_score || 0,
        compliance_flags: intelligence.compliance_flags || [],
        financial_highlights: intelligence.financial_highlights || {},
        fast_metrics: intelligence.fast_metrics || {}
      });

    if (intelError) console.error("[AI Pipeline] Error saving intelligence:", intelError);

    // 4. Chunk & Embed for RAG
    console.log(`[AI Pipeline] Chunking text and vectorizing...`);
    const chunks = chunkText(text, 800, 100);
    const embeddings = await generateEmbeddings(chunks);

    // 5. Save to Vector Store
    const chunkRecords = chunks.map((content, index) => ({
      document_pubkey: documentPubkey,
      workspace_pubkey: workspacePubkey,
      chunk_index: index,
      content,
      embedding: embeddings[index]
    }));

    // Batch insert chunks to avoid payload limits
    const batchSize = 100;
    for (let i = 0; i < chunkRecords.length; i += batchSize) {
      const batch = chunkRecords.slice(i, i + batchSize);
      const { error: vectorError } = await supabase
        .from('document_chunks')
        .insert(batch);
      
      if (vectorError) console.error("[AI Pipeline] Error saving chunks batch:", vectorError);
    }
    
    console.log(`[AI Pipeline] Finished processing document ${documentPubkey}`);
    return { success: true, intelligence };

  } catch (error: any) {
    console.error(`[AI Pipeline Error] Document ${documentPubkey}:`, error);
    return { success: false, error: error.message };
  }
}
