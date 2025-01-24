# mcp-svelte-docs

A Model Context Protocol (MCP) server that provides efficient access
to Svelte documentation with advanced caching, search capabilities,
and optimised content delivery. This server integrates directly with
Svelte's official documentation, offering both full and compressed
variants suitable for different LLM context window sizes.

<a href="https://glama.ai/mcp/servers/wu4hy1xtjb">
  <img width="380" height="200" src="https://glama.ai/mcp/servers/wu4hy1xtjb/badge" />
</a>

## Features

- 📚 Complete Svelte documentation access through MCP Resources
- 🔍 Advanced search capabilities:
  - Document type filtering (API, Tutorial, Example, Error)
  - Section hierarchy awareness
  - Intelligent relevance scoring based on:
    - Term frequency
    - Section importance
    - Document type relevance
    - Exact phrase matching
  - Context-aware result excerpts
  - Related search suggestions
- 💾 Efficient caching with LibSQL
- 🔄 Automatic content freshness checks
- 📦 Support for package-specific documentation (Svelte, Kit, CLI)
- 📏 Smart content chunking for large documents
- 🗜️ Compressed variants for smaller context windows
- 🏗️ Built on the Model Context Protocol

## Configuration

This server requires configuration through your MCP client. Here are
examples for different environments:

### Cline Configuration

Add this to your Cline MCP settings:

```json
{
	"mcpServers": {
		"svelte-docs": {
			"command": "npx",
			"args": ["-y", "mcp-svelte-docs"],
			"env": {
				"LIBSQL_URL": "file:local.db",
				"LIBSQL_AUTH_TOKEN": "your-auth-token-if-using-remote-db"
			}
		}
	}
}
```

### Claude Desktop with WSL Configuration

For WSL environments, add this to your Claude Desktop configuration:

```json
{
	"mcpServers": {
		"svelte-docs": {
			"command": "wsl.exe",
			"args": [
				"bash",
				"-c",
				"LIBSQL_URL=file:local.db LIBSQL_AUTH_TOKEN=your-token npx -y mcp-svelte-docs"
			]
		}
	}
}
```

### Environment Variables

The server supports the following environment variables:

- `LIBSQL_URL` (optional): URL for the LibSQL database. Defaults to
  `file:local.db`
- `LIBSQL_AUTH_TOKEN` (optional): Auth token for remote LibSQL
  database

## API

The server implements both MCP Resources and Tools:

### Resources

Access documentation through these URIs:

- `svelte-docs://docs/llms.txt` - Documentation index
- `svelte-docs://docs/llms-full.txt` - Complete documentation
- `svelte-docs://docs/llms-small.txt` - Compressed documentation
- `svelte-docs://docs/{package}/llms.txt` - Package-specific
  documentation
  - Supported packages: svelte, kit, cli

### Tools

#### search_docs

Enhanced search functionality with advanced filtering and context
awareness.

Parameters:

- `query` (string, required): Search keywords or natural language
  query
- `doc_type` (string, optional): Filter by documentation type
  - Values: 'api', 'tutorial', 'example', 'error', 'all'
  - Default: 'all'
- `context` (number, optional): Number of surrounding paragraphs (0-3)
  - Default: 1
- `include_hierarchy` (boolean, optional): Include section hierarchy
  - Default: true

Example Usage:

```json
// API Reference Search
{
  "query": "bind:value directive",
  "doc_type": "api",
  "context": 1
}

// Tutorial Search
{
  "query": "routing sveltekit",
  "doc_type": "tutorial",
  "context": 2,
  "include_hierarchy": true
}
```

#### get_next_chunk

Retrieve subsequent chunks of large documents.

Parameters:

- `uri` (string, required): Document URI
- `chunk_number` (number, required): Chunk number to retrieve
  (1-based)

## Development

### Setup

1. Clone the repository
2. Install dependencies:

```bash
pnpm install
```

3. Build the project:

```bash
pnpm build
```

4. Run in development mode:

```bash
pnpm dev
```

### Publishing

1. Update version in package.json
2. Build the project:

```bash
pnpm build
```

3. Publish to npm:

```bash
pnpm publish
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Built on the
  [Model Context Protocol](https://github.com/modelcontextprotocol)
- Powered by [Svelte Documentation](https://svelte.dev)
- Uses [LibSQL](https://github.com/libsql/libsql) for efficient
  caching
