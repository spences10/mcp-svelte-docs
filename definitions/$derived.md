# $derived Definition

**Definition:** Creates computed values that automatically update when dependencies change  
**Syntax:** `$derived<T>(expression: T): T`  
**Parameters:**
- `expression` - The expression to derive from  
**Returns:** Computed value that updates when dependencies change  
**Variants:**
- `$derived.by<T>(fn: () => T): T` - Complex derivation using function  

## Examples

```js
// Basic derived value
let count = $state(0);
const doubled = $derived(count * 2);

// Complex derivation with function
const expensive = $derived.by(() => {
  return heavyComputation(count);
});

// Multiple dependencies
let firstName = $state('John');
let lastName = $state('Doe');
const fullName = $derived(`${firstName} ${lastName}`);
```

## Related
- `$state` - For reactive state that derived values depend on
- `$effect` - For side effects responding to derived changes
- `$derived.by` - For complex derivation logic
