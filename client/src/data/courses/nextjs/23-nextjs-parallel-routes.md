---
title: Next.js Parallel Routes
---

# Next.js Parallel Routes

Parallel routes let you render **multiple pages simultaneously** in the same layout — like a dashboard with independently loading sections, or a modal overlaying a page.

## What are parallel routes?

Parallel routes are defined using **named slots** with the `@` prefix:

```
src/app/dashboard/
├── layout.js
├── page.js              ← default content
├── @analytics/
│   └── page.js          ← analytics slot
├── @team/
│   └── page.js          ← team slot
└── @revenue/
    └── page.js          ← revenue slot
```

## Using slots in a layout

Each `@slot` folder becomes a prop in the layout:

```javascript
// src/app/dashboard/layout.js
export default function DashboardLayout({
  children,     // default page.js
  analytics,    // @analytics/page.js
  team,         // @team/page.js
  revenue,      // @revenue/page.js
}) {
  return (
    <div>
      <h1>Dashboard</h1>
      <div className="grid grid-cols-2 gap-4">
        <div>{analytics}</div>
        <div>{revenue}</div>
      </div>
      <div>{team}</div>
      <div>{children}</div>
    </div>
  );
}
```

## Independent loading states

Each slot can have its own `loading.js`:

```
src/app/dashboard/
├── layout.js
├── @analytics/
│   ├── page.js
│   └── loading.js     ← loading for analytics only
├── @team/
│   ├── page.js
│   └── loading.js     ← loading for team only
```

Each section loads independently — fast sections appear first.

```javascript
// @analytics/loading.js
export default function AnalyticsLoading() {
  return <div className="h-48 bg-gray-200 animate-pulse rounded" />;
}
```

## Independent error handling

Each slot can have its own `error.js`:

```
src/app/dashboard/
├── @analytics/
│   ├── page.js
│   └── error.js      ← error boundary for analytics only
├── @team/
│   ├── page.js
│   └── error.js      ← error boundary for team only
```

If analytics fails, the rest of the dashboard still works.

## Conditional rendering

Render different slots based on conditions:

```javascript
export default function Layout({ children, admin, user }) {
  const role = getCurrentRole();

  return (
    <div>
      {role === "admin" ? admin : user}
      {children}
    </div>
  );
}
```

## default.js for unmatched routes

When navigating to a sub-route, some slots may not have a matching page. Provide a `default.js` to avoid 404:

```
src/app/dashboard/
├── layout.js
├── page.js
├── @analytics/
│   ├── page.js            ← /dashboard
│   └── default.js         ← fallback for sub-routes
├── @team/
│   ├── page.js
│   └── default.js
└── settings/
    └── page.js            ← /dashboard/settings
```

```javascript
// @analytics/default.js
export default function AnalyticsDefault() {
  return null; // or a placeholder
}
```

## Modals with parallel routes

A common pattern — show a modal that overlays the current page:

```
src/app/
├── layout.js
├── page.js                    ← /
├── @modal/
│   ├── default.js             ← no modal by default
│   └── login/
│       └── page.js            ← /login shows as modal
└── login/
    └── page.js                ← /login as standalone page
```

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

```javascript
// src/app/@modal/default.js
export default function Default() {
  return null; // no modal shown
}
```

```javascript
// src/app/@modal/login/page.js
export default function LoginModal() {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg">
        <h2>Login</h2>
        <form>{/* login form */}</form>
      </div>
    </div>
  );
}
```

When navigating via `<Link>`, the modal overlays the page. When accessing `/login` directly, the standalone page renders.

## Key takeaways

- Parallel routes use `@slot` folders to render multiple pages simultaneously.
- Slots become **props** in the parent layout.
- Each slot has **independent** loading, error, and rendering states.
- Use `default.js` for slots that don't match the current sub-route.
- Parallel routes enable modals, conditional layouts, and complex dashboards.
- Slots don't affect the URL structure.
