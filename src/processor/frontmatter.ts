import { readFile, writeFile } from 'fs/promises';
import { glob } from 'glob';
import matter from 'gray-matter';
import path from 'path';

export type DocMetadata = {
	title: string;
	description: string;
	category: string;
	tags: string[];
	related: string[];
	code_categories: string[];
	difficulty: 'beginner' | 'intermediate' | 'advanced';
	last_updated: string;
};

export const format_multiline = (text: string): string => {
	// If text contains newlines, use block literal style
	if (text.includes('\n')) {
		return `|-\n${text
			.split('\n')
			.map((line) => `  ${line}`)
			.join('\n')}`;
	}
	return text;
};

export const format_frontmatter = (
	frontmatter: Record<string, any>,
): Record<string, any> => {
	const formatted = { ...frontmatter };

	// Always quote the title to be safe
	if (formatted.title) {
		const escaped_title = formatted.title.replace(/"/g, '\\"');
		formatted.title = `"${escaped_title}"`;
	}

	// Format description with block indicator if needed
	if (formatted.description) {
		formatted.description = format_multiline(formatted.description);
	}

	return formatted;
};

export const escape_frontmatter = (content: string): string => {
	return content.replace(
		/^(title|description):\s*(>-|\|-|\s*)(.*?)$/gm,
		(match, key, indicator, value) => {
			if (key === 'title' && value.match(/[:$@#{}[\]|>&*?!%`]/)) {
				// Escape any existing quotes and wrap in quotes
				const escaped_value = value.replace(/"/g, '\\"');
				return `${key}: "${escaped_value}"`;
			}
			if (key === 'description' && value.includes('\n')) {
				return `${key}: |-\n  ${value.split('\n').join('\n  ')}`;
			}
			return match;
		},
	);
};

const generate_metadata = async (
	file_path: string,
	content: string,
): Promise<DocMetadata> => {
	const relative_path = path.relative('src/docs', file_path);
	const dir_parts = path.dirname(relative_path).split('/');

	// Extract main category (svelte or kit)
	const main_category = dir_parts[0];

	// Generate category from directory structure
	const category = dir_parts.slice(1).join('/');

	// Basic title from filename
	const title = path
		.basename(file_path, '.md')
		.replace(/^\d+-/, '')
		.split('-')
		.map((word) => word.charAt(0).toUpperCase() + word.slice(1))
		.join(' ');

	// Extract first paragraph for description, preserving newlines if present
	const first_para = content.split('\n\n')[1] || '';
	const description = format_multiline(
		first_para.replace(/[#*`]/g, '').trim(),
	);

	// Generate tags based on content and path
	const tags = [
		...new Set([...dir_parts, ...title.toLowerCase().split(' ')]),
	];

	// Find related docs based on directory
	const related = await glob(
		`src/docs/${main_category}/**/*.md`,
	).then((files: string[]) =>
		files
			.filter((f: string) => f !== file_path)
			.map((f: string) =>
				path.relative(`src/docs/${main_category}`, f),
			)
			.slice(0, 3),
	);

	// Determine code categories
	const code_categories = ['typescript'];
	if (content.includes('```js')) code_categories.push('javascript');
	if (content.includes('server')) code_categories.push('server');
	if (content.includes('client')) code_categories.push('client');

	// Determine difficulty
	const difficulty = dir_parts.includes('getting-started')
		? 'beginner'
		: dir_parts.includes('advanced')
		? 'advanced'
		: 'intermediate';

	return {
		title,
		description,
		category,
		tags,
		related,
		code_categories,
		difficulty,
		last_updated: new Date().toISOString().split('T')[0],
	};
};

export const process_markdown_files = async () => {
	const files = await glob('src/docs/**/*.md');
	console.log(`Found ${files.length} markdown files to process`);
	let has_errors = false;

	for (const file of files) {
		try {
			console.log(`Processing ${file}...`);
			const content = await readFile(file, 'utf-8');

			// Handle special characters and block indicators in existing frontmatter
			const escaped_content = content.replace(
				/^(title|description):\s*(>-|\|-|\s*)(.*?)$/gm,
				(match, key, indicator, value) => {
					if (key === 'title' && value.match(/[:$@#{}[\]|>&*?!%`]/)) {
						// Escape any existing quotes and wrap in quotes
						const escaped_value = value.replace(/"/g, '\\"');
						return `${key}: "${escaped_value}"`;
					}
					if (key === 'description' && value.includes('\n')) {
						return `${key}: |-\n  ${value.split('\n').join('\n  ')}`;
					}
					return match;
				},
			);

			let { data: existing_frontmatter, content: doc_content } =
				matter(escaped_content);

			const metadata = await generate_metadata(file, doc_content);

			// Merge with existing frontmatter, preferring existing values
			const final_frontmatter = {
				...metadata,
				...existing_frontmatter,
			};

			// Always quote the title to be safe
			if (final_frontmatter.title) {
				const escaped_title = final_frontmatter.title.replace(
					/"/g,
					'\\"',
				);
				final_frontmatter.title = `"${escaped_title}"`;
			}

			// Format description with block indicator if needed
			if (final_frontmatter.description) {
				final_frontmatter.description = format_multiline(
					final_frontmatter.description,
				);
			}

			const new_content = matter.stringify(
				doc_content,
				final_frontmatter,
			);
			await writeFile(file, new_content);
			console.log(`✅ Successfully processed ${file}`);
		} catch (error: unknown) {
			has_errors = true;
			console.error(`❌ Error processing file ${file}:`, error);
			console.error('File content:', await readFile(file, 'utf-8'));
			if (error instanceof Error) {
				console.error(`Failed to process ${file}: ${error.message}`);
			} else {
				console.error(
					`Failed to process ${file}: Unknown error occurred`,
				);
			}
			continue;
		}
	}

	if (has_errors) {
		throw new Error(
			'Some files failed to process. Check the logs above for details.',
		);
	}
};
