import { TopBar } from "@/components/layout/TopBar";

export default function HistoryPage() {
  return (
    <>
      <TopBar title="Audit History" description="Timeline of all audit actions in your workspace" />
      <div className="p-6">
        <div className="card">
          <div className="flex flex-col items-center py-12 text-center">
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-gray-50">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
              </svg>
            </div>
            <p className="text-sm font-medium text-gray-500">No activity yet</p>
            <p className="mt-1 text-xs text-gray-400">Actions like uploads, verifications, and flags will appear here.</p>
          </div>
        </div>
      </div>
    </>
  );
}
