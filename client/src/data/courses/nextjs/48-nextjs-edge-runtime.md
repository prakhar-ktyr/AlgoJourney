---
title: Next.js Edge Runtime
---

# Next.js Edge Runtime

Next.js supports two server runtimes: **Node.js** (default) and **Edge**. The Edge Runtime runs on CDN edge servers for ultra-low latency, but has a restricted API surface.

## Edge vs Node.js runtime

| Feature | Node.js Runtime | Edge Runtime |
|---------|----------------|-------------|
| Cold start | Slower | Near-instant |
| APIs | Full Node.js | Web APIs subset |
| File system | Yes (`fs`) | No |
| npm packages | Most | Limited (no native modules) |
| Max execution | No limit | ~30 seconds (varies) |
| Location | Single region | Multiple edge locations |
| Best for | Complex operations | Fast, lightweight responses |

## Using Edge Runtime

### In Route Handlers

```javascript
// src/app/api/hello/route.js
export const runtime = "edge";

export async function GET() {
  return new Response(JSON.stringify({ message: "Hello from the edge!" }), {
    headers: { "Content-Type": "application/json" },
  });
}
```

### In Pages

```javascript
// src/app/fast-page/page.js
export const runtime = "edge";

export default function FastPage() {
  return <h1>Rendered at the edge!</h1>;
}
```

### In Middleware

Middleware **always** runs on the Edge Runtime — no configuration needed:

```javascript
// src/middleware.js — automatically Edge
export function middleware(request) {
  // runs on Edge by default
}
```

## Available APIs on Edge

The Edge Runtime supports Web standard APIs:

```javascript
// ✅ Available on Edge
fetch()                    // HTTP requests
Request / Response         // Web API
URL / URLSearchParams      // URL parsing
Headers                    // Header manipulation
TextEncoder / TextDecoder  // Text encoding
crypto                     // Web Crypto API
setTimeout / setInterval   // Timers
structuredClone            // Deep clone
atob / btoa                // Base64
ReadableStream / WritableStream
AbortController / AbortSignal
```

```javascript
// ❌ NOT available on Edge
require("fs")              // File system
require("path")            // Path module
require("child_process")   // Process spawning
Buffer                     // Use Uint8Array instead
process.env                // Available, but limited
// Most native Node.js modules
```

## When to use Edge

Good use cases:

- **Middleware** (always Edge)
- **Redirects and rewrites** based on geolocation
- **A/B testing** based on cookies
- **Authentication checks** (JWT verification)
- **Simple API responses** (lightweight data)
- **Personalization** based on headers

Not suitable for:

- Database queries (use connection pooling or HTTP APIs)
- File system operations
- Heavy computation
- Packages with native dependencies

## Edge-compatible database access

Since Edge can't use traditional database drivers, use HTTP-based database clients:

```javascript
// Vercel Postgres (Edge-compatible)
import { sql } from "@vercel/postgres";

export const runtime = "edge";

export async function GET() {
  const { rows } = await sql`SELECT * FROM posts LIMIT 10`;
  return Response.json(rows);
}
```

```javascript
// Neon (serverless Postgres)
import { neon } from "@neondatabase/serverless";

export const runtime = "edge";

const sql = neon(process.env.DATABASE_URL);

export async function GET() {
  const posts = await sql`SELECT * FROM posts`;
  return Response.json(posts);
}
```

## Streaming on Edge

```javascript
export const runtime = "edge";

export async function GET() {
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      for (const item of ["Hello", " ", "from", " ", "Edge"]) {
        controller.enqueue(encoder.encode(item));
        await new Promise((r) => setTimeout(r, 500));
      }
      controller.close();
    },
  });

  return new Response(stream, {
    headers: { "Content-Type": "text/plain" },
  });
}
```

## Choosing a runtime

```
Need full Node.js APIs (fs, native modules)?
  → Node.js Runtime (default)

Need global low-latency for simple operations?
  → Edge Runtime

Middleware?
  → Always Edge (automatic)
```

## Key takeaways

- Edge Runtime runs on CDN edges — near-instant cold starts, global distribution.
- Set `export const runtime = "edge"` on Route Handlers or Pages.
- Edge supports **Web APIs** only — no `fs`, no native Node.js modules.
- Middleware always runs on Edge.
- Use HTTP-based database clients (Neon, Vercel Postgres) for Edge DB access.
- Default to **Node.js** runtime unless you specifically need Edge performance.
