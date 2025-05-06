/**
 * Types for Svelte 5 documentation
 */

export interface Feature {
	name: string;
	description: string;
	examples: string[];
	bestPractices?: string[];
}

export interface Pattern {
	name: string;
	description: string;
	examples: string[];
	bestPractices?: string[];
}

export interface CommonMistake {
	name: string;
	description: string;
	mistake: string;
	correction: string;
	explanation: string;
}

// Empty arrays to replace the imported content
export const features: Feature[] = [];
export const patterns: Pattern[] = [];
export const mistakes: CommonMistake[] = [];
