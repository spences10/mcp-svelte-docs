# Snapshot Definition

**Definition:** TypeScript utility type representing the return type
of `$state.snapshot<T>()`  
**Type:** `Snapshot<T> = ReturnType<typeof $state.snapshot<T>>` -
Immutable copy of reactive state  
**Parameters:**

- `T` - The original reactive state type being snapshotted
  **Returns:** Static, non-reactive copy of the state value  
  **Purpose:** Serialization, comparison, debugging, and preventing
  reactivity  
  **Immutability:** Snapshot values cannot trigger reactive updates

## Examples

```ts
import type { Snapshot } from 'svelte';

// Create reactive state
let user = $state({ name: 'Alice', age: 30, hobbies: ['reading'] });

// Create typed snapshot
let userSnapshot: Snapshot<typeof user> = $state.snapshot(user);

// Snapshot is immutable and non-reactive
console.log(userSnapshot.name); // 'Alice'
userSnapshot.name = 'Bob'; // ❌ TypeScript error - read-only

// Safe for serialization
const serialized = JSON.stringify(userSnapshot);
localStorage.setItem('user', serialized);

// Comparison without reactivity
function hasUserChanged(
	current: typeof user,
	previous: Snapshot<typeof user>,
): boolean {
	return (
		current.name !== previous.name ||
		current.age !== previous.age ||
		current.hobbies.length !== previous.hobbies.length
	);
}

// Debugging state at specific moments
let debugSnapshots: Snapshot<typeof user>[] = [];

$effect(() => {
	// Capture snapshot on every change for debugging
	debugSnapshots.push($state.snapshot(user));
	console.log('State history:', debugSnapshots);
});

// Type-safe snapshot operations
function createBackup<T>(state: T): Snapshot<T> {
	return $state.snapshot(state);
}

let backup = createBackup(user); // Type: Snapshot<{ name: string; age: number; hobbies: string[] }>
```

## Related

- `$state.snapshot` - Function that creates snapshots
- `$state` - Original reactive state being snapshotted
- `$state.raw` - Alternative for non-reactive state (but still
  mutable)
- `$derived` - For reactive computations based on state
