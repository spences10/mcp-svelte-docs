import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { McpServer } from 'tmcp';
import * as v from 'valibot';

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

// Input validation schemas
const ExamplesSchema = v.object({
	includeExamples: v.pipe(
		v.optional(v.boolean(), true),
		v.description('Whether to include code examples (default: true)'),
	),
});

const MigrationSchema = v.object({
	pattern: v.pipe(
		v.optional(v.string()),
		v.description(
			'Specific pattern to look for (e.g., "reactive", "props", "events")',
		),
	),
});

const MistakesSchema = v.object({
	category: v.pipe(
		v.optional(v.string()),
		v.description(
			'Category of mistakes (e.g., "state", "props", "events")',
		),
	),
});

const EmptySchema = v.object({});

/**
 * Registers the Svelte5 documentation tools with the MCP server
 */
export function register_markdown_tools(
	server: McpServer<any>,
): void {
	// Load all markdown docs
	docs = loadMarkdownDocs(docsDir);

	// Core Svelte 5 Runes
	server.tool<typeof ExamplesSchema>(
		{
			name: 'svelte5_state',
			description: 'Get documentation about $state rune in Svelte 5',
			schema: ExamplesSchema,
		},
		async ({ includeExamples }) => {
			return handleStateRune({ includeExamples });
		},
	);

	server.tool<typeof ExamplesSchema>(
		{
			name: 'svelte5_derived',
			description:
				'Get documentation about $derived rune in Svelte 5',
			schema: ExamplesSchema,
		},
		async ({ includeExamples }) => {
			return handleDerivedRune({ includeExamples });
		},
	);

	server.tool<typeof ExamplesSchema>(
		{
			name: 'svelte5_props',
			description: 'Get documentation about $props rune in Svelte 5',
			schema: ExamplesSchema,
		},
		async ({ includeExamples }) => {
			return handlePropsRune({ includeExamples });
		},
	);

	server.tool<typeof ExamplesSchema>(
		{
			name: 'svelte5_effect',
			description: 'Get documentation about $effect rune in Svelte 5',
			schema: ExamplesSchema,
		},
		async ({ includeExamples }) => {
			return handleEffectRune({ includeExamples });
		},
	);

	// Svelte 5 Features
	server.tool<typeof ExamplesSchema>(
		{
			name: 'svelte5_snippets',
			description:
				'Get documentation about snippets in Svelte 5 (replacement for slots)',
			schema: ExamplesSchema,
		},
		async ({ includeExamples }) => {
			return handleSnippets({ includeExamples });
		},
	);

	server.tool<typeof ExamplesSchema>(
		{
			name: 'svelte5_events',
			description:
				'Get documentation about event handling in Svelte 5',
			schema: ExamplesSchema,
		},
		async ({ includeExamples }) => {
			return handleEvents({ includeExamples });
		},
	);

	server.tool<typeof ExamplesSchema>(
		{
			name: 'svelte5_component_events',
			description:
				'Get documentation about component events in Svelte 5',
			schema: ExamplesSchema,
		},
		async ({ includeExamples }) => {
			return handleComponentEvents({ includeExamples });
		},
	);

	server.tool<typeof ExamplesSchema>(
		{
			name: 'svelte5_global_state',
			description:
				'Get documentation about global state management in Svelte 5',
			schema: ExamplesSchema,
		},
		async ({ includeExamples }) => {
			return handleGlobalState({ includeExamples });
		},
	);

	// Migration and Common Mistakes
	server.tool<typeof MigrationSchema>(
		{
			name: 'svelte5_migration',
			description:
				'Get documentation about migration from Svelte 4 to Svelte 5',
			schema: MigrationSchema,
		},
		async ({ pattern }) => {
			return handleMigration({ pattern });
		},
	);

	server.tool<typeof MistakesSchema>(
		{
			name: 'svelte5_mistakes',
			description:
				'Get documentation about common mistakes when using Svelte 5',
			schema: MistakesSchema,
		},
		async ({ category }) => {
			return handleMistakes({ category });
		},
	);

	// Overview Tools
	server.tool<typeof EmptySchema>(
		{
			name: 'svelte5_overview',
			description: 'Get overview of Svelte 5 features and changes',
			schema: EmptySchema,
		},
		async () => {
			return handleOverview();
		},
	);

	server.tool<typeof EmptySchema>(
		{
			name: 'svelte5_runes_overview',
			description: 'Get overview of all runes in Svelte 5',
			schema: EmptySchema,
		},
		async () => {
			return handleRunesOverview();
		},
	);

	// New Async and Remote Functions Features
	server.tool<typeof ExamplesSchema>(
		{
			name: 'svelte5_await_expressions',
			description:
				'Get documentation about await expressions in Svelte 5',
			schema: ExamplesSchema,
		},
		async ({ includeExamples }) => {
			return handleAwaitExpressions({ includeExamples });
		},
	);

	server.tool<typeof ExamplesSchema>(
		{
			name: 'sveltekit_remote_functions',
			description:
				'Get documentation about remote functions in SvelteKit',
			schema: ExamplesSchema,
		},
		async ({ includeExamples }) => {
			return handleRemoteFunctions({ includeExamples });
		},
	);
}

// Handler functions for each tool

