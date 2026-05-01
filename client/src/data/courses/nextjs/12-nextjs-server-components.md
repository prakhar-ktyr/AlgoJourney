---
title: Next.js Server Components
---

# Next.js Server Components

In Next.js App Router, all components are **Server Components by default**. They run on the server, have direct access to databases and file systems, and send only HTML to the browser — no JavaScript bundle for the component itself.

## What are Server Components?

Server Components render on the server and stream HTML to the client. They never run in the browser.

```javascript
// src/app/users/page.js
// This is a Server Component (default)

export default async function UsersPage() {
  // Direct database access — no API needed!
  const users = await db.user.findMany();

  return (
    <ul>
      {users.map((user) => (
        <li key={user.id}>{user.name}</li>
      ))}
    </ul>
  );
}
```

**No `useState`, no `useEffect`, no event handlers** — Server Components are purely for rendering with data.

## Benefits

| Benefit | How |
|---------|-----|
| Smaller bundles | Component code stays on the server |
| Direct data access | Query databases, read files, call APIs without an endpoint |
| Secure | Secrets and tokens never reach the browser |
| SEO | HTML is generated on the server |
| Streaming | Components render progressively |

## Data fetching

### Using fetch

```javascript
export default async function PostsPage() {
  const res = await fetch("https://api.example.com/posts");
  const posts = await res.json();

  return (
    <div>
      {posts.map((post) => (
        <article key={post.id}>
          <h2>{post.title}</h2>
          <p>{post.excerpt}</p>
        </article>
      ))}
    </div>
  );
}
```

### Direct database queries

```javascript
import { db } from "@/lib/db";

export default async function ProductsPage() {
  const products = await db.product.findMany({
    where: { published: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      {products.map((product) => (
        <div key={product.id}>
          <h3>{product.name}</h3>
          <p>${product.price}</p>
        </div>
      ))}
    </div>
  );
}
```

### Reading files

```javascript
import { readFile } from "node:fs/promises";

export default async function DocsPage() {
  const content = await readFile("./docs/intro.md", "utf-8");

  return <pre>{content}</pre>;
}
```

## Async components

Server Components can be `async` — you can `await` directly in the component body:

```javascript
// This is valid! No useEffect, no loading state management
export default async function WeatherPage() {
  const weather = await fetch("https://api.weather.com/current").then((r) => r.json());

  return (
    <div>
      <h1>Current Weather</h1>
      <p>Temperature: {weather.temp}°C</p>
      <p>Condition: {weather.condition}</p>
    </div>
  );
}
```

## Passing data to Client Components

Server Components fetch data and pass it down as props:

```javascript
// Server Component (page.js)
import LikeButton from "./LikeButton";

export default async function PostPage({ params }) {
  const { slug } = await params;
  const post = await getPost(slug);

  return (
    <article>
      <h1>{post.title}</h1>
      <p>{post.content}</p>
      {/* Pass data as props to Client Component */}
      <LikeButton postId={post.id} initialLikes={post.likes} />
    </article>
  );
}
```

```javascript
// Client Component (LikeButton.js)
"use client";

import { useState } from "react";

export default function LikeButton({ postId, initialLikes }) {
  const [likes, setLikes] = useState(initialLikes);

  async function handleLike() {
    setLikes((prev) => prev + 1);
    await fetch(`/api/posts/${postId}/like`, { method: "POST" });
  }

  return (
    <button onClick={handleLike}>
      ❤️ {likes}
    </button>
  );
}
```

## What you CANNOT do in Server Components

```javascript
// ❌ These will NOT work in Server Components:
import { useState, useEffect } from "react"; // hooks
onClick={() => {}}                              // event handlers
window.localStorage                             // browser APIs
document.querySelector                          // DOM access
```

If you need any of these, use a **Client Component** (`"use client"`).

## Composing Server and Client Components

```javascript
// Server Component (layout)
import Navbar from "@/components/Navbar";     // Client Component
import Sidebar from "@/components/Sidebar";    // Server Component
import Footer from "@/components/Footer";      // Server Component

export default function Layout({ children }) {
  return (
    <div>
      <Navbar />        {/* Client — interactive */}
      <Sidebar />       {/* Server — static */}
      <main>{children}</main>
      <Footer />        {/* Server — static */}
    </div>
  );
}
```

## Server-only code

Ensure code never accidentally runs on the client:

```bash
npm install server-only
```

```javascript
// src/lib/db.js
import "server-only"; // throws error if imported in a Client Component

import { PrismaClient } from "@prisma/client";

export const db = new PrismaClient();
```

## Key takeaways

- All components in `app/` are **Server Components by default**.
- Server Components can be `async` — fetch data directly with `await`.
- They produce **zero client-side JavaScript** — smaller bundles.
- You **cannot** use hooks, event handlers, or browser APIs in Server Components.
- Pass data from Server Components to Client Components via **props**.
- Use `server-only` to prevent accidental client-side imports of server code.
