# +layout.server.ts Definition

**Definition:** Server-only layout module exporting a `load` that runs
on the server for a layout segment. Useful for auth checks and shared
server data.

**Syntax:** `src/routes/(...)/+layout.server.ts` (or `.js`)

**Exports:**

- `export const load: LayoutServerLoad` — server-only loader (must
  return serializable data)
- Page options: `prerender`, `ssr`, `csr` defaults for children

**Returns:** Data merges downward to child layouts and pages.

## Example

```ts
// +layout.server.ts
import type { LayoutServerLoad } from './$types';
import { error } from '@sveltejs/kit';

export const load: LayoutServerLoad = async ({ locals }) => {
	if (!locals.user) throw error(401, 'not logged in');
	return { user: locals.user };
};
```

## Related

- `+layout.svelte`, `+layout.ts`, `load`, `hooks.server`
