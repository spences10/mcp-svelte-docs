# error Definition

**Definition:** Throw an HTTP error from `load`/actions/`+server`
handlers.

**Syntax (Kit 2+):** `throw error(status, messageOrBody)`

Important:

- You must `throw error(...)` — do not call it without throwing.
- Use inside server/universal `load`, actions, and `+server` handlers.

## Example

```ts
import { error } from '@sveltejs/kit';
if (!item) throw error(404, 'Not found');
```

## Related

- `redirect`, `json`
