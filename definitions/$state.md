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

## Notes

- Deep reactivity: Arrays and simple objects are proxied deeply, so
  property changes and array methods (e.g., `push`) trigger granular
  updates.
- Raw state: Use `$state.raw` to avoid deep reactivity and update only
  on reassignment for performance with large data.
- Snapshots: Use `$state.snapshot(obj)` when passing reactive objects
  to APIs that don’t expect proxies (e.g., `structuredClone`,
  logging).
- Classes: Use `$state` in class fields (or first assignment in
  `constructor`) for reactive class instances; methods should be bound
  if used as handlers.
- Destructuring: Values destructured from reactive objects are not
  reactive; derive reactive pieces explicitly (e.g.,
  `const name = $derived(user.name)`).
- Passing to functions: JavaScript passes values, not variables — pass
  getters or functions if you need ‘current’ values.

## Related

- `$derived` - For computed values based on state
- `$effect` - For side effects responding to state changes
- `$state.raw` - For non-deeply-reactive state
- `$state.snapshot` - For static snapshots
