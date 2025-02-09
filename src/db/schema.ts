export const SCHEMA = `
-- Main docs table with vector support
CREATE TABLE IF NOT EXISTS docs (
  id TEXT PRIMARY KEY,
  content TEXT NOT NULL,
  concept TEXT NOT NULL,
  related_concepts TEXT,    -- JSON array
  code_examples TEXT,       -- JSON array of { language, code, description, category, runes, functions, components }
  difficulty TEXT CHECK (difficulty IN ('beginner', 'intermediate', 'advanced')),
  tags TEXT,               -- JSON array
  embedding FLOAT32(384),  -- 384-dimensional embedding for semantic search
  last_updated DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Code metadata for efficient searching
CREATE TABLE IF NOT EXISTS code_metadata (
  id TEXT PRIMARY KEY,
  doc_id TEXT NOT NULL,
  category TEXT CHECK (category IN ('state_management', 'effects', 'components', 'events', 'routing', 'security', 'general')),
  runes TEXT,              -- JSON array
  functions TEXT,          -- JSON array
  components TEXT,         -- JSON array
  embedding FLOAT32(384),  -- Vector embedding of the code
  FOREIGN KEY (doc_id) REFERENCES docs(id)
);

-- Common LLM query patterns
CREATE TABLE IF NOT EXISTS llm_query_patterns (
  id TEXT PRIMARY KEY,
  doc_id TEXT NOT NULL,
  pattern TEXT NOT NULL,    -- Common ways LLMs might ask about this
  context TEXT,             -- When this pattern applies
  embedding FLOAT32(384),   -- Vector embedding of the pattern
  FOREIGN KEY (doc_id) REFERENCES docs(id)
);

-- Create vector indexes for approximate nearest neighbor search
CREATE INDEX IF NOT EXISTS docs_embedding_idx ON docs(libsql_vector_idx(embedding));
CREATE INDEX IF NOT EXISTS patterns_embedding_idx ON llm_query_patterns(libsql_vector_idx(embedding));
CREATE INDEX IF NOT EXISTS code_metadata_embedding_idx ON code_metadata(libsql_vector_idx(embedding));

-- Regular indexes
CREATE INDEX IF NOT EXISTS idx_docs_concept ON docs(concept);
CREATE INDEX IF NOT EXISTS idx_docs_difficulty ON docs(difficulty);
CREATE INDEX IF NOT EXISTS idx_code_category ON code_metadata(category);
CREATE INDEX IF NOT EXISTS idx_code_metadata_doc ON code_metadata(doc_id);
`;

import { Client } from '@libsql/client';

export const init_db = async (db: Client) => {
	// Initialize database with schema
	const statements = SCHEMA.split(';').filter((stmt) => stmt.trim());
	for (const stmt of statements) {
		await db.execute(stmt);
	}
};
