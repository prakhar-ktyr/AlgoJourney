---
title: Next.js Incremental Static Regeneration
---

# Next.js Incremental Static Regeneration

Incremental Static Regeneration (ISR) lets you update static pages **after** they've been built — without rebuilding the entire site. You get the speed of static with the freshness of server-side rendering.

## How ISR works

1. Page is built statically at build time.
2. When a request comes after the `revalidate` period, the stale page is served.
3. Next.js triggers a **background regeneration**.
4. Once the new page is ready, it replaces the old one.
5. Future requests get the updated page.

This is the **stale-while-revalidate** strategy.

## Time-based revalidation

Set a `revalidate` interval on your fetch calls:

```javascript
// src/app/products/page.js
export default async function ProductsPage() {
  const res = await fetch("https://api.example.com/products", {
    next: { revalidate: 60 }, // revalidate every 60 seconds
  });
  const products = await res.json();

  return (
    <ul>
      {products.map((p) => (
        <li key={p.id}>{p.name} — ${p.price}</li>
      ))}
    </ul>
  );
}
```

Or set it at the route segment level:

```javascript
// Revalidate the entire route every 60 seconds
export const revalidate = 60;

export default async function Page() {
  const data = await fetchData();
  return <div>{data.content}</div>;
}
```

## On-demand revalidation

Revalidate pages immediately when data changes using `revalidatePath` or `revalidateTag`.

### revalidatePath

```javascript
// src/app/api/revalidate/route.js
import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";

export async function POST(request) {
  const { path } = await request.json();

  revalidatePath(path);

  return NextResponse.json({ revalidated: true });
}
```

Usage — revalidate specific pages:

```javascript
revalidatePath("/blog");              // revalidate the /blog page
revalidatePath("/blog/[slug]", "page"); // revalidate all blog posts
revalidatePath("/", "layout");        // revalidate everything
```

### revalidateTag

Tag your fetches, then revalidate by tag:

```javascript
// In your data fetching function
const res = await fetch("https://api.example.com/posts", {
  next: { tags: ["posts"] },
});
```

```javascript
// When you want to revalidate
import { revalidateTag } from "next/cache";

revalidateTag("posts"); // all fetches tagged "posts" are revalidated
```

## ISR with Server Actions

The most common pattern — revalidate after a mutation:

```javascript
"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";

export async function createPost(formData) {
  const title = formData.get("title");
  const content = formData.get("content");

  await db.post.create({
    data: { title, content },
  });

  // Revalidate the blog listing page
  revalidatePath("/blog");
}
```

```javascript
"use server";

import { revalidateTag } from "next/cache";

export async function updateProduct(id, data) {
  await db.product.update({ where: { id }, data });

  // Revalidate all product-tagged fetches
  revalidateTag("products");
}
```

## ISR with dynamic routes

Combine `generateStaticParams` with ISR for dynamic pages:

```javascript
// src/app/blog/[slug]/page.js

export async function generateStaticParams() {
  const posts = await getPosts();
  return posts.map((post) => ({ slug: post.slug }));
}

export default async function BlogPost({ params }) {
  const { slug } = await params;

  const res = await fetch(`https://api.example.com/posts/${slug}`, {
    next: { revalidate: 3600 }, // revalidate hourly
  });
  const post = await res.json();

  return (
    <article>
      <h1>{post.title}</h1>
      <p>{post.content}</p>
      <time>{new Date(post.updatedAt).toLocaleDateString()}</time>
    </article>
  );
}
```

## Webhook-based revalidation

Trigger revalidation from your CMS or external service:

```javascript
// src/app/api/webhook/route.js
import { revalidateTag } from "next/cache";
import { NextResponse } from "next/server";

export async function POST(request) {
  const secret = request.headers.get("x-webhook-secret");

  if (secret !== process.env.WEBHOOK_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { type, slug } = await request.json();

  if (type === "post.updated") {
    revalidateTag(`post-${slug}`);
  } else if (type === "post.created") {
    revalidateTag("posts");
  }

  return NextResponse.json({ revalidated: true });
}
```

## revalidate precedence

When multiple fetches in a route have different revalidate values:

```javascript
// This route revalidates every 60 seconds (lowest value wins)
const posts = await fetch("/api/posts", {
  next: { revalidate: 60 },
});

const settings = await fetch("/api/settings", {
  next: { revalidate: 3600 },
});
```

The route's revalidation interval is the **minimum** of all revalidate values (60 seconds in this case).

## Key takeaways

- ISR = static pages that update in the background after a set time interval.
- Use `next: { revalidate: N }` on fetch or `export const revalidate = N` on the route.
- **On-demand revalidation**: use `revalidatePath()` or `revalidateTag()` for instant updates.
- Combine ISR with Server Actions to revalidate after data mutations.
- Use tagged fetches + webhooks for CMS-driven revalidation.
- The lowest `revalidate` value in a route wins.
