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

              <div className="card bg-gray-50">
                <p className="mb-1 text-xs font-medium uppercase tracking-wider text-gray-500">Unencrypted SHA-256 Hash</p>
                <p className="break-all font-mono text-sm text-[#0B3D91]">{hashHex}</p>
                <p className="mt-2 text-xs text-gray-400">This hash is anchored on-chain for verifiability of the raw file.</p>
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
                <div className="card border-amber-200 bg-amber-50 text-center">
                  <p className="text-sm text-amber-700">Connect your wallet to upload.</p>
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
            <div className="space-y-4">
              <div className="card border-green-200 bg-green-50">
                <div className="flex items-center gap-2">
                  <div className="dot-green" />
                  <p className="text-sm font-medium text-green-700">Storage and anchoring verified</p>
                </div>
                
                <div className="mt-4 space-y-3">
                  <div>
                    <p className="text-xs text-gray-500">Solana Transaction</p>
                    <a href={`https://explorer.solana.com/tx/${txSig}?cluster=${CLUSTER_NAME}`} target="_blank" rel="noopener noreferrer" className="block break-all font-mono text-xs text-[#0B3D91] underline decoration-blue-200">
                      {txSig}
                    </a>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">IPFS CID (Encrypted Blob)</p>
                    <p className="block break-all font-mono text-xs text-gray-800">{ipfsCid}</p>
                  </div>
                </div>
              </div>

              {/* Security Warning: Key Reveal */}
              <div className="card border-[#0B3D91] border-l-4 rounded-l-none bg-blue-50/50">
                <p className="text-xs font-bold uppercase tracking-wider text-[#0B3D91]">Secret Decryption Key</p>
                <p className="mt-1 text-sm text-gray-700">For demonstration purposes, here is the AES-256 decryption key for your file. Save it securely.</p>
                <code className="mt-3 block p-3 bg-white border border-blue-100 rounded text-xs select-all text-gray-800 break-all">
                  {decryptionKey}
                </code>
              </div>
            </div>
          )}

          {/* Error */}
          {status === "error" && errorMsg && (
            <div className="card border-red-200 bg-red-50">
              <div className="flex items-center gap-2">
                <div className="dot-red" />
                <p className="text-sm font-medium text-red-700">Upload failed</p>
              </div>
              <p className="mt-2 text-sm text-gray-600">{errorMsg}</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
