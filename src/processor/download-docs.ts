import { promises as fs } from 'node:fs';
import { join } from 'node:path';

const SVELTE_DOCS_URL =
	'https://api.github.com/repos/sveltejs/svelte/contents/documentation/docs';
const SVELTEKIT_DOCS_URL =
	'https://api.github.com/repos/sveltejs/kit/contents/documentation/docs';

interface GitHubContent {
	name: string;
	type: string;
	download_url: string | null;
	url: string;
}

async function fetch_github_contents(
	url: string,
): Promise<GitHubContent[]> {
	const response = await fetch(url, {
		headers: {
			Accept: 'application/vnd.github.v3+json',
			'User-Agent': 'mcp-svelte-docs',
		},
	});

	if (!response.ok) {
		throw new Error(
			`Failed to fetch GitHub contents: ${response.statusText}`,
		);
	}

	return response.json();
}

async function download_file(
	url: string,
	dest: string,
): Promise<void> {
	const response = await fetch(url);
	if (!response.ok) {
		throw new Error(
			`Failed to download file: ${response.statusText}`,
		);
	}

	const buffer = Buffer.from(await response.arrayBuffer());
	await fs.writeFile(dest, buffer);
}

async function process_github_contents(
	contents: GitHubContent[],
	base_path: string,
): Promise<void> {
	for (const item of contents) {
		const dest_path = join(base_path, item.name);

		if (item.type === 'dir') {
			await fs.mkdir(dest_path, { recursive: true });
			const sub_contents = await fetch_github_contents(item.url);
			await process_github_contents(sub_contents, dest_path);
		} else if (item.type === 'file' && item.download_url) {
			console.log(`Downloading: ${item.name}`);
			await download_file(item.download_url, dest_path);
		}
	}
}

export async function download_docs(): Promise<void> {
	const svelte_dir = join(process.cwd(), 'src', 'docs', 'svelte');
	const kit_dir = join(process.cwd(), 'src', 'docs', 'kit');

	try {
		// Clean and create output directories
		await fs.rm(svelte_dir, { recursive: true, force: true });
		await fs.mkdir(svelte_dir, { recursive: true });
		await fs.rm(kit_dir, { recursive: true, force: true });
		await fs.mkdir(kit_dir, { recursive: true });

		// Download Svelte documentation
		const svelte_contents = await fetch_github_contents(
			SVELTE_DOCS_URL,
		);
		await process_github_contents(svelte_contents, svelte_dir);

		// Download SvelteKit documentation
		const kit_contents = await fetch_github_contents(
			SVELTEKIT_DOCS_URL,
		);
		await process_github_contents(kit_contents, kit_dir);

		console.log('Documentation download complete!');
	} catch (error) {
		console.error('Error downloading documentation:', error);
		throw error;
	}
}
