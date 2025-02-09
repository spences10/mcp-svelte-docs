---
title: '"<svelte:options>"'
description: >-
  The <svelte:options> element provides a place to specify per-component
  compiler options, which are detailed in the [compiler
  section](svelte-compilercompile). The possible options are:
category: 05-special-elements
tags:
  - svelte
  - 05-special-elements
  - options
related:
  - index.md
  - 99-legacy/index.md
  - 99-legacy/40-legacy-component-api.md
code_categories:
  - typescript
  - server
  - client
difficulty: intermediate
last_updated: '2025-02-09'
---

```svelte
<svelte:options option={value} />
```

The `<svelte:options>` element provides a place to specify per-component compiler options, which are detailed in the [compiler section](svelte-compiler#compile). The possible options are:

- `runes={true}` — forces a component into _runes mode_ (see the [Legacy APIs](legacy-overview) section)
- `runes={false}` — forces a component into _legacy mode_
- `namespace="..."` — the namespace where this component will be used, can be "html" (the default), "svg" or "mathml"
- `customElement={...}` — the [options](custom-elements#Component-options) to use when compiling this component as a custom element. If a string is passed, it is used as the `tag` option
- `css="injected"` — the component will inject its styles inline: During server side rendering, it's injected as a `<style>` tag in the `head`, during client side rendering, it's loaded via JavaScript

> [!LEGACY] Deprecated options
> Svelte 4 also included the following options. They are deprecated in Svelte 5 and non-functional in runes mode.
>
> - `immutable={true}` — you never use mutable data, so the compiler can do simple referential equality checks to determine if values have changed
> - `immutable={false}` — the default. Svelte will be more conservative about whether or not mutable objects have changed
> - `accessors={true}` — adds getters and setters for the component's props
> - `accessors={false}` — the default

```svelte
<svelte:options customElement="my-custom-element" />
```
