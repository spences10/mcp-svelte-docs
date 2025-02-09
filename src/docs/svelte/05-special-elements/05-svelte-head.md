---
title: '"<svelte:head>"'
description: >-
  This element makes it possible to insert elements into document.head. During
  server-side rendering, head content is exposed separately to the main body
  content.
category: 05-special-elements
tags:
  - svelte
  - 05-special-elements
  - head
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

```svelte
<svelte:head>...</svelte:head>
```

This element makes it possible to insert elements into `document.head`. During server-side rendering, `head` content is exposed separately to the main `body` content.

As with `<svelte:window>`, `<svelte:document>` and `<svelte:body>`, this element may only appear at the top level of your component and must never be inside a block or element.

```svelte
<svelte:head>
	<title>Hello world!</title>
	<meta name="description" content="This is where the description goes for SEO" />
</svelte:head>
```
