#!/usr/bin/env node

import { createClient } from '@libsql/client';
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
	CallToolRequestSchema,
	ErrorCode,
	ListResourcesRequestSchema,
	ListResourceTemplatesRequestSchema,
	ListToolsRequestSchema,
	McpError,
	ReadResourceRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { readFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const pkg = JSON.parse(
	readFileSync(join(__dirname, '..', 'package.json'), 'utf8'),
);
const { name, version } = pkg;

// Database client
const db = createClient({
	url: process.env.LIBSQL_URL || 'file:../svelte-docs.db',
	authToken: process.env.LIBSQL_AUTH_TOKEN,
});

// Initialize database schema
async function init_db() {
	await db.execute(`
    CREATE TABLE IF NOT EXISTS docs (
      path TEXT PRIMARY KEY,
      content TEXT NOT NULL,
      last_modified TEXT NOT NULL,
      last_checked TEXT NOT NULL,
      etag TEXT
    );
  `);
}

// Types
interface DocRecord {
	path: string;
	content: string;
	last_modified: string;
	last_checked: string;
	etag: string | null;
}

// Cache manager functions
async function get_cached_doc(
	path: string,
): Promise<DocRecord | undefined> {
	const result = await db.execute({
		sql: 'SELECT * FROM docs WHERE path = ?',
		args: [path],
	});
	const row = result.rows[0];
	if (!row) return undefined;

	return {
		path: row.path as string,
		content: row.content as string,
		last_modified: row.last_modified as string,
		last_checked: row.last_checked as string,
		etag: row.etag as string | null,
	};
}

async function cache_doc(
	path: string,
	content: string,
	last_modified: string,
	etag: string | null = null,
) {
	await db.execute({
		sql: `
      INSERT INTO docs (path, content, last_modified, last_checked, etag)
      VALUES (?, ?, ?, datetime('now'), ?)
      ON CONFLICT(path) DO UPDATE SET
        content = excluded.content,
        last_modified = excluded.last_modified,
        last_checked = excluded.last_checked,
        etag = excluded.etag
    `,
		args: [path, content, last_modified, etag],
	});
}

// Freshness checker
async function check_freshness(path: string, base_url: string) {
	const cached = await get_cached_doc(path);
	if (!cached) return false;

	try {
		const response = await fetch(base_url + path, { method: 'HEAD' });
		const server_modified = response.headers.get('last-modified');
		const server_etag = response.headers.get('etag');

		if (!server_modified && !server_etag) return true;
		if (server_etag && server_etag === cached.etag) return true;
		if (server_modified && server_modified === cached.last_modified)
			return true;

		return false;
	} catch (error) {
		console.error('Error checking freshness:', error);
		return true; // Use cache on error
	}
}

// Resource paths
const SVELTE_BASE_URL = 'https://svelte.dev';
const DOC_PATHS = {
	index: '/llms.txt',
	full: '/llms-full.txt',
	small: '/llms-small.txt',
	svelte: '/docs/svelte/llms.txt',
	kit: '/docs/kit/llms.txt',
	cli: '/docs/cli/llms.txt',
};

// Fetch and cache document
async function fetch_doc(path: string): Promise<string> {
	const is_fresh = await check_freshness(path, SVELTE_BASE_URL);
	if (is_fresh) {
		const cached = await get_cached_doc(path);
		if (!cached) throw new Error('Cache inconsistency detected');
		return cached.content;
	}

	try {
		const response = await fetch(SVELTE_BASE_URL + path);
		if (!response.ok)
			throw new Error(`HTTP error! status: ${response.status}`);

		const content = await response.text();
		const last_modified =
			response.headers.get('last-modified') ||
			new Date().toUTCString();
		const etag = response.headers.get('etag');

		await cache_doc(path, content, last_modified, etag);
		return content;
	} catch (error) {
		console.error('Error fetching document:', error);
		const cached = await get_cached_doc(path);
		if (cached) return cached.content;
		throw error;
	}
}

// Search functionality
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

async function search_docs(
	query: string,
): Promise<Array<{ path: string; excerpt: string; metadata: any }>> {
	const result = await db.execute({
		sql: `
      SELECT path, content
      FROM docs 
      WHERE content LIKE ?
    `,
		args: [`%${query}%`],
	});

	const results = result.rows.map((row) => {
		const content = row.content as string;
		const excerpt = extract_excerpt(content, query);

		// Calculate relevance score based on multiple factors
		const occurrences = (
			content
				.toLowerCase()
				.match(new RegExp(query.toLowerCase(), 'g')) || []
		).length;
		const first_position = content
			.toLowerCase()
			.indexOf(query.toLowerCase());
		const is_api_section = content
			.toLowerCase()
			.includes('api reference')
			? 1.5
			: 1;
		const section_weight = content.toLowerCase().includes('example')
			? 0.8
			: 1;

		// Estimate token count for excerpt
		const excerpt_token_estimate = excerpt.length / 4;

		return {
			path: row.path as string,
			excerpt,
			metadata: {
				relevance_score: (
					occurrences * 0.4 +
					(1 / (first_position + 1)) * 0.3 +
					is_api_section * section_weight * 0.3
				).toFixed(2),
				occurrences,
				excerpt_token_estimate: Math.round(excerpt_token_estimate),
				section_type:
					is_api_section > 1
						? 'api'
						: section_weight < 1
						? 'example'
						: 'general',
			},
		};
	});

	// Sort by relevance score
	return results.sort(
		(a, b) =>
			parseFloat(b.metadata.relevance_score) -
			parseFloat(a.metadata.relevance_score),
	);
}

class SvelteDocsServer {
	private server: Server;

	constructor() {
		this.server = new Server(
			{
				name,
				version,
			},
			{
				capabilities: {
					resources: {},
					tools: {},
				},
			},
		);

		this.setup_resource_handlers();
		this.setup_tool_handlers();

		this.server.onerror = (error) =>
			console.error('[MCP Error]', error);
	}

	private setup_resource_handlers() {
		// List available resources
		this.server.setRequestHandler(
			ListResourcesRequestSchema,
			async () => ({
				resources: [
					{
						uri: 'svelte-docs://docs/llms.txt',
						name: 'Svelte Documentation Index',
						description:
							'Index of available Svelte documentation files',
						mimeType: 'text/markdown',
					},
					{
						uri: 'svelte-docs://docs/llms-full.txt',
						name: 'Complete Svelte Documentation',
						description:
							'Complete documentation for Svelte, SvelteKit and CLI',
						mimeType: 'text/markdown',
					},
					{
						uri: 'svelte-docs://docs/llms-small.txt',
						name: 'Compressed Svelte Documentation',
						description:
							'Compressed documentation for smaller context windows',
						mimeType: 'text/markdown',
					},
				],
			}),
		);

		// Resource templates for package docs
		this.server.setRequestHandler(
			ListResourceTemplatesRequestSchema,
			async () => ({
				resourceTemplates: [
					{
						uriTemplate: 'svelte-docs://docs/{package}/llms.txt',
						name: 'Package Documentation',
						description:
							'Documentation for specific Svelte packages (svelte, kit, cli)',
						mimeType: 'text/markdown',
					},
				],
			}),
		);

		// Read resources
		this.server.setRequestHandler(
			ReadResourceRequestSchema,
			async (request) => {
				const uri = request.params.uri;
				let path: string;

				// Handle package-specific docs
				const package_match = uri.match(
					/^svelte-docs:\/\/docs\/(.+)\/llms\.txt$/,
				);
				if (package_match) {
					const pkg = package_match[1] as keyof typeof DOC_PATHS;
					if (!['svelte', 'kit', 'cli'].includes(pkg)) {
						throw new McpError(
							ErrorCode.InvalidRequest,
							`Invalid package: ${pkg}`,
						);
					}
					path = DOC_PATHS[pkg];
				} else {
					// Handle root docs
					const root_match = uri.match(
						/^svelte-docs:\/\/docs\/(llms(?:-(?:full|small))?\.txt)$/,
					);
					if (!root_match) {
						throw new McpError(
							ErrorCode.InvalidRequest,
							`Invalid URI format: ${uri}`,
						);
					}
					const file = root_match[1];
					path = `/${file}`;
				}

				try {
					const content = await fetch_doc(path);

					// For small variant, return highly compressed version
					if (path === DOC_PATHS.small) {
						// Enhanced compression for small variant
						const compressed = content
							.replace(/\n\s*\n/g, '\n') // Remove empty lines
							.replace(/\s+/g, ' ') // Collapse whitespace
							.replace(/<!--[\s\S]*?-->/g, '') // Remove HTML comments
							.replace(/```[\s\S]*?```/g, '') // Remove code blocks
							.replace(/\[([^\]]+)\]\([^\)]+\)/g, '$1') // Remove markdown links but keep text
							.replace(/#{1,6}\s/g, '') // Remove heading markers
							.replace(/(\*\*|__)(.*?)\1/g, '$2') // Remove bold markers
							.replace(/(\*|_)(.*?)\1/g, '$2') // Remove italic markers
							.trim();

						// Check compressed size
						const token_estimate = compressed.length / 4; // Rough estimate of tokens
						if (token_estimate > 150000) {
							// Leave buffer for model
							console.error(
								`Warning: Compressed content still large: ~${token_estimate} tokens`,
							);
						}

						return {
							contents: [
								{
									uri: request.params.uri,
									mimeType: 'text/markdown',
									text: compressed,
									metadata: {
										original_size: content.length,
										compressed_size: compressed.length,
										compression_ratio:
											(
												(1 - compressed.length / content.length) *
												100
											).toFixed(1) + '%',
										estimated_tokens: Math.round(token_estimate),
									},
								},
							],
						};
					}

					// Stream content in chunks if it's large
					const chunk_size = 40000; // ~40k characters per chunk for better token management
					if (content.length > chunk_size) {
						const chunks = [];
						for (let i = 0; i < content.length; i += chunk_size) {
							chunks.push(content.slice(i, i + chunk_size));
						}

						// Return first chunk with metadata
						return {
							contents: [
								{
									uri: request.params.uri,
									mimeType: 'text/markdown',
									text: chunks[0],
									metadata: {
										total_chunks: chunks.length,
										current_chunk: 1,
										total_size: content.length,
										next_chunk_available: chunks.length > 1,
									},
								},
							],
						};
					}

					// For smaller content, return as-is
					return {
						contents: [
							{
								uri: request.params.uri,
								mimeType: 'text/markdown',
								text: content,
								metadata: {
									total_chunks: 1,
									current_chunk: 1,
									total_size: content.length,
									next_chunk_available: false,
								},
							},
						],
					};
				} catch (error) {
					const message =
						error instanceof Error ? error.message : 'Unknown error';
					throw new McpError(
						ErrorCode.InternalError,
						`Failed to fetch document: ${message}`,
					);
				}
			},
		);
	}

	private setup_tool_handlers() {
		this.server.setRequestHandler(
			ListToolsRequestSchema,
			async () => ({
				tools: [
					{
						name: 'search_docs',
						description:
							'Search Svelte documentation using semantic similarity',
						inputSchema: {
							type: 'object',
							properties: {
								query: {
									type: 'string',
									description: 'Search query text',
								},
								limit: {
									type: 'number',
									description:
										'Maximum number of results to return (default: 5)',
									minimum: 1,
									maximum: 20,
								},
							},
							required: ['query'],
						},
					},
					{
						name: 'get_next_chunk',
						description: 'Get the next chunk of a large document',
						inputSchema: {
							type: 'object',
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
							required: ['uri', 'chunk_number'],
						},
					},
				],
			}),
		);

		this.server.setRequestHandler(
			CallToolRequestSchema,
			async (request) => {
				if (request.params.name === 'search_docs') {
					const { query, limit = 5 } = request.params.arguments as {
						query: string;
						limit?: number;
					};

					try {
						const results = await search_docs(query);
						const limited_results = results.slice(0, limit);

						return {
							content: [
								{
									type: 'text',
									text: JSON.stringify(limited_results, null, 2),
								},
							],
						};
					} catch (error) {
						const message =
							error instanceof Error
								? error.message
								: 'Unknown error';
						return {
							content: [
								{
									type: 'text',
									text: `Search error: ${message}`,
								},
							],
							isError: true,
						};
					}
				} else if (request.params.name === 'get_next_chunk') {
					const { uri, chunk_number } = request.params.arguments as {
						uri: string;
						chunk_number: number;
					};

					try {
						// Extract path from URI using existing logic
						let path: string;
						const package_match = uri.match(
							/^svelte-docs:\/\/docs\/(.+)\/llms\.txt$/,
						);
						if (package_match) {
							const pkg = package_match[1] as keyof typeof DOC_PATHS;
							if (!['svelte', 'kit', 'cli'].includes(pkg)) {
								throw new McpError(
									ErrorCode.InvalidRequest,
									`Invalid package: ${pkg}`,
								);
							}
							path = DOC_PATHS[pkg];
						} else {
							const root_match = uri.match(
								/^svelte-docs:\/\/docs\/(llms(?:-(?:full|small))?\.txt)$/,
							);
							if (!root_match) {
								throw new McpError(
									ErrorCode.InvalidRequest,
									`Invalid URI format: ${uri}`,
								);
							}
							path = `/${root_match[1]}`;
						}

						const content = await fetch_doc(path);
						const chunk_size = 40000; // Reduced chunk size for better token management
						const total_chunks = Math.ceil(
							content.length / chunk_size,
						);

						if (chunk_number < 1 || chunk_number > total_chunks) {
							throw new McpError(
								ErrorCode.InvalidRequest,
								`Invalid chunk number: ${chunk_number}`,
							);
						}

						const start = (chunk_number - 1) * chunk_size;
						const end = Math.min(start + chunk_size, content.length);
						const chunk = content.slice(start, end);

						return {
							content: [
								{
									type: 'text',
									text: chunk,
									metadata: {
										total_chunks,
										current_chunk: chunk_number,
										total_size: content.length,
										next_chunk_available: chunk_number < total_chunks,
									},
								},
							],
						};
					} catch (error) {
						const message =
							error instanceof Error
								? error.message
								: 'Unknown error';
						return {
							content: [
								{
									type: 'text',
									text: `Error getting chunk: ${message}`,
								},
							],
							isError: true,
						};
					}
				} else {
					throw new McpError(
						ErrorCode.MethodNotFound,
						`Unknown tool: ${request.params.name}`,
					);
				}
			},
		);
	}

	private async init_cache() {
		// Pre-fetch all documentation
		for (const path of Object.values(DOC_PATHS)) {
			try {
				await fetch_doc(path);
			} catch (error) {
				console.error(`Failed to pre-fetch ${path}:`, error);
			}
		}
	}

	async run() {
		await init_db();
		await this.init_cache();
		const transport = new StdioServerTransport();
		await this.server.connect(transport);
		console.error('Svelte Docs MCP server running on stdio');
	}
}

const server = new SvelteDocsServer();
server.run().catch(console.error);
