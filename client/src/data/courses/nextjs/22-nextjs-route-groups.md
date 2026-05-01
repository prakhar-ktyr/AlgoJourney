---
title: Next.js Route Groups
---

# Next.js Route Groups

Route groups let you **organize routes** without affecting the URL structure. Wrap a folder name in parentheses `(groupName)` to create a route group.

## Why route groups?

- Organize routes by feature or section
- Apply different layouts to different route groups
- Keep the URL clean — group folders don't appear in the URL

## Basic route groups

```
src/app/
├── (marketing)/
│   ├── layout.js        ← marketing layout
│   ├── page.js           ← / (home)
│   ├── about/
│   │   └── page.js       ← /about
│   └── pricing/
│       └── page.js       ← /pricing
├── (dashboard)/
│   ├── layout.js        ← dashboard layout (different!)
│   ├── dashboard/
│   │   └── page.js       ← /dashboard
│   └── settings/
│       └── page.js       ← /settings
```

The `(marketing)` and `(dashboard)` folders don't appear in URLs, but each group gets its own layout.

## Different layouts per group

```javascript
// src/app/(marketing)/layout.js
export default function MarketingLayout({ children }) {
  return (
    <div>
      <header>Marketing Nav</header>
      <main>{children}</main>
      <footer>Marketing Footer</footer>
    </div>
  );
}
```

```javascript
// src/app/(dashboard)/layout.js
export default function DashboardLayout({ children }) {
  return (
    <div className="flex">
      <aside>Sidebar</aside>
      <main className="flex-1">{children}</main>
    </div>
  );
}
```

## Multiple root layouts

You can even have different root layouts:

```
src/app/
├── (marketing)/
│   ├── layout.js        ← root layout for marketing
│   └── page.js
├── (app)/
│   ├── layout.js        ← root layout for app
│   └── dashboard/
│       └── page.js
```

Each group's `layout.js` must include `<html>` and `<body>` if there's no shared root layout above them.

```javascript
// src/app/(marketing)/layout.js
export default function MarketingRootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-white">{children}</body>
    </html>
  );
}
```

```javascript
// src/app/(app)/layout.js
export default function AppRootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-gray-100">{children}</body>
    </html>
  );
}
```

## Organizing by feature

```
src/app/
├── (auth)/
│   ├── login/
│   │   └── page.js       ← /login
│   ├── register/
│   │   └── page.js       ← /register
│   └── layout.js         ← centered auth layout
├── (main)/
│   ├── page.js            ← /
│   ├── blog/
│   │   └── page.js       ← /blog
│   └── layout.js         ← standard layout with nav
```

## Route groups with loading and error

Each group can have its own `loading.js` and `error.js`:

```
src/app/
├── (shop)/
│   ├── layout.js
│   ├── loading.js       ← loading for all shop routes
│   ├── error.js         ← error boundary for all shop routes
│   ├── products/
│   │   └── page.js
│   └── cart/
│       └── page.js
```

## Key takeaways

- Wrap folder names in `()` to create route groups.
- Route groups **don't affect the URL** — they're purely organizational.
- Each group can have its own **layout**, `loading.js`, and `error.js`.
- Use groups to apply different layouts to different sections of your site.
- You can create multiple root layouts by removing the shared `app/layout.js`.
