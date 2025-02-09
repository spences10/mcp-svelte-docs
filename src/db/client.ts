import { Client, Config, createClient } from '@libsql/client';
import { accessSync, constants, existsSync } from 'fs';

// Extract database path from URL if it's a file URL
function get_db_path(url: string): string | null {
	if (url.startsWith('file:')) {
		return url.replace('file:', '');
	}
	return null;
}

// Create client based on available env vars
const config: Config = {
	url:
		process.env.TURSO_DB_URL ||
		process.env.LIBSQL_URL ||
		'file:./svelte-docs.db',
	...(process.env.TURSO_DB_URL && process.env.TURSO_DB_AUTH_TOKEN
		? { authToken: process.env.TURSO_DB_AUTH_TOKEN }
		: {}),
};

// Check if database file exists and is writable
const db_path = get_db_path(config.url);
if (db_path) {
	console.error(`Using database file: ${db_path}`);

	// Create empty file if it doesn't exist
	if (!existsSync(db_path)) {
		console.error('Database file does not exist, it will be created');
	}

	try {
		if (existsSync(db_path)) {
			accessSync(db_path, constants.W_OK);
			console.error('Database file is writable');
		}
	} catch (error) {
		console.error('Database file is not writable:', error);
		throw new Error('Database file is not writable');
	}
}

export const db: Client = createClient(config);

export const verify_db = async (): Promise<void> => {
	// Wait a bit to ensure all inserts have completed
	await new Promise((resolve) => setTimeout(resolve, 1000));

	const result = await db.execute(
		'SELECT COUNT(*) as count FROM docs',
	);
	const count = result.rows[0].count;
	if (count === 0) {
		console.error(
			'No documents found in database, checking tables...',
		);

		// Check if tables exist
		const tables = await db.execute(`
			SELECT name FROM sqlite_master 
			WHERE type='table' AND (name='docs' OR name='llm_query_patterns')
		`);

		if (tables.rows.length < 2) {
			throw new Error('Database tables not created properly');
		}

		throw new Error(
			'Database is empty after initialization - tables exist but no documents were inserted',
		);
	}
	console.error(`Database populated with ${count} documents`);
};

import { init_db as initialize_schema } from './schema.js';

export const init_db = async (): Promise<void> => {
	await initialize_schema(db);
};
