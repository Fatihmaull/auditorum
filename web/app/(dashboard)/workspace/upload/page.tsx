"use client";

import { useState, useCallback } from "react";
import { useAnchorWallet } from "@solana/wallet-adapter-react";
import { TopBar } from "@/components/layout/TopBar";
import { FileUpload } from "@/components/FileUpload";
import { hashFile, hashToHex } from "@/lib/solana/hash";
import { createAuditRecord } from "@/lib/solana/program";
import { INDUSTRIES, ROLES, DOC_CATEGORIES, DOC_VISIBILITIES } from "@/lib/types";
import { CLUSTER_NAME } from "@/lib/solana/constants";

type Status = "idle" | "hashing" | "ready" | "sending" | "success" | "error";

export default function UploadPage() {
  const wallet = useAnchorWallet();

  const [file, setFile] = useState<File | null>(null);
  const [hash, setHash] = useState<Uint8Array | null>(null);
  const [hashHex, setHashHex] = useState("");
  const [title, setTitle] = useState("");
  const [industry, setIndustry] = useState(0);
  const [role, setRole] = useState(0);
  const [category, setCategory] = useState("security");
  const [visibility, setVisibility] = useState("internal");
  const [status, setStatus] = useState<Status>("idle");
  const [txSig, setTxSig] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const handleFileSelect = useCallback(async (selectedFile: File) => {
    setFile(selectedFile);
    setTitle(selectedFile.name.replace(/\.[^.]+$/, ""));
    setStatus("hashing");
    setErrorMsg("");
    setTxSig("");
    try {
      const fileHash = await hashFile(selectedFile);
      setHash(fileHash);
      setHashHex(hashToHex(fileHash));
      setStatus("ready");
    } catch {
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
    <>
      <TopBar title="Upload Report" description="Upload and anchor an audit report on Solana" />

      <div className="mx-auto max-w-2xl p-6">
        <div className="space-y-6">
          {/* File */}
          <div>
            <label className="input-label">Audit Report File</label>
            <FileUpload onFileSelect={handleFileSelect} label="Upload audit report (PDF, XLSX, any file)" />
          </div>

          {/* Title */}
          {hashHex && (
            <div>
              <label className="input-label">Document Title</label>
              <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} className="input" placeholder="e.g. SOC 2 Type II Report" />
            </div>
          )}

          {/* Hash */}
          {hashHex && (
            <div className="card bg-gray-50">
              <p className="mb-1 text-xs font-medium uppercase tracking-wider text-gray-500">SHA-256 Hash</p>
              <p className="break-all font-mono text-sm text-[#0B3D91]">{hashHex}</p>
            </div>
          )}

          {/* Role & Industry */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="input-label">Role</label>
              <div className="flex gap-2">
                {ROLES.map((r) => (
                  <button key={r.value} onClick={() => setRole(r.value)} className={`flex-1 rounded-lg border px-3 py-2.5 text-sm font-medium transition-all ${role === r.value ? "border-[#0B3D91] bg-blue-50 text-[#0B3D91]" : "border-gray-200 text-gray-500 hover:border-gray-300"}`}>
                    {r.label}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="input-label">Industry</label>
              <div className="flex gap-2">
                {INDUSTRIES.map((i) => (
                  <button key={i.value} onClick={() => setIndustry(i.value)} className={`flex-1 rounded-lg border px-3 py-2.5 text-xs font-medium transition-all ${industry === i.value ? "border-[#0B3D91] bg-blue-50 text-[#0B3D91]" : "border-gray-200 text-gray-500 hover:border-gray-300"}`}>
                    {i.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Category & Visibility */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="input-label">Category</label>
              <select value={category} onChange={(e) => setCategory(e.target.value)} className="input">
                {DOC_CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
              </select>
            </div>
            <div>
              <label className="input-label">Visibility</label>
              <select value={visibility} onChange={(e) => setVisibility(e.target.value)} className="input">
                {DOC_VISIBILITIES.map((v) => <option key={v.value} value={v.value}>{v.label}</option>)}
              </select>
            </div>
          </div>

          {/* Submit */}
          {!wallet ? (
            <div className="card bg-amber-50 border-amber-200 text-center">
              <p className="text-sm text-amber-700">Connect your wallet to submit a transaction.</p>
            </div>
          ) : (
            <button onClick={handleSubmit} disabled={status !== "ready"} className={`btn-primary w-full ${status !== "ready" ? "opacity-50 cursor-not-allowed" : ""}`}>
              {status === "sending" ? (
                <><span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" /> Sending Transaction...</>
              ) : (
                "Anchor On-Chain"
              )}
            </button>
          )}

          {/* Success */}
          {status === "success" && txSig && (
            <div className="card border-green-200 bg-green-50">
              <div className="flex items-center gap-2">
                <div className="dot-green" />
                <p className="text-sm font-medium text-green-700">Record anchored successfully</p>
              </div>
              <p className="mt-3 text-xs text-gray-500">Transaction</p>
              <a href={`https://explorer.solana.com/tx/${txSig}?cluster=${CLUSTER_NAME}`} target="_blank" rel="noopener noreferrer" className="mt-1 block break-all font-mono text-sm text-[#0B3D91] underline decoration-blue-200 underline-offset-4 hover:decoration-blue-400">
                {txSig}
              </a>
            </div>
          )}

          {/* Error */}
          {status === "error" && errorMsg && (
            <div className="card border-red-200 bg-red-50">
              <div className="flex items-center gap-2">
                <div className="dot-red" />
                <p className="text-sm font-medium text-red-700">Transaction failed</p>
              </div>
              <p className="mt-2 text-sm text-gray-600">{errorMsg}</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
