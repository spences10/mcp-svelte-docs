# $state Rune

## Description

The $state rune is used to declare reactive state in Svelte 5.

## Basic Syntax

```js
// Create reactive state
let count = $state(0);
let user = $state({ name: 'Alice', age: 30 });

// Access and update directly
count++;
user.name = 'Bob';
```

## Examples

### Basic Counter

```svelte
<script>
  let count = $state(0);

  function increment() {
    count++;
  }
</script>

<button onclick={increment}>
  Clicked {count} times
</button>
```

### Object State

```svelte
<script>
  let user = $state({ name: 'John', age: 30 });

  function birthday() {
    user.age++;
  }
</script>

<div>
  <p>{user.name} is {user.age} years old</p>
  <button onclick={birthday}>Birthday!</button>
</div>
```

### With TypeScript

```svelte
<script lang="ts">
  interface User {
    name: string;
    age: number;
  }

  let user = $state<User>({ name: 'John', age: 30 });

  function birthday(): void {
    user.age++;
  }
</script>
```

## Raw State

For values that should only be reactive when reassigned (not when
their properties change):

```js
let numbers = $state.raw([1, 2, 3]);

// This triggers reactivity (reassignment)
numbers = [...numbers, 4];

// This does NOT trigger reactivity (mutation)
numbers[0] = 99;
```

## Best Practices

- Use $state for any value that needs to trigger UI updates when
  changed
- For large arrays or objects that don't need deep reactivity,
  consider using $state.raw
- Don't export $state variables directly from modules, use
  getter/setter functions instead
- When using TypeScript, you can specify the type: let count =
  $state<number>(0)
