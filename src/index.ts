#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { readFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import { DatabaseClient, get_database_config } from './database/client.js';
import { DocsService } from './services/docs.js';
import { setup_resource_handlers } from './handlers/resources.js';
import { setup_tool_handlers } from './handlers/tools.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const pkg = JSON.parse(
  readFileSync(join(__dirname, '..', 'package.json'), 'utf8'),
);
const { name, version } = pkg;

async function main() {
  // Initialize server
  const server = new Server(
    { name, version },
    {
      capabilities: {
        resources: {},
        tools: {},
      },
    }
  );

  try {
    // Initialize database
    const db_config = get_database_config();
    const db_client = await DatabaseClient.initialize(
      db_config.url,
      db_config.auth_token
    );

    // Initialize services
    const docs_service = DocsService.get_instance();

    // Setup handlers
    setup_resource_handlers(server, db_client, docs_service);
    setup_tool_handlers(server, db_client, docs_service);

    // Connect transport
    const transport = new StdioServerTransport();
    await server.connect(transport);

    console.error('Svelte Docs MCP server running on stdio');

    // Handle shutdown
    process.on('SIGINT', async () => {
      await db_client.close();
      await server.close();
      process.exit(0);
    });

    process.on('SIGTERM', async () => {
      await db_client.close();
      await server.close();
      process.exit(0);
    });

  } catch (error: unknown) {
    const error_message = error instanceof Error ? error.message : String(error);
    console.error('Failed to start server:', error_message);
    process.exit(1);
  }
}

main().catch(error => {
  console.error('Unhandled error:', error);
  process.exit(1);
});
