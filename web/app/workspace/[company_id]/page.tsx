import { TopBar } from "@/components/layout/TopBar";
import Link from "next/link";
import { getSession } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";

export default async function WorkspacePage({ params }: { params: { company_id: string } }) {
  const { company_id } = params;
  const session = await getSession();
  const supabase = createAdminClient();

  // In a real app we derive the active workspace from the URL or User Profile.
  // For the MVP demo, we will query all documents uploaded by this wallet or assigned to this wallet.
  const { data: myDocs } = await supabase
    .from("documents")
    .select("*")
    .eq("workspace_pubkey", company_id);

  const docs = myDocs || [];
  const totalDocs = docs.length;
  const anchored = docs.length; // All are anchored in V2 if they are in the DB
  const pending = docs.filter(d => !d.is_acknowledged).length;
  const flagged = docs.filter(d => d.is_flagged).length;

  return (
    <>
      <TopBar title="Workspace" description="Your audit workspace overview" />

      <div className="p-6">
        {/* Role Banner */}
        <div className="mb-6 rounded-lg border border-blue-100 bg-gradient-to-r from-blue-50 to-white p-5 shadow-sm">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-blue-100 text-[#0B3D91]">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>
            </div>
            <div>
              <h2 className="text-base font-bold text-[#0B3D91]">
                {session?.wallet ? "Wallet Connected" : "View-Only Mode"}
              </h2>
              <p className="mt-1 text-sm text-gray-600">
                You are interacting with the V2 Auditorum Protocol. Your on-chain role dictates your permissions:
              </p>
              <ul className="mt-2 list-inside list-disc text-xs text-gray-500 space-y-1">
                <li><strong className="text-gray-700">Company Admin:</strong> Can create workspaces, manage access, and acknowledge received audits.</li>
                <li><strong className="text-gray-700">Assigned Auditor:</strong> Can upload encrypted reports (AES-256) directly to the blockchain IPFS node.</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { label: "Total Documents", value: totalDocs.toString(), color: "bg-blue-50 text-[#0B3D91]" },
            { label: "Anchored On-Chain", value: anchored.toString(), color: "bg-green-50 text-green-700" },
            { label: "Pending Review", value: pending.toString(), color: "bg-amber-50 text-amber-700" },
            { label: "Flagged", value: flagged.toString(), color: "bg-red-50 text-red-700" },
          ].map((stat) => (
            <div key={stat.label} className="card">
              <p className="text-xs font-medium text-gray-500">{stat.label}</p>
              <p className={`mt-1 text-2xl font-semibold ${stat.color.split(" ")[1]}`}>
                {stat.value}
              </p>
            </div>
          ))}
        </div>

        {/* Quick actions */}
        <div className="mt-8">
          <h2 className="mb-4 text-sm font-semibold text-gray-900">
            Quick Actions
          </h2>
          <div className="grid gap-4 sm:grid-cols-3">
            <Link href={`/workspace/${company_id}/upload`} className="card-hover group">
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-[#0B3D91] transition-colors group-hover:bg-blue-100">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="17 8 12 3 7 8" />
                  <line x1="12" y1="3" x2="12" y2="15" />
                </svg>
              </div>
              <h3 className="text-sm font-medium text-gray-900">Upload Report</h3>
              <p className="mt-0.5 text-xs text-gray-500">AES-256 Encrypt & Anchor</p>
            </Link>

            <Link href="/verify" className="card-hover group">
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-green-50 text-green-700 transition-colors group-hover:bg-green-100">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z" />
                  <path d="m9 12 2 2 4-4" />
                </svg>
              </div>
              <h3 className="text-sm font-medium text-gray-900">Verify Report</h3>
              <p className="mt-0.5 text-xs text-gray-500">Check IPFS payload vs On-Chain Hash</p>
            </Link>

            <Link href={`/workspace/${company_id}/members`} className="card-hover group">
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-purple-50 text-purple-700 transition-colors group-hover:bg-purple-100">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                  <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
              </div>
              <h3 className="text-sm font-medium text-gray-900">Manage Access</h3>
              <p className="mt-0.5 text-xs text-gray-500">Assign Auditor PDAs on-chain</p>
            </Link>
          </div>
        </div>

        {/* Recent documents */}
        <div className="mt-8">
          <h2 className="mb-4 text-sm font-semibold text-gray-900">
            Recent Indexed Documents
          </h2>
          {docs.length === 0 ? (
            <div className="card">
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-gray-50">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z" />
                    <path d="M14 2v6h6" />
                  </svg>
                </div>
                <p className="text-sm font-medium text-gray-500">No documents indexed yet</p>
                <p className="mt-1 text-xs text-gray-400">Upload your first audit report.</p>
              </div>
            </div>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              {docs.slice(0, 4).map((doc: any) => (
                <div key={doc.pubkey} className="card p-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-blue-50 text-[#0B3D91]">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z"/><path d="M14 2v6h6"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-gray-900">Document {doc.document_hash.slice(0, 8)}...</p>
                      <p className="truncate text-xs text-gray-500">IPFS: {doc.file_cid.slice(0, 16)}...</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
