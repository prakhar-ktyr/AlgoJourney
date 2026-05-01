---
title: Next.js Static Generation
---

# Next.js Static Generation

Static Generation (SSG) pre-renders pages at **build time**. The HTML is generated once and served from a CDN — the fastest possible delivery. In the App Router, pages are static by default.

## Default static behavior

Any page without dynamic data sources is automatically static:

```javascript
// src/app/about/page.js — static by default
export default function AboutPage() {
  return (
    <div>
      <h1>About Us</h1>
      <p>We build great products.</p>
    </div>
  );
}
```

## Static pages with data

Fetch data at build time using `fetch` (cached by default):

```javascript
// src/app/blog/page.js
export default async function BlogPage() {
  const res = await fetch("https://api.example.com/posts"); // cached at build
  const posts = await res.json();

  return (
    <ul>
      {posts.map((post) => (
        <li key={post.id}>{post.title}</li>
      ))}
    </ul>
  );
}
```

## generateStaticParams

For **dynamic routes**, use `generateStaticParams` to tell Next.js which pages to pre-render at build time:

```javascript
// src/app/blog/[slug]/page.js

// Generate all possible slug values at build time
export async function generateStaticParams() {
  const res = await fetch("https://api.example.com/posts");
  const posts = await res.json();

  return posts.map((post) => ({
    slug: post.slug,
  }));
}

// This page is pre-rendered for each slug
export default async function BlogPost({ params }) {
  const { slug } = await params;
  const res = await fetch(`https://api.example.com/posts/${slug}`);
  const post = await res.json();

  return (
    <article>
      <h1>{post.title}</h1>
      <p>{post.content}</p>
    </article>
  );
}
```

At build time, Next.js calls `generateStaticParams()` to get all slugs, then builds a static HTML page for each one.

### Multiple dynamic segments

```javascript
// src/app/blog/[category]/[slug]/page.js
export async function generateStaticParams() {
  const posts = await getPosts();

  return posts.map((post) => ({
    category: post.category,
    slug: post.slug,
  }));
}
```

### Handling non-generated params

By default, dynamic routes that weren't pre-generated are rendered on demand and cached. Control this with `dynamicParams`:

```javascript
// Only allow pre-generated params — 404 for anything else
export const dynamicParams = false;

export async function generateStaticParams() {
  return [{ slug: "hello" }, { slug: "world" }];
}

// /blog/hello → works
// /blog/world → works
// /blog/other → 404
```

## Force static rendering

Explicitly mark a page as static:

```javascript
export const dynamic = "force-static";

export default async function Page() {
  // Even if this uses dynamic features,
  // Next.js will generate it statically
  return <h1>Static Page</h1>;
}
```

## What makes a page dynamic?

These features opt a page out of static generation:

| Feature | Effect |
|---------|--------|
| `cookies()` | Makes page dynamic |
| `headers()` | Makes page dynamic |
| `searchParams` prop | Makes page dynamic |
| `fetch` with `cache: "no-store"` | Makes page dynamic |
| `export const dynamic = "force-dynamic"` | Makes page dynamic |
| `unstable_noStore()` | Makes page dynamic |

## Checking static vs dynamic

During `next build`, the output shows which pages are static:

```
Route (app)                          Size     First Load JS
┌ ○ /                                5.2 kB   85 kB
├ ○ /about                           1.1 kB   81 kB
├ ● /blog                            2.3 kB   82 kB
├ ● /blog/[slug]                     3.1 kB   83 kB
└ λ /dashboard                       4.5 kB   84 kB

○ — Static
● — SSG with generateStaticParams
λ — Dynamic (server-rendered)
```

## Static generation with nested layouts

Layouts are shared and cached between pages. If a layout is static, it's generated once:

```
src/app/
├── layout.js          ← static (shared)
├── blog/
│   ├── layout.js      ← static (shared)
│   └── [slug]/
│       └── page.js    ← pre-rendered per slug
```

## Example: documentation site

```javascript
// src/app/docs/[...slug]/page.js
import { readFile, readdir } from "node:fs/promises";
import { join } from "node:path";

const docsDir = join(process.cwd(), "content/docs");

export async function generateStaticParams() {
  const files = await readdir(docsDir, { recursive: true });

  return files
    .filter((f) => f.endsWith(".md"))
    .map((f) => ({
      slug: f.replace(".md", "").split("/"),
    }));
}

export default async function DocPage({ params }) {
  const { slug } = await params;
  const filePath = join(docsDir, `${slug.join("/")}.md`);
  const content = await readFile(filePath, "utf-8");

  return (
    <article>
      <pre>{content}</pre>
    </article>
  );
}
```

## Key takeaways

- Pages are **static by default** in the App Router.
- Use `generateStaticParams` to pre-render dynamic routes at build time.
- Set `dynamicParams = false` to restrict routes to only pre-generated params.
- Dynamic features (cookies, headers, searchParams, no-store) opt out of static generation.
- Check `next build` output to verify which pages are static vs dynamic.
- Static pages are served from a CDN — the fastest possible delivery.
