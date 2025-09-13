# $state.snapshot Definition

**Definition:** Static snapshot of reactive state  
**Syntax:** `$state.snapshot<T>(state: T): Snapshot<T>`  
**Parameters:**

- `state` - The reactive state to snapshot  
  **Returns:** Static snapshot that doesn't trigger reactivity  
  **Variants:**
- Part of `$state` rune family

## Examples

```js
// Create reactive state
let user = $state({ name: 'Alice', posts: ['Hello', 'World'] });

// Create static snapshot
let userSnapshot = $state.snapshot(user);

// Snapshot is static - won't trigger reactivity when accessed
console.log(userSnapshot.name); // 'Alice' - no reactivity

// Original state still reactive
user.name = 'Bob'; // Triggers reactivity

// Snapshot remains unchanged
console.log(userSnapshot.name); // Still 'Alice'

// Use in effects to avoid infinite loops
$effect(() => {
	const snapshot = $state.snapshot(user);
	localStorage.setItem('user', JSON.stringify(snapshot));
});
```

## Related

- `$state` - For reactive state that can be snapshotted
- `$state.raw` - For non-deeply-reactive state
- `$effect` - Often used with snapshots to avoid infinite loops
