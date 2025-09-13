# json Definition

**Definition:** Helper to create a JSON `Response` with proper
headers.

**Syntax:** `json(data: unknown, init?: ResponseInit)`

**Parameters:**

- `data` — serializable data
- `init` — headers/status

**Returns:** `Response`

## Example

```ts
import { json } from '@sveltejs/kit';
export const GET = () => json({ ok: true }, { status: 200 });
```

## Related

- `+server.ts`, `error`, `redirect`
