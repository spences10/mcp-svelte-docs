# $derived.by Definition

**Definition:** Complex derivation using function for expensive
computations  
**Syntax:** `$derived.by<T>(fn: () => T): T`  
**Parameters:**

- `fn` - Function that returns the derived value  
  **Returns:** Computed value that updates when dependencies change  
  **Variants:**
- Part of `$derived` rune family

## Examples

```js
// Expensive computation that should be memoized
let items = $state([1, 2, 3, 4, 5]);
let filter = $state('even');

const expensiveResult = $derived.by(() => {
	console.log('Computing expensive result...');

	return items
		.filter((item) =>
			filter === 'even' ? item % 2 === 0 : item % 2 === 1,
		)
		.map((item) => item * item)
		.reduce((sum, item) => sum + item, 0);
});

// Complex async-like patterns (though still synchronous)
const processedData = $derived.by(() => {
	if (!items.length) return null;

	let result = items.slice();

	// Multiple processing steps
	result = result.sort((a, b) => a - b);
	result = result.map((x) => x * 2);

	return {
		processed: result,
		sum: result.reduce((a, b) => a + b, 0),
		average: result.reduce((a, b) => a + b, 0) / result.length,
	};
});

// When you need multiple statements
const validation = $derived.by(() => {
	const errors = [];

	if (items.length === 0) {
		errors.push('Items cannot be empty');
	}

	if (items.some((item) => item < 0)) {
		errors.push('Items must be positive');
	}

	return {
		isValid: errors.length === 0,
		errors,
	};
});

// Override a derived temporarily (e.g., optimistic UI)
let likes = $derived(post.likes);
async function like() {
	likes += 1; // override
	try {
		await sendLike();
	} catch {
		likes -= 1; // rollback on error
	}
}

// Destructuring: each piece remains reactive
let { a, b } = $derived(getPair()); // roughly equivalent to $derived(getPair().a) and ...b

// Dependency control
let total2 = $derived.by(() => {
	// anything read synchronously is a dependency
	return items.reduce((s, n) => s + n, 0);
});

// To exempt values from tracking, use untrack(...)
```

## Related

- `$derived` - For simple derived expressions
- `$state` - For reactive state that derived values depend on
- `$effect` - For side effects, not computed values
