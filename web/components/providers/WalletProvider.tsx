"use client";

import { FC, ReactNode, useMemo, useEffect } from "react";
import {
  ConnectionProvider,
  useWallet,
  WalletProvider as SolanaWalletProvider,
} from "@solana/wallet-adapter-react";
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";
import { PhantomWalletAdapter } from "@solana/wallet-adapter-phantom";
import { SolflareWalletAdapter } from "@solana/wallet-adapter-solflare";
import { CLUSTER_URL } from "@/lib/solana/constants";
import { useRouter } from "next/navigation";

import "@solana/wallet-adapter-react-ui/styles.css";

function SessionTracker() {
  const { connected, connecting } = useWallet();
  const router = useRouter();

  useEffect(() => {
    // If we transition to a disconnected state when we aren't connecting
    if (!connected && !connecting) {
      fetch("/api/auth/logout", { method: "POST" })
        .then(() => {
          router.refresh();
        })
        .catch(console.error);
    }
  }, [connected, connecting, router]);

  return null;
}

interface Props {
  children: ReactNode;
}

export const WalletProvider: FC<Props> = ({ children }) => {
  const endpoint = CLUSTER_URL;

  const wallets = useMemo(
    () => [new PhantomWalletAdapter(), new SolflareWalletAdapter()],
    []
  );

  return (
    <ConnectionProvider endpoint={endpoint}>
      <SolanaWalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>
          <SessionTracker />
          {children}
        </WalletModalProvider>
      </SolanaWalletProvider>
    </ConnectionProvider>
  );
};

