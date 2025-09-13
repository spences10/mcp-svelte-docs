# migration-patterns Definition

**Definition:** Migration concepts for upgrading from Svelte 4 to
Svelte 5  
**Pattern:** Before/after examples showing Svelte 4 → Svelte 5
conversions  
**Parameters:** Various Svelte 4 patterns  
**Returns:** Equivalent Svelte 5 implementations

## Examples

### Reactive Declarations (Svelte 4 → 5)

```js
// Svelte 4
let count = 0;
$: doubled = count * 2;
$: quadrupled = doubled * 2;

// Svelte 5
let count = $state(0);
const doubled = $derived(count * 2);
const quadrupled = $derived(doubled * 2);
```

### Component Props (Svelte 4 → 5)

```js
// Svelte 4
export let name;
export let age = 25;
export let onClick = () => {};

// Svelte 5
let { name, age = 25, onClick = () => {} } = $props();
```

### Event Handling (Svelte 4 → 5)

```svelte
<!-- Svelte 4 -->
<button on:click={handler}>Click me</button>
<input on:input={handleInput} />
<form on:submit|preventDefault={handleSubmit}>

<!-- Svelte 5 -->
<button onclick={handler}>Click me</button>
<input oninput={handleInput} />
<form onsubmit={(e) => { e.preventDefault(); handleSubmit(e); }}>
```

### Slots to Snippets (Svelte 4 → 5)

```svelte
<!-- Svelte 4 -->
<!-- Parent.svelte -->
<Card>
  <h1 slot="header">Title</h1>
  <p>Content</p>
  <div slot="footer">Footer</div>
</Card>

<!-- Card.svelte -->
<div class="card">
  <header><slot name="header" /></header>
  <main><slot /></main>
  <footer><slot name="footer" /></footer>
</div>

<!-- Svelte 5 -->
<!-- Parent.svelte -->
<Card>
  {#snippet header()}
    <h1>Title</h1>
  {/snippet}

  {#snippet children()}
    <p>Content</p>
  {/snippet}

  {#snippet footer()}
    <div>Footer</div>
  {/snippet}
</Card>

<!-- Card.svelte -->
<script>
  let { header, children, footer } = $props();
</script>

<div class="card">
  <header>{@render header()}</header>
  <main>{@render children()}</main>
  <footer>{@render footer()}</footer>
</div>
```

### Component Events (Svelte 4 → 5)

```js
// Svelte 4
// Child.svelte
import { createEventDispatcher } from 'svelte';
const dispatch = createEventDispatcher();

function handleClick() {
	dispatch('message', { text: 'Hello' });
}

// Parent.svelte
<Child on:message={handleMessage} />;

// Svelte 5
// Child.svelte
let { onMessage } = $props();

function handleClick() {
	onMessage?.({ text: 'Hello' });
}

// Parent.svelte
<Child onMessage={handleMessage} />;
```

### Lifecycle Functions (Svelte 4 → 5)

```js
// Svelte 4
import { onMount, onDestroy } from 'svelte';

onMount(() => {
	console.log('Component mounted');
});

onDestroy(() => {
	console.log('Component destroyed');
});

// Svelte 5
$effect(() => {
	console.log('Component mounted');

	return () => {
		console.log('Component destroyed');
	};
});
```

### Stores (Svelte 4 → 5)

```js
// Svelte 4
import { writable } from 'svelte/store';
const count = writable(0);

// Component usage
$: console.log($count);

// Svelte 5
// Global state
let count = $state(0);

// Component usage
$effect(() => {
	console.log(count);
});
```

## Related

- `$state` - Replaces reactive declarations
- `$props` - Replaces export let
- `onclick` - Replaces on:click directives
- `snippets` - Replace named slots
- `component-events` - Replace event dispatching
