# component-events Definition

**Definition:** Callback props replace event dispatching  
**Pattern:**
```svelte
<!-- Child component -->
let { onMessage } = $props();

<!-- Parent component -->
<Child onMessage={(data) => console.log(data)} />
```
**Parameters:**
- Callback functions passed as props
**Returns:** void (callbacks handle the communication)

## Examples

```svelte
<!-- Child.svelte -->
<script>
  let { onSubmit, onCancel } = $props();
  
  let formData = $state({ name: '', email: '' });
  
  function handleSubmit() {
    onSubmit?.(formData);
  }
</script>

<form>
  <input bind:value={formData.name} />
  <input bind:value={formData.email} />
  <button onclick={handleSubmit}>Submit</button>
  <button onclick={() => onCancel?.()}>Cancel</button>
</form>

<!-- Parent.svelte -->
<script>
  function handleFormSubmit(data) {
    console.log('Form submitted:', data);
  }
  
  function handleCancel() {
    console.log('Form cancelled');
  }
</script>

<Child 
  onSubmit={handleFormSubmit}
  onCancel={handleCancel}
/>
```

## Related
- `$props` - For receiving callback props
- `onclick` - For DOM event handling
- `createEventDispatcher` - Svelte 4 pattern that callbacks replace
