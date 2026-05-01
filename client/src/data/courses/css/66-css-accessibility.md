---
title: CSS Accessibility
---

# CSS Accessibility

CSS is the **presentation layer**, but it has direct power over whether users can read, navigate, and interact with your site. A great-looking page that no one with low vision, motor differences, or a screen reader can use isn't great. This lesson covers the CSS-level accessibility wins — small changes, large impact.

---

## Color Contrast

The single most-skipped accessibility check. WCAG requires:

- **4.5:1** contrast ratio for normal text
- **3:1** for large text (18pt+ or 14pt+ bold)
- **3:1** for UI components (buttons, focus indicators)

Tools to check:

- Browser DevTools → Color Picker shows contrast inline.
- [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/).

> [!TIP]
> Light gray placeholders, gray-on-white text, low-contrast brand colors — these are the most common offenders. When in doubt, **darken**.

---

## Don't Remove Focus Outlines

```css
/* The bad pattern — accessibility-breaking */
*:focus { outline: none; }

/* Better — replace with something visible */
*:focus-visible {
  outline: 2px solid #4f46e5;
  outline-offset: 2px;
}
```

Use **`:focus-visible`** so the outline only shows for **keyboard** focus — not on every mouse click. Most users never see it; keyboard users always do.

---

## Skip-to-Content Link

A near-invisible link for keyboard users to jump past navigation:

```html
<a href="#main" class="skip-link">Skip to content</a>

<nav>...</nav>
<main id="main">...</main>
```

```css
.skip-link {
  position: absolute;
  inset-inline-start: 1rem;
  inset-block-start: -3rem;
  padding: 0.5rem 1rem;
  background: #4f46e5;
  color: white;
  border-radius: 4px;
  transition: top 0.2s;
}

.skip-link:focus {
  inset-block-start: 1rem;
}
```

A keyboard user tabs once, sees "Skip to content," presses Enter, and bypasses the navbar. Mouse users never notice.

---

## The `sr-only` Pattern

Hide content visually but keep it for screen readers:

```css
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}
```

```html
<button>
  <svg>...</svg>
  <span class="sr-only">Open menu</span>
</button>
```

A purely-icon button now has a label for screen readers.

> [!WARNING]
> Don't use `display: none` or `visibility: hidden` for screen-reader-only text — they hide the content from **all** users, including assistive tech.

---

## Respect `prefers-reduced-motion`

Some users get vertigo or nausea from animation. Disable transitions for them:

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

A few lines in your global CSS. Massive accessibility win.

---

## Respect `prefers-color-scheme` and `prefers-contrast`

```css
@media (prefers-color-scheme: dark) {
  :root { --bg: #0f172a; --text: #f3f4f6; }
}

@media (prefers-contrast: more) {
  :root { --text: #000; --link: #0000ff; }
  body  { font-weight: 500; }
}
```

You're not making *one* design — you're making a **system** that adapts to user needs.

---

## Touch Target Size

WCAG suggests **at least 44×44 CSS pixels** for touch targets:

```css
.button, a.icon-link {
  min-block-size: 44px;
  min-inline-size: 44px;
  padding: 0.5rem 0.75rem;
}
```

Tiny links and crowded button rows are a top accessibility complaint.

---

## Don't Hide Information in Color Alone

```css
/* Bad — color is the only signal */
.error { color: red; }

/* Better — color + icon + label */
.error::before {
  content: "⚠ ";
  font-weight: bold;
}
```

People with color blindness or low vision need **multiple cues** (color + icon + text + position).

---

## Maintain Logical Reading Order

CSS can move things visually with `order`, `flex-direction: row-reverse`, or `grid` placement — but the **DOM order** is what screen readers and keyboards follow.

> [!WARNING]
> Avoid using `order` (Flexbox) or `grid-row`/`grid-column` to **rearrange the meaning** of content. Visual order should match document order, or assistive-tech users will get lost.

---

## Sticky Headers and Scroll Anchoring

If you use a sticky header, anchor links may scroll **under** it:

```css
:target { scroll-margin-top: 5rem; }
html    { scroll-padding-top: 5rem; }
```

Anchors land below the header, not behind it.

---

## Forms

```css
input:user-invalid {
  border-color: #ef4444;
}

input:user-invalid + .error-message {
  display: block;
}

label {
  display: block;
  font-weight: 500;
  margin-bottom: 0.25rem;
}
```

- Labels above inputs (or beside, but always linked with `for`/`id`).
- Use `:user-invalid` not `:invalid` to avoid showing errors before the user has typed.

---

## Test With Your Keyboard

The fastest accessibility test: **press Tab through your page**.

- Can you reach every interactive thing?
- Is the focused element always visible?
- Does the order match the visual layout?
- Can you submit forms, open menus, close modals?

If any answer is "no," fix the CSS or the markup.

---

## Up Next

The final lesson — **best practices** for writing CSS that scales.
