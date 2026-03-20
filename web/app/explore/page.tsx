import { PublicNavbar } from "@/components/layout/PublicNavbar";
import { createAdminClient } from "@/lib/supabase/admin";
import Link from "next/link";

export default async function ExplorePage() {
  const supabase = createAdminClient();
  const { data: records } = await supabase
    .from("documents")
    .select("*, workspaces(company_name)")
    .eq("visibility", "public")
    .order("created_at", { ascending: false });

  const docs = records || [];

  return (
    <>
      <PublicNavbar />
      <div className="min-h-screen bg-[#FAFAF8] pt-14">
        <div className="section py-10">
          <div className="page-header">
            <h1 className="page-title">Explore Public Audits</h1>
            <p className="page-description">Search and filter publicly anchored audit records on Solana.</p>
          </div>

          {/* Search + Filters */}
          <div className="mb-6 flex flex-wrap items-center gap-3">
            <div className="flex flex-1 items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2.5">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <input type="text" placeholder="Search by company, hash, or category..." className="w-full border-none bg-transparent text-sm text-gray-900 outline-none placeholder:text-gray-400" />
            </div>
            <select className="input w-auto">
              <option value="">All Categories</option>
              <option value="financial">Financial</option>
              <option value="security">Security</option>
              <option value="compliance">Compliance</option>
            </select>
          </div>

          {/* Results */}
          <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Company</th>
                  <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Hash</th>
                  <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Category</th>
                  <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Anchored</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {docs.length === 0 ? (
                  <tr>
                    <td colSpan={4}>
                      <div className="flex flex-col items-center py-12 text-center">
                        <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-gray-50">
                          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
                          </svg>
                        </div>
                        <p className="text-sm font-medium text-gray-500">No public records yet</p>
                        <p className="mt-1 text-xs text-gray-400">Publicly anchored audit records will appear here.</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  docs.map((doc: any) => (
                    <tr key={doc.pubkey} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">{doc.workspaces?.company_name}</td>
                      <td className="px-4 py-3 text-sm text-[#0B3D91] font-mono">
                        <Link href={`/verify?hash=${doc.document_hash}`} className="hover:underline">
                          {doc.document_hash.slice(0, 16)}...
                        </Link>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600 capitalize">{doc.category}</td>
                      <td className="px-4 py-3 text-sm text-gray-500">{new Date(doc.created_at).toLocaleDateString()}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
}
