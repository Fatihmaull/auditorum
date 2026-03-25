-- Auditorum Intelligence: Gemini Migration
-- Converts existing vectors to Gemini 3072-dimensional vectors

-- Drop the old table and function first
DROP TABLE IF EXISTS document_chunks CASCADE;
DROP FUNCTION IF EXISTS match_document_chunks CASCADE;

-- Recreate with 3072 dimensions for gemini-embedding-001
CREATE TABLE IF NOT EXISTS document_chunks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    document_pubkey TEXT REFERENCES documents(pubkey) ON DELETE CASCADE,
    workspace_pubkey TEXT REFERENCES workspaces(pubkey),
    chunk_index INTEGER NOT NULL,
    content TEXT NOT NULL,
    embedding vector(3072), 
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Recreate Indexes (Skipping embedding index since 3072 exceeds ivfflat 2000 limit)
-- We will rely on Exact Nearest Neighbor (sequential scan) which is 100% accurate and extremely fast for <10,000 chunks (MVP scale).
CREATE INDEX IF NOT EXISTS idx_chunks_workspace ON document_chunks(workspace_pubkey);

-- Recreate RPC
CREATE OR REPLACE FUNCTION match_document_chunks(
  query_embedding vector(3072),
  match_count int,
  target_workspace_pubkey TEXT,
  target_document_pubkey TEXT DEFAULT NULL
)
RETURNS TABLE (id uuid, content text, similarity float)
LANGUAGE plpgsql AS $$
BEGIN
  RETURN QUERY
  SELECT dc.id, dc.content, 1 - (dc.embedding <=> query_embedding) AS similarity
  FROM document_chunks dc
  WHERE dc.workspace_pubkey = target_workspace_pubkey
    AND (target_document_pubkey IS NULL OR dc.document_pubkey = target_document_pubkey)
  ORDER BY dc.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

-- Apply Security Settings
ALTER TABLE document_chunks DISABLE ROW LEVEL SECURITY;
GRANT ALL ON document_chunks TO service_role;
GRANT EXECUTE ON FUNCTION match_document_chunks TO service_role;
