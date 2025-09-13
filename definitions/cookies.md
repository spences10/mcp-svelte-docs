# cookies Definition

**Definition:** Server utilities for reading/writing cookies on
requests.

**Syntax:** in server `load`/endpoints: `event.cookies`

**API:**

- `get(name)` — read a cookie
- `set(name, value, options)` — set cookie
- `delete(name, options)` — delete cookie

**Returns:** Cookie helpers bound to the current request.

## Example

```ts
export const load = ({ cookies }) => {
	const theme = cookies.get('theme') ?? 'light';
	return { theme };
};
```

## Related

- `locals`, `+server.ts`, `hooks.server`

Notes:

- `event.fetch` forwards cookies for same-origin and certain
  subdomains; otherwise add them in `handleFetch`.
