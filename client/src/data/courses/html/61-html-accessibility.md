---
title: HTML Accessibility
---

# HTML Accessibility

Web accessibility (a11y) means designing websites that **everyone can use**, including people with visual, auditory, motor, or cognitive disabilities.

---

## Why Accessibility Matters

- **1 billion+ people** worldwide live with some form of disability
- It's required by law in many countries (ADA, WCAG, EU directives)
- Accessible sites are better for **everyone** — including mobile users, older adults, and users with slow connections
- Good accessibility improves **SEO** — search engines reward well-structured, accessible content

---

## WCAG Guidelines

The **Web Content Accessibility Guidelines** (WCAG) are organized around four principles — **POUR**:

| Principle | Meaning |
|-----------|---------|
| **Perceivable** | Content can be perceived (seen, heard, or felt) |
| **Operable** | UI can be operated (keyboard, mouse, voice) |
| **Understandable** | Content and UI are understandable |
| **Robust** | Works with current and future technologies |

---

## Semantic HTML is the Foundation

Using the right HTML elements provides built-in accessibility:

```html
<!-- BAD: div soup — no accessibility -->
<div onclick="navigate()">Click to go home</div>

<!-- GOOD: proper elements — keyboard & screen reader accessible -->
<a href="/">Go Home</a>
```

```html
<!-- BAD -->
<div class="heading">Page Title</div>

<!-- GOOD -->
<h1>Page Title</h1>
```

---

## Key Accessibility Practices

### 1. Always Use `alt` Text on Images

```html
<!-- Informative image: describe the content -->
<img src="chart.png" alt="Bar chart showing 40% growth in Q4 2024">

<!-- Decorative image: empty alt -->
<img src="decorative-swirl.png" alt="">
```

### 2. Use Labels for Form Inputs

```html
<label for="email">Email Address:</label>
<input type="email" id="email" name="email" required>
```

### 3. Ensure Sufficient Color Contrast

Text must have a contrast ratio of at least **4.5:1** against its background (WCAG AA).

### 4. Don't Rely on Color Alone

```html
<!-- BAD: only color indicates error -->
<input style="border-color: red;">

<!-- GOOD: color + icon + text -->
<input style="border-color: red;" aria-invalid="true">
<span style="color: red;">⚠ Please enter a valid email</span>
```

### 5. Make Content Keyboard Accessible

All interactive elements should be focusable and operable via keyboard (Tab, Enter, Space, Escape).

---

## Screen Reader Best Practices

- Use **heading hierarchy** (`h1`→`h6`) for navigation
- Use **semantic elements** (`<nav>`, `<main>`, `<article>`)
- Add **`alt` text** to all informative images
- Use **`<label>`** for all form inputs
- Provide **skip links** for keyboard users

```html
<a href="#main-content" class="skip-link">Skip to main content</a>
<!-- ... navigation ... -->
<main id="main-content">
    <!-- Page content -->
</main>
```

---

## Testing Accessibility

1. **Keyboard test** — navigate your site using only Tab, Enter, and Escape
2. **Screen reader** — test with VoiceOver (Mac), NVDA (Windows), or TalkBack (Android)
3. **Browser tools** — Chrome DevTools → Lighthouse → Accessibility audit
4. **Online tools** — WAVE, axe, or Pa11y

---

## Summary

- Accessibility means making the web usable by **everyone**
- Use **semantic HTML** as the foundation
- Always include **`alt` text**, **labels**, and sufficient **contrast**
- Test with **keyboard**, **screen readers**, and **automated tools**
- Follow **WCAG** guidelines (Perceivable, Operable, Understandable, Robust)
