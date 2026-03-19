import { TopBar } from "@/components/layout/TopBar";

export default function AdminDashboard() {
  return (
    <>
      <TopBar title="Chain Admin" description="System monitoring and governance" />
      <div className="p-6">
        {/* Stats */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { label: "Total Records", value: "0", color: "text-[#0B3D91]" },
            { label: "Active Workspaces", value: "0", color: "text-gray-900" },
            { label: "Open Flags", value: "0", color: "text-amber-600" },
            { label: "Total Users", value: "0", color: "text-gray-900" },
          ].map((stat) => (
            <div key={stat.label} className="card">
              <p className="text-xs font-medium text-gray-500">{stat.label}</p>
              <p className={`mt-1 text-2xl font-semibold ${stat.color}`}>{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Flags */}
        <h2 className="mb-4 mt-8 text-sm font-semibold text-gray-900">Open Flags</h2>
        <div className="overflow-hidden rounded-xl border border-gray-200">
          <table className="w-full">
            <thead>
              <tr>
                <th className="table-header">Document</th>
                <th className="table-header">Reason</th>
                <th className="table-header">Flagged By</th>
                <th className="table-header">Status</th>
                <th className="table-header">Date</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="table-cell" colSpan={5}>
                  <div className="flex flex-col items-center py-8 text-center">
                    <p className="text-sm text-gray-500">No open flags</p>
                    <p className="mt-1 text-xs text-gray-400">Flagged records will appear here for review.</p>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Activity Log */}
        <h2 className="mb-4 mt-8 text-sm font-semibold text-gray-900">Recent Activity</h2>
        <div className="card">
          <div className="flex flex-col items-center py-8 text-center">
            <p className="text-sm text-gray-500">No recorded activity</p>
            <p className="mt-1 text-xs text-gray-400">System-wide actions will be logged here.</p>
          </div>
        </div>
      </div>
    </>
  );
}
