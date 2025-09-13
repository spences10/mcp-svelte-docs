# +page.ts Definition

**Definition:** Companion module for a page that declares page
options, and (in TS) exposes helper types via `./$types`.

**Syntax:** `src/routes/(...)/+page.ts` (or `+page.js`)

**Parameters:**

- `export const prerender` — `true | 'auto' | false`
- `export const csr` — `boolean` (enable/disable client-side
  hydration)
- `export const ssr` — `boolean` (enable/disable server rendering)
- `export const trailingSlash` — `'always' | 'never' | 'ignore'`
- `export const entries` — function to enumerate dynamic entries for
  prerendering
- `export const config` — adapter-specific options merged from parent
  layout

Notes:

- Pages with form actions cannot be prerendered.
- `entries` applies to dynamic routes to seed the prerender crawler.

**Returns:** Controls how the page is rendered and navigated.

## Example

```ts
export const prerender = true;
export const csr = true;
export const ssr = true;
export const trailingSlash = 'never';

export type PageLoad = import('./$types').PageLoad;
export type PageData = import('./$types').PageData;
```

## Related

- `+page.svelte` — page component
- `load` — page loader
