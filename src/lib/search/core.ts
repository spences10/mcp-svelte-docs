import { get_all_docs, get_docs_by_type } from '../database.js';
import {
	SearchOptions,
	SearchResult,
	SectionHierarchy,
} from '../schema.js';

function extract_hierarchy(content: string): SectionHierarchy {
	const lines = content.split('\n');
	const root: SectionHierarchy = {
		title: '',
		level: 0,
		children: [],
	};
	const stack: SectionHierarchy[] = [root];

	lines.forEach((line) => {
		const match = line.match(/^(#{1,6})\s+(.+)$/);
		if (match) {
			const level = match[1].length;
			const title = match[2].trim();
			const node: SectionHierarchy = { title, level, children: [] };

			while (
				stack.length > 1 &&
				stack[stack.length - 1].level >= level
			) {
				stack.pop();
			}

			stack[stack.length - 1].children.push(node);
			stack.push(node);
		}
	});

	return root;
}

function get_section_path(
	hierarchy: SectionHierarchy,
	target_title: string,
): string[] {
	const path: string[] = [];

	function search(
		node: SectionHierarchy,
		current_path: string[],
	): boolean {
		if (node.title === target_title) {
			path.push(...current_path, node.title);
			return true;
		}

		for (const child of node.children) {
			if (search(child, [...current_path, node.title])) {
				return true;
			}
		}

		return false;
	}

	search(hierarchy, []);
	return path.filter(Boolean);
}

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
	const section_depth = get_section_path(hierarchy, '').length;
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

export async function search_docs(
	query: string,
	options: SearchOptions = {},
): Promise<SearchResult[]> {
	const {
		doc_type = 'all',
		context = 1,
		include_hierarchy = true,
	} = options;

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

		const section_path = include_hierarchy
			? get_section_path(hierarchy, '')
			: [];

		return {
			path: doc.path as string,
			excerpt,
			hierarchy: section_path,
			metadata: {
				doc_type,
				relevance_score,
				match_quality: relevance_score,
				context_depth: context,
				section_importance: 1 / (section_path.length || 1),
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
