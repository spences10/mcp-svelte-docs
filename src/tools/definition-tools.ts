import { McpServer } from 'tmcp';
import * as v from 'valibot';

import {
	DefinitionItem,
	get_all_identifiers,
	get_definition_by_identifier,
	load_definitions,
	suggest_similar_identifiers,
} from '../db-definition-loader.js';

// Load all definitions
let definitions: DefinitionItem[] = [];

// Input validation schema
const DefinitionSchema = v.object({
	identifier: v.pipe(
		v.string(),
		v.minLength(1),
		v.description(
			'Svelte 5 identifier: $state, $derived, $props, $effect, snippets, onclick, component-events',
		),
	),
	format: v.pipe(
		v.optional(v.picklist(['syntax', 'quick', 'full']), 'full'),
		v.description(
			'Output detail level: "syntax" (signature only), "quick" (with example), "full" (complete docs)',
		),
	),
});

type FormatType = 'syntax' | 'quick' | 'full';

/**
 * Format definition content based on the requested format
 */
function format_definition_content(
	content: string,
	format: FormatType,
): string {
	switch (format) {
		case 'syntax':
			return extract_syntax_only(content);
		case 'quick':
			return extract_definition_and_example(content);
		case 'full':
		default:
			return content;
	}
}

/**
 * Extract just the syntax information from a definition
 */
function extract_syntax_only(content: string): string {
	const lines = content.split('\n');
	const syntax_lines: string[] = [];

	// Include title
	const title_line = lines.find((line) => line.startsWith('# '));
	if (title_line) {
		syntax_lines.push(title_line);
		syntax_lines.push('');
	}

	// Extract key definition lines
	for (const line of lines) {
		if (
			line.startsWith('**Definition:**') ||
			line.startsWith('**Syntax:**') ||
			line.startsWith('**Parameters:**') ||
			line.startsWith('**Returns:**') ||
			line.startsWith('**Variants:**') ||
			line.startsWith('**Pattern:**') ||
			line.startsWith('**Interface:**') ||
			line.startsWith('**Examples:**')
		) {
			syntax_lines.push(line);
		}
		// Include bullet points under these sections
		else if (line.startsWith('- ') && syntax_lines.length > 0) {
			syntax_lines.push(line);
		}
		// Include code blocks that look like syntax
		else if (
			line.startsWith('```') ||
			line.includes('$state') ||
			line.includes('$derived') ||
			line.includes('$props') ||
			line.includes('$effect')
		) {
			syntax_lines.push(line);
		}
	}

	return syntax_lines.join('\n').trim();
}

/**
 * Extract definition and a minimal example
 */
function extract_definition_and_example(content: string): string {
	const lines = content.split('\n');
	const quick_lines: string[] = [];
	let in_examples = false;
	let example_lines = 0;

	for (const line of lines) {
		// Always include title and definition sections
		if (
			line.startsWith('# ') ||
			line.startsWith('**Definition:**') ||
			line.startsWith('**Syntax:**') ||
			line.startsWith('**Parameters:**') ||
			line.startsWith('**Returns:**') ||
			line.startsWith('**Variants:**') ||
			line.startsWith('**Pattern:**') ||
			line.startsWith('**Interface:**') ||
			line.startsWith('- ')
		) {
			quick_lines.push(line);
		}
		// Start including examples but limit them
		else if (line.startsWith('## Examples')) {
			in_examples = true;
			quick_lines.push(line);
		}
		// Stop at Related section
		else if (line.startsWith('## Related')) {
			break;
		}
		// Include limited examples
		else if (in_examples && example_lines < 15) {
			quick_lines.push(line);
			if (line.trim()) {
				example_lines++;
			}
		}
	}

	return quick_lines.join('\n').trim();
}

/**
 * Create error message with helpful suggestions
 */
