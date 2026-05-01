---
title: Next.js CSS & Styling
---

# Next.js CSS & Styling

Next.js supports multiple styling approaches out of the box. You can use global CSS, CSS Modules, Tailwind CSS, or CSS-in-JS — pick what works best for your project.

## Global CSS

Import global styles in your root layout:

```css
/* src/app/globals.css */
*,
*::before,
*::after {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  font-family: system-ui, -apple-system, sans-serif;
  background: #0a0a0a;
  color: #ededed;
}

a {
  color: inherit;
  text-decoration: none;
}
```

```javascript
// src/app/layout.js
import "./globals.css";

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
```

Global CSS can only be imported in `layout.js` or `page.js` files inside the `app/` directory.

## CSS Modules

CSS Modules automatically scope class names to the component — no naming conflicts:

```css
/* src/app/dashboard/dashboard.module.css */
.container {
  display: flex;
  min-height: 100vh;
}

.sidebar {
  width: 250px;
  background: #1a1a2e;
  padding: 1rem;
}

.content {
  flex: 1;
  padding: 2rem;
}

.title {
  font-size: 2rem;
  font-weight: bold;
  margin-bottom: 1rem;
}
```

```javascript
// src/app/dashboard/page.js
import styles from "./dashboard.module.css";

export default function Dashboard() {
  return (
    <div className={styles.container}>
      <aside className={styles.sidebar}>
        <nav>Sidebar</nav>
      </aside>
      <main className={styles.content}>
        <h1 className={styles.title}>Dashboard</h1>
      </main>
    </div>
  );
}
```

The generated class names are unique (e.g., `dashboard_title_a1b2c`), so styles never leak between components.

### Composing styles

```css
/* button.module.css */
.base {
  padding: 0.5rem 1rem;
  border-radius: 0.5rem;
  font-weight: 600;
  cursor: pointer;
}

.primary {
  composes: base;
  background: #3b82f6;
  color: white;
}

.secondary {
  composes: base;
  background: #374151;
  color: #d1d5db;
}
```

## Tailwind CSS

Tailwind is the most popular choice with Next.js. It's included by default when you select it during `create-next-app`:

```javascript
// src/app/page.js
export default function HomePage() {
  return (
    <main className="min-h-screen bg-gray-950 text-white p-8">
      <h1 className="text-4xl font-bold mb-4">Welcome</h1>
      <p className="text-gray-400 max-w-prose">
        Build with Tailwind CSS and Next.js.
      </p>
      <button className="mt-4 px-6 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition">
        Get Started
      </button>
    </main>
  );
}
```

### Setting up Tailwind (if not already configured)

```bash
npm install -D tailwindcss @tailwindcss/postcss postcss
```

```javascript
// postcss.config.mjs
const config = {
  plugins: {
    "@tailwindcss/postcss": {},
  },
};
export default config;
```

```css
/* src/app/globals.css */
@import "tailwindcss";
```

### Tailwind with dark mode

```javascript
// tailwind.config.js
module.exports = {
  darkMode: "class", // or "media"
  content: ["./src/**/*.{js,ts,jsx,tsx}"],
};
```

```javascript
<div className="bg-white dark:bg-gray-900 text-black dark:text-white">
  Dark mode ready
</div>
```

## Conditional class names

Use template literals or the `clsx` library:

```javascript
// With template literals
<button className={`px-4 py-2 rounded ${active ? "bg-blue-600" : "bg-gray-700"}`}>
  Click
</button>
```

```bash
npm install clsx
```

```javascript
import clsx from "clsx";

<button
  className={clsx(
    "px-4 py-2 rounded font-medium",
    active && "bg-blue-600 text-white",
    !active && "bg-gray-700 text-gray-300",
    disabled && "opacity-50 cursor-not-allowed",
  )}
>
  Click
</button>
```

## CSS-in-JS

CSS-in-JS libraries like styled-components work in Next.js but require `"use client"`:

```bash
npm install styled-components
```

```javascript
"use client";

import styled from "styled-components";

const Title = styled.h1`
  font-size: 2rem;
  color: white;
  font-weight: bold;
`;

const Card = styled.div`
  background: #1a1a2e;
  border-radius: 0.5rem;
  padding: 1.5rem;
`;

export default function StyledPage() {
  return (
    <Card>
      <Title>Styled Components</Title>
    </Card>
  );
}
```

**Note**: CSS-in-JS adds client-side JavaScript. For Server Components, prefer CSS Modules or Tailwind.

## Inline styles

For dynamic values:

```javascript
export default function Progress({ percent }) {
  return (
    <div className="w-full bg-gray-800 rounded-full h-4">
      <div
        className="bg-blue-600 h-4 rounded-full transition-all"
        style={{ width: `${percent}%` }}
      />
    </div>
  );
}
```

## Comparison

| Approach | Scoping | Server Components | Bundle size | Use case |
|----------|---------|-------------------|-------------|----------|
| Global CSS | None (global) | Yes | Minimal | Base styles, resets |
| CSS Modules | Automatic | Yes | Minimal | Component-scoped styles |
| Tailwind CSS | Utility classes | Yes | Small (purged) | Most projects |
| CSS-in-JS | Automatic | No (client only) | Larger | Dynamic styles |
| Inline styles | Per element | Yes | None | Dynamic values |

## Key takeaways

- **Tailwind CSS** is the recommended default for Next.js projects.
- **CSS Modules** offer automatic scoping without any runtime cost.
- **Global CSS** goes in `globals.css`, imported in the root layout.
- Avoid CSS-in-JS in Server Components — it requires client-side JavaScript.
- Use `clsx` for conditional class names.
