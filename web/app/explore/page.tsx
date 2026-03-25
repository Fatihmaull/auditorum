import { PublicNavbar } from "@/components/layout/PublicNavbar";
import { createAdminClient } from "@/lib/supabase/admin";
import Link from "next/link";

export const dynamic = 'force-dynamic';

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
      <div className="min-h-screen bg-dark-900 pt-14">
        <div className="section py-10">
          <div className="page-header">
            <h1 className="page-title">Explore Public Audits</h1>
            <p className="page-description">Search and filter publicly anchored audit records on Solana.</p>
          </div>

          {/* Search + Filters */}
          <div className="mb-8 flex flex-wrap items-center gap-4">
            <div className="flex flex-1 items-center gap-3 rounded-2xl border border-white/5 bg-dark-800/50 px-4 py-3 shadow-2xl backdrop-blur-md">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-500">
                <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <input type="text" placeholder="Search by company, hash, or category..." className="w-full border-none bg-transparent text-sm text-white outline-none placeholder:text-gray-600 font-medium" />
            </div>
            <select className="rounded-2xl border border-white/5 bg-dark-800/50 px-5 py-3 text-sm text-gray-400 font-bold uppercase tracking-widest outline-none focus:border-brand-500/30 transition-all cursor-pointer shadow-xl backdrop-blur-md">
              <option value="" className="bg-dark-800">Filter: All</option>
              <option value="financial" className="bg-dark-800">Financial</option>
              <option value="security" className="bg-dark-800">Security</option>
              <option value="compliance" className="bg-dark-800">Compliance</option>
            </select>
          </div>

          {/* Results */}
          <div className="overflow-hidden rounded-3xl border border-white/5 bg-dark-800/50 shadow-2xl backdrop-blur-md">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-white/5 bg-white/5">
                  <th className="px-6 py-4 text-[10px] font-bold text-gray-500 uppercase tracking-widest">Issuing Entity</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-gray-500 uppercase tracking-widest">On-Chain Hash</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-gray-500 uppercase tracking-widest">Audit Class</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-gray-500 uppercase tracking-widest">Anchor Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {docs.length === 0 ? (
                  <tr>
                    <td colSpan={4}>
                      <div className="flex flex-col items-center py-20 text-center">
                        <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-dark-700/50 text-gray-600 border border-white/5">
                          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
                          </svg>
                        </div>
                        <p className="text-sm font-bold text-white uppercase tracking-widest">Registry Empty</p>
                        <p className="mt-2 text-xs text-gray-500 font-medium max-w-xs leading-relaxed">No public audit records have been discovered for the current filter criteria.</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                   docs.map((doc: any) => (
                    <tr key={doc.pubkey} className="hover:bg-white/[0.02] transition-colors group">
                      <td className="px-6 py-4">
                        <span className="text-sm font-bold text-white transition-colors group-hover:text-neon-blue">{doc.workspaces?.company_name}</span>
                      </td>
                      <td className="px-6 py-4">
                        <Link href={`/verify?hash=${doc.document_hash}`} className="font-mono text-xs text-neon-blue font-semibold hover:glow-sm transition-all flex items-center gap-2">
                          <span className="opacity-70">{doc.document_hash.slice(0, 16)}</span>
                          <span className="opacity-40">...</span>
                          <span className="opacity-70">{doc.document_hash.slice(-8)}</span>
                        </Link>
                      </td>
                      <td className="px-6 py-4 text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                        <span className="badge-blue opacity-80">{doc.category}</span>
                      </td>
                      <td className="px-6 py-4 text-xs text-gray-400 font-medium">
                        {new Date(doc.created_at).toLocaleDateString()}
                      </td>
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
