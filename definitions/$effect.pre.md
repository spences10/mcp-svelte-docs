# $effect.pre Definition

**Definition:** Runs before DOM updates  
**Syntax:** `$effect.pre(fn: () => void | (() => void)): void`  
**Parameters:**

- `fn` - Function to run, optionally returns cleanup function  
  **Returns:** void  
  **Variants:**
- Part of `$effect` rune family

## Examples

```js
// Measure DOM before updates
let element;
let count = $state(0);

$effect.pre(() => {
	if (element) {
		const rect = element.getBoundingClientRect();
		console.log('Before update:', rect.height);
	}
});

$effect(() => {
	if (element) {
		const rect = element.getBoundingClientRect();
		console.log('After update:', rect.height);
	}
});

// Reading values before they change
let items = $state(['a', 'b', 'c']);

$effect.pre(() => {
	console.log('Items before change:', items.length);
});

// Cleanup in pre-effect
$effect.pre(() => {
	console.log('Pre-effect running');

	return () => {
		console.log('Pre-effect cleanup');
	};
});

// Useful for animations or transitions
let isVisible = $state(true);

$effect.pre(() => {
	if (!isVisible && element) {
		// Start exit animation before DOM update
		element.style.transition = 'opacity 0.3s';
		element.style.opacity = '0';
	}
});
```

## Related

- `$effect` - For effects that run after DOM updates
- `$effect.root` - For creating effect boundaries
- `$state` - For reactive state that triggers effects
