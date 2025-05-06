# Component Events

## Description

In Svelte 5, component events are handled using callback props instead
of the event dispatching mechanism used in Svelte 4.

## Basic Syntax

```js
// Child component
let { onMessage } = $props();
<button onclick={() => onMessage('Hello')}>Send</button>

// Parent component
<Child onMessage={(text) => console.log(text)} />
```

## Examples

### Basic Component Events

```svelte
<!-- Child.svelte -->
<script>
  let { onMessage } = $props();

  function handleClick() {
    onMessage('Hello from Child');
  }
</script>

<button onclick={handleClick}>
  Send Message
</button>

<!-- Parent.svelte -->
<script>
  import Child from './Child.svelte';

  let messages = $state([]);

  function handleMessage(message) {
    messages = [...messages, message];
  }
</script>

<Child onMessage={handleMessage} />

<div>
  <h2>Messages:</h2>
  <ul>
    {#each messages as message}
      <li>{message}</li>
    {/each}
  </ul>
</div>
```

### Passing Data with Events

```svelte
<!-- ItemList.svelte -->
<script>
  let { items, onSelect } = $props();
</script>

<ul>
  {#each items as item}
    <li onclick={() => onSelect(item)}>
      {item.name}
    </li>
  {/each}
</ul>

<!-- App.svelte -->
<script>
  import ItemList from './ItemList.svelte';

  let items = $state([
    { id: 1, name: 'Apple', price: 1.2 },
    { id: 2, name: 'Banana', price: 0.8 },
    { id: 3, name: 'Cherry', price: 2.5 }
  ]);

  let selectedItem = $state(null);

  function handleSelect(item) {
    selectedItem = item;
  }
</script>

<div>
  <ItemList {items} onSelect={handleSelect} />

  {#if selectedItem}
    <div>
      <h2>Selected: {selectedItem.name}</h2>
      <p>Price: ${selectedItem.price}</p>
    </div>
  {/if}
</div>
```

### Multiple Event Callbacks

```svelte
<!-- Form.svelte -->
<script>
  let { onSubmit, onCancel } = $props();
  let name = $state('');
  let email = $state('');

  function handleSubmit(event) {
    event.preventDefault();
    onSubmit({ name, email });
  }
</script>

<form onsubmit={handleSubmit}>
  <div>
    <label for="name">Name:</label>
    <input
      id="name"
      type="text"
      value={name}
      oninput={(e) => name = e.target.value}
    />
  </div>

  <div>
    <label for="email">Email:</label>
    <input
      id="email"
      type="email"
      value={email}
      oninput={(e) => email = e.target.value}
    />
  </div>

  <div>
    <button type="submit">Submit</button>
    <button type="button" onclick={() => onCancel()}>Cancel</button>
  </div>
</form>
```

## Best Practices

- Use callback props instead of event dispatching for component
  communication
- Name callback props with an "on" prefix (e.g., onSubmit, onChange)
- Pass data as an object to allow for future extensibility
- For multiple events, use multiple callback props
- Consider using TypeScript to type your callback props
