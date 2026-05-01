---
title: Next.js Getting Started
---

# Next.js Getting Started

Let's create your first Next.js application. You'll have a running app in under a minute.

## Requirements

- **Node.js 18.17** or later (check with `node -v`)
- **npm**, **yarn**, **pnpm**, or **bun** as your package manager
- A code editor (VS Code recommended)

## Creating a new project

The easiest way to start is with `create-next-app`:

```bash
npx create-next-app@latest my-app
```

The CLI will ask you a few questions:

```
Would you like to use TypeScript? › No
Would you like to use ESLint? › Yes
Would you like to use Tailwind CSS? › Yes
Would you like your code inside a `src/` directory? › Yes
Would you like to use App Router? (recommended) › Yes
Would you like to use Turbopack for next dev? › Yes
Would you like to customize the import alias? › No
```

**Recommended answers** for this course: App Router = Yes, src/ directory = Yes, Tailwind = Yes.

## Starting the dev server

```bash
cd my-app
npm run dev
```

Open **http://localhost:3000** in your browser. You'll see the default Next.js welcome page.

The dev server supports **hot module replacement (HMR)** — edit a file and the browser updates instantly without a full reload.

## Project files overview

After creation, your project looks like this:

```
my-app/
├── public/            # Static files (images, favicon)
│   ├── file.svg
│   ├── globe.svg
│   ├── next.svg
│   ├── vercel.svg
│   └── window.svg
├── src/
│   └── app/           # App Router — your pages and layouts
│       ├── layout.js  # Root layout (HTML shell)
│       ├── page.js    # Home page (/)
│       ├── page.module.css
│       └── globals.css
├── .eslintrc.json
├── .gitignore
├── jsconfig.json      # Path aliases (@/ → src/)
├── next.config.mjs    # Next.js configuration
├── package.json
├── postcss.config.mjs # PostCSS config (for Tailwind)
└── tailwind.config.js
```

## Key files explained

### `src/app/layout.js` — Root layout

Every Next.js app needs a root layout. It wraps all pages:

```javascript
export const metadata = {
  title: "My App",
  description: "Built with Next.js",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
```

### `src/app/page.js` — Home page

This is your home page, rendered at `/`:

```javascript
export default function HomePage() {
  return (
    <main>
      <h1>Welcome to Next.js!</h1>
      <p>Edit src/app/page.js to get started.</p>
    </main>
  );
}
```

### `next.config.mjs` — Configuration

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {};
export default nextConfig;
```

We'll explore configuration options in detail later.

## Your first edit

Open `src/app/page.js` and replace the content:

```javascript
export default function HomePage() {
  return (
    <main style={{ padding: "2rem" }}>
      <h1>Hello, Next.js!</h1>
      <p>This is my first Next.js app.</p>
    </main>
  );
}
```

Save the file — the browser updates immediately.

## Available scripts

```json
{
  "scripts": {
    "dev": "next dev",         // Start development server
    "build": "next build",     // Create production build
    "start": "next start",     // Start production server
    "lint": "next lint"        // Run ESLint
  }
}
```

| Command | Purpose |
|---------|---------|
| `npm run dev` | Development with HMR (http://localhost:3000) |
| `npm run build` | Production build (optimized) |
| `npm start` | Serve the production build |
| `npm run lint` | Check for lint errors |

## Using Turbopack

Turbopack is Next.js's Rust-based bundler — significantly faster than Webpack:

```bash
npm run dev -- --turbopack
```

Or in your `package.json`:

```json
{
  "scripts": {
    "dev": "next dev --turbopack"
  }
}
```

## Key takeaways

- Use `create-next-app` to scaffold a new project.
- The `src/app/` directory contains your pages and layouts.
- `page.js` defines a route, `layout.js` wraps it.
- `npm run dev` starts the development server with HMR.
- Next.js uses the App Router by default — file-based routing.
