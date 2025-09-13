# hooks.server Definition

**Definition:** Server hook module that customizes request handling.

**Syntax:** `src/hooks.server.ts`

**Exports:**

- `handle` — wraps all requests
- `handleFetch` — intercepts server-side fetch
- `handleError` — central error logging/formatting
- `init` — optional async initialization on server startup
  (ServerInit)
- `handleValidationError` — customize remote function validation
  errors

## Example

```ts
// src/hooks.server.ts
import type { Handle, HandleFetch, HandleError } from '@sveltejs/kit';

export const handle: Handle = async ({ event, resolve }) => {
	event.locals.user = await getUserFromSession(event.cookies);
	return resolve(event);
};

export const handleFetch: HandleFetch = async ({
	request,
	fetch,
}) => {
	return fetch(request);
};

export const handleError: HandleError = ({ error, event }) => {
	console.error('Error', event.route.id, error);
};

// Optional: run once before first request is handled
import type {
	ServerInit,
	HandleValidationError,
} from '@sveltejs/kit';

export const init: ServerInit = async () => {
	// warm caches, connect to services, etc.
};

export const handleValidationError: HandleValidationError = ({
	issues,
	event,
}) => {
	return { message: 'Invalid request' };
};
```

## Related

- `locals`, `cookies`
- `+server.ts`
