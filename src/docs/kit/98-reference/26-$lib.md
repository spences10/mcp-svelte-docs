---
title: '"$lib"'
description: |-
  |-
    |-
      svelte
      <!--- file: src/lib/Component.svelte --->
      A reusable component
category: 98-reference
tags:
  - kit
  - 98-reference
  - $lib
related:
  - index.md
  - 98-reference/index.md
  - 98-reference/54-types.md
code_categories:
  - typescript
difficulty: intermediate
last_updated: '2025-02-09'
---

SvelteKit automatically makes files under `src/lib` available using the `$lib` import alias. You can change which directory this alias points to in your [config file](configuration#files).

```svelte
<!--- file: src/lib/Component.svelte --->
A reusable component
```

```svelte
<!--- file: src/routes/+page.svelte --->
<script>
    import Component from '$lib/Component.svelte';
</script>

<Component />
```
