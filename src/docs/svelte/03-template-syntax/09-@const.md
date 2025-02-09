---
title: '"{@const ...}"'
description: "|-\n  |-\n    svelte\n    {each boxes as box}\n    \t{@const area = box.width  box.height}\n    \t{box.width}  {box.height} = {area}\n    {/each}"
category: 03-template-syntax
tags:
  - svelte
  - 03-template-syntax
  - '@const'
related:
  - index.md
  - 99-legacy/index.md
  - 99-legacy/40-legacy-component-api.md
code_categories:
  - typescript
difficulty: intermediate
last_updated: '2025-02-09'
---

The `{@const ...}` tag defines a local constant.

```svelte
{#each boxes as box}
	{@const area = box.width * box.height}
	{box.width} * {box.height} = {area}
{/each}
```

`{@const}` is only allowed as an immediate child of a block — `{#if ...}`, `{#each ...}`, `{#snippet ...}` and so on — a `<Component />` or a `<svelte:boundary>`.
