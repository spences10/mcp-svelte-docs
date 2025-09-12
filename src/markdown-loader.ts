import { readFileSync, readdirSync } from 'node:fs';
import { basename, extname, join } from 'node:path';

/**
 * Interface for a documentation item
 */
export interface DocItem {
	id: string;
	title: string;
	content: string;
	category: string;
	path: string;
}

/**
 * Load all markdown files from a directory and its subdirectories
 * @param baseDir The base directory to search
 * @returns An array of DocItem objects
 */
export function load_markdown_docs(baseDir: string): DocItem[] {
	const docs: DocItem[] = [];

	function process_directory(dir: string, category: string) {
		const files = readdirSync(dir, { withFileTypes: true });

		for (const file of files) {
			const full_path = join(dir, file.name);

			if (file.isDirectory()) {
				// Process subdirectories with their name as the category
				process_directory(full_path, file.name);
			} else if (file.isFile() && extname(file.name) === '.md') {
				// Process markdown files
				const content = readFileSync(full_path, 'utf-8');
				const id = basename(file.name, '.md');

				// Extract title from the first heading
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

	// Start processing from the base directory
	process_directory(baseDir, 'root');

	return docs;
}

/**
 * Search for documentation items by query
 * @param docs The array of DocItem objects to search
 * @param query The search query
 * @returns An array of matching DocItem objects
 */
export function search_docs(
	docs: DocItem[],
	query: string,
): DocItem[] {
	const normalized_query = query.toLowerCase();

	return docs.filter((doc) => {
		return (
			doc.title.toLowerCase().includes(normalized_query) ||
			doc.content.toLowerCase().includes(normalized_query) ||
			doc.category.toLowerCase().includes(normalized_query) ||
			doc.id.toLowerCase().includes(normalized_query)
		);
	});
}

/**
 * Get documentation items by category
 * @param docs The array of DocItem objects to filter
 * @param category The category to filter by
 * @returns An array of DocItem objects in the specified category
 */
export function get_docs_by_category(
	docs: DocItem[],
	category: string,
): DocItem[] {
	return docs.filter((doc) => doc.category === category);
}

/**
 * Get a documentation item by ID
 * @param docs The array of DocItem objects to search
 * @param id The ID to search for
 * @returns The matching DocItem or undefined
 */
export function get_doc_by_id(
	docs: DocItem[],
	id: string,
): DocItem | undefined {
	return docs.find((doc) => doc.id === id);
}

/**
 * Get a documentation item by category and ID
 * @param docs The array of DocItem objects to search
 * @param category The category to filter by
 * @param id The ID to search for
 * @returns The matching DocItem or undefined
 */
export function get_doc_by_category_and_id(
	docs: DocItem[],
	category: string,
	id: string,
): DocItem | undefined {
	return docs.find(
		(doc) => doc.category === category && doc.id === id,
	);
}
