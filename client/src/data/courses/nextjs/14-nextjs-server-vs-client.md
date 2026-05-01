---
title: Next.js Server vs Client Components
---

# Next.js Server vs Client Components

Knowing when to use Server vs Client Components is one of the most important decisions in Next.js development. This lesson provides a clear decision guide.

## Quick comparison

| Feature | Server Component | Client Component |
|---------|-----------------|-----------------|
| Directive | None (default) | `"use client"` |
| Runs on | Server only | Server (pre-render) + Client (hydrate) |
| `async` component | Yes | No |
| `useState` / `useEffect` | No | Yes |
| Event handlers | No | Yes |
| Browser APIs | No | Yes |
| Direct DB/file access | Yes | No |
| Secrets safe | Yes | No |
| JS in bundle | No | Yes |

## Decision flowchart

Ask yourself these questions in order:

```
Does this component need interactivity?
(onClick, onChange, useState, useEffect)
  ├── YES → Client Component ("use client")
  └── NO → Does it need browser APIs?
            (localStorage, window, navigator)
            ├── YES → Client Component
            └── NO → Server Component (default) ✅
```

## When to use Server Components

- Fetching data (database, API, file system)
- Accessing secrets and backend resources
- Rendering static or data-driven content
- Heavy dependencies that don't need to reach the browser

```javascript
// Server Component — perfect use case
import { db } from "@/lib/db";

export default async function RecentPosts() {
  const posts = await db.post.findMany({
    take: 10,
    orderBy: { createdAt: "desc" },
  });

  return (
    <section>
      <h2>Recent Posts</h2>
      {posts.map((post) => (
        <article key={post.id}>
          <h3>{post.title}</h3>
          <p>{post.excerpt}</p>
        </article>
      ))}
    </section>
  );
}
```

## When to use Client Components

- User interactions (clicks, form input, hover)
- Managing state (counters, toggles, form values)
- Side effects (timers, event listeners, subscriptions)
- Browser-specific APIs
- Third-party UI libraries (charts, maps, editors)

```javascript
"use client";

import { useState } from "react";

export default function AddToCart({ productId }) {
  const [added, setAdded] = useState(false);

  async function handleClick() {
    setAdded(true);
    await fetch("/api/cart", {
      method: "POST",
      body: JSON.stringify({ productId }),
    });
  }

  return (
    <button onClick={handleClick} disabled={added}>
      {added ? "Added ✓" : "Add to Cart"}
    </button>
  );
}
```

## Common patterns

### Pattern 1: Server page with Client islands

```javascript
// page.js (Server Component)
import { db } from "@/lib/db";
import LikeButton from "./LikeButton";     // Client
import ShareButton from "./ShareButton";     // Client
import CommentList from "./CommentList";     // Server

export default async function PostPage({ params }) {
  const { slug } = await params;
  const post = await db.post.findUnique({ where: { slug } });

  return (
    <article>
      <h1>{post.title}</h1>                       {/* Server */}
      <p>{post.content}</p>                        {/* Server */}
      <LikeButton postId={post.id} />              {/* Client island */}
      <ShareButton url={`/blog/${slug}`} />        {/* Client island */}
      <CommentList postId={post.id} />             {/* Server */}
    </article>
  );
}
```

### Pattern 2: Client wrapper with Server children

```javascript
// Tabs.js (Client Component)
"use client";

import { useState } from "react";

export default function Tabs({ tabs }) {
  const [active, setActive] = useState(0);

  return (
    <div>
      <div className="flex gap-2">
        {tabs.map((tab, i) => (
          <button key={i} onClick={() => setActive(i)}>
            {tab.label}
          </button>
        ))}
      </div>
      <div>{tabs[active].content}</div>
    </div>
  );
}
```

```javascript
// page.js (Server Component)
import Tabs from "./Tabs";

export default async function Page() {
  const stats = await getStats();

  return (
    <Tabs
      tabs={[
        { label: "Overview", content: <p>Revenue: ${stats.revenue}</p> },
        { label: "Details", content: <p>Orders: {stats.orders}</p> },
      ]}
    />
  );
}
```

### Pattern 3: Extracting interactive parts

```javascript
// ❌ Making the whole component client for one button
"use client";
export default function ProductCard({ product }) {
  return (
    <div>
      <img src={product.image} alt={product.name} />
      <h3>{product.name}</h3>
      <p>{product.description}</p>
      <p>${product.price}</p>
      <button onClick={() => addToCart(product.id)}>Add to Cart</button>
    </div>
  );
}

// ✅ Only the button is a Client Component
// ProductCard.js (Server)
import AddToCartButton from "./AddToCartButton";

export default function ProductCard({ product }) {
  return (
    <div>
      <img src={product.image} alt={product.name} />
      <h3>{product.name}</h3>
      <p>{product.description}</p>
      <p>${product.price}</p>
      <AddToCartButton productId={product.id} />
    </div>
  );
}

// AddToCartButton.js (Client)
"use client";
export default function AddToCartButton({ productId }) {
  return <button onClick={() => addToCart(productId)}>Add to Cart</button>;
}
```

## Common mistakes

### Mistake 1: Making everything a Client Component

```javascript
// ❌ Adding "use client" to pages unnecessarily
"use client"; // WHY? This page just displays data
export default function AboutPage() {
  return <h1>About Us</h1>;
}
```

### Mistake 2: Importing Server Components in Client Components

```javascript
// ❌ This makes ServerComponent a Client Component!
"use client";
import ServerComponent from "./ServerComponent";

export default function ClientPage() {
  return <ServerComponent />;
}

// ✅ Pass as children instead
"use client";
export default function ClientWrapper({ children }) {
  return <div className="animated">{children}</div>;
}
```

### Mistake 3: Using hooks in Server Components

```javascript
// ❌ Server Components can't use hooks
export default function Page() {
  const [count, setCount] = useState(0); // Error!
}
```

## Serialization rules

Props passed from Server to Client Components must be **serializable** (convertible to JSON):

```javascript
// ✅ These work as props:
string, number, boolean, null
arrays, plain objects
Date (serialized to string)

// ❌ These DON'T work:
functions, classes, Symbols
React elements (use children pattern instead)
Map, Set, WeakMap, WeakSet
```

## Key takeaways

- **Default to Server Components** — only add `"use client"` when you need interactivity.
- Push `"use client"` boundaries to the **smallest interactive pieces**.
- Use the **children pattern** to nest Server Components inside Client Components.
- Props from Server → Client must be serializable (JSON-compatible).
- One page can mix both — static content on the server, interactive bits on the client.
