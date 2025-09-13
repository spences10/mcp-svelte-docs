# +layout.ts Definition

**Definition:** Companion module for a layout that declares options
and exposes `LayoutData` typing.

**Syntax:** `src/routes/(...)/+layout.ts` (or `.js`)

**Parameters:**

- `export const prerender` — `true | 'auto' | false`
- `export const csr` — `boolean`
- `export const ssr` — `boolean`
- `export const trailingSlash` — `'always' | 'never' | 'ignore'`
- `export const config` — adapter-specific options merged top-level
  with child pages

**Returns:** Controls how the layout and its children render.

## Example

```ts
export const prerender = 'auto';
export type LayoutLoad = import('./$types').LayoutLoad;
export type LayoutData = import('./$types').LayoutData;
```

## Related

- `+layout.svelte` — layout component
- `load` — layout loader
