# $app/paths Definition

**Definition:** Helpers for base/assets paths and resolving URLs or
route IDs respecting `config.kit.paths`.

**Syntax:** `import { asset, resolve } from '$app/paths'`

**API:**

- `asset(file)` — resolve URL for assets in `static/` honoring
  `paths.assets` (2.26+)
- `resolve(pathOrRoute, params?)` — resolve pathname or route ID with
  params honoring base path (2.26+)
- Deprecated: `assets`, `base`, `resolveRoute`

## Example

```svelte
<script>
  import { asset, resolve } from '$app/paths';
  const img = asset('/logo.png');
  const url = resolve('/blog/[slug]', { slug: 'hello-world' });
</script>

<img src={img} alt="logo" />
<a href={url}>Post</a>
```

## Related

- `configuration#paths`, `$app/navigation`
