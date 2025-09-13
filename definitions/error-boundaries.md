# error-boundaries Definition

**Definition:** Add `+error.svelte` to render a custom error page for
errors thrown during `load`/rendering in the corresponding route
subtree.

**Syntax:** `src/routes/+error.svelte`, or nested
`.../route/+error.svelte`

**Notes:**

- SvelteKit walks up to the nearest `+error.svelte` if a child doesn’t
  exist.
- Errors in `+server` handlers and `handle` do not use
  `+error.svelte`; they return JSON or fallback error page.
- For 404s with no matched route, root `+error.svelte` is used.

## Example

```svelte
<script>
  import { page } from '$app/state';
</script>
<h1>{page.status}: {page.error.message}</h1>
```

## Related

- `advanced-routing`, `hooks.server.handleError`
