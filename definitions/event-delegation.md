# event-delegation Definition

Note: This page describes a common JavaScript pattern and is not an
official Svelte/SvelteKit API reference. For canonical event handling
docs see Svelte’s template syntax (e.g. `onclick`) and events
reference.

**Definition:** Advanced event handling patterns using event
delegation for performance and dynamic content  
**Syntax:** Single parent event listener (e.g., `onclick`) handling
events from multiple child elements  
**Benefits:**

- Better performance for many similar elements
- Automatic handling of dynamically added elements
- Reduced memory usage from fewer event listeners  
  **Techniques:** `event.target`, `event.currentTarget`, element
  matching, event bubbling  
  **Use Cases:** Tables, lists, dynamic content, performance
  optimization

## Examples

```svelte
<script lang="ts">
  let items = $state([
    { id: 1, name: 'Item 1', type: 'button' },
    { id: 2, name: 'Item 2', type: 'link' },
    { id: 3, name: 'Item 3', type: 'button' }
  ]);

  // Single delegated event handler
  function handleListClick(event: MouseEvent) {
    // Find the clicked item element
    const target = event.target as HTMLElement | null;
    const itemElement = target?.closest('[data-item-id]') as HTMLElement | null;
    if (!itemElement) return;

    const itemId = itemElement.dataset.itemId;
    const itemType = itemElement.dataset.itemType;
    const item = items.find(i => i.id === parseInt(itemId));

    console.log('Item clicked:', item);

    // Handle different item types
    if (itemType === 'button') {
      handleButtonClick(item);
    } else if (itemType === 'link') {
      handleLinkClick(item);
    }
  }

  function handleButtonClick(item: { id: number; name: string; type: string }) {
    console.log('Button clicked:', item.name);
  }

  function handleLinkClick(item: { id: number; name: string; type: string }) {
    console.log('Link clicked:', item.name);
  }

  // Add new item dynamically (automatically handled)
  function addItem() {
    const newId = Math.max(...items.map(i => i.id)) + 1;
    items.push({
      id: newId,
      name: `Item ${newId}`,
      type: 'button'
    });
  }
  let tableData: { id: number; name: string }[] = $state([]);
</script>

<!-- Single event listener on parent -->
<div onclick={handleListClick} class="item-list">
  {#each items as item (item.id)}
    <div
      class="item"
      data-item-id={item.id}
      data-item-type={item.type}
    >
      {#if item.type === 'button'}
        <button>
          {item.name}
        </button>
      {:else}
        <a href="#" role="button">
          {item.name}
        </a>
      {/if}
    </div>
  {/each}
</div>

<button onclick={addItem}>Add Item</button>

<!-- Table delegation example -->
<script lang="ts">
  function handleTableClick(event: MouseEvent) {
    const target = event.target as HTMLElement | null;
    const row = target?.closest('tr[data-row-id]') as HTMLElement | null;
    const cell = target?.closest('td[data-action]') as HTMLElement | null;

    if (row && cell) {
      const rowId = row.dataset.rowId;
      const action = cell.dataset.action;

      console.log(`${action} clicked for row ${rowId}`);

      // handle accordingly
    }
  }
</script>

<table onclick={handleTableClick}>
  <tbody>
    {#each tableData as row (row.id)}
      <tr data-row-id={row.id}>
        <td>{row.name}</td>
        <td data-action="edit">Edit</td>
        <td data-action="delete">Delete</td>
      </tr>
    {/each}
  </tbody>
</table>
```

## Related

- `event-modifiers` - Controlling event behavior
- `custom-events` - Creating custom event patterns
- `onclick` - Basic event handling
- `$state` - Managing dynamic content state
