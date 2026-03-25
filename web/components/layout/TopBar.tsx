"use client";

import { WalletButton } from "@/components/WalletButton";

interface TopBarProps {
  title: string;
  description?: string;
  actions?: React.ReactNode;
}

export function TopBar({ title, description, actions }: TopBarProps) {
  return (
    <header className="flex h-14 items-center justify-between border-b border-dark-700 bg-dark-900/80 backdrop-blur-md px-6 sticky top-0 z-20">
      <div>
        <h1 className="text-sm font-semibold text-white tracking-wide">{title}</h1>
        {description && (
          <p className="text-xs text-brand-400/80">{description}</p>
        )}
      </div>
      <div className="flex items-center gap-3">
        {actions}
        <WalletButton />
      </div>
    </header>
  );
}
