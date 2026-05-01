---
title: CSS Logical Properties
---

# CSS Logical Properties

CSS originally used **physical** directions: `top`, `right`, `bottom`, `left`. That works fine in English, but breaks in right-to-left languages (Arabic, Hebrew) or vertical writing modes (Japanese, Mongolian).

**Logical properties** describe direction in terms of *flow* — `block` (the direction text lines stack) and `inline` (the direction characters run). Use them and your layouts adapt automatically.

---

## The Vocabulary

| Physical | Logical | Meaning |
|----------|---------|---------|
| `top` | `inset-block-start` | Start of the block axis |
| `bottom` | `inset-block-end` | End of the block axis |
| `left` | `inset-inline-start` | Start of the inline axis (start of a line) |
| `right` | `inset-inline-end` | End of the inline axis |
| `width` | `inline-size` | Size along the inline axis |
| `height` | `block-size` | Size along the block axis |
| `margin-top` | `margin-block-start` | |
| `margin-left` | `margin-inline-start` | |

In English (LTR, horizontal):
- **block axis** = vertical (top → bottom)
- **inline axis** = horizontal (left → right)

In Arabic/Hebrew (RTL, horizontal):
- inline-start is on the **right**, inline-end on the left.

In Japanese vertical writing:
- inline = top → bottom, block = right → left.

---

## The Core Properties

### Margin

```css
.card {
  margin-block-start: 1rem;
  margin-block-end:   1rem;
  margin-inline-start: 0;
  margin-inline-end:   auto;

  margin-block:  1rem;        /* shorthand for both block sides */
  margin-inline: 1rem;        /* shorthand for both inline sides */
}
```

`margin-inline: auto` is the modern replacement for `margin: 0 auto` (centering).

### Padding

```css
.card {
  padding-block:  1rem;
  padding-inline: 1.5rem;
}
```

A typical button:

```css
.btn {
  padding-block: 0.5rem;
  padding-inline: 1rem;
}
```

In RTL the button still has the same internal proportions — and you wrote it once.

### Border

```css
.input {
  border-block-end: 2px solid #ddd;        /* underline border */
  border-inline-start: 4px solid #4f46e5;  /* "side stripe" — flips in RTL */
}
```

### Position

```css
.tooltip {
  position: absolute;
  inset-block-start: 100%;       /* below */
  inset-inline-start: 0;         /* aligned to start */
}

/* Or all-in-one */
.overlay {
  position: absolute;
  inset: 0;                      /* equivalent to top:0; right:0; bottom:0; left:0 */
}
```

`inset` is the modern shorthand for the four directions.

### Size

```css
.card {
  inline-size: 100%;
  block-size: 200px;
  min-block-size: 100dvh;
}
```

In horizontal text, `inline-size` is `width` and `block-size` is `height`. Switch to vertical writing and they swap automatically.

---

## When Do You Notice the Difference?

```css
/* Physical — breaks in RTL */
.alert {
  border-left: 4px solid red;
  padding-left: 1rem;
}

/* Logical — works in LTR and RTL */
.alert {
  border-inline-start: 4px solid red;
  padding-inline-start: 1rem;
}
```

In an Arabic interface, the second version moves the stripe to the right edge automatically. The first stays on the wrong side.

---

## `text-align: start` and `end`

Same idea — symbolic instead of physical:

```css
.label { text-align: start; }   /* left in LTR, right in RTL */
.value { text-align: end; }
```

`text-align: left/right` are still valid, but `start/end` are usually what you want.

---

## Float and Clear

```css
img {
  float: inline-start;     /* "float left" in LTR, "right" in RTL */
}
.row { clear: inline-start; }
```

---

## Migration Strategy

You don't need to rewrite a codebase overnight. A few rules of thumb:

1. **Use logical properties for new code**, even if you don't ship RTL today. You're not adding effort, you're future-proofing.
2. Replace physical properties when you touch a file for unrelated work.
3. Don't mix in the same selector — pick one direction system per rule.

```css
/* Inconsistent */
.box {
  margin-left: 1rem;
  margin-block: 2rem;
}

/* Better */
.box {
  margin-inline-start: 1rem;
  margin-block: 2rem;
}
```

---

## Browser Support

Logical properties are supported in all modern browsers. The only caveat is some `-webkit-` mask-style edge cases — none of which affect everyday use.

---

## Up Next

Now a powerful tool for **organizing** large CSS codebases — `@layer`, the cascade layers feature.
