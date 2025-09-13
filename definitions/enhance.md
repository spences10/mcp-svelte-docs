# enhance Definition

**Definition:** Client-side helper to progressively enhance `<form>`
submissions by calling actions via fetch and updating UI without a
full navigation.

**Syntax:** `import { enhance } from '$app/forms'`

**Parameters:**

- `use:enhance` — enhance a `<form method="POST">`
- Callback (SubmitFunction):
  `({ action, formData, formElement, controller, submitter, cancel }) => ( { formData, formElement, action, result, update } ) => void`
- `update({ reset?, invalidateAll? })` — run default post-submit
  behavior
- Requires `method="POST"` and an action in `+page.server.*`

**Returns:** Unsubscribable cleanup function.

## Example

```svelte
<script lang="ts">
  import { enhance } from '$app/forms';
  let pending = false;
</script>

<form method="POST" use:enhance={({ action, formData, formElement, cancel, controller, submitter }) => {
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
