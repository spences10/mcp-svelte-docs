#!/usr/bin/env node

import { ValibotJsonSchemaAdapter } from '@tmcp/adapter-valibot';
import { StdioTransport } from '@tmcp/transport-stdio';
import { McpServer } from 'tmcp';

import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

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
 * Pure definition-first architecture using SQLite database
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
				description:
					'MCP server for Svelte docs - Definition-first architecture',
			},
			{
				adapter: this.adapter,
				capabilities: {
					tools: { listChanged: true },
				},
			},
		);

		// Handle process termination
		process.on('SIGINT', () => {
			process.exit(0);
		});

		process.on('SIGTERM', () => {
			process.exit(0);
		});
	}

	/**
	 * Initialize the server with definition tools only
	 */
	private async initialize(): Promise<void> {
		try {
			// Register definition tools (single svelte_definition tool)
			register_definition_tools(this.server);
		} catch (error) {
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
		} catch (error) {
			process.exit(1);
		}
	}
}

// Create and run the server
const server = new SvelteDocsServer();
server.run().catch((error) => {
	process.exit(1);
});
