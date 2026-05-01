---
title: CSS Nesting
---

# CSS Nesting

Native CSS nesting lets you write child rules **inside** their parent — no preprocessor required. It's the feature most people first learned in Sass, now built into the language.

---

## The Basics

```css
.card {
  padding: 1rem;
  border-radius: 8px;

  & h2 {
    font-size: 1.25rem;
    color: #4f46e5;
  }

  & p {
    color: #4b5563;
  }
}
```

The `&` is the **parent reference** — it points to the outer selector. `& h2` means "an `h2` descendant of `.card`."

> [!NOTE]
> Modern browsers no longer require the `&` for descendant selectors — but writing it makes your intent clear and avoids edge cases. Always use it.

---

## Combining With `&`

You can chain `&` for state and modifier selectors:

```css
.button {
  background: #4f46e5;
  color: white;

  &:hover { background: #4338ca; }
  &:focus-visible { outline: 2px solid #4f46e5; }
  &:disabled { opacity: 0.5; }

  &.is-loading { cursor: wait; }
  &.is-large { padding: 1rem 1.5rem; }
}
```

Without nesting, each of those would be a separate top-level rule. With nesting, they live with the component they belong to.

---

## Media Queries Inside Selectors

A killer feature — keep responsive variants **next to the rule they modify**:

```css
.card {
  padding: 1rem;

  @media (min-width: 768px) {
    padding: 2rem;
    grid-template-columns: 1fr 2fr;
  }
}
```

No more scrolling to the bottom of a file to find the breakpoint overrides.

---

## Container Queries Inside Selectors

```css
.card {
  container-type: inline-size;

  & .body {
    display: grid;
    gap: 1rem;

    @container (min-width: 400px) {
      grid-template-columns: 1fr 2fr;
    }
  }
}
```

Components keep all their behavior in one place.

---

## `@scope` and Nesting

```css
@scope (.card) {
  & {
    padding: 1rem;
  }

  & h2 { font-size: 1.25rem; }
}
```

`@scope` adds boundaries — but plain nesting is enough for most use cases.

---

## Pitfalls

### Don't nest too deep

```css
/* Bad — fragile, hard to read */
.card {
  & .body {
    & .header {
      & .icon {
        & svg { ... }
      }
    }
  }
}
```

Three levels deep is usually plenty. If you need more, that's a hint your component should be split.

### Specificity doesn't go away

Nesting **adds** to your selector's specificity:

```css
.card {
  & .button { ... }    /* specificity = 0,2,0 */
}
```

Same as `.card .button` — you didn't make it cheaper, you just moved it. Watch for selectors that creep up in specificity as you nest.

### `&` at the start vs end

```css
.button {
  &:hover { ... }      /* &:hover  → .button:hover */
  &.disabled { ... }   /* &.disabled → .button.disabled */
}

/* Reversed — useful for parent selectors */
.dark-mode & {
  /* parent selector — matches .button when inside .dark-mode */
}
```

```css
.button {
  background: white;

  .dark-mode & {
    background: #1f2937;
  }
}
```

Reads as: "in dark mode, this button's background changes."

---

## A Component Written With Nesting

```css
.alert {
  display: flex;
  gap: 0.75rem;
  padding: 1rem 1.25rem;
  border-radius: 8px;
  border-inline-start: 4px solid currentColor;

  & .icon { flex: 0 0 24px; }
  & .body { flex: 1; }
  & .title { font-weight: 600; margin-block-end: 0.25rem; }

  &.is-info    { color: #1d4ed8; background: #eff6ff; }
  &.is-success { color: #166534; background: #f0fdf4; }
  &.is-warning { color: #92400e; background: #fffbeb; }
  &.is-error   { color: #991b1b; background: #fef2f2; }

  @media (max-width: 480px) {
    flex-direction: column;
    text-align: start;
  }
}
```

Everything for the alert lives in one block — easy to read, easy to refactor.

---

## Browser Support

Native CSS nesting is supported in all modern browsers (Chrome, Edge, Safari, Firefox). For older browser support, a Sass-like preprocessor or PostCSS plugin (`postcss-nesting`) compiles nested syntax to flat CSS.

---

## Up Next

We've built skills. Now let's apply them to the most important user concern — **accessibility**.
