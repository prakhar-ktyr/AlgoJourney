---
title: Next.js Cache Revalidation
---

# Next.js Cache Revalidation

Cache revalidation is the process of purging stale data and fetching fresh content. Next.js supports both **time-based** and **on-demand** revalidation strategies.

## Time-based revalidation

Automatically refresh cached data after a set interval:

```javascript
// Per-fetch: revalidate every 60 seconds
await fetch("https://api.example.com/posts", {
  next: { revalidate: 60 },
});

// Per-route: revalidate all data every 5 minutes
export const revalidate = 300;
```

### How time-based revalidation works

```
t=0    → Page built and cached
t=30s  → Request → serves cached version
t=60s  → Request → serves cached version, triggers background rebuild
t=61s  → New cached version ready
t=90s  → Request → serves the NEW cached version
```

The pattern is **stale-while-revalidate** — users always get a fast response, and the cache updates in the background.

### Multiple revalidate values

```javascript
// Route-level
export const revalidate = 3600;

// Fetch-level (overrides route-level if lower)
await fetch(url, { next: { revalidate: 60 } });
await fetch(url2, { next: { revalidate: 300 } });

// Effective revalidation: 60 seconds (lowest wins)
```

## On-demand revalidation

Trigger revalidation immediately — typically after a data mutation.

### revalidatePath

```javascript
"use server";
import { revalidatePath } from "next/cache";

export async function updatePost(id, data) {
  await db.post.update({ where: { id }, data });

  // Revalidate specific path
  revalidatePath("/blog");

  // Revalidate dynamic path
  revalidatePath(`/blog/${id}`);

  // Revalidate all pages using a layout
  revalidatePath("/", "layout");
}
```

### revalidateTag

More precise — revalidate only specific data:

```javascript
// 1. Tag your fetches
const posts = await fetch("https://api.example.com/posts", {
  next: { tags: ["posts"] },
});

const post = await fetch(`https://api.example.com/posts/${id}`, {
  next: { tags: ["posts", `post-${id}`] },
});

// 2. Revalidate by tag
"use server";
import { revalidateTag } from "next/cache";

export async function updatePost(id) {
  await db.post.update({ ... });
  revalidateTag(`post-${id}`);  // only this post's data refetches
}

export async function publishBatch() {
  await db.post.updateMany({ ... });
  revalidateTag("posts");  // all post data refetches
}
```

## On-demand revalidation via API

Create an API endpoint for external services to trigger revalidation:

```javascript
// src/app/api/revalidate/route.js
import { revalidatePath, revalidateTag } from "next/cache";
import { NextResponse } from "next/server";

export async function POST(request) {
  const { secret, path, tag } = await request.json();

  if (secret !== process.env.REVALIDATION_SECRET) {
    return NextResponse.json({ error: "Invalid secret" }, { status: 401 });
  }

  if (tag) {
    revalidateTag(tag);
  } else if (path) {
    revalidatePath(path);
  }

  return NextResponse.json({ revalidated: true, now: Date.now() });
}
```

Call from external service:

```bash
curl -X POST https://yoursite.com/api/revalidate \
  -H "Content-Type: application/json" \
  -d '{"secret":"your-secret","tag":"posts"}'
```

## Choosing a strategy

| Scenario | Strategy |
|----------|----------|
| Blog, documentation | Time-based (hourly) |
| E-commerce products | Time-based (minutes) + on-demand after edits |
| User dashboard | No cache (`force-dynamic`) |
| CMS content | On-demand via webhook |
| Social feed | Short time-based (30 seconds) |

## Key takeaways

- **Time-based**: set `revalidate` interval — stale-while-revalidate pattern.
- **On-demand**: `revalidatePath` for pages, `revalidateTag` for specific data.
- The lowest `revalidate` value in a route wins.
- Use tagged fetches for fine-grained revalidation.
- Protect revalidation API endpoints with a secret.
- Choose your strategy based on how frequently your data changes.
