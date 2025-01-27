import { Tool } from '@modelcontextprotocol/sdk/types.js';

const TOOL_DESCRIPTION = `Search Svelte documentation using specific technical terms and concepts. Returns relevant documentation sections with context.

Query Guidelines:
- Use technical terms found in documentation (e.g., "route parameters", "state management", "lifecycle hooks")
- Search for specific features or concepts rather than asking questions
- Include relevant package names for targeted results (e.g., "sveltekit", "stores")

Example Queries by Category:

1. Svelte 5 Runes:
- "state management runes"          (finds $state and state management docs)
- "derived state calculation"       (locates $derived documentation)
- "effect lifecycle runes"          (finds $effect usage patterns)
- "bindable props svelte"          (shows $bindable property usage)

2. Component Patterns:
- "component lifecycle"             (finds lifecycle documentation)
- "event handling svelte5"          (shows new event handling patterns)
- "component state management"      (locates state management docs)
- "props typescript definition"     (finds prop typing information)

3. SvelteKit Features:
- "route parameters sveltekit"      (finds routing documentation)
- "server routes api"               (locates API route docs)
- "page data loading"              (shows data loading patterns)
- "form actions sveltekit"         (finds form handling docs)

4. Error Documentation:
- "missing export error"           (finds specific error docs)
- "binding validation errors"      (locates validation error info)
- "lifecycle hook errors"          (shows lifecycle-related errors)
- "typescript prop errors"         (finds prop typing errors)

Query Pattern Examples:
❌ "How do I manage state?" → ✅ "state management runes"
❌ "What are lifecycle hooks?" → ✅ "component lifecycle"
❌ "How do I handle events?" → ✅ "event handling svelte5"
❌ "How do I create dynamic routes?" → ✅ "route parameters sveltekit"`;

export const SEARCH_DOCS_TOOL: Tool = {
	name: 'search_docs',
	description: TOOL_DESCRIPTION,
	inputSchema: {
		type: 'object',
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
		required: ['query'],
	},
};

export const GET_NEXT_CHUNK_TOOL: Tool = {
	name: 'get_next_chunk',
	description: 'Retrieve subsequent chunks of large documents',
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
};
