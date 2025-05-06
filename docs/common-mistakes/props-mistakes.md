# Common Props Mistakes

## Forgetting to Destructure Props

### Incorrect

```svelte
<script>
  // This doesn't work as expected
  let props = $props();

  function handleClick() {
    console.log(props.name);
  }
</script>

<div>Hello, {props.name}</div>
```

### Correct

```svelte
<script>
  // Destructure the props you need
  let { name } = $props();

  function handleClick() {
    console.log(name);
  }
</script>

<div>Hello, {name}</div>
```

### Explanation

In Svelte 5, props need to be destructured to access them reactively.
If you use the entire props object, changes to individual props won't
trigger reactivity.

## Not Providing Default Values

### Incorrect

```svelte
<script>
  let { name, age } = $props();

  // This might cause errors if age is undefined
  const isAdult = $derived(age >= 18);
</script>
```

### Correct

```svelte
<script>
  let { name, age = 0 } = $props();

  // Now this is safe
  const isAdult = $derived(age >= 18);
</script>
```

### Explanation

Always provide default values for optional props to prevent errors
when they're not provided. This makes your components more robust and
easier to use.

## Forgetting to Use $bindable for Two-Way Binding

### Incorrect

```svelte
<script>
  let { value } = $props();

  function increment() {
    // This won't update the parent component
    value++;
  }
</script>

<button onclick={increment}>Increment</button>
```

### Correct

```svelte
<script>
  let { value = $bindable(0) } = $props();

  function increment() {
    // This will update the parent component if bind:value is used
    value++;
  }
</script>

<button onclick={increment}>Increment</button>
```

### Explanation

To enable two-way binding in Svelte 5, you need to use the $bindable
rune. This allows the child component to update the parent's value
when the prop changes.

## Modifying Props Directly

### Incorrect

```svelte
<script>
  let { user } = $props();

  function updateName(newName) {
    // Modifying a prop directly
    user.name = newName;
  }
</script>
```

### Correct

```svelte
<script>
  let { user, onUserUpdate } = $props();

  function updateName(newName) {
    // Creating a new object and calling the update callback
    const updatedUser = { ...user, name: newName };
    onUserUpdate?.(updatedUser);
  }
</script>
```

### Explanation

Props should be treated as immutable. Instead of modifying them
directly, create a new object and use a callback prop to inform the
parent component of the change.

## Not Using TypeScript for Complex Props

### Incorrect

```svelte
<script>
  let { user } = $props();

  // No type checking, might cause runtime errors
  const fullName = $derived(`${user.firstName} ${user.lastName}`);
</script>
```

### Correct

```svelte
<script lang="ts">
  interface User {
    firstName: string;
    lastName: string;
    email?: string;
  }

  let { user }: { user: User } = $props();

  // Now we get type checking
  const fullName = $derived(`${user.firstName} ${user.lastName}`);
</script>
```

### Explanation

For complex props, using TypeScript provides better type checking and
helps prevent runtime errors. It also improves developer experience
with better autocompletion and documentation.
