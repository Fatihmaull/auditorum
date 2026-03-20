"use client";

import { AuditorSidebar } from "@/components/layout/AuditorSidebar";

export default function AuditorLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { company_id: string, auditor_id: string };
}) {
  return (
    <div className="min-h-screen bg-white">
      <AuditorSidebar companyId={params.company_id} auditorId={params.auditor_id} />
      <div className="pl-60">
        {children}
      </div>
    </div>
  );
}
