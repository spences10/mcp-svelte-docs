# +server.ts Definition

**Definition:** Route module that exports HTTP method handlers for
endpoints. Runs only on the server.

**Syntax:** `src/routes/(...)/+server.ts` (or `.js`)

**Parameters:**

- `export const GET/POST/PATCH/PUT/DELETE/OPTIONS` — request handlers
- `export const fallback` — optional handler for all other methods
- `RequestHandler` — type for handlers, with `locals`, `cookies`, etc.

**Returns:** Sends a `Response` using Web Fetch APIs or helper `json`.

## Example

```ts
import type { RequestHandler } from './$types';
import { json, error } from '@sveltejs/kit';

export const GET: RequestHandler = async ({ url, locals }) => {
	const id = url.searchParams.get('id');
	if (!id) throw error(400, 'id required');
	const item = await locals.db.get(id);
	return json(item);
};
```

## Related

- `json` — helper for JSON responses
- `cookies`, `locals` — request utilities
- Note: `+layout` options don’t affect `+server` routes
- Notes: `HEAD` responses mirror `GET` body length; content
  negotiation prefers page for Accept: text/html
