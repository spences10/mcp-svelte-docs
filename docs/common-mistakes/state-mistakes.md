# Common State Management Mistakes

## Exporting State Variables Directly

### Incorrect

```js
// counter.svelte.js
let count = $state(0);

export { count };
```

### Correct

```js
// counter.svelte.js
let count = $state(0);

export function getCount() {
	return count;
}

export function setCount(value) {
	count = value;
}
```

### Explanation

When you export a stateful variable directly, the reactivity is lost
when it's imported elsewhere. This is because the importing module
only gets the current value, not the reactive binding. Instead, export
functions that access and modify the state.

## Using Object Getters/Setters

### Incorrect

```js
// counter.svelte.js
let count = $state(0);

export default {
	count, // Direct export of state variable
	increment: () => count++,
};
```

### Correct

```js
// counter.svelte.js
let count = $state(0);

export default {
	get count() {
		return count;
	},
	set count(value) {
		count = value;
	},
	increment: () => count++,
};
```

### Explanation

Using getters and setters ensures that the state is always accessed
and modified through the reactive system. This maintains reactivity
when the object is used in other components.

## Mutating State Objects Directly

### Incorrect

```svelte
<script>
  let user = $state({ name: 'John', age: 30 });

  function updateName(newName) {
    // Direct mutation of a nested property
    user.name = newName;
  }
</script>
```

### Correct

```svelte
<script>
  let user = $state({ name: 'John', age: 30 });

  function updateName(newName) {
    // Creating a new object with the updated property
    user = { ...user, name: newName };
  }
</script>
```

### Explanation

While Svelte 5's $state does track deep updates, it's still a good
practice to avoid direct mutations and instead create new objects.
This makes state changes more predictable and helps prevent bugs,
especially with more complex state structures.

## Forgetting to Use $state.raw for Large Collections

### Incorrect

```svelte
<script>
  // Using regular $state for a large array
  let items = $state(Array.from({ length: 1000 }, (_, i) => ({ id: i, name: `Item ${i}` })));

  function addItem() {
    items.push({ id: items.length, name: `Item ${items.length}` });
  }
</script>
```

### Correct

```svelte
<script>
  // Using $state.raw for a large array
  let items = $state.raw(Array.from({ length: 1000 }, (_, i) => ({ id: i, name: `Item ${i}` })));

  function addItem() {
    items = [...items, { id: items.length, name: `Item ${items.length}` }];
  }
</script>
```

### Explanation

For large collections, using $state.raw can be more performant because
it only triggers reactivity when the entire value is reassigned, not
when individual properties are changed. However, you must remember to
create a new array or object when making changes.

## Circular Dependencies in Derived Values

### Incorrect

```svelte
<script>
  let a = $state(1);
  let b = $state(2);

  // Circular dependency
  const sum = $derived(a + b);

  $effect(() => {
    a = sum - b; // This creates a circular dependency
  });
</script>
```

### Correct

```svelte
<script>
  let a = $state(1);
  let b = $state(2);

  const sum = $derived(a + b);

  function updateA(value) {
    a = value;
  }

  function updateB(value) {
    b = value;
  }
</script>
```

### Explanation

Creating circular dependencies between reactive values can lead to
infinite update loops. Always ensure that your reactive flow is
unidirectional, with clear inputs and outputs.
