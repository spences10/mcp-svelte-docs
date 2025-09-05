import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import {
	CallToolRequestSchema,
	ErrorCode,
	ListToolsRequestSchema,
	McpError,
} from '@modelcontextprotocol/sdk/types.js';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import {
	DocItem,
	getDocByCategoryAndId,
	getDocById,
	getDocsByCategory,
	loadMarkdownDocs,
} from '../markdown-loader.js';

// Get the docs directory path
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const docsDir = join(__dirname, '../../docs');

// Load all markdown docs
let docs: DocItem[] = [];

/**
 * Registers the Svelte5 documentation tools with the MCP server
 */
export function register_markdown_tools(server: Server): void {
	// Load all markdown docs
	docs = loadMarkdownDocs(docsDir);

	// Register the tools
	server.setRequestHandler(ListToolsRequestSchema, async () => {
		return {
			tools: [
				// Core Svelte 5 Runes
				{
					name: 'svelte5_state',
					description:
						'Get documentation about $state rune in Svelte 5',
					inputSchema: {
						type: 'object',
						properties: {
							includeExamples: {
								type: 'boolean',
								description:
									'Whether to include code examples (default: true)',
							},
						},
					},
				},
				{
					name: 'svelte5_derived',
					description:
						'Get documentation about $derived rune in Svelte 5',
					inputSchema: {
						type: 'object',
						properties: {
							includeExamples: {
								type: 'boolean',
								description:
									'Whether to include code examples (default: true)',
							},
						},
					},
				},
				{
					name: 'svelte5_props',
					description:
						'Get documentation about $props rune in Svelte 5',
					inputSchema: {
						type: 'object',
						properties: {
							includeExamples: {
								type: 'boolean',
								description:
									'Whether to include code examples (default: true)',
							},
						},
					},
				},
				{
					name: 'svelte5_effect',
					description:
						'Get documentation about $effect rune in Svelte 5',
					inputSchema: {
						type: 'object',
						properties: {
							includeExamples: {
								type: 'boolean',
								description:
									'Whether to include code examples (default: true)',
							},
						},
					},
				},

				// Svelte 5 Features
				{
					name: 'svelte5_snippets',
					description:
						'Get documentation about snippets in Svelte 5 (replacement for slots)',
					inputSchema: {
						type: 'object',
						properties: {
							includeExamples: {
								type: 'boolean',
								description:
									'Whether to include code examples (default: true)',
							},
						},
					},
				},
				{
					name: 'svelte5_events',
					description:
						'Get documentation about event handling in Svelte 5',
					inputSchema: {
						type: 'object',
						properties: {
							includeExamples: {
								type: 'boolean',
								description:
									'Whether to include code examples (default: true)',
							},
						},
					},
				},
				{
					name: 'svelte5_component_events',
					description:
						'Get documentation about component events in Svelte 5',
					inputSchema: {
						type: 'object',
						properties: {
							includeExamples: {
								type: 'boolean',
								description:
									'Whether to include code examples (default: true)',
							},
						},
					},
				},
				{
					name: 'svelte5_global_state',
					description:
						'Get documentation about global state patterns in Svelte 5',
					inputSchema: {
						type: 'object',
						properties: {
							includeExamples: {
								type: 'boolean',
								description:
									'Whether to include code examples (default: true)',
							},
						},
					},
				},

				// Migration and Common Mistakes
				{
					name: 'svelte5_migration',
					description: 'Get Svelte 4 to Svelte 5 migration patterns',
					inputSchema: {
						type: 'object',
						properties: {
							pattern: {
								type: 'string',
								description:
									'Specific pattern to look for (e.g., "reactive", "props", "events")',
							},
						},
					},
				},
				{
					name: 'svelte5_mistakes',
					description: 'Get common mistakes when using Svelte 5',
					inputSchema: {
						type: 'object',
						properties: {
							category: {
								type: 'string',
								description:
									'Category of mistakes (e.g., "state", "props", "events")',
							},
						},
					},
				},

				// Overview Tools
				{
					name: 'svelte5_overview',
					description:
						'Get a general overview of Svelte 5 features and changes',
					inputSchema: {
						type: 'object',
						properties: {},
					},
				},
				{
					name: 'svelte5_runes_overview',
					description: 'Get an overview of all runes in Svelte 5',
					inputSchema: {
						type: 'object',
						properties: {},
					},
				},

				// New Async and Remote Functions Features
				{
					name: 'svelte5_await_expressions',
					description:
						'Get documentation about await expressions in Svelte 5 (experimental feature)',
					inputSchema: {
						type: 'object',
						properties: {
							includeExamples: {
								type: 'boolean',
								description:
									'Whether to include code examples (default: true)',
							},
						},
					},
				},
				{
					name: 'sveltekit_remote_functions',
					description:
						'Get documentation about remote functions in SvelteKit (experimental feature)',
					inputSchema: {
						type: 'object',
						properties: {
							includeExamples: {
								type: 'boolean',
								description:
									'Whether to include code examples (default: true)',
							},
						},
					},
				},
			],
		};
	});

	// Handle the tool calls
	server.setRequestHandler(CallToolRequestSchema, async (request) => {
		const toolName = request.params.name;

		// Handle each specific tool
		switch (toolName) {
			case 'svelte5_state':
				return handleStateRune(request.params.arguments);

			case 'svelte5_derived':
				return handleDerivedRune(request.params.arguments);

			case 'svelte5_props':
				return handlePropsRune(request.params.arguments);

			case 'svelte5_effect':
				return handleEffectRune(request.params.arguments);

			case 'svelte5_snippets':
				return handleSnippets(request.params.arguments);

			case 'svelte5_events':
				return handleEvents(request.params.arguments);

			case 'svelte5_component_events':
				return handleComponentEvents(request.params.arguments);

			case 'svelte5_global_state':
				return handleGlobalState(request.params.arguments);

			case 'svelte5_migration':
				return handleMigration(request.params.arguments);

			case 'svelte5_mistakes':
				return handleMistakes(request.params.arguments);

			case 'svelte5_overview':
				return handleOverview();

			case 'svelte5_runes_overview':
				return handleRunesOverview();

			case 'svelte5_await_expressions':
				return handleAwaitExpressions(request.params.arguments);

			case 'sveltekit_remote_functions':
				return handleRemoteFunctions(request.params.arguments);

			default:
				throw new McpError(
					ErrorCode.MethodNotFound,
					`Unknown tool: ${toolName}`,
				);
		}
	});
}

