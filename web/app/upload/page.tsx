"use client";

import { useState, useCallback } from "react";
import { useAnchorWallet } from "@solana/wallet-adapter-react";
import { FileUpload } from "@/components/FileUpload";
import { hashFile, hashToHex } from "@/lib/hash";
import { createAuditRecord } from "@/lib/program";
import { INDUSTRIES, ROLES, CLUSTER_NAME } from "@/lib/constants";

type Status = "idle" | "hashing" | "ready" | "sending" | "success" | "error";

export default function UploadPage() {
  const wallet = useAnchorWallet();

  const [file, setFile] = useState<File | null>(null);
  const [hash, setHash] = useState<Uint8Array | null>(null);
  const [hashHex, setHashHex] = useState<string>("");
  const [industry, setIndustry] = useState(0);
  const [role, setRole] = useState(0);
  const [status, setStatus] = useState<Status>("idle");
  const [txSig, setTxSig] = useState<string>("");
  const [errorMsg, setErrorMsg] = useState<string>("");

  const handleFileSelect = useCallback(async (selectedFile: File) => {
    setFile(selectedFile);
    setStatus("hashing");
    setErrorMsg("");
    setTxSig("");

    try {
      const fileHash = await hashFile(selectedFile);
      setHash(fileHash);
      setHashHex(hashToHex(fileHash));
      setStatus("ready");
    } catch (err) {
      setStatus("error");
      setErrorMsg("Failed to hash file");
    }
  }, []);

  const handleSubmit = useCallback(async () => {
    if (!wallet || !hash) return;

    setStatus("sending");
    setErrorMsg("");

    try {
      const sig = await createAuditRecord(wallet, hash, industry, role);
      setTxSig(sig);
      setStatus("success");
    } catch (err: any) {
      setStatus("error");
      setErrorMsg(err?.message || "Transaction failed");
    }
  }, [wallet, hash, industry, role]);

  return (
    <div className="glow relative py-24">
      <div className="section max-w-2xl">
        <div className="mb-2 text-xs font-medium uppercase tracking-[0.2em] text-white/30">
          Upload
        </div>
        <h1 className="font-serif text-3xl sm:text-4xl">
          Anchor an Audit Record
        </h1>
        <p className="mt-3 text-white/40">
          Upload your audit report, select metadata, and store a cryptographic
          proof on Solana.
        </p>

        <div className="mt-10 space-y-6">
          {/* File Upload */}
          <div>
            <label className="mb-2 block text-sm font-medium text-white/60">
              Audit Report File
            </label>
            <FileUpload
              onFileSelect={handleFileSelect}
              label="Upload audit report (PDF, XLSX, any file)"
            />
          </div>

          {/* Hash display */}
          {hashHex && (
            <div className="card">
              <p className="mb-1 text-xs font-medium uppercase tracking-wider text-white/30">
                SHA-256 Hash
              </p>
              <p className="break-all font-mono text-sm text-accent-light">
                {hashHex}
              </p>
            </div>
          )}

          {/* Role & Industry selectors */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium text-white/60">
                Role
              </label>
              <div className="flex gap-2">
                {ROLES.map((r) => (
                  <button
                    key={r.value}
                    onClick={() => setRole(r.value)}
                    className={`flex-1 rounded-xl border px-4 py-3 text-sm font-medium transition-all ${
                      role === r.value
                        ? "border-accent/40 bg-accent/10 text-accent-light"
                        : "border-white/10 bg-white/[0.02] text-white/40 hover:border-white/20 hover:text-white/60"
                    }`}
                  >
                    {r.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-white/60">
                Industry
              </label>
              <div className="flex gap-2">
                {INDUSTRIES.map((i) => (
                  <button
                    key={i.value}
                    onClick={() => setIndustry(i.value)}
                    className={`flex-1 rounded-xl border px-3 py-3 text-sm font-medium transition-all ${
                      industry === i.value
                        ? "border-accent/40 bg-accent/10 text-accent-light"
                        : "border-white/10 bg-white/[0.02] text-white/40 hover:border-white/20 hover:text-white/60"
                    }`}
                  >
                    {i.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Submit */}
          {!wallet ? (
            <div className="card text-center">
              <p className="text-sm text-white/40">
                Connect your wallet to submit a transaction.
              </p>
            </div>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={status !== "ready"}
              className={`btn-accent w-full ${
                status !== "ready"
                  ? "cursor-not-allowed opacity-50"
                  : ""
              }`}
            >
              {status === "sending" ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  Sending Transaction...
                </>
              ) : (
                <>
                  Anchor On-Chain
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M5 12h14" />
                    <path d="m12 5 7 7-7 7" />
                  </svg>
                </>
              )}
            </button>
          )}

          {/* Success */}
          {status === "success" && txSig && (
            <div className="card border-green-500/20 bg-green-500/5">
              <div className="flex items-center gap-2">
                <div className="status-dot-success" />
                <p className="text-sm font-medium text-green-400">
                  Record anchored successfully!
                </p>
              </div>
              <p className="mt-3 text-xs text-white/30">Transaction</p>
              <a
                href={`https://explorer.solana.com/tx/${txSig}?cluster=${CLUSTER_NAME}`}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-1 block break-all font-mono text-sm text-accent-light underline decoration-accent/30 underline-offset-4 hover:decoration-accent"
              >
                {txSig}
              </a>
            </div>
          )}

          {/* Error */}
          {status === "error" && errorMsg && (
            <div className="card border-red-500/20 bg-red-500/5">
              <div className="flex items-center gap-2">
                <div className="status-dot-error" />
                <p className="text-sm font-medium text-red-400">
                  Transaction failed
                </p>
              </div>
              <p className="mt-2 text-sm text-white/40">{errorMsg}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
