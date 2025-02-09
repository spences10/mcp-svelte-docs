---
title: '"<svelte:body>"'
description: >-
  Similarly to <svelte:window>, this element allows you to add listeners to
  events on document.body, such as mouseenter and mouseleave, which don't fire
  on window. It also lets you use [actions](use) on the <body> element.
category: 05-special-elements
tags:
  - svelte
  - 05-special-elements
  - body
related:
  - index.md
  - 99-legacy/index.md
  - 99-legacy/40-legacy-component-api.md
code_categories:
  - typescript
difficulty: intermediate
last_updated: '2025-02-09'
---

```svelte
<svelte:body onevent={handler} />
```

Similarly to `<svelte:window>`, this element allows you to add listeners to events on `document.body`, such as `mouseenter` and `mouseleave`, which don't fire on `window`. It also lets you use [actions](use) on the `<body>` element.

As with `<svelte:window>` and `<svelte:document>`, this element may only appear the top level of your component and must never be inside a block or element.

```svelte
<svelte:body onmouseenter={handleMouseenter} onmouseleave={handleMouseleave} use:someAction />
```
