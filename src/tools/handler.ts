import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import {
	CallToolRequestSchema,
	ErrorCode,
	ListToolsRequestSchema,
	McpError,
} from '@modelcontextprotocol/sdk/types.js';

import {
	get_common_mistakes,
	get_patterns,
	get_svelte5_features,
} from '../patterns/index.js';

/**
 * Interface for pattern search arguments
 */
interface PatternSearchArgs {
	pattern: string;
}

/**
 * Interface for feature search arguments
 */
interface FeatureSearchArgs {
	feature: string;
	includeExamples?: boolean;
}

/**
 * Interface for mistake search arguments
 */
interface MistakeSearchArgs {
	feature: string;
}

/**
 * Validates that the arguments match the PatternSearchArgs interface
 * @param args The arguments to validate
 * @returns Whether the arguments are valid
 */
function is_valid_pattern_args(args: any): args is PatternSearchArgs {
	return (
		typeof args === 'object' &&
		args !== null &&
		typeof args.pattern === 'string'
	);
}

/**
 * Validates that the arguments match the FeatureSearchArgs interface
 * @param args The arguments to validate
 * @returns Whether the arguments are valid
 */
function is_valid_feature_args(args: any): args is FeatureSearchArgs {
	return (
		typeof args === 'object' &&
		args !== null &&
		typeof args.feature === 'string' &&
		(args.includeExamples === undefined ||
			typeof args.includeExamples === 'boolean')
	);
}

/**
 * Validates that the arguments match the MistakeSearchArgs interface
 * @param args The arguments to validate
 * @returns Whether the arguments are valid
 */
function is_valid_mistake_args(args: any): args is MistakeSearchArgs {
	return (
		typeof args === 'object' &&
		args !== null &&
		typeof args.feature === 'string'
	);
}

/**
 * Registers all tools with the MCP server
 * @param server The MCP server
 */
export function register_tools(server: Server): void {
	// Register the tool list
	server.setRequestHandler(ListToolsRequestSchema, async () => ({
		tools: [
			{
				name: 'svelte_pattern',
				description: 'Get Svelte 4 to Svelte 5 migration patterns',
				inputSchema: {
					type: 'object',
					properties: {
						pattern: {
							type: 'string',
							description: 'Pattern name or category to search for',
						},
					},
					required: ['pattern'],
				},
			},
			{
				name: 'svelte5_feature',
				description:
					'Get detailed information about Svelte 5 features',
				inputSchema: {
					type: 'object',
					properties: {
						feature: {
							type: 'string',
							description:
								'Feature name (e.g., "runes", "snippets", "props")',
						},
						includeExamples: {
							type: 'boolean',
							description: 'Whether to include code examples',
						},
					},
					required: ['feature'],
				},
			},
			{
				name: 'svelte5_common_mistakes',
				description:
					'Get common mistakes and corrections for Svelte 5 features',
				inputSchema: {
					type: 'object',
					properties: {
						feature: {
							type: 'string',
							description:
								'Feature name (e.g., "runes", "snippets", "events")',
						},
					},
					required: ['feature'],
				},
			},
		],
	}));

	// Register the tool handler
	server.setRequestHandler(CallToolRequestSchema, async (request) => {
		const toolName = request.params.name;

		// Handle svelte_pattern tool
		if (toolName === 'svelte_pattern') {
			if (!is_valid_pattern_args(request.params.arguments)) {
				throw new McpError(
					ErrorCode.InvalidParams,
					'Invalid pattern arguments',
				);
			}

			const { pattern } = request.params.arguments;

			// Get all patterns
			const all_patterns = get_patterns();

			// Find matching patterns
			const matches = all_patterns.filter(
				(p) =>
					p.name.toLowerCase().includes(pattern.toLowerCase()) ||
					p.description.toLowerCase().includes(pattern.toLowerCase()),
			);

			if (matches.length === 0) {
				return {
					content: [
						{
							type: 'text',
							text: `No patterns found matching "${pattern}"`,
						},
					],
				};
			}

			return {
				content: [
					{
						type: 'text',
						text: JSON.stringify({ patterns: matches }, null, 2),
					},
				],
			};
		}

		// Handle svelte5_feature tool
		else if (toolName === 'svelte5_feature') {
			if (!is_valid_feature_args(request.params.arguments)) {
				throw new McpError(
					ErrorCode.InvalidParams,
					'Invalid feature arguments',
				);
			}

			const { feature, includeExamples = true } =
				request.params.arguments;

			// Get all features
			const all_features = get_svelte5_features();

			// Find matching features
			const matches = all_features.filter(
				(f) =>
					f.name.toLowerCase().includes(feature.toLowerCase()) ||
					f.description.toLowerCase().includes(feature.toLowerCase()),
			);

			if (matches.length === 0) {
				return {
					content: [
						{
							type: 'text',
							text: `No features found matching "${feature}"`,
						},
					],
				};
			}

			// If includeExamples is false, remove examples from the response
			const result = includeExamples
				? matches
				: matches.map(({ examples, ...rest }) => ({
						...rest,
						examples: examples.length > 0 ? [examples[0]] : [],
				  }));

			return {
				content: [
					{
						type: 'text',
						text: JSON.stringify({ features: result }, null, 2),
					},
				],
			};
		}

		// Handle svelte5_common_mistakes tool
		else if (toolName === 'svelte5_common_mistakes') {
			if (!is_valid_mistake_args(request.params.arguments)) {
				throw new McpError(
					ErrorCode.InvalidParams,
					'Invalid mistake arguments',
				);
			}

			const { feature } = request.params.arguments;

			// Get all mistakes
			const all_mistakes = get_common_mistakes();

			// Find matching mistakes
			const matches = all_mistakes.filter(
				(m) =>
					m.name.toLowerCase().includes(feature.toLowerCase()) ||
					m.description.toLowerCase().includes(feature.toLowerCase()),
			);

			if (matches.length === 0) {
				return {
					content: [
						{
							type: 'text',
							text: `No common mistakes found matching "${feature}"`,
						},
					],
				};
			}

			return {
				content: [
					{
						type: 'text',
						text: JSON.stringify({ mistakes: matches }, null, 2),
					},
				],
			};
		}

		// Handle unknown tool
		else {
			throw new McpError(
				ErrorCode.MethodNotFound,
				`Unknown tool: ${toolName}`,
			);
		}
	});
}
