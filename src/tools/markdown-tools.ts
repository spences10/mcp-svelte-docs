import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { McpServer } from 'tmcp';
import * as v from 'valibot';

import {
	DocItem,
	get_doc_by_category_and_id,
	get_doc_by_id,
	get_docs_by_category,
	load_markdown_docs,
} from '../markdown-loader.js';

// Get the docs directory path
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const docsDir = join(__dirname, '../../docs');

// Load all markdown docs
let docs: DocItem[] = [];

// Enhanced input validation schemas
const EnhancedExamplesSchema = v.object({
	includeExamples: v.pipe(
		v.optional(v.boolean(), true),
		v.description('Whether to include code examples (default: true)'),
	),
	format: v.pipe(
		v.optional(
			v.picklist(['concise', 'detailed', 'quick-ref']),
			'detailed',
		),
		v.description(
			'Output format: concise (key points only), detailed (full content), quick-ref (minimal reference)',
		),
	),
});

const ExamplesSchema = EnhancedExamplesSchema;

const MigrationSchema = v.object({
	pattern: v.pipe(
		v.optional(v.string()),
		v.description(
			'Specific pattern to look for (e.g., "reactive", "props", "events")',
		),
	),
	format: v.pipe(
		v.optional(
			v.picklist(['concise', 'detailed', 'quick-ref']),
			'detailed',
		),
		v.description(
			'Output format: concise (key points only), detailed (full content), quick-ref (minimal reference)',
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
	format: v.pipe(
		v.optional(
			v.picklist(['concise', 'detailed', 'quick-ref']),
			'detailed',
		),
		v.description(
			'Output format: concise (key points only), detailed (full content), quick-ref (minimal reference)',
		),
	),
});

// Types for shared handler logic
type OutputFormat = 'concise' | 'detailed' | 'quick-ref';

interface DocHandlerArgs {
	include_examples?: boolean;
	format?: OutputFormat;
}

interface DocLookupConfig {
	category?: string;
	id: string;
	fallback_ids?: string[];
}

interface ToolConfig {
	name: string;
	lookup: DocLookupConfig;
	related_topics?: string[];
}

// Tool configurations mapping
const TOOL_CONFIGS: Record<string, ToolConfig> = {
	svelte5_state: {
		name: '$state rune',
		lookup: { category: 'runes', id: 'state' },
		related_topics: [
			'svelte5_derived',
			'svelte5_props',
			'svelte5_effect',
		],
	},
	svelte5_derived: {
		name: '$derived rune',
		lookup: { category: 'runes', id: 'derived' },
		related_topics: ['svelte5_state', 'svelte5_effect'],
	},
	svelte5_props: {
		name: '$props rune',
		lookup: { category: 'runes', id: 'props' },
		related_topics: ['svelte5_state', 'svelte5_snippets'],
	},
	svelte5_effect: {
		name: '$effect rune',
		lookup: { category: 'runes', id: 'effect' },
		related_topics: ['svelte5_state', 'svelte5_derived'],
	},
	svelte5_snippets: {
		name: 'snippets',
		lookup: { category: 'features', id: 'snippets' },
		related_topics: ['svelte5_props', 'svelte5_events'],
	},
	svelte5_events: {
		name: 'event handling',
		lookup: { category: 'features', id: 'events' },
		related_topics: ['svelte5_component_events', 'svelte5_snippets'],
	},
	svelte5_component_events: {
		name: 'component events',
		lookup: { category: 'features', id: 'component-events' },
		related_topics: ['svelte5_events', 'svelte5_props'],
	},
	svelte5_global_state: {
		name: 'global state management',
		lookup: { category: 'patterns', id: 'global-state' },
		related_topics: ['svelte5_state', 'svelte5_derived'],
	},
	svelte5_migration: {
		name: 'Svelte 4 to 5 migration',
		lookup: { category: 'patterns', id: 'migration' },
		related_topics: ['svelte5_overview', 'svelte5_mistakes'],
	},
	svelte5_mistakes: {
		name: 'common mistakes',
		lookup: { category: 'common-mistakes', id: 'mistakes' },
		related_topics: ['svelte5_migration', 'svelte5_overview'],
	},
	svelte5_overview: {
		name: 'Svelte 5 overview',
		lookup: { id: 'overview' },
		related_topics: ['svelte5_runes_overview', 'svelte5_migration'],
	},
	svelte5_runes_overview: {
		name: 'runes overview',
		lookup: { category: 'runes', id: 'overview' },
		related_topics: [
			'svelte5_state',
			'svelte5_derived',
			'svelte5_props',
			'svelte5_effect',
		],
	},
	svelte5_await_expressions: {
		name: 'await expressions',
		lookup: { category: 'features', id: 'await-expressions' },
		related_topics: ['sveltekit_remote_functions'],
	},
	sveltekit_remote_functions: {
		name: 'remote functions',
		lookup: { category: 'features', id: 'remote-functions' },
		related_topics: ['svelte5_await_expressions'],
	},
};

// Shared utility functions
function format_content(
	content: string,
	format: OutputFormat,
	include_examples: boolean,
): string {
	let processed_content = content;

	// Remove code examples if requested
	if (!include_examples) {
		processed_content = remove_code_examples(processed_content);
	}

	// Apply format-specific processing
	switch (format) {
		case 'quick-ref':
			return extract_quick_reference(processed_content);
		case 'concise':
			return extract_key_points(processed_content);
		case 'detailed':
		default:
			return processed_content;
	}
}

function extract_quick_reference(markdown: string): string {
	// Extract just headings and first sentence of each section
	const lines = markdown.split('\n');
	const quick_ref: string[] = [];
	let in_code_block = false;

	for (const line of lines) {
		// Track code blocks
		if (line.startsWith('```')) {
			in_code_block = !in_code_block;
			continue;
		}

		if (in_code_block) continue;

		// Include all headings
		if (line.match(/^#+\s+/)) {
			quick_ref.push(line);
		}
		// Include first sentence of paragraphs
		else if (
			line.trim() &&
			!line.startsWith('-') &&
			!line.startsWith('*')
		) {
			const first_sentence = line.split('.')[0] + '.';
			if (first_sentence.length > 10) {
				quick_ref.push(first_sentence);
			}
		}
	}

	return quick_ref.join('\n');
}

function extract_key_points(markdown: string): string {
	// Extract headings and bullet points, remove most explanatory text
	const lines = markdown.split('\n');
	const key_points: string[] = [];
	let in_code_block = false;

	for (const line of lines) {
		// Track code blocks
		if (line.startsWith('```')) {
			in_code_block = !in_code_block;
			continue;
		}

		if (in_code_block) continue;

		// Include headings and list items
		if (
			line.match(/^#+\s+/) ||
			line.match(/^[-*]\s+/) ||
			line.match(/^\d+\.\s+/)
		) {
			key_points.push(line);
		}
		// Include short, important sentences
		else if (
			line.includes('**') ||
			line.includes('`') ||
			line.length < 100
		) {
			if (line.trim()) {
				key_points.push(line);
			}
		}
	}

	return key_points.join('\n');
}

function create_suggestion_error(
	tool_name: string,
	config: ToolConfig,
): Error {
	const related_tools = config.related_topics?.slice(0, 3) || [];
	const suggestions =
		related_tools.length > 0
			? `\n\nRelated topics you might want: ${related_tools.join(
					', ',
			  )}`
			: '';

	return new Error(
		`${config.name} documentation not found.${suggestions}`,
	);
}

// Shared handler for simple documentation retrieval
function create_doc_handler(tool_name: string) {
	return async (args: DocHandlerArgs = {}) => {
		const config = TOOL_CONFIGS[tool_name];
		if (!config) {
			throw new Error(`Unknown tool: ${tool_name}`);
		}

		let doc;
		if (config.lookup.category) {
			doc = get_doc_by_category_and_id(
				docs,
				config.lookup.category,
				config.lookup.id,
			);
		} else {
			doc = get_doc_by_id(docs, config.lookup.id);
		}

		if (!doc) {
			throw create_suggestion_error(tool_name, config);
		}

		const {
			include_examples: includeExamples = true,
			format = 'detailed',
		} = args;
		const content = format_content(
			doc.content,
			format,
			includeExamples,
		);

		return {
			content: [
				{
					type: 'text' as const,
					text: content,
				},
			],
		};
	};
}

/**
 * Registers the Svelte5 documentation tools with the MCP server
 */
export function register_markdown_tools(
	server: McpServer<any>,
): void {
	// Load all markdown docs
	docs = load_markdown_docs(docsDir);

	// Core Svelte 5 Runes
	server.tool<typeof ExamplesSchema>(
		{
			name: 'svelte5_state',
			description: 'Get documentation about $state rune in Svelte 5',
			schema: ExamplesSchema,
		},
		create_doc_handler('svelte5_state'),
	);

	server.tool<typeof ExamplesSchema>(
		{
			name: 'svelte5_derived',
			description:
				'Get documentation about $derived rune in Svelte 5',
			schema: ExamplesSchema,
		},
		create_doc_handler('svelte5_derived'),
	);

	server.tool<typeof ExamplesSchema>(
		{
			name: 'svelte5_props',
			description: 'Get documentation about $props rune in Svelte 5',
			schema: ExamplesSchema,
		},
		create_doc_handler('svelte5_props'),
	);

	server.tool<typeof ExamplesSchema>(
		{
			name: 'svelte5_effect',
			description: 'Get documentation about $effect rune in Svelte 5',
			schema: ExamplesSchema,
		},
		create_doc_handler('svelte5_effect'),
	);

	// Svelte 5 Features
	server.tool<typeof ExamplesSchema>(
		{
			name: 'svelte5_snippets',
			description:
				'Get documentation about snippets in Svelte 5 (replacement for slots)',
			schema: ExamplesSchema,
		},
		create_doc_handler('svelte5_snippets'),
	);

	server.tool<typeof ExamplesSchema>(
		{
			name: 'svelte5_events',
			description:
				'Get documentation about event handling in Svelte 5',
			schema: ExamplesSchema,
		},
		create_doc_handler('svelte5_events'),
	);

	server.tool<typeof ExamplesSchema>(
		{
			name: 'svelte5_component_events',
			description:
				'Get documentation about component events in Svelte 5',
			schema: ExamplesSchema,
		},
		create_doc_handler('svelte5_component_events'),
	);

	server.tool<typeof ExamplesSchema>(
		{
			name: 'svelte5_global_state',
			description:
				'Get documentation about global state management in Svelte 5',
			schema: ExamplesSchema,
		},
		create_doc_handler('svelte5_global_state'),
	);

	// Migration and Common Mistakes (special handlers with filtering)
	server.tool<typeof MigrationSchema>(
		{
			name: 'svelte5_migration',
			description:
				'Get documentation about migration from Svelte 4 to Svelte 5',
			schema: MigrationSchema,
		},
		async ({ pattern, format = 'detailed' }) => {
			return handle_migration({ pattern, format });
		},
	);

	server.tool<typeof MistakesSchema>(
		{
			name: 'svelte5_mistakes',
			description:
				'Get documentation about common mistakes when using Svelte 5',
			schema: MistakesSchema,
		},
		async ({ category, format = 'detailed' }) => {
			return handle_mistakes({ category, format });
		},
	);

	// Overview Tools
	server.tool<typeof ExamplesSchema>(
		{
			name: 'svelte5_overview',
			description: 'Get overview of Svelte 5 features and changes',
			schema: ExamplesSchema,
		},
		create_doc_handler('svelte5_overview'),
	);

	server.tool<typeof ExamplesSchema>(
		{
			name: 'svelte5_runes_overview',
			description: 'Get overview of all runes in Svelte 5',
			schema: ExamplesSchema,
		},
		create_doc_handler('svelte5_runes_overview'),
	);

	// New Async and Remote Functions Features
	server.tool<typeof ExamplesSchema>(
		{
			name: 'svelte5_await_expressions',
			description:
				'Get documentation about await expressions in Svelte 5',
			schema: ExamplesSchema,
		},
		create_doc_handler('svelte5_await_expressions'),
	);

	server.tool<typeof ExamplesSchema>(
		{
			name: 'sveltekit_remote_functions',
			description:
				'Get documentation about remote functions in SvelteKit',
			schema: ExamplesSchema,
		},
		create_doc_handler('sveltekit_remote_functions'),
	);
}

// Special handlers for tools that need custom logic

async function handle_migration(args: any = {}) {
	const config = TOOL_CONFIGS['svelte5_migration'];
	const doc = get_doc_by_category_and_id(
		docs,
		'patterns',
		'migration',
	);

	if (!doc) {
		throw create_suggestion_error('svelte5_migration', config);
	}

	// If a specific pattern is requested, filter the content
	let content = doc.content;
	if (args?.pattern) {
		const pattern = args.pattern.toLowerCase();

		// Simple filtering by looking for sections that mention the pattern
		const lines = content.split('\n');
		let filtered_lines: string[] = [];
		let include_section = false;
		let section_level = 0;

		for (const line of lines) {
			// Check for section headers
			const header_match = line.match(/^(#+)\s+(.+)$/);

			if (header_match) {
				const level = header_match[1].length;
				const title = header_match[2].toLowerCase();

				// If this is a main section (## level) and matches our pattern
				if (level === 2 && title.includes(pattern)) {
					include_section = true;
					section_level = level;
					filtered_lines.push(line);
				}
				// If this is a new main section, stop including
				else if (level <= section_level) {
					include_section = false;
				}
				// If we're in an included section, include subsections too
				else if (include_section) {
					filtered_lines.push(line);
				}
			}
			// Include lines that are part of an included section
			else if (include_section) {
				filtered_lines.push(line);
			}
		}

		// If we found matching sections, use them
		if (filtered_lines.length > 0) {
			content = filtered_lines.join('\n');
		}
	}

	// Apply format processing
	const { format = 'detailed' } = args;
	const formatted_content = format_content(content, format, true);

	return {
		content: [
			{
				type: 'text' as const,
				text: formatted_content,
			},
		],
	};
}

async function handle_mistakes(args: any = {}) {
	const config = TOOL_CONFIGS['svelte5_mistakes'];

	// If a category is specified, look for that specific file
	if (args?.category) {
		const category = args.category.toLowerCase();

		// Try to find a specific mistakes file for this category
		const doc = get_doc_by_category_and_id(
			docs,
			'common-mistakes',
			`${category}-mistakes`,
		);

		if (doc) {
			const { format = 'detailed' } = args;
			const formatted_content = format_content(
				doc.content,
				format,
				true,
			);

			return {
				content: [
					{
						type: 'text' as const,
						text: formatted_content,
					},
				],
			};
		}
	}

	// If no category specified or not found, return all mistakes
	const mistakes_docs = get_docs_by_category(docs, 'common-mistakes');

	if (mistakes_docs.length === 0) {
		throw create_suggestion_error('svelte5_mistakes', config);
	}

	// Combine all mistakes docs
	let content = mistakes_docs
		.map((doc) => doc.content)
		.join('\n\n---\n\n');

	// Apply format processing
	const { format = 'detailed' } = args;
	const formatted_content = format_content(content, format, true);

	return {
		content: [
			{
				type: 'text' as const,
				text: formatted_content,
			},
		],
	};
}

// Helper function to remove code examples from markdown
function remove_code_examples(markdown: string): string {
	// Simple approach: remove all code blocks
	return markdown.replace(/```[\s\S]*?```/g, '');
}
