import { getSession } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { TopBar } from "@/components/layout/TopBar";
import { redirect } from "next/navigation";

export default async function FeedPage() {
  const session = await getSession();
  if (!session?.wallet) redirect("/login");

  const supabase = createAdminClient();
  const { data: dbLogs } = await supabase
    .from("activity_logs")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(20);

  const logs = dbLogs || [];

  return (
    <>
      <TopBar title="Activity Feed" description="Complete ledger of your Web3 B2B actions" />
      <div className="p-6 max-w-5xl">
        <div className="card divide-y divide-gray-100 p-0 shadow-sm border-gray-200 bg-white">
          {!logs || logs.length === 0 ? (
            <div className="p-12 text-center text-gray-500">
              No activity recorded yet.
            </div>
          ) : (
            logs.map((log: any) => (
              <div key={log.id} className="p-4 flex items-start gap-4">
                <div className="mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-blue-50 text-[#0B3D91]">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
                  </svg>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900 capitalize">
                    {log.action.replace(/_/g, " ")}
                  </p>
                  {log.metadata && (
                    <div className="mt-1 text-xs text-gray-600">
                      {log.metadata.file_name && <span className="font-semibold">{log.metadata.file_name}</span>}
                      {log.metadata.company && <span> for <span className="text-[#0B3D91]">{log.metadata.company}</span></span>}
                      {log.metadata.auditor && <span>Assigned: <span className="font-semibold">{log.metadata.auditor}</span></span>}
                    </div>
                  )}
                  <p className="mt-1 text-[10px] text-gray-400 font-mono truncate max-w-[200px]">
                    Target: {log.target_pubkey}
                  </p>
                  <div className="mt-1 text-[10px] text-gray-400">
                    {new Date(log.created_at).toLocaleString()}
                  </div>
                </div>
                {log.signature && (
                  <a 
                    href={`https://explorer.solana.com/tx/${log.signature}?cluster=devnet`}
                    target="_blank" rel="noopener noreferrer"
                    className="text-[10px] uppercase font-bold text-[#0B3D91] hover:underline"
                  >
                    View Tx
                  </a>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </>
  );
}
