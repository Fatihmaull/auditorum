"use client";

import Link from "next/link";

export function PublicNavbar() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-dark-700 bg-dark-900/80 backdrop-blur-lg">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-6">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-brand-500 text-xs font-bold text-white shadow-[0_0_12px_rgba(99,102,241,0.5)]">
            A
          </div>
          <span className="text-sm font-semibold text-white tracking-wide">
            Auditorum
          </span>
        </Link>

        <div className="flex items-center gap-1">
          <Link href="/login" className="btn-primary btn-sm ml-2">
            Enter Dashboard
          </Link>
        </div>
      </div>
    </nav>
  );
}
