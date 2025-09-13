# parent Definition

**Definition:** Function available in `load` that returns a promise
resolving to parent data (layout→child).

**Syntax:** `const data = await parent()`

**Returns:** The parent loader’s returned data object.

## Example

```ts
export const load = async ({ parent }) => {
	const { user } = await parent();
	return { user };
};
```

## Related

- `load`, `+layout.svelte`
