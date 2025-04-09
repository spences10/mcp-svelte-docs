import { Svelte5Feature } from './index.js';

/**
 * Svelte 5 features
 */
const svelte5_features: Svelte5Feature[] = [
	// Runes
	{
		name: '$state',
		description:
			'The $state rune is used to declare reactive state in Svelte 5.',
		examples: [
			{
				code: `<script>
  let count = $state(0);
  
  function increment() {
    count++;
  }
</script>

<button onclick={increment}>
  Clicked {count} times
</button>`,
				explanation:
					'Basic usage of $state to create a reactive counter. When the button is clicked, the count is incremented and the UI updates automatically.',
			},
			{
				code: `<script lang="ts">
  let count = $state<number>(0);
  
  function increment(): void {
    count++;
  }
</script>

<button onclick={increment}>
  Clicked {count} times
</button>`,
				explanation:
					'TypeScript version with type annotations. The $state rune accepts a generic type parameter to specify the type of the state variable.',
			},
			{
				code: `<script>
  let user = $state({ name: 'John', age: 30 });
  
  function birthday() {
    user.age++;
  }
</script>

<div>
  <p>{user.name} is {user.age} years old</p>
  <button onclick={birthday}>Birthday!</button>
</div>`,
				explanation:
					'When you pass an object or array to $state, it becomes deeply reactive. Changes to nested properties will trigger updates.',
			},
			{
				code: `<script lang="ts">
  interface User {
    name: string;
    age: number;
  }
  
  let user = $state<User>({ name: 'John', age: 30 });
  
  function birthday(): void {
    user.age++;
  }
</script>

<div>
  <p>{user.name} is {user.age} years old</p>
  <button onclick={birthday}>Birthday!</button>
</div>`,
				explanation:
					'TypeScript version with an interface to define the shape of the user object. This provides better type checking and autocompletion.',
			},
		],
		bestPractices: [
			'Use $state for any value that needs to trigger UI updates when changed',
			"For large arrays or objects that don't need deep reactivity, consider using $state.raw",
			"Don't export $state variables directly from modules, use getter/setter functions instead",
			'When using TypeScript, you can specify the type: let count = $state<number>(0)',
		],
	},
	{
		name: '$state.raw',
		description:
			'The $state.raw variant is used for values that should only be reactive when reassigned, not when their properties change.',
		examples: [
			{
				code: `<script>
  let numbers = $state.raw([1, 2, 3]);
  
  function addNumber() {
    // This will trigger reactivity because we're reassigning the array
    numbers = [...numbers, numbers.length + 1];
  }
  
  function updateFirst() {
    // This will NOT trigger reactivity because we're mutating the array
    numbers[0] = 99;
  }
</script>

<button onclick={addNumber}>Add number</button>
<button onclick={updateFirst}>Update first</button>
<p>{numbers.join(', ')}</p>`,
				explanation:
					'$state.raw creates a value that is only reactive when the entire value is reassigned, not when its properties are mutated. This can be more performant for large arrays or objects.',
			},
			{
				code: `<script lang="ts">
  let numbers = $state.raw<number[]>([1, 2, 3]);
  
  function addNumber(): void {
    // This will trigger reactivity because we're reassigning the array
    numbers = [...numbers, numbers.length + 1];
  }
  
  function updateFirst(): void {
    // This will NOT trigger reactivity because we're mutating the array
    numbers[0] = 99;
  }
</script>

<button onclick={addNumber}>Add number</button>
<button onclick={updateFirst}>Update first</button>
<p>{numbers.join(', ')}</p>`,
				explanation:
					'TypeScript version with type annotations. The $state.raw rune also accepts a generic type parameter.',
			},
		],
		bestPractices: [
			'Use $state.raw for large collections where you only care about wholesale replacements',
			'Always treat $state.raw values as immutable - create new instances rather than mutating',
			'Consider using $state.raw for performance-critical code with large data structures',
		],
	},
	{
		name: '$derived',
		description:
			'The $derived rune creates values that are computed from other reactive values.',
		examples: [
			{
				code: `<script>
  let count = $state(0);
  let doubled = $derived(count * 2);
  let isEven = $derived(count % 2 === 0);
  
  function increment() {
    count++;
  }
</script>

<button onclick={increment}>Increment</button>
<p>Count: {count}</p>
<p>Doubled: {doubled}</p>
<p>Is even: {isEven ? 'Yes' : 'No'}</p>`,
				explanation:
					'$derived automatically tracks dependencies and updates when any dependency changes. In this example, both doubled and isEven update whenever count changes.',
			},
			{
				code: `<script lang="ts">
  let count = $state<number>(0);
  let doubled = $derived<number>(count * 2);
  let isEven = $derived<boolean>(count % 2 === 0);
  
  function increment(): void {
    count++;
  }
</script>

<button onclick={increment}>Increment</button>
<p>Count: {count}</p>
<p>Doubled: {doubled}</p>
<p>Is even: {isEven ? 'Yes' : 'No'}</p>`,
				explanation:
					'TypeScript version with type annotations for all reactive variables. The $derived rune also accepts a generic type parameter to specify the return type.',
			},
		],
		bestPractices: [
			'Use $derived for values that can be computed from other state',
			'Keep derivations simple and focused on a single computation',
			'Avoid side effects in $derived expressions - use $effect for side effects',
			'For complex derivations, use $derived.by with a function',
		],
	},
	{
		name: '$derived.by',
		description:
			'The $derived.by variant allows for more complex derivations using a function.',
		examples: [
			{
				code: `<script>
  let numbers = $state([1, 2, 3, 4, 5]);
  
  let stats = $derived.by(() => {
    const sum = numbers.reduce((a, b) => a + b, 0);
    const avg = sum / numbers.length;
    const max = Math.max(...numbers);
    const min = Math.min(...numbers);
    
    return { sum, avg, max, min };
  });
  
  function addNumber() {
    numbers = [...numbers, Math.floor(Math.random() * 10) + 1];
  }
</script>

<button onclick={addNumber}>Add random number</button>
<p>Numbers: {numbers.join(', ')}</p>
<p>Sum: {stats.sum}</p>
<p>Average: {stats.avg.toFixed(2)}</p>
<p>Max: {stats.max}</p>
<p>Min: {stats.min}</p>`,
				explanation:
					'$derived.by allows you to create complex derivations that compute multiple values or require more logic than a simple expression.',
			},
			{
				code: `<script lang="ts">
  interface Stats {
    sum: number;
    avg: number;
    max: number;
    min: number;
  }

  let numbers = $state<number[]>([1, 2, 3, 4, 5]);
  
  let stats = $derived.by<Stats>(() => {
    const sum = numbers.reduce((a, b) => a + b, 0);
    const avg = sum / numbers.length;
    const max = Math.max(...numbers);
    const min = Math.min(...numbers);
    
    return { sum, avg, max, min };
  });
  
  function addNumber(): void {
    numbers = [...numbers, Math.floor(Math.random() * 10) + 1];
  }
</script>

<button onclick={addNumber}>Add random number</button>
<p>Numbers: {numbers.join(', ')}</p>
<p>Sum: {stats.sum}</p>
<p>Average: {stats.avg.toFixed(2)}</p>
<p>Max: {stats.max}</p>
<p>Min: {stats.min}</p>`,
				explanation:
					'TypeScript version with an interface to define the shape of the stats object. The $derived.by rune accepts a generic type parameter to specify the return type.',
			},
		],
		bestPractices: [
			'Use $derived.by when you need to compute multiple values or use more complex logic',
			'Keep the function pure - avoid side effects',
			'All reactive values accessed in the function will be tracked automatically',
			'For expensive computations, consider memoization techniques',
		],
	},
	{
		name: '$effect',
		description:
			'The $effect rune runs side effects when reactive values change.',
		examples: [
			{
				code: `<script>
  let count = $state(0);
  
  $effect(() => {
    console.log('Count changed:', count);
    
    if (count > 10) {
      alert('Count is getting high!');
    }
    
    // Optional cleanup function
    return () => {
      console.log('Cleaning up previous effect');
    };
  });
  
  function increment() {
    count++;
  }
</script>

<button onclick={increment}>Increment ({count})</button>`,
				explanation:
					'$effect runs after the component is mounted and whenever any reactive values accessed inside it change. It can optionally return a cleanup function that runs before the effect runs again or when the component is destroyed.',
			},
			{
				code: `<script lang="ts">
  let count = $state<number>(0);
  
  $effect(() => {
    console.log('Count changed:', count);
    
    if (count > 10) {
      alert('Count is getting high!');
    }
    
    // Optional cleanup function
    return (): void => {
      console.log('Cleaning up previous effect');
    };
  });
  
  function increment(): void {
    count++;
  }
</script>

<button onclick={increment}>Increment ({count})</button>`,
				explanation:
					'TypeScript version with type annotations. The cleanup function is typed with a void return type.',
			},
		],
		bestPractices: [
			'Use $effect for side effects like logging, DOM manipulation, or API calls',
			'Return a cleanup function if your effect creates resources that need to be cleaned up',
			'Keep effects focused on a single responsibility',
			'Avoid changing state in effects unless you have safeguards against infinite loops',
			'Consider $effect.pre for effects that need to run before DOM updates',
		],
	},
	{
		name: '$props',
		description:
			'The $props rune is used to declare component props in Svelte 5.',
		examples: [
			{
				code: `<script>
  let { name, age = 0 } = $props();
</script>

<div>
  <p>Name: {name}</p>
  <p>Age: {age}</p>
</div>`,
				explanation:
					'Basic usage of $props to declare component props with default values. The props can be accessed directly in the component.',
			},
			{
				code: `<script lang="ts">
  let { name, age = 0 }: { name: string; age?: number } = $props();
</script>

<div>
  <p>Name: {name}</p>
  <p>Age: {age}</p>
</div>`,
				explanation:
					'TypeScript version with inline type annotations for the props. This provides better type checking and autocompletion.',
			},
			{
				code: `<script>
  let { class: className, style, ...rest } = $props();
</script>

<div class={className} {style} {...rest}>
  <slot />
</div>`,
				explanation:
					'You can use destructuring to rename props and spread the rest. This is useful for creating wrapper components that forward attributes to an underlying element.',
			},
			{
				code: `<script lang="ts">
  interface Props {
    class?: string;
    style?: string;
    [key: string]: any;
  }
  
  let { class: className, style, ...rest }: Props = $props();
</script>

<div class={className} {style} {...rest}>
  <slot />
</div>`,
				explanation:
					'TypeScript version with an interface to define the shape of the props. The index signature [key: string]: any allows for additional props to be passed through.',
			},
		],
		bestPractices: [
			'Use destructuring to declare the props you expect',
			'Provide default values for optional props',
			'Use TypeScript to type your props',
			'For bindable props, use the $bindable rune',
			'Use the spread operator to forward attributes to underlying elements',
		],
	},
	{
		name: 'Snippets',
		description:
			'Snippets are a new feature in Svelte 5 that allow you to define reusable chunks of markup inside your components.',
		examples: [
			{
				code: `{#snippet figure(image)}
<figure>
  <img
    src={image.src}
    alt={image.caption}
    width={image.width}
    height={image.height}
  />
  <figcaption>{image.caption}</figcaption>
</figure>
{/snippet}

{@render figure(headerImage)}
{@render figure(footerImage)}`,
				explanation:
					'This example defines a snippet called "figure" that takes an image object as a parameter and renders a figure element with an image and caption. The snippet is then rendered twice with different image objects.',
			},
			{
				code: `<script>
  import Table from './Table.svelte';
  const fruits = [
    { name: 'apples', qty: 5, price: 2 },
    { name: 'bananas', qty: 10, price: 1 },
    { name: 'cherries', qty: 20, price: 0.5 }
  ];
</script>

{#snippet header()}
<th>fruit</th>
<th>qty</th>
<th>price</th>
<th>total</th>
{/snippet}

{#snippet row(fruit)}
<td>{fruit.name}</td>
<td>{fruit.qty}</td>
<td>{fruit.price}</td>
<td>{fruit.qty * fruit.price}</td>
{/snippet}

<Table data={fruits} {header} {row} />`,
				explanation:
					'Snippets can be passed as props to components. This example defines header and row snippets that are passed to a Table component.',
			},
		],
		bestPractices: [
			'Use snippets to reduce duplication in your templates',
			'Snippets can be passed as props to components',
			'Snippets have lexical scoping rules - they are only visible in the same scope they are defined in',
			'Use parameters to make snippets more flexible',
			'Snippets can reference other snippets and even themselves (for recursion)',
		],
	},
	{
		name: 'Event Handling',
		description:
			'Svelte 5 uses standard HTML attributes for event handling instead of the directive syntax used in Svelte 4.',
		examples: [
			{
				code: `<script>
  let count = $state(0);
  
  function handleClick() {
    count++;
  }
</script>

<button onclick={handleClick}>
  Clicked {count} times
</button>`,
				explanation:
					'Basic event handling in Svelte 5 uses standard HTML attributes like onclick instead of the on:click directive syntax used in Svelte 4.',
			},
			{
				code: `<script>
  let count = $state(0);
  
  function handleClick(event) {
    // Access the event object
    console.log('Clicked at:', event.clientX, event.clientY);
    count++;
  }
  
  function handleSubmit(event) {
    // Prevent default behavior
    event.preventDefault();
    // Form submission logic
    console.log('Form submitted');
  }
</script>

<button onclick={handleClick}>
  Clicked {count} times
</button>

<form onsubmit={handleSubmit}>
  <input type="text" name="username" />
  <button type="submit">Submit</button>
</form>`,
				explanation:
					'Event handlers receive the event object as a parameter. You can use this to access event properties or call methods like preventDefault().',
			},
		],
		bestPractices: [
			'Use standard HTML attributes for event handling (onclick, onsubmit, etc.)',
			'For event modifiers, use wrapper functions instead of the pipe syntax',
			'For multiple handlers, combine them into a single function',
			'For component events, use callback props instead of event dispatching',
			'Use event delegation for handling events on multiple elements',
		],
	},
	{
		name: 'Component Events',
		description:
			'In Svelte 5, component events are handled using callback props instead of event dispatching.',
		examples: [
			{
				code: `<!-- Child.svelte -->
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
</button>

<!-- Parent.svelte -->
<script>
  import Child from './Child.svelte';
  
  function handleMessage(data) {
    alert(data.text);
  }
</script>

<Child message={handleMessage} />`,
				explanation:
					'In Svelte 5, components communicate with their parents using callback props instead of event dispatching. The child component accepts a callback function as a prop and calls it directly with data.',
			},
		],
		bestPractices: [
			'Use callback props instead of event dispatching for component communication',
			'Name callback props after the event they represent',
			'Pass data as an object to allow for future extensibility',
			'For multiple events, use multiple callback props',
			'Consider using TypeScript to type your callback props',
		],
	},
];

export default svelte5_features;
