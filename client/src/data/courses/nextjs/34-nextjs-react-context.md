---
title: Next.js React Context
---

# Next.js React Context

React Context provides a way to share data across components without passing props. In Next.js, context providers must be Client Components since they use React state.

## The challenge

Context providers use `createContext` and `useState` — both require a Client Component. But you want your layout (Server Component) to wrap the app with providers.

## Solution: provider wrapper component

```javascript
// src/app/providers.js
"use client";

import { createContext, useContext, useState } from "react";

const ThemeContext = createContext("light");

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState("light");

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
```

```javascript
// src/app/layout.js (Server Component)
import { ThemeProvider } from "./providers";

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <ThemeProvider>
          {children}  {/* Server Components pass through as children */}
        </ThemeProvider>
      </body>
    </html>
  );
}
```

The key insight: `{children}` are **already rendered** as Server Components and passed as a prop. The Client Component wrapper doesn't turn children into Client Components.

## Multiple providers

```javascript
// src/app/providers.js
"use client";

import { ThemeProvider } from "@/context/theme";
import { AuthProvider } from "@/context/auth";
import { CartProvider } from "@/context/cart";

export default function Providers({ children }) {
  return (
    <AuthProvider>
      <ThemeProvider>
        <CartProvider>
          {children}
        </CartProvider>
      </ThemeProvider>
    </AuthProvider>
  );
}
```

```javascript
// src/app/layout.js
import Providers from "./providers";

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
```

## Initializing context with server data

Fetch data on the server and pass it to the provider:

```javascript
// src/app/layout.js (Server Component)
import { AuthProvider } from "./providers";
import { getSession } from "@/lib/auth";

export default async function RootLayout({ children }) {
  const session = await getSession();

  return (
    <html>
      <body>
        <AuthProvider initialSession={session}>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
```

```javascript
// src/app/providers.js
"use client";

import { createContext, useContext, useState } from "react";

const AuthContext = createContext(null);

export function AuthProvider({ children, initialSession }) {
  const [session, setSession] = useState(initialSession);

  return (
    <AuthContext.Provider value={{ session, setSession }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
}
```

## Using context in Client Components

```javascript
"use client";

import { useTheme } from "@/app/providers";

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <button onClick={() => setTheme(theme === "light" ? "dark" : "light")}>
      {theme === "light" ? "🌙" : "☀️"}
    </button>
  );
}
```

## When NOT to use context

In Next.js, you often don't need context:

| Instead of... | Use... |
|---------------|--------|
| Global data (user, settings) | Server Components fetch directly |
| URL state | `searchParams`, `useSearchParams` |
| Form state | `useActionState` |
| Shared server data | Fetch in each Server Component (auto-deduplicated) |

Only use context when you need **client-side state** shared across multiple Client Components.

## Key takeaways

- Context providers must be Client Components (`"use client"`).
- Wrap the layout's `{children}` — children stay as Server Components.
- Initialize context with server data by passing props from Server Components.
- Create a single `Providers` component for multiple contexts.
- Prefer server-side data fetching over context for data that doesn't change on the client.
