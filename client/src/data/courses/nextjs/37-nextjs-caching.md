---
title: Next.js Caching
---

# Next.js Caching

Next.js has a multi-layer caching system that improves performance by avoiding redundant work. Understanding these caches is essential for building fast applications — and for debugging when data seems stale.

## The four caching layers

| Cache | What | Where | Duration |
|-------|------|-------|----------|
| Request Memoization | Duplicate `fetch` calls in a single render | Server | Per request |
| Data Cache | `fetch` response data | Server | Persistent (until revalidated) |
| Full Route Cache | Pre-rendered HTML and RSC payload | Server | Persistent (until revalidated) |
| Router Cache | RSC payload of visited routes | Client | Session (auto-expires) |

## 1. Request Memoization

Identical `fetch` calls in the same render pass are automatically deduplicated:

```javascript
// Both components call the same URL — only ONE request is made

async function Header() {
  const user = await fetch("/api/user").then((r) => r.json());
  return <h1>Hi, {user.name}</h1>;
}

async function Sidebar() {
  const user = await fetch("/api/user").then((r) => r.json());
  return <p>Role: {user.role}</p>;
}
```

- Happens automatically for `fetch` with the same URL and options.
- Lasts for one server render — not persistent.
- For non-fetch functions, use React's `cache()`.

## 2. Data Cache

`fetch` responses are cached persistently on the server:

```javascript
// Cached indefinitely (default)
await fetch("https://api.example.com/data");

// Cached for 60 seconds, then revalidated
await fetch("https://api.example.com/data", {
  next: { revalidate: 60 },
});

// Not cached — fresh on every request
await fetch("https://api.example.com/data", {
  cache: "no-store",
});
```

### Opting out

```javascript
// Per-fetch
fetch(url, { cache: "no-store" });

// Per-route
export const dynamic = "force-dynamic";

// Per-route (alternative)
export const revalidate = 0;
```

## 3. Full Route Cache

Static routes are pre-rendered at build time and cached:

```
next build
  ├── / → HTML + RSC Payload (cached)
  ├── /about → HTML + RSC Payload (cached)
  └── /blog/[slug] → one per generateStaticParams (cached)
```

- Only applies to **static** routes.
- Dynamic routes (using cookies, headers, searchParams, no-store) skip this cache.
- Invalidated by `revalidatePath` or `revalidateTag`.

## 4. Router Cache (client-side)

Visited routes are cached in the browser during a session:

```
User visits /dashboard → cached
User navigates to /settings → cached
User clicks back to /dashboard → served from Router Cache (instant!)
```

- Automatic for all navigations.
- Static routes: cached for 5 minutes.
- Dynamic routes: cached for 30 seconds.
- Reset on page refresh.

### Invalidating the Router Cache

```javascript
import { useRouter } from "next/navigation";

function RefreshButton() {
  const router = useRouter();
  return <button onClick={() => router.refresh()}>Refresh</button>;
}
```

`revalidatePath` and `revalidateTag` in Server Actions also clear the Router Cache for the affected routes.

## Caching summary

```
Request comes in
  │
  ├── Router Cache hit? → Return cached (client-side)
  │
  ├── Full Route Cache hit? → Return cached HTML
  │
  ├── Data Cache hit? → Use cached fetch data
  │
  └── Request Memoization → Deduplicate same-render fetches
```

## Common caching issues

### Problem: stale data after mutation

```javascript
// ❌ Data doesn't update after creating a post
"use server";
export async function createPost(formData) {
  await db.post.create({ ... });
  // forgot to revalidate!
}

// ✅ Revalidate after mutation
"use server";
import { revalidatePath } from "next/cache";
export async function createPost(formData) {
  await db.post.create({ ... });
  revalidatePath("/blog");
}
```

### Problem: page always static when you want dynamic

```javascript
// Page is static because fetch is cached by default
export default async function Page() {
  const data = await fetch("https://api.example.com/live-data");
  // ...
}

// ✅ Opt out of caching
export default async function Page() {
  const data = await fetch("https://api.example.com/live-data", {
    cache: "no-store",
  });
  // ...
}
```

## Key takeaways

- Next.js has **4 caching layers**: Request Memoization, Data Cache, Full Route Cache, Router Cache.
- `fetch` is cached by default — use `no-store` for dynamic data.
- Static pages are fully cached at build time.
- Use `revalidatePath` / `revalidateTag` to invalidate caches after mutations.
- The Router Cache keeps visited pages instant on the client.
- Understanding caching is essential for debugging "stale data" issues.
