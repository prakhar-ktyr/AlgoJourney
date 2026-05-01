---
title: CSS Animations
---

# CSS Animations

Where `transition` runs once on a state change, `@keyframes` animations run on demand — looping spinners, attention-grabbing pulses, multi-step entrance effects, even complex storytelling animations. All without a single line of JavaScript.

---

## `@keyframes` — Defining the Animation

A **keyframe rule** describes the timeline of an animation:

```css
@keyframes fadeIn {
  from { opacity: 0; }
  to   { opacity: 1; }
}
```

Or with percentages for finer control:

```css
@keyframes pulse {
  0%   { transform: scale(1);   }
  50%  { transform: scale(1.1); }
  100% { transform: scale(1);   }
}
```

`from` is shorthand for `0%`; `to` is `100%`.

---

## Applying the Animation

```css
.toast { animation: fadeIn 0.3s ease-out; }
```

The shorthand fields, in order:

```css
animation:
  <name>
  <duration>
  <timing-function>
  <delay>
  <iteration-count>
  <direction>
  <fill-mode>
  <play-state>;
```

Most of the time you'll only set the first three. Each can also be set as its own property:

```css
.toast {
  animation-name: fadeIn;
  animation-duration: 0.3s;
  animation-timing-function: ease-out;
  animation-delay: 0.1s;
  animation-iteration-count: infinite;
  animation-direction: alternate;
  animation-fill-mode: forwards;
  animation-play-state: paused;
}
```

---

## `iteration-count` and `direction`

```css
animation-iteration-count: 1;        /* default */
animation-iteration-count: infinite;
animation-iteration-count: 3.5;      /* fractional iterations work too */

animation-direction: normal;
animation-direction: reverse;
animation-direction: alternate;       /* forward, backward, forward... */
animation-direction: alternate-reverse;
```

A pulse breathes naturally with `alternate`:

```css
@keyframes pulse { from { opacity: 1; } to { opacity: 0.4; } }
.dot { animation: pulse 1s ease-in-out infinite alternate; }
```

---

## `fill-mode` — What Happens Before/After

By default, the element snaps back to its original style after the animation ends. Change that with `animation-fill-mode`:

```css
animation-fill-mode: none;       /* default */
animation-fill-mode: forwards;   /* keep the final keyframe state */
animation-fill-mode: backwards;  /* apply the first keyframe during delay */
animation-fill-mode: both;       /* both behaviors */
```

`forwards` is the most common — without it, your "fade in" element snaps back to invisible at the end.

---

## Running Multiple Animations

Comma-separate them:

```css
.fancy {
  animation:
    fadeIn  0.3s ease-out forwards,
    bounce  0.6s ease-out 0.3s 1 forwards;
}
```

Each runs on its own timeline.

---

## Pausing and Resuming

```css
.spinner { animation: spin 1s linear infinite; }
.spinner.paused { animation-play-state: paused; }
```

Useful for "pause on hover" carousels.

---

## Common Recipes

### Loading spinner

```css
@keyframes spin { to { transform: rotate(360deg); } }

.spinner {
  width: 24px;
  height: 24px;
  border: 3px solid #e5e7eb;
  border-top-color: #2563eb;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}
```

### Skeleton loading shimmer

```css
@keyframes shimmer {
  to { background-position: 200% 0; }
}

.skeleton {
  background: linear-gradient(90deg, #e5e7eb 0%, #f3f4f6 50%, #e5e7eb 100%);
  background-size: 200% 100%;
  animation: shimmer 1.5s linear infinite;
}
```

### Bounce-in

```css
@keyframes bounceIn {
  0%   { transform: scale(0.3); opacity: 0; }
  50%  { transform: scale(1.05); }
  70%  { transform: scale(0.95); }
  100% { transform: scale(1);    opacity: 1; }
}

.modal { animation: bounceIn 0.4s cubic-bezier(0.4, 0, 0.2, 1); }
```

### Typewriter

```css
@keyframes type {
  from { width: 0; }
  to   { width: 12ch; }
}
@keyframes blink {
  50% { border-right-color: transparent; }
}

.typewriter {
  display: inline-block;
  overflow: hidden;
  white-space: nowrap;
  width: 12ch;
  border-right: 2px solid;
  animation: type 2s steps(12) 1, blink 0.7s step-end infinite;
}
```

### Attention pulse on a notification badge

```css
@keyframes pulse-ring {
  to { transform: scale(2); opacity: 0; }
}

.badge {
  position: relative;
  border-radius: 50%;
  background: #ef4444;
}
.badge::after {
  content: "";
  position: absolute;
  inset: 0;
  border-radius: inherit;
  background: inherit;
  animation: pulse-ring 1.4s ease-out infinite;
}
```

---

## Performance — Same Rules

Animate `transform` and `opacity` for buttery smooth 60fps. Avoid animating `width`, `height`, `top`, `left`. Same as transitions.

---

## Respect Motion Preferences

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

A small cost to write, a huge accessibility win.

---

## Up Next

We've animated. Time to **build components** — starting with the underrated humble **tooltip**.
