#!/usr/bin/env node
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
	CallToolRequestSchema,
	ErrorCode,
	ListToolsRequestSchema,
	McpError,
} from '@modelcontextprotocol/sdk/types.js';
import { init_db } from './lib/database.js';
import { init_cache } from './lib/document-fetcher.js';
import {
	execute_search,
	format_results,
	get_search_suggestions,
	tool,
} from './lib/search.js';

class SvelteDocsServer {
	private server: Server;

	constructor() {
		this.server = new Server(
			{
				name: 'svelte-docs',
				version: '0.2.0',
			},
			{
				capabilities: {
					tools: {},
				},
			},
		);

		this.setupToolHandlers();

		// Error handling
		this.server.onerror = (error) =>
			console.error('[MCP Error]', error);
		process.on('SIGINT', async () => {
			await this.server.close();
			process.exit(0);
		});
	}

	private setupToolHandlers() {
		this.server.setRequestHandler(
			ListToolsRequestSchema,
			async () => ({
				tools: [tool],
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

				try {
					const args = request.params.arguments as {
						query: string;
						doc_type?:
							| 'api'
							| 'tutorial'
							| 'example'
							| 'error'
							| 'all';
						context?: number;
						include_hierarchy?: boolean;
					};

					const { query, doc_type, context, include_hierarchy } =
						args;
					const results = await execute_search(query, {
						doc_type,
						context,
						include_hierarchy,
					});

					const formatted_results = format_results(results);
					const suggestions = get_search_suggestions(query);

					return {
						content: [
							{
								type: 'text',
								text: formatted_results,
							},
							{
								type: 'text',
								text:
									suggestions.length > 0
										? `\nRelated searches: ${suggestions.join(', ')}`
										: '',
							},
						],
					};
				} catch (error) {
					if (error instanceof Error) {
						return {
							content: [
								{
									type: 'text',
									text: `Search error: ${error.message}`,
								},
							],
							isError: true,
						};
					}
					throw error;
				}
			},
		);
	}

	async run() {
		// Initialize database and cache
		await init_db();
		await init_cache();

		// Start server
		const transport = new StdioServerTransport();
		await this.server.connect(transport);
		console.error('Svelte docs MCP server running on stdio');
	}
}

const server = new SvelteDocsServer();
server.run().catch(console.error);
