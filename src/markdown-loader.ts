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
export function loadMarkdownDocs(baseDir: string): DocItem[] {
	const docs: DocItem[] = [];

	function processDirectory(dir: string, category: string) {
		const files = readdirSync(dir, { withFileTypes: true });

		for (const file of files) {
			const fullPath = join(dir, file.name);

			if (file.isDirectory()) {
				// Process subdirectories with their name as the category
				processDirectory(fullPath, file.name);
			} else if (file.isFile() && extname(file.name) === '.md') {
				// Process markdown files
				const content = readFileSync(fullPath, 'utf-8');
				const id = basename(file.name, '.md');

				// Extract title from the first heading
				const titleMatch = content.match(/^# (.+)$/m);
				const title = titleMatch ? titleMatch[1] : id;

				docs.push({
					id,
					title,
					content,
					category,
					path: fullPath,
				});
			}
		}
	}

	// Start processing from the base directory
	processDirectory(baseDir, 'root');

	return docs;
}

/**
 * Search for documentation items by query
 * @param docs The array of DocItem objects to search
 * @param query The search query
 * @returns An array of matching DocItem objects
 */
export function searchDocs(
	docs: DocItem[],
	query: string,
): DocItem[] {
	const normalizedQuery = query.toLowerCase();

	return docs.filter((doc) => {
		return (
			doc.title.toLowerCase().includes(normalizedQuery) ||
			doc.content.toLowerCase().includes(normalizedQuery) ||
			doc.category.toLowerCase().includes(normalizedQuery) ||
			doc.id.toLowerCase().includes(normalizedQuery)
		);
	});
}

/**
 * Get documentation items by category
 * @param docs The array of DocItem objects to filter
 * @param category The category to filter by
 * @returns An array of DocItem objects in the specified category
 */
export function getDocsByCategory(
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
export function getDocById(
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
export function getDocByCategoryAndId(
	docs: DocItem[],
	category: string,
	id: string,
): DocItem | undefined {
	return docs.find(
		(doc) => doc.category === category && doc.id === id,
	);
}
