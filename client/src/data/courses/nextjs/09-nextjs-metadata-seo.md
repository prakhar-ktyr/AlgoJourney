---
title: Next.js Metadata & SEO
---

# Next.js Metadata & SEO

Next.js has a powerful Metadata API that lets you define `<title>`, `<meta>`, and other `<head>` elements for every page. Good metadata improves SEO, social media sharing, and accessibility.

## Static metadata

Export a `metadata` object from any `layout.js` or `page.js`:

```javascript
// src/app/page.js
export const metadata = {
  title: "My App - Home",
  description: "Welcome to my Next.js application",
};

export default function HomePage() {
  return <h1>Home</h1>;
}
```

This generates:

```html
<head>
  <title>My App - Home</title>
  <meta name="description" content="Welcome to my Next.js application" />
</head>
```

## Dynamic metadata

Use `generateMetadata` for pages with dynamic content:

```javascript
// src/app/blog/[slug]/page.js
export async function generateMetadata({ params }) {
  const { slug } = await params;
  const post = await getPost(slug);

  return {
    title: post.title,
    description: post.excerpt,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      images: [post.coverImage],
    },
  };
}

export default async function BlogPost({ params }) {
  const { slug } = await params;
  const post = await getPost(slug);
  return <article>{post.content}</article>;
}
```

`generateMetadata` runs on the server before the page renders.

## Title templates

Define a title template in a layout, and child pages fill in the `%s` placeholder:

```javascript
// src/app/layout.js
export const metadata = {
  title: {
    template: "%s | My App",
    default: "My App",  // used when child doesn't set title
  },
  description: "A Next.js application",
};
```

```javascript
// src/app/about/page.js
export const metadata = {
  title: "About",  // renders as "About | My App"
};
```

```javascript
// src/app/blog/page.js
export const metadata = {
  title: "Blog",  // renders as "Blog | My App"
};
```

### Absolute titles

Override the template:

```javascript
export const metadata = {
  title: {
    absolute: "Custom Title", // ignores parent template
  },
};
```

## Common metadata fields

```javascript
export const metadata = {
  // Basic
  title: "Page Title",
  description: "Page description for search engines",

  // Keywords (less important for modern SEO, but still used)
  keywords: ["next.js", "react", "web development"],

  // Author
  authors: [{ name: "Your Name", url: "https://yoursite.com" }],
  creator: "Your Name",

  // Robots
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
    },
  },

  // Canonical URL
  alternates: {
    canonical: "https://myapp.com/about",
  },

  // Icons
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-icon.png",
  },
};
```

## Open Graph (social sharing)

Open Graph tags control how your page appears when shared on Facebook, LinkedIn, etc.:

```javascript
export const metadata = {
  title: "My Blog Post",
  description: "An amazing article about Next.js",
  openGraph: {
    title: "My Blog Post",
    description: "An amazing article about Next.js",
    url: "https://myapp.com/blog/my-post",
    siteName: "My App",
    type: "article",
    publishedTime: "2024-01-15T00:00:00.000Z",
    authors: ["Your Name"],
    images: [
      {
        url: "https://myapp.com/og-image.png",
        width: 1200,
        height: 630,
        alt: "Blog post cover image",
      },
    ],
    locale: "en_US",
  },
};
```

## Twitter cards

```javascript
export const metadata = {
  twitter: {
    card: "summary_large_image",
    title: "My Blog Post",
    description: "An amazing article about Next.js",
    images: ["https://myapp.com/twitter-image.png"],
    creator: "@yourhandle",
  },
};
```

| Card type | Display |
|-----------|---------|
| `summary` | Small image with title and description |
| `summary_large_image` | Large image with title and description |

## Sitemap

Create a sitemap for search engines:

```javascript
// src/app/sitemap.js
export default async function sitemap() {
  const posts = await getAllPosts();

  const blogEntries = posts.map((post) => ({
    url: `https://myapp.com/blog/${post.slug}`,
    lastModified: post.updatedAt,
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  return [
    {
      url: "https://myapp.com",
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: "https://myapp.com/about",
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.5,
    },
    ...blogEntries,
  ];
}
```

This generates `/sitemap.xml` automatically.

## robots.txt

```javascript
// src/app/robots.js
export default function robots() {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/", "/dashboard/"],
      },
    ],
    sitemap: "https://myapp.com/sitemap.xml",
  };
}
```

Generates `/robots.txt`:

```
User-Agent: *
Allow: /
Disallow: /api/
Disallow: /dashboard/
Sitemap: https://myapp.com/sitemap.xml
```

## JSON-LD structured data

Add structured data for rich search results:

```javascript
// src/app/blog/[slug]/page.js
export default async function BlogPost({ params }) {
  const { slug } = await params;
  const post = await getPost(slug);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.excerpt,
    author: {
      "@type": "Person",
      name: post.author,
    },
    datePublished: post.publishedAt,
    image: post.coverImage,
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <article>
        <h1>{post.title}</h1>
        <p>{post.content}</p>
      </article>
    </>
  );
}
```

## Metadata inheritance

Metadata merges from parent layouts to child pages:

```
app/layout.js         → title template, description, icons
  app/blog/layout.js  → overrides description
    app/blog/[slug]/page.js → overrides title, adds OpenGraph
```

Child metadata **overrides** parent metadata for the same fields. Arrays (like `openGraph.images`) are **replaced**, not merged.

## Key takeaways

- Export `metadata` (static) or `generateMetadata` (dynamic) from pages and layouts.
- Use `title.template` in layouts for consistent page titles.
- Add `openGraph` and `twitter` metadata for social media sharing.
- Create `sitemap.js` and `robots.js` for search engine crawling.
- Use JSON-LD for rich search results.
- Metadata merges from parent layouts — child values override parent values.
