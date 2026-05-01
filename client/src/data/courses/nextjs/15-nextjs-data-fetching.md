---
title: Next.js Data Fetching
---

# Next.js Data Fetching

Next.js simplifies data fetching by letting you `await` data directly in Server Components — no `useEffect`, no loading state boilerplate. This lesson covers all the ways to fetch data.

## Fetching in Server Components

The simplest approach — use `fetch` or query a database directly:

```javascript
// src/app/posts/page.js
export default async function PostsPage() {
  const res = await fetch("https://jsonplaceholder.typicode.com/posts");
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

No `useState`, no `useEffect`, no loading state management. The component renders with data already available.

## fetch caching behavior

Next.js extends the native `fetch` API with caching options:

```javascript
// Cached by default (static) — result reused across requests
await fetch("https://api.example.com/data");

// Revalidate every 60 seconds (ISR)
await fetch("https://api.example.com/data", {
  next: { revalidate: 60 },
});

// Never cache (SSR) — fresh data on every request
await fetch("https://api.example.com/data", {
  cache: "no-store",
});

// Cache with tags for on-demand revalidation
await fetch("https://api.example.com/posts", {
  next: { tags: ["posts"] },
});
```

## Multiple parallel fetches

Avoid waterfalls by fetching data in parallel:

```javascript
// ❌ BAD — sequential (waterfall)
export default async function Page() {
  const user = await getUser();       // waits...
  const posts = await getPosts();     // then waits...
  const comments = await getComments(); // then waits...
  // Total time = user + posts + comments
}

// ✅ GOOD — parallel
export default async function Page() {
  const [user, posts, comments] = await Promise.all([
    getUser(),
    getPosts(),
    getComments(),
  ]);
  // Total time = max(user, posts, comments)
}
```

## Data fetching functions

Create reusable data fetching functions:

```javascript
// src/lib/data.js
export async function getPost(slug) {
  const res = await fetch(`https://api.example.com/posts/${slug}`, {
    next: { revalidate: 3600 },
  });

  if (!res.ok) return null;
  return res.json();
}

export async function getPostComments(postId) {
  const res = await fetch(`https://api.example.com/posts/${postId}/comments`, {
    next: { tags: [`comments-${postId}`] },
  });

  return res.json();
}
```

```javascript
// src/app/blog/[slug]/page.js
import { getPost, getPostComments } from "@/lib/data";

export default async function BlogPost({ params }) {
  const { slug } = await params;
  const post = await getPost(slug);

  if (!post) return <p>Post not found</p>;

  const comments = await getPostComments(post.id);

  return (
    <article>
      <h1>{post.title}</h1>
      <p>{post.body}</p>
      <h2>Comments ({comments.length})</h2>
      {comments.map((c) => (
        <p key={c.id}>{c.body}</p>
      ))}
    </article>
  );
}
```

## Request memoization

Next.js **automatically deduplicates** identical `fetch` requests in a single render pass:

```javascript
// Both components fetch the same URL — only ONE request is made

// Header.js
async function Header() {
  const user = await fetch("/api/user").then((r) => r.json());
  return <h1>Welcome, {user.name}</h1>;
}

// Sidebar.js
async function Sidebar() {
  const user = await fetch("/api/user").then((r) => r.json());
  return <p>Role: {user.role}</p>;
}
```

This means you can fetch the same data in multiple components without worrying about performance.

## Database queries

With ORMs like Prisma or Drizzle, query directly:

```javascript
import { db } from "@/lib/db";

export default async function UsersPage() {
  const users = await db.user.findMany({
    select: { id: true, name: true, email: true },
    orderBy: { name: "asc" },
  });

  return (
    <table>
      <thead>
        <tr><th>Name</th><th>Email</th></tr>
      </thead>
      <tbody>
        {users.map((user) => (
          <tr key={user.id}>
            <td>{user.name}</td>
            <td>{user.email}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
```

> **Note**: Database queries don't use `fetch`, so they aren't automatically cached or deduplicated. Use React's `cache()` for memoization.

## React cache() for non-fetch data

```javascript
import { cache } from "react";
import { db } from "@/lib/db";

// Memoized for the duration of a single request
export const getUser = cache(async (id) => {
  return db.user.findUnique({ where: { id } });
});

// Now multiple components can call getUser(id)
// and only one query runs per request
```

## Fetching on the client

For interactive features, fetch data on the client with `useEffect` or a library:

```javascript
"use client";

import { useState, useEffect } from "react";

export default function SearchResults({ query }) {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!query) return;
    setLoading(true);

    fetch(`/api/search?q=${encodeURIComponent(query)}`)
      .then((res) => res.json())
      .then((data) => {
        setResults(data);
        setLoading(false);
      });
  }, [query]);

  if (loading) return <p>Searching...</p>;

  return (
    <ul>
      {results.map((r) => (
        <li key={r.id}>{r.title}</li>
      ))}
    </ul>
  );
}
```

## Streaming with Suspense

Instead of blocking the entire page, stream parts as they become ready:

```javascript
import { Suspense } from "react";

export default function DashboardPage() {
  return (
    <div>
      <h1>Dashboard</h1>
      <Suspense fallback={<p>Loading stats...</p>}>
        <Stats />          {/* slow fetch */}
      </Suspense>
      <Suspense fallback={<p>Loading activity...</p>}>
        <RecentActivity />  {/* another slow fetch */}
      </Suspense>
    </div>
  );
}

async function Stats() {
  const stats = await getStats(); // takes 2 seconds
  return <div>Revenue: ${stats.revenue}</div>;
}

async function RecentActivity() {
  const activity = await getActivity(); // takes 3 seconds
  return (
    <ul>
      {activity.map((a) => (
        <li key={a.id}>{a.description}</li>
      ))}
    </ul>
  );
}
```

The page shell renders immediately. Each `<Suspense>` boundary streams in when its data is ready.

## Error handling

```javascript
// src/lib/data.js
export async function getPost(slug) {
  const res = await fetch(`https://api.example.com/posts/${slug}`);

  if (!res.ok) {
    throw new Error(`Failed to fetch post: ${res.status}`);
  }

  return res.json();
}
```

Combined with `error.js` (covered in a later lesson), this gives you automatic error boundaries.

## Key takeaways

- **Server Components**: `await` data directly — no hooks needed.
- **Caching**: `fetch` is cached by default. Use `revalidate` for ISR, `no-store` for SSR.
- **Parallel fetching**: Use `Promise.all()` to avoid waterfalls.
- **Request memoization**: Identical `fetch` calls are automatically deduplicated per render.
- **Database queries**: Use React `cache()` for memoization.
- **Streaming**: Wrap slow components in `<Suspense>` for progressive loading.
- **Client fetching**: Use `useEffect` or data fetching libraries for interactive features.
