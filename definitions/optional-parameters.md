# optional-parameters Definition

**Definition:** Wrap a dynamic segment in double brackets `[[param]]`
to make it optional.

**Syntax:** `src/routes/[[lang]]/home/+page.svelte` matches `/home`
and `/en/home`.

Notes:

- An optional parameter cannot follow a rest parameter (e.g.,
  `[...rest]/[[opt]]`).

## Related

- `rest-parameters`, `param-matchers`
