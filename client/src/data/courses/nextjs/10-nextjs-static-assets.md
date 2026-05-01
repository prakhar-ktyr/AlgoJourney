---
title: Next.js Static Assets
---

# Next.js Static Assets

Static assets — images, fonts, icons, PDFs, and other files — are served from the `public/` directory. Next.js makes them available at the root URL without any import or build step.

## The public directory

Files in `public/` are accessible at `/`:

```
public/
├── favicon.ico          → /favicon.ico
├── robots.txt           → /robots.txt
├── og-image.png         → /og-image.png
├── images/
│   ├── logo.svg         → /images/logo.svg
│   └── hero.jpg         → /images/hero.jpg
├── fonts/
│   └── custom.woff2     → /fonts/custom.woff2
└── downloads/
    └── resume.pdf       → /downloads/resume.pdf
```

### Using in components

```javascript
import Image from "next/image";

export default function Header() {
  return (
    <header>
      <Image src="/images/logo.svg" alt="Logo" width={120} height={40} />
    </header>
  );
}
```

```javascript
// Regular <img> tag (no optimization)
<img src="/images/logo.svg" alt="Logo" />

// Link to a file
<a href="/downloads/resume.pdf" download>Download Resume</a>
```

## Favicon and app icons

### Basic favicon

Place `favicon.ico` in `app/` (not `public/`):

```
src/app/
├── favicon.ico        # Auto-detected as favicon
├── icon.png           # App icon (also auto-detected)
├── apple-icon.png     # Apple touch icon
└── layout.js
```

Next.js automatically adds the correct `<link>` tags to `<head>`.

### Generating icons programmatically

```javascript
// src/app/icon.js
import { ImageResponse } from "next/og";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          fontSize: 24,
          background: "#000",
          color: "#fff",
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          borderRadius: "50%",
        }}
      >
        A
      </div>
    ),
    { ...size },
  );
}
```

## OpenGraph images

### Static OG image

Place `opengraph-image.png` (or `.jpg`) in any route folder:

```
src/app/
├── opengraph-image.png        # Default OG image for /
└── blog/
    └── opengraph-image.png    # OG image for /blog
```

### Dynamic OG images

```javascript
// src/app/blog/[slug]/opengraph-image.js
import { ImageResponse } from "next/og";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image({ params }) {
  const { slug } = await params;
  const post = await getPost(slug);

  return new ImageResponse(
    (
      <div
        style={{
          fontSize: 48,
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          color: "white",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: 80,
        }}
      >
        <div style={{ fontSize: 64, fontWeight: "bold", marginBottom: 20 }}>
          {post.title}
        </div>
        <div style={{ fontSize: 32, opacity: 0.8 }}>myapp.com</div>
      </div>
    ),
    { ...size },
  );
}
```

## manifest.json (PWA)

```javascript
// src/app/manifest.js
export default function manifest() {
  return {
    name: "My App",
    short_name: "MyApp",
    description: "A Next.js application",
    start_url: "/",
    display: "standalone",
    background_color: "#000000",
    theme_color: "#000000",
    icons: [
      {
        src: "/icon-192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  };
}
```

## When to use public/ vs imports

| Use `public/` | Use `import` |
|---------------|-------------|
| robots.txt, sitemap.xml | Component-specific images |
| Files that need a stable URL | Images that benefit from blur placeholder |
| PDFs, downloads | Assets processed by Webpack/Turbopack |
| Third-party scripts | Fonts via `next/font` |

### Import-based images

```javascript
import heroImage from "@/assets/hero.jpg";
import Image from "next/image";

// width, height, blurDataURL are automatic
<Image src={heroImage} alt="Hero" placeholder="blur" />
```

Imported images are **hashed** — the URL changes when the content changes, enabling long-term caching.

## Caching static assets

Files in `public/` have default caching headers. For production, assets served through `next/image` and `next/font` are automatically optimized with proper cache headers.

You can customize static asset headers in `next.config.mjs`:

```javascript
const nextConfig = {
  async headers() {
    return [
      {
        source: "/images/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
    ];
  },
};
```

## Key takeaways

- Put static files in `public/` — they're served at the root URL.
- Place `favicon.ico`, `icon.png`, and `apple-icon.png` in `app/` for automatic detection.
- Use `opengraph-image.js` for dynamic social media images.
- Create `manifest.js` for PWA support.
- Import images in components for blur placeholders and content-based hashing.
- Use `next/image` and `next/font` for automatic optimization instead of raw `public/` references.
