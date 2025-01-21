#!/usr/bin/env node

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
import { init_db } from './lib/database.js';
import {
	DOC_PATHS,
	chunk_document,
	fetch_doc,
	init_cache,
	process_small_doc,
} from './lib/document-fetcher.js';
import { search_docs } from './lib/search.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const pkg = JSON.parse(
	readFileSync(join(__dirname, '..', 'package.json'), 'utf8'),
);
const { name, version } = pkg;

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
						const processed = process_small_doc(content);
						return {
							contents: [
								{
									uri: request.params.uri,
									mimeType: 'text/markdown',
									text: processed.text,
									metadata: processed.metadata,
								},
							],
						};
					}

					// Stream content in chunks if it's large
					const chunk_size = 40000;
					if (content.length > chunk_size) {
						const { chunks, metadata } = chunk_document(
							content,
							chunk_size,
						);

						// Return first chunk with metadata
						return {
							contents: [
								{
									uri: request.params.uri,
									mimeType: 'text/markdown',
									text: chunks[0],
									metadata: {
										...metadata,
										current_chunk: 1,
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
						const { chunks, metadata } = chunk_document(content);

						if (chunk_number < 1 || chunk_number > metadata.total_chunks) {
							throw new McpError(
								ErrorCode.InvalidRequest,
								`Invalid chunk number: ${chunk_number}`,
							);
						}

						return {
							content: [
								{
									type: 'text',
									text: chunks[chunk_number - 1],
									metadata: {
										...metadata,
										current_chunk: chunk_number,
										next_chunk_available:
											chunk_number < metadata.total_chunks,
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

	async run() {
		await init_db();
		await init_cache();
		const transport = new StdioServerTransport();
		await this.server.connect(transport);
		console.error('Svelte Docs MCP server running on stdio');
	}
}

const server = new SvelteDocsServer();
server.run().catch(console.error);
