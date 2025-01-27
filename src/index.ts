#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
	CallToolRequestSchema,
	ListResourcesRequestSchema,
	ListToolsRequestSchema,
	ReadResourceRequestSchema,
	Tool,
} from '@modelcontextprotocol/sdk/types.js';
import { readFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import { db, init_db, verify_db } from './db/client.js';
import {
	DocVariant,
	fetch_docs,
	get_doc_resources,
	init_docs,
	Package,
	should_update_docs,
} from './docs/fetcher.js';
import { search_docs, SearchOptions } from './search/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const pkg = JSON.parse(
	readFileSync(join(__dirname, '..', 'package.json'), 'utf8'),
);
const { name, version } = pkg;

// Define tools
const get_next_chunk_tool: Tool = {
	name: 'get_next_chunk',
	description: 'Retrieve subsequent chunks of large documents',
	inputSchema: {
		type: 'object',
		required: ['uri', 'chunk_number'],
		properties: {
			uri: {
				type: 'string',
				description: 'Document URI',
			},
			chunk_number: {
				type: 'number',
				description: 'Chunk number to retrieve (1-based)',
				minimum: 1,
			},
		},
	},
};

const search_docs_tool: Tool = {
	name: 'search_docs',
	description:
		'Search Svelte documentation and receive relevant sections with context. Required: query (string). Optional: doc_type (api/tutorial/example/error), context (0-3 paragraphs), include_hierarchy (boolean). Returns JSON with matched sections and their surrounding context. Best for finding specific documentation sections or error solutions.',
	inputSchema: {
		type: 'object',
		required: ['query'],
		properties: {
			query: {
				type: 'string',
				description: 'Search keywords or natural language query',
			},
			doc_type: {
				type: 'string',
				enum: ['api', 'tutorial', 'example', 'error', 'all'],
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
	},
};

// Create MCP server instance
const server = new Server(
	{
		name,
		version,
	},
	{
		capabilities: {
			tools: {
				schema: {
					type: 'object',
					properties: {
						tools: {
							type: 'array',
							items: {
								type: 'object',
								properties: {
									name: { type: 'string' },
									description: { type: 'string' },
									inputSchema: { type: 'object' },
								},
								required: ['name', 'inputSchema'],
							},
						},
					},
					required: ['tools'],
				},
				tools: [search_docs_tool, get_next_chunk_tool],
			},
			resources: {
				schema: {
					type: 'object',
					properties: {
						resources: {
							type: 'array',
							items: {
								type: 'object',
								properties: {
									uri: { type: 'string' },
									metadata: {
										type: 'object',
										properties: {
											contentType: { type: 'string' },
										},
									},
								},
								required: ['uri'],
							},
						},
					},
					required: ['resources'],
				},
				schemes: ['svelte-docs'],
			},
		},
	},
);

// Handle tool listing
server.setRequestHandler(ListToolsRequestSchema, async () => {
	return {
		tools: [search_docs_tool, get_next_chunk_tool],
	};
});

// Handle tool calls
server.setRequestHandler(CallToolRequestSchema, async (request) => {
	const { name: tool_name, arguments: params } = request.params;

	if (tool_name === 'get_next_chunk') {
		try {
			if (
				!params ||
				typeof params.uri !== 'string' ||
				typeof params.chunk_number !== 'number'
			) {
				throw new Error(
					'Invalid parameters: uri and chunk_number are required',
				);
			}

			const { uri, chunk_number } = params;
			if (!uri.startsWith('svelte-docs://docs/')) {
				throw new Error(`Invalid URI: ${uri}`);
			}

			const path = uri.substring('svelte-docs://docs/'.length);
			let package_name: Package | undefined;
			let variant: DocVariant | undefined;

			if (
				path.startsWith('svelte/') ||
				path.startsWith('kit/') ||
				path.startsWith('cli/')
			) {
				const [pkg] = path.split('/') as [Package];
				package_name = pkg;
			} else {
				const variant_map: Record<string, DocVariant> = {
					'llms.txt': 'llms',
					'llms-full.txt': 'llms-full',
					'llms-small.txt': 'llms-small',
				};
				variant = variant_map[path];
				if (!variant) {
					throw new Error(`Invalid doc variant: ${path}`);
				}
			}

			const chunk_size = 50000; // 50KB chunks
			const result = await db.execute({
				sql: `SELECT content FROM docs 
					  WHERE package = ? AND variant = ?
					  ORDER BY id
					  LIMIT 1 OFFSET ?`,
				args: [
					package_name === undefined ? null : package_name,
					variant === undefined ? null : variant,
					chunk_number - 1,
				],
			});

			if (result.rows.length === 0) {
				return {
					content: [
						{
							type: 'text',
							text: 'No more chunks available',
						},
					],
					isError: true,
				};
			}

			return {
				content: [
					{
						type: 'text',
						text: result.rows[0].content,
					},
				],
			};
		} catch (error) {
			return {
				content: [
					{
						type: 'text',
						text: `Error retrieving chunk: ${
							error instanceof Error ? error.message : String(error)
						}`,
					},
				],
				isError: true,
			};
		}
	} else if (tool_name === 'search_docs') {
		try {
			if (!params || typeof params.query !== 'string') {
				throw new Error(
					'Invalid search parameters: query is required',
				);
			}

			const search_params: SearchOptions = {
				query: params.query,
				doc_type: params.doc_type as SearchOptions['doc_type'],
				context: params.context as number,
				include_hierarchy: params.include_hierarchy as boolean,
				package: params.package as SearchOptions['package'],
			};

			const results = await search_docs(search_params);
			return {
				content: [
					{
						type: 'text',
						text: JSON.stringify(results, null, 2),
					},
				],
			};
		} catch (error) {
			return {
				content: [
					{
						type: 'text',
						text: `Error searching docs: ${
							error instanceof Error ? error.message : String(error)
						}`,
					},
				],
				isError: true,
			};
		}
	}

	throw new Error(`Unknown tool: ${tool_name}`);
});

// Handle resource requests
server.setRequestHandler(
	ReadResourceRequestSchema,
	async (request) => {
		const { uri } = request.params;

		if (!uri.startsWith('svelte-docs://docs/')) {
			throw new Error(`Invalid URI: ${uri}`);
		}

		const path = uri.substring('svelte-docs://docs/'.length);

		// Parse the path to determine what docs to fetch
		let package_name: Package | undefined;
		let variant: DocVariant | undefined;

		if (
			path.startsWith('svelte/') ||
			path.startsWith('kit/') ||
			path.startsWith('cli/')
		) {
			// Package-specific docs
			const [pkg] = path.split('/') as [Package];
			package_name = pkg;
		} else {
			// Root level docs
			const variant_map: Record<string, DocVariant> = {
				'llms.txt': 'llms',
				'llms-full.txt': 'llms-full',
				'llms-small.txt': 'llms-small',
			};
			variant = variant_map[path];

			if (!variant) {
				throw new Error(`Invalid doc variant: ${path}`);
			}
		}

		try {
			// Check if docs need updating
			if (await should_update_docs(package_name, variant)) {
				await fetch_docs(package_name, variant);
			}

			// Return appropriate doc variant
			const result = await db.execute({
				sql: `SELECT content FROM docs WHERE package = ? AND variant = ?`,
				args: [package_name || null, variant || null],
			});

			if (result.rows.length === 0) {
				throw new Error('Documentation not found');
			}

			return {
				content: [
					{
						type: 'text',
						text: result.rows[0].content,
					},
				],
				metadata: {
					contentType: 'text/plain',
				},
			};
		} catch (error) {
			return {
				content: [
					{
						type: 'text',
						text: `Error fetching docs: ${
							error instanceof Error ? error.message : String(error)
						}`,
					},
				],
				isError: true,
			};
		}
	},
);

// Add resource listing handler
server.setRequestHandler(ListResourcesRequestSchema, async () => {
	return await get_doc_resources();
});

// Run server
async function run_server() {
	try {
		await init_db();
		console.error('Initialized database schema');

		await init_docs();
		await verify_db();
		console.error('Verified database population');

		const transport = new StdioServerTransport();
		await server.connect(transport);
		console.error('Svelte Docs MCP Server running on stdio');
	} catch (error) {
		console.error('Fatal error during server initialization:', error);
		process.exit(1);
	}
}

run_server().catch((error) => {
	console.error('Fatal error running server:', error);
	process.exit(1);
});
