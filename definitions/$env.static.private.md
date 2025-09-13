# $env/static/private Definition

**Definition:** Build-time (static) private environment variables
injected by Vite from `.env` and `process.env`. Excludes
`publicPrefix` and includes `privatePrefix` (if configured).

**Syntax:** `import { NAME } from '$env/static/private'`

**Notes:**

- Values are statically replaced at build time; enables dead code
  elimination.
- Declare all referenced variables (even if empty) to avoid undefined
  at build.

## Example

```ts
import { API_KEY } from '$env/static/private';
```

## Related

- `$env/dynamic/private`, `$env/static/public`
