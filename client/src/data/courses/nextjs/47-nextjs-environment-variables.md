---
title: Next.js Environment Variables
---

# Next.js Environment Variables

Next.js has built-in support for environment variables with a clear boundary between server-only and client-exposed variables.

## Loading environment variables

Next.js automatically loads variables from `.env` files:

| File | Loaded in | Git |
|------|-----------|-----|
| `.env` | All environments | Commit |
| `.env.local` | All environments | **Do NOT commit** |
| `.env.development` | `next dev` | Commit |
| `.env.production` | `next build` / `next start` | Commit |
| `.env.test` | Test environment | Commit |

Priority (highest first): `.env.local` → `.env.development` → `.env`

## Server-only variables

By default, environment variables are only available on the **server**:

```bash
# .env.local
DATABASE_URL=postgresql://user:pass@localhost:5432/mydb
API_SECRET=sk_live_abc123
JWT_SECRET=super-secret-key
```

```javascript
// Server Component or Server Action — ✅ works
const dbUrl = process.env.DATABASE_URL;
const secret = process.env.API_SECRET;
```

```javascript
// Client Component — ❌ undefined
"use client";
console.log(process.env.DATABASE_URL); // undefined
```

## Client-exposed variables

Prefix with `NEXT_PUBLIC_` to expose to the browser:

```bash
# .env.local
NEXT_PUBLIC_APP_URL=https://myapp.com
NEXT_PUBLIC_API_URL=https://api.myapp.com
NEXT_PUBLIC_STRIPE_KEY=pk_live_abc123
```

```javascript
// Client Component — ✅ works
"use client";
const appUrl = process.env.NEXT_PUBLIC_APP_URL;
```

> **Warning**: `NEXT_PUBLIC_` variables are inlined into the JavaScript bundle at build time. Never put secrets here!

## Common patterns

### .env.local example

```bash
# Database
DATABASE_URL=postgresql://user:pass@localhost:5432/mydb

# Authentication
JWT_SECRET=your-jwt-secret
NEXTAUTH_SECRET=your-nextauth-secret
NEXTAUTH_URL=http://localhost:3000

# Third-party APIs (server-only)
STRIPE_SECRET_KEY=sk_test_...
SENDGRID_API_KEY=SG.xxx

# Public (safe for browser)
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
```

### .env.example (commit to git)

```bash
# Copy to .env.local and fill in values
DATABASE_URL=
JWT_SECRET=
NEXTAUTH_SECRET=
NEXTAUTH_URL=http://localhost:3000
STRIPE_SECRET_KEY=
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
```

## Runtime vs build-time

`NEXT_PUBLIC_` variables are replaced at **build time**:

```javascript
// This is replaced at build time:
process.env.NEXT_PUBLIC_APP_URL
// Becomes:
"https://myapp.com"
```

Server variables are read at **runtime**:

```javascript
// This reads the actual env var at runtime:
process.env.DATABASE_URL
```

## Accessing in different contexts

```javascript
// Server Component ✅
export default async function Page() {
  const secret = process.env.API_SECRET; // ✅
  const publicUrl = process.env.NEXT_PUBLIC_APP_URL; // ✅
}

// Route Handler ✅
export async function GET() {
  const secret = process.env.API_SECRET; // ✅
}

// Server Action ✅
"use server";
export async function action() {
  const secret = process.env.API_SECRET; // ✅
}

// Middleware ✅
export function middleware() {
  const secret = process.env.API_SECRET; // ✅
}

// Client Component
"use client";
// process.env.API_SECRET → undefined (server only)
// process.env.NEXT_PUBLIC_APP_URL → "https://myapp.com" ✅
```

## Validating environment variables

Validate at startup to catch missing variables early:

```javascript
// src/lib/env.js
import { z } from "zod";

const envSchema = z.object({
  DATABASE_URL: z.string().url(),
  JWT_SECRET: z.string().min(32),
  NEXT_PUBLIC_APP_URL: z.string().url(),
});

export const env = envSchema.parse(process.env);
```

Import this file early (e.g., in `instrumentation.js`) to fail fast.

## Key takeaways

- Variables without `NEXT_PUBLIC_` are **server-only** — safe for secrets.
- `NEXT_PUBLIC_` variables are **inlined at build time** into client bundles.
- Use `.env.local` for secrets (don't commit), `.env` for defaults (commit).
- Validate env vars at startup with Zod to catch missing values early.
- Never put secrets in `NEXT_PUBLIC_` variables.
- Server variables are available in Server Components, Actions, Route Handlers, and Middleware.
