import { readFileSync, readdirSync } from 'fs';
import { join } from 'path';
import {
	CodeCategory,
	CodeExample,
	Difficulty,
	ProcessedMarkdown,
} from '../types.js';

interface ExtractedCode {
	language: string;
	code: string;
	description: string;
	category?: CodeCategory;
	runes?: string[];
	functions?: string[];
	components?: string[];
}

// Svelte 5 rune patterns
const RUNE_PATTERNS = {
	state: /\$state\((.*?)\)/g,
	derived: /\$derived\((.*?)\)/g,
	effect: /\$effect\((.*?)\)/g,
	props: /\$props\((.*?)\)/g,
	signals: /\$signal\((.*?)\)/g,
};

// Code categories based on content
const CODE_CATEGORIES: Record<CodeCategory, string[]> = {
	state_management: ['$state', '$derived', 'store', 'writable'],
	effects: ['$effect', 'onMount', 'onDestroy', 'afterUpdate'],
	components: [
		'export function',
		'export default function',
		'<script>',
		'props',
	],
	events: [
		'on:click',
		'on:input',
		'dispatch',
		'createEventDispatcher',
	],
	routing: ['@sveltejs/kit', 'page', 'params', 'load'],
	security: ['@sveltejs/kit/server', 'handle', 'csrf', 'headers'],
	general: [],
};

function detect_runes(code: string): string[] {
	const runes = new Set<string>();

	for (const [rune, pattern] of Object.entries(RUNE_PATTERNS)) {
		if (pattern.test(code)) {
			runes.add(rune);
		}
	}

	return Array.from(runes);
}

function detect_category(
	code: string,
	description: string,
): CodeCategory {
	const combined = `${code} ${description}`.toLowerCase();

	for (const [category, patterns] of Object.entries(
		CODE_CATEGORIES,
	)) {
		if (
			patterns.some((pattern) =>
				combined.includes(pattern.toLowerCase()),
			)
		) {
			return category as CodeCategory;
		}
	}

	return 'general';
}

