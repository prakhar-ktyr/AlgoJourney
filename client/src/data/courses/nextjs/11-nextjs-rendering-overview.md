---
title: Next.js Rendering Overview
---

# Next.js Rendering Overview

Rendering is how your React components turn into HTML that users see. Next.js gives you **four rendering strategies** — each with different trade-offs for performance, SEO, and data freshness. Understanding when to use each one is key to building fast applications.

## The four rendering strategies

| Strategy | Abbreviation | When HTML is generated | Data freshness |
|----------|-------------|----------------------|----------------|
| Static Site Generation | SSG | At **build time** | Stale until next build |
| Incremental Static Regeneration | ISR | At build + **revalidated** periodically | Configurable freshness |
| Server-Side Rendering | SSR | On **every request** | Always fresh |
| Client-Side Rendering | CSR | In the **browser** | Always fresh |

## Static Site Generation (SSG)

Pages are built once at `next build` and served as static HTML. The fastest option.

```javascript
// src/app/about/page.js
// This page is static by default — no data fetching
export default function AboutPage() {
  return <h1>About Us</h1>;
}
```

Pages are **static by default** in Next.js. If your page doesn't fetch dynamic data, it's automatically SSG.

### Static with data

```javascript
// src/app/blog/page.js
// fetch with no cache option → static at build time
async function getPosts() {
  const res = await fetch("https://api.example.com/posts");
  return res.json();
}

export default async function BlogPage() {
  const posts = await getPosts();

  return (
    <ul>
      {posts.map((post) => (
        <li key={post.id}>{post.title}</li>
      ))}
    </ul>
  );
}
```

**Best for**: Marketing pages, blog posts, documentation, landing pages — content that doesn't change frequently.

## Incremental Static Regeneration (ISR)

Like SSG, but the page is **revalidated** (rebuilt) after a set time interval:

```javascript
// src/app/products/page.js
async function getProducts() {
  const res = await fetch("https://api.example.com/products", {
    next: { revalidate: 3600 }, // revalidate every hour
  });
  return res.json();
}

export default async function ProductsPage() {
  const products = await getProducts();

  return (
    <ul>
      {products.map((p) => (
        <li key={p.id}>{p.name} — ${p.price}</li>
      ))}
    </ul>
  );
}
```

How ISR works:

1. First visitor gets the cached (static) page.
2. After `revalidate` seconds, the next request triggers a background rebuild.
3. Once rebuilt, new visitors get the updated page.
4. The stale page is served while rebuilding (stale-while-revalidate).

**Best for**: Product catalogs, news sites, content that updates periodically.

## Server-Side Rendering (SSR)

HTML is generated on **every request**. Data is always fresh but each request takes server time.

```javascript
// src/app/dashboard/page.js
// Opt into SSR by using dynamic data sources
import { cookies } from "next/headers";

export default async function DashboardPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get("session")?.value;
  const user = await getUser(token);

  return <h1>Welcome, {user.name}</h1>;
}
```

Pages are SSR when they use:

- `cookies()` or `headers()`
- `searchParams` in the page component
- `fetch` with `{ cache: "no-store" }`
- `export const dynamic = "force-dynamic"`

**Best for**: Personalized content, dashboards, pages that depend on cookies/auth.

## Client-Side Rendering (CSR)

Data is fetched in the browser after the initial HTML loads. Used for interactive, user-specific content.

```javascript
"use client";

import { useState, useEffect } from "react";

export default function UserProfile() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/user")
      .then((res) => res.json())
      .then((data) => {
        setUser(data);
        setLoading(false);
      });
  }, []);

  if (loading) return <p>Loading...</p>;

  return <h1>Hello, {user.name}</h1>;
}
```

**Best for**: User interactions, real-time data, authenticated client-side content, dashboards with frequent updates.

## Comparison

| Feature | SSG | ISR | SSR | CSR |
|---------|-----|-----|-----|-----|
| Speed | Fastest | Fast | Slower | Varies |
| SEO | Excellent | Excellent | Excellent | Poor |
| Data freshness | Build time | Periodic | Every request | Real-time |
| Server load | None (CDN) | Low | High | None |
| TTFB | Fastest | Fast | Slower | Fast (empty shell) |
| Use case | Static content | Updated content | Personalized | Interactive |

## How Next.js decides

Next.js automatically chooses the rendering strategy:

```
Is the page fully static (no data fetching)?
  → SSG (default)

Does it use fetch with { next: { revalidate: N } }?
  → ISR

Does it use cookies(), headers(), searchParams, or { cache: "no-store" }?
  → SSR

Does it use "use client" with useEffect for data?
  → CSR (client-side)
```

### Forcing a strategy

```javascript
// Force static
export const dynamic = "force-static";

// Force dynamic (SSR)
export const dynamic = "force-dynamic";

// Revalidate interval (ISR)
export const revalidate = 3600; // seconds
```

## The rendering hierarchy

A single page can mix strategies:

```
<StaticLayout>         ← SSG (layout is static)
  <StaticHeader />      ← SSG (no dynamic data)
  <DynamicContent />    ← SSR (uses cookies)
  <ClientWidget />      ← CSR (interactive, "use client")
</StaticLayout>
```

This is the power of **partial prerendering** — static shells with dynamic holes.

## Key takeaways

- **SSG** (default): fastest, best for static content.
- **ISR**: static + periodic updates. Set `revalidate` on fetch calls.
- **SSR**: fresh data every request. Triggered by cookies, headers, or `cache: "no-store"`.
- **CSR**: browser-side fetching for interactive content.
- Next.js automatically chooses the strategy based on your data fetching patterns.
- A single page can combine static and dynamic rendering.
