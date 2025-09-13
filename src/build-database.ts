#!/usr/bin/env node

import Database from 'better-sqlite3';
import { existsSync, readFileSync, readdirSync, statSync, unlinkSync } from 'node:fs';
import { basename, extname, join } from 'node:path';

const DB_PATH = 'dist/definitions.db';

interface Doc {
	id: string;
	title: string;
	content: string;
	category: string;
	path: string;
}

// Simple markdown loader (copy of the TS version)
function load_markdown_docs(baseDir: string): Doc[] {
	const docs: Doc[] = [];

	function process_directory(dir: string, category: string): void {
		const files = readdirSync(dir, { withFileTypes: true });

		for (const file of files) {
			const full_path = join(dir, file.name);

			if (file.isDirectory()) {
				process_directory(full_path, file.name);
			} else if (file.isFile() && extname(file.name) === '.md') {
				const content = readFileSync(full_path, 'utf-8');
				const id = basename(file.name, '.md');

				const title_match = content.match(/^# (.+)$/m);
				const title = title_match ? title_match[1] : id;

				docs.push({
					id,
					title,
					content,
					category,
					path: full_path,
				});
			}
		}
	}

	process_directory(baseDir, 'root');
	return docs;
}

// Remove existing database
if (existsSync(DB_PATH)) {
	unlinkSync(DB_PATH);
	console.log('🗑️  Removed existing database');
}

// Create new database
const db = Database(DB_PATH);
console.log('📝 Created new database');

// Create schema
db.exec(`
	CREATE TABLE definitions (
		id TEXT PRIMARY KEY,
		title TEXT NOT NULL,
		content TEXT NOT NULL,
		category TEXT NOT NULL,
		path TEXT NOT NULL,
		created_at INTEGER DEFAULT (strftime('%s', 'now'))
	);
	
	CREATE INDEX idx_category ON definitions(category);
	CREATE INDEX idx_title ON definitions(title);
	CREATE INDEX idx_id_category ON definitions(id, category);
`);

console.log('🏗️  Created database schema');

// Prepare insert statement
const insert = db.prepare(`
	INSERT INTO definitions (id, title, content, category, path)
	VALUES (?, ?, ?, ?, ?)
`);

// Load markdown docs
const docs = load_markdown_docs(join(process.cwd(), 'definitions'));
console.log(`📚 Loaded ${docs.length} markdown documents`);

// Insert all docs
const insert_many = db.transaction((docs: Doc[]) => {
	for (const doc of docs) {
		insert.run(doc.id, doc.title, doc.content, doc.category, doc.path);
	}
});

insert_many(docs);

// Get stats
const stats = db.prepare('SELECT COUNT(*) as count, category FROM definitions GROUP BY category').all() as Array<{ count: number; category: string }>;
console.log('📊 Database populated:');
stats.forEach((stat) => {
	console.log(`   ${stat.category}: ${stat.count} definitions`);
});

// Close database
db.close();

// Show file size
const size = statSync(DB_PATH).size;
console.log(`💾 Database size: ${(size / 1024).toFixed(1)}KB`);

console.log('✅ Database build complete!');