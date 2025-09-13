# rest-parameters Definition

**Definition:** Route segment syntax `[...name]` captures the
remainder of a path into `params.name`, possibly empty.

**Syntax:** `src/routes/a/[...rest]/z/+page.svelte` matches `/a/z`,
`/a/b/z`, `/a/b/c/z`, ...

**Returns:** `params.rest` with `/`-joined remainder.

## Example

```txt
/[org]/[repo]/tree/[branch]/[...file]
```

`/sveltejs/kit/tree/main/documentation/docs/file.md` →
`{ org, repo, branch, file: 'documentation/docs/file.md' }`

## Related

- `optional-parameters`, `param-matchers`, `advanced-routing`
