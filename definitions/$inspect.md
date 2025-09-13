# $inspect Definition

**Definition:** Development tool for inspecting reactive state
changes  
**Syntax:** `$inspect<T extends any[]>(...values: T)`  
**Parameters:**

- `...values` - Values to inspect  
  **Returns:** Object with `with` method for custom inspection  
  **Variants:**
- `$inspect.trace(name?: string): void` - Traces reactive updates with
  optional label

## Examples

```js
// Basic inspection
let count = $state(0);
let doubled = $derived(count * 2);

$inspect(count, doubled);
// Logs to console whenever count or doubled changes

// With custom inspection
let user = $state({ name: 'Alice', age: 30 });

$inspect(user).with((value) => {
	console.log('User changed:', JSON.stringify(value, null, 2));
});

// Inspect multiple values
let a = $state(1);
let b = $state(2);
let sum = $derived(a + b);

$inspect(a, b, sum);

// Trace reactive updates
$inspect.trace('user-updates');

// Named trace for debugging
$inspect.trace('component-lifecycle');

// Conditional inspection (development only)
if (import.meta.env.DEV) {
	$inspect(count, doubled);
}

// Inspect complex state changes
let items = $state([]);
let filter = $state('');
let filteredItems = $derived(
	items.filter((item) => item.includes(filter)),
);

$inspect(items, filter, filteredItems).with(
	(items, filter, filtered) => {
		console.group('Filter Debug');
		console.log('Items:', items);
		console.log('Filter:', filter);
		console.log('Filtered:', filtered);
		console.groupEnd();
	},
);
```

## Related

- `$state` - For reactive state that can be inspected
- `$derived` - For computed values that can be inspected
- `$effect` - For side effects, use effects instead of inspect for
  production logic
