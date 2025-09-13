# $host Definition

**Definition:** Returns reference to the host element in custom
elements  
**Syntax:** `$host<El extends HTMLElement = HTMLElement>(): El`  
**Parameters:** None  
**Returns:** Host element reference  
**Variants:**

- Used specifically in custom elements/web components

## Examples

```js
<!-- CustomElement.svelte -->
<svelte:options customElement="my-element" />

<script>
  import { $host } from 'svelte';

  // Get reference to the host element
  const host = $host();

  // Access host element properties
  $effect(() => {
    console.log('Host element:', host);
    console.log('Host tagName:', host.tagName); // 'MY-ELEMENT'
  });

  // Modify host element
  function updateHost() {
    host.style.backgroundColor = 'lightblue';
    host.setAttribute('data-updated', 'true');
  }

  // Listen to host events
  $effect(() => {
    const handleHostClick = (event) => {
      console.log('Host clicked:', event);
    };

    host.addEventListener('click', handleHostClick);

    return () => {
      host.removeEventListener('click', handleHostClick);
    };
  });
</script>

<button onclick={updateHost}>Update Host</button>

<!-- TypeScript example -->
<script lang="ts">
  // Type the host element
  const host = $host<HTMLDivElement>();

  $effect(() => {
    // TypeScript knows this is an HTMLDivElement
    host.style.display = 'block';
  });
</script>

<!-- Usage in HTML -->
<my-element></my-element>
```

## Related

- `svelte:options` - For configuring custom elements
- `$effect` - Often used with $host for host element manipulation
- Custom Elements - Web standard that $host is designed for
