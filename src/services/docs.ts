const SVELTE_BASE_URL = 'https://svelte.dev';
const DOC_PATHS = [
  '/llms.txt',
  '/llms-full.txt',
  '/llms-small.txt',
  '/docs/svelte/llms.txt',
  '/docs/kit/llms.txt',
  '/docs/cli/llms.txt'
] as const;

type DocPath = typeof DOC_PATHS[number];

export class DocsService {
  private static instance: DocsService;
  private doc_cache: Map<string, { content: string; timestamp: number }>;
  private cache_ttl: number;

  private constructor(cache_ttl_ms: number = 3600000) { // 1 hour default TTL
    this.doc_cache = new Map();
    this.cache_ttl = cache_ttl_ms;
  }

  public static get_instance(cache_ttl_ms?: number): DocsService {
    if (!DocsService.instance) {
      DocsService.instance = new DocsService(cache_ttl_ms);
    }
    return DocsService.instance;
  }

  public async get_doc(path: DocPath): Promise<string> {
    const cached = this.doc_cache.get(path);
    if (cached && Date.now() - cached.timestamp < this.cache_ttl) {
      return cached.content;
    }

    try {
      const response = await fetch(`${SVELTE_BASE_URL}${path}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch ${path}: ${response.statusText}`);
      }

      const content = await response.text();
      this.doc_cache.set(path, {
        content,
        timestamp: Date.now()
      });

      return content;
    } catch (error: unknown) {
      const error_message = error instanceof Error ? error.message : String(error);
      throw new Error(`Error fetching doc ${path}: ${error_message}`);
    }
  }

  public async get_all_docs(): Promise<Array<{ path: DocPath; content: string }>> {
    const docs = await Promise.all(
      DOC_PATHS.map(async path => ({
        path,
        content: await this.get_doc(path)
      }))
    );

    return docs;
  }

  // Generate a simple vector embedding for text similarity search
  // This uses a basic TF-IDF inspired approach
  public generate_embedding(text: string): number[] {
    const words = text.toLowerCase()
      .replace(/[^\w\s]/g, '')
      .split(/\s+/)
      .filter(word => word.length > 2);

    // Create word frequency map
    const word_freq = new Map<string, number>();
    for (const word of words) {
      word_freq.set(word, (word_freq.get(word) || 0) + 1);
    }

    // Convert to fixed-size vector (using hashing for dimensionality reduction)
    const VECTOR_SIZE = 1536; // Common embedding size
    const embedding = new Array(VECTOR_SIZE).fill(0);
    
    for (const [word, freq] of word_freq.entries()) {
      // Simple string hash function
      const hash = Array.from(word).reduce(
        (hash, char) => ((hash << 5) - hash) + char.charCodeAt(0),
        0
      );
      const index = Math.abs(hash) % VECTOR_SIZE;
      
      // TF-IDF inspired weighting
      embedding[index] += freq / Math.sqrt(words.length);
    }

    // Normalize the vector
    const magnitude = Math.sqrt(embedding.reduce((sum, val) => sum + val * val, 0));
    return embedding.map(val => val / magnitude);
  }

  public clear_cache(): void {
    this.doc_cache.clear();
  }
}
