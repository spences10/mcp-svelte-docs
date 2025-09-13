# locals Definition

**Definition:** Per-request mutable object available on the server for
storing authenticated user/session or request-scoped data.

**Access:** `event.locals` in server `load`, form actions, and
`+server` endpoints.

**Typing:** Extend `App.Locals` in `src/app.d.ts` to define shape.

## Example

```ts
// src/hooks.server.ts
export const handle = async ({ event, resolve }) => {
	event.locals.user = await getUser(event.cookies.get('sessionid'));
	return resolve(event);
};

// +page.server.ts
export const load = ({ locals }) => ({ user: locals.user });
```

## Related

- `hooks.server`, `cookies`
