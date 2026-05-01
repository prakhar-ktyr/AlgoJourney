---
title: CSS Gradients
---

# CSS Gradients

A gradient is a smooth blend between two or more colors. CSS gradients aren't images — they're generated on the fly by the browser, so they're crisp at any size and weigh nothing.

There are three kinds: **linear**, **radial**, and **conic**, each with a "repeating" variant.

---

## Linear Gradients

A blend along a straight line.

```css
.box {
  background: linear-gradient(to right, #2563eb, #7c3aed);
}
```

Direction can be a keyword (`to right`, `to bottom left`) or an angle (`90deg`, `135deg`):

```css
background: linear-gradient(135deg, red, yellow);
background: linear-gradient(to top, red, yellow);
```

| Direction | Equivalent angle |
|-----------|-----------------|
| `to top` | `0deg` |
| `to right` | `90deg` |
| `to bottom` | `180deg` |
| `to left` | `270deg` |

### Multi-stop

You can have many color stops:

```css
background: linear-gradient(to right, red, yellow, green, blue);
```

### Position color stops

```css
background: linear-gradient(to right,
  red       0%,
  yellow   50%,
  green   100%
);
```

### Hard color transitions

If two stops are at the same position, the transition is instant — perfect for stripe patterns:

```css
background: linear-gradient(90deg,
  red 0 33%,
  yellow 33% 66%,
  green 66% 100%
);
```

### Transparency

```css
background: linear-gradient(to bottom, rgba(0,0,0,0), rgba(0,0,0,0.7));
```

A common technique to darken the bottom of an image so white text is readable.

---

## Radial Gradients

A blend that radiates outward from a point.

```css
.box {
  background: radial-gradient(circle, yellow, red);
}
```

Customize shape, size, and position:

```css
background: radial-gradient(circle at top right, white, transparent 70%);
background: radial-gradient(ellipse 200px 100px at center, blue, transparent);
```

A spotlight effect:

```css
.spotlight {
  background: radial-gradient(circle at 30% 30%,
    rgba(255,255,255,0.4) 0%,
    rgba(255,255,255,0) 60%
  );
}
```

---

## Conic Gradients

Color sweeps **around** a center point — like a pie chart:

```css
.pie {
  background: conic-gradient(red 0% 25%, yellow 25% 50%, green 50% 75%, blue 75%);
  border-radius: 50%;
  width: 200px; height: 200px;
}
```

Used for pie charts, color wheels, loading rings, and angular geometric patterns.

---

## Repeating Gradients

Add `repeating-` to any of the above to tile the gradient:

```css
.stripes {
  background: repeating-linear-gradient(
    45deg,
    #f3f4f6 0 10px,
    #e5e7eb 10px 20px
  );
}
```

A diagonal-stripe pattern in five lines of CSS.

---

## Multiple Gradients (Layered)

Like background images, gradients can be layered:

```css
.hero {
  background:
    linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.5)),
    url("photo.jpg") center/cover;
}
```

The dark gradient sits **on top** of the photo to make text readable.

---

## Practical Recipes

### Subtle button gradient

```css
.button {
  background: linear-gradient(to bottom, #3b82f6, #2563eb);
}
.button:hover {
  background: linear-gradient(to bottom, #60a5fa, #3b82f6);
}
```

### Animated rainbow

```css
@property --hue { syntax: '<angle>'; initial-value: 0deg; inherits: false; }

.rainbow {
  background: linear-gradient(var(--hue), red, orange, yellow, green, blue, violet);
  animation: spin 5s linear infinite;
}

@keyframes spin { to { --hue: 360deg; } }
```

The `@property` declaration is the trick — without it, browsers can't animate gradient angles.

### Gradient text

```css
.gradient-text {
  background: linear-gradient(90deg, #f97316, #ec4899);
  background-clip: text;
  -webkit-background-clip: text;
  color: transparent;
}
```

---

## Performance

Gradients are **rendered**, not transferred. They cost zero bandwidth and scale infinitely. Use them freely instead of decorative images.

---

## Up Next

Color and depth so far — let's add **shadows** for that final layer of polish.
