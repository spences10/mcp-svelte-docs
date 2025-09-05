# Svelte Await Expressions

Svelte 5.36+ introduces experimental support for using `await`
expressions directly in your components, enabling powerful
asynchronous patterns with automatic loading states and error
handling.

## Overview

As of Svelte 5.36, you can use the `await` keyword in three places
where it was previously unavailable:

- At the top level of your component's `<script>`
- Inside `$derived(...)` declarations
- Inside your markup

This feature is **experimental** and requires opt-in configuration.

## Configuration

Enable await expressions by adding the `experimental.async` option in
your `svelte.config.js`:

```javascript
export default {
	compilerOptions: {
		experimental: {
			async: true,
		},
	},
};
```

The experimental flag will be removed in Svelte 6.

## Basic Usage

### In Markup

```svelte
<script>
  let a = $state(1);
  let b = $state(2);

  async function add(a, b) {
    await new Promise((f) => setTimeout(f, 500)); // artificial delay
    return a + b;
  }
</script>

<input type="number" bind:value={a}>
<input type="number" bind:value={b}>

<p>{a} + {b} = {await add(a, b)}</p>
```

### In $derived Declarations

```svelte
<script>
  async function fetchData() {
    const response = await fetch('/api/data');
    return response.json();
  }

  let data = $derived(await fetchData());
</script>

<p>Data: {JSON.stringify(data)}</p>
```

## Boundaries Requirement

Currently, you can only use `await` inside a `<svelte:boundary>` with
a `pending` snippet:

```svelte
<svelte:boundary>
  <MyApp />

  {#snippet pending()}
    <p>Loading...</p>
  {/snippet}
</svelte:boundary>
```

This restriction will be lifted once Svelte supports asynchronous
server-side rendering.

> **Note**: In the Svelte playground, your app is rendered inside a
> boundary with an empty pending snippet automatically.

## Synchronized Updates

When an `await` expression depends on state, changes to that state are
synchronized - the UI won't update until the asynchronous work
completes, preventing inconsistent states:

```svelte
<script>
  let count = $state(1);

  async function slowAdd(n) {
    await new Promise(f => setTimeout(f, 1000));
    return n + 1;
  }
</script>

<!-- If count changes, display won't show intermediate values -->
<p>Count: {await slowAdd(count)}</p>
```

Updates can overlap - a fast update will be reflected while an earlier
slow update is still ongoing.

## Concurrency

Svelte runs independent `await` expressions in parallel:

```svelte
<!-- Both functions run simultaneously -->
<p>{await fetchUserData()}</p>
<p>{await fetchSettings()}</p>
```

This parallel execution applies to:

- Independent expressions in markup
- Independent `$derived` expressions (after initial sequential
  creation)

Sequential `await` expressions in `<script>` or inside async functions
run normally like standard JavaScript.

## Loading States

### Using $effect.pending()

Indicate ongoing asynchronous work with `$effect.pending()`:

```svelte
<script>
  import { tick, settled } from 'svelte';

  let isLoading = $derived($effect.pending());

  async function handleClick() {
    let updating = true;

    // Ensure 'updating' change is reflected immediately
    await tick();

    let color = 'blue';
    let answer = 42;

    // Wait for all updates to complete
    await settled();

    updating = false;
  }
</script>

{#if isLoading}
  <p>Loading...</p>
{/if}
```

### Using settled()

The `settled()` function returns a promise that resolves when all
state changes and resulting asynchronous work complete:

```svelte
<script>
  import { settled } from 'svelte';

  async function complexUpdate() {
    // Make state changes
    someState = newValue;

    // Wait for all related async work to complete
    await settled();

    // Now safe to proceed
    console.log('All updates complete');
  }
</script>
```

## Error Handling

Errors in `await` expressions bubble to the nearest error boundary:

```svelte
<svelte:boundary>
  <div>
    {await mayThrowError()}
  </div>

  {#snippet error(err)}
    <p>Error: {err.message}</p>
  {/snippet}

  {#snippet pending()}
    <p>Loading...</p>
  {/snippet}
</svelte:boundary>
```

## Common Patterns

### Data Fetching

```svelte
<script>
  async function fetchUser(id) {
    const response = await fetch(`/api/users/${id}`);
    if (!response.ok) throw new Error('Failed to fetch user');
    return response.json();
  }

  let userId = $state(1);
  let user = $derived(await fetchUser(userId));
</script>

<h1>Welcome, {user.name}!</h1>
```

### Dependent Async Operations

```svelte
<script>
  let step1 = $derived(await fetchStep1());
  let step2 = $derived(await fetchStep2(step1.id));
  let result = $derived(await processResult(step2.data));
</script>

<p>Final result: {result}</p>
```

### Form Submission with Loading

```svelte
<script>
  let submitting = $state(false);

  async function handleSubmit(event) {
    submitting = true;
    await tick(); // Ensure UI shows loading state

    try {
      await submitForm(new FormData(event.target));
      // Handle success
    } catch (error) {
      // Handle error
    } finally {
      submitting = false;
    }
  }
</script>

<form on:submit|preventDefault={handleSubmit}>
  <input name="email" type="email" required>
  <button type="submit" disabled={submitting}>
    {submitting ? 'Submitting...' : 'Submit'}
  </button>
</form>
```

## Performance Considerations

### Avoid Waterfalls

Be careful of sequential `await` expressions that could run in
parallel:

```svelte
<!-- ❌ Waterfall - runs sequentially -->
<script>
  let data1 = $derived(await fetch('/api/data1').then(r => r.json()));
  let data2 = $derived(await fetch('/api/data2').then(r => r.json()));
</script>

<!-- ✅ Better - runs in parallel -->
<script>
  async function fetchBoth() {
    const [data1, data2] = await Promise.all([
      fetch('/api/data1').then(r => r.json()),
      fetch('/api/data2').then(r => r.json())
    ]);
    return { data1, data2 };
  }

  let combined = $derived(await fetchBoth());
</script>
```

Svelte will show an `await_waterfall` warning for sequential dependent
awaits.

## Caveats and Limitations

1. **Experimental Feature**: APIs may change in breaking ways outside
   semver major releases
2. **SSR Limitation**: Server-side rendering is synchronous - only
   `pending` snippets render during SSR
3. **Boundary Requirement**: Currently requires `<svelte:boundary>`
   with `pending` snippet
4. **Effect Order**: Block effects run before `$effect.pre` when
   `experimental.async` is enabled

## Migration from {#await}

The traditional `{#await}` block syntax still works, but await
expressions provide more flexibility:

```svelte
<!-- Traditional approach -->
{#await promise}
  <p>Loading...</p>
{:then value}
  <p>Value: {value}</p>
{:catch error}
  <p>Error: {error.message}</p>
{/await}

<!-- New approach with boundaries -->
<svelte:boundary>
  <p>Value: {await promise}</p>

  {#snippet pending()}
    <p>Loading...</p>
  {/snippet}

  {#snippet error(err)}
    <p>Error: {err.message}</p>
  {/snippet}
</svelte:boundary>
```

## Best Practices

1. **Use boundaries**: Always wrap await expressions in
   `<svelte:boundary>`
2. **Handle errors**: Provide error snippets for better user
   experience
3. **Show loading states**: Use `pending` snippets and
   `$effect.pending()`
4. **Avoid waterfalls**: Use `Promise.all()` for independent async
   operations
5. **Use `settled()`**: Wait for complex updates to complete before
   proceeding
6. **Test thoroughly**: Experimental feature - test edge cases
   carefully
