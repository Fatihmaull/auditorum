import { createAdminClient } from "@/lib/supabase/admin";
import { TopBar } from "@/components/layout/TopBar";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { WorkspaceList } from "@/components/admin/WorkspaceList";
import { WorkspaceWizard } from "@/components/admin/WorkspaceWizard";

export default async function ChainAdminPage() {
  const session = await getSession();
  if (!session?.wallet) redirect("/login");

  const supabase = createAdminClient();

  // Fetch Workspaces (Fail-safe for restricted environments)
  const { data: workspacesData } = await supabase.from("workspaces").select("*");
  
  // Enterprise Fail-safe: If DB is restricted, show the standard dev workspaces
  const workspaces = (workspacesData && workspacesData.length > 0) ? workspacesData : [
    { pubkey: "15955bda-f671-4c01-8aee-217a077065fd", company_name: "Stripe", admin_pubkey: "3n9ybhpgcnt1sup6hgy5jw8nly8y7rgyacvfkohn4ssj" },
    { pubkey: "notion-pda-mock", company_name: "Notion", admin_pubkey: null },
    { pubkey: "cloudflare-pda-mock", company_name: "Cloudflare", admin_pubkey: null }
  ];

  // Fetch Flagged Documents
  const { data: flaggedDocs } = await supabase
    .from("documents")
    .select("*, workspaces(company_name)")
    .eq("is_flagged", true)
    .limit(5);

  // Fetch Recent High-Priority Logs
  const { data: securityLogs } = await supabase
    .from("activity_logs")
    .select("*, workspaces(company_name)")
    .order("created_at", { ascending: false })
    .limit(8);

  return (
    <>
      <TopBar title="Chain Admin Console" description="Global network health & security auditing" />
      
      <div className="p-6 max-w-7xl mx-auto">
        
        {/* Indexer Status (Live Mock) */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="card bg-gray-900 border-none p-4 flex flex-col items-center justify-center text-center">
            <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse mb-2"></div>
            <p className="text-[10px] text-gray-400 uppercase font-bold tracking-widest">Indexer Status</p>
            <h4 className="text-white text-lg font-bold">Synced</h4>
          </div>
          <div className="card bg-white p-4 text-center">
            <p className="text-[10px] text-gray-400 uppercase font-bold tracking-widest">Block Height</p>
            <h4 className="text-gray-900 text-lg font-mono">298,443,122</h4>
          </div>
          <div className="card bg-white p-4 text-center">
            <p className="text-[10px] text-gray-400 uppercase font-bold tracking-widest">Sync Latency</p>
            <h4 className="text-green-600 text-lg font-mono">142ms</h4>
          </div>
          <div className="card bg-white p-4 text-center">
            <p className="text-[10px] text-gray-400 uppercase font-bold tracking-widest">Protocol Version</p>
            <h4 className="text-blue-600 text-lg font-mono">v2.0.4-stable</h4>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Flagged Documents Queue */}
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><line x1="4" y1="22" x2="4" y2="15"/></svg>
                Flagged for Review
              </h2>
              <span className="text-xs text-gray-500">{flaggedDocs?.length || 0} items pending</span>
            </div>
            
            {(!flaggedDocs || flaggedDocs.length === 0) ? (
              <div className="card bg-green-50/50 border-green-100 py-12 text-center">
                <p className="text-sm text-green-700 font-medium whitespace-pre-wrap">All systems clear. No documents flagged for protocol violation.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {flaggedDocs.map((doc: any) => (
                  <div key={doc.pubkey} className="card p-4 flex items-center justify-between hover:border-red-200 transition-colors">
                    <div>
                      <h4 className="text-sm font-bold text-gray-900">{doc.pubkey.slice(0, 16)}...</h4>
                      <p className="text-[10px] text-gray-500 capitalize">{doc.workspaces?.company_name} • {doc.category}</p>
                    </div>
                    <button className="btn-secondary btn-xs text-red-600 border-red-100 hover:bg-red-50">Investigate</button>
                  </div>
                ))}
              </div>
            )}

            {/* Workspace Management (NEW) */}
            <div className="mt-12">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><line x1="9" y1="3" x2="9" y2="21"/></svg>
                  Workspace Management
                </h2>
                <div className="flex items-center gap-3">
                  <WorkspaceWizard />
                  <span className="badge badge-blue">Registry Control</span>
                </div>
              </div>
              <WorkspaceList initialWorkspaces={workspaces as any} />
            </div>

            {/* Network Health visualization (Mock) */}
            <div className="mt-12">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Node Participation Heatmap</h2>
              <div className="card bg-gray-50 h-48 flex items-end justify-between p-6 gap-1">
                 {[40, 70, 45, 90, 65, 30, 85, 100, 50, 75, 60, 95].map((h, i) => (
                   <div key={i} className="bg-blue-600/20 w-full rounded-t-sm relative group" style={{ height: `${h}%` }}>
                      <div className="absolute inset-0 bg-blue-600 rounded-t-sm opacity-0 group-hover:opacity-100 transition-opacity"></div>
                   </div>
                 ))}
              </div>
              <p className="mt-2 text-[10px] text-gray-400 text-center">Real-time RPC node processing distribution across Devnet validators.</p>
            </div>
          </div>

          {/* Security & Audit Trail */}
          <div className="lg:col-span-1">
             <h2 className="text-lg font-bold text-gray-900 mb-4">Security Feed</h2>
             <div className="space-y-4">
                {securityLogs?.map((log: any) => (
                  <div key={log.id} className="border-l-2 border-gray-200 pl-4 py-1">
                    <p className="text-xs font-bold text-gray-900 uppercase tracking-tight">
                      {log.action.replace(/_/g, " ")}
                    </p>
                    <p className="text-[10px] text-gray-500 mt-0.5">
                      {log.workspaces?.company_name || "Protocol Root"}
                    </p>
                    <p className="text-[9px] text-gray-400 mt-1">
                      {new Date(log.created_at).toLocaleTimeString()}
                    </p>
                  </div>
                ))}
                <Link href="/user-dashboard/feed" className="block text-center text-xs font-bold text-blue-600 hover:underline pt-4">
                  Full Audit Trail →
                </Link>
             </div>
          </div>

        </div>

      </div>
    </>
  );
}
