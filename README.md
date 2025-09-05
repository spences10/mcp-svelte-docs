# mcp-svelte-docs

A Model Context Protocol (MCP) server that provides a comprehensive
reference guide for Svelte 5 and SvelteKit, helping LLMs provide
accurate guidance when users are working with Svelte. It includes
detailed documentation for:

- **Svelte 5 core features** (runes, components, events)
- **Modern async patterns** (await expressions, loading states)
- **SvelteKit remote functions** (type-safe client-server
  communication)
- **Migration patterns** from Svelte 4 to Svelte 5
- **Common mistakes** and best practices
- **Advanced patterns** for state management and data flow

## Available Tools

This MCP server provides 16 specialized tools for Svelte 5 and
SvelteKit development:

### Core Svelte 5 Runes

- `svelte5_state` - Documentation for `$state` rune (reactive state)
- `svelte5_derived` - Documentation for `$derived` rune (computed
  values)
- `svelte5_props` - Documentation for `$props` rune (component
  properties)
- `svelte5_effect` - Documentation for `$effect` rune (side effects)

### Svelte 5 Features

- `svelte5_snippets` - Documentation for snippets (replacement for
  slots)
- `svelte5_events` - Event handling patterns in Svelte 5
- `svelte5_component_events` - Component event patterns and best
  practices
- `svelte5_global_state` - Global state management patterns

### Modern Async Features ✨ NEW

- `svelte5_await_expressions` - Await expressions for async operations
  (experimental)
- `sveltekit_remote_functions` - Remote functions for type-safe
  client-server communication (experimental)

### Migration & Guidance

- `svelte5_migration` - Migration patterns from Svelte 4 to Svelte 5
- `svelte5_mistakes` - Common mistakes and how to avoid them
- `svelte5_overview` - General overview of Svelte 5 features
- `svelte5_runes_overview` - Comprehensive overview of all runes

### Tool Parameters

All tools support an optional `includeExamples` parameter:

- `includeExamples: true` (default) - Include code examples and
  demonstrations
- `includeExamples: false` - Return documentation without code
  examples for concise reference

## Key Features

### 🚀 Experimental Async Support

- **Await Expressions**: Use `await` directly in components,
  `$derived`, and markup
- **Boundaries**: Error handling and loading states with
  `<svelte:boundary>`
- **Synchronized Updates**: Consistent UI updates during async
  operations
- **Performance Patterns**: Avoid waterfalls, optimize concurrent
  requests

### ⚡ Remote Functions

- **Type-safe Communication**: Full TypeScript support between client
  and server
- **Four Function Types**: Query (read), Form (submit), Command
  (execute), Prerender (static)
- **Optimistic Updates**: Immediate UI feedback with server
  synchronization
- **Progressive Enhancement**: Works with and without JavaScript

### 📚 Comprehensive Documentation

- **Real-world Examples**: Patterns from core maintainer projects
- **Migration Guidance**: Step-by-step Svelte 4 to 5 migration
- **Error Prevention**: Common mistakes and corrections
- **Best Practices**: Production-ready patterns and recommendations

## Config

Claude Desktop (via WSL)

```json
{
	"mcpServers": {
		"mcp-svelte-docs": {
			"command": "wsl.exe",
			"args": ["bash", "-c", "npx -y mcp-svelte-docs"]
		}
	}
}
```

Cursor

[![Install MCP Server](https://cursor.com/deeplink/mcp-install-dark.svg)](https://cursor.com/en/install-mcp?name=mcp-svelte-docs&config=eyJjb21tYW5kIjoibnB4IC15IG1jcC1zdmVsdGUtZG9jcyJ9)

Windsurf (via WSL)

```json
{
	"mcpServers": {
		"mcp-svelte-docs": {
			"command": "wsl.exe",
			"args": ["bash", "-c", "npx -y mcp-svelte-docs"]
		}
	}
}
```

Windows (without WSL)

```json
{
	"mcpServers": {
		"mcp-svelte-docs": {
			"command": "npx",
			"args": ["-y", "mcp-svelte-docs"]
		}
	}
}
```

macOS / Linux

```json
{
	"mcpServers": {
		"mcp-svelte-docs": {
			"command": "npx",
			"args": ["-y", "mcp-svelte-docs"]
		}
	}
}
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

Built on:

- [Model Context Protocol](https://github.com/modelcontextprotocol)
- [Svelte](https://svelte.dev)
