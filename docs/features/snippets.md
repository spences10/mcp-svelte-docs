# Snippets

## Description

Snippets are a new feature in Svelte 5 that replace slots from
Svelte 4. They allow you to define reusable chunks of markup that can
be passed to components.

## Basic Syntax

```js
// Child component
let { header, default: children, item } = $props();

{@render header?.()}
{@render children?.()}
{#each items as item}
  {@render item?.(item)}
{/each}

// Parent component
<Child>
  {#snippet header()}
    <h1>Title</h1>
  {/snippet}
  <p>Default content</p>
  {#snippet item(data)}
    <div>{data.name}</div>
  {/snippet}
</Child>
```

## Examples

### Basic Snippet

```svelte
{#snippet figure(image)}
<figure>
  <img
    src={image.src}
    alt={image.caption}
    width={image.width}
    height={image.height}
  />
  <figcaption>{image.caption}</figcaption>
</figure>
{/snippet}

{@render figure(headerImage)}
{@render figure(footerImage)}
```

### Passing Snippets to Components

```svelte
<!-- Table.svelte -->
<script>
  let { data, header, row } = $props();
</script>

<table>
  <thead>
    <tr>{@render header?.()}</tr>
  </thead>
  <tbody>
    {#each data as item}
      <tr>{@render row?.(item)}</tr>
    {/each}
  </tbody>
</table>

<!-- App.svelte -->
<script>
  import Table from './Table.svelte';
  const fruits = [
    { name: 'apples', qty: 5, price: 2 },
    { name: 'bananas', qty: 10, price: 1 },
    { name: 'cherries', qty: 20, price: 0.5 }
  ];
</script>

{#snippet header()}
<th>fruit</th>
<th>qty</th>
<th>price</th>
<th>total</th>
{/snippet}

{#snippet row(fruit)}
<td>{fruit.name}</td>
<td>{fruit.qty}</td>
<td>{fruit.price}</td>
<td>{fruit.qty * fruit.price}</td>
{/snippet}

<Table data={fruits} {header} {row} />
```

### Recursive Snippets

```svelte
<script>
  let items = $state([
    { name: 'Fruits', children: [
      { name: 'Apple' },
      { name: 'Banana' },
      { name: 'Orange', children: [
        { name: 'Blood Orange' },
        { name: 'Navel Orange' }
      ]}
    ]},
    { name: 'Vegetables', children: [
      { name: 'Carrot' },
      { name: 'Potato' }
    ]}
  ]);
</script>

{#snippet tree(items)}
  <ul>
    {#each items as item}
      <li>
        {item.name}
        {#if item.children}
          {@render tree(item.children)}
        {/if}
      </li>
    {/each}
  </ul>
{/snippet}

{@render tree(items)}
```

## Best Practices

- Use snippets to reduce duplication in your templates
- Snippets can be passed as props to components
- Snippets have lexical scoping rules - they are only visible in the
  same scope they are defined in
- Use parameters to make snippets more flexible
- Snippets can reference other snippets and even themselves (for
  recursion)
