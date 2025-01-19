import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  McpError,
  ErrorCode,
} from '@modelcontextprotocol/sdk/types.js';
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { DatabaseClient } from '../database/client.js';
import { DocsService } from '../services/docs.js';
import { search_similar_documents, store_document } from '../database/schema.js';

export function setup_tool_handlers(
  server: Server,
  db_client: DatabaseClient,
  docs_service: DocsService
): void {
  server.setRequestHandler(ListToolsRequestSchema, async () => ({
    tools: [
      {
        name: 'search_docs',
        description: 'Search Svelte documentation using semantic similarity',
        inputSchema: {
          type: 'object',
          properties: {
            query: {
              type: 'string',
              description: 'Search query text',
            },
            limit: {
              type: 'number',
              description: 'Maximum number of results to return (default: 5)',
              minimum: 1,
              maximum: 20,
            },
          },
          required: ['query'],
        },
      },
      {
        name: 'refresh_docs',
        description: 'Refresh documentation cache and update database',
        inputSchema: {
          type: 'object',
          properties: {},
          required: [],
        },
      },
    ],
  }));

  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    switch (request.params.name) {
      case 'search_docs': {
        if (
          typeof request.params.arguments !== 'object' ||
          !request.params.arguments ||
          typeof request.params.arguments.query !== 'string'
        ) {
          throw new McpError(
            ErrorCode.InvalidParams,
            'Invalid search parameters'
          );
        }

        const { query, limit: raw_limit = 5 } = request.params.arguments;
        const limit = typeof raw_limit === 'number' ? raw_limit : 5;
        const query_embedding = docs_service.generate_embedding(query);

        try {
          const results = await search_similar_documents(
            db_client.get_client(),
            query_embedding,
            Math.min(20, Math.max(1, limit))
          );

          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify(
                  results.map(result => ({
                    path: result.path,
                    similarity: result.similarity,
                    content: result.content,
                  })),
                  null,
                  2
                ),
              },
            ],
          };
        } catch (error: unknown) {
          const error_message = error instanceof Error ? error.message : String(error);
          throw new McpError(
            ErrorCode.InternalError,
            `Search failed: ${error_message}`
          );
        }
      }

      case 'refresh_docs': {
        try {
          // Clear the cache
          docs_service.clear_cache();

          // Fetch and store all docs
          const docs = await docs_service.get_all_docs();
          
          for (const doc of docs) {
            const embedding = docs_service.generate_embedding(doc.content);
            await store_document(
              db_client.get_client(),
              doc.path,
              doc.content,
              embedding
            );
          }

          return {
            content: [
              {
                type: 'text',
                text: `Successfully refreshed ${docs.length} documentation files`,
              },
            ],
          };
        } catch (error: unknown) {
          const error_message = error instanceof Error ? error.message : String(error);
          throw new McpError(
            ErrorCode.InternalError,
            `Refresh failed: ${error_message}`
          );
        }
      }

      default:
        throw new McpError(
          ErrorCode.MethodNotFound,
          `Unknown tool: ${request.params.name}`
        );
    }
  });
}
