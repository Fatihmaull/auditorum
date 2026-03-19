import { TopBar } from "@/components/layout/TopBar";

export default function MembersPage() {
  return (
    <>
      <TopBar
        title="Members"
        description="Manage your workspace members and roles"
        actions={<button className="btn-primary btn-sm">Invite Member</button>}
      />
      <div className="p-6">
        <div className="overflow-hidden rounded-xl border border-gray-200">
          <table className="w-full">
            <thead>
              <tr>
                <th className="table-header">Name</th>
                <th className="table-header">Email</th>
                <th className="table-header">Role</th>
                <th className="table-header">Joined</th>
                <th className="table-header">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="table-cell" colSpan={5}>
                  <div className="flex flex-col items-center py-8 text-center">
                    <p className="text-sm text-gray-500">No members yet</p>
                    <p className="mt-1 text-xs text-gray-400">Invite team members to collaborate.</p>
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
