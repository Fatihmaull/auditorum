import { TopBar } from "@/components/layout/TopBar";
import { getSession } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import Link from "next/link";

export default async function AuditorDashboard() {
  const session = await getSession();
  const supabase = createAdminClient();

  // For the MVP Auditor view, we fetch documents that are either publicly visible or explicitly assigned
  // Since we haven't built the assignment UI yet, fetch all documents on the platform that are NOT acknowledged (pending review).
  const { data: allPending } = await supabase
    .from("documents")
    .select("*")
    .eq("is_acknowledged", false)
    .order("created_at", { ascending: false })
    .limit(10);

  const pendingDocs = allPending || [];

  return (
    <>
      <TopBar title="Auditor Dashboard" description="Your assigned contracts and audit tasks" />
      <div className="p-6">
        {/* Active contracts stats */}
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="card">
            <p className="text-xs font-medium text-gray-500">Pending Reviews</p>
            <p className="mt-1 text-2xl font-semibold text-amber-700">{pendingDocs.length}</p>
          </div>
          <div className="card">
            <p className="text-xs font-medium text-gray-500">Completed Audits</p>
            <p className="mt-1 text-2xl font-semibold text-green-700">0</p>
          </div>
          <div className="card">
            <p className="text-xs font-medium text-gray-500">Flagged Findings</p>
            <p className="mt-1 text-2xl font-semibold text-red-700">0</p>
          </div>
        </div>

        {/* Global Pending Queue */}
        <h2 className="mb-4 mt-8 text-sm font-semibold text-gray-900">Global Pending Queue (MVP)</h2>
        {pendingDocs.length === 0 ? (
          <div className="card border-dashed border-gray-300">
            <div className="flex flex-col items-center py-10 text-center">
              <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-gray-50">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z"/><path d="M14 2v6h6"/>
                </svg>
              </div>
              <p className="text-sm font-medium text-gray-500">No documents pending review</p>
            </div>
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {pendingDocs.map((doc: any) => (
              <div key={doc.pubkey} className="card p-4 hover:border-[#0B3D91]/30 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-amber-50 text-amber-700">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-gray-900">Hash: {doc.document_hash.slice(0, 12)}...</p>
                    <p className="truncate text-xs text-gray-500">Workspace: {doc.workspace_pubkey.slice(0, 8)}...</p>
                  </div>
                  <button className="btn-primary py-1.5 px-3 text-xs">Review</button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Recent action */}
        <h2 className="mb-4 mt-8 text-sm font-semibold text-gray-900">Auditor Tools</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <Link href="/verify" className="card-hover group cursor-pointer block">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-50 text-green-700">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">Verify & Acknowledge</p>
                <p className="text-xs text-gray-500">Cryptographically verify client payloads</p>
              </div>
            </div>
          </Link>
          <div className="card-hover cursor-pointer opacity-50">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-50 text-red-700">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><line x1="4" y1="22" x2="4" y2="15"/>
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">Flag Finding</p>
                <p className="text-xs text-gray-500">Raise an on-chain discrepancy flag</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
