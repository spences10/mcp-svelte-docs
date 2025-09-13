# $app/stores Definition

**Definition:** Client-accessible Svelte stores reflecting navigation
state.

Note: Deprecated in SvelteKit 2.12+ in favor of `$app/state` (use
identical APIs via runes). Existing apps may still use `$app/stores`.

**Syntax:** `import { page, navigating, updated } from '$app/stores'`

**Stores:**

- `page` — `Readable<Page>` with params, route, data
- `navigating` — `Readable<Navigating | null>`
- `updated` — `Readable<boolean> & { check(): Promise<boolean> }`

## Example

```svelte
<script lang="ts">
  import { page, navigating, updated } from '$app/stores';
  $: title = $page.url.pathname;
</script>
<h1>{title}</h1>
{#if $navigating}<p>Loading…</p>{/if}
```

## Related

- `$app/state`, `$app/navigation`, `load`
