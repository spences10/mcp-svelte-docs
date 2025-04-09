import { Pattern } from './index.js';

/**
 * State management patterns
 */
const state_patterns: Pattern[] = [
	{
		name: 'Basic state',
		description: 'Declaring and using component state',
		svelte4: `<script>
  let count = 0;
  
  function increment() {
    count++;
  }
</script>

<button on:click={increment}>
  Clicked {count} times
</button>`,
		svelte5: `<script>
  let count = $state(0);
  
  function increment() {
    count++;
  }
</script>

<button onclick={increment}>
  Clicked {count} times
</button>`,
		notes:
			'In Svelte 5, state is explicitly declared using the $state rune, and event handlers use standard HTML attributes (onclick) instead of the directive syntax (on:click).',
	},
	{
		name: 'Derived state',
		description: 'Computing values based on state',
		svelte4: `<script>
  let count = 0;
  $: doubled = count * 2;
  
  function increment() {
    count++;
  }
</script>

<button on:click={increment}>
  Count: {count}, Doubled: {doubled}
</button>`,
		svelte5: `<script>
  let count = $state(0);
  const doubled = $derived(count * 2);
  
  function increment() {
    count++;
  }
</script>

<button onclick={increment}>
  Count: {count}, Doubled: {doubled}
</button>`,
		notes:
			'In Svelte 5, derived values are created using the $derived rune instead of the $: reactive declarations used in Svelte 4.',
	},
	{
		name: 'Effects',
		description: 'Running side effects when state changes',
		svelte4: `<script>
  let count = 0;
  
  $: {
    if (count > 5) {
      alert('Count is too high!');
    }
  }
  
  function increment() {
    count++;
  }
</script>

<button on:click={increment}>
  Increment ({count})
</button>`,
		svelte5: `<script>
  let count = $state(0);
  
  $effect(() => {
    if (count > 5) {
      alert('Count is too high!');
    }
  });
  
  function increment() {
    count++;
  }
</script>

<button onclick={increment}>
  Increment ({count})
</button>`,
		notes:
			'In Svelte 5, side effects are created using the $effect rune instead of $: statements. $effect runs after the component is mounted and can also handle cleanup if you return a function from it.',
	},
	{
		name: 'Reactive objects and arrays',
		description: 'Working with reactive objects and arrays',
		svelte4: `<script>
  let user = { name: 'John', age: 30 };
  let items = ['apple', 'banana', 'orange'];
  
  function updateUser() {
    user.age += 1;
  }
  
  function addItem() {
    items = [...items, 'grape'];
  }
</script>

<div>
  <p>Name: {user.name}, Age: {user.age}</p>
  <button on:click={updateUser}>Birthday</button>
  
  <ul>
    {#each items as item}
      <li>{item}</li>
    {/each}
  </ul>
  <button on:click={addItem}>Add item</button>
</div>`,
		svelte5: `<script>
  let user = $state({ name: 'John', age: 30 });
  let items = $state(['apple', 'banana', 'orange']);
  
  function updateUser() {
    user.age += 1;
  }
  
  function addItem() {
    items = [...items, 'grape'];
  }
</script>

<div>
  <p>Name: {user.name}, Age: {user.age}</p>
  <button onclick={updateUser}>Birthday</button>
  
  <ul>
    {#each items as item}
      <li>{item}</li>
    {/each}
  </ul>
  <button onclick={addItem}>Add item</button>
</div>`,
		notes:
			'In Svelte 5, objects and arrays are made reactive by wrapping them with $state. This makes them deeply reactive, so changes to nested properties will trigger updates.',
	},
	{
		name: 'Store usage',
		description: 'Using stores for shared state',
		svelte4: `<script>
  import { writable } from 'svelte/store';
  
  const count = writable(0);
  
  function increment() {
    count.update(n => n + 1);
  }
</script>

<button on:click={increment}>
  Clicked {$count} times
</button>`,
		svelte5: `<script>
  import { writable } from 'svelte/store';
  
  const count = writable(0);
  
  function increment() {
    count.update(n => n + 1);
  }
</script>

<button onclick={increment}>
  Clicked {$count} times
</button>`,
		notes:
			'Stores work similarly in Svelte 5, but you can also use $state outside of components in .svelte.js or .svelte.ts files for shared state.',
	},
];

export default state_patterns;
