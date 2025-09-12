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
		v.description(
			'Whether to include practical code examples in the response. Set to false to get conceptual explanations only. Defaults to true for better learning. Examples include syntax patterns, common use cases, and implementation details.',
		),
	),
	format: v.pipe(
		v.optional(
			v.picklist(['concise', 'detailed', 'quick-ref']),
			'detailed',
		),
		v.description(
			'Controls response length and detail level. "concise" returns key points only (best for quick answers), "detailed" provides comprehensive documentation with examples (default, best for learning), "quick-ref" returns minimal reference information (best for experienced developers who need syntax reminders).',
		),
	),
});

const ExamplesSchema = EnhancedExamplesSchema;

const MigrationSchema = v.object({
	pattern: v.pipe(
		v.optional(v.string()),
		v.description(
			'Filter migration guidance by specific pattern or concept (e.g., "reactive", "props", "events", "lifecycle", "stores"). Leave empty to get comprehensive migration guidance. Useful when you need targeted help migrating specific Svelte 4 patterns to Svelte 5 equivalents.',
		),
	),
	format: v.pipe(
		v.optional(
			v.picklist(['concise', 'detailed', 'quick-ref']),
			'detailed',
		),
		v.description(
			'Controls response length and detail level. "concise" returns key migration points only, "detailed" provides step-by-step migration guidance with before/after examples (recommended for complex migrations), "quick-ref" returns minimal conversion syntax only.',
		),
	),
});

