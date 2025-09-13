# $state Definition

**Definition:** Declares reactive state. When the value changes, the
UI updates. Arrays and plain objects become deeply reactive proxies;
primitives (like numbers/strings/booleans) remain normal values.  
**Also see:** `$state.raw`, `$state.snapshot`

## Examples

```ts
// Basic reactive state
let count = $state(0);
count++; // triggers an update

// Object/array state (deeply reactive)
let user = $state({ name: 'Alice', age: 30 });
user.name = 'Bob'; // triggers an update of only the places that read `user.name`

// You can declare without an initial value with generics
let data = $state<string>(); // undefined initially
```

## Notes

- Deep reactivity: Arrays and simple objects are proxied deeply;
  property changes and array methods (e.g. `push`) trigger granular
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
