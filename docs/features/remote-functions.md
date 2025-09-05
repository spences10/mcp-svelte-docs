# SvelteKit Remote Functions

Remote functions enable type-safe communication between client and
server in SvelteKit applications. They run exclusively on the server,
providing access to server-only resources like environment variables,
databases, and file systems.

## Overview

Remote functions are server-side functions that can be called from
client-side code with full type safety. They're defined in
`.remote.js` or `.remote.ts` files and come in four types:

- **query**: Read dynamic data from the server
- **form**: Handle form submissions and data mutations
- **command**: Execute server actions without form elements
- **prerender**: Generate data at build time for static content

This feature is **experimental** and requires opt-in configuration.

## Configuration

Enable remote functions in your `svelte.config.js`:

```javascript
export default {
	compilerOptions: {
		experimental: { async: true }, // Required for await expressions
	},
	kit: {
		experimental: {
			remoteFunctions: true, // Enable remote functions
		},
	},
};
```

## File Structure

Remote functions are defined in `.remote.ts` or `.remote.js` files
alongside your routes:

```
src/routes/
├── +page.svelte
├── todos.remote.ts      // Remote functions for todos
├── login/
│   ├── +page.svelte
│   └── login.remote.ts  // Remote functions for login
└── api/
    └── data.remote.ts   // Shared remote functions
```

## Function Types

### Query Functions

Query functions read data from the server and can be used with await
expressions:

```typescript
// todos.remote.ts
import { query } from '$app/server';

export const getTodos = query(async () => {
	const todos = await db.todo.findMany();
	return todos;
});
```

```svelte
<!-- +page.svelte -->
<script>
  import { getTodos } from './todos.remote';

  const todos = getTodos();
</script>

<!-- Use with await expressions -->
<ul>
  {#each await todos as todo}
    <li>{todo.text}</li>
  {/each}
</ul>
```

### Form Functions

Form functions handle form submissions and mutations:

```typescript
// todos.remote.ts
import { form } from '$app/server';

export const addTodo = form(async (data) => {
	const text = data.get('text') as string;
	if (!text) {
		return 'Todo text cannot be empty.'; // Return error message
	}

	await db.todo.create({
		data: { text, done: false },
	});

	// Trigger refresh of related queries
	await getTodos().refresh();
});
```

```svelte
<!-- +page.svelte -->
<script>
  import { addTodo } from './todos.remote';
</script>

<!-- Spread form props for automatic enhancement -->
<form {...addTodo}>
  <input type="text" name="text" placeholder="Add todo" required />
  <button type="submit">Add</button>
</form>
```

### Command Functions

Command functions execute server actions without requiring form
elements:

```typescript
// todos.remote.ts
import { command } from '$app/server';
import { z } from 'zod';

export const toggleTodo = command(z.string(), async (id) => {
	const todo = await db.todo.findUnique({ where: { id } });
	if (!todo) throw new Error('Todo not found');

	await db.todo.update({
		where: { id },
		data: { done: !todo.done },
	});
});
```

```svelte
<!-- +page.svelte -->
<script>
  import { toggleTodo, getTodos } from './todos.remote';

  const todos = getTodos();

  async function handleToggle(todoId) {
    // Optimistic update with server sync
    await toggleTodo(todoId).updates(
      todos.withOverride((currentTodos) =>
        currentTodos.map((t) =>
          t.id === todoId ? { ...t, done: !t.done } : t
        )
      )
    );
  }
</script>

{#each await todos as todo}
  <input
    type="checkbox"
    checked={todo.done}
    onchange={() => handleToggle(todo.id)}
  />
  {todo.text}
{/each}
```

### Prerender Functions

Prerender functions generate data at build time for static content:

```typescript
// blog.remote.ts
import { prerender } from '$app/server';

export const getBlogPosts = prerender(async () => {
	const posts = await fetchFromCMS();
	return posts;
});
```

```svelte
<!-- +page.svelte -->
<script>
  import { getBlogPosts } from './blog.remote';

  // Data is available immediately at runtime
  const posts = getBlogPosts();
</script>

{#each await posts as post}
  <article>
    <h2>{post.title}</h2>
    <p>{post.excerpt}</p>
  </article>
{/each}
```

