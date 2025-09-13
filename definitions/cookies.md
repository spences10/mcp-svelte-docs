# cookies Definition

**Definition:** Server utilities for reading/writing cookies on
requests.

**Syntax:** in server `load`/endpoints: `event.cookies`

**API:**

- `get(name)` — read a cookie (optionally `getAll()`)
- `set(name, value, { path, ...options })` — set cookie (path is
  required)
- `delete(name, { path, ...options })` — delete cookie (path must
  match)

**Returns:** Cookie helpers bound to the current request.

## Example

```ts
export const load = ({ cookies }) => {
	const theme = cookies.get('theme') ?? 'light';
	cookies.set('seen', '1', { path: '/', httpOnly: true });
	return { theme };
};
```

## Related

- `locals`, `+server.ts`, `hooks.server`

Notes:

- `event.fetch` forwards cookies for same-origin requests; to forward
  to other origins, add headers in `handleFetch`.
