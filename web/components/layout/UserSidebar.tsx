"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useWallet } from "@solana/wallet-adapter-react";

const NAV_ITEMS = [
  {
    label: "Hub Overview",
    href: "/user-dashboard",
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
    label: "My Profile",
    href: "/user-dashboard/profile",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
        <circle cx="12" cy="7" r="4" />
      </svg>
    ),
  },
  {
    label: "Global Feed",
    href: "/user-dashboard/feed",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <polyline points="12 6 12 12 16 14" />
      </svg>
    ),
  },
];

export function UserSidebar() {
  const pathname = usePathname();
  const { disconnect } = useWallet();

  return (
    <aside className="fixed left-0 top-0 z-30 flex h-screen w-60 flex-col border-r border-dark-700 bg-dark-900">
      {/* Logo */}
      <div className="flex h-14 items-center gap-2 border-b border-dark-700 px-4">
        <div className="flex h-7 w-7 items-center justify-center rounded-md bg-brand-500 text-xs font-bold text-white shadow-[0_0_12px_rgba(99,102,241,0.5)]">
          A
        </div>
        <span className="text-sm font-semibold text-white tracking-wide">Auditorum Identity</span>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-3 py-4">
        <div className="mb-1 px-3 text-[10px] font-semibold uppercase tracking-wider text-gray-500">
          Personal Center
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
      </nav>

      {/* Footer */}
      <div className="border-t border-dark-700 px-4 py-3 pb-6">
        <button 
          onClick={() => disconnect()}
          className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-xs text-gray-400 hover:bg-dark-800 hover:text-white transition-all"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <polyline points="16 17 21 12 16 7" />
            <line x1="21" y1="12" x2="9" y2="12" />
          </svg>
          Disconnect Wallet
        </button>
      </div>
    </aside>
  );
}
