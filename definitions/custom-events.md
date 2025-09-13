# custom-events Definition

**Definition:** Creating and dispatching custom events for
component-to-component communication in Svelte 5  
**Syntax:** Event callback props or direct event dispatching
patterns  
**Methods:**

- Callback props: `onclick: (event) => void` prop pattern
- Direct dispatch: Using native `dispatchEvent()` with custom events
- Event forwarding: `on:event` forwarding to parent components  
  **Returns:** Custom event communication between components  
  **Replaces:** Svelte 4's `createEventDispatcher()` function

## Examples

```svelte
<!-- Child component with callback props -->
<script>
  let { onUserSelect, onItemClick } = $props();

  function handleClick(user) {
    // Call parent's callback with event data
    onUserSelect?.(user);
  }
</script>

<button on:click={() => handleClick({ id: 1, name: 'Alice' })}>
  Select User
</button>

<!-- Parent component receiving custom events -->
<script>
  function handleUserSelect(user) {
    console.log('User selected:', user);
  }

  function handleItemClick(item) {
    console.log('Item clicked:', item);
  }
</script>

<ChildComponent
  onUserSelect={handleUserSelect}
  onItemClick={handleItemClick}
/>

<!-- Alternative: Direct event dispatching -->
<script>
  import { createEventDispatcher } from 'svelte';

  // For components that need DOM event dispatching
  let element;

  function dispatchCustom(data) {
    element?.dispatchEvent(new CustomEvent('customEvent', {
      detail: data,
      bubbles: true
    }));
  }
</script>

<div bind:this={element} on:click={() => dispatchCustom({ value: 42 })}>
  Click to dispatch custom event
</div>

<!-- Event forwarding pattern -->
<script>
  let { onButtonClick } = $props();
</script>

<!-- Forward built-in events -->
<button on:click on:mouseenter>
  Forwarded events
</button>

<!-- Forward with custom logic -->
<button on:click={(e) => onButtonClick?.(e.target.textContent)}>
  Custom forwarding
</button>
```

## Related

- `component-events` - Patterns for component communication
- `onclick` - Basic event handling
- `event-modifiers` - Modifying event behavior
- `$props` - Receiving event callback props
