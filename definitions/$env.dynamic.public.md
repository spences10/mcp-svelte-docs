# $env/dynamic/public Definition

**Definition:** Runtime (dynamic) public environment variables safe
for client usage. Includes only variables with `publicPrefix` (default
`PUBLIC_`).

**Syntax:** `import { env } from '$env/dynamic/public'`

**Notes:**

- Public dynamic vars are sent from server to client; prefer
  `$env/static/public` when possible.

## Example

```ts
import { env } from '$env/dynamic/public';
const base = env.PUBLIC_BASE_URL;
```

## Related

- `$env/static/public`, `$env/dynamic/private`
