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
      <div className="min-h-screen bg-[#FAFAF8] pt-14">
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
            <div className="mt-4 card bg-white">
              <p className="mb-1 text-xs font-medium uppercase tracking-wider text-gray-400">SHA-256 Hash</p>
              <p className="break-all font-mono text-sm text-[#0B3D91]">{hashHex}</p>
            </div>
          )}

          {/* Querying */}
          {status === "querying" && (
            <div className="mt-4 card bg-white text-center">
              <div className="flex items-center justify-center gap-2">
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-gray-200 border-t-[#0B3D91]" />
                <span className="text-sm text-gray-500">Searching blockchain...</span>
              </div>
            </div>
          )}

          {/* Found */}
          {status === "found" && record && (
            <div className="mt-4 card border-green-200 bg-green-50">
              <div className="flex items-center gap-2 mb-4">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
                </div>
                <div>
                  <p className="text-sm font-semibold text-green-800">Verified</p>
                  <p className="text-xs text-green-600">This document has been anchored on-chain.</p>
                </div>
              </div>

              <div className="space-y-3 border-t border-green-200 pt-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">Authority</span>
                  <span className="font-mono text-xs text-gray-700">{record.authority.toBase58().slice(0, 8)}...{record.authority.toBase58().slice(-6)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">Industry</span>
                  <span className="badge-blue">{getIndustryLabel(record.industry)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">Role</span>
                  <span className="badge-gray">{getRoleLabel(record.role)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">Signed</span>
                  <span className={record.isSigned ? "badge-green" : "badge-gray"}>{record.isSigned ? "Yes" : "No"}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">Flagged</span>
                  <span className={record.isFlagged ? "badge-red" : "badge-gray"}>{record.isFlagged ? "Yes" : "No"}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">Anchored</span>
                  <span className="text-xs text-gray-700">{formatTimestamp(record.createdAt)}</span>
                </div>
              </div>
            </div>
          )}

          {/* Not found */}
          {status === "not_found" && (
            <div className="mt-4 card border-amber-200 bg-amber-50">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-100">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#d97706" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                </div>
                <div>
                  <p className="text-sm font-semibold text-amber-800">Not Found</p>
                  <p className="text-xs text-amber-600">No on-chain record matches this document.</p>
                </div>
              </div>
            </div>
          )}

          {/* Error */}
          {status === "error" && (
            <div className="mt-4 card border-red-200 bg-red-50">
              <p className="text-sm font-medium text-red-700">Error</p>
              <p className="mt-1 text-sm text-gray-600">{errorMsg}</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
