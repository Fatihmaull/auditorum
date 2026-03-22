-- ============================================================
-- Auditorum Protocol — Database Fix (SQL Editor)
-- ============================================================

-- 1. Disable RLS for Initial Seeding
-- ------------------------------------------------------------
-- This ensures the `service_role` key and indexer can sync data.
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE workspaces DISABLE ROW LEVEL SECURITY;
ALTER TABLE documents DISABLE ROW LEVEL SECURITY;
ALTER TABLE activity_logs DISABLE ROW LEVEL SECURITY;
ALTER TABLE auditor_assignments DISABLE ROW LEVEL SECURITY;

-- 2. Grant Explicit Access to Service Role
-- ------------------------------------------------------------
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO service_role;
GRANT ALL ON ALL ROUTINES IN SCHEMA public TO service_role;

-- 3. (Optional) Re-enable with proper Policies later:
-- ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
-- CREATE POLICY "Public read" ON documents FOR SELECT USING (visibility = 'public');
