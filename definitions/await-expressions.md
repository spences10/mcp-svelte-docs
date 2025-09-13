# await-expressions Definition

**Definition:** Experimental async template expressions for handling
promises directly in markup  
**Syntax:** `{await promise}` or `{await promise then result}` or
`{await promise catch error}`  
**Parameters:**

- `promise` - Promise to await in template
- `result` - Variable name for resolved value (optional)
- `error` - Variable name for caught error (optional) **Returns:**
  Rendered content based on promise state  
  **Status:** Experimental feature in Svelte 5

## Examples

```svelte
<!-- Basic await expression -->
<script>
  async function fetchUser(id) {
    const response = await fetch(`/api/users/${id}`);
    return response.json();
  }

  let userId = $state(1);
</script>

<!-- Simple await -->
<p>User: {await fetchUser(userId)}</p>

<!-- With then/catch -->
{#await fetchUser(userId)}
  <p>Loading user...</p>
{:then user}
  <p>Hello {user.name}!</p>
{:catch error}
  <p>Error: {error.message}</p>
{/await}

<!-- Inline await with destructuring -->
<p>Welcome {await fetchUser(userId).then(u => u.name)}!</p>

<!-- Multiple awaits -->
<div>
  <h1>{await getTitle()}</h1>
  <p>{await getDescription()}</p>
  <footer>{await getFooter()}</footer>
</div>

<!-- Conditional await -->
{#if userId}
  <p>User data: {await fetchUser(userId)}</p>
{/if}
```

## Related

- `$effect.pending` - For monitoring pending async operations
- `$state` - For reactive state that can trigger new awaits
- `{#await}` - Traditional await block syntax
