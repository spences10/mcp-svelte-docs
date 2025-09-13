# $effect Definition

**Definition:** Performs side effects that respond to reactive state
changes  
**Syntax:** `$effect(fn: () => void | (() => void)): void`  
**Parameters:**

- `fn` - Function to run, optionally returns cleanup function  
  **Returns:** void  
  **Variants:**
- `$effect.pre(fn: () => void | (() => void)): void` - Runs before DOM
  updates
- `$effect.pending(): number` - Returns number of pending effects
- `$effect.tracking(): boolean` - Returns if currently tracking
  dependencies
- `$effect.root(fn: () => void | (() => void)): () => void` - Creates
  effect root

## Examples

```js
// Basic effect
let count = $state(0);
$effect(() => {
	console.log(`Count is ${count}`);
});

// Effect with cleanup
$effect(() => {
	const timer = setInterval(() => count++, 1000);

	return () => {
		clearInterval(timer);
	};
});

// Pre-DOM effect
$effect.pre(() => {
	// Runs before DOM updates
	console.log('Before DOM update');
});
```

## Related

- `$state` - For reactive state that triggers effects
- `$derived` - For computed values that can trigger effects
- `$effect.pre` - For effects that run before DOM updates
- `$effect.root` - For creating effect boundaries
