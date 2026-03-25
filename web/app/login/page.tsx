"use client";

import { useState, useEffect } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { useWalletModal } from "@solana/wallet-adapter-react-ui";
import bs58 from "bs58";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const { publicKey, signMessage, disconnect } = useWallet();
  const { setVisible } = useWalletModal();
  const router = useRouter();
  
  const [status, setStatus] = useState<"idle" | "signing" | "authenticating" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    // If wallet connects, automatically prompt to sign the message
    if (publicKey && signMessage && status === "idle") {
      handleSignIn();
    }
  }, [publicKey, signMessage]);

  const handleSignIn = async () => {
    if (!publicKey || !signMessage) return;
    
    try {
      setStatus("signing");
      setErrorMsg("");

      // 1. Fetch nonce
      const nonceRes = await fetch("/api/auth/nonce");
      if (!nonceRes.ok) throw new Error("Failed to fetch nonce");
      const { nonce } = await nonceRes.json();

      // 2. Sign message
      const message = `Sign in to Auditorum Protocol\nNonce: ${nonce}`;
      const messageBytes = new TextEncoder().encode(message);
      const signatureBytes = await signMessage(messageBytes);
      const signature = bs58.encode(signatureBytes);

      // 3. Verify on server
      setStatus("authenticating");
      const verifyRes = await fetch("/api/auth/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          publicKey: publicKey.toBase58(),
          signature,
          nonce,
        }),
      });

      if (!verifyRes.ok) {
        const errData = await verifyRes.json();
        throw new Error(errData.error || "Verification failed");
      }

      // Success!
      router.push("/user-dashboard");
      router.refresh();

    } catch (err: any) {
      console.error(err);
      setStatus("error");
      setErrorMsg(err.message || "Authentication failed. Please try again.");
      disconnect(); // Disconnect to allow a fresh retry
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-dark-900 px-4 overflow-hidden relative">
      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-brand-500/10 rounded-full blur-[120px] pointer-events-none" />
      
      <div className="w-full max-w-sm rounded-3xl border border-white/5 bg-dark-800/50 p-10 text-center shadow-2xl backdrop-blur-2xl relative z-10">
        <div className="mx-auto mb-8 flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-500 text-xl font-black text-white shadow-[0_0_30px_rgba(99,102,241,0.4)]">
          A
        </div>
        
        <h1 className="text-2xl font-bold tracking-tight text-white mb-2">Protocol Access</h1>
        <p className="text-xs text-gray-500 font-medium leading-relaxed uppercase tracking-widest opacity-60">
          Trustless Authentication via Solana SIWS
        </p>

        <div className="mt-8">
          {!publicKey ? (
            <button
              onClick={() => setVisible(true)}
              className="btn-primary w-full py-3.5 text-xs font-bold uppercase tracking-widest shadow-[0_0_20px_rgba(99,102,241,0.3)] transition-all hover:scale-[1.02]"
            >
              Initialize Identity
            </button>
          ) : (
            <div className="rounded-2xl border border-dark-700 bg-dark-900/50 p-8 text-center shadow-inner">
              {status === "signing" && (
                <>
                  <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-2 border-dark-700 border-t-brand-500 shadow-[0_0_10px_rgba(99,102,241,0.2)]" />
                  <p className="text-sm font-bold text-white tracking-wide">Signature Required</p>
                  <p className="mt-2 text-[10px] text-gray-500 font-medium leading-relaxed uppercase tracking-widest">Awaiting wallet-side attestation</p>
                </>
              )}

              {status === "authenticating" && (
                <>
                  <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-2 border-brand-500 border-t-white shadow-[0_0_15px_rgba(99,102,241,0.4)]" />
                  <p className="text-sm font-bold text-white tracking-wide">Verifying Proof</p>
                  <p className="mt-2 text-[10px] text-gray-500 font-medium leading-relaxed uppercase tracking-widest">Cryptographic session generation</p>
                </>
              )}

              {status === "error" && (
                <>
                  <div className="mx-auto mb-4 flex h-10 w-10 items-center justify-center rounded-full bg-red-500/10 border border-red-500/20 text-red-500">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                  </div>
                  <p className="text-sm font-bold text-red-400">Handshake Failed</p>
                  <p className="mt-2 text-[10px] text-gray-500 mb-6 font-medium leading-relaxed uppercase tracking-widest">{errorMsg}</p>
                  <button onClick={() => setVisible(true)} className="btn-secondary w-full text-[10px] font-bold uppercase tracking-widest py-3">
                    Reset Protocol
                  </button>
                </>
              )}
            </div>
          )}
        </div>
        
        <div className="mt-10 text-center text-[10px] text-gray-600 font-bold uppercase tracking-widest opacity-40">
          <p>© 2026 Auditorum Protocol</p>
        </div>
      </div>
    </div>
  );
}
