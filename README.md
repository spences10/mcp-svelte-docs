# mcp-svelte-docs

An MCP server that provides semantic search capabilities for Svelte
documentation using libSQL's vector search.

## Overview

This server processes Markdown documentation files into a libSQL
database with vector embeddings, enabling semantic search through the
documentation. It extracts:

- Main concepts
- Code examples with metadata
- Difficulty levels
- Tags
- Related concepts
- Common query patterns
- Svelte 5 runes
- Function and component names
- Code categories

Each document, code example, and query pattern is embedded into a 384-dimensional
vector space for semantic similarity search. Note: The current
implementation uses random vectors for development purposes - in
production, this would be replaced with a proper embedding model (like
OpenAI's text-embedding-ada-002 or a similar model).

## Features

- Semantic search across Svelte documentation
- Advanced code analysis:
  - Automatic detection of Svelte 5 runes ($state, $derived, $effect, etc.)
  - Code categorization (state management, effects, components, etc.)
  - Function and component name extraction
  - Code pattern recognition
- Code-specific search filters
- Code similarity search
- Query pattern matching
- Difficulty-based filtering
- Tag-based search
- Related concept discovery

## Requirements

- Turso CLI installed (`curl -sSfL https://get.tur.so/install.sh | bash`)
- Node.js 18+
- A Turso database with vector search support
- (Optional) An embedding model for production use

## Setup

1. Clone the repository:

```bash
git clone https://github.com/yourusername/mcp-svelte-docs
cd mcp-svelte-docs
```

2. Install dependencies:

```bash
pnpm install
```

3. Set up Turso database with vector support:

```bash
# Create a new database group (recommended for vector support)
turso group create default

# Create a new database
turso db create mcp-svelte-docs-testing

# Get database URL and auth token
turso db show mcp-svelte-docs-testing
turso db tokens create mcp-svelte-docs-testing
```

4. Configure environment variables:

Create a `.env` file with:

```env
TURSO_DB_URL=libsql://your-database-url
TURSO_DB_AUTH_TOKEN=your-auth-token
```

5. Start the MCP server:

```bash
pnpm run build
```

## Vector Search Setup

The server uses Turso's native vector search capabilities. Here are important details about the implementation:

### Vector Column Type

Vector columns must be defined using the `FLOAT32(dimensions)` type, where dimensions is the size of your vector. For example:

```sql
embedding FLOAT32(384)  -- 384-dimensional embedding
```

### Vector Operations

The following vector operations are available:

- `vector('[1,2,3]')` - Create a vector from JSON array string
- `vector_extract(embedding)` - Convert vector to string format
- `vector_distance_cos(v1, v2)` - Calculate cosine similarity
- `vector_top_k(index_name, vector, k)` - Get top-k similar vectors

### Vector Indexes

Indexes are created using libSQL's vector index function:

```sql
CREATE INDEX embedding_idx ON table_name(libsql_vector_idx(embedding));
```

### Common Issues

1. **Incorrect Vector Column Type**: 
   - Error: `vector index: unexpected vector column type`
   - Solution: Use `FLOAT32(dimensions)` instead of `BLOB` or `F32_BLOB`

2. **Database Version**: 
   - Make sure your database group is updated to support vectors
   - Use `turso group update default` if needed

3. **Vector Dimension Mismatch**:
   - Ensure all vectors have the same dimension (384 in this case)
   - Check vector creation in embeddings.ts

## Database Schema

The database uses three main tables:

### docs

- `id`: TEXT PRIMARY KEY
- `content`: TEXT NOT NULL
- `concept`: TEXT NOT NULL
- `related_concepts`: TEXT (JSON array)
- `code_examples`: TEXT (JSON array)
- `difficulty`: TEXT ('beginner', 'intermediate', 'advanced')
- `tags`: TEXT (JSON array)
- `embedding`: FLOAT32(384) - 384-dimensional embedding for semantic search

### code_metadata

- `id`: TEXT PRIMARY KEY
- `doc_id`: TEXT NOT NULL
- `category`: TEXT ('state_management', 'effects', 'components', 'events', 'routing', 'security', 'general')
- `runes`: TEXT (JSON array)
- `functions`: TEXT (JSON array)
- `components`: TEXT (JSON array)
- `embedding`: FLOAT32(384) - Vector embedding of the code

### llm_query_patterns

- `id`: TEXT PRIMARY KEY
- `doc_id`: TEXT NOT NULL
- `pattern`: TEXT NOT NULL
- `context`: TEXT
- `embedding`: FLOAT32(384)

Vector indexes are created using libSQL's native vector search capabilities:

```sql
CREATE INDEX docs_embedding_idx ON docs(libsql_vector_idx(embedding));
CREATE INDEX patterns_embedding_idx ON llm_query_patterns(libsql_vector_idx(embedding));
CREATE INDEX code_metadata_embedding_idx ON code_metadata(libsql_vector_idx(embedding));
```

## Usage

The server provides a search tool through the MCP protocol:

```typescript
await mcp.use_tool('mcp-svelte-docs', 'search_docs', {
  query: 'How do I handle events in Svelte?',
  doc_type: 'api', // optional
  context: 1, // optional: number of surrounding paragraphs
  include_hierarchy: true, // optional
  category: 'events', // optional: filter by code category
  has_runes: ['$state', '$effect'], // optional: filter by runes
  has_functions: ['handleClick'], // optional: filter by function names
  has_components: ['Button'], // optional: filter by component names
});
```

The search results include:
- Relevant documentation sections
- Matching code examples with metadata
- Query patterns
- Similarity scores for both document and code matches

## License

MIT
