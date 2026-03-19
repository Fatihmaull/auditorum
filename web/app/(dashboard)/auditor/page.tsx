import { TopBar } from "@/components/layout/TopBar";

export default function AuditorDashboard() {
  return (
    <>
      <TopBar title="Auditor Dashboard" description="Your assigned contracts and audit tasks" />
      <div className="p-6">
        {/* Active contracts */}
        <h2 className="mb-4 text-sm font-semibold text-gray-900">Active Contracts</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div className="card border-dashed border-gray-300">
            <div className="flex flex-col items-center py-6 text-center">
              <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-lg bg-gray-50">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z"/><path d="M14 2v6h6"/>
                </svg>
              </div>
              <p className="text-sm text-gray-500">No active contracts</p>
              <p className="mt-1 text-xs text-gray-400">When a company assigns you an audit contract, it will appear here.</p>
            </div>
          </div>
        </div>

        {/* Recent action */}
        <h2 className="mb-4 mt-8 text-sm font-semibold text-gray-900">Quick Actions</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="card-hover cursor-pointer">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-[#0B3D91]">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">Upload Audit Report</p>
                <p className="text-xs text-gray-500">Submit findings for a contract</p>
              </div>
            </div>
          </div>
          <div className="card-hover cursor-pointer">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-50 text-green-700">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">Sign Audit Record</p>
                <p className="text-xs text-gray-500">Co-sign an existing on-chain record</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
