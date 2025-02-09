---
title: '"$$props and $$restProps"'
description: 'In legacy mode, we use $$props and $$restProps:'
category: 99-legacy
tags:
  - svelte
  - 99-legacy
  - legacy
  - $$props
  - and
  - $$restprops
related:
  - index.md
  - 99-legacy/index.md
  - 99-legacy/40-legacy-component-api.md
code_categories:
  - typescript
difficulty: intermediate
last_updated: '2025-02-09'
---

In runes mode, getting an object containing all the props that were passed in is easy, using the [`$props`]($props) rune.

In legacy mode, we use `$$props` and `$$restProps`:

- `$$props` contains all the props that were passed in, including ones that are not individually declared with the `export` keyword
- `$$restProps` contains all the props that were passed in _except_ the ones that were individually declared

For example, a `<Button>` component might need to pass along all its props to its own `<button>` element, except the `variant` prop:

```svelte
<script>
	export let variant;
</script>

<button {...$$restProps} class="variant-{variant} {$$props.class ?? ''}">
	click me
</button>

<style>
	.variant-danger {
		background: red;
	}
</style>
```

In Svelte 3/4 using `$$props` and `$$restProps` creates a modest performance penalty, so they should only be used when needed.