const MistakesSchema = v.object({
	category: v.pipe(
		v.optional(v.string()),
		v.description(
			'Filter mistakes by specific category or concept (e.g., "state", "props", "events", "reactivity", "lifecycle"). Leave empty to get comprehensive mistake documentation. Useful when troubleshooting specific issues or learning to avoid common pitfalls in particular areas of Svelte 5.',
		),
	),
	format: v.pipe(
		v.optional(
			v.picklist(['concise', 'detailed', 'quick-ref']),
			'detailed',
		),
		v.description(
			'Controls response length and detail level. "concise" returns mistake summaries only, "detailed" provides comprehensive explanations with wrong/correct examples and debugging guidance (recommended for learning), "quick-ref" returns minimal mistake identification only.',
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
			// For detailed format, ensure we don't exceed reasonable token limits
			return truncate_if_needed(processed_content, 4000);
	}
}

// Helper function to truncate content if it's too long
function truncate_if_needed(
	content: string,
	max_words: number,
): string {
	const words = content.split(/\s+/);
	if (words.length <= max_words) {
		return content;
	}

	// Try to truncate at a natural break point (section heading)
	const lines = content.split('\n');
	const truncated_lines: string[] = [];
	let word_count = 0;

	for (const line of lines) {
		const line_words = line.split(/\s+/).length;
		if (word_count + line_words > max_words) {
			// If we're at a section heading, that's a good place to stop
			if (line.match(/^#+\s+/)) {
				truncated_lines.push(
					'\n*[Content truncated for brevity. Use format="concise" or format="quick-ref" for shorter responses, or request specific sections.]*',
				);
				break;
			}
		}
		truncated_lines.push(line);
		word_count += line_words;
	}

	return truncated_lines.join('\n');
}

function extract_quick_reference(markdown: string): string {
	// Extract just headings, key syntax, and essential bullet points
	const lines = markdown.split('\n');
	const quick_ref: string[] = [];
	let in_code_block = false;
	let code_block_content = '';

	for (const line of lines) {
		// Track code blocks - preserve short syntax examples
		if (line.startsWith('```')) {
			if (in_code_block) {
				// Ending code block - include if it's short and looks like syntax
				if (
					code_block_content.split('\n').length <= 5 &&
					(code_block_content.includes('$state') ||
						code_block_content.includes('$derived') ||
						code_block_content.includes('$props') ||
						code_block_content.includes('$effect'))
				) {
					quick_ref.push('```' + code_block_content + '```');
				}
				code_block_content = '';
			}
			in_code_block = !in_code_block;
			continue;
		}

		if (in_code_block) {
			code_block_content += '\n' + line;
			continue;
		}

		// Include all headings
		if (line.match(/^#+\s+/)) {
			quick_ref.push(line);
		}
		// Include key bullet points and important short lines
		else if (line.match(/^[-*]\s+/) && line.length < 80) {
			quick_ref.push(line);
		}
		// Include lines with key syntax indicators
		else if (
			line.includes('`$state') ||
			line.includes('`$derived') ||
			line.includes('`$props') ||
			line.includes('`$effect') ||
			line.includes('**Important') ||
			line.includes('**Note')
		) {
			quick_ref.push(line);
		}
	}

	return quick_ref.join('\n');
}

function extract_key_points(markdown: string): string {
	// Extract headings, bullet points, and essential information
	const lines = markdown.split('\n');
	const key_points: string[] = [];
	let in_code_block = false;
	let current_section = '';

	for (const line of lines) {
		// Track code blocks - include important ones
		if (line.startsWith('```')) {
			in_code_block = !in_code_block;
			if (!in_code_block) {
				// End of code block - include short examples in certain sections
				if (
					current_section.toLowerCase().includes('syntax') ||
					current_section.toLowerCase().includes('example') ||
					current_section.toLowerCase().includes('basic')
				) {
					key_points.push(line);
				}
			} else {
				key_points.push(line);
			}
			continue;
		}

		if (in_code_block) {
			key_points.push(line);
			continue;
		}

		// Track current section
		if (line.match(/^#+\s+/)) {
			current_section = line;
			key_points.push(line);
		}
		// Include list items and important markers
		else if (
			line.match(/^[-*]\s+/) ||
			line.match(/^\d+\.\s+/) ||
			line.includes('**Important') ||
			line.includes('**Note') ||
			line.includes('⚠️') ||
			line.includes('✅')
		) {
			key_points.push(line);
		}
		// Include short, key sentences with code or emphasis
		else if (
			(line.includes('**') || line.includes('`')) &&
			line.length < 120 &&
			line.trim()
		) {
			key_points.push(line);
		}
	}

	return key_points.join('\n');
}

function create_suggestion_error(
	tool_name: string,
	config: ToolConfig,
	context?: string,
): Error {
	const related_tools = config.related_topics?.slice(0, 3) || [];

	let error_message = `Documentation for '${config.name}' is not available`;

	// Add context-specific guidance
	if (context) {
		error_message += ` with the specified ${context}`;
	}

	// Add actionable suggestions
	const suggestions: string[] = [];

	if (related_tools.length > 0) {
		suggestions.push(
			`Try related tools: ${related_tools.join(', ')}`,
		);
	}

	// Add specific suggestions based on tool type
	if (tool_name.includes('migration')) {
		suggestions.push(
			'Try using the pattern parameter to filter migration guidance (e.g., "reactive", "props", "events")',
		);
	} else if (tool_name.includes('mistakes')) {
		suggestions.push(
			'Try using the category parameter to filter mistakes (e.g., "state", "props", "events")',
		);
	} else if (tool_name.includes('runes')) {
		suggestions.push(
			'Consider using individual rune tools: svelte5_state, svelte5_derived, svelte5_props, svelte5_effect',
		);
	}

	// Add format suggestions
	suggestions.push(
		'Try different format options: "concise", "detailed", or "quick-ref"',
	);

	if (suggestions.length > 0) {
		error_message += `.\n\nSuggestions:\n${suggestions
			.map((s) => `• ${s}`)
			.join('\n')}`;
	}

	return new Error(error_message);
}

// Shared handler for simple documentation retrieval
function create_doc_handler(tool_name: string) {
	return async (args: DocHandlerArgs = {}) => {
		try {
			const config = TOOL_CONFIGS[tool_name];
			if (!config) {
				throw new Error(
					`Internal error: Unknown tool configuration for '${tool_name}'. This appears to be a server configuration issue.`,
				);
			}

			// Validate input parameters
			const {
				include_examples: includeExamples = true,
				format = 'detailed',
			} = args;

			// Validate format parameter
			const validFormats = ['concise', 'detailed', 'quick-ref'];
			if (!validFormats.includes(format)) {
				throw new Error(
					`Invalid format "${format}". Valid options are: ${validFormats.join(
						', ',
					)}.`,
				);
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

			// Validate that documentation content exists
			if (!doc.content || doc.content.trim().length === 0) {
				throw new Error(
					`Documentation for '${config.name}' exists but appears to be empty. Please try again later or contact support.`,
				);
			}

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
		} catch (error) {
			// Re-throw with additional context for debugging
			const errorMessage =
				error instanceof Error
					? error.message
					: 'Unknown error occurred';
			throw new Error(`Error in ${tool_name}: ${errorMessage}`);
		}
	};
}

/**
 * Registers the Svelte5 documentation tools with the MCP server
 *
 * Example Usage Patterns:
 *
 * Basic rune documentation:
 * - svelte5_state({ format: "detailed", includeExamples: true })
 * - svelte5_derived({ format: "quick-ref" })
 * - svelte5_props({ format: "concise", includeExamples: false })
 *
 * Migration guidance:
 * - svelte5_migration({ pattern: "reactive", format: "detailed" })
 * - svelte5_migration({ pattern: "props", format: "concise" })
 * - svelte5_migration({ format: "quick-ref" }) // All migration patterns
 *
 * Common mistakes troubleshooting:
 * - svelte5_mistakes({ category: "state", format: "detailed" })
 * - svelte5_mistakes({ category: "props", format: "concise" })
 * - svelte5_mistakes({ format: "quick-ref" }) // All mistakes
 *
 * Overview and learning:
 * - svelte5_overview({ format: "concise" }) // Good for quick intro
 * - svelte5_runes_overview({ format: "detailed" }) // Compare all runes
 *
 * Advanced features:
 * - svelte5_await_expressions({ format: "detailed" }) // Experimental
 * - sveltekit_remote_functions({ format: "detailed" }) // Experimental
 *
 * Expected Response Sizes:
 * - "quick-ref": ~200-500 words (syntax and key points only)
 * - "concise": ~500-1000 words (headings, bullets, key examples)
 * - "detailed": ~1000-4000 words (full documentation, auto-truncated)
 *
 * All tools return content in the format:
 * {
 *   "content": [
 *     {
 *       "type": "text",
 *       "text": "Formatted documentation content..."
 *     }
 *   ]
 * }
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
			description:
				'Get comprehensive documentation about the $state rune in Svelte 5, which replaces reactive declarations from Svelte 4. Use this when you need to understand reactive state management, including basic usage, deep reactivity, and mutation patterns. Returns detailed syntax examples, common patterns, and best practices. Limited to $state rune documentation only - use other rune tools for $derived, $props, or $effect.',
			schema: ExamplesSchema,
		},
		create_doc_handler('svelte5_state'),
	);

	server.tool<typeof ExamplesSchema>(
		{
			name: 'svelte5_derived',
			description:
				'Get comprehensive documentation about the $derived rune in Svelte 5, which creates computed values that automatically update when their dependencies change. Use this when you need to understand how to create reactive computed values, complex derivations, and performance optimization patterns. Returns syntax examples, dependency tracking explanations, and common use cases. Does not cover other runes - use svelte5_state for reactive state or svelte5_effect for side effects.',
			schema: ExamplesSchema,
		},
		create_doc_handler('svelte5_derived'),
	);

	server.tool<typeof ExamplesSchema>(
		{
			name: 'svelte5_props',
			description:
				'Get comprehensive documentation about the $props rune in Svelte 5, which replaces the export syntax for component properties from Svelte 4. Use this when you need to understand component prop declarations, destructuring patterns, default values, and type safety. Returns detailed examples of prop patterns, validation approaches, and migration guidance from export syntax. Limited to prop declaration and usage - use svelte5_component_events for event handling between components.',
			schema: ExamplesSchema,
		},
		create_doc_handler('svelte5_props'),
	);

	server.tool<typeof ExamplesSchema>(
		{
			name: 'svelte5_effect',
			description:
				'Get comprehensive documentation about the $effect rune in Svelte 5, which replaces reactive statements and lifecycle functions for side effects. Use this when you need to understand how to perform side effects that respond to state changes, including cleanup patterns and timing control. Returns detailed examples of effect patterns, dependency tracking, and cleanup strategies. Does not cover reactive state creation - use svelte5_state for reactive variables or svelte5_derived for computed values.',
			schema: ExamplesSchema,
		},
		create_doc_handler('svelte5_effect'),
	);

	// Svelte 5 Features
	server.tool<typeof ExamplesSchema>(
		{
			name: 'svelte5_snippets',
			description:
				'Get comprehensive documentation about snippets in Svelte 5, which replace named slots and provide a more powerful way to pass renderable content between components. Use this when you need to understand snippet declaration, passing parameters to snippets, and migration from slot patterns. Returns syntax examples, parameter passing patterns, and comparison with Svelte 4 slots. Limited to snippet functionality - use svelte5_props for basic component properties.',
			schema: ExamplesSchema,
		},
		create_doc_handler('svelte5_snippets'),
	);

	server.tool<typeof ExamplesSchema>(
		{
			name: 'svelte5_events',
			description:
				'Get comprehensive documentation about event handling patterns in Svelte 5, including DOM events, custom events, and the new event handling syntax. Use this when you need to understand event listeners, event delegation, custom event creation, and differences from Svelte 4 event handling. Returns detailed examples of event patterns, custom event creation, and performance considerations. Does not cover component-to-component communication - use svelte5_component_events for inter-component event patterns.',
			schema: ExamplesSchema,
		},
		create_doc_handler('svelte5_events'),
	);

	server.tool<typeof ExamplesSchema>(
		{
			name: 'svelte5_component_events',
			description:
				'Get comprehensive documentation about component event patterns in Svelte 5, focusing on communication between parent and child components using modern event patterns. Use this when you need to understand component event creation, event forwarding, and best practices for component communication in Svelte 5. Returns detailed examples of component event patterns, event forwarding strategies, and migration from Svelte 4 event patterns. Limited to component-level events - use svelte5_events for DOM event handling.',
			schema: ExamplesSchema,
		},
		create_doc_handler('svelte5_component_events'),
	);

	server.tool<typeof ExamplesSchema>(
		{
			name: 'svelte5_global_state',
			description:
				'Get comprehensive documentation about global state management patterns in Svelte 5, including context-based approaches, store patterns, and shared reactive state. Use this when you need to understand how to share state across multiple components, implement global state stores, and manage application-wide reactive data. Returns detailed patterns for global state, context usage, and store implementations. Does not cover local component state - use svelte5_state for component-level reactive state.',
			schema: ExamplesSchema,
		},
		create_doc_handler('svelte5_global_state'),
	);

	// Migration and Common Mistakes (special handlers with filtering)
	server.tool<typeof MigrationSchema>(
		{
			name: 'svelte5_migration',
			description:
				'Get comprehensive migration guidance for upgrading from Svelte 4 to Svelte 5, including step-by-step conversion patterns and breaking changes. Use this when you need to understand how to migrate existing Svelte 4 code, handle breaking changes, or convert specific patterns like reactive declarations to runes. Returns detailed before/after examples, migration strategies, and common pitfalls. Supports filtering by specific patterns using the pattern parameter for targeted migration guidance.',
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
				'Get comprehensive documentation about common mistakes and anti-patterns when using Svelte 5, including debugging guidance and best practices. Use this when you encounter errors, unexpected behavior, or want to avoid common pitfalls in Svelte 5 development. Returns detailed explanations of mistakes, why they occur, and correct approaches with examples. Supports filtering by mistake category using the category parameter for targeted troubleshooting.',
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
			description:
				'Get comprehensive overview of Svelte 5 features, major changes from Svelte 4, and key concepts for developers new to Svelte 5. Use this when you need a high-level introduction to Svelte 5, understanding the major paradigm shifts, or getting oriented with the new features. Returns broad coverage of Svelte 5 concepts, feature comparisons, and getting started guidance. Does not provide deep implementation details - use specific feature tools for detailed documentation.',
			schema: ExamplesSchema,
		},
		create_doc_handler('svelte5_overview'),
	);

	server.tool<typeof ExamplesSchema>(
		{
			name: 'svelte5_runes_overview',
			description:
				'Get comprehensive overview of all runes in Svelte 5, including $state, $derived, $props, and $effect, with comparative examples and use case guidance. Use this when you need to understand the complete runes system, compare different runes, or decide which rune to use for specific scenarios. Returns comparative documentation of all runes with decision-making guidance and interconnected examples. For detailed documentation of individual runes, use the specific rune tools like svelte5_state or svelte5_derived.',
			schema: ExamplesSchema,
		},
		create_doc_handler('svelte5_runes_overview'),
	);

	// New Async and Remote Functions Features
	server.tool<typeof ExamplesSchema>(
		{
			name: 'svelte5_await_expressions',
			description:
				'Get comprehensive documentation about await expressions in Svelte 5, an experimental feature for handling asynchronous operations directly in templates. Use this when you need to understand async/await patterns in Svelte components, loading state management, and error handling for async operations. Returns detailed examples of await expression syntax, loading patterns, and error boundaries. Note: This is an experimental feature and may change - check Svelte 5 release notes for current status.',
			schema: ExamplesSchema,
		},
		create_doc_handler('svelte5_await_expressions'),
	);

	server.tool<typeof ExamplesSchema>(
		{
			name: 'sveltekit_remote_functions',
			description:
				'Get comprehensive documentation about remote functions in SvelteKit, an experimental feature providing type-safe client-server communication without manual API endpoints. Use this when you need to understand server-side function calls from client components, type safety across the client-server boundary, and alternatives to traditional API routes. Returns detailed examples of remote function patterns, type safety implementation, and integration strategies. Note: This is an experimental feature and may change - verify current SvelteKit documentation for latest status.',
			schema: ExamplesSchema,
		},
		create_doc_handler('sveltekit_remote_functions'),
	);
}

// Special handlers for tools that need custom logic

async function handle_migration(args: any = {}) {
	try {
		const config = TOOL_CONFIGS['svelte5_migration'];
		const { pattern, format = 'detailed' } = args;

		// Validate format parameter
		const validFormats = ['concise', 'detailed', 'quick-ref'];
		if (!validFormats.includes(format)) {
			throw new Error(
				`Invalid format "${format}". Valid options are: ${validFormats.join(
					', ',
				)}.`,
			);
		}

		const doc = get_doc_by_category_and_id(
			docs,
			'patterns',
			'migration',
		);

		if (!doc) {
			throw create_suggestion_error('svelte5_migration', config);
		}

		// Validate that documentation content exists
		if (!doc.content || doc.content.trim().length === 0) {
			throw new Error(
				`Migration documentation exists but appears to be empty. Please try again later or contact support.`,
			);
		}

		// If a specific pattern is requested, filter the content
		let content = doc.content;
		if (args?.pattern) {
			const patternFilter = args.pattern.toLowerCase();

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
					if (level === 2 && title.includes(patternFilter)) {
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
		const formatted_content = format_content(content, format, true);

		return {
			content: [
				{
					type: 'text' as const,
					text: formatted_content,
				},
			],
		};
	} catch (error) {
		const errorMessage =
			error instanceof Error
				? error.message
				: 'Unknown error occurred';
		throw new Error(`Error in svelte5_migration: ${errorMessage}`);
	}
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
			const mistakesFormat = args.format || 'detailed';
			const formatted_content = format_content(
				doc.content,
				mistakesFormat,
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
	const mistakesFormat = args.format || 'detailed';
	const formatted_content = format_content(
		content,
		mistakesFormat,
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

// Helper function to remove code examples from markdown
function remove_code_examples(markdown: string): string {
	// Simple approach: remove all code blocks
	return markdown.replace(/```[\s\S]*?```/g, '');
}
