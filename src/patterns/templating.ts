import { Pattern } from './index.js';

/**
 * Templating patterns
 */
const templating_patterns: Pattern[] = [
	{
		name: 'Conditionals',
		description: 'Conditional rendering with if blocks',
		svelte4: `<script>
  let user = { loggedIn: false };

  function toggle() {
    user.loggedIn = !user.loggedIn;
  }
</script>

{#if user.loggedIn}
  <button on:click={toggle}>
    Log out
  </button>
{:else}
  <button on:click={toggle}>
    Log in
  </button>
{/if}`,
		svelte5: `<script>
  let user = $state({ loggedIn: false });

  function toggle() {
    user.loggedIn = !user.loggedIn;
  }
</script>

{#if user.loggedIn}
  <button onclick={toggle}>
    Log out
  </button>
{:else}
  <button onclick={toggle}>
    Log in
  </button>
{/if}`,
		notes:
			'Conditional rendering with #if blocks works the same way in Svelte 5, but state is explicitly declared with $state.',
	},
	{
		name: 'Loops',
		description: 'Iterating over lists with each blocks',
		svelte4: `<script>
  let cats = [
    { id: 'J---aiyznGQ', name: 'Keyboard Cat' },
    { id: 'z_AbfPXTKms', name: 'Maru' },
    { id: 'OUtn3pvWmpg', name: 'Henri The Existential Cat' }
  ];
</script>

<ul>
  {#each cats as cat, i (cat.id)}
    <li>
      <a href="https://www.youtube.com/watch?v={cat.id}" target="_blank">
        {i + 1}: {cat.name}
      </a>
    </li>
  {/each}
</ul>`,
		svelte5: `<script>
  let cats = $state([
    { id: 'J---aiyznGQ', name: 'Keyboard Cat' },
    { id: 'z_AbfPXTKms', name: 'Maru' },
    { id: 'OUtn3pvWmpg', name: 'Henri The Existential Cat' }
  ]);
</script>

<ul>
  {#each cats as cat, i (cat.id)}
    <li>
      <a href="https://www.youtube.com/watch?v={cat.id}" target="_blank">
        {i + 1}: {cat.name}
      </a>
    </li>
  {/each}
</ul>`,
		notes:
			'The #each block syntax remains the same in Svelte 5, but arrays are made reactive with $state.',
	},
	{
		name: 'Keyed each blocks',
		description: 'Using keys with each blocks for efficient updates',
		svelte4: `<script>
  let things = [
    { id: 1, name: 'apple' },
    { id: 2, name: 'banana' },
    { id: 3, name: 'carrot' },
    { id: 4, name: 'doughnut' },
    { id: 5, name: 'egg' },
  ];
  
  function handleClick() {
    things = things.slice(1);
  }
</script>

<button on:click={handleClick}>
  Remove first thing
</button>

<ul>
  {#each things as thing (thing.id)}
    <li>{thing.name}</li>
  {/each}
</ul>`,
		svelte5: `<script>
  let things = $state([
    { id: 1, name: 'apple' },
    { id: 2, name: 'banana' },
    { id: 3, name: 'carrot' },
    { id: 4, name: 'doughnut' },
    { id: 5, name: 'egg' },
  ]);
  
  function handleClick() {
    things = things.slice(1);
  }
</script>

<button onclick={handleClick}>
  Remove first thing
</button>

<ul>
  {#each things as thing (thing.id)}
    <li>{thing.name}</li>
  {/each}
</ul>`,
		notes:
			'Keyed each blocks work the same way in Svelte 5, ensuring efficient updates when the list changes.',
	},
	{
		name: 'Await blocks',
		description: 'Handling promises with await blocks',
		svelte4: `<script>
  let promise = getRandomNumber();
  
  async function getRandomNumber() {
    const res = await fetch('/random-number');
    const text = await res.text();
    return text;
  }
  
  function handleClick() {
    promise = getRandomNumber();
  }
</script>

<button on:click={handleClick}>
  generate random number
</button>

{#await promise}
  <p>...waiting</p>
{:then number}
  <p>The number is {number}</p>
{:catch error}
  <p style="color: red">{error.message}</p>
{/await}`,
		svelte5: `<script>
  let promise = $state(getRandomNumber());
  
  async function getRandomNumber() {
    const res = await fetch('/random-number');
    const text = await res.text();
    return text;
  }
  
  function handleClick() {
    promise = getRandomNumber();
  }
</script>

<button onclick={handleClick}>
  generate random number
</button>

{#await promise}
  <p>...waiting</p>
{:then number}
  <p>The number is {number}</p>
{:catch error}
  <p style="color: red">{error.message}</p>
{/await}`,
		notes:
			'The #await block syntax remains the same in Svelte 5, allowing you to handle the different states of a promise.',
	},
	{
		name: 'HTML content',
		description: 'Rendering HTML strings',
		svelte4: `<script>
  let string = '<b>Bold text</b> and <i>italic text</i>';
</script>

<p>{@html string}</p>`,
		svelte5: `<script>
  let string = $state('<b>Bold text</b> and <i>italic text</i>');
</script>

<p>{@html string}</p>`,
		notes:
			'The @html tag works the same way in Svelte 5, allowing you to render HTML strings. Be careful with user-generated content to avoid XSS vulnerabilities.',
	},
	{
		name: 'Dynamic components',
		description: 'Dynamically selecting components',
		svelte4: `<script>
  import Red from './Red.svelte';
  import Green from './Green.svelte';
  import Blue from './Blue.svelte';

  let components = [Red, Green, Blue];
  let selected = components[0];
</script>

<select bind:value={selected}>
  {#each components as component, i}
    <option value={component}>
      {component.name}
    </option>
  {/each}
</select>

<svelte:component this={selected} />`,
		svelte5: `<script>
  import Red from './Red.svelte';
  import Green from './Green.svelte';
  import Blue from './Blue.svelte';

  let components = [Red, Green, Blue];
  let selected = $state(components[0]);
</script>

<select bind:value={selected}>
  {#each components as component, i}
    <option value={component}>
      {component.name}
    </option>
  {/each}
</select>

<selected />`,
		notes:
			'In Svelte 5, you can directly use the component variable as a tag, making <svelte:component this={selected}> unnecessary.',
	},
];

export default templating_patterns;
