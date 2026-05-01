---
title: Next.js Role-Based Access Control
---

# Next.js Role-Based Access Control

Role-Based Access Control (RBAC) restricts functionality based on a user's role. Common roles include `admin`, `editor`, and `user`.

## Adding roles to sessions

### With Auth.js

```javascript
// src/auth.js
export const { handlers, auth } = NextAuth({
  providers: [...],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role; // from database
      }
      return token;
    },
    async session({ session, token }) {
      session.user.role = token.role;
      return session;
    },
  },
});
```

### Custom session

```javascript
export async function createSession(user) {
  const token = await new SignJWT({
    userId: user.id,
    role: user.role, // "admin", "editor", "user"
  })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("7d")
    .sign(secret);

  // ... set cookie
}
```

## Checking roles in Server Components

```javascript
import { auth } from "@/auth";
import { redirect } from "next/navigation";

export default async function AdminPage() {
  const session = await auth();

  if (!session || session.user.role !== "admin") {
    redirect("/unauthorized");
  }

  return <h1>Admin Dashboard</h1>;
}
```

## Reusable authorization helper

```javascript
// src/lib/authorization.js
import { auth } from "@/auth";
import { redirect } from "next/navigation";

export async function requireRole(allowedRoles) {
  const session = await auth();

  if (!session) {
    redirect("/login");
  }

  if (!allowedRoles.includes(session.user.role)) {
    redirect("/unauthorized");
  }

  return session;
}
```

```javascript
// src/app/admin/page.js
import { requireRole } from "@/lib/authorization";

export default async function AdminPage() {
  const session = await requireRole(["admin"]);
  return <h1>Admin: {session.user.name}</h1>;
}

// src/app/editor/page.js
import { requireRole } from "@/lib/authorization";

export default async function EditorPage() {
  const session = await requireRole(["admin", "editor"]);
  return <h1>Editor Dashboard</h1>;
}
```

## Role-based middleware

```javascript
// src/middleware.js
import { auth } from "./auth";
import { NextResponse } from "next/server";

const roleRoutes = {
  "/admin": ["admin"],
  "/editor": ["admin", "editor"],
  "/dashboard": ["admin", "editor", "user"],
};

export default auth((req) => {
  const { pathname } = req.nextUrl;

  for (const [path, roles] of Object.entries(roleRoutes)) {
    if (pathname.startsWith(path)) {
      if (!req.auth) {
        return NextResponse.redirect(new URL("/login", req.nextUrl.origin));
      }
      if (!roles.includes(req.auth.user.role)) {
        return NextResponse.redirect(new URL("/unauthorized", req.nextUrl.origin));
      }
    }
  }
});

export const config = {
  matcher: ["/admin/:path*", "/editor/:path*", "/dashboard/:path*"],
};
```

## Conditional UI based on roles

```javascript
import { auth } from "@/auth";

export default async function Navigation() {
  const session = await auth();

  return (
    <nav>
      <a href="/">Home</a>
      {session && <a href="/dashboard">Dashboard</a>}
      {session?.user.role === "admin" && <a href="/admin">Admin</a>}
      {["admin", "editor"].includes(session?.user.role) && (
        <a href="/editor">Editor</a>
      )}
    </nav>
  );
}
```

## Role-based Server Actions

```javascript
"use server";

import { auth } from "@/auth";

export async function deleteUser(userId) {
  const session = await auth();

  if (!session || session.user.role !== "admin") {
    throw new Error("Forbidden");
  }

  await db.user.delete({ where: { id: userId } });
}

export async function editPost(postId, data) {
  const session = await auth();

  if (!session || !["admin", "editor"].includes(session.user.role)) {
    throw new Error("Forbidden");
  }

  await db.post.update({ where: { id: postId }, data });
}
```

## Unauthorized page

```javascript
// src/app/unauthorized/page.js
import Link from "next/link";

export default function UnauthorizedPage() {
  return (
    <div className="text-center py-20">
      <h1 className="text-3xl font-bold">403 — Forbidden</h1>
      <p className="mt-2 text-gray-600">
        You don't have permission to access this page.
      </p>
      <Link href="/" className="text-blue-600 mt-4 inline-block">
        Go home
      </Link>
    </div>
  );
}
```

## Key takeaways

- Store the user's **role** in the session (JWT claims or database).
- Create a reusable `requireRole()` helper for Server Components.
- Check roles in **middleware** for route-level protection.
- Always check roles in **Server Actions** and **API routes** — don't rely on UI hiding.
- Show/hide UI elements based on roles, but enforce on the server.
- Create an `/unauthorized` page for 403 responses.
