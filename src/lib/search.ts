import { Tool } from '@modelcontextprotocol/sdk/types.js';
import {
	SEARCH_DOCS_TOOL,
	SearchOptions,
	SearchResult,
} from './schema.js';
import { search_docs } from './search/core.js';

export { SearchOptions, SearchResult } from './schema.js';

// Export the tool definition for MCP server
export const tool: Tool = SEARCH_DOCS_TOOL;

// Main search function that implements the tool interface
export async function execute_search(
	query: string,
	options: SearchOptions = {},
): Promise<SearchResult[]> {
	const {
		doc_type = 'all',
		context = 1,
		include_hierarchy = true,
	} = options;

	// Validate inputs
	if (!query.trim()) {
		throw new Error('Search query cannot be empty');
	}

	if (context < 0 || context > 3) {
		throw new Error('Context must be between 0 and 3');
	}

	const valid_doc_types = [
		'api',
		'tutorial',
		'example',
		'error',
		'all',
	];
	if (doc_type && !valid_doc_types.includes(doc_type)) {
		throw new Error(`Invalid document type: ${doc_type}`);
	}

	// Execute search with validated options
	return await search_docs(query, {
		doc_type,
		context,
		include_hierarchy,
	});
}

// Helper function to format search results for display
export function format_results(results: SearchResult[]): string {
	if (results.length === 0) {
		return 'No matching results found.';
	}

	return results
		.map((result, index) => {
			const hierarchy_path =
				result.hierarchy.length > 0
					? `\nLocation: ${result.hierarchy.join(' > ')}`
					: '';

			return `
Result ${index + 1}:
Path: ${result.path}
Type: ${result.metadata.doc_type}${hierarchy_path}
Relevance: ${(result.metadata.relevance_score * 100).toFixed(1)}%

${result.excerpt}
---`;
		})
		.join('\n');
}

// Helper function to get search suggestions based on query
export function get_search_suggestions(query: string): string[] {
	const suggestions: string[] = [];
	const query_terms = query.toLowerCase().split(/\s+/);

	// Common Svelte-related terms for suggestions
	const related_terms = {
		component: ['props', 'lifecycle', 'events', 'slots'],
		store: ['writable', 'readable', 'derived', 'subscribe'],
		routing: ['pages', 'navigation', 'params', 'layout'],
		style: ['css', 'scoped', 'global', 'variables'],
		animation: ['transition', 'motion', 'spring', 'tweened'],
		form: ['binding', 'validation', 'submit', 'input'],
		api: ['reference', 'methods', 'properties', 'options'],
		error: ['debug', 'troubleshoot', 'fix', 'solve'],
	};

	// Add related terms based on query
	for (const term of query_terms) {
		const related = Object.entries(related_terms)
			.filter(([key]) => key.includes(term) || term.includes(key))
			.flatMap(([_, terms]) => terms);

		suggestions.push(...related);
	}

	// Add document type suggestions if query matches certain patterns
	if (query.includes('how') || query.includes('learn')) {
		suggestions.push('tutorial');
	}
	if (query.includes('error') || query.includes('bug')) {
		suggestions.push('error');
	}
	if (query.includes('example') || query.includes('demo')) {
		suggestions.push('example');
	}
	if (query.includes('api') || query.includes('reference')) {
		suggestions.push('api');
	}

	// Remove duplicates and limit suggestions
	return [...new Set(suggestions)].slice(0, 5);
}
