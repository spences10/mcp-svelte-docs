import { Client } from '@libsql/client';
import {
	ErrorCode,
	McpError,
} from '@modelcontextprotocol/sdk/types.js';
import { embeddings } from '../processor/embeddings.js';
import {
	Doc,
	SearchEngine,
	SearchFilters,
	SearchOptions,
	SearchResult,
} from '../types.js';

export class VectorSearchEngine implements SearchEngine {
	constructor(private db: Client) {}

	private async apply_filters(
		query: string,
		filters?: SearchFilters,
	): Promise<string> {
		const conditions: string[] = [];

		if (filters?.difficulty) {
			conditions.push(`d.difficulty = '${filters.difficulty}'`);
		}

		if (filters?.tags?.length) {
			const tags_condition = filters.tags
				.map((tag) => `d.tags LIKE '%${tag}%'`)
				.join(' OR ');
			conditions.push(`(${tags_condition})`);
		}

		if (filters?.concepts?.length) {
			const concepts_condition = filters.concepts
				.map(
					(concept) =>
						`d.concept = '${concept}' OR d.related_concepts LIKE '%${concept}%'`,
				)
				.join(' OR ');
			conditions.push(`(${concepts_condition})`);
		}

		// Code-specific filters
		if (filters?.category) {
			conditions.push(`EXISTS (
        SELECT 1 FROM code_metadata cm 
        WHERE cm.doc_id = d.id 
        AND cm.category = '${filters.category}'
      )`);
		}
		if (filters?.has_runes?.length) {
			const runes_condition = filters.has_runes
				.map((rune) => `cm.runes LIKE '%${rune}%'`)
				.join(' OR ');
			conditions.push(`EXISTS (
        SELECT 1 FROM code_metadata cm 
        WHERE cm.doc_id = d.id 
        AND (${runes_condition})
      )`);
		}

		if (filters?.has_functions?.length) {
			const funcs_condition = filters.has_functions
				.map((func) => `cm.functions LIKE '%${func}%'`)
				.join(' OR ');
			conditions.push(`EXISTS (
        SELECT 1 FROM code_metadata cm 
        WHERE cm.doc_id = d.id 
        AND (${funcs_condition})
      )`);
		}

		if (filters?.has_components?.length) {
			const comps_condition = filters.has_components
				.map((comp) => `cm.components LIKE '%${comp}%'`)
				.join(' OR ');
			conditions.push(`EXISTS (
        SELECT 1 FROM code_metadata cm 
        WHERE cm.doc_id = d.id 
        AND (${comps_condition})
      )`);
		}

		return conditions.length
			? ` AND ${conditions.join(' AND ')}`
			: '';
	}

