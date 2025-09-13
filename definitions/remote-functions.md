# remote-functions Definition

**Definition:** SvelteKit experimental feature for type-safe
client-server communication without manual API endpoints  
**Syntax:** `export async function myFunction() { ... }` in
`+page.server.js` with client import  
**Parameters:**

- Server-side function definitions
- Client-side imports and calls **Returns:** Type-safe function calls
  across client-server boundary  
  **Status:** Experimental SvelteKit feature

## Examples

```js
// src/routes/+page.server.js
export async function getUserData(userId) {
  // This runs on the server
  const user = await db.users.findById(userId);
  return {
    id: user.id,
    name: user.name,
    email: user.email
  };
}

export async function updateUser(userId, data) {
  // Server-side validation and update
  const updatedUser = await db.users.update(userId, data);
  return updatedUser;
}

// src/routes/+page.svelte
<script>
  import { getUserData, updateUser } from './+page.server.js';

  let userId = $state(1);
  let userData = $state(null);

  // Call server function from client
  async function loadUser() {
    userData = await getUserData(userId);
  }

  async function saveUser(newData) {
    userData = await updateUser(userId, newData);
  }

  // Load user on mount
  $effect(() => {
    loadUser();
  });
</script>

<div>
  {#if userData}
    <h1>{userData.name}</h1>
    <p>{userData.email}</p>
    <button onclick={() => saveUser({ name: 'New Name' })}>
      Update User
    </button>
  {:else}
    <p>Loading...</p>
  {/if}
</div>

// TypeScript support
// src/routes/api/+page.server.ts
export async function getTypedData(): Promise<{ count: number; items: string[] }> {
  return {
    count: 42,
    items: ['a', 'b', 'c']
  };
}

// Client gets full type safety
// src/routes/+page.svelte
<script lang="ts">
  import { getTypedData } from './api/+page.server.js';

  let data = $state<Awaited<ReturnType<typeof getTypedData>> | null>(null);

  $effect(async () => {
    data = await getTypedData(); // Fully typed!
  });
</script>
```

## Related

- `await-expressions` - For handling async calls in templates
- `$effect` - For calling remote functions reactively
- `$state` - For storing remote function results
