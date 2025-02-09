---
title: '"Command Line Interface"'
description: |-
  |-
    |-
      - vite dev — start a development server
      - vite build — build a production version of your app
      - vite preview — run the production version locally
category: 98-reference
tags:
  - kit
  - 98-reference
  - cli
related:
  - index.md
  - 98-reference/index.md
  - 98-reference/54-types.md
code_categories:
  - typescript
  - server
difficulty: intermediate
last_updated: '2025-02-09'
---

SvelteKit projects use [Vite](https://vitejs.dev), meaning you'll mostly use its CLI (albeit via `npm run dev/build/preview` scripts):

- `vite dev` — start a development server
- `vite build` — build a production version of your app
- `vite preview` — run the production version locally

However SvelteKit includes its own CLI for initialising your project:

## svelte-kit sync

`svelte-kit sync` creates the `tsconfig.json` and all generated types (which you can import as `./$types` inside routing files) for your project. When you create a new project, it is listed as the `prepare` script and will be run automatically as part of the npm lifecycle, so you should not ordinarily have to run this command.
