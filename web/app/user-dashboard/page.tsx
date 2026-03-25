import { getSession, SUPERADMIN_WALLETS, CHAIN_ADMIN_WALLETS } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { TopBar } from "@/components/layout/TopBar";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function UserDashboardPage() {
  const session = await getSession();
  
  if (!session?.wallet) {
    redirect("/login");
  }

  const wallet = session.wallet;
  const supabase = createAdminClient();

  // 1. Fetch Profile
  const { data: profile } = await supabase
    .from("users")
    .select("*")
    .ilike("wallet_address", wallet)
    .single();

  // 2. Fetch Assignments (Workspaces this user is Admin of)
  const { data: adminWorkspaces, error: wsError } = await supabase
    .from("workspaces")
    .select("*")
    .ilike("admin_pubkey", wallet);

  // 3. Fetch Assignments (Auditor roles)
  const { data: auditorRoles } = await supabase
    .from("auditor_assignments")
    .select("*, workspaces(*)")
    .ilike("auditor_pubkey", wallet);

  const workspacesToDisplay = adminWorkspaces || [];
  const auditorsToDisplay = auditorRoles || [];

  let displayProfile = profile;

  // 5. Fetch Global Activity Feed (System-wide for dashboard glimpse)
  const { data: globalLogs } = await supabase
    .from("activity_logs")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(5);

  const logs = globalLogs || [];

  // Default Role
  // 4b. Profile Status Fail-safe
  const isNewProfile = !displayProfile;

  return (
    <>
      <TopBar title="Personal Center" description="Your Global Auditorum Identity" />

      <div className="p-6 max-w-5xl bg-dark-900 min-h-screen">
        
        {/* Profile Overview */}
        <div className="rounded-3xl border border-white/5 bg-gradient-to-br from-dark-800 to-dark-900 p-8 flex items-start gap-8 shadow-2xl relative overflow-hidden mb-10">
          <div className="absolute top-0 right-0 w-64 h-64 bg-brand-500/5 rounded-full blur-[80px] -mr-32 -mt-32 pointer-events-none" />
          
          <div className="flex h-24 w-24 flex-shrink-0 items-center justify-center rounded-3xl bg-brand-500/10 border border-brand-500/20 text-brand-400 text-3xl font-black shadow-[0_0_30px_rgba(99,102,241,0.1)]">
            {profile?.full_name ? profile.full_name.charAt(0).toUpperCase() : "A"}
          </div>
          <div className="flex-1 relative z-10">
            <h1 className="text-2xl font-black text-white tracking-tight">
              {displayProfile?.full_name || "Anonymous Wallet"}
            </h1>
            <p className="text-[10px] font-mono text-brand-400/60 mt-2 mb-4 uppercase tracking-[0.2em]">
              {wallet.slice(0, 10)}...{wallet.slice(-10)}
            </p>
            <p className="text-sm text-gray-400 font-medium leading-relaxed max-w-2xl">
              {displayProfile?.bio || "No professional bio provided yet. Enrich your profile to synchronize your Web3 institutional identity."}
            </p>
            <div className="mt-6 flex gap-3">
              <Link href="/user-dashboard/profile" className="btn-primary btn-sm px-6">
                Refine Identity
              </Link>
            </div>
          </div>
        </div>

        {/* Role Access Panel */}
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <div className="h-1 w-1 rounded-full bg-brand-500 shadow-[0_0_10px_rgba(99,102,241,0.5)]" />
            <h2 className="text-xs font-bold text-gray-400 uppercase tracking-[0.3em]">Protocol Environment</h2>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {/* Base Role: Public Explorer */}
            <Link href="/explore" className="rounded-3xl border border-white/5 bg-dark-800/40 p-6 shadow-xl backdrop-blur-md transition-all hover:bg-dark-800 hover:border-brand-500/20 group">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-dark-700/50 text-gray-400 border border-white/5 transition-colors group-hover:text-brand-400 group-hover:bg-brand-500/10">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/><path d="M2 12h20"/></svg>
              </div>
              <h3 className="text-sm font-bold text-white mb-1 group-hover:text-brand-400 transition-colors tracking-tight">Public Explorer</h3>
              <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest leading-none">Global Registry Access</p>
            </Link>

            {/* Verification Tool */}
            <Link href="/verify" className="rounded-3xl border border-emerald-500/10 bg-emerald-500/[0.02] p-6 shadow-xl backdrop-blur-md transition-all hover:bg-emerald-500/[0.05] hover:border-emerald-500/20 group">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 transition-colors group-hover:bg-emerald-500/20 group-hover:shadow-[0_0_20px_rgba(16,185,129,0.2)]">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="m9 12 2 2 4-4"/></svg>
              </div>
              <h3 className="text-sm font-bold text-white mb-1 tracking-tight">Verification Engine</h3>
              <p className="text-[10px] text-emerald-500/60 font-bold uppercase tracking-widest leading-none">Validate Report Integrity</p>
            </Link>

            {/* Admin Roles */}
            {workspacesToDisplay && workspacesToDisplay.map((ws: any) => (
              <Link key={ws.pubkey} href={`/workspace/${ws.pubkey}`} className="rounded-3xl border border-brand-500/10 bg-brand-500/[0.02] p-6 shadow-xl backdrop-blur-md transition-all hover:bg-brand-500/[0.05] hover:border-brand-500/20 group">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-500/10 text-brand-400 border border-brand-500/20 transition-colors group-hover:bg-brand-500/20 group-hover:shadow-[0_0_20px_rgba(99,102,241,0.2)]">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                </div>
                <h3 className="text-sm font-bold text-white mb-1 tracking-tight">Corporate Admin</h3>
                <p className="text-[10px] text-brand-400/60 font-bold uppercase tracking-widest leading-none truncate">{ws.company_name}</p>
              </Link>
            ))}

            {/* Auditor Roles */}
            {auditorsToDisplay && auditorsToDisplay.map((role: any) => (
              <Link key={role.pubkey} href={`/auditorplace/${role.workspace_pubkey}/${wallet}`} className="rounded-3xl border border-purple-500/10 bg-purple-500/[0.02] p-6 shadow-xl backdrop-blur-md transition-all hover:bg-purple-500/[0.05] hover:border-purple-500/20 group">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-purple-500/10 text-purple-400 border border-purple-500/20 transition-colors group-hover:bg-purple-500/20 group-hover:shadow-[0_0_20px_rgba(168,85,247,0.2)]">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="m9 12 2 2 4-4"/></svg>
                </div>
                <h3 className="text-sm font-bold text-white mb-1 tracking-tight">Audit Associate</h3>
                <p className="text-[10px] text-purple-400/60 font-bold uppercase tracking-widest leading-none truncate">{role.workspaces?.company_name}</p>
              </Link>
            ))}

            {/* Superadmin Console (Specialized) */}
            {SUPERADMIN_WALLETS.includes(wallet) && (
              <Link href="/superadmin" className="rounded-3xl border border-red-500/10 bg-red-500/[0.02] p-6 shadow-xl backdrop-blur-md transition-all hover:bg-red-500/[0.05] hover:border-red-500/20 group">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-red-500/10 text-red-500 border border-red-500/20 transition-colors group-hover:bg-red-500/20">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="M12 8v4"/><path d="M12 16h.01"/></svg>
                </div>
                <h3 className="text-sm font-bold text-white mb-1 tracking-tight">Protocol Nexus</h3>
                <p className="text-[10px] text-red-500/60 font-bold uppercase tracking-widest leading-none">Global Network Admin</p>
              </Link>
            )}

            {/* Chain Admin Console */}
            {(SUPERADMIN_WALLETS.includes(wallet) || CHAIN_ADMIN_WALLETS.includes(wallet)) && (
              <Link href="/chainadmin" className="rounded-3xl border border-orange-500/10 bg-orange-500/[0.02] p-6 shadow-xl backdrop-blur-md transition-all hover:bg-orange-500/[0.05] hover:border-orange-500/20 group">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-500/10 text-orange-500 border border-orange-500/20 transition-colors group-hover:bg-orange-500/20">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12V7a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h7"/><path d="M16 5V3"/><path d="M8 5V3"/><path d="M3 9h16"/><path d="M21 12l-3 3h-4l-3-3"/></svg>
                </div>
                <h3 className="text-sm font-bold text-white mb-1 tracking-tight">Chain Custodian</h3>
                <p className="text-[10px] text-orange-500/60 font-bold uppercase tracking-widest leading-none">Indexer Control</p>
              </Link>
            )}
          </div>
        </div>

        {/* Activity Feed */}
        <div className="mt-8">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="h-1 w-1 rounded-full bg-brand-500 shadow-[0_0_10px_rgba(99,102,241,0.5)]" />
              <h2 className="text-xs font-bold text-gray-400 uppercase tracking-[0.3em]">Institutional Pulse</h2>
            </div>
            <Link href="/user-dashboard/feed" className="text-[10px] font-bold text-brand-400 hover:text-brand-300 transition-colors uppercase tracking-widest">Global Archive</Link>
          </div>
          
          {logs.length === 0 ? (
            <div className="rounded-3xl border border-white/5 bg-dark-800/20 p-12 text-center backdrop-blur-md shadow-inner">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="mx-auto mb-4 text-gray-700"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
              <p className="text-sm font-bold text-gray-600 uppercase tracking-widest">Protocol Idle</p>
              <p className="text-[10px] text-gray-600 mt-2 font-medium">Global activity feed is awaiting the first indexed event.</p>
            </div>
          ) : (
            <div className="rounded-3xl border border-white/5 bg-dark-800/40 divide-y divide-white/5 overflow-hidden shadow-2xl">
              {logs.map((log: any) => (
                <div key={log.id} className="p-6 flex items-start gap-6 hover:bg-white/[0.02] transition-colors group">
                  <div className="mt-1 flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-2xl bg-brand-500/10 text-brand-400 border border-brand-500/20 shadow-[0_0_15px_rgba(99,102,241,0.1)] group-hover:bg-brand-500/20 transition-all">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
                    </svg>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-bold text-white uppercase tracking-tight mb-2 transition-colors group-hover:text-brand-400">
                      {log.action.replace(/_/g, " ")}
                    </p>
                    {log.metadata && (
                      <p className="text-xs text-gray-500 font-medium mb-2">
                        {log.metadata.file_name && <span className="text-gray-300">{log.metadata.file_name}</span>}
                        {log.metadata.company && <span> for <span className="text-brand-400 font-bold">{log.metadata.company}</span></span>}
                      </p>
                    )}
                    <div className="flex items-center gap-4">
                      <p className="text-[10px] text-gray-600 font-mono tracking-tighter">
                        OBJ: {log.target_pubkey?.slice(0, 12)}...{log.target_pubkey?.slice(-8)}
                      </p>
                      <span className="h-1 w-1 rounded-full bg-dark-600" />
                      <div className="text-[10px] text-gray-600 font-bold uppercase tracking-widest">
                        {new Date(log.created_at).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  {log.signature && (
                    <a 
                      href={`https://explorer.solana.com/tx/${log.signature}?cluster=devnet`}
                      target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-2 text-[10px] uppercase font-black text-brand-400/80 bg-brand-500/5 border border-brand-500/10 px-3 py-2 rounded-xl hover:bg-brand-500/10 hover:text-brand-400 transition-all"
                    >
                      On-Chain
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
                    </a>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </>
  );
}
