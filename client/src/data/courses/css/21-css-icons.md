---
title: CSS Icons
---

# CSS Icons

The web has many ways to add an icon to a page. CSS plays a starring role: even when icons come from a library, you'll style them with CSS.

---

## The Three Modern Approaches

| Approach | Pros | Cons |
|----------|------|------|
| **SVG** (inline or `<img>`) | Sharp at any size, stylable with CSS | A bit more markup |
| **Icon font** (Font Awesome, Material Icons) | One file, easy use | Loads even unused glyphs, FOIT risk |
| **Unicode/emoji** | Zero requests | Rendering varies by OS |

For new projects, **SVG is the recommendation** — better accessibility, smaller payload, full CSS control.

---

## Using an Icon Font

Most icon fonts give you a class:

```html
<i class="fa fa-home"></i>
<span class="material-icons">favorite</span>
```

Style them like any other text:

```css
.fa { font-size: 1.25rem; color: #2563eb; }
```

Pros: trivial to use. Cons: every icon class loads the entire font, even if you only use three icons.

---

## Inline SVG

Drop the SVG markup directly into your HTML:

```html
<button class="icon-btn">
  <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14l-5-4.87 6.91-1.01L12 2z"/>
  </svg>
  Star
</button>
```

Style with CSS using `fill` and `stroke`:

```css
.icon-btn svg {
  fill: currentColor;        /* match the button's text color */
  vertical-align: middle;
  margin-right: 0.5rem;
}
```

`currentColor` is the magic ingredient — the icon automatically matches the surrounding text color, including on `:hover` and dark mode.

---

## SVG via `<img>`

Quickest for static, monochrome doesn't matter:

```html
<img src="/icons/search.svg" alt="" width="20" height="20">
```

Trade-off: you can't recolor it with CSS (browsers don't apply `fill` to images).

A workaround is the **CSS mask** trick:

```css
.icon-search {
  width: 20px;
  height: 20px;
  background-color: currentColor;
  mask: url("/icons/search.svg") no-repeat center / contain;
}
```

The SVG defines the *shape*; CSS color paints it.

---

## CSS-Only Icons

For very simple shapes, you don't even need an asset:

```css
.checkmark {
  display: inline-block;
  width: 16px;
  height: 8px;
  border-left: 3px solid currentColor;
  border-bottom: 3px solid currentColor;
  transform: rotate(-45deg);
}

.close {
  position: relative;
  width: 14px;
  height: 14px;
}
.close::before,
.close::after {
  content: "";
  position: absolute;
  top: 50%; left: 0;
  width: 100%;
  height: 2px;
  background: currentColor;
}
.close::before { transform: rotate(45deg); }
.close::after  { transform: rotate(-45deg); }
```

Useful for one-off icons or to avoid an extra request.

---

## Sizing and Alignment

Icons usually need to align with text:

```css
.icon {
  width: 1em;          /* scales with the surrounding font size */
  height: 1em;
  vertical-align: -0.125em;   /* nudge to optical center */
}
```

`em` units make icons feel right at any text size — a 24px button gets a 24px icon, a 12px caption gets a 12px icon, no extra CSS.

---

## Accessibility

If an icon is **decorative** (sits next to a label), hide it from assistive tech:

```html
<button>
  <svg aria-hidden="true">...</svg>
  Save
</button>
```

If an icon is **the only label** (an icon-only button), give it a name:

```html
<button aria-label="Close">
  <svg aria-hidden="true">...</svg>
</button>
```

---

## Up Next

We've decorated buttons with icons. Now let's polish another core element — **links**.
