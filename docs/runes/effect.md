# $effect Rune

## Description

The $effect rune is used to run side effects when reactive values
change. It's similar to useEffect in React or onMount/onDestroy in
Svelte 4.

## Basic Syntax

```js
// Basic effect
$effect(() => {
	console.log(`Count is now: ${count}`);
});

// Effect with cleanup
$effect(() => {
	const interval = setInterval(() => count++, 1000);
	return () => clearInterval(interval);
});

// Pre-update effect (runs before DOM updates)
$effect.pre(() => {
	// Do something before DOM updates
});

// One-time effect (like onMount)
$effect(
	() => {
		// Runs once during initialization
	},
	{ priority: 1 },
);
```

## Examples

### Basic Effect

```svelte
<script>
  let count = $state(0);

  $effect(() => {
    console.log('Count changed:', count);
  });

  function increment() {
    count++;
  }
</script>

<button onclick={increment}>Increment ({count})</button>
```

### Effect with Cleanup

```svelte
<script>
  let count = $state(0);

  $effect(() => {
    console.log('Setting up timer');
    const interval = setInterval(() => {
      count++;
    }, 1000);

    // Return cleanup function
    return () => {
      console.log('Cleaning up timer');
      clearInterval(interval);
    };
  });
</script>

<p>Count: {count}</p>
```

### Conditional Effect

```svelte
<script>
  let isVisible = $state(true);
  let count = $state(0);

  $effect(() => {
    if (isVisible) {
      console.log('Component is visible, count:', count);
    }
  });
</script>

<button onclick={() => isVisible = !isVisible}>
  Toggle Visibility
</button>
{#if isVisible}
  <p>Count: {count}</p>
  <button onclick={() => count++}>Increment</button>
{/if}
```

## Best Practices

- Use $effect for side effects like logging, DOM manipulation, or API
  calls
- Return a cleanup function if your effect creates resources that need
  to be cleaned up
- Keep effects focused on a single responsibility
- Avoid changing state in effects unless you have safeguards against
  infinite loops
- Use $effect.pre for effects that need to run before DOM updates
