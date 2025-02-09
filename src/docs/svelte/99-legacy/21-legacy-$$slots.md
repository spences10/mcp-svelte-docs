---
title: '"$$slots"'
description: >-
  In legacy mode, the way to know if content was provided for a given slot is
  with the $$slots object, whose keys are the names of the slots passed into the
  component by the parent.
category: 99-legacy
tags:
  - svelte
  - 99-legacy
  - legacy
  - $$slots
related:
  - index.md
  - 99-legacy/index.md
  - 99-legacy/40-legacy-component-api.md
code_categories:
  - typescript
difficulty: intermediate
last_updated: '2025-02-09'
---

In runes mode, we know which [snippets](snippet) were provided to a component, as they're just normal props.

In legacy mode, the way to know if content was provided for a given slot is with the `$$slots` object, whose keys are the names of the slots passed into the component by the parent.

```svelte
<!--- file: Card.svelte --->
<div>
	<slot name="title" />
	{#if $$slots.description}
		<!-- This <hr> and slot will render only if `slot="description"` is provided. -->
		<hr />
		<slot name="description" />
	{/if}
</div>
```

```svelte
<!--- file: App.svelte --->
<Card>
	<h1 slot="title">Blog Post Title</h1>
	<!-- No slot named "description" was provided so the optional slot will not be rendered. -->
</Card>
```
