#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
	CallToolRequestSchema,
	ErrorCode,
	ListToolsRequestSchema,
	McpError,
} from '@modelcontextprotocol/sdk/types.js';
import { readFileSync } from 'fs';
import { randomUUID } from 'node:crypto';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import { db, init_db, verify_db } from './db/client.js';
import { embeddings } from './processor/embeddings.js';
import { process_markdown_directory } from './processor/markdown.js';
import { VectorSearchEngine } from './search/engine.js';
import { CodeCategory } from './types.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const pkg = JSON.parse(
	readFileSync(join(__dirname, '..', 'package.json'), 'utf8'),
);
const { name, version } = pkg;

class SvelteDocsServer {
	private server: Server;
	private search_engine: VectorSearchEngine;

	constructor() {
		this.server = new Server(
			{ name, version },
			{
				capabilities: {
					tools: {
						search_docs: {
							name: 'search_docs',
							description:
								'Search Svelte documentation using specific technical terms, concepts, and code patterns. Returns relevant documentation sections with context.',
							inputSchema: {
								type: 'object',
								properties: {
									query: {
										type: 'string',
										description:
											'Search keywords or natural language query',
									},
									doc_type: {
										type: 'string',
										enum: [
											'api',
											'tutorial',
											'example',
											'error',
											'all',
										],
										default: 'all',
										description: 'Filter by documentation type',
									},
									context: {
										type: 'number',
										minimum: 0,
										maximum: 3,
										default: 1,
										description: 'Number of surrounding paragraphs',
									},
									include_hierarchy: {
										type: 'boolean',
										default: true,
										description: 'Include section hierarchy',
									},
									package: {
										type: 'string',
										enum: ['svelte', 'kit', 'cli'],
										description: 'Filter by package',
									},
									category: {
										type: 'string',
										enum: [
											'state_management',
											'effects',
											'components',
											'events',
											'routing',
											'security',
											'general',
										],
										description: 'Filter by code category',
									},
									has_runes: {
										type: 'array',
										items: { type: 'string' },
										description:
											'Filter by presence of specific runes',
									},
									has_functions: {
										type: 'array',
										items: { type: 'string' },
										description:
											'Filter by presence of specific functions',
									},
									has_components: {
										type: 'array',
										items: { type: 'string' },
										description:
											'Filter by presence of specific components',
									},
								},
								required: ['query'],
							},
						},
					},
				},
			},
		);

		this.search_engine = new VectorSearchEngine(db);

		this.setup_handlers();

		this.server.onerror = (error) =>
			console.error('[MCP Error]', error);
	}

	private setup_handlers() {
		this.server.setRequestHandler(
			ListToolsRequestSchema,
			async () => ({
				tools: [
					{
						name: 'search_docs',
						description:
							'Search Svelte documentation using specific technical terms and concepts. Returns relevant documentation sections with context.',
						inputSchema: {
							type: 'object',
							properties: {
								query: {
									type: 'string',
									description:
										'Search keywords or natural language query',
								},
								doc_type: {
									type: 'string',
									enum: [
										'api',
										'tutorial',
										'example',
										'error',
										'all',
									],
									default: 'all',
									description: 'Filter by documentation type',
								},
								context: {
									type: 'number',
									minimum: 0,
									maximum: 3,
									default: 1,
									description: 'Number of surrounding paragraphs',
								},
								include_hierarchy: {
									type: 'boolean',
									default: true,
									description: 'Include section hierarchy',
								},
								package: {
									type: 'string',
									enum: ['svelte', 'kit', 'cli'],
									description: 'Filter by package',
								},
							},
							required: ['query'],
						},
					},
				],
			}),
		);

		this.server.setRequestHandler(
			CallToolRequestSchema,
			async (request) => {
				if (request.params.name !== 'search_docs') {
					throw new McpError(
						ErrorCode.MethodNotFound,
						`Unknown tool: ${request.params.name}`,
					);
				}

				const args = request.params.arguments as {
					query: string;
					doc_type?: string;
					context?: number;
					include_hierarchy?: boolean;
					package?: string;
					category?: CodeCategory;
					has_runes?: string[];
					has_functions?: string[];
					has_components?: string[];
				};

				const {
					query,
					doc_type,
					context,
					include_hierarchy,
					package: pkg,
					category,
					has_runes,
					has_functions,
					has_components,
				} = args;

				try {
					const results = await this.search_engine.search(query, {
						limit: 5,
						include_patterns: true,
						filters: {
							...(doc_type && doc_type !== 'all' ? { doc_type } : {}),
							...(pkg ? { concepts: [pkg] } : {}),
							...(category ? { category } : {}),
							...(has_runes?.length ? { has_runes } : {}),
							...(has_functions?.length ? { has_functions } : {}),
							...(has_components?.length ? { has_components } : {}),
						},
					});

					return {
						content: [
							{
								type: 'text',
								text: JSON.stringify(results, null, 2),
							},
						],
					};
				} catch (error) {
					console.error('Search error:', error);
					throw new McpError(
						ErrorCode.InternalError,
						'Failed to perform search',
					);
				}
			},
		);
	}

