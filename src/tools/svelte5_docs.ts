import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import {
	CallToolRequestSchema,
	ErrorCode,
	ListToolsRequestSchema,
	McpError,
} from '@modelcontextprotocol/sdk/types.js';

import {
	CommonMistake,
	features as docFeatures,
	mistakes as docMistakes,
	patterns as docPatterns,
	Feature,
	Pattern,
} from '../types.js';

/**
 * Registers the Svelte5 documentation tools with the MCP server
 */
export function register_svelte5_docs_tools(server: Server): void {
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
	const includeExamples = args?.includeExamples !== false;
	const stateFeatures = docFeatures.filter((f: Feature) =>
		f.name.includes('$state'),
	);

	if (!includeExamples) {
		stateFeatures.forEach((feature: Feature) => {
			feature.examples = feature.examples.slice(0, 1);
		});
	}

	return {
		content: [
			{
				type: 'text',
				text: formatFeatureAsMarkdown(
					stateFeatures,
					'State Management in Svelte 5',
				),
			},
		],
	};
}

async function handleDerivedRune(args: any = {}) {
	const includeExamples = args?.includeExamples !== false;
	const derivedFeatures = docFeatures.filter((f: Feature) =>
		f.name.includes('$derived'),
	);

	if (!includeExamples) {
		derivedFeatures.forEach((feature: Feature) => {
			feature.examples = feature.examples.slice(0, 1);
		});
	}

	return {
		content: [
			{
				type: 'text',
				text: formatFeatureAsMarkdown(
					derivedFeatures,
					'Derived Values in Svelte 5',
				),
			},
		],
	};
}

async function handlePropsRune(args: any = {}) {
	const includeExamples = args?.includeExamples !== false;
	const propsFeatures = docFeatures.filter((f: Feature) =>
		f.name.includes('$props'),
	);

	if (!includeExamples) {
		propsFeatures.forEach((feature: Feature) => {
			feature.examples = feature.examples.slice(0, 1);
		});
	}

	return {
		content: [
			{
				type: 'text',
				text: formatFeatureAsMarkdown(
					propsFeatures,
					'Props in Svelte 5',
				),
			},
		],
	};
}

async function handleEffectRune(args: any = {}) {
	const includeExamples = args?.includeExamples !== false;
	const effectFeatures = docFeatures.filter((f: Feature) =>
		f.name.includes('$effect'),
	);

	if (!includeExamples) {
		effectFeatures.forEach((feature: Feature) => {
			feature.examples = feature.examples.slice(0, 1);
		});
	}

	return {
		content: [
			{
				type: 'text',
				text: formatFeatureAsMarkdown(
					effectFeatures,
					'Side Effects in Svelte 5',
				),
			},
		],
	};
}

async function handleSnippets(args: any = {}) {
	const includeExamples = args?.includeExamples !== false;
	const snippetFeatures = docFeatures.filter(
		(f: Feature) =>
			f.name.includes('Snippet') ||
			f.description.toLowerCase().includes('snippet'),
	);

	if (!includeExamples) {
		snippetFeatures.forEach((feature: Feature) => {
			feature.examples = feature.examples.slice(0, 1);
		});
	}

	return {
		content: [
			{
				type: 'text',
				text: formatFeatureAsMarkdown(
					snippetFeatures,
					'Snippets in Svelte 5',
				),
			},
		],
	};
}

async function handleEvents(args: any = {}) {
	const includeExamples = args?.includeExamples !== false;
	const eventFeatures = docFeatures.filter(
		(f: Feature) => f.name === 'Event Handling',
	);

	if (!includeExamples) {
		eventFeatures.forEach((feature: Feature) => {
			feature.examples = feature.examples.slice(0, 1);
		});
	}

	return {
		content: [
			{
				type: 'text',
				text: formatFeatureAsMarkdown(
					eventFeatures,
					'Event Handling in Svelte 5',
				),
			},
		],
	};
}

async function handleComponentEvents(args: any = {}) {
	const includeExamples = args?.includeExamples !== false;
	const componentEventFeatures = docFeatures.filter(
		(f: Feature) => f.name === 'Component Events',
	);

	if (!includeExamples) {
		componentEventFeatures.forEach((feature: Feature) => {
			feature.examples = feature.examples.slice(0, 1);
		});
	}

	return {
		content: [
			{
				type: 'text',
				text: formatFeatureAsMarkdown(
					componentEventFeatures,
					'Component Events in Svelte 5',
				),
			},
		],
	};
}

async function handleGlobalState(args: any = {}) {
	const patterns = docPatterns;

	return {
		content: [
			{
				type: 'text',
				text: formatGlobalStateAsMarkdown(patterns),
			},
		],
	};
}

async function handleMigration(args: any = {}) {
	let filteredPatterns = docPatterns;

	if (args?.pattern) {
		const searchTerm = args.pattern.toLowerCase();
		filteredPatterns = docPatterns.filter(
			(p: Pattern) =>
				p.name.toLowerCase().includes(searchTerm) ||
				p.description.toLowerCase().includes(searchTerm),
		);
	}

	return {
		content: [
			{
				type: 'text',
				text: formatMigrationPatternsAsMarkdown(filteredPatterns),
			},
		],
	};
}