	async search(
		query: string,
		options: SearchOptions = {},
	): Promise<SearchResult[]> {
		const filter_conditions = await this.apply_filters(
			query,
			options.filters,
		);
		const limit = options.limit || 5;
		const results: SearchResult[] = [];

		try {
			// Try vector search first
			try {
				const query_embedding = await embeddings.generate_embedding(
					query,
				);
				const docs_result = await this.db.execute({
					sql: `
            SELECT 
              d.*,
              vector_distance_cos(d.embedding, ?) as doc_similarity
            FROM docs d
            WHERE 1=1 ${filter_conditions}
            ORDER BY doc_similarity DESC
            LIMIT ?`,
					args: [
						embeddings.vector_to_sql_string(query_embedding),
						limit,
					],
				});

				// If vector search succeeds, process results
				if (docs_result.rows.length > 0) {
					for (const row of docs_result.rows) {
						const doc: Doc = {
							id: row.id as string,
							content: row.content as string,
							concept: row.concept as string,
							related_concepts: JSON.parse(
								(row.related_concepts as string) || '[]',
							),
							code_examples: JSON.parse(
								(row.code_examples as string) || '[]',
							),
							difficulty: row.difficulty as any,
							tags: JSON.parse((row.tags as string) || '[]'),
							embedding: embeddings.blob_to_vector(
								row.embedding as Uint8Array,
							),
							last_updated: row.last_updated as string,
						};

						results.push({
							doc,
							similarity: row.doc_similarity as number,
						});
					}
					return results;
				}
			} catch (vector_error) {
				console.error(
					'Vector search failed, falling back to keyword search:',
					vector_error,
				);
			}

			// Fall back to keyword search if vector search fails or returns no results
			const docs_result = await this.db.execute({
				sql: `
          SELECT 
            d.*,
            1.0 as doc_similarity
          FROM docs d
          WHERE (
            d.content LIKE ? 
            OR d.concept LIKE ?
            OR d.tags LIKE ?
            OR EXISTS (
              SELECT 1 FROM code_metadata cm 
              WHERE cm.doc_id = d.id
              AND (
                cm.runes LIKE ?
                OR cm.functions LIKE ?
                OR cm.components LIKE ?
              )
            )
          ) ${filter_conditions}
          ORDER BY doc_similarity DESC
          LIMIT ?`,
				args: Array(6).fill(`%${query}%`).concat([limit]),
			});

			// Process document results
			for (const row of docs_result.rows) {
				const doc: Doc = {
					id: row.id as string,
					content: row.content as string,
					concept: row.concept as string,
					related_concepts: JSON.parse(
						(row.related_concepts as string) || '[]',
					),
					code_examples: JSON.parse(
						(row.code_examples as string) || '[]',
					),
					difficulty: row.difficulty as any,
					tags: JSON.parse((row.tags as string) || '[]'),
					embedding: embeddings.blob_to_vector(
						row.embedding as Uint8Array,
					),
					last_updated: row.last_updated as string,
				};

				results.push({
					doc,
					similarity: row.doc_similarity as number,
				});
			}
		} catch (error) {
			console.error('Search error:', error);
			throw new McpError(
				ErrorCode.InternalError,
				`Search failed: ${
					error instanceof Error ? error.message : 'Unknown error'
				}`,
			);
		}

		return results;
	}

	async similar_docs(
		embedding: number[],
		limit: number = 5,
	): Promise<SearchResult[]> {
		try {
			const result = await this.db.execute({
				sql: `
          SELECT 
            d.*,
            vector_distance_cos(d.embedding, ?) as similarity
          FROM docs d
          ORDER BY similarity DESC
          LIMIT ?`,
				args: [embeddings.vector_to_sql_string(embedding), limit],
			});

			return result.rows.map((row) => ({
				doc: {
					id: row.id as string,
					content: row.content as string,
					concept: row.concept as string,
					related_concepts: JSON.parse(
						(row.related_concepts as string) || '[]',
					),
					code_examples: JSON.parse(
						(row.code_examples as string) || '[]',
					),
					difficulty: row.difficulty as any,
					tags: JSON.parse((row.tags as string) || '[]'),
					embedding: embeddings.blob_to_vector(
						row.embedding as Uint8Array,
					),
					last_updated: row.last_updated as string,
				},
				similarity: row.similarity as number,
			}));
		} catch (error) {
			console.error('Similar docs error:', error);
			throw error;
		}
	}

	async search_by_concept(
		concept: string,
		options: SearchOptions = {},
	): Promise<SearchResult[]> {
		const filter_conditions = await this.apply_filters(
			'',
			options.filters,
		);
		const limit = options.limit || 5;

		const result = await this.db.execute({
			sql: `
        SELECT 
          d.*
        FROM 
          docs d
        WHERE 
          d.concept = ? ${filter_conditions}
        LIMIT ?`,
			args: [concept, limit],
		});

		return result.rows.map((row) => ({
			doc: {
				id: row.id as string,
				content: row.content as string,
				concept: row.concept as string,
				related_concepts: JSON.parse(
					(row.related_concepts as string) || '[]',
				),
				code_examples: JSON.parse(
					(row.code_examples as string) || '[]',
				),
				difficulty: row.difficulty as any,
				tags: JSON.parse((row.tags as string) || '[]'),
				embedding: embeddings.blob_to_vector(
					row.embedding as Uint8Array,
				),
				last_updated: row.last_updated as string,
			},
			similarity: 1.0, // Direct concept match
		}));
	}
}
