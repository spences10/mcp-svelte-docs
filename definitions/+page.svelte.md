# +page.svelte Definition

**Definition:** SvelteKit route component rendered for a page. Lives
alongside `+page.ts`/`+page.js` and optional `+page.server.ts`/`.js`.
Receives `data` (and `form`, when relevant) from its `load`/actions
and participates in the layout tree.

**Syntax:** `src/routes/(...)/+page.svelte`

**Props typing (Kit ≥2.16):**
`let { data, form }: import('./$types').PageProps = $props();`

**Returns:** A client-rendered component hydrated according to project
`ssr/csr` settings.

## Example

```svelte
<script lang="ts">
  import type { PageProps } from './$types';
  let { data }: PageProps = $props();
  const { user, posts } = data;
  // legacy typing (pre-2.16):
  // let { data }: { data: import('./$types').PageData } = $props();
</script>

<h1>Welcome {user.name}</h1>
{#each posts as post}
  <a href={post.href}>{post.title}</a>
{/each}
```

## Related

- `+layout.svelte` — parent layout component
- `load` — page data loader
- `+page.ts` — page options and types
- `error` / `redirect` — control flow from loaders
