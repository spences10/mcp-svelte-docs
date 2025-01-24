import { cache_doc, get_cached_doc } from './database.js';
import { DocumentMetadata, SectionHierarchy } from './schema.js';

// Resource paths
export const SVELTE_BASE_URL = 'https://svelte.dev';
export const DOC_PATHS = {
	index: '/llms.txt',
	full: '/llms-full.txt',
	small: '/llms-small.txt',
	svelte: '/docs/svelte/llms.txt',
	kit: '/docs/kit/llms.txt',
	cli: '/docs/cli/llms.txt',
} as const;

// Freshness checker
async function check_freshness(path: string, base_url: string) {
	const cached = await get_cached_doc(path);
	if (!cached) return false;

	try {
		const response = await fetch(base_url + path, { method: 'HEAD' });
		const server_modified = response.headers.get('last-modified');
		const server_etag = response.headers.get('etag');

		if (!server_modified && !server_etag) return true;
		if (server_etag && server_etag === cached.etag) return true;
		if (server_modified && server_modified === cached.last_modified)
			return true;

		return false;
	} catch (error) {
		console.error('Error checking freshness:', error);
		return true; // Use cache on error
	}
}

function detect_doc_type(
	content: string,
	path: string,
): DocumentMetadata['doc_type'] {
	const lower_content = content.toLowerCase();
	const lower_path = path.toLowerCase();

	if (
		lower_path.includes('/api/') ||
		lower_content.includes('api reference')
	) {
		return 'api';
	}
	if (
		lower_path.includes('/tutorial/') ||
		lower_content.includes('tutorial:')
	) {
		return 'tutorial';
	}
	if (
		lower_path.includes('/examples/') ||
		lower_content.match(/example\s*\d+:/)
	) {
		return 'example';
	}
	if (
		lower_path.includes('/errors/') ||
		lower_content.includes('error code:')
	) {
		return 'error';
	}
	return 'general';
}

function extract_hierarchy(content: string): SectionHierarchy {
	const lines = content.split('\n');
	const root: SectionHierarchy = {
		title: '',
		level: 0,
		children: [],
	};
	const stack: SectionHierarchy[] = [root];

	lines.forEach((line) => {
		const match = line.match(/^(#{1,6})\s+(.+)$/);
		if (match) {
			const level = match[1].length;
			const title = match[2].trim();
			const node: SectionHierarchy = { title, level, children: [] };

			while (
				stack.length > 1 &&
				stack[stack.length - 1].level >= level
			) {
				stack.pop();
			}

			stack[stack.length - 1].children.push(node);
			stack.push(node);
		}
	});

	// Return the first real section if it exists, otherwise return root
	return root.children[0] || root;
}

// Fetch and cache document
export async function fetch_doc(path: string): Promise<string> {
	const is_fresh = await check_freshness(path, SVELTE_BASE_URL);
	if (is_fresh) {
		const cached = await get_cached_doc(path);
		if (!cached) throw new Error('Cache inconsistency detected');
		return cached.content;
	}

	try {
		const response = await fetch(SVELTE_BASE_URL + path);
		if (!response.ok)
			throw new Error(`HTTP error! status: ${response.status}`);

		const content = await response.text();
		const last_modified =
			response.headers.get('last-modified') ||
			new Date().toUTCString();
		const etag = response.headers.get('etag');

		const doc_type = detect_doc_type(content, path);
		const hierarchy = extract_hierarchy(content);

		await cache_doc(path, content, last_modified, etag, {
			doc_type,
			hierarchy,
			last_indexed: new Date().toISOString(),
		});
		return content;
	} catch (error) {
		console.error('Error fetching document:', error);
		const cached = await get_cached_doc(path);
		if (cached) return cached.content;
		throw error;
	}
}

// Initialize cache by pre-fetching all documentation
export async function init_cache() {
	for (const path of Object.values(DOC_PATHS)) {
		try {
			await fetch_doc(path);
		} catch (error) {
			console.error(`Failed to pre-fetch ${path}:`, error);
		}
	}
}

// Process document content
export function process_small_doc(content: string): {
	text: string;
	metadata: {
		original_size: number;
		compressed_size: number;
		compression_ratio: string;
		estimated_tokens: number;
	};
} {
	const compressed = content
		.replace(/\n\s*\n/g, '\n') // Remove empty lines
		.replace(/\s+/g, ' ') // Collapse whitespace
		.replace(/<!--[\s\S]*?-->/g, '') // Remove HTML comments
		.replace(/```[\s\S]*?```/g, '') // Remove code blocks
		.replace(/\[([^\]]+)\]\([^\)]+\)/g, '$1') // Remove markdown links but keep text
		.replace(/#{1,6}\s/g, '') // Remove heading markers
		.replace(/(\*\*|__)(.*?)\1/g, '$2') // Remove bold markers
		.replace(/(\*|_)(.*?)\1/g, '$2') // Remove italic markers
		.trim();

	const token_estimate = compressed.length / 4; // Rough estimate of tokens
	if (token_estimate > 150000) {
		console.error(
			`Warning: Compressed content still large: ~${token_estimate} tokens`,
		);
	}

	return {
		text: compressed,
		metadata: {
			original_size: content.length,
			compressed_size: compressed.length,
			compression_ratio:
				((1 - compressed.length / content.length) * 100).toFixed(1) +
				'%',
			estimated_tokens: Math.round(token_estimate),
		},
	};
}

export function chunk_document(
	content: string,
	chunk_size = 40000,
): {
	chunks: string[];
	metadata: {
		total_chunks: number;
		total_size: number;
	};
} {
	const chunks = [];
	for (let i = 0; i < content.length; i += chunk_size) {
		chunks.push(content.slice(i, i + chunk_size));
	}

	return {
		chunks,
		metadata: {
			total_chunks: chunks.length,
			total_size: content.length,
		},
	};
}
