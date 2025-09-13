# $state.raw Definition

**Definition:** Non-deeply-reactive state for values that should only
be reactive when reassigned  
**Syntax:** `$state.raw<T>(initial: T): T`  
**Parameters:**

- `initial` - The initial value  
  **Returns:** Non-deeply-reactive proxy of the initial value  
  **Variants:**
- Part of `$state` rune family

## Examples

```js
// Array that only triggers reactivity on reassignment
let numbers = $state.raw([1, 2, 3]);

// This triggers reactivity (reassignment)
numbers = [...numbers, 4];

// This does NOT trigger reactivity (mutation)
numbers[0] = 99;

// Object example
let config = $state.raw({ theme: 'dark', lang: 'en' });

// Triggers reactivity
config = { ...config, theme: 'light' };

// Does NOT trigger reactivity
config.theme = 'light';
```

## Related

- `$state` - For deeply reactive state
- `$state.snapshot` - For static snapshots of reactive state
- `$derived` - For computed values that can depend on raw state
