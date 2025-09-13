# $env/static/public Definition

**Definition:** Build-time (static) public environment variables safe
for client usage. Includes only variables with `publicPrefix` (default
`PUBLIC_`).

**Syntax:** `import { PUBLIC_... } from '$env/static/public'`

**Notes:**

- Values are statically replaced at build time.

## Example

```ts
import { PUBLIC_BASE_URL } from '$env/static/public';
```

## Related

- `$env/static/private`, `$env/dynamic/public`
