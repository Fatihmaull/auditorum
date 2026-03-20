import { getSession } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { TopBar } from "@/components/layout/TopBar";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function AuditorDashboardPage({
  params,
}: {
  params: { company_id: string; auditor_id: string };
}) {
  const session = await getSession();
  if (!session?.wallet) redirect("/login");

  const supabase = createAdminClient();

  // 1. Validate Assignment (Case-insensitive with Try-Catch)
  let assignmentData = null;
  const decodedAuditorId = decodeURIComponent(params.auditor_id);
  
  try {
    const { data } = await supabase
      .from("auditor_assignments")
      .select("*, workspaces(*)")
      .eq("workspace_pubkey", params.company_id)
      .ilike("auditor_pubkey", decodedAuditorId)
      .single();
    assignmentData = data;
  } catch (err) {
    console.warn("DB Assignment Fetch Failed. Falling back to mock.");
  }

  // Fail-safe Mock for EY Auditor Demo
  // Authority: 8w9VvGyw3TsgLnambxFMet2u69GPXeepCDT4UUkB5B3p (44 chars)
  const MOCK_AUDITOR_WALLETS = [
    "8w9VvGyw3TsgLnambxFMet2u69GPXeepCDT4UUkB5B3p",
    "8w9VVyGyw3TsgLnambxFMet2u69GPXeepCDT4UUkB5B3p" // Keeping the typo version as fallback for any existing links
  ];
  
  const isDemoAuditor = 
    MOCK_AUDITOR_WALLETS.some(w => w.toLowerCase() === decodedAuditorId.toLowerCase()) ||
    MOCK_AUDITOR_WALLETS.some(w => w.toLowerCase() === session.wallet.toLowerCase());
  
  const assignment = assignmentData || (isDemoAuditor ? {
    expiry: "2027-03-19T06:40:00Z",
    workspace_pubkey: params.company_id,
    workspaces: { company_name: params.company_id.includes("mock") ? "Cloudflare" : "Audit Target" }
  } : null);

  if (!assignment) {
    return (
      <div className="p-8 text-center text-red-600">
        You are not assigned as an auditor for this workspace.
      </div>
    );
  }

  // 2. Fetch My Uploaded Documents
  const { data: myDocs } = await supabase
    .from("documents")
    .select("*")
    .eq("workspace_pubkey", params.company_id)
    .ilike("uploader_pubkey", params.auditor_id);

  const docs = myDocs || [];
  const expiryDate = new Date(assignment.expiry).toLocaleDateString();

  return (
    <>
      <TopBar 
        title={`Auditor Dashboard`} 
        description={`Context: ${assignment.workspaces?.company_name}`} 
      />

      <div className="p-6">
        <div className="mb-6 rounded-lg border border-purple-100 bg-gradient-to-r from-purple-50 to-white p-5 shadow-sm">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-purple-100 text-purple-700">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="m9 12 2 2 4-4"/></svg>
            </div>
            <div>
              <h2 className="text-base font-bold text-gray-900">
                Active Audit Contract
              </h2>
              <p className="mt-1 text-sm text-gray-600">
                You are authorized to upload securely encrypted reports directly to the blockchain IPFS node for <strong>{assignment.workspaces?.company_name}</strong>.
              </p>
              <div className="mt-2 text-xs font-semibold text-purple-700">
                Contract Expiry: {expiryDate}
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid gap-4 sm:grid-cols-2 mb-8">
          <div className="card">
            <p className="text-xs font-medium text-gray-500">Reports Uploaded by You</p>
            <p className="mt-1 text-2xl font-semibold text-gray-900">{docs.length}</p>
          </div>
          
          <Link href={`/workspace/${params.company_id}/upload`} className="card-hover group border-purple-100 bg-purple-50 flex items-center justify-center gap-3">
             <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-100 text-purple-700">
               <svg fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
             </div>
             <div className="text-left">
               <p className="text-sm font-semibold text-purple-900">Upload New Report</p>
               <p className="text-xs text-purple-700 font-medium">AES-256 Encrypt & Anchor</p>
             </div>
          </Link>
        </div>

        {/* My Docs */}
        <h2 className="text-sm font-semibold text-gray-900 mb-4">My Submitted Reports</h2>
        {docs.length === 0 ? (
          <div className="card text-center py-12">
            <p className="text-sm text-gray-500">No reports submitted yet.</p>
          </div>
        ) : (
          <div className="grid gap-3">
            {docs.map(doc => (
              <div key={doc.pubkey} className="card p-4 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-900">Hash: {doc.document_hash.slice(0, 16)}...</p>
                  <p className="text-xs text-gray-500">IPFS: {doc.file_cid}</p>
                </div>
                <div className="text-right">
                   <p className="text-xs font-semibold text-green-700 bg-green-50 px-2 py-1 rounded inline-block">Anchored</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
