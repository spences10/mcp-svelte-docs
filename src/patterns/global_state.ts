import { GlobalStatePattern } from './index.js';

/**
 * Global state patterns for Svelte 5
 */
const global_state_patterns: GlobalStatePattern[] = [
	{
		name: 'Function-based Global State',
		description:
			'Using getter and setter functions to expose global state',
		code: `// counter.svelte.js
let count = $state(0);

export function getCount() {
  return count;
}

export function setCount(value) {
  count = value;
}`,
		usage: `// App.svelte
<script>
  import { getCount, setCount } from './counter.svelte.js';
</script>

<button onclick={() => setCount(getCount() + 1)}>
  Increment: {getCount()}
</button>`,
		notes:
			'This is the simplest approach to global state in Svelte 5. The state is encapsulated in a module and exposed through getter and setter functions. This works because the state is enclosed in a closure, maintaining reactivity across module boundaries. However, the API is not very ergonomic, requiring function calls for both reading and writing.',
	},
	{
		name: 'Object-based Global State',
		description:
			'Using an object with getters and setters to expose global state',
		code: `// counter.svelte.js
let count = $state(0);

export const counter = {
  get value() {
    return count;
  },
  set value(newCount) {
    count = newCount;
  }
};`,
		usage: `// App.svelte
<script>
  import { counter } from './counter.svelte.js';
</script>

<button onclick={() => counter.value++}>
  Increment: {counter.value}
</button>`,
		notes:
			"This approach provides a more ergonomic API than the function-based approach. The state is still encapsulated in a module, but it's exposed through an object with getter and setter properties. This allows for a more natural syntax when reading and writing the state. The reactivity is maintained because the getter and setter access the underlying stateful variable.",
	},
	{
		name: 'Proxy-based Global State',
		description:
			'Using $state directly on an object to create a reactive global state object',
		code: `// store.svelte.js
export const store = $state({
  count: 0,
  user: {
    name: 'John',
    age: 30
  },
  items: ['apple', 'banana', 'orange']
});`,
		usage: `// App.svelte
<script>
  import { store } from './store.svelte.js';
</script>

<button onclick={() => store.count++}>
  Increment: {store.count}
</button>

<div>
  <p>Name: {store.user.name}</p>
  <p>Age: {store.user.age}</p>
  <button onclick={() => store.user.age++}>Birthday</button>
</div>

<ul>
  {#each store.items as item}
    <li>{item}</li>
  {/each}
</ul>
<button onclick={() => store.items = [...store.items, 'grape']}>
  Add item
</button>`,
		notes:
			'This approach is simple and works well for small applications. However, it has a major limitation: you cannot directly reassign the store object itself (e.g., store = { count: 1 }), as this would break the reactivity. You can only mutate its properties. Also, be cautious when using this approach in server-side rendering, as the state will be shared across all requests.',
	},
	{
		name: 'Class-based Global State',
		description:
			'Using a class with stateful properties to create a global state manager',
		code: `// store.svelte.js
class Store {
  count = $state(0);
  user = $state({
    name: 'John',
    age: 30
  });
  items = $state(['apple', 'banana', 'orange']);
  
  incrementCount() {
    this.count++;
  }
  
  addItem(item) {
    this.items = [...this.items, item];
  }
  
  updateUser(updates) {
    Object.assign(this.user, updates);
  }
}

export const store = new Store();`,
		usage: `// App.svelte
<script>
  import { store } from './store.svelte.js';
</script>

<button onclick={() => store.incrementCount()}>
  Increment: {store.count}
</button>

<div>
  <p>Name: {store.user.name}</p>
  <p>Age: {store.user.age}</p>
  <button onclick={() => store.updateUser({ age: store.user.age + 1 })}>
    Birthday
  </button>
</div>

<ul>
  {#each store.items as item}
    <li>{item}</li>
  {/each}
</ul>
<button onclick={() => store.addItem('grape')}>
  Add item
</button>`,
		notes:
			"The class-based approach is more structured and allows you to encapsulate both state and behavior. It's also more performant than plain objects because JavaScript engines optimize classes better. However, like the proxy-based approach, it has limitations in server-side rendering environments.",
	},
	{
		name: 'Context-based Global State (Safe for SSR)',
		description:
			'Using Svelte contexts to create global state that is safe for server-side rendering',
		code: `// notification-context.ts
import { getContext, setContext } from 'svelte';

// Use a symbol as the context key to prevent conflicts
const CONTEXT_KEY = Symbol();

type Notifications = string[];

export function set_notifications(notifications: Notifications) {
  return setContext<Notifications>(CONTEXT_KEY, notifications);
}

export function get_notifications() {
  return getContext<Notifications>(CONTEXT_KEY);
}`,
		usage: `<!-- Root.svelte (root layout) -->
<script lang="ts">
  import { set_notifications } from '$lib/notification-context';
  const { children } = $props();

  // Initialize the state
  const notifications = $state<string[]>([]);

  // Add it to the context
  set_notifications(notifications);
</script>

{@render children()}

<aside>
  {#each notifications as notification}
    <article>{notification}</article>
  {/each}
</aside>

<!-- SomeComponent.svelte -->
<script lang="ts">
  import { get_notifications } from '$lib/notification-context';

  // Get the notifications from the context
  const notifications = get_notifications();
</script>

<button onclick={() => {
  notifications.push("New notification!");
}}>Send notification</button>`,
		notes:
			"This approach is safe for server-side rendering because the context is created anew for each request. The state is scoped to the component tree, so it won't leak between different requests. This is the recommended approach for global state in isomorphic Svelte applications (apps that run both on the server and client). The downside is that you need to set up the context in a root component, and you can only access it from components within that tree.",
	},
	{
		name: 'SvelteKit Locals for Server State',
		description:
			"Using SvelteKit's locals object to share state across server-side load functions",
		code: `// hooks.server.ts
export function handle({ event, resolve }) {
  const user_cookie = event.cookies.get('user');
  if (user_cookie) {
    // Update the locals object
    event.locals.user = await fetch_user(user_cookie);
  }
  return resolve(event);
}`,
		usage: `// +layout.server.ts
export function load({ locals }) {
  return {
    user: locals.user
  };
}

// +page.svelte
<script>
  import { page } from '$app/stores';
  
  // Access the user from page.data
  $: user = $page.data.user;
</script>

{#if user}
  <p>Welcome, {user.name}!</p>
{:else}
  <p>Please log in</p>
{/if}`,
		notes:
			"This approach is specific to SvelteKit and is used to share state between server-side load functions. The locals object is unique for each request, so it's safe for server-side rendering. The state can be passed to the client through the load function's return value, making it available in page.data. This is useful for user authentication, session data, and other server-side state that needs to be shared with the client.",
	},
];

export default global_state_patterns;
