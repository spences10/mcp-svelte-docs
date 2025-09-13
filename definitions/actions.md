# actions Definition

**Definition:** Server-only form actions defined in `+page.server.ts`
to handle POSTed form data and mutations.

**Syntax:**
`export const actions = { name: async (event) => { ... } }`

**Parameters:**

- `event.request` — form data via `await request.formData()`
- `event.locals`, `event.cookies`
- `fail(status, data)` — return validation errors
- `redirect(status, location)` — navigate after success

**Returns:** Action result is available via the page `form` prop and
`page.form` until the next update.

## Example

```ts
// +page.server.ts
import { fail, redirect } from '@sveltejs/kit';

export const actions = {
	login: async ({ request, locals }) => {
		const data = await request.formData();
		const email = data.get('email');
		if (!email) return fail(400, { message: 'Email required' });
		await locals.auth.login(email as string);
		redirect(303, '/dashboard');
	},
};
```

## Related

- `enhance` — progressive enhancement for forms
- `fail`, `redirect`
