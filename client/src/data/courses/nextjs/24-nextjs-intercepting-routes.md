---
title: Next.js Intercepting Routes
---

# Next.js Intercepting Routes

Intercepting routes let you load a route within the **current layout** while preserving context — like opening a photo in a modal while keeping the gallery visible. If the user refreshes or shares the URL, they see the full page.

## Convention

Use parentheses with dots to intercept routes at different levels:

| Convention | Matches |
|-----------|---------|
| `(.)route` | Same level |
| `(..)route` | One level up |
| `(..)(..)route` | Two levels up |
| `(...)route` | Root level |

## Example: photo modal

```
src/app/
├── layout.js
├── @modal/
│   ├── default.js
│   └── (.)photos/
│       └── [id]/
│           └── page.js        ← intercepted (modal view)
├── photos/
│   ├── page.js                ← gallery listing
│   └── [id]/
│       └── page.js            ← full photo page (direct URL)
```

### The gallery page

```javascript
// src/app/photos/page.js
import Link from "next/link";

export default async function PhotosPage() {
  const photos = await getPhotos();

  return (
    <div className="grid grid-cols-3 gap-4">
      {photos.map((photo) => (
        <Link key={photo.id} href={`/photos/${photo.id}`}>
          <img src={photo.thumbnail} alt={photo.title} />
        </Link>
      ))}
    </div>
  );
}
```

### The intercepted route (modal)

```javascript
// src/app/@modal/(.)photos/[id]/page.js
import { getPhoto } from "@/lib/data";

export default async function PhotoModal({ params }) {
  const { id } = await params;
  const photo = await getPhoto(id);

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-4 max-w-2xl">
        <img src={photo.url} alt={photo.title} />
        <h2>{photo.title}</h2>
      </div>
    </div>
  );
}
```

### The full page (direct access or refresh)

```javascript
// src/app/photos/[id]/page.js
import { getPhoto } from "@/lib/data";

export default async function PhotoPage({ params }) {
  const { id } = await params;
  const photo = await getPhoto(id);

  return (
    <div className="max-w-4xl mx-auto p-8">
      <img src={photo.url} alt={photo.title} className="w-full" />
      <h1>{photo.title}</h1>
      <p>{photo.description}</p>
    </div>
  );
}
```

### The layout

```javascript
// src/app/layout.js
export default function RootLayout({ children, modal }) {
  return (
    <html>
      <body>
        {children}
        {modal}
      </body>
    </html>
  );
}
```

### Default modal (no modal)

```javascript
// src/app/@modal/default.js
export default function Default() {
  return null;
}
```

## How it works

1. **Client navigation** (clicking a `<Link>`): The route is **intercepted**. The modal version renders in the `@modal` slot while the gallery stays visible underneath.

2. **Direct URL access** (typing URL or refreshing): The route is **not intercepted**. The full `/photos/[id]/page.js` renders normally.

3. **Shared URLs**: When someone shares `/photos/123`, they see the full page — not the modal.

## Closing the modal

Use `useRouter` to navigate back:

```javascript
"use client";

import { useRouter } from "next/navigation";

export default function Modal({ children }) {
  const router = useRouter();

  return (
    <div className="fixed inset-0 bg-black/50 z-50" onClick={() => router.back()}>
      <div className="bg-white rounded-lg p-6 mx-auto mt-20 max-w-lg" onClick={(e) => e.stopPropagation()}>
        {children}
      </div>
    </div>
  );
}
```

## Common use cases

| Use case | Pattern |
|----------|---------|
| Photo gallery modal | `@modal/(.)photos/[id]` |
| Login modal | `@modal/(.)login` |
| Quick product preview | `@modal/(.)products/[id]` |
| Settings modal | `@modal/(..)settings` |

## Key takeaways

- Intercepting routes load a route in the **current layout** (like a modal).
- Use `(.)`, `(..)`, `(..)(..)`, or `(...)` to match route depth.
- Combine with **parallel routes** (`@modal`) for overlay patterns.
- **Client navigation** → intercepted (modal). **Direct URL** → full page.
- The user always gets a shareable URL that works standalone.
