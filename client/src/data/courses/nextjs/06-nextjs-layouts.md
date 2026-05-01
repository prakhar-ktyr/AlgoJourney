---
title: Next.js Layouts
---

# Next.js Layouts

Layouts let you share UI between multiple pages — navigation bars, sidebars, footers. In Next.js, layouts are **preserved across navigations** — they don't re-render when you switch between child pages.

## Root layout (required)

Every Next.js app needs a root layout at `app/layout.js`. It must include `<html>` and `<body>` tags:

```javascript
// src/app/layout.js
export const metadata = {
  title: "My App",
  description: "A Next.js application",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <header>
          <nav>My App</nav>
        </header>
        <main>{children}</main>
        <footer>© 2024 My App</footer>
      </body>
    </html>
  );
}
```

The `children` prop is the page content — it changes as you navigate. The header and footer persist.

## Nested layouts

Create layouts for specific sections by adding `layout.js` in subdirectories:

```
src/app/
├── layout.js              # Root layout (navbar, footer)
├── page.js                # Home page
└── dashboard/
    ├── layout.js          # Dashboard layout (sidebar)
    ├── page.js            # Dashboard home
    ├── analytics/
    │   └── page.js        # Analytics page
    └── settings/
        └── page.js        # Settings page
```

```javascript
// src/app/dashboard/layout.js
export default function DashboardLayout({ children }) {
  return (
    <div className="flex">
      <aside className="w-64 bg-gray-900 min-h-screen p-4">
        <nav>
          <a href="/dashboard">Overview</a>
          <a href="/dashboard/analytics">Analytics</a>
          <a href="/dashboard/settings">Settings</a>
        </nav>
      </aside>
      <div className="flex-1 p-6">
        {children}
      </div>
    </div>
  );
}
```

When you navigate between `/dashboard/analytics` and `/dashboard/settings`, the sidebar doesn't re-render — only the `{children}` area updates.

### How nesting works

For the URL `/dashboard/settings`:

```
<RootLayout>                    ← app/layout.js
  <header>My App</header>
  <main>
    <DashboardLayout>           ← app/dashboard/layout.js
      <aside>Sidebar</aside>
      <div>
        <SettingsPage />        ← app/dashboard/settings/page.js
      </div>
    </DashboardLayout>
  </main>
  <footer>© 2024</footer>
</RootLayout>
```

Layouts nest automatically — you don't need to import parent layouts.

## Layout with metadata

Each layout can define its own metadata:

```javascript
// src/app/dashboard/layout.js
export const metadata = {
  title: {
    template: "%s | Dashboard",  // template for child pages
    default: "Dashboard",        // fallback title
  },
};

export default function DashboardLayout({ children }) {
  return <div>{children}</div>;
}
```

```javascript
// src/app/dashboard/settings/page.js
export const metadata = {
  title: "Settings", // becomes "Settings | Dashboard"
};
```

## Layout vs Template

| Feature | `layout.js` | `template.js` |
|---------|------------|---------------|
| Re-renders on navigation | No (state preserved) | Yes (fresh instance) |
| State | Maintained | Reset |
| Effects | Don't re-run | Re-run on every navigation |
| Use case | Persistent UI (nav, sidebar) | Per-page animations, analytics |

### Template example

```javascript
// src/app/blog/template.js
"use client";

import { useEffect } from "react";

export default function BlogTemplate({ children }) {
  useEffect(() => {
    // Runs every time a blog page is visited
    console.log("Blog page viewed");
  });

  return <div className="animate-fade-in">{children}</div>;
}
```

## Route group layouts

Use route groups to apply different layouts to different sections without affecting URLs:

```
src/app/
├── (marketing)/
│   ├── layout.js          # Marketing layout (full-width, colorful)
│   ├── page.js            # Home → /
│   ├── about/
│   │   └── page.js        # → /about
│   └── pricing/
│       └── page.js        # → /pricing
├── (app)/
│   ├── layout.js          # App layout (sidebar, minimal)
│   ├── dashboard/
│   │   └── page.js        # → /dashboard
│   └── settings/
│       └── page.js        # → /settings
└── layout.js              # Root layout (shared by all)
```

```javascript
// src/app/(marketing)/layout.js
export default function MarketingLayout({ children }) {
  return (
    <div className="max-w-6xl mx-auto">
      <nav className="bg-gradient-to-r from-blue-500 to-purple-500 p-4">
        Marketing Nav
      </nav>
      {children}
    </div>
  );
}

// src/app/(app)/layout.js
export default function AppLayout({ children }) {
  return (
    <div className="flex">
      <aside className="w-60 bg-gray-900 min-h-screen">
        App Sidebar
      </aside>
      <main className="flex-1 p-8">{children}</main>
    </div>
  );
}
```

## Passing data to layouts

Layouts **cannot** access `searchParams` or the current `pathname` directly (they're Server Components by default). Use these patterns:

### Reading params in layout

```javascript
// src/app/blog/[slug]/layout.js
export default async function BlogLayout({ children, params }) {
  const { slug } = await params;

  return (
    <div>
      <aside>Related posts for: {slug}</aside>
      {children}
    </div>
  );
}
```

### Reading pathname (Client Component)

```javascript
// src/components/Sidebar.js
"use client";

import { usePathname } from "next/navigation";

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <nav>
      <a className={pathname === "/dashboard" ? "active" : ""} href="/dashboard">
        Dashboard
      </a>
    </nav>
  );
}
```

## Common layout patterns

### Layout with providers

```javascript
// src/app/layout.js
import { ThemeProvider } from "@/components/ThemeProvider";

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
```

### Conditional layout content

```javascript
// src/app/dashboard/layout.js
import { getUser } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function DashboardLayout({ children }) {
  const user = await getUser();
  if (!user) redirect("/login");

  return (
    <div>
      <header>Welcome, {user.name}</header>
      {children}
    </div>
  );
}
```

## Key takeaways

- **Root layout** (`app/layout.js`) is required and must include `<html>` and `<body>`.
- **Nested layouts** let different sections have different wrapping UI.
- Layouts **persist across navigations** — they don't re-render when child pages change.
- Use **route groups** `()` to apply different layouts to different URL sections.
- Use `template.js` instead of `layout.js` when you need fresh renders on every navigation.
- Layouts are Server Components by default — use Client Components for interactive parts.
