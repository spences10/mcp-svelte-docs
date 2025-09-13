# $props Definition

**Definition:** Declares component props (replaces export let from Svelte 4)  
**Syntax:** `$props(): any`  
**Parameters:** None  
**Returns:** Object containing all component props  
**Variants:**
- `$props.id(): string` - Returns unique ID for the props object  

## Examples

```js
// Basic props destructuring
let { name, age = 25 } = $props();

// With TypeScript
interface Props {
  name: string;
  age?: number;
  onClick?: () => void;
}
let { name, age = 25, onClick } = $props<Props>();

// Rest props
let { name, ...rest } = $props();
```

## Related
- `$bindable` - For two-way binding props
- `$state` - For local component state
- `component-events` - For component communication patterns
