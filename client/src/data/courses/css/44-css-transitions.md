---
title: CSS Transitions
---

# CSS Transitions

A **transition** smooths the change between two style states. Hover, focus, class toggle — instead of snapping, the element animates between the old and new value.

---

## Minimal Example

```css
.button {
  background: #2563eb;
  transition: background 0.2s;
}
.button:hover {
  background: #1d4ed8;
}
```

That's it. The browser figures out the in-between values and animates over 200ms.

---

## The Four Transition Properties

```css
transition-property:        background, color;
transition-duration:        0.3s, 0.5s;
transition-timing-function: ease, ease-in;
transition-delay:           0s, 0.1s;
```

Or in shorthand:

```css
transition: background 0.3s ease, color 0.5s ease-in 0.1s;
```

Order in the shorthand: `<property> <duration> <timing-function> <delay>`.

---

## Animatable Properties

Not every property can be transitioned — only ones with **interpolatable** values. The big ones:

| Animates well | Doesn't animate |
|---------------|-----------------|
| `opacity` | `display` (until `transition-behavior: allow-discrete`) |
| `transform` | `font-family` |
| `color`, `background-color`, `border-color` | `background-image` (between url types) |
| `width`, `height`, `padding`, `margin` | `visibility` (snaps) |
| `box-shadow`, `filter` | `position` |

For the **smoothest** results, transition only `transform` and `opacity`. They run on the GPU.

---

## Timing Functions (Easing)

The shape of the animation curve.

```css
transition-timing-function: linear;
transition-timing-function: ease;          /* default */
transition-timing-function: ease-in;
transition-timing-function: ease-out;
transition-timing-function: ease-in-out;
transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
transition-timing-function: steps(4, end);
```

Custom curves with [cubic-bezier.com](https://cubic-bezier.com) — useful for branded motion.

A great default for UI motion:

```css
:root { --ease-out: cubic-bezier(0.2, 0.8, 0.2, 1); }
```

It starts fast, settles softly — what users expect from a polished interface.

---

## Transition All — and Why You Shouldn't

```css
.box { transition: all 0.3s; }
```

Convenient, but:
- Transitions properties you didn't intend to (and may animate them poorly).
- Makes it harder to reason about performance.

Prefer **explicit** properties:

```css
.box { transition: transform 0.3s, opacity 0.3s; }
```

---

## Common Patterns

### Smooth color hover

```css
.link {
  color: #2563eb;
  transition: color 0.15s;
}
.link:hover { color: #1d4ed8; }
```

### Hover lift

```css
.card {
  transition: transform 0.2s, box-shadow 0.2s;
}
.card:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-lg);
}
```

### Fade in on class toggle

```css
.toast {
  opacity: 0;
  transform: translateY(8px);
  transition: opacity 0.2s, transform 0.2s;
}
.toast.is-visible {
  opacity: 1;
  transform: translateY(0);
}
```

### Animated underline

```css
.link {
  background-image: linear-gradient(currentColor, currentColor);
  background-size: 0% 1px;
  background-repeat: no-repeat;
  background-position: bottom left;
  transition: background-size 0.3s;
}
.link:hover { background-size: 100% 1px; }
```

---

## Respect `prefers-reduced-motion`

Some users have vestibular disorders. Honor their setting:

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    transition-duration: 0.01ms !important;
    animation-duration:  0.01ms !important;
    animation-iteration-count: 1 !important;
  }
}
```

This collapses durations to effectively zero — content still updates, motion doesn't.

---

## Transitions vs Animations

| Transitions | Animations (`@keyframes`) |
|-------------|----------------------------|
| Triggered by a state change | Run on demand |
| Two states (start → end) | Many keyframes |
| Simple, declarative | Powerful, scriptable |

For state changes (hover, focus, toggle), use transitions. For looping or multi-step motion, use animations — that's our next lesson.

---

## Up Next

**Animations** with `@keyframes` — repeatable, multi-step motion.
