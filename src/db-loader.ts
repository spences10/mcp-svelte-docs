import Database from 'better-sqlite3';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

// Get the directory of this module
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Interface for a documentation item (same as markdown-loader)
 */
export interface DocItem {
	id: string;
	title: string;
	content: string;
	category: string;
	path: string;
}

let db: Database.Database | null = null;

/**
 * Initialize database connection
 */
function initDb(): Database.Database {
	if (!db) {
		const dbPath = join(__dirname, 'definitions.db');
		db = Database(dbPath, { readonly: true });
	}
	return db;
}

/**
 * Load all documentation items from database
 */
export function load_markdown_docs(): DocItem[] {
	const database = initDb();
	const stmt = database.prepare('SELECT id, title, content, category, path FROM definitions ORDER BY category, id');
	return stmt.all() as DocItem[];
}

/**
 * Search for documentation items by query
 */
export function search_docs(query: string): DocItem[] {
	const database = initDb();
	const normalizedQuery = `%${query.toLowerCase()}%`;
	
	const stmt = database.prepare(`
		SELECT id, title, content, category, path 
		FROM definitions 
		WHERE LOWER(title) LIKE ? 
		   OR LOWER(content) LIKE ? 
		   OR LOWER(category) LIKE ? 
		   OR LOWER(id) LIKE ?
		ORDER BY category, id
	`);
	
	return stmt.all(normalizedQuery, normalizedQuery, normalizedQuery, normalizedQuery) as DocItem[];
}

/**
 * Get documentation items by category
 */
export function get_docs_by_category(category: string): DocItem[] {
	const database = initDb();
	const stmt = database.prepare('SELECT id, title, content, category, path FROM definitions WHERE category = ? ORDER BY id');
	return stmt.all(category) as DocItem[];
}

/**
 * Get a documentation item by ID
 */
export function get_doc_by_id(id: string): DocItem | undefined {
	const database = initDb();
	const stmt = database.prepare('SELECT id, title, content, category, path FROM definitions WHERE id = ?');
	return stmt.get(id) as DocItem | undefined;
}

/**
 * Get a documentation item by category and ID
 */
export function get_doc_by_category_and_id(category: string, id: string): DocItem | undefined {
	const database = initDb();
	const stmt = database.prepare('SELECT id, title, content, category, path FROM definitions WHERE category = ? AND id = ?');
	return stmt.get(category, id) as DocItem | undefined;
}

/**
 * Close database connection
 */
export function closeDb(): void {
	if (db) {
		db.close();
		db = null;
	}
}

// Cleanup on process exit
process.on('exit', closeDb);
process.on('SIGINT', closeDb);
process.on('SIGTERM', closeDb);