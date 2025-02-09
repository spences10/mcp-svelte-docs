#!/usr/bin/env node

import { download_docs } from '../processor/download-docs.js';
import { process_markdown_files } from '../processor/frontmatter.js';

const run = async () => {
	try {
		console.log('Starting documentation processing...');
		
		console.log('📥 Downloading documentation...');
		await download_docs();
		console.log('✅ Documentation download complete!');
		
		console.log('📝 Processing frontmatter...');
		await process_markdown_files();
		console.log('✅ Frontmatter processing complete!');
		
		console.log('🎉 All documentation processing complete!');
	} catch (error) {
		console.error('❌ Error processing documentation:', error);
		process.exit(1);
	}
};

run();
