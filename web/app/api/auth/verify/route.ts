import { NextResponse } from "next/server";
import { PublicKey } from "@solana/web3.js";
import nacl from "tweetnacl";
import bs58 from "bs58";
import { createSession, activeNonces } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(request: Request) {
  try {
    const { publicKey, signature, nonce } = await request.json();

    if (!publicKey || !signature || !nonce) {
      return NextResponse.json({ error: "Missing parameters" }, { status: 400 });
    }

    // Verify nonce
    if (!activeNonces.has(nonce)) {
      return NextResponse.json({ error: "Invalid or expired nonce" }, { status: 400 });
    }

    // Reconstruct the message that was signed
    const message = `Sign in to Auditorum Protocol\nNonce: ${nonce}`;
    const messageBytes = new TextEncoder().encode(message);

    // Verify signature
    const signatureBytes = bs58.decode(signature);
    const pubKeyBytes = new PublicKey(publicKey).toBytes();

    const isVerified = nacl.sign.detached.verify(
      messageBytes,
      signatureBytes,
      pubKeyBytes
    );

    if (!isVerified) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    // Create or update user in Supabase (Non-blocking for now due to potential permission issues)
    const supabase = createAdminClient();
    const { error: upsertError } = await supabase
      .from("users")
      .upsert({
        wallet_address: publicKey,
        nonce: nonce, // Store the last used nonce
        updated_at: new Date().toISOString()
      }, { onConflict: 'wallet_address' });

    if (upsertError) {
      console.error("Non-blocking upsert error on login:", upsertError);
      // We still proceed with the session creation so the user can log in
    }

    // Create a local session token
    await createSession({ wallet: publicKey });

    // Consume the nonce
    activeNonces.delete(nonce);

    return NextResponse.json({ success: true, wallet: publicKey });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
