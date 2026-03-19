"use client";

import dynamic from "next/dynamic";

const WalletMultiButtonDynamic = dynamic(
  async () =>
    (await import("@solana/wallet-adapter-react-ui")).WalletMultiButton,
  { ssr: false }
);

export function WalletButton() {
  return (
    <WalletMultiButtonDynamic
      style={{
        backgroundColor: "#0B3D91",
        border: "none",
        borderRadius: "8px",
        fontSize: "13px",
        height: "36px",
        padding: "0 14px",
        fontFamily: "inherit",
        fontWeight: 500,
      }}
    />
  );
}
