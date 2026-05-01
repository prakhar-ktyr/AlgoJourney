---
title: CSS Tooltips
---

# CSS Tooltips

A tooltip is a small label that appears on hover or focus. With pseudo-elements and `data-` attributes, you can build accessible CSS-only tooltips in a dozen lines.

---

## The Basic Recipe

```html
<button class="tip" data-tip="Save your changes">💾 Save</button>
```

```css
.tip {
  position: relative;
}

.tip::after {
  content: attr(data-tip);
  position: absolute;
  bottom: calc(100% + 8px);
  left: 50%;
  transform: translateX(-50%);

  background: #1f2937;
  color: white;
  font-size: 0.75rem;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  white-space: nowrap;

  opacity: 0;
  pointer-events: none;
  transition: opacity 0.2s;
}

.tip:hover::after,
.tip:focus-visible::after {
  opacity: 1;
}
```

`attr(data-tip)` pulls the label from HTML — no duplication.

---

## Adding the Arrow

A tiny CSS triangle below the tooltip:

```css
.tip::before {
  content: "";
  position: absolute;
  bottom: 100%;
  left: 50%;
  transform: translateX(-50%);
  border: 5px solid transparent;
  border-top-color: #1f2937;

  opacity: 0;
  transition: opacity 0.2s;
}

.tip:hover::before,
.tip:focus-visible::before { opacity: 1; }
```

Triangles in CSS are made by giving an element zero width/height and only one solid border color — the others render as transparent triangles where they meet.

---

## Direction Variants

```css
.tip[data-position="bottom"]::after {
  bottom: auto;
  top: calc(100% + 8px);
}

.tip[data-position="right"]::after {
  bottom: auto;
  left: calc(100% + 8px);
  top: 50%;
  transform: translateY(-50%);
}
```

Toggle direction by setting `data-position="bottom"` on the button.

---

## A Cleaner API With Custom Properties

```css
.tip {
  --tip-bg: #1f2937;
  --tip-color: white;
}
.tip.alert { --tip-bg: #dc2626; }
```

Now any tooltip can be themed with one line.

---

## Accessibility Caveats

CSS-only tooltips have limits. They don't help screen reader users (whose AT can't see hover state). For truly accessible tooltips:

1. The element must have an accessible name (`aria-label`, `<button>` text, or `aria-describedby`).
2. Tooltips that contain critical information should use ARIA `role="tooltip"` driven by JavaScript.

For decorative or supplemental tips ("Click to copy"), CSS-only is fine. For required form help, use ARIA.

A pragmatic pattern:

```html
<button aria-label="Save changes" class="tip" data-tip="Save changes">💾</button>
```

`aria-label` is read by screen readers. The visual `data-tip` is for sighted hover users. Both groups served.

---

## Handling Long Labels

Drop `white-space: nowrap` and add a max-width:

```css
.tip[data-multiline]::after {
  white-space: normal;
  max-width: 200px;
  text-align: left;
}
```

---

## Edge Detection — A Limitation

Pure CSS tooltips can't reposition themselves to avoid the viewport edge. If your tooltip might appear near the screen edge, JavaScript libraries like **Floating UI** or **Popper** are the right tool.

---

## Up Next

We've made hovering elements talk to us. Now let's build the most clicked component on the web — **buttons**.
