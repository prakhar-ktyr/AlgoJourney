---
title: Next.js Project Structure
---

# Next.js Project Structure

Next.js uses a **convention-based** project structure. Files in specific locations have special meaning — a file named `page.js` becomes a route, `layout.js` becomes a wrapper, and `loading.js` becomes a loading state. Understanding this structure is essential.

## Top-level folders

```
my-app/
├── src/           # Optional: application source
│   └── app/       # App Router (routes, layouts, pages)
├── public/        # Static assets (served at /)
├── node_modules/  # Dependencies
└── ...config files
```

| Folder | Purpose |
|--------|---------|
| `src/app` | App Router — pages, layouts, and route handlers |
| `public` | Static files (images, fonts, robots.txt) |
| `src/lib` | Shared utility functions and libraries |
| `src/components` | Reusable React components |

## The `app/` directory

The `app/` directory is the heart of your Next.js application. Its folder structure maps directly to your URL structure:

```
src/app/
├── layout.js          # Root layout (required)
├── page.js            # Home page → /
├── globals.css        # Global styles
├── about/
│   └── page.js        # About page → /about
├── blog/
│   ├── page.js        # Blog index → /blog
│   └── [slug]/
│       └── page.js    # Blog post → /blog/my-post
├── dashboard/
│   ├── layout.js      # Dashboard layout (shared sidebar)
│   ├── page.js        # Dashboard home → /dashboard
│   └── settings/
│       └── page.js    # Settings → /dashboard/settings
└── api/
    └── users/
        └── route.js   # API endpoint → /api/users
```

## Special files

Next.js recognizes these **special filenames** in the `app/` directory:

| File | Purpose |
|------|---------|
| `page.js` | Defines a route — makes a folder publicly accessible |
| `layout.js` | Shared UI wrapper for a segment and its children |
| `loading.js` | Loading UI (shown while page data loads) |
| `error.js` | Error boundary for a segment |
| `not-found.js` | 404 UI for a segment |
| `route.js` | API endpoint (server-side route handler) |
| `template.js` | Like layout, but re-renders on navigation |
| `default.js` | Fallback for parallel routes |
| `middleware.js` | Runs before requests (at project root) |
| `global-error.js` | Global error boundary |

### How special files nest

For a route like `/dashboard/settings`, Next.js composes the UI like this:

```
<RootLayout>          ← app/layout.js
  <DashboardLayout>   ← app/dashboard/layout.js
    <Loading />        ← app/dashboard/settings/loading.js (while loading)
    <ErrorBoundary>    ← app/dashboard/settings/error.js
      <Page />         ← app/dashboard/settings/page.js
    </ErrorBoundary>
  </DashboardLayout>
</RootLayout>
```

## Colocation

You can **colocate** files alongside pages. Only `page.js` and `route.js` create public routes — other files are ignored:

```
src/app/dashboard/
├── page.js            # ✅ Route: /dashboard
├── DashboardChart.js  # ❌ Not a route (just a component)
├── helpers.js         # ❌ Not a route (utility)
├── dashboard.test.js  # ❌ Not a route (test)
└── styles.module.css  # ❌ Not a route (styles)
```

This lets you keep related files together.

## Recommended folder structure

For a medium to large app:

```
src/
├── app/                    # Routes and pages
│   ├── layout.js
│   ├── page.js
│   ├── globals.css
│   ├── (auth)/             # Route group (no URL segment)
│   │   ├── login/
│   │   │   └── page.js
│   │   └── register/
│   │       └── page.js
│   ├── (main)/             # Route group
│   │   ├── layout.js       # Layout for main pages
│   │   ├── dashboard/
│   │   │   ├── page.js
│   │   │   └── loading.js
│   │   └── settings/
│   │       └── page.js
│   └── api/
│       └── users/
│           └── route.js
├── components/             # Shared UI components
│   ├── ui/                 # Generic UI (Button, Card, Modal)
│   │   ├── Button.js
│   │   └── Card.js
│   ├── Header.js
│   └── Footer.js
├── lib/                    # Shared utilities
│   ├── db.js               # Database connection
│   ├── auth.js             # Auth helpers
│   └── utils.js            # General utilities
├── hooks/                  # Custom React hooks
│   └── useDebounce.js
├── styles/                 # Additional styles
│   └── dashboard.module.css
└── types/                  # TypeScript types (if using TS)
    └── index.d.ts
```

## Private folders

Prefix a folder with `_` to exclude it from routing:

```
src/app/
├── _components/          # Private — not a route
│   └── Header.js
├── _lib/                 # Private — not a route
│   └── helpers.js
└── page.js
```

## Route groups `()`

Folders in parentheses organize routes **without affecting the URL**:

```
src/app/
├── (marketing)/
│   ├── about/page.js     # /about (not /marketing/about)
│   └── contact/page.js   # /contact
├── (shop)/
│   ├── products/page.js  # /products
│   └── cart/page.js      # /cart
└── page.js               # /
```

Route groups can have their own layouts:

```
src/app/
├── (marketing)/
│   ├── layout.js         # Layout for marketing pages
│   └── ...
├── (shop)/
│   ├── layout.js         # Different layout for shop pages
│   └── ...
```

## Configuration files

| File | Purpose |
|------|---------|
| `next.config.mjs` | Next.js configuration |
| `package.json` | Dependencies and scripts |
| `jsconfig.json` / `tsconfig.json` | Path aliases, compiler options |
| `.eslintrc.json` | ESLint rules |
| `tailwind.config.js` | Tailwind CSS configuration |
| `postcss.config.mjs` | PostCSS plugins |
| `.env.local` | Environment variables |
| `middleware.js` | Request middleware |

## Path aliases

Next.js configures the `@/` alias by default, pointing to `src/`:

```javascript
// Instead of:
import Header from "../../../components/Header";

// Use:
import Header from "@/components/Header";
```

Configured in `jsconfig.json`:

```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

## Key takeaways

- The `app/` directory maps folders to URL routes.
- **Special files** (`page.js`, `layout.js`, `loading.js`, `error.js`) have built-in behavior.
- Only `page.js` and `route.js` create publicly accessible routes — other files are colocated safely.
- Use **route groups** `()` to organize without affecting URLs.
- Use **private folders** `_` to exclude from routing.
- Use the `@/` alias for clean imports.
