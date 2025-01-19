import {
  ListResourcesRequestSchema,
  ListResourceTemplatesRequestSchema,
  McpError,
  ReadResourceRequestSchema,
  ErrorCode,
} from '@modelcontextprotocol/sdk/types.js';
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { DatabaseClient } from '../database/client.js';
import { DocsService } from '../services/docs.js';
import { store_document, get_document } from '../database/schema.js';

const RESOURCE_PREFIX = 'svelte-docs://';

export function setup_resource_handlers(
  server: Server,
  db_client: DatabaseClient,
  docs_service: DocsService
): void {
  // List available static resources
  server.setRequestHandler(ListResourcesRequestSchema, async () => ({
    resources: [
      {
        uri: `${RESOURCE_PREFIX}llms.txt`,
        name: 'Svelte Documentation Index',
        mimeType: 'text/plain',
        description: 'Index of available Svelte documentation files',
      },
      {
        uri: `${RESOURCE_PREFIX}llms-full.txt`,
        name: 'Complete Svelte Documentation',
        mimeType: 'text/plain',
        description: 'Complete documentation for Svelte, SvelteKit and CLI',
      },
      {
        uri: `${RESOURCE_PREFIX}llms-small.txt`,
        name: 'Compressed Svelte Documentation',
        mimeType: 'text/plain',
        description: 'Compressed documentation for smaller context windows',
      },
    ],
  }));

  // List resource templates for package-level docs
  server.setRequestHandler(ListResourceTemplatesRequestSchema, async () => ({
    resourceTemplates: [
      {
        uriTemplate: `${RESOURCE_PREFIX}docs/{package}/llms.txt`,
        name: 'Package Documentation',
        mimeType: 'text/plain',
        description: 'Documentation for specific Svelte packages (svelte, kit, cli)',
      },
    ],
  }));

  // Handle resource reads
  server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
    const { uri } = request.params;
    if (!uri.startsWith(RESOURCE_PREFIX)) {
      throw new McpError(
        ErrorCode.InvalidRequest,
        `Invalid resource URI prefix: ${uri}`
      );
    }

    const path = uri.slice(RESOURCE_PREFIX.length);
    
    // Validate path
    if (!path.match(/^(llms(-full|-small)?\.txt|docs\/(svelte|kit|cli)\/llms\.txt)$/)) {
      throw new McpError(
        ErrorCode.InvalidRequest,
        `Invalid documentation path: ${path}`
      );
    }

    try {
      // Check database first
      const stored_doc = await get_document(db_client.get_client(), path);
      
      if (stored_doc) {
        return {
          contents: [
            {
              uri,
              mimeType: 'text/plain',
              text: stored_doc.content,
            },
          ],
        };
      }

      // Fetch from Svelte website if not in database
      const content = await docs_service.get_doc(path as any);
      const embedding = docs_service.generate_embedding(content);
      
      // Store in database for future use
      await store_document(
        db_client.get_client(),
        path,
        content,
        embedding
      );

      return {
        contents: [
          {
            uri,
            mimeType: 'text/plain',
            text: content,
          },
        ],
      };
    } catch (error: unknown) {
      const error_message = error instanceof Error ? error.message : String(error);
      throw new McpError(
        ErrorCode.InternalError,
        `Failed to retrieve document: ${error_message}`
      );
    }
  });
}
