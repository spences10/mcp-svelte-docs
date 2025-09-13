# $env/dynamic/private Definition

**Definition:** Runtime (dynamic) private environment variables
available on the server. Excludes variables with `publicPrefix` and
includes those with `privatePrefix` (if configured).

**Syntax:** `import { env } from '$env/dynamic/private'`

**Notes:**

- Server-only; cannot be imported in client code.
- In dev, includes vars from `.env`; in prod, depends on adapter.

## Example

```ts
import { env } from '$env/dynamic/private';
const secret = env.SECRET_API_KEY;
```

## Related

- `$env/static/private`, `$env/dynamic/public`
