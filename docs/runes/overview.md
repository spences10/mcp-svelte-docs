# Svelte 5 Runes Overview

## What Are Runes?

Runes are special symbols in Svelte 5 that influence how the compiler
works. They start with a `$` character and are used to make reactivity
explicit. Runes replace the special syntax from Svelte 4 (like `$:`
for reactive declarations and `export let` for props).

## Core Runes

### $state

Creates reactive state variables:

```js
let count = $state(0);
let user = $state({ name: 'Alice', age: 30 });

// Access and update directly
count++;
user.name = 'Bob';
```

### $derived

Creates computed values that update automatically when dependencies
change:

```js
let count = $state(0);
const doubled = $derived(count * 2);
const isEven = $derived(count % 2 === 0);
```

### $props

Declares component props:

```js
let { name, age = 21 } = $props();
let { class: className } = $props(); // Rename props
let { id, ...rest } = $props(); // Rest props
```

### $effect

Runs side effects when reactive values change:

```js
$effect(() => {
	console.log(`Count is now: ${count}`);

	// Optional cleanup function
	return () => {
		console.log('Cleaning up');
	};
});
```

## Additional Runes

### $state.raw

Creates state that's only reactive when the entire value is
reassigned:

```js
let items = $state.raw([1, 2, 3]);

// This triggers reactivity (reassignment)
items = [...items, 4];

// This does NOT trigger reactivity (mutation)
items[0] = 99;
```

### $derived.by

Creates complex derived values using a function:

```js
const stats = $derived.by(() => {
	const sum = numbers.reduce((a, b) => a + b, 0);
	const avg = sum / numbers.length;
	return { sum, avg };
});
```

### $effect.pre

Runs effects before DOM updates:

```js
$effect.pre(() => {
	// Runs before DOM updates
});
```

### $bindable

Enables two-way binding for props:

```js
let { value = $bindable(0) } = $props();
```

## Benefits of Runes

1. **Consistency**: The same reactivity model works both inside and
   outside components
2. **Explicitness**: Reactivity is now explicit, making code easier to
   understand
3. **Portability**: Reactive code can be shared between components
   more easily
4. **TypeScript Integration**: Better TypeScript support with proper
   typing of reactive values

## Best Practices

- Use the appropriate rune for each use case
- Keep reactive code simple and focused
- Use TypeScript for better type safety
- Avoid circular dependencies between reactive values
- Remember that runes only work in `.svelte` files or
  `.svelte.js`/`.svelte.ts` files
