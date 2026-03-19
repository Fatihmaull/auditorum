"use client";

import { WalletButton } from "@/components/WalletButton";

interface TopBarProps {
  title: string;
  description?: string;
  actions?: React.ReactNode;
}

export function TopBar({ title, description, actions }: TopBarProps) {
  return (
    <header className="flex h-14 items-center justify-between border-b border-gray-100 bg-white px-6">
      <div>
        <h1 className="text-sm font-semibold text-gray-900">{title}</h1>
        {description && (
          <p className="text-xs text-gray-500">{description}</p>
        )}
      </div>
      <div className="flex items-center gap-3">
        {actions}
        <WalletButton />
      </div>
    </header>
  );
}
