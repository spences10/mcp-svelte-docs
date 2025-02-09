import { VectorOperations } from '../types.js';

class LibSQLVectors implements VectorOperations {
	private readonly dimension = 384; // Using 384 dimensions for embeddings

	async generate_embedding(text: string): Promise<number[]> {
		try {
			// For now, return a random vector of correct dimension
			// In production, this would use a proper embedding model
			return Array.from(
				{ length: this.dimension },
				() => Math.random() * 2 - 1,
			);
		} catch (error) {
			console.error('Error generating embedding:', error);
			throw error;
		}
	}

	vector_similarity(a: number[], b: number[]): number {
		if (a.length !== b.length) {
			throw new Error('Vectors must have same dimension');
		}

		// Use Turso's native vector_distance_cos function
		// This is handled at the database level when querying
		// This method remains for compatibility with non-db operations
		let dot_product = 0;
		let mag_a = 0;
		let mag_b = 0;

		for (let i = 0; i < a.length; i++) {
			dot_product += a[i] * b[i];
			mag_a += a[i] * a[i];
			mag_b += b[i] * b[i];
		}

		mag_a = Math.sqrt(mag_a);
		mag_b = Math.sqrt(mag_b);

		return dot_product / (mag_a * mag_b);
	}

	// Convert vector to LibSQL vector string format for storage
	vector_to_sql_string(vector: number[]): string {
		if (vector.length !== this.dimension) {
			throw new Error(`Vector must have dimension ${this.dimension}`);
		}
		// LibSQL expects vectors in the format: [1,2,3]
		return `[${vector.join(',')}]`;
	}

	// Convert LibSQL vector string back to number array
	sql_string_to_vector(sql_string: string): number[] {
		// Remove brackets
		const cleaned = sql_string.replace(/^\[|\]$/g, '');
		return cleaned.split(',').map(Number);
	}

	// Convert vector to F32_BLOB for Turso storage
	vector_to_blob(vector: number[]): Uint8Array {
		if (vector.length !== this.dimension) {
			throw new Error(`Vector must have dimension ${this.dimension}`);
		}

		// Convert to F32 array for Turso's F32_BLOB type
		const buffer = new ArrayBuffer(vector.length * 4); // 4 bytes per float32
		const view = new Float32Array(buffer);
		vector.forEach((value, i) => (view[i] = value));

		return new Uint8Array(buffer);
	}

	// Convert F32_BLOB back to vector
	blob_to_vector(blob: Uint8Array): number[] {
		const view = new Float32Array(blob.buffer);
		return Array.from(view);
	}
}

// Export singleton instance
export const embeddings = new LibSQLVectors();
