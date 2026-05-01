---
title: Next.js Pages & Routing
---

# Next.js Pages & Routing

Next.js uses **file-based routing** — create a file, get a URL. No router configuration needed. The folder structure inside `app/` directly maps to your application's URL paths.

## How routing works

Every folder inside `app/` becomes a **route segment**. A route is publicly accessible when it contains a `page.js` file:

```
src/app/
├── page.js              → /
├── about/
│   └── page.js          → /about
├── blog/
│   └── page.js          → /blog
└── contact/
    └── page.js          → /contact
```

**Folders without `page.js` are NOT routes** — they're just organizational containers.

## Creating pages

### Home page

```javascript
// src/app/page.js
export default function HomePage() {
  return (
    <main>
      <h1>Welcome Home</h1>
      <p>This is the home page.</p>
    </main>
  );
}
```

### About page

```javascript
// src/app/about/page.js
export default function AboutPage() {
  return (
    <main>
      <h1>About Us</h1>
      <p>Learn more about our company.</p>
    </main>
  );
}
```

### Nested routes

```
src/app/
└── blog/
    ├── page.js           → /blog
    └── categories/
        └── page.js       → /blog/categories
```

```javascript
// src/app/blog/page.js
export default function BlogPage() {
  return <h1>All Blog Posts</h1>;
}

// src/app/blog/categories/page.js
export default function CategoriesPage() {
  return <h1>Blog Categories</h1>;
}
```

## Dynamic routes

Use square brackets `[]` for dynamic segments — parts of the URL that change:

```
src/app/
└── blog/
    ├── page.js              → /blog
    └── [slug]/
        └── page.js          → /blog/my-first-post, /blog/hello-world
```

```javascript
// src/app/blog/[slug]/page.js
export default async function BlogPost({ params }) {
  const { slug } = await params;

  return (
    <article>
      <h1>Blog Post: {slug}</h1>
    </article>
  );
}
```

The `params` object contains the dynamic segment values:

| URL | `params.slug` |
|-----|-------------|
| `/blog/hello-world` | `"hello-world"` |
| `/blog/my-first-post` | `"my-first-post"` |
| `/blog/nextjs-guide` | `"nextjs-guide"` |

### Multiple dynamic segments

```
src/app/shop/[category]/[product]/page.js
→ /shop/electronics/laptop
```

```javascript
// src/app/shop/[category]/[product]/page.js
export default async function ProductPage({ params }) {
  const { category, product } = await params;

  return (
    <div>
      <p>Category: {category}</p>
      <p>Product: {product}</p>
    </div>
  );
}
```

## Catch-all routes

### `[...slug]` — catch-all (required)

Matches one or more segments:

```
src/app/docs/[...slug]/page.js
```

| URL | `params.slug` |
|-----|-------------|
| `/docs/getting-started` | `["getting-started"]` |
| `/docs/api/reference` | `["api", "reference"]` |
| `/docs/a/b/c` | `["a", "b", "c"]` |
| `/docs` | **404** (no match — at least one segment required) |

```javascript
export default async function DocsPage({ params }) {
  const { slug } = await params;
  // slug is an array: ["api", "reference"]

  return <h1>Docs: {slug.join(" / ")}</h1>;
}
```

### `[[...slug]]` — optional catch-all

Matches zero or more segments:

```
src/app/docs/[[...slug]]/page.js
```

| URL | `params.slug` |
|-----|-------------|
| `/docs` | `undefined` |
| `/docs/getting-started` | `["getting-started"]` |
| `/docs/api/reference` | `["api", "reference"]` |

## Page props

Every page component receives two props:

```javascript
export default async function Page({ params, searchParams }) {
  const { id } = await params;
  const { sort, page } = await searchParams;

  // URL: /products/42?sort=price&page=2
  // params: { id: "42" }
  // searchParams: { sort: "price", page: "2" }
}
```

| Prop | Contains | Example |
|------|----------|---------|
| `params` | Dynamic route segments | `{ slug: "hello" }` |
| `searchParams` | Query string parameters | `{ sort: "date", page: "1" }` |

## Page metadata

Set the page title and description with the `metadata` export:

```javascript
// src/app/about/page.js
export const metadata = {
  title: "About Us",
  description: "Learn more about our company",
};

export default function AboutPage() {
  return <h1>About Us</h1>;
}
```

### Dynamic metadata

```javascript
// src/app/blog/[slug]/page.js
export async function generateMetadata({ params }) {
  const { slug } = await params;
  const post = await getPost(slug);

  return {
    title: post.title,
    description: post.excerpt,
  };
}
```

## Linking between pages

Use the `Link` component (covered in detail in the next lesson):

```javascript
import Link from "next/link";

export default function HomePage() {
  return (
    <nav>
      <Link href="/about">About</Link>
      <Link href="/blog">Blog</Link>
      <Link href="/blog/hello-world">First Post</Link>
    </nav>
  );
}
```

## Route examples

Here's a quick reference of common routing patterns:

| Folder structure | URL | `params` |
|-----------------|-----|----------|
| `app/page.js` | `/` | — |
| `app/about/page.js` | `/about` | — |
| `app/blog/[slug]/page.js` | `/blog/hello` | `{ slug: "hello" }` |
| `app/shop/[...slug]/page.js` | `/shop/a/b/c` | `{ slug: ["a","b","c"] }` |
| `app/docs/[[...slug]]/page.js` | `/docs` or `/docs/a/b` | `{ slug: undefined }` or `{ slug: ["a","b"] }` |
| `app/(marketing)/pricing/page.js` | `/pricing` | — |

## Key takeaways

- **File-based routing**: folder structure = URL structure.
- A route exists only when a folder contains `page.js`.
- Use `[slug]` for dynamic segments, `[...slug]` for catch-all, `[[...slug]]` for optional catch-all.
- Pages receive `params` (dynamic segments) and `searchParams` (query string).
- Export `metadata` for SEO (static or dynamic via `generateMetadata`).
