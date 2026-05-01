---
title: Next.js Revalidating Data
---

# Next.js Revalidating Data

Revalidation is how you update cached data in Next.js. After a mutation (creating, updating, or deleting data), you need to tell Next.js to refresh the affected pages and data.

## Two types of revalidation

| Type | How | When |
|------|-----|------|
| Time-based | `revalidate: N` | Automatically, after N seconds |
| On-demand | `revalidatePath` / `revalidateTag` | Manually, after mutations |

## Time-based revalidation

Set a time interval on fetch calls:

```javascript
// Revalidate every 60 seconds
const res = await fetch("https://api.example.com/data", {
  next: { revalidate: 60 },
});
```

Or at the route segment level:

```javascript
// src/app/blog/page.js
export const revalidate = 3600; // revalidate every hour

export default async function BlogPage() {
  const posts = await fetch("https://api.example.com/posts").then((r) => r.json());
  return <ul>{posts.map((p) => <li key={p.id}>{p.title}</li>)}</ul>;
}
```

## revalidatePath

Refresh all data for a specific path:

```javascript
"use server";

import { revalidatePath } from "next/cache";

export async function createPost(formData) {
  await db.post.create({ data: { title: formData.get("title") } });

  revalidatePath("/blog");          // revalidate specific page
}
```

### Path options

```javascript
// Revalidate a specific page
revalidatePath("/blog");

// Revalidate a dynamic route
revalidatePath("/blog/my-post");

// Revalidate all pages matching a dynamic segment
revalidatePath("/blog/[slug]", "page");

// Revalidate a layout and all its children
revalidatePath("/blog", "layout");

// Revalidate everything
revalidatePath("/", "layout");
```

## revalidateTag

Tag your fetches and revalidate by tag — more granular control:

```javascript
// Tag your fetches
const posts = await fetch("https://api.example.com/posts", {
  next: { tags: ["posts"] },
});

const post = await fetch(`https://api.example.com/posts/${id}`, {
  next: { tags: ["posts", `post-${id}`] },
});
```

```javascript
"use server";

import { revalidateTag } from "next/cache";

export async function createPost(formData) {
  await db.post.create({ data: { title: formData.get("title") } });

  revalidateTag("posts"); // all fetches tagged "posts" refetch
}

export async function updatePost(id, formData) {
  await db.post.update({ where: { id }, data: { title: formData.get("title") } });

  revalidateTag(`post-${id}`); // only this post refetches
}
```

## revalidatePath vs revalidateTag

| Feature | revalidatePath | revalidateTag |
|---------|---------------|--------------|
| Scope | Entire route | Specific fetches |
| Granularity | Coarse | Fine |
| Use case | Page-level refresh | Data-level refresh |

```javascript
// revalidatePath: clears ALL cached data for /blog
revalidatePath("/blog");

// revalidateTag: clears only fetches tagged "posts"
revalidateTag("posts");
```

## Revalidation in Server Actions

The most common pattern:

```javascript
"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { redirect } from "next/navigation";

export async function createPost(formData) {
  const post = await db.post.create({
    data: { title: formData.get("title"), content: formData.get("content") },
  });

  revalidateTag("posts");
  redirect(`/blog/${post.slug}`);
}

export async function deletePost(id) {
  await db.post.delete({ where: { id } });

  revalidatePath("/blog");
  redirect("/blog");
}
```

## Revalidation via API route

For external webhooks or services:

```javascript
// src/app/api/revalidate/route.js
import { revalidateTag } from "next/cache";
import { NextResponse } from "next/server";

export async function POST(request) {
  const { tag, secret } = await request.json();

  if (secret !== process.env.REVALIDATION_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  revalidateTag(tag);
  return NextResponse.json({ revalidated: true, tag });
}
```

## Key takeaways

- **Time-based**: Set `revalidate` for automatic periodic refresh.
- **On-demand**: Use `revalidatePath` or `revalidateTag` after mutations.
- `revalidatePath` refreshes an entire route. `revalidateTag` refreshes specific fetches.
- Always revalidate after Server Actions that modify data.
- Tag your fetches for fine-grained revalidation control.
- Protect revalidation API endpoints with a secret.
