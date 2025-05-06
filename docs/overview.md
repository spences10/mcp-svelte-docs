# Svelte 5 Overview

## Introduction

Svelte 5 introduces a new reactivity model based on "runes" - special
symbols that influence how the Svelte compiler works. This represents
a significant evolution from Svelte 4's implicit reactivity model.

## Key Features

### Runes

Runes are special symbols that start with `$` and influence how the
Svelte compiler works:

- **$state** - For reactive state
- **$derived** - For computed values
- **$props** - For component props
- **$effect** - For side effects
- **$state.raw** - For non-deeply-reactive state
- **$derived.by** - For complex derivations
- **$bindable** - For two-way binding

### Snippets

Snippets replace slots from Svelte 4, providing a more flexible way to
compose components:

```svelte
{#snippet header()}
  <h1>My Title</h1>
{/snippet}

{@render header()}
```

### Event Handling

Svelte 5 uses standard HTML attributes for event handling:

```svelte
<button onclick={handleClick}>Click me</button>
```

### Component Events

Component events use callback props instead of event dispatching:

```svelte
<!-- Child -->
<button onclick={() => onMessage('Hello')}>Send</button>

<!-- Parent -->
<Child onMessage={(text) => console.log(text)} />
```

## Major Changes from Svelte 4

1. **Explicit Reactivity**: Reactivity is now explicit with runes,
   rather than implicit with the `let` keyword
2. **Runes Replace Special Syntax**: Runes replace special syntax like
   `$:` and `export let`
3. **Snippets Replace Slots**: The slot system has been replaced with
   snippets
4. **Standard Event Attributes**: Event directives (`on:click`) are
   replaced with standard HTML attributes (`onclick`)
5. **Callback Props**: Component events now use callback props instead
   of event dispatching

## Benefits

- **Consistency**: The same reactivity model works both inside and
  outside components
- **Explicitness**: Reactivity is now explicit, making code easier to
  understand
- **Performance**: The new system is more efficient, especially for
  large applications
- **TypeScript Integration**: Better TypeScript support with proper
  typing of reactive values
- **Portability**: Reactive code can be shared between components more
  easily
