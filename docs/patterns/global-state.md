# Global State Patterns

## Description

Svelte 5 provides several approaches to managing global state outside
of components. These patterns leverage the new runes system for
reactivity.

## Module-Level State

### Basic Module State

```js
// store.js
import { state } from 'svelte';

export const count = state(0);

export function increment() {
	count.value++;
}

export function decrement() {
	count.value--;
}
```

```svelte
<!-- Counter.svelte -->
<script>
  import { count, increment, decrement } from './store.js';
</script>

<button onclick={decrement}>-</button>
<span>{count.value}</span>
<button onclick={increment}>+</button>
```

### Custom Store Pattern

```js
// userStore.js
import { state } from 'svelte';

function createUserStore() {
	const user = state(null);
	const loading = state(false);
	const error = state(null);

	async function login(username, password) {
		loading.value = true;
		error.value = null;

		try {
			// Simulate API call
			const response = await fetch('/api/login', {
				method: 'POST',
				body: JSON.stringify({ username, password }),
				headers: { 'Content-Type': 'application/json' },
			});

			if (!response.ok) throw new Error('Login failed');

			const userData = await response.json();
			user.value = userData;
		} catch (err) {
			error.value = err.message;
		} finally {
			loading.value = false;
		}
	}

	function logout() {
		user.value = null;
	}

	return {
		get user() {
			return user.value;
		},
		get loading() {
			return loading.value;
		},
		get error() {
			return error.value;
		},
		login,
		logout,
	};
}

export const userStore = createUserStore();
```

## Reactivity Outside Components

Using runes in `.svelte.js` or `.svelte.ts` files:

```js
// counter.svelte.js
export function createCounter() {
	let count = $state(0);

	return {
		get count() {
			return count;
		},
		increment: () => count++,
	};
}
```

```svelte
<script>
  import { createCounter } from './counter.svelte.js';

  const counter = createCounter();
</script>

<button onclick={counter.increment}>
  Count: {counter.count}
</button>
```

## Context API

For component tree state sharing:

```svelte
<!-- App.svelte -->
<script>
  import { setContext } from 'svelte';
  import Child from './Child.svelte';

  let theme = $state('light');

  setContext('theme', {
    get current() { return theme },
    toggle: () => theme = theme === 'light' ? 'dark' : 'light'
  });
</script>

<div class={theme}>
  <Child />
</div>

<!-- Child.svelte -->
<script>
  import { getContext } from 'svelte';

  const theme = getContext('theme');
</script>

<button onclick={theme.toggle}>
  Toggle theme (current: {theme.current})
</button>
```

## Best Practices

- Choose the simplest pattern that meets your needs
- For small applications, module-level state is often sufficient
- For larger applications, consider custom stores with clear APIs
- Use context for state that should be shared down a component tree
- Keep state logic separate from UI components
- Consider using TypeScript for better type safety
