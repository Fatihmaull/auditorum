-- ============================================================
-- Auditorum Protocol — Database Schema  
-- Run this in your Supabase SQL Editor
-- ============================================================

-- Enums
CREATE TYPE user_role AS ENUM (
  'public',
  'company_member',
  'company_admin',
  'auditor',
  'auditor_firm_admin',
  'chain_admin',
  'chain_superadmin'
);

CREATE TYPE doc_category AS ENUM ('financial', 'security', 'compliance');
CREATE TYPE doc_state AS ENUM ('draft', 'anchored', 'verified', 'flagged');
CREATE TYPE doc_visibility AS ENUM ('public', 'internal', 'restricted');

-- Users
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_id UUID UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  role user_role NOT NULL DEFAULT 'company_member',
  wallet_address TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Auditor Firms
CREATE TABLE auditor_firms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  admin_id UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Workspaces
CREATE TABLE workspaces (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  owner_id UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Workspace Members
CREATE TABLE workspace_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  role user_role NOT NULL DEFAULT 'company_member',
  joined_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(workspace_id, user_id)
);

-- Auditors
CREATE TABLE auditors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  firm_id UUID REFERENCES auditor_firms(id),
  specialization TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Audit Contracts
CREATE TABLE audit_contracts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  auditor_id UUID REFERENCES auditors(id),
  workspace_id UUID REFERENCES workspaces(id),
  starts_at TIMESTAMPTZ NOT NULL,
  ends_at TIMESTAMPTZ NOT NULL,
  status TEXT DEFAULT 'active' CHECK (status IN ('active','completed','revoked')),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Documents
CREATE TABLE documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE,
  uploaded_by UUID REFERENCES users(id),
  title TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_size BIGINT,
  hash TEXT NOT NULL,
  category doc_category NOT NULL DEFAULT 'security',
  state doc_state NOT NULL DEFAULT 'draft',
  visibility doc_visibility NOT NULL DEFAULT 'internal',
  tx_signature TEXT,
  on_chain_address TEXT,
  anchored_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Flags
CREATE TABLE flags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID REFERENCES documents(id),
  flagged_by UUID REFERENCES users(id),
  reason TEXT NOT NULL,
  status TEXT DEFAULT 'open' CHECK (status IN ('open','resolved','dismissed')),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Activity Log
CREATE TABLE activity_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  workspace_id UUID REFERENCES workspaces(id),
  action TEXT NOT NULL,
  target_type TEXT,
  target_id UUID,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes
CREATE INDEX idx_documents_workspace ON documents(workspace_id);
CREATE INDEX idx_documents_hash ON documents(hash);
CREATE INDEX idx_documents_state ON documents(state);
CREATE INDEX idx_workspace_members_user ON workspace_members(user_id);
CREATE INDEX idx_activity_log_workspace ON activity_log(workspace_id);
CREATE INDEX idx_audit_contracts_workspace ON audit_contracts(workspace_id);

-- Auto-create user record on auth signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (auth_id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1))
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
