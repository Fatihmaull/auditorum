-- Auditorum Intelligence Phase 1 Setup
-- Enables pgvector and creates tables for MVP AI features

-- 1. Enable vector extension (must be superuser/postgres)
CREATE EXTENSION IF NOT EXISTS vector;

-- 2. Document Chunks (For RAG)
CREATE TABLE IF NOT EXISTS document_chunks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    document_pubkey TEXT REFERENCES documents(pubkey) ON DELETE CASCADE,
    workspace_pubkey TEXT REFERENCES workspaces(pubkey),
    chunk_index INTEGER NOT NULL,
    content TEXT NOT NULL,
    embedding vector(1536), -- text-embedding-3-small
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 3. Document Intelligence (For Fast Metrics & Summaries)
CREATE TABLE IF NOT EXISTS document_intelligence (
    document_pubkey TEXT PRIMARY KEY REFERENCES documents(pubkey) ON DELETE CASCADE,
    executive_summary TEXT,
    risk_level VARCHAR(20),
    risk_score INTEGER,
    compliance_flags JSONB DEFAULT '[]'::jsonb,
    financial_highlights JSONB DEFAULT '{}'::jsonb,
    fast_metrics JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 4. Graph Architecture (For Intelligence Engine Phase 2)
CREATE TABLE IF NOT EXISTS graph_nodes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    type VARCHAR(20) NOT NULL,
    label TEXT NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS graph_edges (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    source_id UUID REFERENCES graph_nodes(id) ON DELETE CASCADE,
    target_id UUID REFERENCES graph_nodes(id) ON DELETE CASCADE,
    relationship VARCHAR(50) NOT NULL,
    weight FLOAT DEFAULT 1.0,
    metadata JSONB DEFAULT '{}'::jsonb,
    UNIQUE(source_id, target_id, relationship)
);

-- 5. Indexes for fast vector similarity search
CREATE INDEX IF NOT EXISTS idx_chunks_embedding ON document_chunks USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);
CREATE INDEX IF NOT EXISTS idx_chunks_workspace ON document_chunks(workspace_pubkey);

-- 6. RPC: Semantic Search restricted by Workspace (RBAC aware)
CREATE OR REPLACE FUNCTION match_document_chunks(
  query_embedding vector(1536),
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

-- 7. Security: Exempt Intelligence Tables from RLS to allow service_role unrestricted processing
ALTER TABLE document_chunks DISABLE ROW LEVEL SECURITY;
ALTER TABLE document_intelligence DISABLE ROW LEVEL SECURITY;
ALTER TABLE graph_nodes DISABLE ROW LEVEL SECURITY;
ALTER TABLE graph_edges DISABLE ROW LEVEL SECURITY;

GRANT ALL ON document_chunks TO service_role;
GRANT ALL ON document_intelligence TO service_role;
GRANT ALL ON graph_nodes TO service_role;
GRANT ALL ON graph_edges TO service_role;

GRANT EXECUTE ON FUNCTION match_document_chunks TO service_role;
