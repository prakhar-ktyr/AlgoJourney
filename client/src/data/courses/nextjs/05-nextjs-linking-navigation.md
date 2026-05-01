---
title: Next.js Linking & Navigation
---

# Next.js Linking & Navigation

Next.js provides built-in components and hooks for navigating between pages. Navigation is client-side by default — fast, without full page reloads.

## The Link component

The `Link` component is the primary way to navigate between routes:

```javascript
import Link from "next/link";

export default function Navigation() {
  return (
    <nav>
      <Link href="/">Home</Link>
      <Link href="/about">About</Link>
      <Link href="/blog">Blog</Link>
    </nav>
  );
}
```

`Link` renders an `<a>` tag but handles navigation client-side — the browser doesn't reload the full page.

### Link with dynamic routes

```javascript
<Link href={`/blog/${post.slug}`}>
  {post.title}
</Link>

<Link href={`/products/${product.id}`}>
  View Product
</Link>
```

### Link with an object

```javascript
<Link
  href={{
    pathname: "/blog/[slug]",
    query: { slug: "hello-world" },
  }}
>
  Hello World Post
</Link>
```

### Styling active links

`Link` doesn't have built-in active state styling. Use `usePathname` to detect the current route:

```javascript
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/blog", label: "Blog" },
];

export default function Navigation() {
  const pathname = usePathname();

  return (
    <nav className="flex gap-4">
      {navLinks.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          className={pathname === link.href ? "text-blue-500 font-bold" : "text-gray-500"}
        >
          {link.label}
        </Link>
      ))}
    </nav>
  );
}
```

## Prefetching

By default, `Link` **prefetches** linked pages when they enter the viewport. This makes navigation feel instant.

```javascript
// Prefetch is ON by default
<Link href="/about">About</Link>

// Disable prefetching
<Link href="/about" prefetch={false}>About</Link>
```

How prefetching works:

| Behavior | Production | Development |
|----------|-----------|-------------|
| Static routes | Full page prefetched | Not prefetched |
| Dynamic routes | Shared layout prefetched up to first `loading.js` | Not prefetched |

## The useRouter hook

For programmatic navigation (e.g., after form submission):

```javascript
"use client";

import { useRouter } from "next/navigation";

export default function LoginForm() {
  const router = useRouter();

  async function handleSubmit(e) {
    e.preventDefault();
    // ... login logic

    router.push("/dashboard"); // navigate to dashboard
  }

  return (
    <form onSubmit={handleSubmit}>
      {/* form fields */}
      <button type="submit">Login</button>
    </form>
  );
}
```

### Router methods

```javascript
const router = useRouter();

router.push("/dashboard");       // Navigate (adds to history)
router.replace("/dashboard");    // Navigate (replaces current history entry)
router.back();                   // Go back
router.forward();                // Go forward
router.refresh();                // Re-fetch server components (no full reload)
router.prefetch("/about");       // Manually prefetch a route
```

| Method | History | Use case |
|--------|---------|----------|
| `push` | Adds entry | Standard navigation |
| `replace` | Replaces entry | After login (prevent back to login) |
| `back` | Goes back | Back buttons |
| `refresh` | No change | Refresh server data |

## The redirect function

For server-side redirects (in Server Components or Server Actions):

```javascript
import { redirect } from "next/navigation";

export default async function ProfilePage() {
  const user = await getUser();

  if (!user) {
    redirect("/login"); // server-side redirect
  }

  return <h1>Welcome, {user.name}</h1>;
}
```

`redirect` throws an error internally, so it must be called outside of `try/catch` blocks.

### permanentRedirect

```javascript
import { permanentRedirect } from "next/navigation";

// 308 permanent redirect (for URL changes, SEO migration)
permanentRedirect("/new-url");
```

| Function | Status code | When to use |
|----------|------------|-------------|
| `redirect()` | 307 | Temporary (auth, conditions) |
| `permanentRedirect()` | 308 | Permanent (URL restructuring) |

## usePathname

Get the current URL pathname:

```javascript
"use client";

import { usePathname } from "next/navigation";

export default function Breadcrumb() {
  const pathname = usePathname();
  // pathname = "/blog/hello-world"

  const segments = pathname.split("/").filter(Boolean);

  return (
    <nav>
      {segments.map((segment, i) => (
        <span key={i}>
          {i > 0 && " / "}
          {segment}
        </span>
      ))}
    </nav>
  );
}
```

## useSearchParams

Read query string parameters:

```javascript
"use client";

import { useSearchParams } from "next/navigation";

export default function SearchResults() {
  const searchParams = useSearchParams();
  const query = searchParams.get("q");      // ?q=nextjs
  const page = searchParams.get("page");    // ?page=2

  return (
    <div>
      <p>Searching for: {query}</p>
      <p>Page: {page || 1}</p>
    </div>
  );
}
```

### Updating search params

```javascript
"use client";

import { useSearchParams, useRouter, usePathname } from "next/navigation";

export default function Filters() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  function updateFilter(key, value) {
    const params = new URLSearchParams(searchParams);
    params.set(key, value);
    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <div>
      <button onClick={() => updateFilter("sort", "price")}>
        Sort by Price
      </button>
      <button onClick={() => updateFilter("sort", "date")}>
        Sort by Date
      </button>
    </div>
  );
}
```

## Navigation events

Track route changes:

```javascript
"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

export default function Analytics() {
  const pathname = usePathname();

  useEffect(() => {
    // Runs on every route change
    console.log("Page view:", pathname);
    // trackPageView(pathname);
  }, [pathname]);

  return null;
}
```

## Scroll behavior

By default, Next.js scrolls to the top on navigation. To scroll to a specific element:

```javascript
// Scroll to section
<Link href="/page#section-2">Go to Section 2</Link>
```

Disable scroll-to-top:

```javascript
<Link href="/about" scroll={false}>About</Link>

// Or with router
router.push("/about", { scroll: false });
```

## Summary of navigation tools

| Tool | Type | Use case |
|------|------|----------|
| `<Link>` | Component | Declarative navigation (links) |
| `useRouter()` | Client hook | Programmatic navigation |
| `redirect()` | Server function | Server-side redirects |
| `usePathname()` | Client hook | Read current path |
| `useSearchParams()` | Client hook | Read query params |

## Key takeaways

- Use `<Link>` for navigation — it prefetches and navigates client-side.
- Use `useRouter().push()` for programmatic navigation (after form submit, etc.).
- Use `redirect()` in Server Components for server-side redirects.
- Use `usePathname()` and `useSearchParams()` to read the current URL.
- All navigation hooks require `"use client"` at the top of the file.
