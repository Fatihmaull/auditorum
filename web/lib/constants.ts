import { PublicKey } from "@solana/web3.js";

// ============================================================
// Program ID — update after `anchor keys list`
// ============================================================
export const PROGRAM_ID = new PublicKey(
  "AUDTRMxKvMbFCPn3KhUmD9FwPsAqkJx2RMwUG8gu4wnc"
);

// ============================================================
// Cluster
// ============================================================
export const CLUSTER_URL =
  process.env.NEXT_PUBLIC_SOLANA_RPC_URL ||
  "https://api.devnet.solana.com";

export const CLUSTER_NAME = "devnet";

// ============================================================
// Industry & Role Enums
// ============================================================
export const INDUSTRIES = [
  { value: 0, label: "Cybersecurity" },
  { value: 1, label: "Finance" },
  { value: 2, label: "Governance" },
] as const;

export const ROLES = [
  { value: 0, label: "Auditor" },
  { value: 1, label: "Company" },
] as const;

export type Industry = (typeof INDUSTRIES)[number];
export type Role = (typeof ROLES)[number];
