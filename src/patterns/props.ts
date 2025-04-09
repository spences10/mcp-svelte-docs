import { Pattern } from './index.js';

/**
 * Props and component patterns
 */
const props_patterns: Pattern[] = [
	{
		name: 'Basic props',
		description: 'Declaring and using component props',
		svelte4: `<!-- Child.svelte -->
<script>
  export let name = 'world';
  export let count;
</script>

<div>
  <h1>Hello {name}!</h1>
  <p>Count: {count}</p>
</div>

<!-- Parent.svelte -->
<script>
  import Child from './Child.svelte';
  let value = 42;
</script>

<Child name="Svelte" count={value} />`,
		svelte5: `<!-- Child.svelte -->
<script>
  let { name = 'world', count } = $props();
</script>

<div>
  <h1>Hello {name}!</h1>
  <p>Count: {count}</p>
</div>

<!-- Parent.svelte -->
<script>
  import Child from './Child.svelte';
  let value = $state(42);
</script>

<Child name="Svelte" count={value} />`,
		notes:
			'In Svelte 5, props are declared using the $props rune and destructuring, rather than export let statements.',
	},
	{
		name: 'Prop spreading',
		description: 'Spreading props to a component',
		svelte4: `<!-- Parent.svelte -->
<script>
  import Child from './Child.svelte';
  
  const props = {
    name: 'Svelte',
    count: 42
  };
</script>

<Child {...props} />`,
		svelte5: `<!-- Parent.svelte -->
<script>
  import Child from './Child.svelte';
  
  const props = $state({
    name: 'Svelte',
    count: 42
  });
</script>

<Child {...props} />`,
		notes:
			'Prop spreading works similarly in both versions, but in Svelte 5 you might want to make the props object reactive with $state.',
	},
	{
		name: 'Prop renaming',
		description: 'Renaming props when destructuring',
		svelte4: `<script>
  export { className as class };
</script>

<div class={className}>
  <slot />
</div>`,
		svelte5: `<script>
  let { class: className } = $props();
</script>

<div class={className}>
  <slot />
</div>`,
		notes:
			'In Svelte 5, you can rename props using standard JavaScript destructuring syntax.',
	},
	{
		name: 'Rest props',
		description: 'Collecting remaining props',
		svelte4: `<script>
  export let name;
  // $$restProps contains all other props
</script>

<div {...$$restProps}>
  Hello {name}
</div>`,
		svelte5: `<script>
  let { name, ...rest } = $props();
</script>

<div {...rest}>
  Hello {name}
</div>`,
		notes:
			'In Svelte 5, you can use standard JavaScript rest syntax to collect remaining props, instead of using the special $$restProps variable.',
	},
	{
		name: 'Bindable props',
		description: 'Creating two-way bindings for props',
		svelte4: `<!-- Child.svelte -->
<script>
  export let value;
</script>

<input bind:value />

<!-- Parent.svelte -->
<script>
  import Child from './Child.svelte';
  let inputValue = 'hello';
</script>

<Child bind:value={inputValue} />
<p>Value: {inputValue}</p>`,
		svelte5: `<!-- Child.svelte -->
<script>
  let { value = $bindable() } = $props();
</script>

<input bind:value />

<!-- Parent.svelte -->
<script>
  import Child from './Child.svelte';
  let inputValue = $state('hello');
</script>

<Child bind:value={inputValue} />
<p>Value: {inputValue}</p>`,
		notes:
			'In Svelte 5, props need to be explicitly marked as bindable using the $bindable rune.',
	},
	{
		name: 'Component children',
		description: 'Passing content to components',
		svelte4: `<!-- Card.svelte -->
<div class="card">
  <div class="card-header">
    <slot name="header">Default header</slot>
  </div>
  <div class="card-body">
    <slot>Default content</slot>
  </div>
  <div class="card-footer">
    <slot name="footer">Default footer</slot>
  </div>
</div>

<!-- App.svelte -->
<script>
  import Card from './Card.svelte';
</script>

<Card>
  <h2 slot="header">Custom Header</h2>
  <p>This is the main content.</p>
  <button slot="footer">Close</button>
</Card>`,
		svelte5: `<!-- Card.svelte -->
<script>
  let { header, children, footer } = $props();
</script>

<div class="card">
  <div class="card-header">
    {@render header?.() ?? 'Default header'}
  </div>
  <div class="card-body">
    {@render children?.() ?? 'Default content'}
  </div>
  <div class="card-footer">
    {@render footer?.() ?? 'Default footer'}
  </div>
</div>

<!-- App.svelte -->
<script>
  import Card from './Card.svelte';
</script>

<Card
  header={() => <h2>Custom Header</h2>}
  footer={() => <button>Close</button>}
>
  <p>This is the main content.</p>
</Card>`,
		notes:
			'In Svelte 5, slots are replaced with snippets. Content inside component tags becomes a snippet prop called children, and named slots become snippet props that are rendered with the {@render ...} tag.',
	},
];

export default props_patterns;