// Handler functions for each tool

async function handleStateRune(args: any = {}) {
	const doc = getDocByCategoryAndId(docs, 'runes', 'state');

	if (!doc) {
		throw new McpError(
			ErrorCode.InvalidRequest,
			'State rune documentation not found',
		);
	}

	// If includeExamples is false, remove code blocks
	let content = doc.content;
	if (args?.includeExamples === false) {
		content = removeCodeExamples(content);
	}

	return {
		content: [
			{
				type: 'text',
				text: content,
			},
		],
	};
}

async function handleDerivedRune(args: any = {}) {
	const doc = getDocByCategoryAndId(docs, 'runes', 'derived');

	if (!doc) {
		throw new McpError(
			ErrorCode.InvalidRequest,
			'Derived rune documentation not found',
		);
	}

	// If includeExamples is false, remove code blocks
	let content = doc.content;
	if (args?.includeExamples === false) {
		content = removeCodeExamples(content);
	}

	return {
		content: [
			{
				type: 'text',
				text: content,
			},
		],
	};
}

async function handlePropsRune(args: any = {}) {
	const doc = getDocByCategoryAndId(docs, 'runes', 'props');

	if (!doc) {
		throw new McpError(
			ErrorCode.InvalidRequest,
			'Props rune documentation not found',
		);
	}

	// If includeExamples is false, remove code blocks
	let content = doc.content;
	if (args?.includeExamples === false) {
		content = removeCodeExamples(content);
	}

	return {
		content: [
			{
				type: 'text',
				text: content,
			},
		],
	};
}

async function handleEffectRune(args: any = {}) {
	const doc = getDocByCategoryAndId(docs, 'runes', 'effect');

	if (!doc) {
		throw new McpError(
			ErrorCode.InvalidRequest,
			'Effect rune documentation not found',
		);
	}

	// If includeExamples is false, remove code blocks
	let content = doc.content;
	if (args?.includeExamples === false) {
		content = removeCodeExamples(content);
	}

	return {
		content: [
			{
				type: 'text',
				text: content,
			},
		],
	};
}

async function handleSnippets(args: any = {}) {
	const doc = getDocByCategoryAndId(docs, 'features', 'snippets');

	if (!doc) {
		throw new McpError(
			ErrorCode.InvalidRequest,
			'Snippets documentation not found',
		);
	}

	// If includeExamples is false, remove code blocks
	let content = doc.content;
	if (args?.includeExamples === false) {
		content = removeCodeExamples(content);
	}

	return {
		content: [
			{
				type: 'text',
				text: content,
			},
		],
	};
}

async function handleEvents(args: any = {}) {
	const doc = getDocByCategoryAndId(docs, 'features', 'events');

	if (!doc) {
		throw new McpError(
			ErrorCode.InvalidRequest,
			'Events documentation not found',
		);
	}

	// If includeExamples is false, remove code blocks
	let content = doc.content;
	if (args?.includeExamples === false) {
		content = removeCodeExamples(content);
	}

	return {
		content: [
			{
				type: 'text',
				text: content,
			},
		],
	};
}

async function handleComponentEvents(args: any = {}) {
	const doc = getDocByCategoryAndId(
		docs,
		'features',
		'component-events',
	);

	if (!doc) {
		throw new McpError(
			ErrorCode.InvalidRequest,
			'Component events documentation not found',
		);
	}

	// If includeExamples is false, remove code blocks
	let content = doc.content;
	if (args?.includeExamples === false) {
		content = removeCodeExamples(content);
	}

	return {
		content: [
			{
				type: 'text',
				text: content,
			},
		],
	};
}

