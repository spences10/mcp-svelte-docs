/**
 * Configuration for the MCP Svelte Docs server
 */

/**
 * Configuration interface
 */
export interface Config {
	// Add any configuration options here
	debug: boolean;
}

/**
 * Default configuration
 */
const default_config: Config = {
	debug: false,
};

/**
 * Get the server configuration
 * @returns The server configuration
 */
export function get_config(): Config {
	// Get configuration from environment variables
	const debug = process.env.DEBUG === 'true';

	// Merge with default configuration
	return {
		...default_config,
		debug,
	};
}
