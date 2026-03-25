"use client";

import { useState, useCallback, useEffect } from "react";
import { useAnchorWallet } from "@solana/wallet-adapter-react";
import { TopBar } from "@/components/layout/TopBar";
import { FileUpload } from "@/components/FileUpload";
import { hashFile, hashToHex } from "@/lib/solana/hash";
import { uploadDocument } from "@/lib/solana/program";
import { DOC_CATEGORIES, DOC_VISIBILITIES } from "@/lib/types";
import { CLUSTER_NAME } from "@/lib/solana/constants";
import { generateSymmetricKey, encryptFile, exportKey } from "@/lib/crypto";
import { uploadToIPFS } from "@/lib/ipfs";

import { useParams } from "next/navigation";

type Status = "idle" | "hashing" | "ready" | "encrypting" | "uploading" | "signing" | "indexing" | "success" | "error";

export default function UploadPage() {
  const wallet = useAnchorWallet();
  const { company_id } = useParams();

  const [file, setFile] = useState<File | null>(null);
  const [hash, setHash] = useState<Uint8Array | null>(null);
  const [hashHex, setHashHex] = useState("");
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState(1); // 1 = Security
  const [visibility, setVisibility] = useState(1); // 1 = Internal
  
  const [status, setStatus] = useState<Status>("idle");
  const [txSig, setTxSig] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  
  // Storage for keys post-upload
  const [decryptionKey, setDecryptionKey] = useState("");
  const [ipfsCid, setIpfsCid] = useState("");

  // Using the company_id from URL
  const workspacePubkeyStr = company_id as string; 

  const handleFileSelect = useCallback(async (selectedFile: File) => {
    setFile(selectedFile);
    setTitle(selectedFile.name.replace(/\.[^.]+$/, ""));
    setStatus("hashing");
    setErrorMsg("");
    setTxSig("");
    setDecryptionKey("");
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

  const handleSubmit = async () => {
    if (!wallet || !hash || !file) return;
    setStatus("encrypting");
    setErrorMsg("");
    
    try {
      // 1. Generate AES-256 Key
      const key = await generateSymmetricKey();
      const rawKey = await exportKey(key);
      const { encryptedBlob, iv } = await encryptFile(file, key);

      // Package everything in a single blob or just upload the raw encrypted content?
      // Usually you upload the encrypted file, and store the IV alongside the key or on-chain.
      // For MVP, we'll prefix the encrypted stream with the IV. This is safe.
      const ivBuffer = Buffer.from(iv, "base64");
      const combinedBlob = new Blob([ivBuffer, encryptedBlob]);

      // 2. Upload to decentralized storage
      setStatus("uploading");
      const cid = await uploadToIPFS(combinedBlob, `${hashHex}.enc`);
      setIpfsCid(cid);

      // 3. Anchor metadata on-chain
      setStatus("signing");
      
      const { PublicKey } = await import("@solana/web3.js");
      
      let workspacePK: any;
      try {
        workspacePK = new PublicKey(workspacePubkeyStr);
      } catch {
        console.warn("Invalid Workspace Pubkey. Using mock for demo.");
        workspacePK = { toBase58: () => workspacePubkeyStr, toBuffer: () => Buffer.alloc(32) };
      }
      
      let sig = "MOCK_TRANSACTION_SIG_" + Math.random().toString(36).slice(2);
      
      if (workspacePubkeyStr !== "cloudflare-mock") {
        sig = await uploadDocument(
          wallet,
          workspacePK,
          hash,
          cid,
          category,
          visibility
        );
      }
      setTxSig(sig);

      // 4. Sync Indexer
      setStatus("indexing");
      await fetch("/api/documents/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          txSig: sig,
          workspacePubkey: workspacePK.toBase58(),
          documentHash: hashHex,
          fileCid: cid,
          category,
          visibility,
          title
        })
      });

      setDecryptionKey(rawKey);
      setStatus("success");
    } catch (err: any) {
      console.error(err);
      setStatus("error");
      setErrorMsg(err?.message || "Operation failed");
    }
  };

  return (
    <>
      <TopBar title="Upload Encrypted Report" description="AES-256 encrypted, anchored on-chain." />

      <div className="min-h-screen bg-dark-900">
        <div className="mx-auto max-w-2xl p-6">
        <div className="space-y-6">
          {/* File Selection */}
          <div>
            <label className="input-label">Audit Report File</label>
            <FileUpload onFileSelect={handleFileSelect} label="Upload audit report (Auto-encrypts locally)" />
          </div>

           {/* Setup Fields */}
           {hashHex && status !== "success" && (
            <div className="space-y-6">
              <div>
                <label className="input-label">Document Title</label>
                <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} className="input" placeholder="e.g. SOC 2 Type II Report" />
              </div>

              <div className="rounded-2xl border border-dark-700 bg-dark-800 p-5 shadow-inner">
                <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-gray-500">Unencrypted SHA-256 Hash Identifier</p>
                <p className="break-all font-mono text-sm text-neon-blue font-semibold">{hashHex}</p>
                <p className="mt-3 text-[10px] text-gray-600 font-medium leading-relaxed">This hash is anchored on the Solana blockchain to ensure the mathematical integrity of the raw audit payload.</p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="input-label">Category</label>
                  <select value={category} onChange={(e) => setCategory(Number(e.target.value))} className="input">
                    {DOC_CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="input-label">Visibility</label>
                  <select value={visibility} onChange={(e) => setVisibility(Number(e.target.value))} className="input">
                    {DOC_VISIBILITIES.map((v) => <option key={v.value} value={v.value}>{v.label}</option>)}
                  </select>
                </div>
              </div>

              {/* Submit */}
              {!wallet ? (
                <div className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-4 text-center">
                  <p className="text-sm font-bold text-amber-400 tracking-wide">Wallet Authentication Required</p>
                  <p className="text-xs text-amber-500/60 mt-1">Connect your Solana wallet to anchor this document on-chain.</p>
                </div>
              ) : (
                <button 
                  onClick={handleSubmit} 
                  disabled={status !== "ready"} 
                  className={`btn-primary w-full ${status !== "ready" ? "opacity-50 cursor-not-allowed" : ""}`}
                >
                   {status === "encrypting" && "Encrypting Locally..."}
                   {status === "uploading" && "Uploading to IPFS..."}
                   {status === "signing" && "Awaiting Wallet Signature..."}
                   {status === "indexing" && "Syncing Indexer..."}
                   {status === "ready" && "Encrypt & Anchor"}
                </button>
              )}
            </div>
          )}

          {/* Success UI */}
          {status === "success" && txSig && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
              <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-6 backdrop-blur-md shadow-[0_0_30px_rgba(16,185,129,0.1)]">
                <div className="flex items-center gap-2 mb-4">
                  <div className="h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.8)] animate-pulse" />
                  <p className="text-sm font-bold text-white tracking-wide uppercase">On-Chain Anchoring Verified</p>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1.5 opacity-70">Solana Transaction Signature</p>
                    <a href={`https://explorer.solana.com/tx/${txSig}?cluster=${CLUSTER_NAME}`} target="_blank" rel="noopener noreferrer" className="block break-all font-mono text-xs text-neon-blue hover:text-white transition-colors underline decoration-brand-500/30">
                      {txSig}
                    </a>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1.5 opacity-70">IPFS Decentralized CID (Encrypted Content)</p>
                    <p className="block break-all font-mono text-xs text-white opacity-80">{ipfsCid}</p>
                  </div>
                </div>
              </div>

              {/* Security Warning: Key Reveal */}
              <div className="relative overflow-hidden rounded-2xl border border-brand-500/30 bg-dark-800 p-6 shadow-2xl">
                <div className="absolute top-0 left-0 w-1 h-full bg-brand-500" />
                <h4 className="text-[10px] font-bold uppercase tracking-widest text-brand-400 mb-2">Secret Decryption Key</h4>
                <p className="text-xs text-gray-400 mb-4 leading-relaxed">This key is generated locally and never leaves your browser. You must save it to decrypt this document in the future.</p>
                <div className="group relative">
                  <code className="block w-full p-4 bg-dark-900 border border-dark-700 rounded-xl text-xs select-all text-neon-blue break-all font-mono shadow-inner group-hover:border-brand-500/30 transition-colors">
                    {decryptionKey}
                  </code>
                </div>
              </div>
            </div>
          )}

          {/* Error */}
          {status === "error" && errorMsg && (
            <div className="rounded-2xl border border-red-500/20 bg-red-500/5 p-6 backdrop-blur-md shadow-[0_0_30px_rgba(239,68,68,0.1)]">
              <div className="flex items-center gap-2 mb-3">
                <div className="h-2 w-2 rounded-full bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.8)]" />
                <p className="text-sm font-bold text-red-400 tracking-wide uppercase">Protocol Execution Failed</p>
              </div>
              <p className="text-xs text-gray-400 font-medium leading-relaxed">{errorMsg}</p>
            </div>
          )}
        </div>
      </div>
      </div>
    </>
  );
}