	async initialize() {
		try {
			// Initialize database
			await init_db();

			// Process markdown files from src/docs
			const docs_path = join(__dirname, '..', 'src', 'docs');
			console.error(`Looking for docs in: ${docs_path}`);
			const docs = await process_markdown_directory(docs_path);

			// Prepare all embeddings first
			const docs_with_embeddings = await Promise.all(
				docs.map(async (doc) => {
					const embedding = await embeddings.generate_embedding(
						doc.content,
					);
					const doc_id = randomUUID();
					return { doc, embedding, doc_id };
				}),
			);

			// Batch insert docs
			const docs_values = docs_with_embeddings.map(
				({ doc, embedding, doc_id }) => [
					doc_id,
					doc.content,
					doc.concept,
					JSON.stringify(doc.related_concepts),
					JSON.stringify(doc.code_examples),
					doc.difficulty,
					JSON.stringify(doc.tags),
					Buffer.from(embeddings.vector_to_blob(embedding)),
				],
			);

			await db.execute({
				sql: `
            INSERT INTO docs (
              id, content, concept, related_concepts, code_examples,
              difficulty, tags, embedding
            ) VALUES ${docs_values
							.map(() => '(?, ?, ?, ?, ?, ?, ?, ?)')
							.join(', ')}
          `,
				args: docs_values.flat(),
			});

			// Prepare code metadata
			const code_metadata = [];
			for (const { doc, doc_id } of docs_with_embeddings) {
				const examples_with_embeddings = await Promise.all(
					doc.code_examples.map(async (example) => {
						const code_embedding =
							await embeddings.generate_embedding(example.code);
						return [
							randomUUID(),
							doc_id,
							example.category,
							JSON.stringify(example.runes),
							JSON.stringify(example.functions),
							JSON.stringify(example.components),
							Buffer.from(embeddings.vector_to_blob(code_embedding)),
						];
					}),
				);
				code_metadata.push(...examples_with_embeddings);
			}

			// Batch insert code metadata
			if (code_metadata.length > 0) {
				await db.execute({
					sql: `
              INSERT INTO code_metadata (
                id, doc_id, category, runes, functions, components, embedding
              ) VALUES ${code_metadata
								.map(() => '(?, ?, ?, ?, ?, ?, ?)')
								.join(', ')}
            `,
					args: code_metadata.flat(),
				});
			}

			// Prepare patterns
			const patterns = [];
			for (const { doc, doc_id } of docs_with_embeddings) {
				const patterns_with_embeddings = await Promise.all(
					doc.common_patterns.map(async (pattern) => {
						const pattern_embedding =
							await embeddings.generate_embedding(pattern.pattern);
						return [
							randomUUID(),
							doc_id,
							pattern.pattern,
							pattern.context || null,
							Buffer.from(
								embeddings.vector_to_blob(pattern_embedding),
							),
						];
					}),
				);
				patterns.push(...patterns_with_embeddings);
			}

			// Batch insert patterns
			if (patterns.length > 0) {
				await db.execute({
					sql: `
              INSERT INTO llm_query_patterns (
                id, doc_id, pattern, context, embedding
              ) VALUES ${patterns
								.map(() => '(?, ?, ?, ?, ?)')
								.join(', ')}
            `,
					args: patterns.flat(),
				});
			}
			await verify_db();
		} catch (error: unknown) {
			console.error('Initialization failed:', error);
			throw error;
		}
	}

	async run(): Promise<void> {
		await this.initialize();
		const transport = new StdioServerTransport();
		await this.server.connect(transport);
		console.error('Svelte docs MCP server running on stdio');
	}
}

const server = new SvelteDocsServer();
server.run().catch((error: unknown) => {
	console.error('Server error:', error);
	process.exit(1);
});
