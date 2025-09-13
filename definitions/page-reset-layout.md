# page-reset-layout Definition

**Definition:** Use `+page@<segment>.svelte` (or `+page@.svelte` for
root) to reset which ancestor layout a page inherits from.

**Syntax:** `+page@[id].svelte`, `+page@item.svelte`,
`+page@(group).svelte`, `+page@.svelte`

**Returns:** The page uses the chosen ancestor layout instead of the
nearest one.

## Related

- `layout-reset`, `layout-groups`, `advanced-routing`
