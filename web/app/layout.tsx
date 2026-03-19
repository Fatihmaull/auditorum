import type { Metadata } from "next";
import { WalletProvider } from "@/components/providers/WalletProvider";
import "./globals.css";

export const metadata: Metadata = {
  title: "Auditorum Protocol",
  description: "Trust infrastructure for institutional reports. Verify audit reports with cryptographic proofs on Solana.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <WalletProvider>{children}</WalletProvider>
      </body>
    </html>
  );
}
