/**
 * Migration pattern interface
 */
export interface Pattern {
	name: string;
	description: string;
	svelte4: string;
	svelte5: string;
	notes?: string;
}

/**
 * Svelte 5 feature pattern interface
 */
export interface Svelte5Feature {
	name: string;
	description: string;
	examples: {
		code: string;
		explanation: string;
	}[];
	bestPractices: string[];
}

/**
 * Common mistake pattern interface
 */
export interface CommonMistake {
	name: string;
	description: string;
	mistake: string;
	correction: string;
	explanation: string;
}

/**
 * Global state pattern interface
 */
export interface GlobalStatePattern {
	name: string;
	description: string;
	code: string;
	usage: string;
	notes: string;
}

// Import migration pattern files
import event_patterns from './events.js';
import lifecycle_patterns from './lifecycle.js';
import props_patterns from './props.js';
import state_patterns from './state.js';
import templating_patterns from './templating.js';

// Import new pattern files
import common_mistakes from './common_mistakes.js';
import global_state_patterns from './global_state.js';
import svelte5_features from './svelte5_features.js';

/**
 * Get all migration patterns
 * @returns All migration patterns
 */
export function get_patterns(): Pattern[] {
	return [
		...state_patterns,
		...event_patterns,
		...props_patterns,
		...templating_patterns,
		...lifecycle_patterns,
	];
}

/**
 * Get all Svelte 5 features
 * @returns All Svelte 5 features
 */
export function get_svelte5_features(): Svelte5Feature[] {
	return svelte5_features;
}

/**
 * Get all common mistakes
 * @returns All common mistakes
 */
export function get_common_mistakes(): CommonMistake[] {
	return common_mistakes;
}

/**
 * Get all global state patterns
 * @returns All global state patterns
 */
export function get_global_state_patterns(): GlobalStatePattern[] {
	return global_state_patterns;
}
