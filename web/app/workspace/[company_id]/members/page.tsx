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
      
      <div className="min-h-screen bg-dark-900 p-6">
        <div className="max-w-5xl grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Left Col: Auditor (On-chain) */}
        <div className="card-hover bg-dark-800 h-fit border-dark-700 shadow-2xl">
          <div className="flex items-center gap-3 mb-6">
            <div className="h-10 w-10 rounded-xl bg-brand-500/10 text-brand-400 border border-brand-500/20 flex items-center justify-center shadow-[0_0_15px_rgba(99,102,241,0.1)]">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="m9 12 2 2 4-4"/></svg>
            </div>
            <div>
              <h2 className="text-lg font-bold text-white leading-tight">Assign Auditor</h2>
              <p className="text-[10px] text-gray-500 uppercase font-bold tracking-widest mt-0.5">On-Chain PDA Authorization</p>
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
              className="btn-primary w-full mt-6 shadow-[0_0_20px_rgba(99,102,241,0.3)]" 
              onClick={handleAssignAuditor}
              disabled={status === "loading" || !auditorAddress || !wallet}
            >
              {status === "loading" ? "Processing Protocol Signature..." : "Assign via Smart Contract"}
            </button>
          </div>
        </div>

        {/* Right Col: Members (Internal) */}
        <div className="card-hover bg-dark-800 h-fit border-dark-700 shadow-2xl">
           <div className="flex items-center gap-3 mb-6">
            <div className="h-10 w-10 rounded-xl bg-neon-blue/10 text-neon-blue border border-neon-blue/20 flex items-center justify-center shadow-[0_0_15px_rgba(56,189,248,0.1)]">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
            </div>
            <div>
              <h2 className="text-lg font-bold text-white leading-tight">Corporate Access</h2>
              <p className="text-[10px] text-gray-500 uppercase font-bold tracking-widest mt-0.5">Direct Registry Authorization</p>
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
              className="btn-primary w-full mt-6 bg-dark-700 hover:bg-dark-600 text-white border-dark-600" 
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
              <div className={`p-4 rounded-xl text-sm font-bold flex items-center gap-3 border backdrop-blur-md shadow-xl animate-in fade-in slide-in-from-bottom-2 duration-500 ${status === "success" ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : "bg-red-500/10 text-red-400 border-red-500/20"}`}>
                <div className={`h-2 w-2 rounded-full ${status === "success" ? "bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]" : "bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]"}`}></div>
                {message}
              </div>
            )}
        </div>
      </div>
      </div>
    </>
  );
}
