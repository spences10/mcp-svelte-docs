# mcp-svelte-docs

A Model Context Protocol (MCP) server providing authoritative Svelte 5
and SvelteKit definitions extracted directly from TypeScript
declarations. Get precise syntax, parameters, and examples for all
Svelte 5 concepts through a single, unified interface.

## Architecture

**Definition-First Approach**: Rather than multiple specialized tools,
this server provides one powerful `svelte_definition` tool that
accesses 28+ comprehensive definitions covering:

- **All Svelte 5 runes** ($state, $derived, $props, $effect variants)
- **Modern features** (snippets, await expressions, remote functions)
- **Event handling** (DOM events, custom events, component
  communication)
- **Migration guidance** (Svelte 4 to 5 patterns and best practices)
- **TypeScript interfaces** (Snippet, Snapshot types)
- **Advanced patterns** (global state, common mistakes, lifecycle
  equivalents)

## Available Tool

### `svelte_definition`

**Single, powerful tool** for all Svelte 5 and SvelteKit concepts:

```typescript
svelte_definition(identifier: string, format?: "syntax"|"quick"|"full")
```

**Examples:**

- `svelte_definition("$state")` - Complete $state documentation
- `svelte_definition("snippets", "quick")` - Snippet overview with
  example
- `svelte_definition("onclick", "syntax")` - Just the TypeScript
  signature
- `svelte_definition("migration-patterns")` - Svelte 4 → 5 migration
  guide

**Response Formats:**

- `"syntax"` - TypeScript signature only (~50 words)
- `"quick"` - Definition + minimal example (~200 words)
- `"full"` - Complete documentation with examples (~500-1000 words,
  default)

### Available Identifiers (28+)

**Core Runes:** `$state`, `$state.raw`, `$state.snapshot`, `$derived`,
`$derived.by`, `$props`, `$bindable`, `$effect`, `$effect.pre`,
`$effect.root`, `$effect.pending`, `$effect.tracking`

**Development Tools:** `$inspect`, `$host`

**Features & Patterns:** `snippets`, `onclick`, `component-events`,
`migration-patterns`, `await-expressions`, `remote-functions`,
`global-state`, `common-mistakes`, `lifecycle-equivalents`

**Event Handling:** `custom-events`, `event-delegation`,
`event-modifiers`

**TypeScript Interfaces:** `snippet`, `snapshot`

## Key Features

### 🎯 **Authoritative & TypeScript-First**

- **Direct from Source**: Definitions extracted from official Svelte 5
  TypeScript declarations
- **Always Current**: Reflects the actual API, not outdated tutorials
- **Type-Safe**: Includes precise parameter types, return values, and
  constraints

### ⚡ **Single Interface, Complete Coverage**

- **One Tool**: `svelte_definition` replaces 16+ specialized tools
- **28+ Definitions**: Every Svelte 5 rune, feature, and pattern
  covered
- **Consistent Responses**: Same interface whether you need `$state`
  or `remote-functions`

### 🚀 **Modern Svelte 5 & SvelteKit Support**

- **Await Expressions**: Async operations directly in templates
  (`await-expressions`)
- **Remote Functions**: Type-safe client-server communication
  (`remote-functions`)
- **All Runes**: Complete `$effect` family, `$state` variants,
  `$derived.by`, `$bindable`
- **Advanced Patterns**: Event handling, global state, component
  communication

### 📚 **Smart Error Recovery**

- **Fuzzy Matching**: Suggests correct identifiers for typos
- **Related Concepts**: Points to similar definitions when searches
  fail
- **Migration Help**: Converts Svelte 4 patterns to Svelte 5
  equivalents

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
