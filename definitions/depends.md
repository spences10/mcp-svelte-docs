# depends Definition

**Definition:** Declare a cache dependency key that ties `load`
results to invalidation.

**Syntax:** `depends(...keys: string[])`

**Parameters:**

- `keys` — strings like `app:resource` used by
  `invalidate`/`invalidateAll`

**Returns:** Void — registers dependency for the current `load`.

## Example

```ts
export const load = ({ depends }) => {
	depends('app:posts');
	return {
		/* data */
	};
};
```

## Related

- `$app/navigation.invalidate`, `invalidateAll`
- `load`
