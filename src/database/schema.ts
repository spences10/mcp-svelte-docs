import { Client } from '@libsql/client';

export async function initialize_database(client: Client): Promise<void> {
  // Create documents table with vector support
  await client.execute(`
    CREATE TABLE IF NOT EXISTS documents (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      path TEXT NOT NULL UNIQUE,
      content TEXT NOT NULL,
      embedding BLOB, -- LibSQL vector type
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Create index on path for faster lookups
  await client.execute(`
    CREATE INDEX IF NOT EXISTS idx_documents_path ON documents(path);
  `);
}

export async function store_document(
  client: Client,
  path: string,
  content: string,
  embedding?: number[]
): Promise<void> {
  const query = `
    INSERT INTO documents (path, content, embedding)
    VALUES (?, ?, ?)
    ON CONFLICT(path) DO UPDATE SET
      content = excluded.content,
      embedding = excluded.embedding,
      updated_at = CURRENT_TIMESTAMP
  `;

  await client.execute({
    sql: query,
    args: [
      path,
      content,
      embedding ? Buffer.from(new Float32Array(embedding).buffer) : null
    ]
  });
}

export async function get_document(
  client: Client,
  path: string
): Promise<{ content: string; embedding: number[] | null } | null> {
  const result = await client.execute({
    sql: 'SELECT content, embedding FROM documents WHERE path = ?',
    args: [path]
  });

  if (result.rows.length === 0) {
    return null;
  }

  const row = result.rows[0];
  const embedding = row.embedding 
    ? Array.from(new Float32Array(Buffer.from(row.embedding as Buffer)))
    : null;

  return {
    content: row.content as string,
    embedding
  };
}

export async function search_similar_documents(
  client: Client,
  embedding: number[],
  limit: number = 5
): Promise<Array<{ path: string; content: string; similarity: number }>> {
  // Use LibSQL's vector_dot function for similarity search
  const query = `
    SELECT 
      path,
      content,
      vector_dot(embedding, ?) as similarity
    FROM documents
    WHERE embedding IS NOT NULL
    ORDER BY similarity DESC
    LIMIT ?
  `;

  const result = await client.execute({
    sql: query,
    args: [
      Buffer.from(new Float32Array(embedding).buffer),
      limit
    ]
  });

  return result.rows.map(row => ({
    path: row.path as string,
    content: row.content as string,
    similarity: row.similarity as number
  }));
}
