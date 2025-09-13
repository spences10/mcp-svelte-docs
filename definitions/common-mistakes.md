# common-mistakes Definition

**Definition:** Anti-patterns and debugging guide for common Svelte 5
mistakes  
**Syntax:** Patterns to avoid and correct alternatives  
**Categories:**

- Reactivity pitfalls with `$state` and `$derived`
- Improper `$effect` usage and cleanup
- Migration errors from Svelte 4 patterns  
  **Returns:** Understanding of correct Svelte 5 patterns  
  **Purpose:** Debugging guide and best practice reference

## Examples

```js
// ❌ MISTAKE: Destructuring $state loses reactivity
let user = $state({ name: 'Alice' });
let { name } = user; // 'name' is not reactive!

// ✅ CORRECT: Access properties directly
user.name; // Reactive access

// ❌ MISTAKE: Using $effect for derived values
let count = $state(0);
let double = $state(0);
$effect(() => {
	double = count * 2; // Wrong - use $derived instead
});

// ✅ CORRECT: Use $derived for computed values
let double = $derived(count * 2);

// ❌ MISTAKE: Missing cleanup in $effect
$effect(() => {
	let interval = setInterval(() => {}, 1000);
	// Missing cleanup causes memory leak!
});

// ✅ CORRECT: Return cleanup function
$effect(() => {
	let interval = setInterval(() => {}, 1000);
	return () => clearInterval(interval);
});

// ❌ MISTAKE: Using $state.raw unnecessarily
let items = $state.raw([1, 2, 3]);
items.push(4); // No reactivity!

// ✅ CORRECT: Use regular $state for arrays/objects
let items = $state([1, 2, 3]);
items.push(4); // Reactive
```

## Related

- `$state` - For reactive state management
- `$derived` - For computed values, not `$effect`
- `$effect` - For side effects, not derived values
- `$state.raw` - Only when you need non-reactive state
- `migration-patterns` - Svelte 4 to 5 conversion guide
