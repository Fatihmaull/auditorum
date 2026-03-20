import { TopBar } from "@/components/layout/TopBar";
import { createAdminClient } from "@/lib/supabase/admin";
import Link from "next/link";
import { getSession } from "@/lib/auth";

export default async function DocumentsPage({ params }: { params: { company_id: string } }) {
  const session = await getSession();
  const supabase = createAdminClient();
  
  // 1. Fetch Workspace & Membership Info
  const { data: workspace } = await supabase
    .from("workspaces")
    .select("admin_pubkey")
    .eq("pubkey", params.company_id)
    .single();

  const isAdmin = session?.wallet?.toLowerCase() === workspace?.admin_pubkey?.toLowerCase();
  
  // Check for membership
  let isMember = false;
  if (session?.wallet) {
    const { data: membership } = await supabase
      .from("workspace_members")
      .select("id")
      .eq("workspace_pubkey", params.company_id)
      .eq("user_wallet", session.wallet)
      .single();
    if (membership) isMember = true;
  }

  // 2. Fetch Documents
  let query = supabase
    .from("documents")
    .select("*")
    .eq("workspace_pubkey", params.company_id);

  // If not admin or member, only show public docs
  if (!isAdmin && !isMember) {
    query = query.eq("visibility", "public");
  }

  const { data: myDocs } = await query.order("created_at", { ascending: false });
  const docs = myDocs || [];

  return (
    <>
      <TopBar
        title="Documents"
        description="All audit reports in your workspace"
        actions={
          <Link href={`/workspace/${params.company_id}/upload`} className="btn-primary btn-sm">
            Upload Report
          </Link>
        }
      />

      <div className="p-6">
        {/* Filters */}
        <div className="mb-4 flex items-center gap-3">
          <div className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input type="text" placeholder="Search documents..." className="border-none bg-transparent text-sm text-gray-900 outline-none placeholder:text-gray-400" />
          </div>
          <select className="input w-auto">
            <option value="">All Categories</option>
            <option value="financial">Financial</option>
            <option value="security">Security</option>
            <option value="compliance">Compliance</option>
          </select>
          <select className="input w-auto">
            <option value="">All Visibility</option>
            <option value="public">Public</option>
            <option value="internal">Internal</option>
            <option value="restricted">Restricted</option>
          </select>
        </div>

        {/* Table */}
        <div className="overflow-hidden rounded-xl border border-gray-200 shadow-sm">
          <table className="w-full text-left bg-white">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Hash</th>
                <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Category</th>
                <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Visibility</th>
                <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Uploaded</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {docs.length === 0 ? (
                <tr>
                  <td colSpan={4}>
                    <div className="flex flex-col items-center py-8 text-center">
                      <p className="text-sm text-gray-500">No documents found</p>
                      <p className="mt-1 text-xs text-gray-400">Upload a report to see it listed here.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                docs.map((doc: any) => (
                  <tr key={doc.pubkey} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 text-sm text-[#0B3D91] font-mono">
                      <Link href={`/verify?hash=${doc.document_hash}`} className="hover:underline">
                         {doc.document_hash.slice(0, 16)}...
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600 capitalize">{doc.category}</td>
                    <td className="px-4 py-3 text-sm">
                       <span className={`px-2 py-1 rounded text-[10px] font-semibold uppercase tracking-wider ${
                         doc.visibility === 'public' ? 'bg-green-100 text-green-700' : 
                         doc.visibility === 'internal' ? 'bg-blue-100 text-blue-700' : 
                         'bg-red-100 text-red-700'
                       }`}>
                         {doc.visibility}
                       </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">{new Date(doc.created_at).toLocaleDateString()}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
