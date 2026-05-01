---
title: Next.js Dynamic Routes
---

# Next.js Dynamic Routes

Dynamic routes let you create pages for content that shares the same layout but has different data — blog posts, product pages, user profiles. Use **square brackets** in folder names to define dynamic segments.

## Basic dynamic routes

```
src/app/blog/[slug]/page.js → /blog/hello-world, /blog/my-post
```

```javascript
// src/app/blog/[slug]/page.js
export default async function BlogPost({ params }) {
  const { slug } = await params;

  return <h1>Post: {slug}</h1>;
}
```

Visiting `/blog/hello-world` renders: **Post: hello-world**

## Multiple dynamic segments

```
src/app/shop/[category]/[id]/page.js → /shop/shoes/123
```

```javascript
export default async function ProductPage({ params }) {
  const { category, id } = await params;

  return (
    <div>
      <p>Category: {category}</p>
      <p>Product ID: {id}</p>
    </div>
  );
}
```

## Catch-all segments

Use `[...slug]` to match any number of segments:

```
src/app/docs/[...slug]/page.js
```

| URL | params.slug |
|-----|------------|
| `/docs/intro` | `["intro"]` |
| `/docs/guide/setup` | `["guide", "setup"]` |
| `/docs/a/b/c` | `["a", "b", "c"]` |
| `/docs` | 404 (no match) |

```javascript
export default async function DocPage({ params }) {
  const { slug } = await params;
  // slug is an array: ["guide", "setup"]

  const path = slug.join("/");
  return <h1>Doc: {path}</h1>;
}
```

## Optional catch-all segments

Use `[[...slug]]` (double brackets) to also match the base route:

```
src/app/docs/[[...slug]]/page.js
```

| URL | params.slug |
|-----|------------|
| `/docs` | `undefined` |
| `/docs/intro` | `["intro"]` |
| `/docs/guide/setup` | `["guide", "setup"]` |

```javascript
export default async function DocPage({ params }) {
  const { slug } = await params;

  if (!slug) {
    return <h1>Documentation Home</h1>;
  }

  return <h1>Doc: {slug.join("/")}</h1>;
}
```

## Generating static params

Pre-render dynamic routes at build time:

```javascript
// src/app/blog/[slug]/page.js
export async function generateStaticParams() {
  const posts = await fetch("https://api.example.com/posts").then((r) => r.json());

  return posts.map((post) => ({
    slug: post.slug,
  }));
}

export default async function BlogPost({ params }) {
  const { slug } = await params;
  const post = await fetch(`https://api.example.com/posts/${slug}`).then((r) => r.json());

  return <h1>{post.title}</h1>;
}
```

### For catch-all routes

```javascript
export async function generateStaticParams() {
  return [
    { slug: ["intro"] },
    { slug: ["guide", "setup"] },
    { slug: ["api", "reference", "auth"] },
  ];
}
```

## Accessing params in layouts

Layouts also receive `params`:

```javascript
// src/app/blog/[slug]/layout.js
export default async function BlogLayout({ children, params }) {
  const { slug } = await params;

  return (
    <div>
      <nav>Current post: {slug}</nav>
      {children}
    </div>
  );
}
```

## Generating metadata for dynamic routes

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

## Validating params

Handle invalid params gracefully:

```javascript
import { notFound } from "next/navigation";

export default async function ProductPage({ params }) {
  const { id } = await params;
  const product = await getProduct(id);

  if (!product) {
    notFound(); // shows not-found.js
  }

  return <h1>{product.name}</h1>;
}
```

## Key takeaways

- `[param]` — matches a single segment.
- `[...param]` — matches one or more segments (catch-all).
- `[[...param]]` — matches zero or more segments (optional catch-all).
- `params` is available in `page.js`, `layout.js`, `generateMetadata`, and `generateStaticParams`.
- Always `await params` before destructuring in the App Router.
- Use `generateStaticParams` for static pre-rendering of dynamic routes.
- Use `notFound()` for invalid params.
