import { readFileSync, readdirSync } from 'node:fs';
import { basename, extname, join } from 'node:path';

/**
 * Interface for a definition item
 */
export interface DefinitionItem {
	identifier: string;
	title: string;
	content: string;
	related: string[];
	path: string;
}

/**
 * Load all definition files from the definitions directory
 * @param definitionsDir The definitions directory path
 * @returns An array of DefinitionItem objects
 */
export function load_definitions(
	definitionsDir: string,
): DefinitionItem[] {
	const definitions: DefinitionItem[] = [];

	try {
		const files = readdirSync(definitionsDir, {
			withFileTypes: true,
		});

		for (const file of files) {
			if (file.isFile() && extname(file.name) === '.md') {
				const full_path = join(definitionsDir, file.name);
				const content = readFileSync(full_path, 'utf-8');
				const identifier = basename(file.name, '.md');

				// Extract title from the first heading
				const title_match = content.match(/^# (.+)$/m);
				const title = title_match ? title_match[1] : identifier;

				// Extract related definitions from the Related section
				const related = extract_related_definitions(content);

				definitions.push({
					identifier,
					title,
					content,
					related,
					path: full_path,
				});
			}
		}
	} catch (error) {
		console.warn(
			`Warning: Could not load definitions from ${definitionsDir}:`,
			error,
		);
		return [];
	}

	return definitions;
}

/**
 * Extract related definitions from the content
 * @param content The markdown content
 * @returns Array of related definition identifiers
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
 * Get a definition by identifier
 * @param definitions The array of DefinitionItem objects to search
 * @param identifier The identifier to search for
 * @returns The matching DefinitionItem or undefined
 */
export function get_definition_by_identifier(
	definitions: DefinitionItem[],
	identifier: string,
): DefinitionItem | undefined {
	return definitions.find((def) => def.identifier === identifier);
}

/**
 * Search for definitions by query (fuzzy matching)
 * @param definitions The array of DefinitionItem objects to search
 * @param query The search query
 * @returns An array of matching DefinitionItem objects, sorted by relevance
 */
export function search_definitions(
	definitions: DefinitionItem[],
	query: string,
): DefinitionItem[] {
	const normalized_query = query.toLowerCase();
	const matches: Array<{
		definition: DefinitionItem;
		score: number;
	}> = [];

	for (const definition of definitions) {
		let score = 0;
		const identifier_lower = definition.identifier.toLowerCase();
		const title_lower = definition.title.toLowerCase();

		// Exact match gets highest score
		if (identifier_lower === normalized_query) {
			score = 100;
		}
		// Starts with query gets high score
		else if (identifier_lower.startsWith(normalized_query)) {
			score = 80;
		}
		// Contains query gets medium score
		else if (identifier_lower.includes(normalized_query)) {
			score = 60;
		}
		// Title matches get lower score
		else if (title_lower.includes(normalized_query)) {
			score = 40;
		}
		// Content matches get lowest score
		else if (
			definition.content.toLowerCase().includes(normalized_query)
		) {
			score = 20;
		}

		if (score > 0) {
			matches.push({ definition, score });
		}
	}

	// Sort by score (highest first) and return definitions
	return matches
		.sort((a, b) => b.score - a.score)
		.map((match) => match.definition);
}

/**
 * Get all available definition identifiers
 * @param definitions The array of DefinitionItem objects
 * @returns Array of all identifiers
 */
export function get_all_identifiers(
	definitions: DefinitionItem[],
): string[] {
	return definitions.map((def) => def.identifier).sort();
}

/**
 * Suggest similar identifiers for typos and partial matches
 * @param definitions The array of DefinitionItem objects
 * @param query The query that didn't match
 * @returns Array of suggested identifiers
 */
export function suggest_similar_identifiers(
	definitions: DefinitionItem[],
	query: string,
): string[] {
	const suggestions = search_definitions(definitions, query);

	// Return top 5 suggestions
	return suggestions.slice(0, 5).map((def) => def.identifier);
}

/**
 * Get definitions by category (based on identifier patterns)
 * @param definitions The array of DefinitionItem objects
 * @param category The category to filter by ('runes', 'events', 'features')
 * @returns Array of matching definitions
 */
export function get_definitions_by_category(
	definitions: DefinitionItem[],
	category: string,
): DefinitionItem[] {
	switch (category.toLowerCase()) {
		case 'runes':
			return definitions.filter((def) =>
				def.identifier.startsWith('$'),
			);
		case 'events':
			return definitions.filter(
				(def) =>
					def.identifier.includes('click') ||
					def.identifier.includes('event') ||
					def.identifier.startsWith('on'),
			);
		case 'features':
			return definitions.filter(
				(def) =>
					!def.identifier.startsWith('$') &&
					!def.identifier.includes('event') &&
					!def.identifier.startsWith('on'),
			);
		default:
			return [];
	}
}
