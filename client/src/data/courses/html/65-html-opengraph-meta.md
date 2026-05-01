---
title: HTML Open Graph & Meta Tags
---

# HTML Open Graph & Meta Tags

Open Graph (OG) and Twitter Card meta tags control how your pages appear when **shared on social media**.

---

## Open Graph Tags

Developed by Facebook, used by most social platforms:

```html
<head>
    <meta property="og:title" content="HTML Tutorial — Learn HTML from Scratch">
    <meta property="og:description" content="A comprehensive, free HTML tutorial covering beginner to advanced topics.">
    <meta property="og:image" content="https://example.com/images/html-tutorial-og.jpg">
    <meta property="og:url" content="https://example.com/tutorials/html">
    <meta property="og:type" content="article">
    <meta property="og:site_name" content="AlgoJourney">
</head>
```

### Required OG Tags

| Tag | Description |
|-----|-------------|
| `og:title` | Title as displayed in the card |
| `og:description` | Short description (2-4 sentences) |
| `og:image` | Preview image URL (absolute) |
| `og:url` | Canonical URL of the page |

### Optional OG Tags

| Tag | Description |
|-----|-------------|
| `og:type` | Content type (`website`, `article`, `video`) |
| `og:site_name` | Name of the website |
| `og:locale` | Language (`en_US`, `fr_FR`) |

---

## OG Image Best Practices

- Size: **1200 × 630 pixels** (ideal for most platforms)
- Format: JPG or PNG
- File size: under 5 MB
- Include **text overlay** with the page title for maximum impact
- Always use **absolute URLs**

---

## Twitter Card Tags

Twitter uses its own meta tags (falls back to OG if not present):

```html
<head>
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="HTML Tutorial — Learn HTML from Scratch">
    <meta name="twitter:description" content="A comprehensive HTML tutorial.">
    <meta name="twitter:image" content="https://example.com/images/html-tutorial-twitter.jpg">
    <meta name="twitter:site" content="@algojourney">
</head>
```

### Card Types

| Type | Description |
|------|-------------|
| `summary` | Small square image + title + description |
| `summary_large_image` | Large banner image + title + description |
| `player` | Video/audio player |
| `app` | Mobile app download |

---

## Complete Social Meta Tags Setup

```html
<head>
    <!-- Primary Meta Tags -->
    <title>HTML Tutorial — AlgoJourney</title>
    <meta name="description" content="Learn HTML from beginner to advanced.">

    <!-- Open Graph / Facebook -->
    <meta property="og:type" content="website">
    <meta property="og:url" content="https://algojourney.com/tutorials/html">
    <meta property="og:title" content="HTML Tutorial — Learn HTML from Scratch">
    <meta property="og:description" content="A comprehensive, free HTML tutorial.">
    <meta property="og:image" content="https://algojourney.com/images/og-html.jpg">

    <!-- Twitter -->
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:url" content="https://algojourney.com/tutorials/html">
    <meta name="twitter:title" content="HTML Tutorial — Learn HTML from Scratch">
    <meta name="twitter:description" content="A comprehensive, free HTML tutorial.">
    <meta name="twitter:image" content="https://algojourney.com/images/og-html.jpg">
</head>
```

---

## Testing Your Tags

- **Facebook**: [Sharing Debugger](https://developers.facebook.com/tools/debug/)
- **Twitter**: [Card Validator](https://cards-dev.twitter.com/validator)
- **LinkedIn**: [Post Inspector](https://www.linkedin.com/post-inspector/)
- **General**: [opengraph.xyz](https://opengraph.xyz)

---

## Summary

- **Open Graph** tags control social media previews (Facebook, LinkedIn, WhatsApp, etc.)
- **Twitter Cards** provide Twitter-specific previews
- Must-have tags: `og:title`, `og:description`, `og:image`, `og:url`
- Use **1200 × 630px** images for best results
- Always use **absolute URLs** for images
- **Test** your tags with platform-specific debugger tools
