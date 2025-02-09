---
title: '"Configuration"'
description: "|-\n  |-\n    js\n    /// file: svelte.config.js\n    // @filename: ambient.d.ts\n    declare module '@sveltejs/adapter-auto' {\n    \tconst plugin: () => import('@sveltejs/kit').Adapter;\n    \texport default plugin;\n    }"
category: 98-reference
tags:
  - kit
  - 98-reference
  - configuration
related:
  - index.md
  - 98-reference/index.md
  - 98-reference/54-types.md
code_categories:
  - typescript
  - javascript
difficulty: intermediate
last_updated: '2025-02-09'
---

Your project's configuration lives in a `svelte.config.js` file at the root of your project. As well as SvelteKit, this config object is used by other tooling that integrates with Svelte such as editor extensions.

```js
/// file: svelte.config.js
// @filename: ambient.d.ts
declare module '@sveltejs/adapter-auto' {
	const plugin: () => import('@sveltejs/kit').Adapter;
	export default plugin;
}

// @filename: index.js
// ---cut---
import adapter from '@sveltejs/adapter-auto';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	kit: {
		adapter: adapter()
	}
};

export default config;
```

## Config

> TYPES: Configuration#Config

## KitConfig

The `kit` property configures SvelteKit, and can have the following properties:

> EXPANDED_TYPES: Configuration#KitConfig
