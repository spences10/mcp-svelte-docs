# $state Definition

**Definition:** Creates reactive state that triggers UI updates when
the value changes  
**Syntax:** `$state<T>(initial: T): T` |
`$state<T>(): T | undefined`  
**Parameters:**

- `initial` - The initial value (optional)  
  **Returns:** Reactive proxy of the initial value  
  **Variants:**
- `$state.raw<T>(initial: T): T` - Non-deeply-reactive state
- `$state.snapshot<T>(state: T): Snapshot<T>` - Static snapshot of
  reactive state

## Examples

```js
// Basic reactive state
let count = $state(0);
count++; // Triggers reactivity

// Object state (deeply reactive)
let user = $state({ name: 'Alice', age: 30 });
user.name = 'Bob'; // Triggers reactivity

// Optional initial value
let data = $state<string>(); // undefined initially
```

## Related

- `$derived` - For computed values based on state
- `$effect` - For side effects responding to state changes
- `$state.raw` - For non-deeply-reactive state
- `$state.snapshot` - For static snapshots
