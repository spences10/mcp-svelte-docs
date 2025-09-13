# $app/server Definition

**Definition:** Server-only utilities for remote functions and server
helpers: `getRequestEvent`, `read`, and creators for `query`, `form`,
`command`, `prerender` (experimental ≥2.27).

**Syntax:**
`import { getRequestEvent, read, query, form, command, prerender } from '$app/server'`

**API:**

- `getRequestEvent()` — current RequestEvent (sync in environments
  without AsyncLocalStorage)
- `read(asset)` — read imported asset contents as a Response
- `query/schema` — create server query (supports validation, batch,
  `.refresh()/.set()`)
- `form` — create spreadable form object with progressive enhancement
- `command` — create server mutation callable from code (not during
  render)
- `prerender` — create build-time data function (with `inputs`,
  `dynamic`)

## Example

```ts
import { getRequestEvent, query } from '$app/server';

export const me = query(async () => {
	const { cookies, locals } = getRequestEvent();
	return await locals.userFrom(cookies.get('sessionid'));
});
```

## Related

- `remote-functions`, `hooks.server.handleValidationError`
