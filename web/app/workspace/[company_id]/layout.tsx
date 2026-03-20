"use client";

import { CompanySidebar } from "@/components/layout/CompanySidebar";

export default function WorkspaceLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { company_id: string };
}) {
  return (
    <div className="min-h-screen bg-white">
      <CompanySidebar companyId={params.company_id} />
      <div className="pl-60">
        {children}
      </div>
    </div>
  );
}
