# $effect.tracking Definition

**Definition:** Returns whether code is running inside a tracking
context  
**Syntax:** `$effect.tracking(): boolean`  
**Parameters:** None  
**Returns:** `true` if inside a tracking context (effect or template),
`false` otherwise  
**Variants:**

- Part of `$effect` rune family

## Examples

```js
// Check tracking context in different locations
console.log('In component setup:', $effect.tracking()); // false

$effect(() => {
  console.log('In effect:', $effect.tracking()); // true
});

// In template (always tracked)
<p>In template: {$effect.tracking()}</p> <!-- true -->

// Advanced usage for abstractions
function createSubscriber(callback) {
  if ($effect.tracking()) {
    // Only create reactive subscription if we're being tracked
    $effect(() => {
      const unsubscribe = subscribe(callback);
      return unsubscribe;
    });
  } else {
    // Just call once if not in tracking context
    callback();
  }
}

// Conditional reactive behavior
function smartLogger(message) {
  if ($effect.tracking()) {
    // Reactive logging - will re-run when dependencies change
    console.log('Reactive:', message);
  } else {
    // One-time logging
    console.log('Static:', message);
  }
}

// Usage in custom reactive utilities
function createReactiveValue(initialValue) {
  let value = $state(initialValue);

  return {
    get() {
      if ($effect.tracking()) {
        // Return reactive value when being tracked
        return value;
      } else {
        // Return static snapshot when not tracked
        return $state.snapshot(value);
      }
    },
    set(newValue) {
      value = newValue;
    }
  };
}
```

## Related

- `$effect` - For effects that run in tracking context
- `$effect.pending` - For checking pending promises
- Template expressions - Always run in tracking context
