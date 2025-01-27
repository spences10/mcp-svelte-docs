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
}

export const search_docs = async ({
	query,
	doc_type = 'all',
	context = 1,
	include_hierarchy = true,
	package: pkg,
}: SearchOptions): Promise<SearchResult[]> => {
	const terms = query.toLowerCase().split(/\s+/);

	let sql = `
    WITH term_matches AS (
      SELECT 
        doc_id,
        SUM(frequency * section_importance) as term_score
      FROM search_index
      WHERE term IN (${terms.map(() => '?').join(',')})
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

	const args: any[] = [...terms];

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

	return results.rows.map((row: any) => ({
		content: row.content,
		type: row.type as DocType,
		package: row.package as Package,
		hierarchy: row.hierarchy ? JSON.parse(row.hierarchy) : undefined,
		relevance_score: row.score,
	}));
};

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
