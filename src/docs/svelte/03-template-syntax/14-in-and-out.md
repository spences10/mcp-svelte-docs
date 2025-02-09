---
title: '"in: and out:"'
description: |-
  |-
    |-
      svelte
      <script>
        import { fade, fly } from 'svelte/transition';
        
        let visible = $state(false);
      </script>
category: 03-template-syntax
tags:
  - svelte
  - 03-template-syntax
  - in
  - and
  - out
related:
  - index.md
  - 99-legacy/index.md
  - 99-legacy/40-legacy-component-api.md
code_categories:
  - typescript
difficulty: intermediate
last_updated: '2025-02-09'
---

The `in:` and `out:` directives are identical to [`transition:`](transition), except that the resulting transitions are not bidirectional — an `in` transition will continue to 'play' alongside the `out` transition, rather than reversing, if the block is outroed while the transition is in progress. If an out transition is aborted, transitions will restart from scratch.

```svelte
<script>
  import { fade, fly } from 'svelte/transition';
  
  let visible = $state(false);
</script>

<label>
  <input type="checkbox" bind:checked={visible}>
  visible
</label>

{#if visible}
	<div in:fly={{ y: 200 }} out:fade>flies in, fades out</div>
{/if}
```
