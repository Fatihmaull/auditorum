"use client";

import { useState, useCallback } from "react";
import { FileUpload } from "@/components/FileUpload";
import { hashFile, hashToHex } from "@/lib/hash";
import {
  fetchAuditRecord,
  getIndustryLabel,
  getRoleLabel,
  formatTimestamp,
  AuditRecordData,
} from "@/lib/program";
import { CLUSTER_NAME } from "@/lib/constants";

type Status = "idle" | "hashing" | "searching" | "found" | "not_found" | "error";

export default function VerifyPage() {
  const [hashHex, setHashHex] = useState<string>("");
  const [status, setStatus] = useState<Status>("idle");
  const [record, setRecord] = useState<AuditRecordData | null>(null);
  const [errorMsg, setErrorMsg] = useState<string>("");

  const handleFileSelect = useCallback(async (file: File) => {
    setStatus("hashing");
    setRecord(null);
    setErrorMsg("");

    try {
      const hash = await hashFile(file);
      const hex = hashToHex(hash);
      setHashHex(hex);
      setStatus("searching");

      const result = await fetchAuditRecord(hash);

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
    <div className="glow relative py-24">
      <div className="section max-w-2xl">
        <div className="mb-2 text-xs font-medium uppercase tracking-[0.2em] text-white/30">
          Verify
        </div>
        <h1 className="font-serif text-3xl sm:text-4xl">
          Verify an Audit Report
        </h1>
        <p className="mt-3 text-white/40">
          Upload a report file to check if it has been anchored on-chain. No
          wallet or account needed.
        </p>

        <div className="mt-10 space-y-6">
          {/* File Upload */}
          <div>
            <label className="mb-2 block text-sm font-medium text-white/60">
              Report File
            </label>
            <FileUpload
              onFileSelect={handleFileSelect}
              label="Upload the report you want to verify"
            />
          </div>

          {/* Searching indicator */}
          {status === "searching" && (
            <div className="card flex items-center gap-3">
              <span className="h-5 w-5 animate-spin rounded-full border-2 border-accent/30 border-t-accent" />
              <p className="text-sm text-white/60">
                Querying Solana {CLUSTER_NAME}...
              </p>
            </div>
          )}

          {/* Hash display */}
          {hashHex && status !== "searching" && (
            <div className="card">
              <p className="mb-1 text-xs font-medium uppercase tracking-wider text-white/30">
                SHA-256 Hash
              </p>
              <p className="break-all font-mono text-sm text-accent-light">
                {hashHex}
              </p>
            </div>
          )}

          {/* ====== VERIFIED ====== */}
          {status === "found" && record && (
            <div className="card border-green-500/20 bg-green-500/5">
              {/* Header */}
              <div className="mb-6 flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-500/10">
                  <svg
                    width="28"
                    height="28"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#4ade80"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M20 6 9 17l-5-5" />
                  </svg>
                </div>
                <div>
                  <p className="text-lg font-semibold text-green-400">
                    Verified ✓
                  </p>
                  <p className="text-sm text-white/40">
                    This report matches an on-chain record
                  </p>
                </div>
              </div>

              {/* Details */}
              <div className="space-y-3 border-t border-green-500/10 pt-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-white/40">Authority</span>
                  <span className="font-mono text-sm text-white/70">
                    {record.authority.toBase58().slice(0, 8)}...
                    {record.authority.toBase58().slice(-8)}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-white/40">Industry</span>
                  <span className="text-sm font-medium text-white/70">
                    {getIndustryLabel(record.industry)}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-white/40">Role</span>
                  <span className="text-sm font-medium text-white/70">
                    {getRoleLabel(record.role)}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-white/40">Anchored</span>
                  <span className="text-sm font-medium text-white/70">
                    {formatTimestamp(record.createdAt)}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-white/40">Network</span>
                  <span className="inline-flex items-center gap-1.5 text-sm font-medium text-white/70">
                    <span className="status-dot-success" />
                    Solana {CLUSTER_NAME}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* ====== NOT FOUND ====== */}
          {status === "not_found" && (
            <div className="card border-yellow-500/20 bg-yellow-500/5">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-yellow-500/10">
                  <svg
                    width="28"
                    height="28"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#facc15"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="8" x2="12" y2="12" />
                    <line x1="12" y1="16" x2="12.01" y2="16" />
                  </svg>
                </div>
                <div>
                  <p className="text-lg font-semibold text-yellow-400">
                    Not Found
                  </p>
                  <p className="text-sm text-white/40">
                    No on-chain record matches this file hash. This
                    report has not been anchored on Auditorum.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* ====== ERROR ====== */}
          {status === "error" && errorMsg && (
            <div className="card border-red-500/20 bg-red-500/5">
              <div className="flex items-center gap-2">
                <div className="status-dot-error" />
                <p className="text-sm font-medium text-red-400">
                  Verification error
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
