---
title: '"Nested <style> elements"'
description: >-
  However, it is possible to have a <style> tag nested inside other elements or
  logic blocks.
category: 04-styling
tags:
  - svelte
  - 04-styling
  - nested
  - style
  - elements
related:
  - index.md
  - 99-legacy/index.md
  - 99-legacy/40-legacy-component-api.md
code_categories:
  - typescript
difficulty: intermediate
last_updated: '2025-02-09'
---

There can only be one top-level `<style>` tag per component.

However, it is possible to have a `<style>` tag nested inside other elements or logic blocks.

In that case, the `<style>` tag will be inserted as-is into the DOM; no scoping or processing will be done on the `<style>` tag.

```svelte
<div>
	<style>
		/* this style tag will be inserted as-is */
		div {
			/* this will apply to all `<div>` elements in the DOM */
			color: red;
		}
	</style>
</div>
```
