import { NextResponse } from "next/server";
import crypto from "crypto";
import { activeNonces } from "@/lib/auth";

export async function GET() {
  const nonce = crypto.randomBytes(32).toString("base64");
  activeNonces.add(nonce);
  
  // Clean up nonce after 5 minutes
  setTimeout(() => activeNonces.delete(nonce), 5 * 60 * 1000);

  return NextResponse.json({ nonce });
}
