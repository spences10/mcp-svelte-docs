---
title: '"Reactive let/var declarations"'
description: >-
  In legacy mode, variables declared at the top level of a component are
  automatically considered _reactive_. Reassigning or mutating these variables
  (count += 1 or object.x = y) will cause the UI to update.
category: 99-legacy
tags:
  - svelte
  - 99-legacy
  - legacy
  - let
related:
  - index.md
  - 99-legacy/index.md
  - 99-legacy/40-legacy-component-api.md
code_categories:
  - typescript
difficulty: intermediate
last_updated: '2025-02-09'
---

In runes mode, reactive state is explicitly declared with the [`$state` rune]($state).

In legacy mode, variables declared at the top level of a component are automatically considered _reactive_. Reassigning or mutating these variables (`count += 1` or `object.x = y`) will cause the UI to update.

```svelte
<script>
	let count = 0;
</script>

<button on:click={() => count += 1}>
	clicks: {count}
</button>
```

Because Svelte's legacy mode reactivity is based on _assignments_, using array methods like `.push()` and `.splice()` won't automatically trigger updates. A subsequent assignment is required to 'tell' the compiler to update the UI:

```svelte
<script>
	let numbers = [1, 2, 3, 4];

	function addNumber() {
		// this method call does not trigger an update
		numbers.push(numbers.length + 1);

		// this assignment will update anything
		// that depends on `numbers`
		numbers = numbers;
	}
</script>
```
