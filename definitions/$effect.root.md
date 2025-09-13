# $effect.root Definition

**Definition:** Creates a non-tracked scope that doesn't
auto-cleanup  
**Syntax:** `$effect.root(fn: () => void | (() => void)): () => void`  
**Parameters:**

- `fn` - Function to run, optionally returns cleanup function  
  **Returns:** Cleanup function to manually destroy the effect root  
  **Variants:**
- Part of `$effect` rune family

## Examples

```js
// Create manually controlled effect scope
const destroy = $effect.root(() => {
	$effect(() => {
		console.log('This effect runs inside the root');
	});

	return () => {
		console.log('Effect root cleanup');
	};
});

// Later, manually cleanup
destroy();

// Creating effects outside component initialization
let count = $state(0);

const cleanup = $effect.root(() => {
	$effect(() => {
		console.log('Count changed:', count);
	});

	return () => {
		console.log('Cleaning up count watcher');
	};
});

// Cleanup when needed
function stopWatching() {
	cleanup();
}
```

## Related

- `$effect` - For regular effects with auto-cleanup
- `$effect.pre` - For effects that run before DOM updates
- `$state` - For reactive state that can trigger effects
