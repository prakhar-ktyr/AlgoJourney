---
title: CSS Overflow
---

# CSS Overflow

When content is bigger than its container, what should happen? `overflow` controls the answer — and it interacts with scrolling, clipping, and even sticky positioning.

---

## The Four Values

```css
overflow: visible;   /* default — content spills out */
overflow: hidden;    /* clipped, no scrollbar */
overflow: scroll;    /* always show scrollbars */
overflow: auto;      /* show scrollbars only if needed */
```

You can set each axis separately:

```css
overflow-x: auto;
overflow-y: hidden;
```

Or with the new shorthand:

```css
overflow: hidden auto;   /* x-axis | y-axis */
```

---

## When To Use Which

| Value | Use |
|-------|-----|
| `visible` | Default. Trust the layout. |
| `hidden` | Cropping decorative overflow (badges that bleed off cards), preventing scroll on body |
| `scroll` | Force a scrollbar (rare — usually for predictable layout space) |
| `auto` | The right answer for any scrollable region (sidebars, tables, code blocks) |

---

## A Subtle Gotcha — `overflow: hidden` Creates a New Block Formatting Context

This has side effects:

- Floats inside the element are contained.
- Margins from children no longer collapse outside the element.
- The element won't sit beside floats — it'll wrap below them.

This was actually a useful trick before Flexbox to clear floats. Today, prefer `display: flow-root` for that purpose:

```css
.clearfix { display: flow-root; }
```

---

## Sticky Positioning and `overflow`

If `position: sticky` isn't working, **check every ancestor for `overflow` other than `visible`**. Each scrolling container is a separate stickiness context — and if one is too small, the sticky element will appear stuck (forever) at the top of that small scroller, then disappear.

Common offender:

```css
main { overflow-x: hidden; }   /* breaks sticky inside */
```

If you really need to clip horizontal overflow, prefer `overflow: clip`:

```css
main { overflow-x: clip; }
```

`clip` is like `hidden` but **doesn't** create a scrolling context — sticky positioning continues to work.

---

## `text-overflow: ellipsis`

Truncate single-line text with a "...":

```css
.title {
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}
```

All three together — without them, `text-overflow` has nothing to do.

For multi-line ellipsis, use `-webkit-line-clamp`:

```css
.summary {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
```

---

## Scrollbar Styling

WebKit-based browsers and Firefox have **different** APIs for scrollbar styling. Cross-browser:

```css
.scroll-area {
  scrollbar-width: thin;                  /* Firefox */
  scrollbar-color: #cbd5e1 transparent;   /* Firefox: thumb track */
}

.scroll-area::-webkit-scrollbar { width: 6px; }
.scroll-area::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 999px;
}
```

Don't go too thin — users with motor disabilities may struggle to grab a 4px scrollbar.

---

## `overscroll-behavior`

Stop a scroll inside a child from "leaking" into the parent (or the page):

```css
.modal-body { overscroll-behavior: contain; }
```

Without this, scrolling to the bottom of a modal body keeps scrolling the page underneath. Almost always a good thing for modals and chat panels.

---

## Common Patterns

### Scrollable container with rounded corners

Without `overflow: hidden`, content corners would poke out of the rounded box:

```css
.card {
  border-radius: 8px;
  overflow: hidden;
}
.card > img { width: 100%; display: block; }
```

### Make tables horizontally scrollable on mobile

```html
<div class="table-wrap">
  <table>...</table>
</div>
```

```css
.table-wrap {
  overflow-x: auto;
}
```

### Locking body scroll for modals

```css
body.no-scroll { overflow: hidden; }
```

Toggled with JavaScript when a modal opens.

---

## Up Next

The next two lessons (`float` and `inline-block`) cover **legacy layout** approaches. Even though Flexbox and Grid have replaced them for most jobs, they're still in every codebase — and `float` has a perfect modern use case for text wrapping.
