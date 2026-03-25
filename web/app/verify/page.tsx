"use client";

import { useState, useCallback } from "react";
import { PublicNavbar } from "@/components/layout/PublicNavbar";
import { FileUpload } from "@/components/FileUpload";
import { hashFile, hashToHex } from "@/lib/solana/hash";
import {
  fetchAuditRecord,
  getIndustryLabel,
  getRoleLabel,
  formatTimestamp,
  type AuditRecordData,
} from "@/lib/solana/program";

type Status = "idle" | "hashing" | "querying" | "found" | "not_found" | "error";

export default function VerifyPage() {
  const [status, setStatus] = useState<Status>("idle");
  const [hashHex, setHashHex] = useState("");
  const [record, setRecord] = useState<AuditRecordData | null>(null);
  const [errorMsg, setErrorMsg] = useState("");

  const handleFileSelect = useCallback(async (file: File) => {
    setStatus("hashing");
    setErrorMsg("");
    setRecord(null);

    try {
      const fileHash = await hashFile(file);
      const hex = hashToHex(fileHash);
      setHashHex(hex);
      setStatus("querying");

      const result = await fetchAuditRecord(fileHash);
      if (result) {
        setRecord(result);
        setStatus("found");
      } else {
        setStatus("not_found");
      }
    } catch (err: any) {
      setStatus("error");
      setErrorMsg(err?.message || "Verification failed");
    }
  }, []);

  return (
    <>
      <PublicNavbar />
      <div className="min-h-screen bg-dark-900 pt-14">
        <div className="mx-auto max-w-2xl px-6 py-10">
          <div className="page-header">
            <h1 className="page-title">Verify an Audit Report</h1>
            <p className="page-description">
              Upload a report file to check if it has been anchored on-chain. No wallet or account needed.
            </p>
          </div>

          {/* Upload */}
          <div className="mt-6">
            <FileUpload
              onFileSelect={handleFileSelect}
              label="Upload the report you want to verify"
            />
          </div>

          {/* Hash */}
          {hashHex && (
            <div className="mt-4 rounded-2xl border border-dark-700 bg-dark-800 p-5 shadow-inner">
              <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-gray-500">Document Cryptographic Hash</p>
              <p className="break-all font-mono text-sm text-neon-blue font-semibold">{hashHex}</p>
            </div>
          )}

          {/* Querying */}
          {status === "querying" && (
            <div className="mt-4 rounded-2xl border border-dark-700 bg-dark-800 p-8 text-center">
              <div className="flex flex-col items-center justify-center gap-3">
                <span className="h-6 w-6 animate-spin rounded-full border-2 border-dark-600 border-t-neon-blue" />
                <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">Querying Solana Protocol...</span>
              </div>
            </div>
          )}

          {/* Found */}
          {status === "found" && record && (
            <div className="mt-4 rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-6 backdrop-blur-md shadow-[0_0_30px_rgba(16,185,129,0.1)] animate-in zoom-in-95 duration-500">
              <div className="flex items-center gap-3 mb-6">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.2)]">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
                </div>
                <div>
                  <p className="text-sm font-bold text-white tracking-wide uppercase">On-Chain Evidence Found</p>
                  <p className="text-xs text-emerald-500/60 font-medium">Mathematical integrity anchor verified.</p>
                </div>
              </div>

              <div className="space-y-4 border-t border-white/5 pt-6">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Verification Authority</span>
                  <span className="font-mono text-xs text-white opacity-80">{record.authority.toBase58().slice(0, 8)}...{record.authority.toBase58().slice(-6)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Audit Industry</span>
                  <span className="badge-blue text-[9px] font-bold uppercase tracking-widest">{getIndustryLabel(record.industry)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Entity Role</span>
                  <span className="badge-gray text-[9px] font-bold uppercase tracking-widest">{getRoleLabel(record.role)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Attestation Status</span>
                  <span className={record.isSigned ? "badge-green text-[9px] font-bold uppercase tracking-widest" : "badge-gray text-[9px] font-bold uppercase tracking-widest"}>{record.isSigned ? "Signed" : "Pending"}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Risk Signal</span>
                  <span className={record.isFlagged ? "badge-red text-[9px] font-bold uppercase tracking-widest" : "badge-green text-[9px] font-bold uppercase tracking-widest"}>{record.isFlagged ? "Flagged" : "Clear"}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Protocol Anchor Date</span>
                  <span className="text-xs text-white opacity-70 font-medium">{formatTimestamp(record.createdAt)}</span>
                </div>
              </div>
            </div>
          )}

          {/* Not found */}
          {status === "not_found" && (
            <div className="mt-4 rounded-2xl border border-amber-500/20 bg-amber-500/5 p-6 backdrop-blur-md shadow-xl animate-in shake duration-500">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/20 shadow-[0_0_15px_rgba(245,158,11,0.2)]">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                </div>
                <div>
                  <p className="text-sm font-bold text-white tracking-wide uppercase">No Evidence Found</p>
                  <p className="text-xs text-amber-500/60 font-medium">This document is not anchored on the protocol.</p>
                </div>
              </div>
            </div>
          )}

          {/* Error */}
          {status === "error" && (
            <div className="mt-4 rounded-2xl border border-red-500/20 bg-red-500/5 p-6 backdrop-blur-md shadow-xl">
              <div className="flex items-center gap-3 mb-2">
                <div className="h-2 w-2 rounded-full bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]" />
                <p className="text-sm font-bold text-red-400 tracking-wide uppercase">System Obstruction</p>
              </div>
              <p className="text-xs text-gray-500 font-medium leading-relaxed">{errorMsg}</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
