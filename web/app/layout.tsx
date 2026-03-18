import type { Metadata } from "next";
import { WalletProvider } from "@/components/providers/WalletProvider";
import { Navbar } from "@/components/Navbar";
import "./globals.css";

export const metadata: Metadata = {
  title: "Auditorum Protocol — Trust Infrastructure for Institutional Reports",
  description:
    "Verify the authenticity of audit reports using blockchain-based cryptographic proofs. Tamper-proof. Verifiable. Transparent.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <WalletProvider>
          <Navbar />
          <main className="min-h-screen pt-16">{children}</main>
        </WalletProvider>
      </body>
    </html>
  );
}
