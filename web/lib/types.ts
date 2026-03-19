// ============================================================
// Shared types for Auditorum Protocol
// ============================================================

// ---- Database Enums ----
export type UserRole =
  | "public"
  | "company_member"
  | "company_admin"
  | "auditor"
  | "auditor_firm_admin"
  | "chain_admin"
  | "chain_superadmin";

export type DocCategory = "financial" | "security" | "compliance";
export type DocState = "draft" | "anchored" | "verified" | "flagged";
export type DocVisibility = "public" | "internal" | "restricted";
export type ContractStatus = "active" | "completed" | "revoked";

// ---- Database Row Types ----
export interface User {
  id: string;
  auth_id: string;
  email: string;
  full_name: string;
  role: UserRole;
  wallet_address: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface Workspace {
  id: string;
  name: string;
  slug: string;
  owner_id: string;
  created_at: string;
}

export interface WorkspaceMember {
  id: string;
  workspace_id: string;
  user_id: string;
  role: UserRole;
  joined_at: string;
}

export interface AuditorFirm {
  id: string;
  name: string;
  admin_id: string;
  created_at: string;
}

export interface Auditor {
  id: string;
  user_id: string;
  firm_id: string;
  specialization: string | null;
  created_at: string;
}

export interface AuditContract {
  id: string;
  auditor_id: string;
  workspace_id: string;
  starts_at: string;
  ends_at: string;
  status: ContractStatus;
  created_at: string;
}

export interface Document {
  id: string;
  workspace_id: string;
  uploaded_by: string;
  title: string;
  file_path: string;
  file_size: number | null;
  hash: string;
  category: DocCategory;
  state: DocState;
  visibility: DocVisibility;
  tx_signature: string | null;
  on_chain_address: string | null;
  anchored_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface Flag {
  id: string;
  document_id: string;
  flagged_by: string;
  reason: string;
  status: "open" | "resolved" | "dismissed";
  created_at: string;
}

export interface ActivityLog {
  id: string;
  user_id: string;
  workspace_id: string | null;
  action: string;
  target_type: string | null;
  target_id: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
}

// ---- On-chain types ----
export interface OnChainAuditRecord {
  authority: string;
  hash: number[];
  industry: number;
  role: number;
  isSigned: boolean;
  isFlagged: boolean;
  createdAt: number;
  bump: number;
}

// ---- Constants ----
export const INDUSTRIES = [
  { value: 0, label: "Cybersecurity", slug: "cybersecurity" },
  { value: 1, label: "Finance", slug: "finance" },
  { value: 2, label: "Governance", slug: "governance" },
] as const;

export const ROLES = [
  { value: 0, label: "Auditor", slug: "auditor" },
  { value: 1, label: "Company Admin", slug: "company_admin" },
] as const;

export const DOC_CATEGORIES: { value: DocCategory; label: string }[] = [
  { value: "financial", label: "Financial" },
  { value: "security", label: "Security" },
  { value: "compliance", label: "Compliance" },
];

export const DOC_STATES: { value: DocState; label: string; color: string }[] = [
  { value: "draft", label: "Draft", color: "gray" },
  { value: "anchored", label: "Anchored", color: "blue" },
  { value: "verified", label: "Verified", color: "green" },
  { value: "flagged", label: "Flagged", color: "red" },
];

export const DOC_VISIBILITIES: { value: DocVisibility; label: string }[] = [
  { value: "public", label: "Public" },
  { value: "internal", label: "Internal" },
  { value: "restricted", label: "Restricted" },
];
