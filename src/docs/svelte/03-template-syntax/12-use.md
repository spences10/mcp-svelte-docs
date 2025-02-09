---
title: '"use:"'
description: "|-\n  |-\n    svelte\n    <!--- file: App.svelte --->\n    <script>\n    \t/ @type {import('svelte/action').Action} /\n    \tfunction myaction(node) {\n    \t\t// the node has been mounted in the DOM"
category: 03-template-syntax
tags:
  - svelte
  - 03-template-syntax
  - use
related:
  - index.md
  - 99-legacy/index.md
  - 99-legacy/40-legacy-component-api.md
code_categories:
  - typescript
  - server
difficulty: intermediate
last_updated: '2025-02-09'
---

Actions are functions that are called when an element is mounted. They are added with the `use:` directive, and will typically use an `$effect` so that they can reset any state when the element is unmounted:

```svelte
<!--- file: App.svelte --->
<script>
	/** @type {import('svelte/action').Action} */
	function myaction(node) {
		// the node has been mounted in the DOM

		$effect(() => {
			// setup goes here

			return () => {
				// teardown goes here
			};
		});
	}
</script>

<div use:myaction>...</div>
```

An action can be called with an argument:

```svelte
<!--- file: App.svelte --->
<script>
	/** @type {import('svelte/action').Action} */
	function myaction(node, +++data+++) {
		// ...
	}
</script>

<div use:myaction={+++data+++}>...</div>
```

The action is only called once (but not during server-side rendering) — it will _not_ run again if the argument changes.

> [!LEGACY]
> Prior to the `$effect` rune, actions could return an object with `update` and `destroy` methods, where `update` would be called with the latest value of the argument if it changed. Using effects is preferred.

## Typing

The `Action` interface receives three optional type arguments — a node type (which can be `Element`, if the action applies to everything), a parameter, and any custom event handlers created by the action:

```svelte
<!--- file: App.svelte --->
<script>
	/**
	 * @type {import('svelte/action').Action<
	 * 	HTMLDivElement,
	 * 	undefined,
	 * 	{
	 * 		onswiperight: (e: CustomEvent) => void;
	 * 		onswipeleft: (e: CustomEvent) => void;
	 * 		// ...
	 * 	}
	 * >}
	 */
	function gestures(node) {
		$effect(() => {
			// ...
			node.dispatchEvent(new CustomEvent('swipeleft'));

			// ...
			node.dispatchEvent(new CustomEvent('swiperight'));
		});
	}
</script>

<div
	use:gestures
	onswipeleft={next}
	onswiperight={prev}
>...</div>
```
