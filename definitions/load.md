# load Definition

**Definition:** Data loading function for pages and layouts. Page
`load` runs in the browser (and server on the first render); layout
`load` runs where it is invoked. A `load` in `+page.server.ts`/`.js`
or `+layout.server.ts`/`.js` runs only on the server.

**Syntax:**

- Page:
  `export const load: PageLoad = ({ fetch, params, data, depends, parent }) => { ... }`
- Layout:
  `export const load: LayoutLoad = ({ fetch, params, data, depends, parent }) => { ... }`
- Server:
  `export const load: PageServerLoad | LayoutServerLoad = ({ cookies, locals, setHeaders, fetch }) => { ... }`

**Parameters:**

- `fetch` — SvelteKit-aware fetch
- `params` — route parameters
- `data` — parent data (layout→child)
- `depends` — declare cache dependencies
- `parent` — await parent data
- `cookies`, `locals`, `setHeaders` — server-only

**Returns:** Object merged into `data` for the corresponding
component.

## Example

```ts
// +page.ts
export const load: import('./$types').PageLoad = async ({
	fetch,
	params,
	depends,
}) => {
	depends('app:posts');
	const res = await fetch(`/api/posts?tag=${params.tag}`);
	return { posts: await res.json() };
};
```

## Related

- `depends`, `parent`, `setHeaders`
- `+page.svelte`, `+layout.svelte`
- `error`, `redirect`