function create_definition_error(
	identifier: string,
	definitions: DefinitionItem[],
): Error {
	const suggestions = suggest_similar_identifiers(identifier);
	const all_identifiers = get_all_identifiers();

	let error_message = `Definition for '${identifier}' not found.`;

	if (suggestions.length > 0) {
		error_message += `\n\nDid you mean:\n${suggestions.map((s) => `• ${s}`).join('\n')}`;
	}

	// Add category-based suggestions
	const category_suggestions: string[] = [];
	if (
		identifier.startsWith('$') ||
		identifier.includes('state') ||
		identifier.includes('derived')
	) {
		category_suggestions.push(
			'Runes: $state, $derived, $props, $effect',
		);
	}
	if (identifier.includes('click') || identifier.includes('event')) {
		category_suggestions.push('Events: onclick, component-events');
	}
	if (identifier.includes('snippet') || identifier.includes('slot')) {
		category_suggestions.push('Features: snippets');
	}

	if (category_suggestions.length > 0) {
		error_message += `\n\nRelated categories:\n${category_suggestions.map((s) => `• ${s}`).join('\n')}`;
	}

	// Show available identifiers if not too many
	if (all_identifiers.length <= 20) {
		error_message += `\n\nAvailable identifiers:\n${all_identifiers.map((s) => `• ${s}`).join('\n')}`;
	} else {
		error_message += `\n\nUse format="syntax" for quicker responses, or try: $state, $derived, $props, $effect, snippets, onclick, component-events`;
	}

	return new Error(error_message);
}

/**
 * Handle definition lookup requests
 */
async function definition_handler(args: any) {
	try {
		// Validate input
		const { identifier, format = 'full' } = v.parse(
			DefinitionSchema,
			args,
		);

		// Find the definition
		const definition = get_definition_by_identifier(identifier);

		if (!definition) {
			throw create_definition_error(identifier, definitions);
		}

		// Validate that definition content exists
		if (
			!definition.content ||
			definition.content.trim().length === 0
		) {
			throw new Error(
				`Definition for '${identifier}' exists but appears to be empty. Please try again later or contact support.`,
			);
		}

		// Format the content based on requested format
		const formatted_content = format_definition_content(
			definition.content,
			format,
		);

		// Add format info for context
		let response_content = formatted_content;
		if (format === 'syntax') {
			response_content += `\n\n*Use format="quick" or format="full" for more details.*`;
		} else if (format === 'quick') {
			response_content += `\n\n*Use format="full" for complete documentation.*`;
		}

		return {
			content: [
				{
					type: 'text' as const,
					text: response_content,
				},
			],
		};
	} catch (error) {
		// Re-throw with additional context for debugging
		const errorMessage =
			error instanceof Error
				? error.message
				: 'Unknown error occurred';
		throw new Error(`Error in svelte_definition: ${errorMessage}`);
	}
}

/**
 * Register the definition tool with the MCP server
 *
 * This single tool replaces 13+ specialized tools with a unified interface
 * that provides authoritative, TypeScript-based Svelte 5 definitions.
 *
 * Usage Examples:
 *
 * Core runes:
 * - svelte_definition({ identifier: "$state" })
 * - svelte_definition({ identifier: "$derived" })
 * - svelte_definition({ identifier: "$props" })
 * - svelte_definition({ identifier: "$effect" })
 *
 * Features:
 * - svelte_definition({ identifier: "snippets" })
 * - svelte_definition({ identifier: "onclick" })
 * - svelte_definition({ identifier: "component-events" })
 *
 * Format control:
 * - svelte_definition({ identifier: "$state", format: "syntax" })    // ~50 words
 * - svelte_definition({ identifier: "$state", format: "quick" })     // ~200 words
 * - svelte_definition({ identifier: "$state", format: "full" })      // ~500-1000 words
 *
 * Error handling:
 * - svelte_definition({ identifier: "$sate" })  // → "Did you mean $state?"
 * - svelte_definition({ identifier: "unknown" }) // → Lists available definitions
 */
export function register_definition_tools(
	server: McpServer<any>,
): void {
	// Load all definitions
	definitions = load_definitions();

	if (definitions.length === 0) {
		console.warn(
			'Warning: No definitions loaded. Definition tool will not work properly.',
		);
	} else {
		console.log(
			`Loaded ${definitions.length} definitions:`,
			get_all_identifiers(),
		);
	}

	// Register the single definition tool
	server.tool<typeof DefinitionSchema>(
		{
			name: 'svelte_definition',
			description:
				'Lookup Svelte 5 & SvelteKit definitions from TypeScript declarations. Covers all runes ($state, $derived, $props, $effect), features (snippets, onclick, component-events), and patterns. Supports syntax/quick/full format for varying detail levels.',
			schema: DefinitionSchema,
		},
		definition_handler,
	);
}
