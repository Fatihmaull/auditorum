"use client";

import { CompanySidebar } from "@/components/layout/CompanySidebar";
import { WorkspaceCopilot } from "@/components/ai/WorkspaceCopilot";
import { useState } from "react";

export default function WorkspaceLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { company_id: string };
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-dark-900 flex overflow-x-hidden">
      {/* Sidebar Overlay for Mobile */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden transition-opacity"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 transform transition-transform duration-300 lg:translate-x-0 lg:static lg:inset-auto ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <CompanySidebar companyId={params.company_id} />
      </div>

      {/* Main Content */}
      <div className="flex-1 min-h-screen flex flex-col relative">
        {/* Mobile Header */}
        <div className="lg:hidden flex h-14 items-center justify-between border-b border-white/5 bg-dark-900/80 px-4 backdrop-blur-md sticky top-0 z-30">
          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-brand-500 text-[10px] font-black text-white shadow-[0_0_12px_rgba(99,102,241,0.5)]">
            A
          </div>
          <button 
            onClick={() => setIsSidebarOpen(true)}
            className="flex h-8 w-8 items-center justify-center rounded-lg bg-dark-800 border border-white/5 text-gray-400"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </button>
        </div>

        {children}
      </div>

      <WorkspaceCopilot workspacePubkey={params.company_id} />
    </div>
  );
}
