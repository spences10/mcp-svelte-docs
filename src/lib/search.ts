import { Tool } from '@modelcontextprotocol/sdk/types.js';
import { get_all_docs, get_docs_by_type } from './database.js';
import {
	SEARCH_DOCS_TOOL,
	SearchOptions,
	SearchResult,
	SectionHierarchy,
} from './schema.js';

// Export the tool definition for MCP server
export const tool: Tool = SEARCH_DOCS_TOOL;

function calculate_relevance(
	content: string,
	query: string,
	hierarchy: SectionHierarchy,
	doc_type: string,
): number {
	const query_terms = query.toLowerCase().split(/\s+/);
	const content_lower = content.toLowerCase();

	// Term frequency scoring
	const term_frequency =
		query_terms.reduce((score, term) => {
			const matches = content_lower.match(new RegExp(term, 'g'));
			return score + (matches ? matches.length : 0);
		}, 0) / content.length;

	// Section importance based on hierarchy depth
	const section_depth = hierarchy.level;
	const depth_score = 1 / (section_depth + 1);

	// Document type relevance
	const type_weights: Record<string, number> = {
		api: 1.5,
		tutorial: 1.3,
		example: 1.2,
		error: 1.4,
		general: 1.0,
	};
	const type_score = type_weights[doc_type] || 1.0;

	// Exact phrase matching
	const exact_match_bonus = content_lower.includes(
		query.toLowerCase(),
	)
		? 1.5
		: 1.0;

	return (
		(term_frequency * 0.4 + depth_score * 0.3) *
		type_score *
		exact_match_bonus
	);
}

function extract_context(
	content: string,
	query: string,
	context_size: number,
): string {
	const paragraphs = content.split(/\n\s*\n/);
	const query_lower = query.toLowerCase();

	let best_match_index = -1;
	let best_match_score = -1;

	paragraphs.forEach((para, index) => {
		const score = calculate_relevance(
			para,
			query,
			{ title: '', level: 0, children: [] },
			'general',
		);
		if (score > best_match_score) {
			best_match_score = score;
			best_match_index = index;
		}
	});

	if (best_match_index === -1) return '';

	const start = Math.max(0, best_match_index - context_size);
	const end = Math.min(
		paragraphs.length,
		best_match_index + context_size + 1,
	);

	return paragraphs.slice(start, end).join('\n\n');
}

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

	const docs =
		doc_type === 'all'
			? await get_all_docs()
			: await get_docs_by_type(doc_type);

	const results = docs.map((doc) => {
		const content = doc.content as string;
		const hierarchy = JSON.parse(
			doc.hierarchy as string,
		) as SectionHierarchy;
		const doc_type =
			doc.doc_type as SearchResult['metadata']['doc_type'];

		const relevance_score = calculate_relevance(
			content,
			query,
			hierarchy,
			doc_type,
		);
		if (relevance_score < 0.2) return null;

		const excerpt = extract_context(content, query, context);
		if (!excerpt) return null;

		return {
			path: doc.path as string,
			excerpt,
			hierarchy: include_hierarchy
				? hierarchy.title
					? [hierarchy.title]
					: []
				: [],
			metadata: {
				doc_type,
				relevance_score,
				match_quality: relevance_score,
				context_depth: context,
				section_importance: 1 / (hierarchy.level || 1),
			},
		};
	});

	return results
		.filter(
			(result): result is NonNullable<typeof result> =>
				result !== null,
		)
		.sort(
			(a, b) =>
				b.metadata.relevance_score - a.metadata.relevance_score,
		);
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
