import { db } from '../db/client.js';
import { DocType, Package } from '../docs/fetcher.js';

export interface SearchOptions {
	query: string;
	doc_type?: DocType | 'all';
	context?: number;
	include_hierarchy?: boolean;
	package?: Package;
}

export interface SearchResult {
	content: string;
	type: DocType;
	package: Package;
	hierarchy?: string[];
	relevance_score: number;
	category?: 'runes' | 'components' | 'routing' | 'error';
}

// Term importance weights
const TERM_WEIGHTS: Record<string, number> = {
	// Svelte 5 Runes
	'runes': 1.5,
	'$state': 1.5,
	'$derived': 1.5,
	'$effect': 1.5,
	'$props': 1.5,
	'$bindable': 1.5,
	
	// Core concepts
	'lifecycle': 1.3,
	'component': 1.3,
	'store': 1.3,
	'reactive': 1.3,
	
	// SvelteKit
	'sveltekit': 1.4,
	'routing': 1.4,
	'server': 1.4,
	'load': 1.4,
	'action': 1.4,
	
	// Error related
	'error': 1.2,
	'warning': 1.2,
	'debug': 1.2
};

export const search_docs = async ({
	query,
	doc_type = 'all',
	context = 1,
	include_hierarchy = true,
	package: pkg,
}: SearchOptions): Promise<SearchResult[]> => {
	// Normalize and split query
	const terms = query.toLowerCase()
		.replace(/[^\w\s]/g, ' ')
		.split(/\s+/)
		.filter(term => term.length > 2);
		
	// Apply term weights
	const weighted_terms = terms.map(term => ({
		term,
		weight: TERM_WEIGHTS[term] || 1.0
	}));

	let sql = `
    WITH term_matches AS (
      SELECT 
        doc_id,
        SUM(frequency * section_importance * ?) as term_score
      FROM search_index
      WHERE term = ?
      GROUP BY doc_id
    ),
    relevance AS (
      SELECT 
        d.id,
        d.content,
        d.type,
        d.package,
        d.hierarchy,
        COALESCE(tm.term_score, 0) as score
      FROM docs d
      LEFT JOIN term_matches tm ON d.id = tm.doc_id
      WHERE 1=1
  `;

	const args: any[] = weighted_terms.flatMap(t => [t.weight, t.term]);

	if (doc_type !== 'all') {
		sql += ' AND d.type = ?';
		args.push(doc_type);
	}

	if (pkg) {
		sql += ' AND d.package = ?';
		args.push(pkg);
	}

	sql += `
      GROUP BY d.id, d.content, d.type, d.package, d.hierarchy
      HAVING score > 0
      ORDER BY score DESC
      LIMIT 10
    )
    SELECT * FROM relevance
  `;

	const results = await db.execute({ sql, args });

	const search_results = results.rows.map((row: any) => ({
		content: row.content,
		type: row.type as DocType,
		package: row.package as Package,
		hierarchy: row.hierarchy ? JSON.parse(row.hierarchy) : undefined,
		relevance_score: row.score,
		category: determine_category(row.content)
	}));

	// Group results by category
	const grouped_results = search_results.reduce((groups, result) => {
		const category = result.category || 'other';
		if (!groups[category]) {
			groups[category] = [];
		}
		groups[category].push(result);
		return groups;
	}, {} as Record<string, SearchResult[]>);

	// Flatten and return results
	return Object.entries(grouped_results)
		.flatMap(([_, results]) => results)
		.sort((a, b) => b.relevance_score - a.relevance_score);
};

// Helper to determine result category
function determine_category(content: string): SearchResult['category'] {
	const lower_content = content.toLowerCase();
	
	if (lower_content.includes('rune') || 
		lower_content.includes('$state') || 
		lower_content.includes('$effect')) {
		return 'runes';
	}
	
	if (lower_content.includes('component') || 
		lower_content.includes('lifecycle')) {
		return 'components';
	}
	
	if (lower_content.includes('route') || 
		lower_content.includes('navigation') ||
		lower_content.includes('sveltekit')) {
		return 'routing';
	}
	
	if (lower_content.includes('error') || 
		lower_content.includes('warning') ||
		lower_content.includes('debug')) {
		return 'error';
	}
	
	return undefined;
}

export const index_doc_content = async (
	doc_id: string,
	content: string,
	section_importance: number = 1.0,
) => {
	const terms = new Map<string, number>();

	// Extract terms and count frequency
	content
		.toLowerCase()
		.split(/\s+/)
		.forEach((term) => {
			if (term.length > 2) {
				// Skip very short terms
				terms.set(term, (terms.get(term) || 0) + 1);
			}
		});

	// Store in search index
	for (const [term, frequency] of terms.entries()) {
		await db.execute({
			sql: `INSERT OR REPLACE INTO search_index 
            (doc_id, term, frequency, section_importance) 
            VALUES (?, ?, ?, ?)`,
			args: [doc_id, term, frequency, section_importance],
		});
	}
};
