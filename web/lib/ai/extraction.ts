import pdf from "pdf-parse";

export async function extractTextFromPDF(buffer: Buffer): Promise<string> {
  try {
    const data = await pdf(buffer);
    return data.text;
  } catch (error) {
    console.error("PDF extraction error:", error);
    throw new Error("Failed to parse PDF text.");
  }
}

export function chunkText(text: string, maxTokens = 800, overlap = 100): string[] {
  // Utilizing a basic overlap approach suitable for context integrity
  // Note: 1 token != 1 word, but for MVP this rough approximation is sufficient.
  const words = text.split(/\s+/);
  const chunks: string[] = [];
  let i = 0;
  while (i < words.length) {
    const chunkWords = words.slice(i, i + maxTokens);
    chunks.push(chunkWords.join(' '));
    i += (maxTokens - overlap);
  }
  return chunks;
}
