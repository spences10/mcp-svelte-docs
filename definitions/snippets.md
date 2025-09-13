# snippets Definition

**Definition:** Reusable template fragments that replace named slots  
**Syntax:**

```svelte
{#snippet name(param1, param2)}
  <!-- content -->
{/snippet}

{@render name(arg1, arg2)}
```

**Parameters:**

- `name` - Identifier for the snippet
- `param1, param2` - Optional parameters passed to snippet
  **Returns:** Renderable template fragment **Interface:**
  `Snippet<Parameters extends unknown[] = []>`

## Examples

```svelte
<!-- Define snippet with parameters -->
{#snippet card(title, content)}
  <div class="card">
    <h3>{title}</h3>
    <p>{content}</p>
  </div>
{/snippet}

<!-- Render snippet -->
{@render card('Hello', 'World')}

<!-- Snippet as prop -->
<script>
  let { header } = $props();
</script>

{@render header?.()}
```

## Related

- `$props` - For passing snippets as component props
- `Snippet` - TypeScript interface for snippet functions
- `slots` - Svelte 4 pattern that snippets replace
