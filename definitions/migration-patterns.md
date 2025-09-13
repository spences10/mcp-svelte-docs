# migration-patterns Definition

**Definition:** Common Svelte 4 to Svelte 5 conversion patterns and
direct equivalents  
**Syntax:** Before/after code comparisons for systematic migration  
**Categories:**

- State management: `let` → `$state`
- Reactivity: `$:` → `$derived` or `$effect`
- Props: `export let` → `$props()`
- Lifecycle: `onMount` → `$effect`
- Events: `on:click` → `onclick`
- Slots: `<slot>`/named slots → `{#snippet}`/`{@render}`
- Component events: `createEventDispatcher` → event props (see
  `component-events`, `custom-events`)
- Bindings: `bind:` remains; add `$bindable` for 2‑way prop binding
  **Returns:** Direct migration patterns for upgrading components  
  **Purpose:** Systematic conversion guide from Svelte 4 patterns

## Examples

```ts
// STATE MIGRATION
// Svelte 4
let count = 0;
let items = [];

// Svelte 5
let count = $state(0);
let items = $state([]);

// REACTIVE DECLARATIONS
// Svelte 4
let doubled;
$: doubled = count * 2;

// Svelte 5
let doubled = $derived(count * 2);

// PROPS MIGRATION
// Svelte 4
export let name = 'default';
export let optional;

// Svelte 5
let { name = 'default', optional } = $props();

// LIFECYCLE MIGRATION
// Svelte 4
import { onMount, onDestroy } from 'svelte';

onMount(() => {
	console.log('mounted');
	return () => {
		console.log('cleanup');
	};
});

// Svelte 5
$effect(() => {
	console.log('mounted');
	return () => {
		console.log('cleanup');
	};
});

// SIDE EFFECTS
// Svelte 4
$: {
	document.title = `Count: ${count}`;
}

// Svelte 5
$effect(() => {
	document.title = `Count: ${count}`;
});
```

## Related

- `$state` - Replaces `let` for reactive variables
- `$derived` - Replaces reactive declarations `$:`
- `$props` - Replaces `export let` prop declarations
- `$effect` - Replaces `onMount`, `onDestroy`, side-effect `$:`
- `common-mistakes` - Pitfalls when migrating patterns
