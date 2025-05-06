# Svelte 4 to Svelte 5 Migration Patterns

## Description

This guide shows common patterns for migrating from Svelte 4 to Svelte
5, focusing on the key syntax changes.

## Reactive State

### Svelte 4

```svelte
<script>
  let count = 0;

  function increment() {
    count += 1;
  }
</script>

<button on:click={increment}>
  Clicks: {count}
</button>
```

### Svelte 5

```svelte
<script>
  let count = $state(0);

  function increment() {
    count++;
  }
</script>

<button onclick={increment}>
  Clicks: {count}
</button>
```

## Reactive Declarations

### Svelte 4

```svelte
<script>
  let count = 0;
  $: doubled = count * 2;
  $: isEven = count % 2 === 0;
</script>
```

### Svelte 5

```svelte
<script>
  let count = $state(0);
  const doubled = $derived(count * 2);
  const isEven = $derived(count % 2 === 0);
</script>
```

## Component Props

### Svelte 4

```svelte
<script>
  export let name;
  export let age = 21;
</script>
```

### Svelte 5

```svelte
<script>
  let { name, age = 21 } = $props();
</script>
```

## Event Handling

### Svelte 4

```svelte
<button on:click={handleClick}>Click me</button>
<button on:click|preventDefault={handleSubmit}>Submit</button>
```

### Svelte 5

```svelte
<button onclick={handleClick}>Click me</button>
<button onclick={(e) => { e.preventDefault(); handleSubmit(); }}>Submit</button>
```

## Lifecycle Methods

### Svelte 4

```svelte
<script>
  import { onMount, onDestroy } from 'svelte';

  onMount(() => {
    const interval = setInterval(() => {
      count += 1;
    }, 1000);

    onDestroy(() => {
      clearInterval(interval);
    });
  });
</script>
```

### Svelte 5

```svelte
<script>
  let count = $state(0);

  $effect(() => {
    const interval = setInterval(() => {
      count++;
    }, 1000);

    return () => {
      clearInterval(interval);
    };
  });
</script>
```

## Slots

### Svelte 4

```svelte
<!-- Card.svelte -->
<div class="card">
  <div class="header">
    <slot name="header">Default header</slot>
  </div>
  <div class="content">
    <slot>Default content</slot>
  </div>
  <div class="footer">
    <slot name="footer">Default footer</slot>
  </div>
</div>

<!-- Usage -->
<Card>
  <h2 slot="header">My Card</h2>
  <p>Some content</p>
  <button slot="footer">Close</button>
</Card>
```

### Svelte 5

```svelte
<!-- Card.svelte -->
<script>
  let { header, default: content, footer } = $props();
</script>

<div class="card">
  <div class="header">
    {@render header?.() ?? <div>Default header</div>}
  </div>
  <div class="content">
    {@render content?.() ?? <div>Default content</div>}
  </div>
  <div class="footer">
    {@render footer?.() ?? <div>Default footer</div>}
  </div>
</div>

<!-- Usage -->
<Card>
  {#snippet header()}
    <h2>My Card</h2>
  {/snippet}
  <p>Some content</p>
  {#snippet footer()}
    <button>Close</button>
  {/snippet}
</Card>
```

## Component Events

### Svelte 4

```svelte
<!-- Child.svelte -->
<script>
  import { createEventDispatcher } from 'svelte';
  const dispatch = createEventDispatcher();

  function handleClick() {
    dispatch('message', 'Hello from Child');
  }
</script>

<button on:click={handleClick}>Send Message</button>

<!-- Parent.svelte -->
<Child on:message={(e) => alert(e.detail)} />
```

### Svelte 5

```svelte
<!-- Child.svelte -->
<script>
  let { onMessage } = $props();

  function handleClick() {
    onMessage?.('Hello from Child');
  }
</script>

<button onclick={handleClick}>Send Message</button>

<!-- Parent.svelte -->
<Child onMessage={(message) => alert(message)} />
```

## Store Subscriptions

### Svelte 4

```svelte
<script>
  import { writable } from 'svelte/store';

  const count = writable(0);

  function increment() {
    count.update(n => n + 1);
  }
</script>

<button on:click={increment}>
  Count: {$count}
</button>
```

### Svelte 5

```svelte
<script>
  import { state } from 'svelte';

  const count = state(0);

  function increment() {
    count.value++;
  }
</script>

<button onclick={increment}>
  Count: {count.value}
</button>
```

## Best Practices

- Migrate one component at a time
- Start with leaf components (those with no children)
- Use the Svelte Language Tools to help with migration
- Test thoroughly after each component migration
- Consider using the official migration tool when available
