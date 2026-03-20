"use client";

import { useState, useCallback } from "react";
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

export default function AuditorUploadPage() {
  const wallet = useAnchorWallet();
  const { company_id } = useParams();
  const workspacePubkeyStr = company_id as string;

  const [file, setFile] = useState<File | null>(null);
  const [hash, setHash] = useState<Uint8Array | null>(null);
  const [hashHex, setHashHex] = useState("");
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState(1); // 1 = Security
  const [visibility, setVisibility] = useState(1); // 1 = Internal
  
  const [status, setStatus] = useState<Status>("idle");
  const [txSig, setTxSig] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  
  const [decryptionKey, setDecryptionKey] = useState("");
  const [ipfsCid, setIpfsCid] = useState("");

  const handleFileSelect = useCallback(async (selectedFile: File) => {
    setFile(selectedFile);
    setTitle(selectedFile.name.replace(/\.[^.]+$/, ""));
    setStatus("hashing");
    setErrorMsg("");
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
      const key = await generateSymmetricKey();
      const rawKey = await exportKey(key);
      const { encryptedBlob, iv } = await encryptFile(file, key);
      const ivBuffer = Buffer.from(iv, "base64");
      const combinedBlob = new Blob([ivBuffer, encryptedBlob]);

      setStatus("uploading");
      const cid = await uploadToIPFS(combinedBlob, `${hashHex}.enc`);
      setIpfsCid(cid);

      setStatus("signing");
      const { PublicKey } = await import("@solana/web3.js");
      
      let workspacePK: any;
      try {
        workspacePK = new PublicKey(workspacePubkeyStr);
      } catch {
        workspacePK = { toBase58: () => workspacePubkeyStr, toBuffer: () => Buffer.alloc(32) };
      }
      
      let sig = "MOCK_TRANSACTION_SIG_" + Math.random().toString(36).slice(2);
      
      if (workspacePubkeyStr !== "cloudflare-mock") {
        sig = await uploadDocument(wallet, workspacePK, hash, cid, category, visibility);
      }
      setTxSig(sig);

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
      <TopBar 
        title="Submit Audit Report" 
        description="Encrypted submission for this workspace context." 
      />

      <div className="mx-auto max-w-2xl p-6">
        <div className="space-y-6">
          <div>
            <label className="input-label">Audit Report File</label>
            <FileUpload onFileSelect={handleFileSelect} label="Upload audit report (Auto-encrypts locally)" />
          </div>

           {hashHex && status !== "success" && (
            <div className="space-y-6">
              <div>
                <label className="input-label">Document Title</label>
                <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} className="input" placeholder="e.g. SOC 2 Type II Report" />
              </div>

              <div className="card bg-gray-50">
                <p className="mb-1 text-xs font-medium uppercase tracking-wider text-gray-500">Unencrypted SHA-256 Hash</p>
                <p className="break-all font-mono text-sm text-[#0B3D91]">{hashHex}</p>
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

              {!wallet ? (
                <div className="card border-amber-200 bg-amber-50 text-center">
                  <p className="text-sm text-amber-700">Connect your wallet to submit.</p>
                </div>
              ) : (
                <button 
                  onClick={handleSubmit} 
                  disabled={status !== "ready"} 
                  className={`btn-primary w-full ${status !== "ready" ? "opacity-50 cursor-not-allowed" : ""}`}
                >
                   {status === "encrypting" && "Encrypting locally..."}
                   {status === "uploading" && "External storage sync..."}
                   {status === "signing" && "Awaiting wallet..."}
                   {status === "indexing" && "Finalizing indexing..."}
                   {status === "ready" && "Encrypt & Submit"}
                </button>
              )}
            </div>
          )}

          {status === "success" && txSig && (
            <div className="space-y-4">
              <div className="card border-green-200 bg-green-50">
                <div className="flex items-center gap-2">
                  <div className="dot-green" />
                  <p className="text-sm font-medium text-green-700">Audit report submitted successfully</p>
                </div>
                
                <div className="mt-4 space-y-3 font-mono text-xs">
                   <div>
                    <p className="text-gray-500 uppercase">Solana Sig</p>
                    <p className="break-all text-[#0B3D91]">{txSig}</p>
                   </div>
                   <div>
                    <p className="text-gray-500 uppercase">IPFS CID</p>
                    <p className="break-all text-gray-800">{ipfsCid}</p>
                   </div>
                </div>
              </div>

              <div className="card border-[#0B3D91] border-l-4 rounded-l-none bg-blue-50/50">
                <p className="text-xs font-bold uppercase tracking-wider text-[#0B3D91]">Secret Decryption Key</p>
                <code className="mt-2 block p-3 bg-white border border-blue-100 rounded text-xs select-all text-gray-800 break-all">
                  {decryptionKey}
                </code>
              </div>
            </div>
          )}

          {status === "error" && errorMsg && (
            <div className="card border-red-200 bg-red-50 text-red-700 text-sm">
              {errorMsg}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
