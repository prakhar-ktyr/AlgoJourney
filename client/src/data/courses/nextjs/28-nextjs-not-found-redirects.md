---
title: Next.js Not Found and Redirects
---

# Next.js Not Found and Redirects

Next.js provides built-in tools for handling 404 pages, programmatic redirects, and URL rewrites. This lesson covers all the ways to handle missing pages and redirect users.

## The not-found.js file

Create `not-found.js` to customize the 404 page:

```javascript
// src/app/not-found.js
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="text-center py-20">
      <h1 className="text-4xl font-bold">404</h1>
      <p className="text-gray-600 mt-2">Page not found</p>
      <Link href="/" className="text-blue-600 mt-4 inline-block">
        Go home
      </Link>
    </div>
  );
}
```

## Triggering not-found programmatically

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

## Nested not-found pages

Each route segment can have its own `not-found.js`:

```
src/app/
├── not-found.js              ← default 404
├── blog/
│   ├── not-found.js          ← 404 for /blog/* routes
│   └── [slug]/
│       └── page.js
```

## Redirects

### In Server Components

```javascript
import { redirect, permanentRedirect } from "next/navigation";

export default async function OldPage() {
  redirect("/new-page");              // 307 temporary redirect
  // or
  permanentRedirect("/new-page");     // 308 permanent redirect
}
```

### In Server Actions

```javascript
"use server";

import { redirect } from "next/navigation";

export async function createPost(formData) {
  const post = await db.post.create({ data: { title: formData.get("title") } });
  redirect(`/blog/${post.slug}`);
}
```

### In Route Handlers

```javascript
import { redirect } from "next/navigation";
import { NextResponse } from "next/server";

export async function GET(request) {
  // Option 1: redirect() helper
  redirect("/dashboard");

  // Option 2: NextResponse.redirect
  return NextResponse.redirect(new URL("/dashboard", request.url));
}
```

### In Middleware

```javascript
import { NextResponse } from "next/server";

export function middleware(request) {
  if (request.nextUrl.pathname === "/old-path") {
    return NextResponse.redirect(new URL("/new-path", request.url));
  }
}
```

## Redirects in next.config.js

For static redirect mappings:

```javascript
// next.config.js
const nextConfig = {
  async redirects() {
    return [
      {
        source: "/old-blog/:slug",
        destination: "/blog/:slug",
        permanent: true,  // 308
      },
      {
        source: "/about-us",
        destination: "/about",
        permanent: false, // 307
      },
      {
        // Regex matching
        source: "/posts/:id(\\d+)",
        destination: "/blog/:id",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
```

## Rewrites in next.config.js

Rewrites map a URL to a different path without changing the URL in the browser:

```javascript
const nextConfig = {
  async rewrites() {
    return [
      {
        source: "/blog",
        destination: "/news",  // serves /news content at /blog URL
      },
      {
        // Proxy API requests
        source: "/api/external/:path*",
        destination: "https://api.example.com/:path*",
      },
    ];
  },
};
```

## Conditional redirects

```javascript
import { redirect } from "next/navigation";
import { cookies } from "next/headers";

export default async function ProtectedPage() {
  const cookieStore = await cookies();
  const session = cookieStore.get("session");

  if (!session) {
    redirect("/login");
  }

  return <h1>Protected Content</h1>;
}
```

## redirect vs permanentRedirect

| Function | Status Code | Use Case |
|----------|------------|----------|
| `redirect()` | 307 | Temporary moves, auth redirects |
| `permanentRedirect()` | 308 | URL changes, SEO migrations |

- **307**: Browser will check the redirect every time.
- **308**: Browser and search engines cache the redirect.

## Key takeaways

- Create `not-found.js` for custom 404 pages.
- Call `notFound()` to trigger the 404 page programmatically.
- Use `redirect()` for temporary redirects (307) and `permanentRedirect()` for permanent ones (308).
- Configure static redirects and rewrites in `next.config.js`.
- Middleware is best for conditional redirects (auth, locale, etc.).
- Each route segment can have its own `not-found.js`.
