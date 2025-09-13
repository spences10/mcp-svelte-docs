# param-matchers Definition

**Definition:** Validate dynamic segments with matchers implemented in
`src/params/<name>`. Use `[param=name]` in route path.

**Syntax:**

- `src/params/fruit.(js|ts)` exports `match(param): boolean`
- `src/routes/fruits/[page=fruit]/+page.svelte`

## Example

```ts
// src/params/fruit.ts
import type { ParamMatcher } from '@sveltejs/kit';
export const match = ((param: string): param is 'apple' | 'orange' =>
	param === 'apple' || param === 'orange') satisfies ParamMatcher;
```

## Related

- `advanced-routing`, `optional-parameters`, `rest-parameters`
