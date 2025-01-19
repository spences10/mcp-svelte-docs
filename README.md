# mcp-svelte-docs

An MCP server that provides access to Svelte documentation via the
llms.txt convention, with vector similarity search capabilities.

## Features

- Serves Svelte documentation through MCP Resources
- Vector similarity search for documentation content
- Local caching with LibSQL
- Automatic document embedding generation
- Support for all Svelte llms.txt formats:
  - Root level: llms.txt, llms-full.txt, llms-small.txt
  - Package level: docs/svelte/llms.txt, docs/kit/llms.txt,
    docs/cli/llms.txt

## Installation

```bash
npm install -g mcp-svelte-docs
```

## Configuration

The server requires the following environment variables:

- `LIBSQL_URL` (optional): URL for the LibSQL database. Defaults to
  `file:local.db`
- `LIBSQL_AUTH_TOKEN` (optional): Auth token for remote LibSQL
  database

## Usage

### Starting the Server

```bash
mcp-svelte-docs
```

### MCP Resources

Access documentation through the following URIs:

- `svelte-docs://llms.txt` - Documentation index
- `svelte-docs://llms-full.txt` - Complete documentation
- `svelte-docs://llms-small.txt` - Compressed documentation
- `svelte-docs://docs/{package}/llms.txt` - Package-specific
  documentation
  - Supported packages: svelte, kit, cli

### MCP Tools

#### search_docs

Search documentation using vector similarity:

```typescript
{
  name: 'search_docs',
  arguments: {
    query: string,    // Search query text
    limit?: number    // Max results (1-20, default: 5)
  }
}
```

#### refresh_docs

Refresh documentation cache and update database:

```typescript
{
  name: 'refresh_docs',
  arguments: {}
}
```

## Development

```bash
# Install dependencies
pnpm install

# Build
pnpm build

# Run with inspector
pnpm dev
```

## License

MIT
