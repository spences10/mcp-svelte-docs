---
title: '"{@render ...}"'
description: "|-\n  |-\n    svelte\n    {snippet sum(a, b)}\n    \t<p>{a} + {b} = {a + b}</p>\n    {/snippet}"
category: 03-template-syntax
tags:
  - svelte
  - 03-template-syntax
  - '@render'
related:
  - index.md
  - 99-legacy/index.md
  - 99-legacy/40-legacy-component-api.md
code_categories:
  - typescript
difficulty: intermediate
last_updated: '2025-02-09'
---

To render a [snippet](snippet), use a `{@render ...}` tag.

```svelte
{#snippet sum(a, b)}
	<p>{a} + {b} = {a + b}</p>
{/snippet}

{@render sum(1, 2)}
{@render sum(3, 4)}
{@render sum(5, 6)}
```

The expression can be an identifier like `sum`, or an arbitrary JavaScript expression:

```svelte
{@render (cool ? coolSnippet : lameSnippet)()}
```

## Optional snippets

If the snippet is potentially undefined — for example, because it's an incoming prop — then you can use optional chaining to only render it when it _is_ defined:

```svelte
{@render children?.()}
```

Alternatively, use an [`{#if ...}`](if) block with an `:else` clause to render fallback content:

```svelte
{#if children}
	{@render children()}
{:else}
	<p>fallback content</p>
{/if}
```
