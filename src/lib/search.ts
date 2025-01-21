import { get_all_docs } from './database.js';

// Extract relevant excerpt around match
function extract_excerpt(
	content: string,
	query: string,
	context_length = 500,
): string {
	const lower_content = content.toLowerCase();
	const lower_query = query.toLowerCase();
	const index = lower_content.indexOf(lower_query);
	if (index === -1) return '';

	const start = Math.max(0, index - context_length);
	const end = Math.min(
		content.length,
		index + query.length + context_length,
	);

	let excerpt = content.slice(start, end);

	// Add ellipsis if truncated
	if (start > 0) excerpt = '...' + excerpt;
	if (end < content.length) excerpt = excerpt + '...';

	return excerpt;
}

function tokenize(text: string): string[] {
	return text
		.toLowerCase()
		.replace(/[^\w\s]/g, ' ')
		.split(/\s+/)
		.filter((word) => word.length > 0);
}

function calculate_section_relevance(
	section_text: string,
	query_tokens: string[],
): number {
	const section_tokens = tokenize(section_text);
	let matches = 0;
	let consecutive_matches = 0;
	let max_consecutive = 0;

	// Count individual token matches
	for (const query_token of query_tokens) {
		if (section_tokens.includes(query_token)) {
			matches++;
		}
	}

	// Look for consecutive token matches
	for (
		let i = 0;
		i < section_tokens.length - query_tokens.length + 1;
		i++
	) {
		consecutive_matches = 0;
		for (let j = 0; j < query_tokens.length; j++) {
			if (section_tokens[i + j] === query_tokens[j]) {
				consecutive_matches++;
			} else {
				break;
			}
		}
		max_consecutive = Math.max(max_consecutive, consecutive_matches);
	}

	// Calculate final score combining individual and consecutive matches
	const individual_score = matches / query_tokens.length;
	const consecutive_score = max_consecutive / query_tokens.length;

	// More specific key terms related to component props
	const key_terms = {
		primary: ['$props', 'props'],
		secondary: ['component', 'export'],
		context: ['declaring', 'passing'],
	};

	const lower_text = section_text.toLowerCase();
	const primary_matches = key_terms.primary.filter((term) =>
		lower_text.includes(term),
	).length;
	const secondary_matches = key_terms.secondary.filter((term) =>
		lower_text.includes(term),
	).length;
	const context_matches = key_terms.context.filter((term) =>
		lower_text.includes(term),
	).length;

	const key_terms_boost =
		(primary_matches / key_terms.primary.length) * 0.3 +
		(secondary_matches / key_terms.secondary.length) * 0.1 +
		(context_matches / key_terms.context.length) * 0.1;

	return (
		individual_score * 0.3 + consecutive_score * 0.2 + key_terms_boost
	);
}

function extract_key_concepts(query: string): string[] {
	// Define important concepts related to Svelte documentation
	const concept_groups = {
		props: ['props', '$props', 'properties', 'parameters'],
		components: ['component', 'components'],
		actions: ['declaring', 'passing', 'using', 'export'],
	};

	const query_tokens = tokenize(query);
	const key_concepts = new Set<string>();

	// Match query tokens to concept groups
	for (const token of query_tokens) {
		for (const [concept, variations] of Object.entries(
			concept_groups,
		)) {
			if (variations.includes(token)) {
				key_concepts.add(concept);
				break;
			}
		}
	}

	return Array.from(key_concepts);
}

export interface SearchResult {
	path: string;
	excerpt: string;
	metadata: {
		relevance_score: string;
		match_quality: string;
		excerpt_token_estimate: number;
		section_type: 'api' | 'example' | 'general';
	};
}

export async function search_docs(
	query: string,
): Promise<SearchResult[]> {
	const query_tokens = tokenize(query);
	if (query_tokens.length === 0) return [];

	// Extract key concepts from the query
	const key_concepts = extract_key_concepts(query);
	const simplified_query = key_concepts.join(' ');

	// Use both original query and simplified query for search
	const search_tokens = [
		...new Set([...tokenize(simplified_query), ...query_tokens]),
	];

	const result = await get_all_docs();

	const results = result.map((row) => {
		const content = row.content as string;

		// Split content into sections by headers and find best matching section
		const sections = content
			.split(/(?=^#[^#].*$)|(?=^##[^#].*$)/m)
			.filter(Boolean);
		let best_section = '';
		let best_section_score = 0;
		let best_section_index = 0;

		sections.forEach((section, index) => {
			const score = calculate_section_relevance(
				section,
				query_tokens,
			);
			if (score > best_section_score) {
				best_section_score = score;
				best_section = section;
				best_section_index = index;
			}
		});

		// If no good match found, skip this document
		if (best_section_score < 0.25) return null;

		// Get the best matching section with some context
		const excerpt =
			best_section.length > 500
				? best_section.slice(0, 500) + '...'
				: best_section;

		// Calculate additional relevance factors
		const is_api_section = content
			.toLowerCase()
			.includes('api reference')
			? 1.5
			: 1;
		const has_example = content.toLowerCase().includes('example');
		const section_weight = has_example ? 1.2 : 1;

		return {
			path: row.path as string,
			excerpt:
				excerpt.length > 500
					? excerpt.slice(0, 500) + '...'
					: excerpt,
			metadata: {
				relevance_score: (
					best_section_score * 0.5 +
					is_api_section * section_weight * 0.2 +
					(best_section.toLowerCase().includes('$props')
						? 0.3
						: best_section.toLowerCase().includes('props')
						? 0.2
						: 0)
				).toFixed(2),
				match_quality: best_section_score.toFixed(2),
				excerpt_token_estimate: Math.round(excerpt.length / 4),
				section_type: (
					is_api_section > 1
						? 'api'
						: has_example
						? 'example'
						: 'general'
				) as 'api' | 'example' | 'general',
			},
		};
	});

	// Filter out null results and sort by relevance score
	return results
		.filter(
			(result): result is NonNullable<typeof result> =>
				result !== null,
		)
		.sort(
			(a, b) =>
				parseFloat(b.metadata.relevance_score) -
				parseFloat(a.metadata.relevance_score),
		);
}
