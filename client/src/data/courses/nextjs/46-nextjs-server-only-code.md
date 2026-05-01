---
title: Next.js Server-Only Code
---

# Next.js Server-Only Code

Some code should **never** run in the browser — database queries, secret API keys, heavy computations. Next.js provides tools to enforce this boundary.

## The server-only package

```bash
npm install server-only
```

Import it at the top of any file that must stay server-side:

```javascript
// src/lib/db.js
import "server-only";
import { PrismaClient } from "@prisma/client";

export const db = new PrismaClient();
```

If a Client Component tries to import this file, you get a **build error**:

```
Error: This module cannot be imported from a Client Component module.
It should only be used from a Server Component.
```

## Data Access Layer (DAL)

Create a dedicated layer for all database access:

```javascript
// src/lib/dal.js
import "server-only";
import { db } from "./db";
import { cache } from "react";

export const getUser = cache(async (id) => {
  return db.user.findUnique({
    where: { id },
    select: { id: true, name: true, email: true, role: true },
  });
});

export const getPosts = cache(async ({ page = 1, limit = 10 } = {}) => {
  return db.post.findMany({
    where: { published: true },
    skip: (page - 1) * limit,
    take: limit,
    orderBy: { createdAt: "desc" },
  });
});

export const getPost = cache(async (slug) => {
  return db.post.findUnique({
    where: { slug },
    include: { author: { select: { name: true } } },
  });
});
```

Benefits:

- All DB access in one place
- `server-only` prevents accidental client imports
- `cache()` deduplicates queries per request
- Easy to add authorization checks

## Authorization in the DAL

```javascript
// src/lib/dal.js
import "server-only";
import { auth } from "@/auth";

export async function getSecretData() {
  const session = await auth();

  if (!session) {
    throw new Error("Unauthorized");
  }

  return db.secret.findMany({
    where: { userId: session.user.id },
  });
}

export async function getAdminData() {
  const session = await auth();

  if (session?.user.role !== "admin") {
    throw new Error("Forbidden");
  }

  return db.adminData.findMany();
}
```

## client-only package

The inverse — ensure code only runs in the browser:

```bash
npm install client-only
```

```javascript
// src/lib/analytics.js
import "client-only";

export function trackEvent(name, data) {
  window.analytics.track(name, data);
}
```

## Tainting sensitive data

React provides `taintObjectReference` and `taintUniqueValue` to prevent sensitive data from being passed to Client Components:

```javascript
import "server-only";
import { experimental_taintObjectReference as taintObjectReference } from "react";

export async function getUser(id) {
  const user = await db.user.findUnique({ where: { id } });

  // Prevent this object from being passed to Client Components
  taintObjectReference("Do not pass user to client", user);

  return user;
}
```

## Project structure

```
src/
├── lib/
│   ├── db.js          ← server-only: database client
│   ├── dal.js         ← server-only: data access layer
│   ├── auth.js        ← server-only: authentication
│   └── utils.js       ← shared: safe for both
├── app/
│   ├── page.js        ← Server Component: uses dal.js
│   └── components/
│       └── Button.js  ← Client Component: cannot import dal.js
```

## Key takeaways

- Use `import "server-only"` to prevent server code from reaching the browser.
- Create a **Data Access Layer** (DAL) with `server-only` for all database queries.
- Use `cache()` in the DAL to deduplicate queries per request.
- Add authorization checks inside the DAL for defense in depth.
- Use `import "client-only"` for browser-specific code.
- These are **build-time checks** — mistakes are caught during development.
