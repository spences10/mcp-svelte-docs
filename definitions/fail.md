# fail Definition

**Definition:** Helper to return a failed action result with an HTTP
status and data. Does not throw.

**Syntax:** `fail(status: number, data?: unknown)`

**Parameters:**

- `status` — HTTP status code (e.g., 400, 422)
- `data` — serializable error payload

**Returns:** An `ActionFailure` consumed by SvelteKit.

## Example

```ts
import { fail } from '@sveltejs/kit';
return fail(400, { field: 'email', message: 'Email required' });
```

## Related

- `actions`, `enhance`
