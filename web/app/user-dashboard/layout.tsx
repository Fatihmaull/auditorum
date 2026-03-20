"use client";

import { UserSidebar } from "@/components/layout/UserSidebar";

export default function UserDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-white">
      <UserSidebar />
      <div className="pl-60">
        {children}
      </div>
    </div>
  );
}
