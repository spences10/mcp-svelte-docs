# layout-groups Definition

**Definition:** Parentheses-named directories `(group)` organize
routes under separate layout hierarchies without affecting the URL
pathname.

**Syntax:** `src/routes/(app)/...` and `src/routes/(marketing)/...`

**Returns:** Layouts inside a group apply only to routes in that
group.

## Example

```txt
src/routes/
├ (app)/
│ ├ dashboard/
│ ├ item/
│ └ +layout.svelte
├ (marketing)/
│ ├ about/
│ ├ testimonials/
│ └ +layout.svelte
└ +layout.svelte
```

## Related

- `page-reset-layout`, `layout-reset`, `advanced-routing`
