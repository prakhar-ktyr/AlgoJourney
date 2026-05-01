---
title: Next.js Loading UI
---

# Next.js Loading UI

Next.js provides a built-in system for loading states using the special `loading.js` file and React Suspense. Users see instant feedback while data loads.

## The loading.js file

Create a `loading.js` file alongside your `page.js` to show a loading UI while the page loads:

```
src/app/
├── dashboard/
│   ├── page.js       ← the page (fetches data)
│   └── loading.js    ← shown while page loads
```

```javascript
// src/app/dashboard/loading.js
export default function Loading() {
  return <p>Loading dashboard...</p>;
}
```

That's it! Next.js automatically wraps your page in a `<Suspense>` boundary with `loading.js` as the fallback.

## How it works

When a user navigates to `/dashboard`, they immediately see the `loading.js` component. Once the page data is ready, it replaces the loading UI.

Under the hood, `loading.js` is equivalent to:

```javascript
// Next.js does this automatically:
<Suspense fallback={<Loading />}>
  <Page />
</Suspense>
```

## Skeleton loading UI

A better experience than "Loading..." text is a skeleton that matches the page layout:

```javascript
// src/app/dashboard/loading.js
export default function Loading() {
  return (
    <div className="animate-pulse">
      <div className="h-8 bg-gray-200 rounded w-1/3 mb-4" />
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="h-24 bg-gray-200 rounded" />
        <div className="h-24 bg-gray-200 rounded" />
        <div className="h-24 bg-gray-200 rounded" />
      </div>
      <div className="h-64 bg-gray-200 rounded" />
    </div>
  );
}
```

## Loading with layouts

Layouts render **instantly** and don't re-render during navigation. Only the page content shows the loading state:

```
src/app/dashboard/
├── layout.js       ← renders immediately (sidebar, nav)
├── loading.js      ← shown in the content area
└── page.js         ← loads with data
```

```javascript
// layout.js — always visible
export default function DashboardLayout({ children }) {
  return (
    <div className="flex">
      <nav className="w-64">Sidebar</nav>
      <main className="flex-1">{children}</main>  {/* loading.js shows here */}
    </div>
  );
}
```

## Manual Suspense boundaries

For more granular control, use `<Suspense>` directly in your page:

```javascript
import { Suspense } from "react";

export default function DashboardPage() {
  return (
    <div>
      <h1>Dashboard</h1>

      {/* Each section loads independently */}
      <Suspense fallback={<p>Loading stats...</p>}>
        <Stats />
      </Suspense>

      <Suspense fallback={<p>Loading chart...</p>}>
        <RevenueChart />
      </Suspense>

      <Suspense fallback={<p>Loading orders...</p>}>
        <RecentOrders />
      </Suspense>
    </div>
  );
}
```

Benefits:

- Each section streams in as its data becomes ready
- Fast sections appear first
- Slow sections don't block the rest

## Nested loading states

`loading.js` applies to all child routes in the folder:

```
src/app/
├── dashboard/
│   ├── loading.js       ← applies to /dashboard and children
│   ├── page.js          ← /dashboard
│   ├── analytics/
│   │   └── page.js      ← /dashboard/analytics (uses parent loading.js)
│   └── settings/
│       ├── loading.js   ← overrides for /dashboard/settings
│       └── page.js
```

## Streaming with loading.js

Next.js streams loading UI before the page is fully rendered:

```
1. User clicks a link → instant navigation
2. loading.js renders immediately (no white screen)
3. Page data fetches on the server
4. Page HTML streams in and replaces loading.js
```

This is much better than traditional SSR where the user waits for the entire page.

## Example: complete loading pattern

```javascript
// src/app/products/loading.js
export default function Loading() {
  return (
    <div>
      <div className="h-10 bg-gray-200 rounded w-48 mb-6 animate-pulse" />
      <div className="grid grid-cols-4 gap-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="h-48 bg-gray-200 rounded mb-2" />
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-1" />
            <div className="h-4 bg-gray-200 rounded w-1/2" />
          </div>
        ))}
      </div>
    </div>
  );
}
```

```javascript
// src/app/products/page.js
export default async function ProductsPage() {
  const products = await getProducts(); // takes time

  return (
    <div>
      <h1>Products</h1>
      <div className="grid grid-cols-4 gap-4">
        {products.map((p) => (
          <div key={p.id}>
            <img src={p.image} alt={p.name} />
            <h3>{p.name}</h3>
            <p>${p.price}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
```

## Key takeaways

- Create `loading.js` next to `page.js` for automatic loading UI.
- Layouts remain visible — only the content area shows the loading state.
- Use **skeleton UIs** (matching the page layout) for a better user experience.
- Use `<Suspense>` for **granular loading** of individual sections.
- Loading UI **streams instantly** — users never see a blank page.
- Nested routes inherit parent `loading.js` unless they have their own.
