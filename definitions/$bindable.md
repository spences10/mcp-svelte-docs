# $bindable Definition

**Definition:** Creates bindable prop for two-way data binding  
**Syntax:** `$bindable<T>(fallback?: T): T`  
**Parameters:**

- `fallback` - Optional fallback value  
  **Returns:** Bindable value of type T  
  **Variants:**
- Used within component props for two-way binding

## Examples

```js
<!-- Child.svelte -->
<script>
  let { value = $bindable() } = $props();
</script>

<input bind:value />

<!-- Parent.svelte -->
<script>
  let text = $state('Hello');
</script>

<Child bind:value={text} />
<p>Text: {text}</p>

<!-- With fallback value -->
<script>
  let { count = $bindable(0) } = $props();

  function increment() {
    count++;
  }
</script>

<button onclick={increment}>
  Count: {count}
</button>

<!-- Parent usage -->
<script>
  let number = $state(5);
</script>

<Counter bind:count={number} />
<p>Number: {number}</p>

<!-- TypeScript example -->
<script lang="ts">
  interface Props {
    value: string;
  }

  let { value = $bindable<string>('') }: Props = $props();
</script>

<input bind:value placeholder="Enter text..." />
```

## Related

- `$props` - For declaring component props
- `$state` - For local reactive state
- `bind:` - Svelte binding syntax used with bindable props
