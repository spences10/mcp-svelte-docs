# setHeaders Definition

**Definition:** Helper available in `load` (server and universal) to
set HTTP headers on the response during SSR.

**Syntax:** `setHeaders(headers: Record<string, string>)`

Important:

- No effect in the browser; only works during SSR/build.
- You cannot set `set-cookie` — use `cookies.set(...)` in server
  `load`/actions.
- Each header can be set at most once across all `load` functions.

## Example

```ts
export const load: import('./$types').PageLoad = async ({
	fetch,
	setHeaders,
}) => {
	const res = await fetch('/api/data');
	setHeaders({
		'cache-control': res.headers.get('cache-control') ?? 'max-age=60',
	});
	return { data: await res.json() };
};
```

## Related

- `load`, `cookies`, `+server.ts`