## Advanced Patterns

### Authentication and Authorization

```typescript
// auth.remote.ts
import { query, form, getRequestEvent } from '$app/server';
import { redirect } from '@sveltejs/kit';

export const getCurrentUser = query(async () => {
	const event = getRequestEvent();
	const token = event.cookies.get('auth-token');

	if (!token) {
		redirect(303, '/login');
	}

	return await validateToken(token);
});

export const login = form(async (data) => {
	const email = data.get('email') as string;
	const password = data.get('password') as string;

	const user = await authenticateUser(email, password);
	if (!user) {
		return 'Invalid credentials';
	}

	const event = getRequestEvent();
	event.cookies.set('auth-token', user.token, {
		path: '/',
		httpOnly: true,
		secure: true,
	});

	redirect(303, '/dashboard');
});
```

### Error Handling

```typescript
// todos.remote.ts
export const deleteTodo = form(async (data) => {
	const id = data.get('id') as string;

	// Simulate random errors for demo
	if (Math.random() < 0.2) {
		throw new Error('Random server error');
	}

	await db.todo.delete({ where: { id } });
});
```

```svelte
<!-- +page.svelte -->
<script>
  import { deleteTodo } from './todos.remote';
</script>

{#each await todos as todo}
  {@const remove = deleteTodo.for(todo.id)}

  <form
    {...remove.enhance(async ({ submit }) => {
      try {
        await submit();
      } catch (error) {
        // Handle error without showing error page
        console.error('Delete failed:', error.message);
      }
    })}
  >
    {#if remove.error}
      <span class="error">{remove.error.message}</span>
    {/if}
    <button name="id" value={todo.id}>Delete</button>
  </form>
{/each}
```

### Optimistic Updates

```svelte
<script>
  import { toggleTodo, getTodos } from './todos.remote';

  const todos = getTodos();

  async function optimisticToggle(todoId) {
    await toggleTodo(todoId).updates(
      // Optimistic update - UI updates immediately
      todos.withOverride((current) =>
        current.map((todo) =>
          todo.id === todoId
            ? { ...todo, done: !todo.done }
            : todo
        )
      )
    );
  }
</script>

{#each await todos as todo}
  <label>
    <input
      type="checkbox"
      checked={todo.done}
      onchange={() => optimisticToggle(todo.id)}
    />
    <span class:done={todo.done}>{todo.text}</span>
  </label>
{/each}
```

### Data Validation

Use Zod for type-safe validation:

```typescript
// profile.remote.ts
import { form } from '$app/server';
import { z } from 'zod';

const updateProfileSchema = z.object({
	name: z.string().min(2).max(50),
	email: z.string().email(),
	age: z.number().min(13).max(120),
});

export const updateProfile = form(async (data) => {
	const result = updateProfileSchema.safeParse({
		name: data.get('name'),
		email: data.get('email'),
		age: Number(data.get('age')),
	});

	if (!result.success) {
		return result.error.format(); // Return validation errors
	}

	await db.user.update({
		where: { id: userId },
		data: result.data,
	});
});
```

## Server-Only Access

Remote functions have access to server-only resources:

```typescript
// api.remote.ts
import { query } from '$app/server';
import { DATABASE_URL } from '$env/static/private';

export const getServerStats = query(async () => {
	// Access environment variables
	const dbUrl = DATABASE_URL;

	// Access file system
	const logs = await fs.readFile('/var/log/app.log', 'utf8');

	// Access database directly
	const stats = await db.$queryRaw`
    SELECT COUNT(*) as total_users FROM users
  `;

	return { stats, logCount: logs.split('\n').length };
});
```

## Integration with SvelteKit Features

### Loading States

