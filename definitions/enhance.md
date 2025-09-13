# enhance Definition

**Definition:** Client-side helper to progressively enhance `<form>`
submissions by calling actions via fetch and updating UI without full
navigation.

**Syntax:** `import { enhance } from '$app/forms'`

**Parameters:**

- `use:enhance` — enhance a `<form method="POST">`
- Callback:
  `({ formElement, formData, action, cancel, submitter }) => ( { result, update } ) => void`
- `update({ reset?, invalidateAll? })` — run default post-submit
  behavior
- Requires `method="POST"` and an action in `+page.server.*`

**Returns:** Unsubscribable cleanup function.

## Example

```svelte
<script>
  import { enhance } from '$app/forms';
  let pending = false;
</script>

<form method="POST" use:enhance={({ formElement, formData, action, cancel }) => {
  return async ({ result, update }) => {
    await update(); // default behavior (updates form/page.form, invalidates)
  };
}}>
  <!-- inputs -->
</form>
```

## Related

- `actions`, `fail`
- `$app/forms`
