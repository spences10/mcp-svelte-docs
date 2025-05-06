# $props Rune

## Description

The $props rune is used to declare component props in Svelte 5,
replacing the export let syntax from Svelte 4.

## Basic Syntax

```js
// Basic props
let { name, age = 21 } = $props();

// Rename property
let { class: className } = $props();

// Rest props
let { id, ...rest } = $props();

// Get all props
let props = $props();

// Bindable props
let { value = $bindable(0) } = $props();
```

## Examples

### Basic Props

```svelte
<script>
  let { name, age = 21 } = $props();
</script>

<div>
  <p>Name: {name}</p>
  <p>Age: {age}</p>
</div>
```

### With TypeScript

```svelte
<script lang="ts">
  let { name, age = 21 }: { name: string; age?: number } = $props();
</script>
```

### Wrapper Component

```svelte
<script>
  let { class: className, style, ...rest } = $props();
</script>

<div class={className} {style} {...rest}>
  <slot />
</div>
```

### Bindable Props

```svelte
<script>
  let { value = $bindable(0) } = $props();

  function increment() {
    value++;
  }
</script>

<div>
  <p>Value: {value}</p>
  <button onclick={increment}>Increment</button>
</div>

<!-- Parent component -->
<!-- <Counter bind:value={count} /> -->
```

## Best Practices

- Use destructuring to declare the props you expect
- Provide default values for optional props
- Use TypeScript to type your props
- For bindable props, use the $bindable rune
- Use the spread operator to forward attributes to underlying elements
