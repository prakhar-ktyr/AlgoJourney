---
title: Next.js Client Components
---

# Next.js Client Components

Client Components run in the **browser**. They enable interactivity — event handlers, state, effects, and browser APIs. Mark a component as a Client Component with the `"use client"` directive.

## The "use client" directive

```javascript
"use client";

import { useState } from "react";

export default function Counter() {
  const [count, setCount] = useState(0);

  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={() => setCount(count + 1)}>Increment</button>
    </div>
  );
}
```

`"use client"` must be at the **very top** of the file (before any imports). It tells Next.js this component and its imported dependencies should be included in the client bundle.

## When to use Client Components

Use a Client Component when you need:

| Feature | Example |
|---------|---------|
| State | `useState`, `useReducer` |
| Effects | `useEffect`, `useLayoutEffect` |
| Event handlers | `onClick`, `onChange`, `onSubmit` |
| Browser APIs | `window`, `document`, `localStorage` |
| Custom hooks with state | `useDebounce`, `useMediaQuery` |
| Third-party libraries | Charting, animation, rich text editors |
| `ref` | `useRef` for DOM access |

## Examples

### Form with state

```javascript
"use client";

import { useState } from "react";

export default function SearchBar() {
  const [query, setQuery] = useState("");

  return (
    <input
      type="text"
      value={query}
      onChange={(e) => setQuery(e.target.value)}
      placeholder="Search..."
    />
  );
}
```

### Using browser APIs

```javascript
"use client";

import { useState, useEffect } from "react";

export default function ThemeToggle() {
  const [dark, setDark] = useState(false);

  useEffect(() => {
    // Access localStorage in the browser
    const saved = localStorage.getItem("theme");
    if (saved === "dark") setDark(true);
  }, []);

  function toggle() {
    const next = !dark;
    setDark(next);
    localStorage.setItem("theme", next ? "dark" : "light");
    document.documentElement.classList.toggle("dark", next);
  }

  return (
    <button onClick={toggle}>
      {dark ? "🌙" : "☀️"}
    </button>
  );
}
```

### Using third-party libraries

```javascript
"use client";

import { motion } from "framer-motion";

export default function AnimatedCard({ children }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {children}
    </motion.div>
  );
}
```

## Client Components are still server-rendered

An important detail: Client Components are **pre-rendered on the server** (as HTML) and then **hydrated** on the client. They're not purely client-side.

```
1. Server renders the component to HTML (initial load is fast)
2. HTML is sent to the browser (user sees content immediately)
3. JavaScript loads and "hydrates" the HTML (adds interactivity)
```

This means users see content even before JavaScript loads.

## Nesting patterns

### Server Components inside Client Components

You **cannot** import a Server Component directly into a Client Component. Instead, pass it as `children`:

```javascript
// ❌ WRONG — Server Component imported in Client Component
"use client";
import ServerComponent from "./ServerComponent"; // This becomes a Client Component!

// ✅ CORRECT — Pass as children
"use client";
export default function ClientWrapper({ children }) {
  const [open, setOpen] = useState(true);
  return open ? <div>{children}</div> : null;
}
```

```javascript
// In a Server Component (page.js):
import ClientWrapper from "./ClientWrapper";
import ServerContent from "./ServerContent"; // stays a Server Component

export default function Page() {
  return (
    <ClientWrapper>
      <ServerContent /> {/* Rendered on the server */}
    </ClientWrapper>
  );
}
```

### The boundary rule

`"use client"` creates a **boundary**. Everything imported by a Client Component becomes part of the client bundle:

```
Server Component (page.js)
├── Server Component (Header.js)     ← stays server
├── Client Component (SearchBar.js)  ← "use client" boundary
│   ├── utils.js                      ← included in client bundle
│   └── hooks/useDebounce.js          ← included in client bundle
└── Server Component (Footer.js)     ← stays server
```

## Keeping the client bundle small

Push `"use client"` down to the **leaves** of your component tree:

```javascript
// ❌ BAD — entire page is a Client Component
"use client";
export default function ProductPage() {
  const [quantity, setQuantity] = useState(1);
  return (
    <div>
      <h1>Product Name</h1>          {/* doesn't need client */}
      <p>Description...</p>           {/* doesn't need client */}
      <img src="/product.jpg" />      {/* doesn't need client */}
      <input value={quantity} onChange={...} /> {/* needs client */}
    </div>
  );
}
```

```javascript
// ✅ GOOD — only the interactive part is a Client Component
// page.js (Server Component)
import QuantitySelector from "./QuantitySelector";

export default function ProductPage() {
  return (
    <div>
      <h1>Product Name</h1>
      <p>Description...</p>
      <img src="/product.jpg" />
      <QuantitySelector />  {/* only this is client */}
    </div>
  );
}

// QuantitySelector.js (Client Component)
"use client";
import { useState } from "react";

export default function QuantitySelector() {
  const [quantity, setQuantity] = useState(1);
  return <input type="number" value={quantity} onChange={(e) => setQuantity(e.target.value)} />;
}
```

## Key takeaways

- Add `"use client"` at the top of files that need interactivity.
- Client Components are still **server-rendered** initially — then hydrated.
- Push `"use client"` down to the **smallest interactive parts** for smaller bundles.
- Pass Server Components as `children` to Client Components — don't import them directly.
- Everything imported by a Client Component becomes part of the client bundle.
