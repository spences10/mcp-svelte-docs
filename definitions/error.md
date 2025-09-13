# error Definition

**Definition:** Helper to abort `load`/actions/endpoints with an HTTP
error.

**Syntax (Kit 2+):**
`error(status: number, body?: string | { message: string })`

Important:

- Call `error(...)` directly — do not `throw` it (it throws
  internally).
- Use inside server and universal `load`, form actions, and endpoint
  handlers.

## Example

```ts
import { error } from '@sveltejs/kit';
if (!item) error(404, 'Not found');
```

## Related

- `redirect`, `json`
