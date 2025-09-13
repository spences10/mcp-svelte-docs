#!/usr/bin/env node

import { ValibotJsonSchemaAdapter } from '@tmcp/adapter-valibot';
import { StdioTransport } from '@tmcp/transport-stdio';
import { McpServer } from 'tmcp';

import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { get_config } from './config.js';
import { register_markdown_tools } from './tools/markdown-tools.js';
import { register_definition_tools } from './tools/definition-tools.js';

// Get package info for server metadata
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const pkg = JSON.parse(
	readFileSync(join(__dirname, '..', 'package.json'), 'utf8'),
);
const { name, version } = pkg;

/**
 * Main class for the Svelte Docs MCP server
 */
class SvelteDocsServer {
	private server: McpServer<any>;
	private adapter: ValibotJsonSchemaAdapter;

	constructor() {
		// Initialize the adapter
		this.adapter = new ValibotJsonSchemaAdapter();

		// Initialize the server with metadata
		this.server = new McpServer<any>(
			{
				name,
				version,
				description: 'MCP server for Svelte docs',
			},
			{
				adapter: this.adapter,
				capabilities: {
					tools: { listChanged: true },
				},
			},
		);

		// Handle process termination
		process.on('SIGINT', async () => {
			await this.cleanup();
			process.exit(0);
		});

		process.on('SIGTERM', async () => {
			await this.cleanup();
			process.exit(0);
		});

		process.on('exit', () => {
			this.cleanup();
		});
	}

	/**
	 * Cleanup resources
	 */
	private async cleanup(): Promise<void> {
		try {
			console.error('Svelte Docs MCP server shutdown complete');
		} catch (error) {
			console.error('Error during cleanup:', error);
		}
	}

	/**
	 * Initialize the server
	 */
	private async initialize(): Promise<void> {
		try {
			// Load configuration
			const config = get_config();
			console.error('Svelte Docs MCP server initialized');

			// Register definition tools (new primary interface)
			register_definition_tools(this.server);

			// Register markdown-based tools (legacy/tutorial interface)
			register_markdown_tools(this.server);

			console.error('All tools registered');
		} catch (error) {
			console.error('Failed to initialize server:', error);
			process.exit(1);
		}
	}

	/**
	 * Run the server
	 */
	public async run(): Promise<void> {
		try {
			// Initialize the server
			await this.initialize();

			// Setup transport
			const transport = new StdioTransport(this.server);
			transport.listen();

			console.error('Svelte Docs MCP server running on stdio');
		} catch (error) {
			console.error('Failed to start server:', error);
			process.exit(1);
		}
	}
}

// Create and run the server
const server = new SvelteDocsServer();
server.run().catch((error) => {
	console.error('Unhandled error:', error);
	process.exit(1);
});
