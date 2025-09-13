# lifecycle-equivalents Definition

**Definition:** Legacy Svelte 4 lifecycle functions (`onMount`,
`onDestroy`, `beforeUpdate`, `afterUpdate`) mapped to Svelte 5
`$effect` patterns. Prefer `$effect` in Svelte 5. **Syntax:**
`$effect` replacements for `onMount`, `onDestroy`, `beforeUpdate`,
`afterUpdate`  
**Conversions:**

- `onMount` → `$effect` with empty dependency
- `onDestroy` → `$effect` return cleanup function
- `beforeUpdate` → `$effect.pre`
- `afterUpdate` → `$effect` after state changes  
  **Returns:** Equivalent lifecycle behavior using rune patterns  
  **Migration:** Direct 1:1 replacements for systematic conversion

## Examples

```ts
// onMount equivalent
// Svelte 4 (legacy)
import { onMount } from 'svelte';
onMount(() => {
	console.log('Component mounted');
});

// Svelte 5 (preferred)
$effect(() => {
	console.log('Component mounted');
});

// onDestroy equivalent
// Svelte 4 (legacy)
import { onDestroy } from 'svelte';
onDestroy(() => {
	console.log('Component destroyed');
});

// Svelte 5 (preferred)
$effect(() => {
	return () => {
		console.log('Component destroyed');
	};
});

// Combined onMount + onDestroy
// Svelte 4
onMount(() => {
	const interval = setInterval(() => {}, 1000);
	return () => clearInterval(interval);
});

// Svelte 5
$effect(() => {
	const interval = setInterval(() => {}, 1000);
	return () => clearInterval(interval);
});

// beforeUpdate equivalent
// Svelte 4 (legacy)
import { beforeUpdate } from 'svelte';
beforeUpdate(() => {
	console.log('Before DOM updates');
});

// Svelte 5 (preferred)
$effect.pre(() => {
	console.log('Before DOM updates');
});

// afterUpdate equivalent
// Svelte 4 (legacy)
import { afterUpdate } from 'svelte';
afterUpdate(() => {
	console.log('After DOM updates');
});

// Svelte 5 (preferred)
let count = $state(0);
$effect(() => {
	count; // Track state dependency
	console.log('After state updates');
});

// Conditional lifecycle (runs only when condition met)
// Svelte 4
let condition = false;
$: if (condition) {
	// Runs when condition becomes true
	doSomething();
}

// Svelte 5
let condition = $state(false);
$effect(() => {
	if (condition) {
		doSomething();
	}
});
```

## Related

- `$effect` - Main lifecycle replacement rune
- `$effect.pre` - beforeUpdate equivalent
- `migration-patterns` - Complete Svelte 4→5 conversion guide
- `$effect` - Primary lifecycle mechanism in Svelte 5
- `common-mistakes` - Pitfalls when converting lifecycle code
