---
title: '"{#key ...}"'
description: >-
  Key blocks destroy and recreate their contents when the value of an expression
  changes. When used around components, this will cause them to be
  reinstantiated and reinitialised:
category: 03-template-syntax
tags:
  - svelte
  - 03-template-syntax
  - key
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
<!--- copy: false  --->
{#key expression}...{/key}
```

Key blocks destroy and recreate their contents when the value of an expression changes. When used around components, this will cause them to be reinstantiated and reinitialised:

```svelte
{#key value}
	<Component />
{/key}
```

It's also useful if you want a transition to play whenever a value changes:

```svelte
{#key value}
	<div transition:fade>{value}</div>
{/key}
```
