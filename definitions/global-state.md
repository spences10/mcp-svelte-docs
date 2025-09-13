# global-state Definition

**Definition:** Advanced patterns for sharing reactive state across
multiple components using Svelte 5 runes  
**Syntax:** Context-based or module-based state sharing patterns  
**Parameters:**

- Context patterns use `setContext(key, state)` and `getContext(key)`
- Module patterns export reactive `$state` objects directly  
  **Returns:** Shared reactive state accessible across component
  boundaries  
  **Patterns:**
- Context API with `$state` for component trees
- Module-level `$state` for global application state
- Custom store patterns using `$state` internally

## Examples

```js
// Context-based global state
// parent.svelte
import { setContext } from 'svelte';

let globalUser = $state({ name: 'Alice', id: 1 });
setContext('user', globalUser);

// child.svelte
import { getContext } from 'svelte';

let user = getContext('user');
// user.name is reactive across components

// Module-based global state
// store.js
export let appState = $state({
	theme: 'dark',
	user: null,
	notifications: [],
});

// component.svelte
import { appState } from './store.js';

// Direct access to global reactive state
appState.theme = 'light'; // Updates everywhere
```

## Related

- `$state` - Creates the underlying reactive state
- `setContext` - Provides context-based state sharing
- `getContext` - Consumes context-based state
- `$derived` - For computed values based on global state
- `$effect` - For side effects responding to global state changes
