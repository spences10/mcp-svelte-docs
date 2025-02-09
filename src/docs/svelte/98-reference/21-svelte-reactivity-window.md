---
title: '"svelte/reactivity/window"'
description: "|-\n  |-\n    svelte\n    <script>\n    \timport { innerWidth, innerHeight } from 'svelte/reactivity/window';\n    </script>"
category: 98-reference
tags:
  - svelte
  - 98-reference
  - reactivity
  - window
related:
  - index.md
  - 99-legacy/index.md
  - 99-legacy/40-legacy-component-api.md
code_categories:
  - typescript
difficulty: intermediate
last_updated: '2025-02-09'
---

This module exports reactive versions of various `window` values, each of which has a reactive `current` property that you can reference in reactive contexts (templates, [deriveds]($derived) and [effects]($effect)) without using [`<svelte:window>`](svelte-window) bindings or manually creating your own event listeners.

```svelte
<script>
	import { innerWidth, innerHeight } from 'svelte/reactivity/window';
</script>

<p>{innerWidth.current}x{innerHeight.current}</p>
```

> MODULE: svelte/reactivity/window
