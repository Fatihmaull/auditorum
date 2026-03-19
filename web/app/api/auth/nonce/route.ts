import { NextResponse } from "next/server";
import crypto from "crypto";

// Store nonces temporarily in memory (In production, use Redis or a DB table)
export const activeNonces = new Set<string>();

export async function GET() {
  const nonce = crypto.randomBytes(32).toString("base64");
  activeNonces.add(nonce);
  
  // Clean up nonce after 5 minutes
  setTimeout(() => activeNonces.delete(nonce), 5 * 60 * 1000);

  return NextResponse.json({ nonce });
}
