"use client";

import { useState } from "react";
import { useAnchorWallet } from "@solana/wallet-adapter-react";
import { TopBar } from "@/components/layout/TopBar";
import { assignAuditor } from "@/lib/solana/program";
import { PublicKey } from "@solana/web3.js";

export default function MembersPage() {
  const wallet = useAnchorWallet();
  const [auditorAddress, setAuditorAddress] = useState("");
  const [firmAddress, setFirmAddress] = useState("");
  const [expiryDays, setExpiryDays] = useState(365);
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  const handleAssign = async () => {
    if (!wallet) return;
    setStatus("loading");
    setMessage("");

    try {
      const { PublicKey } = await import("@solana/web3.js");
      // FOR DEMO: Using the placeholder workspace
      const workspacePubkeyStr = "AUDTRMxKvMbFCPn3KhUmD9FwPsAqkJx2RMwUG8gu4wnc";
      const workspacePK = new PublicKey(workspacePubkeyStr);
      const auditorPK = new PublicKey(auditorAddress);
      const firmPK = firmAddress ? new PublicKey(firmAddress) : PublicKey.default;
      
      const expiryTimestamp = Math.floor(Date.now() / 1000) + (expiryDays * 24 * 60 * 60);

      const sig = await assignAuditor(
        wallet,
        workspacePK,
        auditorPK,
        firmPK,
        expiryTimestamp
      );

      setStatus("success");
      setMessage(`Auditor successfully assigned on-chain! Tx: ${sig.slice(0,10)}...`);
      setAuditorAddress("");
      setFirmAddress("");
    } catch (err: any) {
      console.error(err);
      setStatus("error");
      setMessage(err.message || "Failed to assign auditor");
    }
  };

  return (
    <>
      <TopBar
        title="Access & Members"
        description="Assign on-chain Auditor PDAs to your workspace"
      />
      
      <div className="p-6 max-w-2xl">
        <div className="card bg-white mt-4">
          <h2 className="text-lg font-semibold text-gray-900">Assign Auditor Access</h2>
          <p className="text-sm text-gray-500 mb-6">
            Grant permission for an auditor wallet to upload verified documents on behalf of this workspace.
          </p>

          <div className="space-y-4 text-left">
            <div>
              <label className="input-label">Auditor Wallet Address</label>
              <input 
                type="text" 
                className="input" 
                placeholder="e.g. 5xV..." 
                value={auditorAddress}
                onChange={(e) => setAuditorAddress(e.target.value)}
              />
            </div>

            <div>
              <label className="input-label">Audit Firm Address (Optional)</label>
              <input 
                type="text" 
                className="input" 
                placeholder="Leave blank for independent auditor" 
                value={firmAddress}
                onChange={(e) => setFirmAddress(e.target.value)}
              />
            </div>

            <div>
              <label className="input-label">Access Duration (Days)</label>
              <input 
                type="number" 
                className="input" 
                value={expiryDays}
                onChange={(e) => setExpiryDays(Number(e.target.value))}
              />
            </div>

            {!wallet ? (
              <div className="p-3 text-sm text-amber-700 bg-amber-50 rounded text-center">
                Connect wallet to assign members
              </div>
            ) : (
              <button 
                className="btn-primary w-full mt-4" 
                onClick={handleAssign}
                disabled={status === "loading" || !auditorAddress}
              >
                {status === "loading" ? "Processing on-chain..." : "Assign via Smart Contract"}
              </button>
            )}

            {message && (
              <div className={`mt-4 p-3 rounded text-sm ${status === "success" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}>
                {message}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
