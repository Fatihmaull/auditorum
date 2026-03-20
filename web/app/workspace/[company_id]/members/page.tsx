"use client";

import { useState } from "react";
import { useAnchorWallet } from "@solana/wallet-adapter-react";
import { TopBar } from "@/components/layout/TopBar";
import { assignAuditor } from "@/lib/solana/program";
import { assignWorkspaceMember } from "@/app/actions/workspace";
import { useParams } from "next/navigation";

export default function MembersPage() {
  const wallet = useAnchorWallet();
  const { company_id } = useParams();
  
  // Auditor State
  const [auditorAddress, setAuditorAddress] = useState("");
  const [firmAddress, setFirmAddress] = useState("");
  const [expiryDays, setExpiryDays] = useState(365);
  
  // Member State
  const [memberAddress, setMemberAddress] = useState("");
  
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  const handleAssignAuditor = async () => {
    if (!wallet) return;
    setStatus("loading");
    setMessage("");

    try {
      const { PublicKey } = await import("@solana/web3.js");
      const workspacePK = new PublicKey(company_id as string);
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

  const handleAssignMember = async () => {
    if (!wallet) return;
    setStatus("loading");
    setMessage("");

    try {
      const res = await assignWorkspaceMember(company_id as string, memberAddress);
      if (res.success) {
        if (res.isMock) {
          const key = `mock_members_${company_id}`;
          const existing = JSON.parse(localStorage.getItem(key) || "[]");
          localStorage.setItem(key, JSON.stringify([...existing, memberAddress]));
          setMessage("Notice: DB Restricted. Member added to LOCAL SESSION.");
        } else {
          setMessage("Member successfully added to workspace!");
        }
        setStatus("success");
        setMemberAddress("");
      } else {
        setStatus("error");
        setMessage(res.error || "Failed to add member");
      }
    } catch (err: any) {
      setStatus("error");
      setMessage(err.message);
    }
  };

  return (
    <>
      <TopBar
        title="Access & Members"
        description="Manage on-chain Audit credentials and internal team access"
      />
      
      <div className="p-6 max-w-5xl grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Left Col: Auditor (On-chain) */}
        <div className="card bg-white h-fit">
          <div className="flex items-center gap-3 mb-6">
            <div className="h-10 w-10 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="m9 12 2 2 4-4"/></svg>
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900 leading-tight">Assign Auditor</h2>
              <p className="text-[11px] text-gray-500 uppercase font-black tracking-widest mt-0.5">On-Chain PDA Authorization</p>
            </div>
          </div>

          <div className="space-y-4 text-left">
            <div>
              <label className="input-label">Auditor Wallet Address</label>
              <input 
                type="text" 
                className="input text-sm font-mono" 
                placeholder="Solana Address" 
                value={auditorAddress}
                onChange={(e) => setAuditorAddress(e.target.value)}
              />
            </div>

            <div>
              <label className="input-label">Audit Firm Address (Optional)</label>
              <input 
                type="text" 
                className="input text-sm font-mono" 
                placeholder="Leave blank for independent" 
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

            <button 
              className="btn-primary w-full mt-4 bg-indigo-600 hover:bg-indigo-700" 
              onClick={handleAssignAuditor}
              disabled={status === "loading" || !auditorAddress || !wallet}
            >
              {status === "loading" ? "Processing..." : "Assign via Smart Contract"}
            </button>
          </div>
        </div>

        {/* Right Col: Members (Internal) */}
        <div className="card bg-white h-fit border-blue-100">
           <div className="flex items-center gap-3 mb-6">
            <div className="h-10 w-10 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900 leading-tight">Internal Company Access</h2>
              <p className="text-[11px] text-blue-500 uppercase font-black tracking-widest mt-0.5">Direct Registry Authorization</p>
            </div>
          </div>

          <div className="space-y-4 text-left">
            <div>
              <label className="input-label">Member Wallet Address</label>
              <input 
                type="text" 
                className="input text-sm font-mono" 
                placeholder="Employee Wallet Address" 
                value={memberAddress}
                onChange={(e) => setMemberAddress(e.target.value)}
              />
              <p className="mt-2 text-[10px] text-gray-400 italic">
                Authorized members can view "Restricted to Internal" documents.
              </p>
            </div>

            <button 
              className="btn-primary w-full mt-4 bg-blue-600 hover:bg-blue-700" 
              onClick={handleAssignMember}
              disabled={status === "loading" || !memberAddress || !wallet}
            >
              Authorize Corporate Member
            </button>
          </div>
        </div>

        {/* Status Message */}
        <div className="lg:col-span-2">
           {message && (
              <div className={`p-4 rounded-xl text-sm font-bold flex items-center gap-3 border shadow-sm ${status === "success" ? "bg-green-50 text-green-700 border-green-100" : "bg-red-50 text-red-700 border-red-100"}`}>
                <div className={`h-2 w-2 rounded-full ${status === "success" ? "bg-green-500" : "bg-red-500"}`}></div>
                {message}
              </div>
            )}
        </div>
      </div>
    </>
  );
}