function extract_functions(code: string): string[] {
	const functions = new Set<string>();

	// Match function declarations
	const func_regex =
		/(?:export\s+)?(?:async\s+)?function\s+([a-zA-Z_$][a-zA-Z0-9_$]*)/g;
	let match;
	while ((match = func_regex.exec(code)) !== null) {
		functions.add(match[1]);
	}

	// Match arrow functions with explicit names
	const arrow_regex =
		/const\s+([a-zA-Z_$][a-zA-Z0-9_$]*)\s*=\s*(?:async\s*)?\(/g;
	while ((match = arrow_regex.exec(code)) !== null) {
		functions.add(match[1]);
	}

	return Array.from(functions);
}

function extract_components(code: string): string[] {
	const components = new Set<string>();

	// Match component imports
	const import_regex = /import\s+([A-Z][a-zA-Z0-9_$]*)/g;
	let match;
	while ((match = import_regex.exec(code)) !== null) {
		components.add(match[1]);
	}

	// Match component usage in JSX/TSX
	const usage_regex = /<([A-Z][a-zA-Z0-9_$]*)/g;
	while ((match = usage_regex.exec(code)) !== null) {
		components.add(match[1]);
	}

	return Array.from(components);
}

function extract_code_blocks(content: string): ExtractedCode[] {
	const code_blocks: ExtractedCode[] = [];
	const regex = /```(\w+)?\n([\s\S]*?)```(?:\n*(.*?)(?=\n|$))?/g;

	let match;
	while ((match = regex.exec(content)) !== null) {
		const [_, language = '', code, description = ''] = match;
		const trimmed_code = code.trim();

		code_blocks.push({
			language: language.trim(),
			code: trimmed_code,
			description: description.trim(),
			category: detect_category(trimmed_code, description),
			runes: detect_runes(trimmed_code),
			functions: extract_functions(trimmed_code),
			components: extract_components(trimmed_code),
		});
	}

	return code_blocks;
}

function determine_difficulty(content: string): Difficulty {
	const lower_content = content.toLowerCase();

	// Check for explicit difficulty markers
	if (
		lower_content.includes('advanced') ||
		lower_content.includes('complex')
	) {
		return 'advanced';
	}
	if (
		lower_content.includes('beginner') ||
		lower_content.includes('basic')
	) {
		return 'beginner';
	}

	// Infer from content complexity
	const code_blocks = extract_code_blocks(content);
	const has_complex_patterns =
		lower_content.includes('recursive') ||
		lower_content.includes('optimization') ||
		lower_content.includes('advanced patterns');

	if (has_complex_patterns || code_blocks.length > 3) {
		return 'advanced';
	}

	return 'intermediate';
}

function extract_tags(content: string): string[] {
	const tags = new Set<string>();

	// Extract from headers
	const headers = content.match(/^#+\s+(.+)$/gm) || [];
	headers.forEach((header) => {
		const words = header
			.replace(/^#+\s+/, '')
			.toLowerCase()
			.split(/\W+/);
		words.forEach((word) => {
			if (word.length > 3) tags.add(word);
		});
	});

	// Extract from code examples
	const code_blocks = extract_code_blocks(content);
	code_blocks.forEach((block) => {
		// Add language
		if (block.language) tags.add(block.language);

		// Add runes
		block.runes?.forEach((rune) => tags.add(rune));

		// Add category
		if (block.category) tags.add(block.category);

		// Add component names
		block.components?.forEach((component) =>
			tags.add(`component:${component}`),
		);
	});

	// Add common Svelte concepts
	const concepts = [
		'runes',
		'state',
		'props',
		'effects',
		'snippets',
		'components',
	];
	concepts.forEach((concept) => {
		if (content.toLowerCase().includes(concept)) {
			tags.add(concept);
		}
	});

	return Array.from(tags);
}

function extract_related_concepts(content: string): string[] {
	const concepts = new Set<string>();

	// Look for "See also" or "Related" sections
	const related_section =
		content.match(/(?:See also|Related)[\s\S]*?(?=\n#|$)/i)?.[0] ||
		'';
	const links = related_section.match(/\[(.*?)\]/g) || [];
	links.forEach((link) => {
		concepts.add(link.replace(/[\[\]]/g, '').toLowerCase());
	});

	// Look for inline references
	const inline_refs =
		content.match(/(?:see|using|with)\s+`([^`]+)`/g) || [];
	inline_refs.forEach((ref) => {
		concepts.add(
			ref
				.replace(/(?:see|using|with)\s+`([^`]+)`/g, '$1')
				.toLowerCase(),
		);
	});

	return Array.from(concepts);
}

function generate_query_patterns(
	content: string,
): { pattern: string; context?: string }[] {
	const patterns: { pattern: string; context?: string }[] = [];

	// Extract questions from content
	const questions =
		content.match(/(?:\?|How|What|When|Why|Which).*?\?/g) || [];
	questions.forEach((q) => {
		patterns.push({
			pattern: q.trim(),
			context: 'Direct question from documentation',
		});
	});

	// Generate patterns from headers
	const headers = content.match(/^#+\s+(.+)$/gm) || [];
	headers.forEach((header) => {
		const text = header.replace(/^#+\s+/, '');
		patterns.push({
			pattern: `How do I use ${text}?`,
			context: 'Generated from section header',
		});
		patterns.push({
			pattern: `What is ${text}?`,
			context: 'Generated from section header',
		});
	});

	// Generate patterns from code examples
	const code_blocks = extract_code_blocks(content);
	code_blocks.forEach((block) => {
		if (block.description) {
			patterns.push({
				pattern: `How do I ${block.description}?`,
				context: 'Generated from code example',
			});
		}
	});

	return patterns;
}

export async function process_markdown_file(
	filepath: string,
): Promise<ProcessedMarkdown> {
	const content = readFileSync(filepath, 'utf-8');

	// Extract the main concept from the filename
	const filename =
		filepath.split('/').pop()?.replace('.md', '') || '';
	const concept = filename.replace(/-/g, ' ');

	// Extract code examples
	const code_blocks = extract_code_blocks(content);
	const code_examples: CodeExample[] = code_blocks.map((block) => ({
		language: block.language,
		code: block.code,
		description: block.description,
		category: block.category || 'general',
		runes: block.runes || [],
		functions: block.functions || [],
		components: block.components || [],
	}));

	// Process the content
	const processed: ProcessedMarkdown = {
		concept,
		content,
		code_examples,
		difficulty: determine_difficulty(content),
		tags: extract_tags(content),
		related_concepts: extract_related_concepts(content),
		common_patterns: generate_query_patterns(content),
	};

	return processed;
}

export async function process_markdown_directory(
	dir_path: string,
): Promise<ProcessedMarkdown[]> {
	console.error(`Processing markdown files from ${dir_path}`);

	try {
		const files = readdirSync(dir_path)
			.filter((file) => file.endsWith('.md'))
			.map((file) => join(dir_path, file));

		console.error(`Found ${files.length} markdown files`);

		if (files.length === 0) {
			console.error('Directory contents:', readdirSync(dir_path));
			throw new Error('No markdown files found in directory');
		}

		const results: ProcessedMarkdown[] = [];
		for (const file of files) {
			try {
				console.error(`Processing ${file}`);
				const processed = await process_markdown_file(file);
				results.push(processed);
				console.error(`Successfully processed ${file}`);
			} catch (error) {
				console.error(`Error processing ${file}:`, error);
				throw error;
			}
		}

		console.error(
			`Successfully processed ${results.length} markdown files`,
		);
		return results;
	} catch (error) {
		console.error('Error processing markdown directory:', error);
		throw error;
	}
}
