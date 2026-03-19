import { PublicNavbar } from "@/components/layout/PublicNavbar";

export default function ExplorePage() {
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
              <input type="text" placeholder="Search by company, hash, or industry..." className="w-full border-none bg-transparent text-sm text-gray-900 outline-none placeholder:text-gray-400" />
            </div>
            <select className="input w-auto">
              <option value="">All Industries</option>
              <option value="cybersecurity">Cybersecurity</option>
              <option value="finance">Finance</option>
              <option value="governance">Governance</option>
            </select>
          </div>

          {/* Results */}
          <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
            <table className="w-full">
              <thead>
                <tr>
                  <th className="table-header">Hash</th>
                  <th className="table-header">Industry</th>
                  <th className="table-header">Status</th>
                  <th className="table-header">Anchored</th>
                  <th className="table-header">Authority</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="table-cell" colSpan={5}>
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
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
}