```svelte
<script>
  import { getTodos } from './todos.remote';

  const todos = getTodos();
  let isLoading = $derived($effect.pending());
</script>

<svelte:boundary>
  {#if isLoading}
    <div class="spinner">Loading...</div>
  {/if}

  <ul>
    {#each await todos as todo}
      <li>{todo.text}</li>
    {/each}
  </ul>

  {#snippet pending()}
    <div class="skeleton">Loading todos...</div>
  {/snippet}

  {#snippet error(err)}
    <div class="error">Failed to load: {err.message}</div>
  {/snippet}
</svelte:boundary>
```

### Progressive Enhancement

```svelte
<script>
  import { addTodo } from './todos.remote';
</script>

<!-- Works without JavaScript -->
<form {...addTodo}>
  <input type="text" name="text" required />
  <button type="submit">Add Todo</button>
</form>

<!-- Enhanced with JavaScript -->
<form
  {...addTodo.enhance(async ({ submit, formData }) => {
    // Custom handling before submission
    const text = formData.get('text');
    if (!text?.trim()) {
      alert('Please enter todo text');
      return;
    }

    await submit();

    // Clear form on success
    event.target.reset();
  })}
>
  <input type="text" name="text" required />
  <button type="submit">Add Todo</button>
</form>
```

## Performance Considerations

### Query Caching and Refreshing

```typescript
// data.remote.ts
export const getExpensiveData = query(async () => {
	// This will be cached and reused
	const data = await expensiveOperation();
	return data;
});
```

```svelte
<script>
  import { getExpensiveData } from './data.remote';

  const data = getExpensiveData();

  async function refresh() {
    // Manually refresh cached data
    await data.refresh();
  }
</script>

<button onclick={refresh}>Refresh Data</button>
<div>{await data}</div>
```

### Concurrent Operations

```svelte
<script>
  import { getUserData, getUserPosts, getUserFriends } from './user.remote';

  const userId = $state('123');

  // All three queries run concurrently
  const userData = getUserData(userId);
  const userPosts = getUserPosts(userId);
  const userFriends = getUserFriends(userId);
</script>

<div>
  <h1>{(await userData).name}</h1>
  <p>Posts: {(await userPosts).length}</p>
  <p>Friends: {(await userFriends).length}</p>
</div>
```

## Security Best Practices

1. **Validate all inputs**: Use schemas like Zod for type safety
2. **Authenticate requests**: Check user permissions in query/command
   functions
3. **Sanitize data**: Clean user input before database operations
4. **Rate limiting**: Implement rate limiting for expensive operations
5. **Error handling**: Don't expose sensitive server information in
   errors

```typescript
// secure.remote.ts
import { query, getRequestEvent } from '$app/server';
import { z } from 'zod';

export const getSecureData = query(async () => {
	const event = getRequestEvent();
	const user = await authenticateRequest(event);

	if (!user || !user.hasPermission('read:data')) {
		throw new Error('Unauthorized');
	}

	return await fetchSecureData(user.id);
});
```

## Common Patterns

### Master-Detail Views

```typescript
// products.remote.ts
export const getProducts = query(async () => {
	return await db.product.findMany();
});

export const getProduct = query(async (id: string) => {
	const product = await db.product.findUnique({
		where: { id },
		include: { reviews: true },
	});
	if (!product) throw new Error('Product not found');
	return product;
});
```

```svelte
<!-- products/+page.svelte -->
<script>
  import { getProducts } from './products.remote';

  const products = getProducts();
</script>

{#each await products as product}
  <a href="/products/{product.id}">{product.name}</a>
{/each}
```

### Real-time Updates

```svelte
<script>
  import { getTodos, addTodo } from './todos.remote';

  const todos = getTodos();

  // Poll for updates every 30 seconds
  setInterval(async () => {
    await todos.refresh();
  }, 30000);
</script>
```

## Best Practices

1. **Keep functions focused**: Each remote function should have a
   single responsibility
2. **Use appropriate types**: Choose query/form/command/prerender
   based on use case
3. **Handle errors gracefully**: Provide meaningful error messages and
   fallbacks
4. **Implement loading states**: Use boundaries and pending snippets
5. **Validate inputs**: Always validate and sanitize user inputs
6. **Consider performance**: Cache expensive operations and use
   concurrent requests
7. **Test thoroughly**: Remote functions are experimental - test edge
   cases
