# Event Handling

## Description

Svelte 5 uses standard HTML attributes for event handling instead of
the directive syntax used in Svelte 4.

## Basic Syntax

```js
// DOM events
<button onclick={handleClick}>Click</button>

// With function shorthand
<button onclick={() => count++}>Click</button>

// Event with capture
<button onclickcapture={handleClick}>Click</button>

// Preventing default
<form onsubmit={(e) => {
  e.preventDefault();
  // Handle form submission
}}>
```

## Examples

### Basic Event Handling

```svelte
<script>
  let count = $state(0);

  function handleClick() {
    count++;
  }
</script>

<button onclick={handleClick}>
  Clicked {count} times
</button>
```

### Inline Event Handlers

```svelte
<script>
  let count = $state(0);
</script>

<button onclick={() => count++}>
  Clicked {count} times
</button>
```

### Event Object Access

```svelte
<script>
  let position = $state({ x: 0, y: 0 });

  function handleMousemove(event) {
    position.x = event.clientX;
    position.y = event.clientY;
  }
</script>

<div onmousemove={handleMousemove} style="height: 100%; width: 100%;">
  The mouse position is {position.x} x {position.y}
</div>
```

### Form Events

```svelte
<script>
  let name = $state('');
  let submitted = $state(false);

  function handleSubmit(event) {
    event.preventDefault();
    submitted = true;
  }
</script>

<form onsubmit={handleSubmit}>
  <input
    type="text"
    value={name}
    oninput={(e) => name = e.target.value}
  />
  <button type="submit">Submit</button>
</form>

{#if submitted}
  <p>You submitted: {name}</p>
{/if}
```

## Event Modifiers

In Svelte 5, event modifiers are replaced with wrapper functions:

```svelte
<script>
  // Helper for preventing default
  function preventDefault(handler) {
    return (event) => {
      event.preventDefault();
      handler(event);
    };
  }

  function handleSubmit(event) {
    // Form submission logic
  }
</script>

<form onsubmit={preventDefault(handleSubmit)}>
  <!-- form content -->
</form>
```

## Best Practices

- Use standard HTML attributes for event handling (onclick, onsubmit,
  etc.)
- For event modifiers, use wrapper functions instead of the pipe
  syntax from Svelte 4
- For multiple handlers, combine them into a single function
- Keep event handlers simple, moving complex logic to separate
  functions
- Remember that event names are lowercase in HTML (onclick, not
  onClick)
