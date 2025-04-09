import { Pattern } from './index.js';

/**
 * Lifecycle patterns
 */
const lifecycle_patterns: Pattern[] = [
	{
		name: 'Component initialization',
		description: 'Running code when a component is mounted',
		svelte4: `<script>
  import { onMount } from 'svelte';
  
  let data = [];
  
  onMount(async () => {
    const response = await fetch('/api/data');
    data = await response.json();
  });
</script>

<div>
  {#if data.length > 0}
    <ul>
      {#each data as item}
        <li>{item.name}</li>
      {/each}
    </ul>
  {:else}
    <p>Loading...</p>
  {/if}
</div>`,
		svelte5: `<script>
  let data = $state([]);
  
  $effect(() => {
    async function fetchData() {
      const response = await fetch('/api/data');
      data = await response.json();
    }
    
    fetchData();
  });
</script>

<div>
  {#if data.length > 0}
    <ul>
      {#each data as item}
        <li>{item.name}</li>
      {/each}
    </ul>
  {:else}
    <p>Loading...</p>
  {/if}
</div>`,
		notes:
			'In Svelte 5, the onMount lifecycle function is replaced with the $effect rune, which runs after the component is mounted.',
	},
	{
		name: 'Cleanup',
		description: 'Running code when a component is destroyed',
		svelte4: `<script>
  import { onDestroy } from 'svelte';
  
  let interval = setInterval(() => {
    console.log('Tick');
  }, 1000);
  
  onDestroy(() => {
    clearInterval(interval);
  });
</script>`,
		svelte5: `<script>
  $effect(() => {
    const interval = setInterval(() => {
      console.log('Tick');
    }, 1000);
    
    // Return a cleanup function
    return () => {
      clearInterval(interval);
    };
  });
</script>`,
		notes:
			'In Svelte 5, cleanup is handled by returning a function from $effect, which will be called when the component is destroyed or when the effect runs again.',
	},
	{
		name: 'Reactive updates',
		description: 'Running code before and after DOM updates',
		svelte4: `<script>
  import { beforeUpdate, afterUpdate } from 'svelte';
  
  let count = 0;
  let previous = 0;
  
  beforeUpdate(() => {
    previous = count;
  });
  
  afterUpdate(() => {
    console.log(\`Count changed from \${previous} to \${count}\`);
  });
  
  function increment() {
    count += 1;
  }
</script>

<button on:click={increment}>
  Increment ({count})
</button>`,
		svelte5: `<script>
  let count = $state(0);
  let previous = $state(0);
  
  $effect.pre(() => {
    previous = count;
  });
  
  $effect(() => {
    console.log(\`Count changed from \${previous} to \${count}\`);
  });
  
  function increment() {
    count += 1;
  }
</script>

<button onclick={increment}>
  Increment ({count})
</button>`,
		notes:
			'In Svelte 5, beforeUpdate is replaced with $effect.pre, which runs before DOM updates, and afterUpdate is replaced with $effect, which runs after DOM updates.',
	},
	{
		name: 'Tick function',
		description: 'Waiting for pending state changes to apply',
		svelte4: `<script>
  import { tick } from 'svelte';
  
  let name = 'world';
  let inputElement;
  
  async function focusInput() {
    name = 'everyone';
    
    // DOM not yet updated, so inputElement.focus() won't work
    
    await tick();
    // DOM is now updated
    inputElement.focus();
  }
</script>

<input bind:this={inputElement} value={name} />
<button on:click={focusInput}>Focus</button>`,
		svelte5: `<script>
  import { tick } from 'svelte';
  
  let name = $state('world');
  let inputElement;
  
  async function focusInput() {
    name = 'everyone';
    
    // DOM not yet updated, so inputElement.focus() won't work
    
    await tick();
    // DOM is now updated
    inputElement.focus();
  }
</script>

<input bind:this={inputElement} value={name} />
<button onclick={focusInput}>Focus</button>`,
		notes:
			'The tick function works the same way in Svelte 5, allowing you to wait for pending state changes to be applied to the DOM.',
	},
	{
		name: 'Component binding',
		description: 'Accessing component instance methods',
		svelte4: `<!-- Child.svelte -->
<script>
  export function sayHello() {
    alert('Hello!');
  }
</script>

<div>Child component</div>

<!-- Parent.svelte -->
<script>
  import Child from './Child.svelte';
  
  let child;
  
  function callChildMethod() {
    child.sayHello();
  }
</script>

<Child bind:this={child} />
<button on:click={callChildMethod}>
  Say Hello
</button>`,
		svelte5: `<!-- Child.svelte -->
<script>
  export function sayHello() {
    alert('Hello!');
  }
</script>

<div>Child component</div>

<!-- Parent.svelte -->
<script>
  import Child from './Child.svelte';
  
  let child;
  
  function callChildMethod() {
    child.sayHello();
  }
</script>

<Child bind:this={child} />
<button onclick={callChildMethod}>
  Say Hello
</button>`,
		notes:
			'Component binding with bind:this works the same way in Svelte 5, allowing you to access component instance methods.',
	},
];

export default lifecycle_patterns;
