---
title: Next.js Streaming
---

# Next.js Streaming

Streaming lets Next.js send HTML to the browser **progressively** — the user sees content as soon as it's ready, instead of waiting for the entire page. This dramatically improves perceived performance.

## How streaming works

Traditional SSR:

```
1. Server fetches ALL data (slow parts block fast parts)
2. Server renders ALL HTML
3. Send complete HTML to browser
4. Browser renders page
```

Streaming SSR:

```
1. Server sends the page shell immediately
2. Slow parts render in parallel on the server
3. Each part streams to the browser as it completes
4. Browser progressively fills in content
```

## Streaming with loading.js

The simplest way to stream — `loading.js` creates an automatic Suspense boundary:

```javascript
// src/app/dashboard/loading.js
export default function Loading() {
  return <div className="animate-pulse">Loading...</div>;
}
```

```javascript
// src/app/dashboard/page.js
export default async function Dashboard() {
  const data = await getSlowData(); // 3 seconds
  return <div>{data.summary}</div>;
}
```

The loading UI shows instantly while the page data streams in.

## Streaming with Suspense

For fine-grained control, use `<Suspense>` boundaries to stream individual sections:

```javascript
import { Suspense } from "react";

export default function DashboardPage() {
  return (
    <div>
      <h1>Dashboard</h1>

      {/* Fast — shows immediately */}
      <Suspense fallback={<StatsSkeleton />}>
        <Stats />
      </Suspense>

      {/* Medium speed */}
      <Suspense fallback={<ChartSkeleton />}>
        <RevenueChart />
      </Suspense>

      {/* Slow — streams in last */}
      <Suspense fallback={<TableSkeleton />}>
        <RecentOrders />
      </Suspense>
    </div>
  );
}
```

Each section is an independent streaming unit:

```
Time 0ms:   h1 + all skeletons shown
Time 200ms: Stats data arrives → replaces StatsSkeleton
Time 800ms: Chart data arrives → replaces ChartSkeleton
Time 2000ms: Orders data arrives → replaces TableSkeleton
```

## Streaming components

Any async Server Component can be streamed inside a Suspense boundary:

```javascript
async function Stats() {
  const stats = await fetch("https://api.example.com/stats", {
    cache: "no-store",
  }).then((r) => r.json());

  return (
    <div className="grid grid-cols-3 gap-4">
      <div>Revenue: ${stats.revenue}</div>
      <div>Users: {stats.users}</div>
      <div>Orders: {stats.orders}</div>
    </div>
  );
}

async function RevenueChart() {
  const data = await fetch("https://api.example.com/revenue/chart").then((r) => r.json());
  return <Chart data={data} />;
}

async function RecentOrders() {
  const orders = await fetch("https://api.example.com/orders/recent").then((r) => r.json());
  return (
    <table>
      <tbody>
        {orders.map((o) => (
          <tr key={o.id}>
            <td>{o.product}</td>
            <td>${o.total}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
```

## Nested Suspense boundaries

Suspense boundaries can be nested for complex layouts:

```javascript
<Suspense fallback={<PageSkeleton />}>
  <Suspense fallback={<HeaderSkeleton />}>
    <Header />
  </Suspense>

  <div className="flex">
    <Suspense fallback={<SidebarSkeleton />}>
      <Sidebar />
    </Suspense>

    <main>
      <Suspense fallback={<ContentSkeleton />}>
        <Content />
      </Suspense>
    </main>
  </div>
</Suspense>
```

## Parallel data fetching with streaming

Combine streaming with parallel fetching for maximum performance:

```javascript
import { Suspense } from "react";

export default function Page() {
  return (
    <div>
      {/* These fetch in parallel AND stream independently */}
      <Suspense fallback={<p>Loading user...</p>}>
        <UserProfile />      {/* fetches user data */}
      </Suspense>

      <Suspense fallback={<p>Loading feed...</p>}>
        <ActivityFeed />      {/* fetches feed data */}
      </Suspense>

      <Suspense fallback={<p>Loading recommendations...</p>}>
        <Recommendations />   {/* fetches recommendations */}
      </Suspense>
    </div>
  );
}
```

All three components start fetching at the same time and stream in as they complete.

## Skeleton components

Good skeletons match the shape of the content they'll replace:

```javascript
function StatsSkeleton() {
  return (
    <div className="grid grid-cols-3 gap-4">
      {[1, 2, 3].map((i) => (
        <div key={i} className="h-24 bg-gray-200 rounded animate-pulse" />
      ))}
    </div>
  );
}

function TableSkeleton() {
  return (
    <div className="space-y-2">
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="h-12 bg-gray-200 rounded animate-pulse" />
      ))}
    </div>
  );
}
```

## Key takeaways

- Streaming sends HTML progressively — users see content faster.
- `loading.js` provides route-level streaming automatically.
- `<Suspense>` provides **component-level** streaming for granular control.
- Each Suspense boundary is an independent streaming unit.
- Async Server Components inside Suspense fetch in **parallel**.
- Create skeleton components that match the shape of the final content.
- Streaming works with both static and dynamic rendering.
