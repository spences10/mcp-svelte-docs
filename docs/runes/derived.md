# $derived Rune

## Description

The $derived rune is used to compute values based on reactive state.
It automatically tracks dependencies and updates when they change.

## Basic Syntax

```js
// Compute derived value
const fullName = $derived(`${firstName} ${lastName}`);

// Complex derivation
const filteredItems = $derived(
	items.filter((item) => item.price > minPrice),
);
```

## Examples

### Simple Derivation

```svelte
<script>
  let count = $state(0);
  let doubled = $derived(count * 2);
  let isEven = $derived(count % 2 === 0);

  function increment() {
    count++;
  }
</script>

<button onclick={increment}>Increment</button>
<p>Count: {count}</p>
<p>Doubled: {doubled}</p>
<p>Is even: {isEven ? 'Yes' : 'No'}</p>
```

### With TypeScript

```svelte
<script lang="ts">
  let count = $state<number>(0);
  let doubled = $derived<number>(count * 2);
  let isEven = $derived<boolean>(count % 2 === 0);

  function increment(): void {
    count++;
  }
</script>
```

### Complex Derivation with $derived.by

```svelte
<script>
  let numbers = $state([1, 2, 3, 4, 5]);

  let stats = $derived.by(() => {
    const sum = numbers.reduce((a, b) => a + b, 0);
    const avg = sum / numbers.length;
    const max = Math.max(...numbers);
    const min = Math.min(...numbers);

    return { sum, avg, max, min };
  });

  function addNumber() {
    numbers = [...numbers, Math.floor(Math.random() * 10) + 1];
  }
</script>

<button onclick={addNumber}>Add random number</button>
<p>Numbers: {numbers.join(', ')}</p>
<p>Sum: {stats.sum}</p>
<p>Average: {stats.avg.toFixed(2)}</p>
<p>Max: {stats.max}</p>
<p>Min: {stats.min}</p>
```

## Best Practices

- Use $derived for values that can be computed from other state
- Keep derivations simple and focused on a single computation
- Avoid side effects in $derived expressions - use $effect for side
  effects
- For complex derivations with multiple steps, use $derived.by
- $derived values are read-only - you cannot assign to them
