-- ═══════════════════════════════════════════════════════════════════════════
-- AfroStore RAG Engine — Database Migration
--
-- Creates the rag_documents table with:
--   - pgvector for semantic similarity search (HNSW index)
--   - tsvector for BM25/full-text search (GIN index)
--   - JSONB metadata for flexible filtering (GIN index)
--   - Multi-tenant isolation via store_id (B-tree index)
--   - Content deduplication via content_hash
--
-- Prerequisites:
--   - PostgreSQL 15+ recommended
--   - pgvector extension installed (CREATE EXTENSION vector)
--
-- Run order: Execute this AFTER Prisma migrations.
-- ═══════════════════════════════════════════════════════════════════════════

-- Step 1: Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- Step 2: Enable pg_trgm for fuzzy matching (optional but recommended)
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Step 3: Create the RAG documents table
CREATE TABLE IF NOT EXISTS rag_documents (
    -- Primary key
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Multi-tenant isolation (MANDATORY for every query)
    store_id        TEXT NOT NULL,

    -- Document identity
    document_id     TEXT NOT NULL,          -- External entity ID (product, order, etc.)
    document_type   TEXT NOT NULL,          -- 'product', 'order', 'customer', etc.

    -- Searchable content
    title           TEXT NOT NULL DEFAULT '',
    content         TEXT NOT NULL DEFAULT '',

    -- Structured metadata (JSONB for flexible filtering)
    metadata        JSONB NOT NULL DEFAULT '{}',

    -- Chunking info
    chunk_index     INTEGER NOT NULL DEFAULT 0,
    chunk_total     INTEGER NOT NULL DEFAULT 1,

    -- Change detection
    content_hash    TEXT NOT NULL DEFAULT '',

    -- Document lifecycle
    status          TEXT NOT NULL DEFAULT 'active',
        -- active: searchable
        -- stale: needs re-indexing
        -- deleted: soft-deleted, pending cleanup
        -- indexing: currently being processed
        -- failed: indexing failed

    -- Vector embedding (1536 dimensions for text-embedding-3-small)
    -- Change dimension if using a different model
    embedding       vector(1536),

    -- Full-text search vector (auto-populated via trigger or INSERT)
    tsv             tsvector,

    -- Timestamps
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── INDEXES ────────────────────────────────────────────────────────────────

-- Step 4: Multi-tenant isolation index (CRITICAL — every query hits this)
CREATE INDEX IF NOT EXISTS idx_rag_store_id
    ON rag_documents (store_id);

-- Step 5: Document lookup (for upserts and deletions)
CREATE UNIQUE INDEX IF NOT EXISTS idx_rag_document_chunk
    ON rag_documents (store_id, document_id, chunk_index);

-- Step 6: Document type filtering
CREATE INDEX IF NOT EXISTS idx_rag_store_type
    ON rag_documents (store_id, document_type);

-- Step 7: Status filtering
CREATE INDEX IF NOT EXISTS idx_rag_store_status
    ON rag_documents (store_id, status);

-- Step 8: Content hash for dedup checking
CREATE INDEX IF NOT EXISTS idx_rag_content_hash
    ON rag_documents (store_id, document_id, content_hash)
    WHERE chunk_index = 0;

-- Step 9: HNSW index for vector similarity search
-- HNSW parameters:
--   m = 16: number of connections per layer (16 is good for 1536-dim)
--   ef_construction = 200: build quality (higher = better recall, slower build)
-- This index makes vector search sub-10ms for <1M vectors
CREATE INDEX IF NOT EXISTS idx_rag_embedding_hnsw
    ON rag_documents
    USING hnsw (embedding vector_cosine_ops)
    WITH (m = 16, ef_construction = 200);

-- Step 10: GIN index for full-text search (BM25)
-- This makes keyword search instant even on millions of documents
CREATE INDEX IF NOT EXISTS idx_rag_tsv
    ON rag_documents
    USING GIN (tsv);

-- Step 11: GIN index on title tsvector for weighted search
CREATE INDEX IF NOT EXISTS idx_rag_title_tsv
    ON rag_documents
    USING GIN (to_tsvector('english', title));

-- Step 12: GIN index on metadata for JSONB filtering
CREATE INDEX IF NOT EXISTS idx_rag_metadata
    ON rag_documents
    USING GIN (metadata jsonb_path_ops);

-- Step 13: Composite index for common query patterns
CREATE INDEX IF NOT EXISTS idx_rag_store_type_status
    ON rag_documents (store_id, document_type, status)
    WHERE status = 'active';

-- Step 14: Updated-at index for cleanup jobs
CREATE INDEX IF NOT EXISTS idx_rag_updated_at
    ON rag_documents (updated_at);

-- ─── TRIGGER: Auto-update updated_at ────────────────────────────────────────

CREATE OR REPLACE FUNCTION rag_update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_rag_update_timestamp ON rag_documents;
CREATE TRIGGER trg_rag_update_timestamp
    BEFORE UPDATE ON rag_documents
    FOR EACH ROW
    EXECUTE FUNCTION rag_update_timestamp();

-- ─── TRIGGER: Auto-update tsvector on content change ────────────────────────

CREATE OR REPLACE FUNCTION rag_update_tsv()
RETURNS TRIGGER AS $$
BEGIN
    NEW.tsv = to_tsvector('english',
        COALESCE(NEW.title, '') || ' ' || COALESCE(NEW.content, '')
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_rag_update_tsv ON rag_documents;
CREATE TRIGGER trg_rag_update_tsv
    BEFORE INSERT OR UPDATE OF title, content ON rag_documents
    FOR EACH ROW
    EXECUTE FUNCTION rag_update_tsv();

-- ─── HELPER FUNCTIONS ───────────────────────────────────────────────────────

-- Function to get document count by type for a store
CREATE OR REPLACE FUNCTION rag_store_stats(p_store_id TEXT)
RETURNS TABLE(document_type TEXT, doc_count BIGINT, chunk_count BIGINT) AS $$
BEGIN
    RETURN QUERY
    SELECT
        rd.document_type,
        COUNT(DISTINCT rd.document_id) AS doc_count,
        COUNT(*) AS chunk_count
    FROM rag_documents rd
    WHERE rd.store_id = p_store_id
      AND rd.status = 'active'
    GROUP BY rd.document_type
    ORDER BY doc_count DESC;
END;
$$ LANGUAGE plpgsql STABLE;

-- Function to clean up stale/deleted documents older than N days
CREATE OR REPLACE FUNCTION rag_cleanup(p_days INTEGER DEFAULT 30)
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM rag_documents
    WHERE status IN ('deleted', 'failed')
      AND updated_at < NOW() - (p_days || ' days')::INTERVAL;
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- Function to mark all documents for a store+type as stale (triggers re-index)
CREATE OR REPLACE FUNCTION rag_mark_stale(p_store_id TEXT, p_document_type TEXT DEFAULT NULL)
RETURNS INTEGER AS $$
DECLARE
    updated_count INTEGER;
BEGIN
    IF p_document_type IS NOT NULL THEN
        UPDATE rag_documents
        SET status = 'stale'
        WHERE store_id = p_store_id
          AND document_type = p_document_type
          AND status = 'active';
    ELSE
        UPDATE rag_documents
        SET status = 'stale'
        WHERE store_id = p_store_id
          AND status = 'active';
    END IF;
    GET DIAGNOSTICS updated_count = ROW_COUNT;
    RETURN updated_count;
END;
$$ LANGUAGE plpgsql;

-- ─── COMMENTS ───────────────────────────────────────────────────────────────

COMMENT ON TABLE rag_documents IS 'RAG document store for AfroStore AI search. Supports hybrid BM25+vector search with multi-tenant isolation.';
COMMENT ON COLUMN rag_documents.store_id IS 'Tenant isolation key. Every query MUST filter on this.';
COMMENT ON COLUMN rag_documents.embedding IS 'Vector embedding from text-embedding-3-small (1536 dimensions). Used for semantic similarity search.';
COMMENT ON COLUMN rag_documents.tsv IS 'Full-text search vector. Auto-populated by trigger. Used for BM25 keyword search.';
COMMENT ON COLUMN rag_documents.metadata IS 'JSONB metadata for filtering. Schema varies by document_type.';
COMMENT ON INDEX idx_rag_embedding_hnsw IS 'HNSW index for fast approximate nearest neighbor vector search. Params: m=16, ef_construction=200.';
COMMENT ON INDEX idx_rag_tsv IS 'GIN index for full-text keyword search (BM25-equivalent).';
