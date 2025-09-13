# Snippet Definition

**Definition:** TypeScript interface for snippet functions that can be
passed as props or rendered  
**Interface:** `Snippet<Parameters extends unknown[] = []>`  
**Parameters:**

- `Parameters` - Tuple type defining parameter types passed to snippet
  **Returns:** Callable snippet function that renders template
  content  
  **Usage:** Type snippet props and ensure type safety for snippet
  parameters  
  **Generic:** Supports parameterized snippets with typed arguments

## Examples

```ts
// Basic snippet interface
import type { Snippet } from 'svelte';

interface Props {
  header: Snippet;
  content: Snippet<[string, number]>; // Takes string and number params
}

let { header, content }: Props = $props();

// Component usage
<script lang="ts">
  // Snippet with no parameters
  let basicSnippet: Snippet = $props().basicSnippet;

  // Snippet with typed parameters
  let itemSnippet: Snippet<[{ id: number; name: string }]> = $props().itemSnippet;

  // Optional snippet prop
  let optionalSnippet: Snippet | undefined = $props().optionalSnippet;
</script>

<!-- Render snippets with type safety -->
{@render header()}
{@render content('Hello', 42)}
{@render itemSnippet({ id: 1, name: 'Alice' })}

<!-- Optional rendering -->
{#if optionalSnippet}
  {@render optionalSnippet()}
{/if}

// Parent component passing typed snippets
<MyComponent>
  {#snippet header()}
    <h1>Title</h1>
  {/snippet}

  {#snippet content(text, count)}
    <p>{text} - Count: {count}</p>
  {/snippet}
</MyComponent>
```

## Related

- `snippets` - Creating and using snippet templates
- `$props` - Receiving snippet props in components
- `@render` - Rendering snippets with parameters
- `component-events` - Alternative to snippets for component
  communication
