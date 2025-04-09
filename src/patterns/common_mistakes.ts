import { CommonMistake } from './index.js';

/**
 * Common mistakes when working with Svelte 5
 */
const common_mistakes: CommonMistake[] = [
	// Reactivity Mistakes
	{
		name: 'Exporting state directly',
		description:
			'Directly exporting a stateful variable from a module',
		mistake: `// counter.svelte.js
let count = $state(0);

export { count };`,
		correction: `// counter.svelte.js
let count = $state(0);

export function getCount() {
  return count;
}

export function setCount(value) {
  count = value;
}`,
		explanation:
			"When you export a stateful variable directly, the reactivity is lost when it's imported elsewhere. This is because the importing module only gets the current value, not the reactive binding. Instead, export functions that access and modify the state.",
	},
	{
		name: 'Using object getters/setters',
		description:
			'A better approach for exporting state using object getters/setters',
		mistake: `// counter.svelte.js
let count = $state(0);

export function getCount() {
  return count;
}

export function setCount(value) {
  count = value;
}`,
		correction: `// counter.svelte.js
let count = $state(0);

export const counter = {
  get value() {
    return count;
  },
  set value(newCount) {
    count = newCount;
  }
};`,
		explanation:
			'While exporting getter and setter functions works, a more ergonomic approach is to export an object with getter and setter properties. This allows for a more natural API: counter.value++ instead of setCount(getCount() + 1).',
	},
	{
		name: 'Using $state with objects',
		description:
			'Forgetting that $state makes objects deeply reactive',
		mistake: `<script>
  let user = $state({ name: 'John', age: 30 });
  
  function updateUser() {
    // Creating a new object unnecessarily
    user = { ...user, age: user.age + 1 };
  }
</script>`,
		correction: `<script>
  let user = $state({ name: 'John', age: 30 });
  
  function updateUser() {
    // Simply update the property
    user.age += 1;
  }
</script>`,
		explanation:
			"When you wrap an object with $state, it becomes deeply reactive. This means you can mutate its properties directly and the UI will update. There's no need to create a new object with the spread operator like you would in React or Redux.",
	},
	{
		name: 'Using on:click instead of onclick',
		description: 'Using Svelte 4 event directive syntax in Svelte 5',
		mistake: `<button on:click={handleClick}>
  Click me
</button>`,
		correction: `<button onclick={handleClick}>
  Click me
</button>`,
		explanation:
			'In Svelte 5, event handlers use standard HTML attributes (onclick) instead of the directive syntax (on:click) used in Svelte 4. This change aligns Svelte more closely with standard HTML and makes it more consistent with other frameworks.',
	},
	{
		name: 'Using event modifiers',
		description: 'Trying to use Svelte 4 event modifiers in Svelte 5',
		mistake: `<form on:submit|preventDefault={handleSubmit}>
  <!-- form content -->
  <button type="submit">Submit</button>
</form>`,
		correction: `<form onsubmit={(e) => {
  e.preventDefault();
  handleSubmit(e);
}}>
  <!-- form content -->
  <button type="submit">Submit</button>
</form>`,
		explanation:
			'Svelte 5 does not support event modifiers like |preventDefault or |stopPropagation. Instead, you need to handle these operations explicitly in your event handler function.',
	},
	{
		name: 'Multiple event handlers',
		description:
			'Trying to attach multiple handlers to the same event in Svelte 5',
		mistake: `<button on:click={logClick} on:click={incrementCount}>
  Click me
</button>`,
		correction: `<button onclick={(e) => {
  logClick(e);
  incrementCount(e);
}}>
  Click me
</button>`,
		explanation:
			'In Svelte 5, you cannot attach multiple handlers to the same event using multiple attributes. Instead, you need to create a single handler that calls multiple functions.',
	},
	{
		name: 'Using createEventDispatcher',
		description:
			"Using Svelte 4's event dispatching mechanism in Svelte 5",
		mistake: `<!-- Child.svelte -->
<script>
  import { createEventDispatcher } from 'svelte';
  const dispatch = createEventDispatcher();
  
  function handleClick() {
    dispatch('message', {
      text: 'Hello from Child'
    });
  }
</script>

<button onclick={handleClick}>
  Send Message
</button>`,
		correction: `<!-- Child.svelte -->
<script>
  let { message } = $props();
  
  function handleClick() {
    message({
      text: 'Hello from Child'
    });
  }
</script>

<button onclick={handleClick}>
  Send Message
</button>`,
		explanation:
			'In Svelte 5, component events are replaced with callback props. Instead of using createEventDispatcher, you accept a callback function as a prop and call it directly with your data.',
	},
	{
		name: 'Using export let for props',
		description:
			"Using Svelte 4's export let syntax for props in Svelte 5",
		mistake: `<script>
  export let name;
  export let age = 0;
</script>

<div>
  <p>Name: {name}</p>
  <p>Age: {age}</p>
</div>`,
		correction: `<script>
  let { name, age = 0 } = $props();
</script>

<div>
  <p>Name: {name}</p>
  <p>Age: {age}</p>
</div>`,
		explanation:
			'In Svelte 5, props are declared using the $props rune instead of export let. This makes the props system more explicit and allows for more advanced features like type checking and default values.',
	},
	{
		name: 'Using $: for derived values',
		description:
			"Using Svelte 4's reactive declarations for derived values in Svelte 5",
		mistake: `<script>
  let count = $state(0);
  $: doubled = count * 2;
  $: isEven = count % 2 === 0;
</script>`,
		correction: `<script>
  let count = $state(0);
  let doubled = $derived(count * 2);
  let isEven = $derived(count % 2 === 0);
</script>`,
		explanation:
			'In Svelte 5, derived values are created using the $derived rune instead of $: reactive declarations. This makes the code more explicit about what is derived state versus side effects.',
	},
	{
		name: 'Using $: for effects',
		description:
			"Using Svelte 4's reactive declarations for side effects in Svelte 5",
		mistake: `<script>
  let count = $state(0);
  
  $: {
    console.log('Count changed:', count);
    if (count > 10) {
      alert('Count is too high!');
    }
  }
</script>`,
		correction: `<script>
  let count = $state(0);
  
  $effect(() => {
    console.log('Count changed:', count);
    if (count > 10) {
      alert('Count is too high!');
    }
  });
</script>`,
		explanation:
			'In Svelte 5, side effects are created using the $effect rune instead of $: blocks. This makes it clear that the code is running for its side effects rather than computing a derived value.',
	},
	{
		name: 'Using <slot> instead of snippets',
		description:
			"Using Svelte 4's slot system instead of Svelte 5's snippets",
		mistake: `<!-- Parent.svelte -->
<script>
  import Child from './Child.svelte';
</script>

<Child>
  <p>This is some content</p>
</Child>

<!-- Child.svelte -->
<script>
  // Child component
</script>

<div>
  <slot></slot>
</div>`,
		correction: `<!-- Parent.svelte -->
<script>
  import Child from './Child.svelte';
</script>

<Child>
  {#snippet children()}
    <p>This is some content</p>
  {/snippet}
</Child>

<!-- Child.svelte -->
<script>
  let { children } = $props();
</script>

<div>
  {@render children()}
</div>`,
		explanation:
			'In Svelte 5, slots are being replaced with snippets, which are more flexible and powerful. Snippets can be passed as props, can accept parameters, and have lexical scoping rules. Note that slots still work in Svelte 5 for backward compatibility, but snippets are the recommended approach for new code.',
	},
	{
		name: 'Incorrect TypeScript usage with $props',
		description:
			'Incorrectly typing props in Svelte 5 with TypeScript',
		mistake: `<script lang="ts">
  interface Props {
    name: string;
    age?: number;
  }
  
  let props = $props<Props>();
  let { name, age = 0 } = props;
</script>`,
		correction: `<script lang="ts">
  let { name, age = 0 }: { name: string; age?: number } = $props();
</script>`,
		explanation:
			"In Svelte 5 with TypeScript, you can type your props directly in the destructuring pattern. There's no need to create a separate interface or type for the props unless you want to reuse it across multiple components.",
	},
	{
		name: 'Forgetting to use $state',
		description: 'Forgetting to use $state for reactive variables',
		mistake: `<script>
  let count = 0;
  
  function increment() {
    count++;
    // UI won't update!
  }
</script>

<button onclick={increment}>
  Clicked {count} times
</button>`,
		correction: `<script>
  let count = $state(0);
  
  function increment() {
    count++;
    // UI will update
  }
</script>

<button onclick={increment}>
  Clicked {count} times
</button>`,
		explanation:
			"In Svelte 5, variables need to be explicitly marked as reactive using the $state rune. Without $state, changes to the variable won't trigger UI updates. This is different from Svelte 4, where top-level variables in components were automatically reactive.",
	},
];

export default common_mistakes;
