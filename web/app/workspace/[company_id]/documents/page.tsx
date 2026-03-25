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

      <div className="min-h-screen bg-dark-900 p-6">
        {/* Filters */}
        <div className="mb-6 flex items-center gap-4">
          <div className="flex flex-1 items-center gap-2 rounded-xl border border-dark-700 bg-dark-800 px-4 py-2.5 shadow-inner group focus-within:border-brand-500/50 transition-all">
            <svg className="text-gray-500 group-focus-within:text-brand-400" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input type="text" placeholder="Search document hashes or metadata..." className="flex-1 border-none bg-transparent text-sm text-white outline-none placeholder:text-gray-600 font-medium" />
          </div>
          <select className="h-11 rounded-xl border border-dark-700 bg-dark-800 px-4 text-xs font-bold text-gray-400 outline-none focus:border-brand-500/50 hover:bg-dark-700 transition-all uppercase tracking-widest">
            <option value="">Categories</option>
            <option value="financial">Financial</option>
            <option value="security">Security</option>
            <option value="compliance">Compliance</option>
          </select>
          <select className="h-11 rounded-xl border border-dark-700 bg-dark-800 px-4 text-xs font-bold text-gray-400 outline-none focus:border-brand-500/50 hover:bg-dark-700 transition-all uppercase tracking-widest">
            <option value="">Visibility</option>
            <option value="public">Public</option>
            <option value="internal">Internal</option>
            <option value="restricted">Restricted</option>
          </select>
        </div>

        {/* Table */}
        <div className="overflow-hidden rounded-2xl border border-dark-700 bg-dark-800 shadow-2xl">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-dark-700 bg-dark-900/50">
                <th className="px-6 py-4 text-[10px] font-bold text-gray-500 uppercase tracking-widest">Document Cluster Hash</th>
                <th className="px-6 py-4 text-[10px] font-bold text-gray-500 uppercase tracking-widest">Category</th>
                <th className="px-6 py-4 text-[10px] font-bold text-gray-500 uppercase tracking-widest">Protocol Visibility</th>
                <th className="px-6 py-4 text-[10px] font-bold text-gray-500 uppercase tracking-widest">Anchored On</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-dark-700">
              {docs.length === 0 ? (
                <tr>
                  <td colSpan={4}>
                    <div className="flex flex-col items-center py-16 text-center">
                      <div className="mb-4 h-12 w-12 rounded-full bg-dark-700 flex items-center justify-center text-gray-600">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z"/><path d="M14 2v6h6"/></svg>
                      </div>
                      <p className="text-sm font-bold text-white tracking-wide">No documents found in cluster</p>
                      <p className="mt-1 text-xs text-gray-500">Initialize your first audit report anchoring.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                docs.map((doc: any) => (
                  <tr key={doc.pubkey} className="hover:bg-dark-700/50 transition-all group">
                    <td className="px-6 py-4 text-sm font-mono">
                      <Link href={`/verify?hash=${doc.document_hash}`} className="text-neon-blue hover:text-white transition-colors hover:underline">
                         {doc.document_hash.slice(0, 16)}...
                      </Link>
                    </td>
                    <td className="px-6 py-4 text-sm text-white font-medium capitalize opacity-80">{doc.category}</td>
                    <td className="px-6 py-4 text-sm">
                       <span className={`px-2.5 py-1 rounded-md text-[9px] font-bold uppercase tracking-widest border ${
                         doc.visibility === 'public' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 
                         doc.visibility === 'internal' ? 'bg-brand-500/10 text-brand-400 border-brand-500/20' : 
                         'bg-red-500/10 text-red-400 border-red-500/20'
                       }`}>
                         {doc.visibility}
                       </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 group-hover:text-gray-400 transition-colors font-medium">{new Date(doc.created_at).toLocaleDateString()}</td>
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
