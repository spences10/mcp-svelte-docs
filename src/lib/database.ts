import { createClient } from '@libsql/client';

// Database client
const db = createClient({
	url: process.env.LIBSQL_URL || 'file:../svelte-docs.db',
	authToken: process.env.LIBSQL_AUTH_TOKEN,
});

import { DocumentMetadata } from './schema.js';

// Types
export interface DocRecord {
	path: string;
	content: string;
	last_modified: string;
	last_checked: string;
	etag: string | null;
	doc_type: DocumentMetadata['doc_type'];
	hierarchy: string; // JSON stringified SectionHierarchy
	last_indexed: string;
}

// Initialize database schema
export async function init_db() {
	await db.execute(`
    CREATE TABLE IF NOT EXISTS docs (
      path TEXT PRIMARY KEY,
      content TEXT NOT NULL,
      last_modified TEXT NOT NULL,
      last_checked TEXT NOT NULL,
      etag TEXT,
      doc_type TEXT NOT NULL DEFAULT 'general',
      hierarchy TEXT NOT NULL DEFAULT '{}',
      last_indexed TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
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
		doc_type: row.doc_type as DocumentMetadata['doc_type'],
		hierarchy: row.hierarchy as string,
		last_indexed: row.last_indexed as string,
	};
}

export async function cache_doc(
	path: string,
	content: string,
	last_modified: string,
	etag: string | null = null,
	metadata: Partial<DocumentMetadata> = {},
) {
	const {
		doc_type = 'general',
		hierarchy = { title: '', level: 0, children: [] },
	} = metadata;

	await db.execute({
		sql: `
      INSERT INTO docs (
        path, content, last_modified, last_checked, etag,
        doc_type, hierarchy, last_indexed
      )
      VALUES (?, ?, ?, datetime('now'), ?, ?, ?, datetime('now'))
      ON CONFLICT(path) DO UPDATE SET
        content = excluded.content,
        last_modified = excluded.last_modified,
        last_checked = excluded.last_checked,
        etag = excluded.etag,
        doc_type = excluded.doc_type,
        hierarchy = excluded.hierarchy,
        last_indexed = excluded.last_indexed
    `,
		args: [
			path,
			content,
			last_modified,
			etag,
			doc_type,
			JSON.stringify(hierarchy),
		],
	});
}

export async function get_all_docs() {
	const result = await db.execute({
		sql: 'SELECT path, content, doc_type, hierarchy FROM docs',
		args: [],
	});
	return result.rows;
}

export async function get_docs_by_type(
	doc_type: DocumentMetadata['doc_type'],
) {
	const result = await db.execute({
		sql: 'SELECT path, content, doc_type, hierarchy FROM docs WHERE doc_type = ?',
		args: [doc_type],
	});
	return result.rows;
}
