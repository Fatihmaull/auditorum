import { TopBar } from "@/components/layout/TopBar";
import Link from "next/link";

export default function WorkspacePage() {
  return (
    <>
      <TopBar title="Workspace" description="Your audit workspace overview" />

      <div className="p-6">
        {/* Stats */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { label: "Total Documents", value: "0", color: "bg-blue-50 text-[#0B3D91]" },
            { label: "Anchored On-Chain", value: "0", color: "bg-green-50 text-green-700" },
            { label: "Pending Review", value: "0", color: "bg-amber-50 text-amber-700" },
            { label: "Flagged", value: "0", color: "bg-red-50 text-red-700" },
          ].map((stat) => (
            <div key={stat.label} className="card">
              <p className="text-xs font-medium text-gray-500">{stat.label}</p>
              <p className={`mt-1 text-2xl font-semibold ${stat.color.split(" ")[1]}`}>
                {stat.value}
              </p>
            </div>
          ))}
        </div>

        {/* Quick actions */}
        <div className="mt-8">
          <h2 className="mb-4 text-sm font-semibold text-gray-900">
            Quick Actions
          </h2>
          <div className="grid gap-4 sm:grid-cols-3">
            <Link href="/workspace/upload" className="card-hover group">
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-[#0B3D91] transition-colors group-hover:bg-blue-100">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="17 8 12 3 7 8" />
                  <line x1="12" y1="3" x2="12" y2="15" />
                </svg>
              </div>
              <h3 className="text-sm font-medium text-gray-900">Upload Report</h3>
              <p className="mt-0.5 text-xs text-gray-500">Upload and anchor an audit report on-chain</p>
            </Link>

            <Link href="/verify" className="card-hover group">
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-green-50 text-green-700 transition-colors group-hover:bg-green-100">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z" />
                  <path d="m9 12 2 2 4-4" />
                </svg>
              </div>
              <h3 className="text-sm font-medium text-gray-900">Verify Report</h3>
              <p className="mt-0.5 text-xs text-gray-500">Check a report against on-chain records</p>
            </Link>

            <Link href="/workspace/members" className="card-hover group">
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-purple-50 text-purple-700 transition-colors group-hover:bg-purple-100">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                  <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
              </div>
              <h3 className="text-sm font-medium text-gray-900">Manage Members</h3>
              <p className="mt-0.5 text-xs text-gray-500">Invite team members and assign roles</p>
            </Link>
          </div>
        </div>

        {/* Recent documents placeholder */}
        <div className="mt-8">
          <h2 className="mb-4 text-sm font-semibold text-gray-900">
            Recent Documents
          </h2>
          <div className="card">
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-gray-50">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z" />
                  <path d="M14 2v6h6" />
                </svg>
              </div>
              <p className="text-sm font-medium text-gray-500">No documents yet</p>
              <p className="mt-1 text-xs text-gray-400">Upload your first audit report to get started.</p>
              <Link href="/workspace/upload" className="btn-primary btn-sm mt-4">
                Upload Report
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
