# event-delegation Definition

**Definition:** Advanced event handling patterns using event
delegation for performance and dynamic content  
**Syntax:** Single parent event listener handling events from multiple
child elements  
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
<script>
  let items = $state([
    { id: 1, name: 'Item 1', type: 'button' },
    { id: 2, name: 'Item 2', type: 'link' },
    { id: 3, name: 'Item 3', type: 'button' }
  ]);

  // Single delegated event handler
  function handleListClick(event) {
    // Find the clicked item element
    const itemElement = event.target.closest('[data-item-id]');
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

  function handleButtonClick(item) {
    console.log('Button clicked:', item.name);
  }

  function handleLinkClick(item) {
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
</script>

<!-- Single event listener on parent -->
<div on:click={handleListClick} class="item-list">
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

<button on:click={addItem}>Add Item</button>

<!-- Table delegation example -->
<script>
  function handleTableClick(event) {
    const row = event.target.closest('tr[data-row-id]');
    const cell = event.target.closest('td[data-action]');

    if (row && cell) {
      const rowId = row.dataset.rowId;
      const action = cell.dataset.action;

      console.log(`${action} clicked for row ${rowId}`);

      if (action === 'edit') {
        editRow(rowId);
      } else if (action === 'delete') {
        deleteRow(rowId);
      }
    }
  }
</script>

<table on:click={handleTableClick}>
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
