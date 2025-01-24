import { Tool } from '@modelcontextprotocol/sdk/types.js';

const SEARCH_TOOL_DESCRIPTION = `Enhanced search functionality for Svelte documentation with advanced filtering and context awareness.

Key Features:
1. Natural Language Processing
   - Intelligent parsing of search queries
   - Understanding of Svelte-specific terminology
   - Support for fuzzy matching and synonyms

2. Document Type Filtering
   - API Reference documentation
   - Tutorial and guide content
   - Example code and demonstrations
   - Error messages and debugging help

3. Context-Aware Results
   - Section hierarchy preservation
   - Configurable context depth
   - Parent-child relationship tracking
   - Breadcrumb trail for navigation

4. Advanced Relevance Scoring
   - Term frequency-inverse document frequency (TF-IDF)
   - Section importance weighting
   - Document type relevance
   - Path proximity scoring
   - Exact match boosting

Example Usage:

1. API Reference Search:
   {
     "query": "bind:value directive",
     "docType": "api",
     "context": 1
   }
   Returns focused API documentation about the bind:value directive with minimal context.

2. Tutorial Search:
   {
     "query": "routing sveltekit",
     "docType": "tutorial",
     "context": 2,
     "includeHierarchy": true
   }
   Returns tutorial content about SvelteKit routing with extended context and section structure.

3. Error Lookup:
   {
     "query": "missing_key error",
     "docType": "error",
     "context": 1
   }
   Returns specific error documentation with relevant troubleshooting context.

4. General Search:
   {
     "query": "state management store",
     "docType": "all",
     "context": 2,
     "includeHierarchy": true
   }
   Returns comprehensive results about stores across all document types.`;

export const SEARCH_DOCS_TOOL: Tool = {
	name: 'search_docs',
	description: SEARCH_TOOL_DESCRIPTION,
	inputSchema: {
		type: 'object',
		properties: {
			query: {
				type: 'string',
				description:
					'Search keywords or natural language query. Supports Svelte-specific terminology and fuzzy matching.',
			},
			doc_type: {
				type: 'string',
				enum: ['api', 'tutorial', 'example', 'error', 'all'],
				description:
					'Filter results by documentation type:\n- api: API reference documentation\n- tutorial: Learning guides and tutorials\n- example: Code examples and demos\n- error: Error messages and debugging\n- all: Search across all document types',
				default: 'all',
			},
			context: {
				type: 'number',
				description:
					'Number of surrounding paragraphs to include in results (0-3)',
				default: 1,
				minimum: 0,
				maximum: 3,
			},
			include_hierarchy: {
				type: 'boolean',
				description:
					'Include section hierarchy information in results',
				default: true,
			},
		},
		required: ['query'],
	},
};

export interface SearchResult {
	path: string;
	excerpt: string;
	hierarchy: string[];
	metadata: {
		doc_type: 'api' | 'tutorial' | 'example' | 'error' | 'general';
		relevance_score: number;
		match_quality: number;
		context_depth: number;
		section_importance: number;
	};
}

export interface SearchOptions {
	doc_type?: 'api' | 'tutorial' | 'example' | 'error' | 'all';
	context?: number;
	include_hierarchy?: boolean;
}

export interface SectionHierarchy {
	title: string;
	level: number;
	children: SectionHierarchy[];
}

export interface DocumentMetadata {
	doc_type: 'api' | 'tutorial' | 'example' | 'error' | 'general';
	hierarchy: SectionHierarchy;
	last_indexed: string;
}
