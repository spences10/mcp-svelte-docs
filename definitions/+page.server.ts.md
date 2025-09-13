# +page.server.ts Definition

**Definition:** Server-only page module exporting a `load` that runs
on the server and optional form `actions`. Suitable for accessing
databases, private env, and cookies.

**Syntax:** `src/routes/(...)/+page.server.ts` (or `.js`)

**Exports:**

- `export const load: PageServerLoad` — server-only loader (must
  return serializable data)
- `export const actions` — form actions map (`default` or named)
- Page options: `prerender`, `ssr`, `csr`

**Returns:** Data is serialized and sent to the client; during client
navigation, fetched from the server.

## Example

```ts
// +page.server.ts
import type { PageServerLoad, Actions } from './$types';
import { error, redirect, fail } from '@sveltejs/kit';

export const load: PageServerLoad = async ({
	params,
	cookies,
	locals,
}) => {
	const session = cookies.get('sessionid');
	if (!session) throw redirect(307, '/login');
	const user = await locals.db.getUser(session);
	if (!user) throw error(401, 'not logged in');
	return { user };
};

export const actions: Actions = {
	default: async ({ request, locals }) => {
		const data = await request.formData();
		const name = data.get('name');
		if (!name) return fail(400, { missing: true });
		await locals.db.updateName(name as string);
		return { success: true };
	},
};
```

## Related

- `+page.svelte`, `+page.ts`, `actions`, `$env/*`
