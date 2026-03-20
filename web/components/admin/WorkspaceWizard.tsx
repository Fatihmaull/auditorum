"use client";

import { useState } from "react";
import { createWorkspace } from "@/app/actions/workspace";

export function WorkspaceWizard(): React.ReactNode {
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    companyName: "",
    adminWallet: "",
    plan: "Enterprise",
    maxDocs: 1000
  });

  const handleCreate = async () => {
    setLoading(true);
    try {
      const res = await createWorkspace(formData) as any;
      if (res.success) {
        if (res.isMock) {
          const mockWs = {
            pubkey: res.pubkey,
            company_name: formData.companyName,
            admin_pubkey: formData.adminWallet
          };
          const existing = JSON.parse(localStorage.getItem("auditorum_mock_workspaces") || "[]");
          localStorage.setItem("auditorum_mock_workspaces", JSON.stringify([...existing, mockWs]));
          alert("Notice: Database permission restricted (42501). Workspace created in LOCAL SESSION for demonstration.");
        } else {
          alert("Workspace Created Successfully!");
        }
        setIsOpen(false);
        setStep(1);
        window.location.reload(); 
      } else {
        alert("Error: " + res.error);
      }
    } catch (err: any) {
      alert("Error: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) {
    return (
      <button 
        onClick={() => setIsOpen(true)}
        className="btn-primary flex items-center gap-2"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14M5 12h14"/></svg>
        Provision New Workspace
      </button>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden border border-gray-100 flex flex-col">
        
        {/* Header & Progress */}
        <div className="bg-gray-50 border-b border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-black text-gray-900">Workspace Provisioning</h3>
            <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          </div>
          <div className="flex gap-2">
            {[1, 2, 3].map((s) => (
              <div 
                key={s} 
                className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${step >= s ? 'bg-blue-600' : 'bg-gray-200'}`}
              ></div>
            ))}
          </div>
        </div>

        {/* Form Body */}
        <div className="p-8 flex-1">
          {step === 1 && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="mb-6">
                <div className="h-12 w-12 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center mb-4">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
                </div>
                <h4 className="text-lg font-bold text-gray-900">Step 1: Identity & Branding</h4>
                <p className="text-sm text-gray-500 mt-1">Define the visual and legal identity for this enclosure.</p>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5 ml-1">Company Name</label>
                  <input 
                    type="text" 
                    placeholder="e.g. OpenAI, SpaceX"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none"
                    value={formData.companyName}
                    onChange={(e) => setFormData({...formData, companyName: e.target.value})}
                  />
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="mb-6">
                <div className="h-12 w-12 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center mb-4">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                </div>
                <h4 className="text-lg font-bold text-gray-900">Step 2: Administration</h4>
                <p className="text-sm text-gray-500 mt-1">Assign a primary controller wallet for this workspace.</p>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5 ml-1">Admin Wallet Address</label>
                  <input 
                    type="text" 
                    placeholder="Solana Base58 Address"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all outline-none font-mono text-sm"
                    value={formData.adminWallet}
                    onChange={(e) => setFormData({...formData, adminWallet: e.target.value})}
                  />
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="mb-6">
                <div className="h-12 w-12 rounded-xl bg-green-100 text-green-600 flex items-center justify-center mb-4">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg>
                </div>
                <h4 className="text-lg font-bold text-gray-900">Step 3: Protocol Controls</h4>
                <p className="text-sm text-gray-500 mt-1">Configure limits and resource allocation on-chain.</p>
              </div>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                   <button 
                    onClick={() => setFormData({...formData, plan: "Starter", maxDocs: 100})}
                    className={`p-4 rounded-xl border text-left transition-all ${formData.plan === "Starter" ? 'border-green-500 bg-green-50 text-green-900' : 'border-gray-100 hover:border-gray-200 text-gray-600'}`}
                   >
                      <p className="text-[10px] font-bold uppercase tracking-widest mb-1">Starter Pack</p>
                      <p className="text-sm font-bold">100 Docs</p>
                   </button>
                   <button 
                    onClick={() => setFormData({...formData, plan: "Enterprise", maxDocs: 2500})}
                    className={`p-4 rounded-xl border text-left transition-all ${formData.plan === "Enterprise" ? 'border-green-500 bg-green-50 text-green-900' : 'border-gray-100 hover:border-gray-200 text-gray-600'}`}
                   >
                      <p className="text-[10px] font-bold uppercase tracking-widest mb-1">Enterprise</p>
                      <p className="text-sm font-bold">Infinite* Docs</p>
                   </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-6 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
          <button 
            onClick={() => setStep(step - 1)}
            disabled={step === 1 || loading}
            className="btn-secondary disabled:opacity-30"
          >
            Back
          </button>
          
          {step < 3 ? (
            <button 
              onClick={() => setStep(step + 1)}
              className="btn-primary"
            >
              Next Step
            </button>
          ) : (
            <button 
              onClick={handleCreate}
              disabled={loading || !formData.companyName || !formData.adminWallet}
              className="btn-primary bg-gray-900 hover:bg-black"
            >
              {loading ? "Provisioning..." : "Finalize & Launch"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
