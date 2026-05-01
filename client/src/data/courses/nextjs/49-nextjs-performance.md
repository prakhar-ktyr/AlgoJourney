---
title: Next.js Performance
---

# Next.js Performance

Next.js includes many performance optimizations by default. This lesson covers how to analyze and further improve your application's performance.

## Built-in optimizations

Next.js automatically handles:

- **Code splitting**: each page loads only the JavaScript it needs
- **Prefetching**: `<Link>` components prefetch linked pages
- **Image optimization**: `next/image` resizes and serves modern formats
- **Font optimization**: `next/font` eliminates layout shift
- **Static rendering**: pages are pre-rendered when possible

## Bundle analysis

Inspect your JavaScript bundles:

```bash
npm install @next/bundle-analyzer
```

```javascript
// next.config.js
import bundleAnalyzer from "@next/bundle-analyzer";

const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === "true",
});

const nextConfig = {};

export default withBundleAnalyzer(nextConfig);
```

```bash
ANALYZE=true npm run build
```

This opens a visual treemap of your bundles showing what's taking space.

## Lazy loading

### Dynamic imports for components

```javascript
import dynamic from "next/dynamic";

// Loaded only when rendered
const HeavyChart = dynamic(() => import("./HeavyChart"), {
  loading: () => <p>Loading chart...</p>,
});

export default function Dashboard() {
  return (
    <div>
      <h1>Dashboard</h1>
      <HeavyChart />
    </div>
  );
}
```

### Skip SSR for client-only components

```javascript
const MapComponent = dynamic(() => import("./Map"), {
  ssr: false, // only loads in the browser
  loading: () => <div className="h-96 bg-gray-200 animate-pulse" />,
});
```

### Lazy load on interaction

```javascript
"use client";

import { useState } from "react";
import dynamic from "next/dynamic";

const Editor = dynamic(() => import("./RichTextEditor"));

export default function Page() {
  const [showEditor, setShowEditor] = useState(false);

  return (
    <div>
      <button onClick={() => setShowEditor(true)}>Open Editor</button>
      {showEditor && <Editor />}
    </div>
  );
}
```

## Image optimization

```javascript
import Image from "next/image";

export default function Hero() {
  return (
    <Image
      src="/hero.jpg"
      alt="Hero"
      width={1200}
      height={600}
      priority          // preload above-the-fold images
      placeholder="blur" // show blur while loading
      blurDataURL="..."  // base64 blur placeholder
    />
  );
}
```

Key props:

- `priority`: preload images above the fold
- `loading="lazy"`: default for below-the-fold images
- `sizes`: help the browser choose the right image size
- `placeholder="blur"`: smooth loading experience

## Font optimization

```javascript
import { Inter } from "next/font/google";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",  // prevent layout shift
});

export default function Layout({ children }) {
  return <body className={inter.className}>{children}</body>;
}
```

## Minimizing client-side JavaScript

```
1. Default to Server Components (no JS shipped)
2. Push "use client" to leaf components
3. Lazy load heavy client components
4. Avoid importing large libraries in Client Components
```

## Route segment config

```javascript
// Force static for better performance
export const dynamic = "force-static";

// Set revalidation for ISR
export const revalidate = 3600;

// Prefer Edge for lightweight pages
export const runtime = "edge";
```

## Measuring performance

### Web Vitals

```javascript
// src/app/layout.js
import { SpeedInsights } from "@vercel/speed-insights/next";

export default function Layout({ children }) {
  return (
    <html>
      <body>
        {children}
        <SpeedInsights />
      </body>
    </html>
  );
}
```

### Custom reporting

```javascript
// src/app/layout.js
export function reportWebVitals(metric) {
  console.log(metric.name, metric.value);
  // Send to your analytics service
}
```

## Performance checklist

- [ ] Use Server Components by default
- [ ] Add `priority` to above-the-fold images
- [ ] Use `next/font` for custom fonts
- [ ] Lazy load heavy components with `dynamic()`
- [ ] Analyze bundles periodically with `@next/bundle-analyzer`
- [ ] Minimize `"use client"` boundaries
- [ ] Use `<Suspense>` for streaming
- [ ] Set appropriate `revalidate` values for caching
- [ ] Use `sizes` prop on responsive images

## Key takeaways

- Next.js optimizes code splitting, prefetching, images, and fonts automatically.
- Use `@next/bundle-analyzer` to find large dependencies.
- Lazy load components with `dynamic()` — especially heavy libraries.
- Server Components ship **zero JavaScript** — use them by default.
- Add `priority` to above-the-fold images, lazy load everything else.
- Measure performance with Web Vitals.
