import Database from 'better-sqlite3';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

// Get the directory of this module
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Interface for a definition item (same as definition-loader)
 */
export interface DefinitionItem {
	identifier: string;
	title: string;
	content: string;
	related: string[];
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
 * Extract related definitions from the content
 */
function extract_related_definitions(content: string): string[] {
	const related: string[] = [];

	// Look for the Related section
	const related_section_match = content.match(
		/## Related\n([\s\S]*?)(?=\n##|$)/,
	);
	if (related_section_match) {
		const related_content = related_section_match[1];

		// Extract identifiers from markdown links and code blocks
		const identifier_matches = related_content.matchAll(/`([^`]+)`/g);
		for (const match of identifier_matches) {
			const identifier = match[1];
			if (identifier && !related.includes(identifier)) {
				related.push(identifier);
			}
		}
	}

	return related;
}

/**
 * Load all definitions from database
 */
export function load_definitions(): DefinitionItem[] {
	const database = initDb();
	const stmt = database.prepare(
		'SELECT id, title, content, path FROM definitions ORDER BY id',
	);
	const rows = stmt.all() as Array<{
		id: string;
		title: string;
		content: string;
		path: string;
	}>;

	return rows.map((row) => ({
		identifier: row.id,
		title: row.title,
		content: row.content,
		related: extract_related_definitions(row.content),
		path: row.path,
	}));
}

/**
 * Get a definition by identifier
 */
export function get_definition_by_identifier(
	identifier: string,
): DefinitionItem | undefined {
	const database = initDb();
	const stmt = database.prepare(
		'SELECT id, title, content, path FROM definitions WHERE id = ?',
	);
	const row = stmt.get(identifier) as
		| { id: string; title: string; content: string; path: string }
		| undefined;

	if (!row) return undefined;

	return {
		identifier: row.id,
		title: row.title,
		content: row.content,
		related: extract_related_definitions(row.content),
		path: row.path,
	};
}

/**
 * Search for definitions by query (fuzzy matching)
 */
export function search_definitions(query: string): DefinitionItem[] {
	const database = initDb();
	const normalizedQuery = `%${query.toLowerCase()}%`;

	// Get all potentially matching rows with scoring
	const stmt = database.prepare(`
		SELECT id, title, content, path,
		CASE 
			WHEN LOWER(id) = LOWER(?) THEN 100
			WHEN LOWER(id) LIKE LOWER(? || '%') THEN 80
			WHEN LOWER(id) LIKE ? THEN 60
			WHEN LOWER(title) LIKE ? THEN 40
			WHEN LOWER(content) LIKE ? THEN 20
			ELSE 0
		END as score
		FROM definitions 
		WHERE score > 0
		ORDER BY score DESC, id
	`);

	const rows = stmt.all(
		query,
		query,
		normalizedQuery,
		normalizedQuery,
		normalizedQuery,
	) as Array<{
		id: string;
		title: string;
		content: string;
		path: string;
		score: number;
	}>;

	return rows.map((row) => ({
		identifier: row.id,
		title: row.title,
		content: row.content,
		related: extract_related_definitions(row.content),
		path: row.path,
	}));
}

/**
 * Get all available definition identifiers
 */
export function get_all_identifiers(): string[] {
	const database = initDb();
	const stmt = database.prepare(
		'SELECT id FROM definitions ORDER BY id',
	);
	return stmt.all().map((row: any) => row.id);
}

/**
 * Suggest similar identifiers for typos and partial matches
 */
export function suggest_similar_identifiers(query: string): string[] {
	const suggestions = search_definitions(query);
	// Return top 5 suggestions
	return suggestions.slice(0, 5).map((def) => def.identifier);
}

/**
 * Get definitions by category (based on identifier patterns)
 */
export function get_definitions_by_category(
	category: string,
): DefinitionItem[] {
	const database = initDb();
	let whereClause = '';

	switch (category.toLowerCase()) {
		case 'runes':
			whereClause = "WHERE id LIKE '$%'";
			break;
		case 'events':
			whereClause =
				"WHERE (id LIKE '%click%' OR id LIKE '%event%' OR id LIKE 'on%')";
			break;
		case 'features':
			whereClause =
				"WHERE id NOT LIKE '$%' AND id NOT LIKE '%event%' AND id NOT LIKE 'on%'";
			break;
		default:
			return [];
	}

	const stmt = database.prepare(
		`SELECT id, title, content, path FROM definitions ${whereClause} ORDER BY id`,
	);
	const rows = stmt.all() as Array<{
		id: string;
		title: string;
		content: string;
		path: string;
	}>;

	return rows.map((row) => ({
		identifier: row.id,
		title: row.title,
		content: row.content,
		related: extract_related_definitions(row.content),
		path: row.path,
	}));
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
