# $app/forms Definition

**Definition:** Client helpers for progressive form enhancement and
action results.

**Syntax:**
`import { enhance, applyAction, deserialize } from '$app/forms'`

**Functions:**

- `enhance(form, submit?)` — use:enhance or programmatic; optional
  callback per submit
- `applyAction(result)` — apply an `ActionResult` to the current page
- `deserialize(text)` — parse ActionResult from a fetch response

## Example

```svelte
<script lang="ts">
  import { enhance } from '$app/forms';
</script>

<form method="POST" use:enhance>
  <!-- ... -->
</form>
```

## Related

- `enhance`, `actions`, `fail`
