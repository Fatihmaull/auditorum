"use client";

import dynamic from "next/dynamic";

// Dynamically import to avoid SSR issues with wallet adapter
const WalletMultiButtonDynamic = dynamic(
  async () =>
    (await import("@solana/wallet-adapter-react-ui")).WalletMultiButton,
  { ssr: false }
);

export function WalletButton() {
  return (
    <WalletMultiButtonDynamic
      style={{
        backgroundColor: "rgba(255, 255, 255, 0.06)",
        border: "1px solid rgba(255, 255, 255, 0.1)",
        borderRadius: "12px",
        fontSize: "14px",
        height: "40px",
        padding: "0 16px",
        fontFamily: "inherit",
      }}
    />
  );
}
