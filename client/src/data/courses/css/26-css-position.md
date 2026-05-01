---
title: CSS Position
---

# CSS Position

The `position` property changes how an element is placed in the document — including whether it follows the normal flow or floats freely on top of other content.

---

## The Five Values

| Value | Meaning |
|-------|---------|
| `static` | Default. Normal document flow. |
| `relative` | In the flow, but offset by `top/right/bottom/left`. |
| `absolute` | Removed from flow. Positioned relative to the nearest **positioned** ancestor. |
| `fixed` | Removed from flow. Positioned relative to the **viewport**. |
| `sticky` | In flow until it hits a scroll threshold, then "sticks". |

The four offset properties — `top`, `right`, `bottom`, `left` — only do anything when `position` is **not** `static`.

---

## `position: static`

```css
.box { position: static; }
```

The default. Element flows normally. `top/left/etc.` are ignored. You almost never need to *set* this; it's the value you reset to.

---

## `position: relative`

The element stays in the flow (other elements still treat it as if it occupies its original space), but you can **nudge** it:

```css
.tooltip {
  position: relative;
  top: -4px;
  left: 8px;
}
```

`relative` has another superpower — **it becomes a positioning context** for absolute children. This is the most common reason to use it:

```css
.parent { position: relative; }
.parent .child { position: absolute; top: 0; right: 0; }   /* anchors to parent */
```

---

## `position: absolute`

The element is **removed from the document flow** and positioned relative to the nearest ancestor whose `position` is anything other than `static` (commonly `relative`). If no such ancestor exists, it positions to the `<html>` element.

```css
.dismiss {
  position: absolute;
  top: 8px;
  right: 8px;
}
```

A classic pattern — a close button anchored to the corner of a card:

```css
.card { position: relative; }
.card .close { position: absolute; top: 0; right: 0; }
```

---

## `position: fixed`

Like `absolute`, but anchored to the **viewport**. Always visible regardless of scrolling.

```css
.toolbar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 100;
  background: white;
  box-shadow: 0 1px 4px rgba(0,0,0,0.05);
}
```

Use cases: persistent headers, floating action buttons, scroll-to-top buttons.

---

## `position: sticky`

A hybrid: behaves like `relative` until the element scrolls past a threshold, then "sticks" like `fixed`:

```css
.section-header {
  position: sticky;
  top: 0;
  background: white;
}
```

Two requirements:
1. **The element needs a threshold** — `top`, `bottom`, `left`, or `right`.
2. **The scrolling ancestor must allow it.** Most failures come from a parent with `overflow: hidden`, `auto`, or `scroll` that's smaller than expected.

A killer use: sticky table headers.

```css
thead th { position: sticky; top: 0; background: white; z-index: 1; }
```

---

## Stacking and `z-index`

Positioned elements (any value other than `static`) participate in the **stacking context**. Use `z-index` to control which sits on top:

```css
.modal-backdrop { position: fixed; z-index: 50; }
.modal          { position: fixed; z-index: 60; }   /* on top of backdrop */
```

We have a dedicated lesson on `z-index` next.

---

## Centering an Absolutely-Positioned Element

The classic recipe:

```css
.centered {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}
```

Or the modern, cleaner form:

```css
.centered {
  position: absolute;
  inset: 0;            /* shorthand for top/right/bottom/left: 0 */
  margin: auto;
  width: max-content;
  height: max-content;
}
```

`inset` is the modern shorthand — much nicer than four properties.

---

## A Practical Example: Notification Badge

```html
<button class="bell">
  🔔
  <span class="count">3</span>
</button>
```

```css
.bell { position: relative; font-size: 1.5rem; }

.count {
  position: absolute;
  top: -4px;
  right: -8px;
  background: #ef4444;
  color: white;
  font-size: 0.65rem;
  font-weight: 700;
  border-radius: 999px;
  padding: 2px 6px;
}
```

`relative` on the parent + `absolute` on the badge = a notification dot pinned to the bell, no matter where the bell sits.

---

## Up Next

We talked about stacking. Time to actually understand it: **z-index** and stacking contexts.
