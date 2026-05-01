---
title: HTML Section & Article
---

# HTML Section & Article

`<section>`, `<article>`, and `<aside>` help you organize content into meaningful groups.

---

## `<article>` — Self-Contained Content

An `<article>` is **independently distributable** content — it makes sense on its own:

```html
<article>
    <h2>Understanding CSS Grid</h2>
    <time datetime="2025-03-10">March 10, 2025</time>
    <p>CSS Grid is a powerful layout system...</p>
</article>
```

Examples of `<article>` content: blog posts, news articles, forum posts, product cards, comments, social media posts.

---

## `<section>` — Thematic Grouping

A `<section>` groups **related content** under a common theme, typically with a heading:

```html
<section>
    <h2>Features</h2>
    <p>Our product offers these amazing features...</p>
</section>

<section>
    <h2>Pricing</h2>
    <p>Choose the plan that works for you...</p>
</section>
```

---

## `<article>` vs `<section>`

| Feature | `<article>` | `<section>` |
|---------|------------|-----------|
| Standalone? | ✅ Yes — makes sense alone | ❌ No — part of a larger whole |
| Syndication | Can be shared/syndicated | Part of a page's structure |
| Examples | Blog post, comment, product card | "Features", "Pricing", "About" |

> [!TIP]
> Ask: "Would this content make sense in an RSS feed or shared independently?" If yes, use `<article>`. If it's a thematic grouping within a page, use `<section>`.

---

## `<aside>` — Sidebar Content

`<aside>` contains content **tangentially related** to the main content:

```html
<main>
    <article>
        <h2>HTML Tutorial</h2>
        <p>Learn HTML from scratch...</p>
    </article>

    <aside>
        <h3>Related Tutorials</h3>
        <ul>
            <li><a href="/css">CSS Tutorial</a></li>
            <li><a href="/js">JavaScript Tutorial</a></li>
        </ul>

        <h3>Did You Know?</h3>
        <p>HTML was invented in 1991 by Tim Berners-Lee.</p>
    </aside>
</main>
```

Common aside content: sidebar, related articles, advertising, glossary, author bio.

---

## Nesting Articles and Sections

Articles can contain sections, and sections can contain articles:

```html
<!-- Blog post (article) with sections -->
<article>
    <h2>Complete Guide to Web Development</h2>
    <section>
        <h3>Frontend</h3>
        <p>HTML, CSS, and JavaScript...</p>
    </section>
    <section>
        <h3>Backend</h3>
        <p>Node.js, Python, databases...</p>
    </section>
</article>

<!-- Page section containing multiple articles -->
<section>
    <h2>Latest News</h2>
    <article>
        <h3>Article 1</h3>
        <p>Content...</p>
    </article>
    <article>
        <h3>Article 2</h3>
        <p>Content...</p>
    </article>
</section>
```

---

## Summary

| Element | Purpose | Standalone? |
|---------|---------|------------|
| `<article>` | Self-contained, reusable content | ✅ Yes |
| `<section>` | Thematic grouping with a heading | ❌ No |
| `<aside>` | Tangential/sidebar content | ❌ No |

- Use **`<article>`** for content that makes sense independently
- Use **`<section>`** for thematic groupings of related content
- Use **`<aside>`** for sidebar and supplementary content
