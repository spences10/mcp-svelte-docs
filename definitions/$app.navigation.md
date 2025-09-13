# $app/navigation Definition

**Definition:** Client utilities for navigation and invalidation.

**Syntax:**
`import { goto, invalidate, invalidateAll, beforeNavigate, afterNavigate, onNavigate, preloadData, preloadCode, refreshAll, pushState, replaceState, disableScrollHandling } from '$app/navigation'`

**Functions:**

- `goto(href, opts?)` — programmatic navigation
- `invalidate(urlOrPredicate)` — re-run `load` for resources
- `invalidateAll()` — re-run all active `load` functions
- `beforeNavigate(cb)` / `afterNavigate(cb)` — navigation lifecycle
  (call during component init)
- `onNavigate(cb)` — pre-navigation hook (call during component init);
  can await before completing and return cleanup
- `preloadData(href)` — preload route code and run load
- `preloadCode(pathname)` — preload route modules only
- `refreshAll({ includeLoadFunctions? })` — refresh remote functions
  and optionally rerun load
- `pushState(url, state)` / `replaceState(url, state)` — shallow
  routing state
- `disableScrollHandling()` — disable router scroll handling for the
  update

## Example

```ts
import { goto, invalidate } from '$app/navigation';
await goto('/dashboard');
await invalidate((url) => url.pathname.startsWith('/api'));
```

## Related

- `$app/stores`, `$app/forms`