async function handleMistakes(args: any = {}) {
	let filteredMistakes = docMistakes;

	if (args?.category) {
		const searchTerm = args.category.toLowerCase();
		filteredMistakes = docMistakes.filter(
			(m: CommonMistake) =>
				m.name.toLowerCase().includes(searchTerm) ||
				m.description.toLowerCase().includes(searchTerm),
		);
	}

	return {
		content: [
			{
				type: 'text',
				text: formatMistakesAsMarkdown(filteredMistakes),
			},
		],
	};
}

async function handleOverview() {
	// This would typically call your existing generateSvelte5Overview function
	// For now, we'll create a simple overview
	const featureNames = [
		...new Set(docFeatures.map((f: Feature) => f.name)),
	];

	let markdown = `# Svelte 5 Overview\n\n`;
	markdown += `Svelte 5 introduces a new reactivity model based on "runes" - special symbols that influence how the Svelte compiler works.\n\n`;
	markdown += `## Key Features\n\n`;

	for (const name of featureNames) {
		markdown += `- ${name}\n`;
	}

	markdown += `\n## Runes\n\n`;
	markdown += `- $state - For reactive state\n`;
	markdown += `- $derived - For computed values\n`;
	markdown += `- $props - For component props\n`;
	markdown += `- $effect - For side effects\n`;

	return {
		content: [
			{
				type: 'text',
				text: markdown,
			},
		],
	};
}

async function handleRunesOverview() {
	// This would typically call your existing generateRunesOverview function
	// For now, we'll create a simple runes overview
	const runeFeatures = docFeatures.filter((f: Feature) =>
		f.name.startsWith('$'),
	);

	let markdown = `# Svelte 5 Runes Overview\n\n`;
	markdown += `Runes are special symbols in Svelte 5 that influence how the compiler works. They replace the reactive declarations and other special syntax from Svelte 4.\n\n`;
	markdown += `The main runes in Svelte 5 are:\n\n`;

	for (const rune of runeFeatures) {
		markdown += `## ${rune.name}\n\n`;
		markdown += `${rune.description}\n\n`;

		if (rune.examples && rune.examples.length > 0) {
			markdown += `### Example\n\n`;
			markdown += `\`\`\`svelte\n${rune.examples[0]}\n\`\`\`\n\n`;
		}
	}

	return {
		content: [
			{
				type: 'text',
				text: markdown,
			},
		],
	};
}

// Helper functions for formatting

function formatFeatureAsMarkdown(
	features: Feature[],
	title: string,
): string {
	let markdown = `# ${title}\n\n`;

	for (const feature of features) {
		markdown += `## ${feature.name}\n\n${feature.description}\n\n`;

		if (feature.examples && feature.examples.length > 0) {
			markdown += `### Examples\n\n`;
			feature.examples.forEach((example) => {
				markdown += `\`\`\`svelte\n${example}\n\`\`\`\n\n`;
			});
		}

		if (feature.bestPractices && feature.bestPractices.length > 0) {
			markdown += `### Best Practices\n\n`;
			feature.bestPractices.forEach((practice) => {
				markdown += `- ${practice}\n`;
			});
			markdown += '\n';
		}
	}

	return markdown;
}

function formatGlobalStateAsMarkdown(patterns: Pattern[]): string {
	let markdown = `# Global State Patterns in Svelte 5\n\n`;

	for (const pattern of patterns) {
		markdown += `## ${pattern.name}\n\n${pattern.description}\n\n`;

		if (pattern.examples && pattern.examples.length > 0) {
			markdown += `### Examples\n\n`;
			pattern.examples.forEach((example) => {
				markdown += `\`\`\`svelte\n${example}\n\`\`\`\n\n`;
			});
		}

		if (pattern.bestPractices && pattern.bestPractices.length > 0) {
			markdown += `### Best Practices\n\n`;
			pattern.bestPractices.forEach((practice) => {
				markdown += `- ${practice}\n`;
			});
			markdown += '\n';
		}
	}

	return markdown;
}

function formatMigrationPatternsAsMarkdown(
	patterns: Pattern[],
): string {
	let markdown = `# Svelte 4 to Svelte 5 Migration Patterns\n\n`;

	if (patterns.length === 0) {
		markdown += `No migration patterns found matching the search criteria.\n\n`;
		return markdown;
	}

	for (const pattern of patterns) {
		markdown += `## ${pattern.name}\n\n${pattern.description}\n\n`;

		if (pattern.examples && pattern.examples.length > 0) {
			markdown += `### Examples\n\n`;
			pattern.examples.forEach((example) => {
				markdown += `\`\`\`svelte\n${example}\n\`\`\`\n\n`;
			});
		}

		if (pattern.bestPractices && pattern.bestPractices.length > 0) {
			markdown += `### Best Practices\n\n`;
			pattern.bestPractices.forEach((practice) => {
				markdown += `- ${practice}\n`;
			});
			markdown += '\n';
		}
	}

	return markdown;
}

function formatMistakesAsMarkdown(mistakes: CommonMistake[]): string {
	let markdown = `# Common Mistakes in Svelte 5\n\n`;

	if (mistakes.length === 0) {
		markdown += `No common mistakes found matching the search criteria.\n\n`;
		return markdown;
	}

	for (const mistake of mistakes) {
		markdown += `## ${mistake.name}\n\n${mistake.description}\n\n`;

		markdown += `### Incorrect\n\`\`\`svelte\n${mistake.mistake}\n\`\`\`\n\n`;
		markdown += `### Correct\n\`\`\`svelte\n${mistake.correction}\n\`\`\`\n\n`;
		markdown += `### Explanation\n${mistake.explanation}\n\n`;
	}

	return markdown;
}
