# event-modifiers Definition

**Definition:** Event modifier syntax for controlling event behavior
in Svelte 5  
**Syntax:** `on:event|modifier` or `on:event|modifier1|modifier2`  
**Modifiers:**

- `preventDefault` - Calls `event.preventDefault()`
- `stopPropagation` - Calls `event.stopPropagation()`
- `capture` - Adds event listener during capture phase
- `once` - Removes listener after first trigger
- `passive` - Never calls `preventDefault()` for performance
- `nonpassive` - Explicitly non-passive (default)
- `self` - Only trigger if `event.target` is element itself  
  **Returns:** Modified event handling behavior  
  **Chaining:** Multiple modifiers can be combined with `|`

## Examples

```svelte
<!-- Prevent default form submission -->
<form on:submit|preventDefault={handleSubmit}>
  <button type="submit">Submit</button>
</form>

<!-- Stop event bubbling -->
<div on:click={handleOuter}>
  <button on:click|stopPropagation={handleButton}>
    Click me (won't trigger outer handler)
  </button>
</div>

<!-- Capture phase event handling -->
<div on:click|capture={handleCapture}>
  <span>Capture clicks during capture phase</span>
</div>

<!-- One-time event listener -->
<button on:click|once={handleOnce}>
  Click me once
</button>

<!-- Passive scroll for performance -->
<div on:scroll|passive={handleScroll}>
  Scrollable content
</div>

<!-- Only trigger on self, not children -->
<div on:click|self={handleSelf}>
  <span>Child element</span>
  <span>Only clicking div itself triggers handler</span>
</div>

<!-- Multiple modifiers combined -->
<form on:submit|preventDefault|stopPropagation={handleForm}>
  Combined modifiers
</form>
```

## Related

- `onclick` - Basic event handling patterns
- `custom-events` - Creating and dispatching custom events
- `event-delegation` - Advanced event handling patterns
- `component-events` - Component-to-component event communication
