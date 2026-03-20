import { createAdminClient } from "@/lib/supabase/admin";
import { TopBar } from "@/components/layout/TopBar";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function SuperadminPage() {
  const session = await getSession();
  if (!session?.wallet) redirect("/login");

  const supabase = createAdminClient();

  // Fetch Stats
  const { count: userCount } = await supabase.from("users").select("*", { count: "exact", head: true });
  const { count: workspaceCount } = await supabase.from("workspaces").select("*", { count: "exact", head: true });
  const { count: docCount } = await supabase.from("documents").select("*", { count: "exact", head: true });

  // Fetch Recent Users
  const { data: users } = await supabase.from("users").select("*").order("created_at", { ascending: false }).limit(10);
  
  // Fetch Recent Workspaces
  const { data: workspaces } = await supabase.from("workspaces").select("*").order("created_at", { ascending: false }).limit(10);

  return (
    <>
      <TopBar title="Superadmin Controls" description="Global protocol management & registry" />
      
      <div className="p-6 max-w-7xl mx-auto">
        
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="card p-6 bg-white border-l-4 border-blue-600 shadow-sm">
            <p className="text-xs font-bold uppercase tracking-wider text-gray-500">Total Protocol Users</p>
            <h2 className="text-3xl font-extrabold text-gray-900 mt-1">{userCount || 0}</h2>
            <p className="text-[10px] text-blue-600 mt-2 font-mono">Synced from Chain</p>
          </div>
          <div className="card p-6 bg-white border-l-4 border-indigo-600 shadow-sm">
            <p className="text-xs font-bold uppercase tracking-wider text-gray-500">Active Workspaces</p>
            <h2 className="text-3xl font-extrabold text-gray-900 mt-1">{workspaceCount || 0}</h2>
            <p className="text-[10px] text-indigo-600 mt-2 font-mono">B2B Enclosures</p>
          </div>
          <div className="card p-6 bg-white border-l-4 border-purple-600 shadow-sm">
            <p className="text-xs font-bold uppercase tracking-wider text-gray-500">Anchored Documents</p>
            <h2 className="text-3xl font-extrabold text-gray-900 mt-1">{docCount || 0}</h2>
            <p className="text-[10px] text-purple-600 mt-2 font-mono">On-Chain Proofs</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* User Management */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-900">User Registry</h2>
              <span className="badge badge-blue">Recent 10</span>
            </div>
            <div className="card p-0 overflow-hidden shadow-sm border-gray-200">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50 uppercase text-[10px] font-bold text-gray-500 tracking-wider">
                  <tr>
                    <th className="px-4 py-3 text-left">Wallet / Handle</th>
                    <th className="px-4 py-3 text-left">Created</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-100 italic">
                  {users?.map((u) => (
                    <tr key={u.wallet_address}>
                      <td className="px-4 py-3">
                        <div className="text-sm font-medium text-gray-900 truncate max-w-[200px]">{u.full_name || u.wallet_address}</div>
                        <div className="text-[10px] font-mono text-gray-400">{u.wallet_address.slice(0, 8)}...{u.wallet_address.slice(-8)}</div>
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-500 whitespace-nowrap">
                        {new Date(u.created_at).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* Workspace Management */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-900">Workspace Index</h2>
              <span className="badge badge-purple">Global</span>
            </div>
            <div className="card p-0 overflow-hidden shadow-sm border-gray-200">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50 uppercase text-[10px] font-bold text-gray-500 tracking-wider">
                  <tr>
                    <th className="px-4 py-3 text-left">Company Name</th>
                    <th className="px-4 py-3 text-left">Status</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-100">
                  {workspaces?.map((ws) => (
                    <tr key={ws.pubkey}>
                      <td className="px-4 py-3">
                        <div className="text-sm font-medium text-gray-900">{ws.company_name}</div>
                        <div className="text-[10px] font-mono text-gray-400">PDA: {ws.pubkey.slice(0, 12)}...</div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="badge badge-green">Subscribed</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

        </div>

        {/* Protocol Settings (Mock) */}
        <div className="mt-12 card bg-gray-900 text-white p-8 border-none shadow-xl">
           <div className="flex items-center gap-4 mb-6">
              <div className="h-12 w-12 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
              </div>
              <div>
                <h3 className="text-xl font-bold">Protocol Governance</h3>
                <p className="text-sm text-gray-400">Manage Anchor program state and global fees.</p>
              </div>
           </div>
           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button className="flex items-center justify-between p-4 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-colors text-left">
                <span>Update Program ID</span>
                <span className="text-[10px] font-mono opacity-50">v1.2.4 (Latest)</span>
              </button>
              <button className="flex items-center justify-between p-4 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-colors text-left">
                <span>Global Fee Config</span>
                <span className="text-[10px] font-mono opacity-50">0.05 SOL / Audit</span>
              </button>
           </div>
        </div>

      </div>
    </>
  );
}
