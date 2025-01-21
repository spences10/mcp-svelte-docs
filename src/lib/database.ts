import { createClient } from '@libsql/client';

// Database client
const db = createClient({
	url: process.env.LIBSQL_URL || 'file:../svelte-docs.db',
	authToken: process.env.LIBSQL_AUTH_TOKEN,
});

// Types
export interface DocRecord {
	path: string;
	content: string;
	last_modified: string;
	last_checked: string;
	etag: string | null;
}

// Initialize database schema
export async function init_db() {
	await db.execute(`
    CREATE TABLE IF NOT EXISTS docs (
      path TEXT PRIMARY KEY,
      content TEXT NOT NULL,
      last_modified TEXT NOT NULL,
      last_checked TEXT NOT NULL,
      etag TEXT
    );
  `);
}

// Cache manager functions
export async function get_cached_doc(
	path: string,
): Promise<DocRecord | undefined> {
	const result = await db.execute({
		sql: 'SELECT * FROM docs WHERE path = ?',
		args: [path],
	});
	const row = result.rows[0];
	if (!row) return undefined;

	return {
		path: row.path as string,
		content: row.content as string,
		last_modified: row.last_modified as string,
		last_checked: row.last_checked as string,
		etag: row.etag as string | null,
	};
}

export async function cache_doc(
	path: string,
	content: string,
	last_modified: string,
	etag: string | null = null,
) {
	await db.execute({
		sql: `
      INSERT INTO docs (path, content, last_modified, last_checked, etag)
      VALUES (?, ?, ?, datetime('now'), ?)
      ON CONFLICT(path) DO UPDATE SET
        content = excluded.content,
        last_modified = excluded.last_modified,
        last_checked = excluded.last_checked,
        etag = excluded.etag
    `,
		args: [path, content, last_modified, etag],
	});
}

export async function get_all_docs() {
	const result = await db.execute({
		sql: 'SELECT path, content FROM docs',
		args: [],
	});
	return result.rows;
}
