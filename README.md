[![MseeP.ai Security Assessment Badge](https://mseep.net/mseep-audited.png)](https://mseep.ai/app/spences10-mcp-svelte-docs)

# mcp-svelte-docs

A Model Context Protocol (MCP) server that provides a comprehensive
reference guide for Svelte 5, helping LLMs provide accurate guidance
when users are working with Svelte. While it includes migration
patterns from Svelte 4 to Svelte 5, it also serves as a detailed
reference for Svelte 5 features, common mistakes, and best practices.

## Features

### 📊 Content Categories

- **Migration Patterns**: Side-by-side comparisons of Svelte 4 and
  Svelte 5 code
- **Svelte 5 Features**: Detailed documentation on runes, snippets,
  props, and events
- **Common Mistakes**: Patterns showing incorrect code and corrections
  with explanations
- **Global State Patterns**: Various approaches to global state
  management in Svelte 5

### 🔄 Key Migration Patterns

- **State Declaration**: `let count = 0` → `let count = $state(0)`
- **Derived Values**: `$: doubled = count * 2` →
  `const doubled = $derived(count * 2)`
- **Side Effects**: `$: { /* effect */ }` →
  `$effect(() => { /* effect */ })`
- **Event Handling**: `on:click={handler}` → `onclick={handler}`
- **Props**: `export let prop` → `let { prop } = $props()`
- **Component Events**: `createEventDispatcher()` → callback props
- **Slots**: `<slot>` → `{@render children()}`

### 🧩 Svelte 5 Features

- **Runes**: $state, $derived, $effect, $props, and more
- **Snippets**: Reusable chunks of markup with parameters
- **Props**: New approach to component props with destructuring
- **Events**: Standard HTML event attributes and callback props

### ⚠️ Common Mistakes

- **Reactivity**: Exporting state directly, forgetting $state, etc.
- **Events**: Using on:click instead of onclick, event modifiers, etc.
- **Props**: Using export let instead of $props, TypeScript issues,
  etc.

### 🌐 Global State Patterns

- **Function-based**: Getter/setter functions for module-level state
- **Object-based**: Objects with getters/setters for more ergonomic
  APIs
- **Class-based**: Classes with stateful properties for structured
  state
- **Context-based**: Svelte contexts for SSR-safe global state

### 💡 Comprehensive Examples

All content includes:

- Both JavaScript and TypeScript examples
- Clear explanations of concepts and usage
- Best practices and considerations
- Common pitfalls to avoid

## Usage

### Installation

```bash
# Install dependencies
npm install

# Build the project
npm run build

# Start the server
npm start
```

### Configuration

The server can be configured by setting environment variables:

- `DEBUG`: Set to 'true' to enable debug logging

### Cline Configuration

Add this to your Cline MCP settings:

```json
{
	"mcpServers": {
		"mcp-svelte-docs": {
			"command": "node",
			"args": ["/path/to/mcp-svelte-docs/dist/index.js"],
			"env": {
				"DEBUG": "false"
			},
			"disabled": false,
			"autoApprove": [
				"svelte_pattern",
				"svelte5_feature",
				"svelte5_common_mistakes"
			]
		}
	}
}
```

### Using with LLMs

When an LLM needs to provide guidance about Svelte, it can use the
available tools and resources:

#### Migration Patterns

```
<use_mcp_tool>
<server_name>mcp-svelte-docs</server_name>
<tool_name>svelte_pattern</tool_name>
<arguments>
{
  "pattern": "event"
}
</arguments>
</use_mcp_tool>
```

This will return migration patterns related to event handling, showing
both Svelte 4 and Svelte 5 implementations.

#### Svelte 5 Features

```
<use_mcp_tool>
<server_name>mcp-svelte-docs</server_name>
<tool_name>svelte5_feature</tool_name>
<arguments>
{
  "feature": "state",
  "includeExamples": true
}
</arguments>
</use_mcp_tool>
```

This will return detailed information about the $state rune, including
examples and best practices.

#### Common Mistakes

```
<use_mcp_tool>
<server_name>mcp-svelte-docs</server_name>
<tool_name>svelte5_common_mistakes</tool_name>
<arguments>
{
  "feature": "props"
}
</arguments>
</use_mcp_tool>
```

This will return common mistakes related to props in Svelte 5, along
with corrections and explanations.

#### Resource Access

```
<access_mcp_resource>
<server_name>mcp-svelte-docs</server_name>
<uri>svelte5://runes/state</uri>
</access_mcp_resource>
```

This will return a detailed reference for the $state rune in markdown
format.

## API

The server implements the following MCP Tools:

### svelte_pattern

Get Svelte 4 to Svelte 5 migration patterns.

Parameters:

- `pattern` (string, required): Pattern name or category to search for

Example response:

```json
{
	"patterns": [
		{
			"name": "Basic state",
			"description": "Declaring and using component state",
			"svelte4": "<script>\n  let count = 0;\n  \n  function increment() {\n    count++;\n  }\n</script>\n\n<button on:click={increment}>\n  Clicked {count} times\n</button>",
			"svelte5": "<script>\n  let count = $state(0);\n  \n  function increment() {\n    count++;\n  }\n</script>\n\n<button onclick={increment}>\n  Clicked {count} times\n</button>",
			"notes": "In Svelte 5, state is explicitly declared using the $state rune, and event handlers use standard HTML attributes (onclick) instead of the directive syntax (on:click)."
		}
	]
}
```

### svelte5_feature

Get detailed information about Svelte 5 features.

Parameters:

- `feature` (string, required): Feature name (e.g., "runes",
  "snippets", "props")
- `includeExamples` (boolean, optional): Whether to include code
  examples

Example response:

```json
{
	"features": [
		{
			"name": "$state",
			"description": "The $state rune is used to declare reactive state in Svelte 5.",
			"examples": [
				{
					"code": "<script>\n  let count = $state(0);\n  \n  function increment() {\n    count++;\n  }\n</script>\n\n<button onclick={increment}>\n  Clicked {count} times\n</button>",
					"explanation": "Basic usage of $state to create a reactive counter. When the button is clicked, the count is incremented and the UI updates automatically."
				}
			],
			"bestPractices": [
				"Use $state for any value that needs to trigger UI updates when changed",
				"For large arrays or objects that don't need deep reactivity, consider using $state.raw",
				"Don't export $state variables directly from modules, use getter/setter functions instead"
			]
		}
	]
}
```

### svelte5_common_mistakes

Get common mistakes and corrections for Svelte 5 features.

Parameters:

- `feature` (string, required): Feature name (e.g., "runes",
  "snippets", "events")

Example response:

```json
{
	"mistakes": [
		{
			"name": "Exporting state directly",
			"description": "Directly exporting a stateful variable from a module",
			"mistake": "// counter.svelte.js\nlet count = $state(0);\n\nexport { count };",
			"correction": "// counter.svelte.js\nlet count = $state(0);\n\nexport function getCount() {\n  return count;\n}\n\nexport function setCount(value) {\n  count = value;\n}",
			"explanation": "When you export a stateful variable directly, the reactivity is lost when it's imported elsewhere. This is because the importing module only gets the current value, not the reactive binding. Instead, export functions that access and modify the state."
		}
	]
}
```

### Resources

The server also provides the following MCP Resources:

#### Direct Resources

- `svelte5://overview`: Overview of Svelte 5 features and changes
- `svelte5://runes/overview`: Overview of all runes in Svelte 5
- `svelte5://snippets/overview`: Overview of snippets in Svelte 5
- `svelte5://global-state/overview`: Overview of global state
  approaches in Svelte 5

#### Resource Templates

- `svelte5://runes/{rune_name}`: Detailed reference for a specific
  rune
- `svelte5://patterns/{category}/{pattern_name}`: Reference for a
  specific Svelte pattern
- `svelte5://mistakes/{category}`: Common mistakes for a specific
  category

## Development

### Project Structure

```
src/
├── index.ts                # MCP server entry point
├── config.ts               # Basic configuration
├── tools/                  # Tool implementations
│   └── handler.ts          # Tool registration
├── resources/              # Resource implementations
│   └── index.ts            # Resource registration
└── patterns/               # Pattern database
    ├── index.ts            # Exports all patterns
    ├── state.ts            # State management patterns
    ├── events.ts           # Event handling patterns
    ├── props.ts            # Props and component patterns
    ├── templating.ts       # Templating patterns
    ├── lifecycle.ts        # Lifecycle patterns
    ├── svelte5_features.ts # Svelte 5 specific features
    ├── common_mistakes.ts  # Common mistakes and corrections
    └── global_state.ts     # Global state patterns
```

### Adding New Content

#### Migration Patterns

To add new migration patterns, add them to the appropriate pattern
file in the `src/patterns` directory:

```typescript
{
  name: 'Pattern Name',
  description: 'Description of the pattern',
  svelte4: `Svelte 4 code example`,
  svelte5: `Svelte 5 code example`,
  notes: 'Additional notes about migration considerations'
}
```

#### Svelte 5 Features

To add new Svelte 5 features, add them to the
`src/patterns/svelte5_features.ts` file:

```typescript
{
  name: 'Feature Name',
  description: 'Description of the feature',
  examples: [
    {
      code: `Code example`,
      explanation: 'Explanation of the example'
    }
  ],
  bestPractices: [
    'Best practice 1',
    'Best practice 2'
  ]
}
```

#### Common Mistakes

To add new common mistakes, add them to the
`src/patterns/common_mistakes.ts` file:

```typescript
{
  name: 'Mistake Name',
  description: 'Description of the common mistake',
  mistake: `Incorrect code example`,
  correction: `Corrected code example`,
  explanation: 'Detailed explanation of why the mistake is problematic and how the correction addresses it'
}
```

#### Global State Patterns

To add new global state patterns, add them to the
`src/patterns/global_state.ts` file:

```typescript
{
  name: 'Global State Pattern Name',
  description: 'Description of the global state pattern',
  code: `Implementation example`,
  usage: `Usage example`,
  notes: 'Additional notes about the pattern, including considerations for server vs. client usage'
}
```

### Setup

1. Clone the repository
2. Install dependencies:

```bash
npm install
```

3. Build the project:

```bash
npm run build
```

4. Run in development mode:

```bash
npm run dev
```

## Troubleshooting

### Common Issues

- **Pattern not found**: Make sure you're searching for a pattern that
  exists in the database. Try using more general terms like "state" or
  "event" instead of specific pattern names.
- **Server not starting**: Ensure you have the correct permissions to
  run the server and that the port is not already in use.
- **TypeScript errors**: Make sure you have the correct version of
  TypeScript installed and that your code follows the project's
  TypeScript configuration.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

Built on:

- [Model Context Protocol](https://github.com/modelcontextprotocol)
- [Svelte](https://svelte.dev)
