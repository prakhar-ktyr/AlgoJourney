---
title: Next.js URL State
---

# Next.js URL State

Using the URL to store state is a powerful pattern in Next.js. Search params, query strings, and URL segments make state **shareable**, **bookmarkable**, and **server-renderable**.

## Reading searchParams in Server Components

```javascript
// src/app/products/page.js
// URL: /products?category=shoes&sort=price

export default async function ProductsPage({ searchParams }) {
  const { category, sort } = await searchParams;

  const products = await getProducts({ category, sort });

  return (
    <div>
      <h1>Products {category ? `— ${category}` : ""}</h1>
      <ul>
        {products.map((p) => (
          <li key={p.id}>{p.name}</li>
        ))}
      </ul>
    </div>
  );
}
```

> **Note**: Using `searchParams` makes the page dynamic (SSR).

## Reading searchParams in Client Components

Use the `useSearchParams` hook:

```javascript
"use client";

import { useSearchParams, useRouter, usePathname } from "next/navigation";

export default function Filters() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const category = searchParams.get("category") || "all";

  function setCategory(value) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("category", value);
    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <select value={category} onChange={(e) => setCategory(e.target.value)}>
      <option value="all">All</option>
      <option value="shoes">Shoes</option>
      <option value="clothing">Clothing</option>
    </select>
  );
}
```

## Building URL state helpers

```javascript
"use client";

import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { useCallback } from "react";

export function useQueryState(key, defaultValue = "") {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const value = searchParams.get(key) || defaultValue;

  const setValue = useCallback(
    (newValue) => {
      const params = new URLSearchParams(searchParams.toString());
      if (newValue) {
        params.set(key, newValue);
      } else {
        params.delete(key);
      }
      router.push(`${pathname}?${params.toString()}`);
    },
    [key, searchParams, router, pathname]
  );

  return [value, setValue];
}
```

Usage:

```javascript
"use client";

import { useQueryState } from "@/lib/hooks";

export default function SearchFilter() {
  const [query, setQuery] = useQueryState("q");
  const [sort, setSort] = useQueryState("sort", "newest");

  return (
    <div>
      <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search..." />
      <select value={sort} onChange={(e) => setSort(e.target.value)}>
        <option value="newest">Newest</option>
        <option value="price">Price</option>
      </select>
    </div>
  );
}
```

## Updating search params without navigation

Use `router.replace` instead of `router.push` to avoid adding history entries:

```javascript
// Adds to browser history (back button goes to previous params)
router.push(`${pathname}?${params.toString()}`);

// Replaces current history entry (cleaner for filters)
router.replace(`${pathname}?${params.toString()}`);
```

## Link-based URL state

```javascript
import Link from "next/link";

export default function CategoryNav() {
  const categories = ["all", "shoes", "clothing", "accessories"];

  return (
    <nav className="flex gap-2">
      {categories.map((cat) => (
        <Link key={cat} href={`/products?category=${cat}`}>
          {cat}
        </Link>
      ))}
    </nav>
  );
}
```

## Pagination with URL state

```javascript
// src/app/blog/page.js
export default async function BlogPage({ searchParams }) {
  const { page } = await searchParams;
  const currentPage = Number(page) || 1;
  const perPage = 10;

  const { posts, total } = await getPosts({
    skip: (currentPage - 1) * perPage,
    take: perPage,
  });

  const totalPages = Math.ceil(total / perPage);

  return (
    <div>
      <ul>
        {posts.map((p) => <li key={p.id}>{p.title}</li>)}
      </ul>
      <div className="flex gap-2">
        {currentPage > 1 && (
          <Link href={`/blog?page=${currentPage - 1}`}>Previous</Link>
        )}
        {currentPage < totalPages && (
          <Link href={`/blog?page=${currentPage + 1}`}>Next</Link>
        )}
      </div>
    </div>
  );
}
```

## Key takeaways

- Use `searchParams` prop in Server Components to read query strings.
- Use `useSearchParams` hook in Client Components.
- URL state is **shareable**, **bookmarkable**, and works with SSR.
- Use `router.replace` for filters to avoid polluting browser history.
- Build custom hooks like `useQueryState` for reusable URL state management.
- Using `searchParams` makes a page dynamic (server-rendered per request).
