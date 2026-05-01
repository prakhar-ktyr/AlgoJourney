---
title: CSS Buttons
---

# CSS Buttons

Buttons are everywhere. A consistent, accessible, polished button is one of the highest-leverage things you'll style. This lesson is a complete recipe.

---

## A Solid Base

```css
.btn {
  /* Layout */
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;

  /* Sizing */
  padding: 0.5rem 1rem;
  min-height: 2.5rem;

  /* Typography */
  font: inherit;
  font-weight: 600;
  line-height: 1;

  /* Visuals */
  background: #2563eb;
  color: white;
  border: 1px solid transparent;
  border-radius: 6px;
  cursor: pointer;
  user-select: none;

  /* Motion */
  transition: background 0.15s, transform 0.05s;
}

.btn:hover  { background: #1d4ed8; }
.btn:active { transform: translateY(1px); }
.btn:focus-visible {
  outline: none;
  box-shadow: 0 0 0 3px rgb(37 99 235 / 0.4);
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
```

A real button. Accessible (focus ring), interactive (active press), polite (transition).

---

## Variants With Custom Properties

The cleanest way to handle button colors:

```css
.btn {
  --btn-bg: #2563eb;
  --btn-bg-hover: #1d4ed8;
  --btn-color: white;

  background: var(--btn-bg);
  color: var(--btn-color);
}
.btn:hover { background: var(--btn-bg-hover); }

.btn.secondary {
  --btn-bg: #6b7280;
  --btn-bg-hover: #4b5563;
}
.btn.danger {
  --btn-bg: #dc2626;
  --btn-bg-hover: #b91c1c;
}
.btn.success {
  --btn-bg: #16a34a;
  --btn-bg-hover: #15803d;
}
```

Each variant is a one-line override. Add a new color in seconds.

---

## Outline Variant

```css
.btn.outline {
  --btn-bg: transparent;
  --btn-bg-hover: #f3f4f6;
  --btn-color: #2563eb;
  border-color: currentColor;
}
```

`currentColor` makes the border match the text color automatically.

---

## Ghost Variant

```css
.btn.ghost {
  --btn-bg: transparent;
  --btn-bg-hover: #f3f4f6;
  --btn-color: #1f2937;
  border-color: transparent;
}
```

For low-emphasis actions.

---

## Sizes

```css
.btn.sm { padding: 0.25rem 0.625rem; min-height: 2rem; font-size: 0.875rem; }
.btn.lg { padding: 0.75rem 1.25rem;  min-height: 3rem;   font-size: 1rem; }
.btn.xl { padding: 1rem    1.75rem;  min-height: 3.5rem; font-size: 1.125rem; }
```

---

## Icon Buttons

```css
.btn-icon {
  display: inline-grid;
  place-items: center;
  width: 2.5rem;
  height: 2.5rem;
  padding: 0;
  border-radius: 6px;
}
```

Pair with `aria-label` for accessibility:

```html
<button class="btn btn-icon" aria-label="Delete">
  <svg>...</svg>
</button>
```

---

## Loading State

A simple spinner alongside the label:

```css
.btn.loading {
  pointer-events: none;
  position: relative;
  color: transparent;     /* hide the label visually but keep its width */
}
.btn.loading::after {
  content: "";
  position: absolute;
  width: 1em;
  height: 1em;
  border: 2px solid currentColor;
  border-top-color: transparent;
  border-radius: 50%;
  color: white;
  animation: spin 0.8s linear infinite;
}

@keyframes spin { to { transform: rotate(360deg); } }
```

The button stays the same width — no jiggling layout when state changes.

---

## Buttons in a Row

Use Flexbox `gap`:

```css
.btn-row {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}
```

For "joined" button groups:

```css
.btn-group .btn {
  border-radius: 0;
  border-right-width: 0;
}
.btn-group .btn:first-child { border-top-left-radius: 6px; border-bottom-left-radius: 6px; }
.btn-group .btn:last-child  { border-top-right-radius: 6px; border-bottom-right-radius: 6px; border-right-width: 1px; }
```

---

## Reset the Browser Defaults First

`<button>` ships with system styles. Always reset them when starting fresh:

```css
button {
  background: none;
  border: 0;
  padding: 0;
  font: inherit;
  cursor: pointer;
  color: inherit;
}
```

Then layer your design on top.

---

## Accessibility Checklist

- ✅ Use `<button>` (not `<div>` or `<a>`) for actions.
- ✅ Visible focus ring (`:focus-visible`).
- ✅ Sufficient contrast (≥ 4.5:1 vs background).
- ✅ Touch target ≥ 44×44px (`min-height: 2.75rem` is safe).
- ✅ Icon-only buttons need `aria-label`.

---

## Up Next

Buttons in hand, let's tackle the trickiest UI element of all — **forms**.
