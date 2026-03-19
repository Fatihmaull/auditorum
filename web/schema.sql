-- ============================================================
-- Auditorum Protocol V2 — Indexer Schema
-- ============================================================

-- Enums
CREATE TYPE doc_category AS ENUM ('financial', 'security', 'compliance');
CREATE TYPE doc_visibility AS ENUM ('public', 'internal', 'restricted');

-- Users
-- In V2, wallets are the source of truth. No passwords.
CREATE TABLE users (
  wallet_address TEXT PRIMARY KEY,
  profile_name TEXT,
  avatar_url TEXT,
  nonce TEXT NOT NULL, -- Used for SIWS (Sign-In With Solana)
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Workspaces
-- Synced from on-chain `Workspace` PDA
CREATE TABLE workspaces (
  pubkey TEXT PRIMARY KEY,
  admin_pubkey TEXT REFERENCES users(wallet_address) ON DELETE CASCADE,
  company_name TEXT NOT NULL,
  subscription_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Auditor Assignments
-- Synced from on-chain `AuditorAssignment` PDA
CREATE TABLE auditor_assignments (
  pubkey TEXT PRIMARY KEY,
  workspace_pubkey TEXT REFERENCES workspaces(pubkey) ON DELETE CASCADE,
  auditor_pubkey TEXT REFERENCES users(wallet_address) ON DELETE CASCADE,
  firm_pubkey TEXT,
  expiry TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Documents (Metadata only)
-- Synced from on-chain `DocumentMetadata` PDA
-- Encrypted files live on IPFS, not here.
CREATE TABLE documents (
  pubkey TEXT PRIMARY KEY,
  workspace_pubkey TEXT REFERENCES workspaces(pubkey) ON DELETE CASCADE,
  uploader_pubkey TEXT REFERENCES users(wallet_address) ON DELETE CASCADE,
  document_hash TEXT NOT NULL,
  file_cid TEXT NOT NULL,
  category doc_category NOT NULL DEFAULT 'security',
  visibility doc_visibility NOT NULL DEFAULT 'internal',
  is_flagged BOOLEAN DEFAULT false,
  is_acknowledged BOOLEAN DEFAULT false,
  anchored_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Activity Logs
-- Synced from Solana transactions
CREATE TABLE activity_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_pubkey TEXT REFERENCES workspaces(pubkey) ON DELETE CASCADE,
  actor_pubkey TEXT REFERENCES users(wallet_address) ON DELETE CASCADE,
  action TEXT NOT NULL,
  target_pubkey TEXT,
  metadata JSONB DEFAULT '{}',
  signature TEXT UNIQUE, -- Solana tx signature
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes for fast UI querying
CREATE INDEX idx_documents_workspace ON documents(workspace_pubkey);
CREATE INDEX idx_documents_hash ON documents(document_hash);
CREATE INDEX idx_documents_cid ON documents(file_cid);
CREATE INDEX idx_assignments_workspace ON auditor_assignments(workspace_pubkey);
CREATE INDEX idx_assignments_auditor ON auditor_assignments(auditor_pubkey);
CREATE INDEX idx_activity_workspace ON activity_logs(workspace_pubkey);
