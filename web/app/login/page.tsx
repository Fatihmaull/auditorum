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
    <div className="flex min-h-screen items-center justify-center bg-[#FAFAF8] px-4">
      <div className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-8 text-center shadow-sm">
        <div className="mx-auto mb-6 flex h-12 w-12 items-center justify-center rounded-xl bg-[#0B3D91] text-lg font-bold text-white shadow-sm">
          A
        </div>
        
        <h1 className="text-xl font-semibold text-gray-900">Sign in with Solana</h1>
        <p className="mt-2 text-sm text-gray-500">
          Connect your wallet to securely access your workspace. No passwords required.
        </p>

        <div className="mt-8">
          {!publicKey ? (
            <button
              onClick={() => setVisible(true)}
              className="btn-primary w-full justify-center py-2.5"
            >
              Connect Wallet
            </button>
          ) : (
            <div className="rounded-lg border border-gray-100 bg-gray-50 p-6 text-center">
              {status === "signing" && (
                <>
                  <div className="mx-auto mb-4 h-6 w-6 animate-spin rounded-full border-2 border-gray-300 border-t-[#0B3D91]" />
                  <p className="text-sm font-medium text-gray-900">Approve signature</p>
                  <p className="mt-1 text-xs text-gray-500">Please sign the message in your wallet popup.</p>
                </>
              )}

              {status === "authenticating" && (
                <>
                  <div className="mx-auto mb-4 h-6 w-6 animate-spin rounded-full border-2 border-[#0B3D91] border-t-white" />
                  <p className="text-sm font-medium text-gray-900">Authenticating...</p>
                  <p className="mt-1 text-xs text-gray-500">Verifying session token securely.</p>
                </>
              )}

              {status === "error" && (
                <>
                  <div className="mx-auto mb-4 flex h-8 w-8 items-center justify-center rounded-full bg-red-100">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#b91c1c" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                  </div>
                  <p className="text-sm font-medium text-red-700">Login Failed</p>
                  <p className="mt-1 text-xs text-gray-600 mb-4">{errorMsg}</p>
                  <button onClick={() => setVisible(true)} className="btn-secondary w-full justify-center text-xs">
                    Try Again
                  </button>
                </>
              )}
            </div>
          )}
        </div>
        
        <div className="mt-8 text-center text-xs text-gray-400">
          <p>By connecting, you agree to our Terms of Service.</p>
        </div>
      </div>
    </div>
  );
}
