# $effect.pending Definition

**Definition:** Returns number of pending promises in the current
boundary  
**Syntax:** `$effect.pending(): number`  
**Parameters:** None  
**Returns:** Number of pending promises, not including child
boundaries  
**Variants:**

- Part of `$effect` rune family

## Examples

```js
// Monitor pending async operations
let a = $state(1);
let b = $state(2);

async function add(x, y) {
  await new Promise(resolve => setTimeout(resolve, 1000));
  return x + y;
}

// In template or effect
$effect(() => {
  const pending = $effect.pending();
  if (pending > 0) {
    console.log(`${pending} promises are pending`);
  }
});

// Usage with await expressions
{#if $effect.pending()}
  <p>Loading... ({$effect.pending()} operations pending)</p>
{/if}

<p>{a} + {b} = {await add(a, b)}</p>

// Conditional rendering based on pending state
{#if $effect.pending() > 0}
  <div class="loading-spinner">
    Processing {$effect.pending()} operations...
  </div>
{/if}
```

## Related

- `await-expressions` - Async template expressions that create pending
  promises
- `$effect` - For effects that can monitor pending state
- `$effect.tracking` - For checking if code is in tracking context
