# onclick Definition

**Definition:** Standard HTML event attributes replace on: directives  
**Syntax:** `onclick={handler}` (instead of `on:click={handler}`)  
**Parameters:**
- `handler` - Function to handle the click event
**Returns:** void
**Examples:**
- `onclick={handleClick}`
- `onsubmit={handleSubmit}`  
- `oninput={handleInput}`

## Examples

```svelte
<script>
  let count = $state(0);
  
  function handleClick() {
    count++;
  }
  
  function handleInput(event) {
    console.log(event.target.value);
  }
</script>

<!-- Svelte 5 event handling -->
<button onclick={handleClick}>
  Clicked {count} times
</button>

<input oninput={handleInput} />

<!-- Inline handlers -->
<button onclick={() => count++}>
  Increment
</button>
```

## Related
- `component-events` - For component-to-component communication
- `$effect` - For responding to state changes from events
- `on:click` - Svelte 4 pattern that onclick replaces
