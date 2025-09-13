# redirect Definition

**Definition:** Helper to trigger an HTTP redirect with status and
location.

**Syntax (Kit 2+):** `redirect(status: number, location: string)`

Important:

- Call `redirect(...)` directly — do not `throw` it (it throws
  internally).
- Use inside server/universal `load`, actions, and endpoint handlers.

## Example

```ts
import { redirect } from '@sveltejs/kit';
redirect(303, '/login');
```

## Related

- `error`, `json`
- `actions`
