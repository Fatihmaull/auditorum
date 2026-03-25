import { NextResponse } from "next/server";
import crypto from "crypto";
import { activeNonces } from "@/lib/auth";

export async function GET() {
  const nonce = crypto.randomBytes(32).toString("base64");
  const response = NextResponse.json({ nonce });
  
  // Store securely in HTTP-only cookie for serverless compatibility
  response.cookies.set("auth-nonce", nonce, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 5 * 60, // 5 minutes
  });

  return response;
}
