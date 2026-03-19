import { TopBar } from "@/components/layout/TopBar";
import Link from "next/link";

export default function DocumentsPage() {
  return (
    <>
      <TopBar
        title="Documents"
        description="All audit reports in your workspace"
        actions={
          <Link href="/workspace/upload" className="btn-primary btn-sm">
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
            <option value="">All States</option>
            <option value="draft">Draft</option>
            <option value="anchored">Anchored</option>
            <option value="verified">Verified</option>
            <option value="flagged">Flagged</option>
          </select>
        </div>

        {/* Table */}
        <div className="overflow-hidden rounded-xl border border-gray-200">
          <table className="w-full">
            <thead>
              <tr>
                <th className="table-header">Title</th>
                <th className="table-header">Category</th>
                <th className="table-header">State</th>
                <th className="table-header">Visibility</th>
                <th className="table-header">Uploaded</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="table-cell" colSpan={5}>
                  <div className="flex flex-col items-center py-8 text-center">
                    <p className="text-sm text-gray-500">No documents found</p>
                    <p className="mt-1 text-xs text-gray-400">Upload a report to see it listed here.</p>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
