export type Difficulty = 'beginner' | 'intermediate' | 'advanced';

export interface Doc {
  id: string;
  content: string;
  concept: string;
  related_concepts: string[];  // Array of concept IDs
  code_examples: CodeExample[];
  difficulty: Difficulty;
  tags: string[];
  embedding: number[];
  last_updated: string;
}

export type CodeCategory = 
  | 'state_management'
  | 'effects'
  | 'components'
  | 'events'
  | 'routing'
  | 'security'
  | 'general';

export interface CodeExample {
  language: string;
  code: string;
  description: string;
  category: CodeCategory;
  runes: string[];
  functions: string[];
  components: string[];
}

export interface QueryPattern {
  id: string;
  doc_id: string;
  pattern: string;
  context?: string;
  embedding: number[];
}

export interface SearchFilters {
  difficulty?: Difficulty;
  tags?: string[];
  concepts?: string[];
  category?: CodeCategory;
  has_runes?: string[];
  has_functions?: string[];
  has_components?: string[];
}

export interface SearchResult {
  doc: Doc;
  similarity: number;
  matching_patterns?: {
    pattern: string;
    context?: string;
    similarity: number;
  }[];
  matching_code?: {
    example: CodeExample;
    similarity: number;
  }[];
}

export interface ProcessedMarkdown {
  concept: string;
  content: string;
  code_examples: CodeExample[];
  difficulty: Difficulty;
  tags: string[];
  related_concepts: string[];
  common_patterns: {
    pattern: string;
    context?: string;
  }[];
}

// Vector operations
export interface VectorOperations {
  generate_embedding(text: string): Promise<number[]>;
  vector_similarity(a: number[], b: number[]): number;
  vector_to_blob(vector: number[]): Uint8Array;
  blob_to_vector(blob: Uint8Array): number[];
}

// Search operations
export interface SearchOptions {
  limit?: number;
  filters?: SearchFilters;
  include_patterns?: boolean;
}

export interface SearchEngine {
  search(query: string, options?: SearchOptions): Promise<SearchResult[]>;
  similar_docs(embedding: number[], limit?: number): Promise<SearchResult[]>;
  search_by_concept(concept: string, options?: SearchOptions): Promise<SearchResult[]>;
}
