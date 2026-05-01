---
title: Next.js Error Handling
---

# Next.js Error Handling

Next.js uses the special `error.js` file to create automatic error boundaries for your routes. When something goes wrong, users see a helpful error page instead of a crash.

## The error.js file

```
src/app/
├── dashboard/
│   ├── page.js       ← throws an error
│   ├── error.js      ← catches it
│   └── loading.js
```

```javascript
"use client"; // error.js MUST be a Client Component

export default function Error({ error, reset }) {
  return (
    <div>
      <h2>Something went wrong!</h2>
      <p>{error.message}</p>
      <button onClick={() => reset()}>Try again</button>
    </div>
  );
}
```

`error.js` must be a Client Component because error boundaries are a client-side React feature.

### Props

| Prop | Type | Description |
|------|------|-------------|
| `error` | `Error` | The error that was thrown |
| `reset` | `function` | Retry rendering the segment |

## How it works

```
layout.js
├── error.js (wraps page as an error boundary)
│   └── page.js (if this throws → error.js catches it)
```

Important: `error.js` does **not** catch errors from the `layout.js` in the **same** folder. To catch layout errors, place `error.js` in the **parent** folder.

## Handling different error types

```javascript
"use client";

import { useEffect } from "react";

export default function Error({ error, reset }) {
  useEffect(() => {
    // Log to an error reporting service
    console.error(error);
  }, [error]);

  return (
    <div className="p-8 text-center">
      <h2 className="text-2xl font-bold mb-4">Something went wrong</h2>
      <p className="text-gray-600 mb-4">{error.message}</p>
      <button
        onClick={() => reset()}
        className="px-4 py-2 bg-blue-600 text-white rounded"
      >
        Try again
      </button>
    </div>
  );
}
```

## Nested error boundaries

Errors bubble up to the nearest `error.js`:

```
src/app/
├── error.js                    ← catches errors for all routes
├── dashboard/
│   ├── error.js                ← catches errors for /dashboard/*
│   ├── page.js
│   └── settings/
│       └── page.js             ← error here → caught by dashboard/error.js
```

## Global error handling

To catch errors in the **root layout**, use `global-error.js`:

```javascript
// src/app/global-error.js
"use client";

export default function GlobalError({ error, reset }) {
  return (
    <html>
      <body>
        <h2>Something went wrong!</h2>
        <button onClick={() => reset()}>Try again</button>
      </body>
    </html>
  );
}
```

`global-error.js` must render its own `<html>` and `<body>` tags because it replaces the root layout when active.

## The not-found.js file

For 404 errors, use `not-found.js`:

```javascript
// src/app/not-found.js
export default function NotFound() {
  return (
    <div>
      <h2>Page Not Found</h2>
      <p>The page you're looking for doesn't exist.</p>
    </div>
  );
}
```

Trigger it programmatically with `notFound()`:

```javascript
import { notFound } from "next/navigation";

export default async function PostPage({ params }) {
  const { slug } = await params;
  const post = await getPost(slug);

  if (!post) {
    notFound(); // renders the nearest not-found.js
  }

  return <h1>{post.title}</h1>;
}
```

## Error handling in Server Components

Throw errors in Server Components — they're caught by `error.js`:

```javascript
// src/app/products/[id]/page.js
export default async function ProductPage({ params }) {
  const { id } = await params;
  const res = await fetch(`https://api.example.com/products/${id}`);

  if (!res.ok) {
    throw new Error(`Product not found: ${res.status}`);
  }

  const product = await res.json();
  return <h1>{product.name}</h1>;
}
```

## Error handling in data fetching

```javascript
// src/lib/data.js
export async function getProduct(id) {
  const res = await fetch(`https://api.example.com/products/${id}`, {
    next: { revalidate: 3600 },
  });

  if (res.status === 404) return null;
  if (!res.ok) throw new Error("Failed to fetch product");

  return res.json();
}
```

```javascript
// page.js
import { notFound } from "next/navigation";
import { getProduct } from "@/lib/data";

export default async function Page({ params }) {
  const { id } = await params;
  const product = await getProduct(id);

  if (!product) notFound();

  return <h1>{product.name}</h1>;
}
```

## Error handling in Server Actions

```javascript
"use server";

export async function createPost(formData) {
  const title = formData.get("title");

  if (!title) {
    return { error: "Title is required" };
  }

  try {
    await db.post.create({ data: { title } });
    return { success: true };
  } catch (e) {
    return { error: "Failed to create post" };
  }
}
```

## Key takeaways

- Create `error.js` (must be `"use client"`) to catch errors in routes.
- `error.js` catches errors from `page.js` in the same folder and all child segments.
- It does **not** catch errors from `layout.js` in the same folder — use a parent `error.js`.
- Use `global-error.js` for root layout errors.
- Use `not-found.js` + `notFound()` for 404 pages.
- The `reset()` function retries the failed segment.
- Return error objects from Server Actions instead of throwing.
