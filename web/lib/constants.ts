import { PublicKey } from "@solana/web3.js";

// ============================================================
// Program ID — update after `anchor keys list`
// ============================================================
export const PROGRAM_ID = new PublicKey(
  "2Vp8UoxngxFcGZi8iFd8SpQYhyfniANvBt7w2srE8Y6o"
);

// ============================================================
// Cluster
// ============================================================
export const CLUSTER_URL =
  process.env.NEXT_PUBLIC_SOLANA_RPC_URL ||
  "https://api.devnet.solana.com";

export const CLUSTER_NAME = "devnet";

// ============================================================
// Industry & Role Enums (Matching lib.rs)
// ============================================================
export const INDUSTRIES = [
  { value: 0, label: "Financial" },
  { value: 1, label: "Security" },
  { value: 2, label: "Compliance" },
] as const;

export const ROLES = [
  { value: 0, label: "Auditor" },
  { value: 1, label: "Company" },
] as const;

export type Industry = (typeof INDUSTRIES)[number];
export type Role = (typeof ROLES)[number];
