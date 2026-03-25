import { TopBar } from "@/components/layout/TopBar";

export default function HistoryPage() {
  return (
    <>
      <TopBar title="Audit History" description="Timeline of all audit actions in your workspace" />
      <div className="min-h-screen bg-dark-900 p-6">
        <div className="card-hover bg-dark-800 border-dark-700 shadow-2xl">
          <div className="flex flex-col items-center py-16 text-center">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-dark-700 text-gray-500 shadow-inner">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
              </svg>
            </div>
            <p className="text-sm font-bold text-white tracking-wide uppercase opacity-80">No activity yet</p>
            <p className="mt-2 text-xs text-gray-500 max-w-xs leading-relaxed">
              Every on-chain event, document anchor, and intelligence indexing action will be recorded in this timeline ledger.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
