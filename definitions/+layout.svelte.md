# +layout.svelte Definition

**Definition:** SvelteKit layout component that wraps pages and nested
layouts. Receives `data` from its layout `load` and a `children`
snippet to render.

**Syntax:** `src/routes/(...)/+layout.svelte`

**Props typing (Kit ≥2.16):**
`let { data, children }: import('./$types').LayoutProps = $props();`

**Returns:** A wrapper component for shared UI/state across a route
segment.

## Example

```svelte
<script lang="ts">
  import type { LayoutProps } from './$types';
  let { data, children }: LayoutProps = $props();
</script>

<nav>...</nav>
{@render children()}
```

## Related

- `+page.svelte` — rendered inside the nearest layout
- `load` — layout data loader
- `+layout.ts` — options and typing