async function handleStateRune(args: any = {}) {
	const doc = getDocByCategoryAndId(docs, 'runes', 'state');

	if (!doc) {
		throw new Error('State rune documentation not found');
	}

	// If includeExamples is false, remove code blocks
	let content = doc.content;
	if (args?.includeExamples === false) {
		content = removeCodeExamples(content);
	}

	return {
		content: [
			{
				type: 'text' as const,
				text: content,
			},
		],
	};
}

async function handleDerivedRune(args: any = {}) {
	const doc = getDocByCategoryAndId(docs, 'runes', 'derived');

	if (!doc) {
		throw new Error('Derived rune documentation not found');
	}

	// If includeExamples is false, remove code blocks
	let content = doc.content;
	if (args?.includeExamples === false) {
		content = removeCodeExamples(content);
	}

	return {
		content: [
			{
				type: 'text' as const,
				text: content,
			},
		],
	};
}

async function handlePropsRune(args: any = {}) {
	const doc = getDocByCategoryAndId(docs, 'runes', 'props');

	if (!doc) {
		throw new Error('Props rune documentation not found');
	}

	// If includeExamples is false, remove code blocks
	let content = doc.content;
	if (args?.includeExamples === false) {
		content = removeCodeExamples(content);
	}

	return {
		content: [
			{
				type: 'text' as const,
				text: content,
			},
		],
	};
}

async function handleEffectRune(args: any = {}) {
	const doc = getDocByCategoryAndId(docs, 'runes', 'effect');

	if (!doc) {
		throw new Error('Effect rune documentation not found');
	}

	// If includeExamples is false, remove code blocks
	let content = doc.content;
	if (args?.includeExamples === false) {
		content = removeCodeExamples(content);
	}

	return {
		content: [
			{
				type: 'text' as const,
				text: content,
			},
		],
	};
}

async function handleSnippets(args: any = {}) {
	const doc = getDocByCategoryAndId(docs, 'features', 'snippets');

	if (!doc) {
		throw new Error('Snippets documentation not found');
	}

	// If includeExamples is false, remove code blocks
	let content = doc.content;
	if (args?.includeExamples === false) {
		content = removeCodeExamples(content);
	}

	return {
		content: [
			{
				type: 'text' as const,
				text: content,
			},
		],
	};
}

async function handleEvents(args: any = {}) {
	const doc = getDocByCategoryAndId(docs, 'features', 'events');

	if (!doc) {
		throw new Error('Events documentation not found');
	}

	// If includeExamples is false, remove code blocks
	let content = doc.content;
	if (args?.includeExamples === false) {
		content = removeCodeExamples(content);
	}

	return {
		content: [
			{
				type: 'text' as const,
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
		throw new Error('Component events documentation not found');
	}

	// If includeExamples is false, remove code blocks
	let content = doc.content;
	if (args?.includeExamples === false) {
		content = removeCodeExamples(content);
	}

	return {
		content: [
			{
				type: 'text' as const,
				text: content,
			},
		],
	};
}

async function handleGlobalState(args: any = {}) {
	const doc = getDocByCategoryAndId(docs, 'patterns', 'global-state');

	if (!doc) {
		throw new Error('Global state documentation not found');
	}

	// If includeExamples is false, remove code blocks
	let content = doc.content;
	if (args?.includeExamples === false) {
		content = removeCodeExamples(content);
	}

	return {
		content: [
			{
				type: 'text' as const,
				text: content,
			},
		],
	};
}

async function handleMigration(args: any = {}) {
	const doc = getDocByCategoryAndId(docs, 'patterns', 'migration');

	if (!doc) {
		throw new Error('Migration documentation not found');
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
				type: 'text' as const,
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
						type: 'text' as const,
						text: doc.content,
					},
				],
			};
		}
	}

	// If no category specified or not found, return all mistakes
	const mistakesDocs = getDocsByCategory(docs, 'common-mistakes');

	if (mistakesDocs.length === 0) {
		throw new Error('Common mistakes documentation not found');
	}

	// Combine all mistakes docs
	const content = mistakesDocs
		.map((doc) => doc.content)
		.join('\n\n---\n\n');

	return {
		content: [
			{
				type: 'text' as const,
				text: content,
			},
		],
	};
}

async function handleOverview() {
	const doc = getDocById(docs, 'overview');

	if (!doc) {
		throw new Error('Overview documentation not found');
	}

	return {
		content: [
			{
				type: 'text' as const,
				text: doc.content,
			},
		],
	};
}

async function handleRunesOverview() {
	const doc = getDocByCategoryAndId(docs, 'runes', 'overview');

	if (!doc) {
		throw new Error('Runes overview documentation not found');
	}

	return {
		content: [
			{
				type: 'text' as const,
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
		throw new Error('Await expressions documentation not found');
	}

	// If includeExamples is false, remove code blocks
	let content = doc.content;
	if (args?.includeExamples === false) {
		content = removeCodeExamples(content);
	}

	return {
		content: [
			{
				type: 'text' as const,
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
		throw new Error('Remote functions documentation not found');
	}

	// If includeExamples is false, remove code blocks
	let content = doc.content;
	if (args?.includeExamples === false) {
		content = removeCodeExamples(content);
	}

	return {
		content: [
			{
				type: 'text' as const,
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
