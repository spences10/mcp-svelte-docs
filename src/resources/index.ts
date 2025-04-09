import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import {
	ErrorCode,
	ListResourcesRequestSchema,
	ListResourceTemplatesRequestSchema,
	McpError,
	ReadResourceRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';

import {
	get_common_mistakes,
	get_global_state_patterns,
	get_svelte5_features,
} from '../patterns/index.js';

/**
 * Registers all resources with the MCP server
 * @param server The MCP server
 */
export function register_resources(server: Server): void {
	// Register direct resources
	server.setRequestHandler(ListResourcesRequestSchema, async () => ({
		resources: [
			{
				uri: 'svelte5://overview',
				name: 'Svelte 5 Overview',
				description: 'Overview of Svelte 5 features and changes',
				mimeType: 'text/plain',
			},
			{
				uri: 'svelte5://runes/overview',
				name: 'Runes Overview',
				description: 'Overview of all runes in Svelte 5',
				mimeType: 'text/plain',
			},
			{
				uri: 'svelte5://snippets/overview',
				name: 'Snippets Overview',
				description: 'Overview of snippets in Svelte 5',
				mimeType: 'text/plain',
			},
			{
				uri: 'svelte5://global-state/overview',
				name: 'Global State Overview',
				description:
					'Overview of global state approaches in Svelte 5',
				mimeType: 'text/plain',
			},
		],
	}));

	// Register resource templates
	server.setRequestHandler(
		ListResourceTemplatesRequestSchema,
		async () => ({
			resourceTemplates: [
				{
					uriTemplate: 'svelte5://runes/{rune_name}',
					name: 'Rune Reference',
					description: 'Detailed reference for a specific rune',
					mimeType: 'text/plain',
				},
				{
					uriTemplate: 'svelte5://patterns/{category}/{pattern_name}',
					name: 'Pattern Reference',
					description: 'Reference for a specific Svelte pattern',
					mimeType: 'text/plain',
				},
				{
					uriTemplate: 'svelte5://mistakes/{category}',
					name: 'Common Mistakes',
					description: 'Common mistakes for a specific category',
					mimeType: 'text/plain',
				},
			],
		}),
	);

	// Register resource reader
	server.setRequestHandler(
		ReadResourceRequestSchema,
		async (request) => {
			const uri = request.params.uri;

			// Handle overview resources
			if (uri === 'svelte5://overview') {
				return {
					contents: [
						{
							uri,
							mimeType: 'text/plain',
							text: generateSvelte5Overview(),
						},
					],
				};
			} else if (uri === 'svelte5://runes/overview') {
				return {
					contents: [
						{
							uri,
							mimeType: 'text/plain',
							text: generateRunesOverview(),
						},
					],
				};
			} else if (uri === 'svelte5://snippets/overview') {
				return {
					contents: [
						{
							uri,
							mimeType: 'text/plain',
							text: generateSnippetsOverview(),
						},
					],
				};
			} else if (uri === 'svelte5://global-state/overview') {
				return {
					contents: [
						{
							uri,
							mimeType: 'text/plain',
							text: generateGlobalStateOverview(),
						},
					],
				};
			}

			// Handle rune resources
			const runeMatch = uri.match(/^svelte5:\/\/runes\/(.+)$/);
			if (runeMatch) {
				const runeName = runeMatch[1];
				return {
					contents: [
						{
							uri,
							mimeType: 'text/plain',
							text: generateRuneReference(runeName),
						},
					],
				};
			}

			// Handle pattern resources
			const patternMatch = uri.match(
				/^svelte5:\/\/patterns\/(.+)\/(.+)$/,
			);
			if (patternMatch) {
				const category = patternMatch[1];
				const patternName = patternMatch[2];
				return {
					contents: [
						{
							uri,
							mimeType: 'text/plain',
							text: generatePatternReference(category, patternName),
						},
					],
				};
			}

			// Handle mistake resources
			const mistakeMatch = uri.match(/^svelte5:\/\/mistakes\/(.+)$/);
			if (mistakeMatch) {
				const category = mistakeMatch[1];
				return {
					contents: [
						{
							uri,
							mimeType: 'text/plain',
							text: generateMistakeReference(category),
						},
					],
				};
			}

			// Resource not found
			throw new McpError(
				ErrorCode.InvalidRequest,
				`Resource not found: ${uri}`,
			);
		},
	);
}

/**
 * Generate Svelte 5 overview content
 * @returns Overview content
 */
function generateSvelte5Overview(): string {
	return `# Svelte 5 Overview

Svelte 5 introduces a new reactivity system based on "runes" - special symbols that instruct the compiler to add reactivity to variables, derived values, and effects.

## Key Features

### Runes
- $state - Declare reactive state
- $derived - Compute values based on state
- $effect - Run side effects when state changes
- $props - Declare component props

### Snippets
Snippets are a new feature that replaces slots, allowing for more flexible and powerful component composition.

### Event Handling
Event handlers now use standard HTML attributes (onclick) instead of the directive syntax (on:click).

### Props
Props are now declared using the $props rune instead of export let.

### Global State
Svelte 5 provides several approaches to global state management, including function-based, object-based, class-based, and context-based approaches.

## Migration from Svelte 4

If you're migrating from Svelte 4, you'll need to:
- Replace top-level let declarations with $state
- Replace $: reactive declarations with $derived
- Replace $: blocks with $effect
- Replace on:event with onevent
- Replace export let with $props
- Replace createEventDispatcher with callback props

For more details on specific features, see the relevant resources.`;
}

/**
 * Generate runes overview content
 * @returns Runes overview content
 */
function generateRunesOverview(): string {
	const features = get_svelte5_features();
	const runeFeatures = features.filter(
		(f) =>
			f.name.startsWith('$') ||
			f.name === 'Runes' ||
			f.description.includes('rune'),
	);

	let content = `# Svelte 5 Runes Overview

Runes are special symbols that instruct the compiler to add reactivity to variables, derived values, and effects. They are the foundation of Svelte 5's reactivity system.

## Available Runes

`;

	for (const feature of runeFeatures) {
		content += `### ${feature.name}\n${feature.description}\n\n`;

		if (feature.bestPractices && feature.bestPractices.length > 0) {
			content += '**Best Practices:**\n';
			for (const practice of feature.bestPractices) {
				content += `- ${practice}\n`;
			}
			content += '\n';
		}
	}

	return content;
}

/**
 * Generate snippets overview content
 * @returns Snippets overview content
 */
function generateSnippetsOverview(): string {
	const features = get_svelte5_features();
	const snippetsFeature = features.find((f) => f.name === 'Snippets');

	if (!snippetsFeature) {
		return `# Svelte 5 Snippets Overview

Snippets are a new feature in Svelte 5 that allow you to define reusable chunks of markup inside your components.

## Basic Usage

\`\`\`svelte
{#snippet figure(image)}
<figure>
  <img
    src={image.src}
    alt={image.caption}
    width={image.width}
    height={image.height}
  />
  <figcaption>{image.caption}</figcaption>
</figure>
{/snippet}

{@render figure(headerImage)}
\`\`\`

## Best Practices

- Use snippets to reduce duplication in your templates
- Snippets can be passed as props to components
- Snippets have lexical scoping rules - they are only visible in the same scope they are defined in
- Use parameters to make snippets more flexible
- Snippets can reference other snippets and even themselves (for recursion)
`;
	}

	let content = `# Svelte 5 Snippets Overview

${snippetsFeature.description}

## Examples

`;

	for (const example of snippetsFeature.examples) {
		content += `### Example\n\`\`\`svelte\n${example.code}\n\`\`\`\n\n${example.explanation}\n\n`;
	}

	content += '## Best Practices\n\n';
	for (const practice of snippetsFeature.bestPractices) {
		content += `- ${practice}\n`;
	}

	return content;
}

/**
 * Generate global state overview content
 * @returns Global state overview content
 */
function generateGlobalStateOverview(): string {
	const patterns = get_global_state_patterns();

	let content = `# Svelte 5 Global State Overview

Svelte 5 provides several approaches to global state management, each with its own advantages and trade-offs.

## Approaches

`;

	for (const pattern of patterns) {
		content += `### ${pattern.name}\n${pattern.description}\n\n`;
		content += `**Implementation:**\n\`\`\`typescript\n${pattern.code}\n\`\`\`\n\n`;
		content += `**Usage:**\n\`\`\`svelte\n${pattern.usage}\n\`\`\`\n\n`;
		content += `**Notes:**\n${pattern.notes}\n\n`;
	}

	return content;
}

/**
 * Generate rune reference content
 * @param runeName Rune name
 * @returns Rune reference content
 */
function generateRuneReference(runeName: string): string {
	const features = get_svelte5_features();
	const runeFeature = features.find(
		(f) =>
			f.name.toLowerCase() === `$${runeName}`.toLowerCase() ||
			f.name.toLowerCase() === runeName.toLowerCase(),
	);

	if (!runeFeature) {
		throw new McpError(
			ErrorCode.InvalidRequest,
			`Rune not found: ${runeName}`,
		);
	}

	let content = `# ${runeFeature.name}

${runeFeature.description}

## Examples

`;

	for (const example of runeFeature.examples) {
		content += `### Example\n\`\`\`svelte\n${example.code}\n\`\`\`\n\n${example.explanation}\n\n`;
	}

	content += '## Best Practices\n\n';
	for (const practice of runeFeature.bestPractices) {
		content += `- ${practice}\n`;
	}

	return content;
}

/**
 * Generate pattern reference content
 * @param category Pattern category
 * @param patternName Pattern name
 * @returns Pattern reference content
 */
function generatePatternReference(
	category: string,
	patternName: string,
): string {
	// This is a placeholder for now
	// In a real implementation, you would look up the pattern in the database
	return `# ${patternName} (${category})

This is a placeholder for the ${patternName} pattern in the ${category} category.

## Implementation

\`\`\`svelte
// Implementation details would go here
\`\`\`

## Usage

\`\`\`svelte
// Usage examples would go here
\`\`\`

## Notes

Additional notes and considerations would go here.
`;
}

/**
 * Generate mistake reference content
 * @param category Mistake category
 * @returns Mistake reference content
 */
function generateMistakeReference(category: string): string {
	const mistakes = get_common_mistakes();
	const categoryMistakes = mistakes.filter(
		(m) =>
			m.name.toLowerCase().includes(category.toLowerCase()) ||
			m.description.toLowerCase().includes(category.toLowerCase()),
	);

	if (categoryMistakes.length === 0) {
		throw new McpError(
			ErrorCode.InvalidRequest,
			`Mistake category not found: ${category}`,
		);
	}

	let content = `# Common Mistakes: ${category}

This resource lists common mistakes related to ${category} in Svelte 5 and how to correct them.

`;

	for (const mistake of categoryMistakes) {
		content += `## ${mistake.name}\n${mistake.description}\n\n`;
		content += `**Mistake:**\n\`\`\`svelte\n${mistake.mistake}\n\`\`\`\n\n`;
		content += `**Correction:**\n\`\`\`svelte\n${mistake.correction}\n\`\`\`\n\n`;
		content += `**Explanation:**\n${mistake.explanation}\n\n`;
	}

	return content;
}
