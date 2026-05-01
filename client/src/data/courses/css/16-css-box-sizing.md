---
title: CSS Box Sizing
---

# CSS Box Sizing

The `box-sizing` property is **the single most important quality-of-life setting in CSS**. It changes how `width` and `height` are interpreted — and the modern default it enables is what almost every developer expects.

---

## The Two Values

```css
box-sizing: content-box;   /* the default — old behavior */
box-sizing: border-box;    /* the modern, sane behavior */
```

### `content-box` (default)

`width` sets the **content** width. Padding and border are **added** on top.

```css
.box {
  box-sizing: content-box;   /* default */
  width: 200px;
  padding: 20px;
  border: 5px solid;
  /* Rendered width: 250px */
}
```

### `border-box`

`width` sets the **rendered** width — content shrinks to make room for padding and border.

```css
.box {
  box-sizing: border-box;
  width: 200px;
  padding: 20px;
  border: 5px solid;
  /* Rendered width: exactly 200px */
}
```

---

## Why `border-box` Is Better

Think about percentage widths in a layout:

```css
.col {
  width: 50%;
  padding: 1rem;
  border: 1px solid;
}
```

- With `content-box`: each column is "50% **plus** 32px of padding **plus** 2px of border" → two columns no longer fit side by side.
- With `border-box`: each column is **exactly** 50%, padding included → two columns fit perfectly.

This single difference removes hours of layout math.

---

## Apply It Globally

The recommended pattern, taught by Paul Irish years ago and now standard:

```css
*,
*::before,
*::after {
  box-sizing: border-box;
}
```

This sets `border-box` on every element and pseudo-element. From that point on, `width` and `height` mean what you expect. **Put this at the top of every stylesheet you write.**

---

## A Slightly More Polite Pattern

If you're writing a component library and worry about clobbering host styles, use this inheritance-based version:

```css
html { box-sizing: border-box; }
*, *::before, *::after { box-sizing: inherit; }
```

A consumer can still flip `box-sizing: content-box` on `html` (or any subtree) and your components will follow.

---

## When `content-box` Is Useful

Almost never. The one case is when you're modeling a system that explicitly wants the old behavior — for example, an HTML email renderer, or replicating a legacy design.

---

## Verifying It Works

Open DevTools and look at the box-model diagram in the **Computed** tab. With `border-box` active and `width: 200px`, you should see exactly 200px in the outermost (border) rectangle.

---

## Common Footgun

A reset like this only fixes elements that exist in *your* stylesheet. Third-party CSS (a date picker, a charting library) might still use `content-box`. If you embed such code in a `border-box` world, its math may be slightly off — usually it'll show up as 1–2px off-by-one bugs. Rare, but worth knowing.

---

## Up Next

We've nailed down sizing. Time for one more spacing-related property — **outline** — and then we move into typography.
