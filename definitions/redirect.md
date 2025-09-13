# redirect Definition

**Definition:** Throw an HTTP redirect with status and location.

**Syntax (Kit 2+):** `throw redirect(status, location)`

Important:

- You must `throw redirect(...)` — do not call it without throwing.
- Use inside server/universal `load`, actions, and `+server` handlers.

## Example

```ts
import { redirect } from '@sveltejs/kit';
throw redirect(303, '/login');
```

## Related

- `error`, `json`
- `actions`
