"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function CompanySidebar({ companyId }: { companyId: string }) {
  const pathname = usePathname();

  const NAV_ITEMS = [
    {
      label: "Overview",
      href: `/workspace/${companyId}`,
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="7" height="7" rx="1" />
          <rect x="14" y="3" width="7" height="7" rx="1" />
          <rect x="3" y="14" width="7" height="7" rx="1" />
          <rect x="14" y="14" width="7" height="7" rx="1" />
        </svg>
      ),
    },
    {
      label: "Documents",
      href: `/workspace/${companyId}/documents`,
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z" />
          <path d="M14 2v6h6" />
          <line x1="16" y1="13" x2="8" y2="13" />
          <line x1="16" y1="17" x2="8" y2="17" />
          <line x1="10" y1="9" x2="8" y2="9" />
        </svg>
      ),
    },
    {
      label: "Upload",
      href: `/workspace/${companyId}/upload`,
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
          <polyline points="17 8 12 3 7 8" />
          <line x1="12" y1="3" x2="12" y2="15" />
        </svg>
      ),
    },
    {
      label: "Members",
      href: `/workspace/${companyId}/members`,
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
      ),
    },
    {
      label: "Audit History",
      href: `/workspace/${companyId}/history`,
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
          <polyline points="12 6 12 12 16 14" />
        </svg>
      ),
    },
  ];

  const SECONDARY_ITEMS = [
    {
      label: "Verify",
      href: "/verify",
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z" />
          <path d="m9 12 2 2 4-4" />
        </svg>
      ),
    },
    {
      label: "Explore",
      href: "/explore",
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
      ),
    },
  ];

  return (
    <aside className="flex h-screen w-60 flex-col border-r border-dark-700 bg-dark-900">
      {/* Logo */}
      <div className="flex h-14 items-center gap-2 border-b border-dark-700 px-4">
        <Link href="/user-dashboard" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-brand-500 text-xs font-bold text-white shadow-[0_0_12px_rgba(99,102,241,0.5)]">
             A
          </div>
          <span className="text-sm font-semibold text-white tracking-wide">Auditorum</span>
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-3 py-4">
        <div className="mb-1 px-3 text-[10px] font-semibold uppercase tracking-wider text-gray-500">
          Workspace
        </div>
        <div className="space-y-0.5">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={
                pathname === item.href
                  ? "sidebar-link-active"
                  : "sidebar-link"
              }
            >
              {item.icon}
              {item.label}
            </Link>
          ))}
        </div>

        <div className="mb-1 mt-6 px-3 text-[10px] font-semibold uppercase tracking-wider text-gray-500">
          Public
        </div>
        <div className="space-y-0.5">
          {SECONDARY_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={
                pathname === item.href
                  ? "sidebar-link-active"
                  : "sidebar-link"
              }
            >
              {item.icon}
              {item.label}
            </Link>
          ))}
        </div>
      </nav>

      {/* Footer */}
      <div className="border-t border-dark-700 px-4 py-3">
        <p className="text-[10px] text-gray-500">Solana Devnet</p>
      </div>
    </aside>
  );
}
