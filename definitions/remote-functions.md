# remote-functions Definition

**Definition:** Experimental, opt-in feature (Kit ≥2.27) for type-safe
client→server functions defined in `.remote.(js|ts)` using
`$app/server` helpers: `query`, `form`, `command`, `prerender`.

**Opt-in:** `kit.experimental.remoteFunctions = true` (and optionally
Svelte compiler `experimental.async = true` for `await` in
components.)

**Flavours:**

- `query` — read dynamic data; callable from components; supports
  argument validation; has `.refresh()/.set()`
- `form` — write via spreadable form object; progressively enhances;
  supports single-flight updates
- `command` — write from arbitrary code; cannot redirect; can
  `.updates(...)`
- `prerender` — build-time data (with `inputs` and `dynamic` options)

## Example

```ts
// src/routes/data.remote.ts
import * as v from 'valibot';
import { query, form } from '$app/server';
import { error, redirect } from '@sveltejs/kit';
import * as db from '$lib/server/database';

export const getPosts = query(async () => db.listPosts());
export const getPost = query(v.string(), async (slug) =>
	db.getPost(slug),
);
export const createPost = form(async (data) => {
	const title = data.get('title');
	if (typeof title !== 'string') throw error(400, 'title required');
	await db.createPost(title);
	throw redirect(303, '/blog');
});
```

## Notes

- Remote files live under `src/` and export functions; client calls
  fetch generated endpoints.
- Use `getRequestEvent()` inside to access cookies/locals.
- Validation uses Standard Schema (e.g., Zod/Valibot). Use
  `'unchecked'` to skip.
- `redirect(...)` allowed in `query/form/prerender`, not in `command`.

## Related

- `$app/server`, `$app/navigation.refreshAll`, `await-expressions`,
  `$derived`
