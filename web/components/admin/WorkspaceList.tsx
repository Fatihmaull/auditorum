"use client";

import { useState, useEffect } from "react";
import { assignWorkspaceAdmin } from "@/app/actions/workspace";

interface Workspace {
  pubkey: string;
  company_name: string;
  admin_pubkey: string | null;
}

export function WorkspaceList({ initialWorkspaces }: { initialWorkspaces: Workspace[] }) {
  const [workspaces, setWorkspaces] = useState(initialWorkspaces);
  const [loading, setLoading] = useState<string | null>(null);

  useEffect(() => {
    // Merge local mock workspaces for demonstration purposes
    const localMocks = JSON.parse(localStorage.getItem("auditorum_mock_workspaces") || "[]");
    if (localMocks.length > 0) {
      setWorkspaces(prev => {
        // Filter out any that are already in the database (unlikely but possible)
        const newMocks = localMocks.filter((m: any) => !prev.some(p => p.pubkey === m.pubkey));
        return [...prev, ...newMocks];
      });
    }
  }, []);

  const handleAssign = async (pubkey: string) => {
    const newAdmin = prompt("Enter new Admin Wallet Address:");
    if (!newAdmin) return;

    setLoading(pubkey);
    try {
      const res = await assignWorkspaceAdmin(pubkey, newAdmin);
      if (res.success) {
        setWorkspaces(prev => prev.map(ws => 
          ws.pubkey === pubkey ? { ...ws, admin_pubkey: newAdmin } : ws
        ));
        alert("Success! Admin reassigned.");
      } else {
        alert("Error: " + res.error);
      }
    } catch (err: any) {
      alert("Error: " + err.message);
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="card p-0 overflow-hidden shadow-sm border-gray-200">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50 uppercase text-[10px] font-bold text-gray-500 tracking-wider">
          <tr>
            <th className="px-6 py-4 text-left">Company</th>
            <th className="px-6 py-4 text-left">Current Admin</th>
            <th className="px-6 py-4 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-100">
          {workspaces?.map((ws) => (
            <tr key={ws.pubkey} className="hover:bg-gray-50 transition-colors">
              <td className="px-6 py-4">
                <div className="text-sm font-bold text-gray-900">{ws.company_name}</div>
                <div className="text-[10px] font-mono text-gray-400 truncate max-w-[150px]">{ws.pubkey}</div>
              </td>
              <td className="px-6 py-4">
                <div className="text-xs font-mono text-gray-600 bg-gray-50 px-2 py-1 rounded border border-gray-100 italic">
                  {ws.admin_pubkey ? `${ws.admin_pubkey.slice(0, 12)}...${ws.admin_pubkey.slice(-8)}` : "NOT ASSIGNED"}
                </div>
              </td>
              <td className="px-6 py-4 text-right">
                <button 
                  onClick={() => handleAssign(ws.pubkey)}
                  disabled={loading === ws.pubkey}
                  className="btn-secondary btn-xs text-blue-600 border-blue-100 hover:bg-blue-50"
                >
                  {loading === ws.pubkey ? "Processing..." : "Assign New Admin"}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
