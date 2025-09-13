# $app/state Definition

**Definition:** Read-only state module providing `page`, `navigating`,
and `updated` for reactive routing and version info. Supersedes
`$app/stores` in Kit ≥2.12.

**Syntax:** `import { page, navigating, updated } from '$app/state'`

**API:**

- `page` — reactive object for `url`, `params`, `data`, `form`,
  `route`, `status`, `error`
- `navigating` — navigation info (`from`, `to`, `type`, `delta`, null
  on server or idle)
- `updated` — object with `current: boolean` and
  `check(): Promise<boolean>`

Note: `$app/state` values update reactively only via runes (e.g.
`$derived`).

## Example

```svelte
<script>
  import { page, navigating, updated } from '$app/state';
  const path = $derived(page.url.pathname);
</script>

<h1>{path}</h1>
{#if navigating?.to}
  <p>Navigating…</p>
{/if}
```

## Related

- `$app/navigation`, `$app/stores`
