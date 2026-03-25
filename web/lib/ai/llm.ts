import { GoogleGenerativeAI } from "@google/generative-ai";
import { INTELLIGENCE_SYSTEM_PROMPT } from "./prompts";

// Initialize Gemini Client
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY as string);

export async function extractMetricsAndSummary(text: string) {
  // Use gemini-2.5-flash for cost-effective MVP processing
  const model = genAI.getGenerativeModel({
    model: "gemini-2.5-flash",
    systemInstruction: INTELLIGENCE_SYSTEM_PROMPT,
    generationConfig: {
      responseMimeType: "application/json",
    }
  });

  const prompt = `Analyze the following audit document. Output strictly JSON matching the required schema:\n\n${text.slice(0, 40000)}`;
  
  try {
    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    return JSON.parse(responseText);
  } catch (e: any) {
    console.error("Failed to parse Gemini JSON:", e.message);
    return {};
  }
}

export async function generateEmbeddings(chunks: string[]): Promise<number[][]> {
  const model = genAI.getGenerativeModel({ model: "gemini-embedding-001" });
  
  const embeddings: number[][] = [];
  
  // To avoid hitting immediate rate limits and simplify processing, we map over chunks 
  // sequentially if batch calls fail or are unsupported natively without rest arrays.
  // We can use Promise.all for speed, but let's batch them in groups of 10.
  const batchSize = 10;
  for (let i = 0; i < chunks.length; i += batchSize) {
    const batch = chunks.slice(i, i + batchSize);
    const batchPromises = batch.map(chunk => model.embedContent(chunk));
    
    const results = await Promise.all(batchPromises);
    results.forEach(res => embeddings.push(res.embedding.values));
  }
  
  return embeddings;
}
