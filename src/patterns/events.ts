import { Pattern } from './index.js';

/**
 * Event handling patterns
 */
const event_patterns: Pattern[] = [
	{
		name: 'Basic event handling',
		description: 'Handling click events',
		svelte4: `<script>
  let count = 0;
  
  function handleClick() {
    count++;
  }
</script>

<button on:click={handleClick}>
  Clicked {count} times
</button>`,
		svelte5: `<script>
  let count = $state(0);
  
  function handleClick() {
    count++;
  }
</script>

<button onclick={handleClick}>
  Clicked {count} times
</button>`,
		notes:
			'In Svelte 5, event handlers use standard HTML attributes (onclick) instead of the directive syntax (on:click).',
	},
	{
		name: 'Inline event handlers',
		description: 'Using inline functions for event handling',
		svelte4: `<script>
  let count = 0;
</script>

<button on:click={() => count++}>
  Clicked {count} times
</button>`,
		svelte5: `<script>
  let count = $state(0);
</script>

<button onclick={() => count++}>
  Clicked {count} times
</button>`,
		notes:
			'Inline event handlers work similarly in both versions, but Svelte 5 uses the standard HTML attribute syntax.',
	},
	{
		name: 'Event modifiers',
		description: 'Using event modifiers like preventDefault',
		svelte4: `<script>
  function handleSubmit() {
    // Form submission logic
    console.log('Form submitted');
  }
</script>

<form on:submit|preventDefault={handleSubmit}>
  <input type="text" name="username" />
  <button type="submit">Submit</button>
</form>`,
		svelte5: `<script>
  function handleSubmit(event) {
    event.preventDefault();
    // Form submission logic
    console.log('Form submitted');
  }
</script>

<form onsubmit={handleSubmit}>
  <input type="text" name="username" />
  <button type="submit">Submit</button>
</form>`,
		notes:
			'Svelte 5 does not support event modifiers. Instead, you need to call methods like preventDefault() directly in your event handler.',
	},
	{
		name: 'Multiple event handlers',
		description: 'Attaching multiple handlers to the same event',
		svelte4: `<script>
  function logClick() {
    console.log('Button clicked');
  }
  
  function incrementCount() {
    count++;
  }
  
  let count = 0;
</script>

<button on:click={logClick} on:click={incrementCount}>
  Clicked {count} times
</button>`,
		svelte5: `<script>
  function logClick() {
    console.log('Button clicked');
  }
  
  function incrementCount() {
    count++;
  }
  
  function handleClick(e) {
    logClick(e);
    incrementCount(e);
  }
  
  let count = $state(0);
</script>

<button onclick={handleClick}>
  Clicked {count} times
</button>`,
		notes:
			'In Svelte 5, you cannot attach multiple handlers to the same event. Instead, you need to create a single handler that calls multiple functions.',
	},
	{
		name: 'Component events',
		description: 'Creating and handling component events',
		svelte4: `<!-- Child.svelte -->
<script>
  import { createEventDispatcher } from 'svelte';
  const dispatch = createEventDispatcher();
  
  function handleClick() {
    dispatch('message', {
      text: 'Hello from Child'
    });
  }
</script>

<button on:click={handleClick}>
  Send Message
</button>

<!-- Parent.svelte -->
<script>
  import Child from './Child.svelte';
  
  function handleMessage(event) {
    alert(event.detail.text);
  }
</script>

<Child on:message={handleMessage} />`,
		svelte5: `<!-- Child.svelte -->
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
		notes:
			'In Svelte 5, component events are replaced with callback props. Instead of using createEventDispatcher, you accept a callback function as a prop and call it directly.',
	},
	{
		name: 'Event forwarding',
		description:
			'Forwarding events from elements to component consumers',
		svelte4: `<!-- Button.svelte -->
<button on:click>
  <slot />
</button>

<!-- App.svelte -->
<script>
  import Button from './Button.svelte';
  
  function handleClick() {
    alert('Button clicked');
  }
</script>

<Button on:click={handleClick}>
  Click me
</Button>`,
		svelte5: `<!-- Button.svelte -->
<script>
  let { onclick } = $props();
</script>

<button {onclick}>
  <slot />
</button>

<!-- App.svelte -->
<script>
  import Button from './Button.svelte';
  
  function handleClick() {
    alert('Button clicked');
  }
</script>

<Button onclick={handleClick}>
  Click me
</Button>`,
		notes:
			'In Svelte 5, event forwarding is done by accepting the event handler as a prop and passing it to the element.',
	},
];

export default event_patterns;