async function handleGlobalState(args: any = {}) {
	const doc = getDocByCategoryAndId(docs, 'patterns', 'global-state');

	if (!doc) {
		throw new McpError(
			ErrorCode.InvalidRequest,
			'Global state documentation not found',
		);
	}

	// If includeExamples is false, remove code blocks
	let content = doc.content;
	if (args?.includeExamples === false) {
		content = removeCodeExamples(content);
	}

	return {
		content: [
			{
				type: 'text',
				text: content,
			},
		],
	};
}

async function handleMigration(args: any = {}) {
	const doc = getDocByCategoryAndId(docs, 'patterns', 'migration');

	if (!doc) {
		throw new McpError(
			ErrorCode.InvalidRequest,
			'Migration documentation not found',
		);
	}

	// If a specific pattern is requested, filter the content
	let content = doc.content;
	if (args?.pattern) {
		const pattern = args.pattern.toLowerCase();

		// Simple filtering by looking for sections that mention the pattern
		const lines = content.split('\n');
		let filteredLines: string[] = [];
		let includeSection = false;
		let sectionLevel = 0;

		for (const line of lines) {
			// Check for section headers
			const headerMatch = line.match(/^(#+)\s+(.+)$/);

			if (headerMatch) {
				const level = headerMatch[1].length;
				const title = headerMatch[2].toLowerCase();

				// If this is a main section (## level) and matches our pattern
				if (level === 2 && title.includes(pattern)) {
					includeSection = true;
					sectionLevel = level;
					filteredLines.push(line);
				}
				// If this is a new main section, stop including
				else if (level <= sectionLevel) {
					includeSection = false;
				}
				// If we're in an included section, include subsections too
				else if (includeSection) {
					filteredLines.push(line);
				}
			}
			// Include lines that are part of an included section
			else if (includeSection) {
				filteredLines.push(line);
			}
		}

		// If we found matching sections, use them
		if (filteredLines.length > 0) {
			content = filteredLines.join('\n');
		}
	}

	return {
		content: [
			{
				type: 'text',
				text: content,
			},
		],
	};
}

async function handleMistakes(args: any = {}) {
	// If a category is specified, look for that specific file
	if (args?.category) {
		const category = args.category.toLowerCase();

		// Try to find a specific mistakes file for this category
		const doc = getDocByCategoryAndId(
			docs,
			'common-mistakes',
			`${category}-mistakes`,
		);

		if (doc) {
			return {
				content: [
					{
						type: 'text',
						text: doc.content,
					},
				],
			};
		}
	}

	// If no category specified or not found, return all mistakes
	const mistakesDocs = getDocsByCategory(docs, 'common-mistakes');

	if (mistakesDocs.length === 0) {
		throw new McpError(
			ErrorCode.InvalidRequest,
			'Common mistakes documentation not found',
		);
	}

	// Combine all mistakes docs
	const content = mistakesDocs
		.map((doc) => doc.content)
		.join('\n\n---\n\n');

	return {
		content: [
			{
				type: 'text',
				text: content,
			},
		],
	};
}

async function handleOverview() {
	const doc = getDocById(docs, 'overview');

	if (!doc) {
		throw new McpError(
			ErrorCode.InvalidRequest,
			'Overview documentation not found',
		);
	}

	return {
		content: [
			{
				type: 'text',
				text: doc.content,
			},
		],
	};
}

async function handleRunesOverview() {
	const doc = getDocByCategoryAndId(docs, 'runes', 'overview');

	if (!doc) {
		throw new McpError(
			ErrorCode.InvalidRequest,
			'Runes overview documentation not found',
		);
	}

	return {
		content: [
			{
				type: 'text',
				text: doc.content,
			},
		],
	};
}

async function handleAwaitExpressions(args: any = {}) {
	const doc = getDocByCategoryAndId(
		docs,
		'features',
		'await-expressions',
	);

	if (!doc) {
		throw new McpError(
			ErrorCode.InvalidRequest,
			'Await expressions documentation not found',
		);
	}

	// If includeExamples is false, remove code blocks
	let content = doc.content;
	if (args?.includeExamples === false) {
		content = removeCodeExamples(content);
	}

	return {
		content: [
			{
				type: 'text',
				text: content,
			},
		],
	};
}

async function handleRemoteFunctions(args: any = {}) {
	const doc = getDocByCategoryAndId(
		docs,
		'features',
		'remote-functions',
	);

	if (!doc) {
		throw new McpError(
			ErrorCode.InvalidRequest,
			'Remote functions documentation not found',
		);
	}

	// If includeExamples is false, remove code blocks
	let content = doc.content;
	if (args?.includeExamples === false) {
		content = removeCodeExamples(content);
	}

	return {
		content: [
			{
				type: 'text',
				text: content,
			},
		],
	};
}

// Helper function to remove code examples from markdown
function removeCodeExamples(markdown: string): string {
	// Simple approach: remove all code blocks
	return markdown.replace(/```[\s\S]*?```/g, '');
}
