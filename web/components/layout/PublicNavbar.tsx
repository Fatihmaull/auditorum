"use client";

import Link from "next/link";

export function PublicNavbar() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-gray-100 bg-white/80 backdrop-blur-lg">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-6">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-[#0B3D91] text-xs font-bold text-white">
            A
          </div>
          <span className="text-sm font-semibold text-gray-900">
            Auditorum
          </span>
        </Link>

        <div className="flex items-center gap-1">
          <Link href="/explore" className="btn-ghost btn-sm">
            Explore
          </Link>
          <Link href="/verify" className="btn-ghost btn-sm">
            Verify
          </Link>
          <Link href="/login" className="btn-secondary btn-sm ml-2">
            Sign in
          </Link>
        </div>
      </div>
    </nav>
  );
}
