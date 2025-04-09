#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { get_config } from './config.js';
import { register_resources } from './resources/index.js';
import { register_tools } from './tools/handler.js';

// Get package info for server metadata
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const pkg = JSON.parse(
	readFileSync(join(__dirname, '..', 'package.json'), 'utf8'),
);
const { name, version } = pkg;

/**
 * Main function to start the MCP server
 */
async function main() {
	// Create server instance with metadata
	const server = new Server(
		{
			name,
			version,
		},
		{
			capabilities: {
				tools: {},
				resources: {},
			},
		},
	);

	// Get configuration
	const config = get_config();

	// Register tools and resources
	register_tools(server);
	register_resources(server);

	// Set up error handling
	server.onerror = (error) => {
		console.error('[MCP Error]', error);
	};

	// Handle process termination
	process.on('SIGINT', async () => {
		await server.close();
		process.exit(0);
	});

	// Connect to transport
	const transport = new StdioServerTransport();
	await server.connect(transport);

	console.error('MCP Svelte Docs server running on stdio');
}

// Run the server
main().catch((error) => {
	console.error('Failed to start MCP server:', error);
	process.exit(1);
});
