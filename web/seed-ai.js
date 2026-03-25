// seed-ai.js
// This script runs the AI Pipeline on the 15 already-seeded documents 
// using their local file paths with the Google Gemini SDK.
require('dotenv').config({ path: '.env.local' });
require('dotenv').config();

if (!process.env.GEMINI_API_KEY) {
  console.error("❌ Error: GEMINI_API_KEY is not set in your .env or .env.local file.");
  process.exit(1);
}

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
const pdf = require('pdf-parse');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("❌ Error: Supabase credentials missing derived from .env files.");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const INTELLIGENCE_SYSTEM_PROMPT = `You are the Auditorum Trust Intelligence Engine, an expert corporate audit intelligence analyst.
Your mandate is to analyze enterprise documents and extract insights natively.
Focus areas:
1. Identify and explain ANY regulatory or compliance risks.
2. Extract absolute financial or ESG metrics accurately.
3. Keep summaries concise, professional, and analytical. DO NOT use conversational filler.

Output strictly valid JSON with the following structure:
{
  "executive_summary": "string - 2-3 paragraph professional overview emphasizing risk and stability.",
  "risk_level": "string - ONLY 'LOW', 'MEDIUM', or 'HIGH'",
  "risk_score": "number - 0 to 100",
  "compliance_flags": [ { "category": "Security|Financial|Governance|ESG", "flag": "Description of anomaly" } ],
  "financial_highlights": { "key_1": "value" },
  "fast_metrics": { "Revenue_or_Size": "value", "Compliance_Score_Heuristic": "number 0-100", "Key_Risk_Exposure": "string" }
}`;

function chunkText(text, maxTokens = 800, overlap = 100) {
  const words = text.split(/\s+/);
  const chunks = [];
  let i = 0;
  while (i < words.length) {
    const chunkWords = words.slice(i, i + maxTokens);
    chunks.push(chunkWords.join(' '));
    i += (maxTokens - overlap);
  }
  return chunks;
}

async function runAISeeding() {
  console.log("🚀 Starting Auditorum Trust Intelligence Backfill (with Google Gemini)...");

  try {
    const resultsPath = path.join(__dirname, 'seeded-results.json');
    if (!fs.existsSync(resultsPath)) {
      console.error("seeded-results.json not found! Cannot map file names.");
      return;
    }

    const documents = JSON.parse(fs.readFileSync(resultsPath, 'utf8'));
    console.log(`Found ${documents.length} documents in JSON. Identifying local files...`);

    const searchDirs = [
      path.join(__dirname, '..', 'auditorum-docs'),
      path.join(__dirname, 'auditorum-docs'),
      path.join(__dirname, '..', 'auditorium-docs') 
    ];

    for (const doc of documents) {
      const pubkey = doc.id;
      const fileName = doc.file_name;
      const category = doc.category === 'finance' ? 'finance' : doc.category; // match folder names

      console.log(`\n\n--- Processing: ${fileName} ---`);

      // 1. Get workspace pubkey from DB
      const { data: dbDoc } = await supabase.from('documents').select('workspace_pubkey').eq('pubkey', pubkey).single();
      if (!dbDoc) {
        console.warn(`Could not find document ${pubkey} in Supabase. Skipping.`);
        continue;
      }
      const workspacePubkey = dbDoc.workspace_pubkey;

      // Removed the 'already processed' block to guarantee a completely fresh 3072-dimension overwrite

      // 3. Find local file
      let localFilePath = null;
      for (const dir of searchDirs) {
        const potentialPath = path.join(dir, category, fileName);
        if (fs.existsSync(potentialPath)) {
          localFilePath = potentialPath;
          break;
        }
      }

      if (!localFilePath) {
        console.warn(`⚠️ Could not find local file for ${fileName}. Skipping.`);
        continue;
      }

      // 4. Extract Text
      console.log("Extracting text from PDF (this might take a few seconds)...");
      const buffer = fs.readFileSync(localFilePath);
      let text = "";
      try {
        const pdfData = await pdf(buffer);
        text = pdfData.text;
      } catch(e) {
         console.warn(`Extraction error for ${fileName}:`, e.message);
         continue;
      }

      if (!text || text.trim() === '') {
        console.warn(`Text extraction empty for ${fileName}. Skipping.`);
        continue;
      }

      // 5. Call Gemini for Summary
      console.log("Generating Intelligence Metrics & Summary via Gemini...");
      let intelligence = {};
      try {
        const model = genAI.getGenerativeModel({
          model: "gemini-2.5-flash", 
          systemInstruction: INTELLIGENCE_SYSTEM_PROMPT,
          generationConfig: { responseMimeType: "application/json" }
        });
        
        const prompt = `Analyze the following audit document. Output strictly JSON:\n\n${text.slice(0, 40000)}`;
        const result = await model.generateContent(prompt);
        intelligence = JSON.parse(result.response.text() || '{}');
      } catch (e) {
        console.error("Gemini Generation Failed:", e.message);
        continue;
      }

      // 6. Upsert Intelligence
      const { error: intelError } = await supabase.from('document_intelligence').upsert({
        document_pubkey: pubkey,
        executive_summary: intelligence.executive_summary || '',
        risk_level: intelligence.risk_level || 'LOW',
        risk_score: intelligence.risk_score || 0,
        compliance_flags: intelligence.compliance_flags || [],
        financial_highlights: intelligence.financial_highlights || {},
        fast_metrics: intelligence.fast_metrics || {}
      });

      if (intelError) {
         console.error("DB Insert Error for Intelligence:", intelError);
      } else {
         console.log("✅ Intelligence inserted.");
      }

      // 7. Chunk and Embed with Gemini
      console.log("Chunking text and generating vectors...");
      const chunks = chunkText(text, 800, 100);
      try {
        const embedModel = genAI.getGenerativeModel({ model: "gemini-embedding-001" });
        const embeddings = [];
        
        for (let i = 0; i < chunks.length; i += 10) {
          const batch = chunks.slice(i, i + 10);
          const batchPromises = batch.map(chunk => embedModel.embedContent(chunk));
          const results = await Promise.all(batchPromises);
          results.forEach(res => embeddings.push(res.embedding.values));
        }
        
        const chunkRecords = chunks.map((content, index) => ({
          document_pubkey: pubkey,
          workspace_pubkey: workspacePubkey,
          chunk_index: index,
          content,
          embedding: embeddings[index]
        }));

        console.log(`Inserting ${chunkRecords.length} vector chunks to Supabase...`);
        const batchSize = 100;
        for (let i = 0; i < chunkRecords.length; i += batchSize) {
          const batch = chunkRecords.slice(i, i + batchSize);
          const { error: vectorError } = await supabase
            .from('document_chunks')
            .insert(batch);
          if (vectorError) console.error("Batch Vector Insert Error:", vectorError);
        }
        console.log("✅ Vectors inserted.");
      } catch (e) {
        console.error("Embedding Generation/Insert Failed:", e.message);
      }
    }

    console.log("\n🎉 AI Backfill Complete!");

  } catch (error) {
    console.error("Fatal Seeding Error:", error);
  }
}

runAISeeding();
