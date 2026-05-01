---
title: Next.js Session Management
---

# Next.js Session Management

Sessions track authenticated users across requests. Next.js supports two session strategies: **JWT** (stateless) and **database sessions** (stateful).

## JWT sessions (stateless)

The session is stored as a signed token in a cookie. No database lookup needed.

```
Browser cookie → JWT token → decode on server → user data
```

### With Auth.js

```javascript
export const { handlers, auth } = NextAuth({
  session: { strategy: "jwt" }, // default
  providers: [...],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
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

### Custom JWT sessions

```javascript
// src/lib/session.js
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

const secret = new TextEncoder().encode(process.env.SESSION_SECRET);
const COOKIE_NAME = "session";

export async function createSession(user) {
  const token = await new SignJWT({
    userId: user.id,
    name: user.name,
    role: user.role,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(secret);

  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7,
    path: "/",
  });
}

export async function getSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;

  try {
    const { payload } = await jwtVerify(token, secret);
    return payload;
  } catch {
    return null;
  }
}

export async function deleteSession() {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}
```

## Database sessions (stateful)

Sessions are stored in a database. The cookie holds only a session ID.

```
Browser cookie → session ID → database lookup → user data
```

### With Auth.js + database adapter

```javascript
import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { db } from "@/lib/db";

export const { handlers, auth } = NextAuth({
  adapter: PrismaAdapter(db),
  session: { strategy: "database" },
  providers: [...],
});
```

## Comparison

| Feature | JWT | Database |
|---------|-----|----------|
| Storage | Cookie | Database + cookie ID |
| Speed | Fast (no DB query) | Slower (DB query per request) |
| Revocation | Hard (can't invalidate) | Easy (delete from DB) |
| Size limit | ~4KB (cookie limit) | Unlimited |
| Scalability | Excellent | Depends on DB |
| Best for | Simple apps, APIs | Apps needing session control |

## Refreshing sessions

### Sliding window with JWT

```javascript
import { NextResponse } from "next/server";

export async function middleware(request) {
  const session = request.cookies.get("session")?.value;
  if (!session) return NextResponse.next();

  try {
    const { payload } = await jwtVerify(session, secret);

    // If less than 1 day until expiry, refresh
    const expiresAt = payload.exp * 1000;
    const oneDayMs = 24 * 60 * 60 * 1000;

    if (expiresAt - Date.now() < oneDayMs) {
      const newToken = await new SignJWT(payload)
        .setProtectedHeader({ alg: "HS256" })
        .setExpirationTime("7d")
        .sign(secret);

      const response = NextResponse.next();
      response.cookies.set("session", newToken, {
        httpOnly: true,
        secure: true,
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 7,
      });
      return response;
    }
  } catch {
    // Invalid token — clear it
    const response = NextResponse.next();
    response.cookies.delete("session");
    return response;
  }

  return NextResponse.next();
}
```

## Using sessions in your app

```javascript
// Server Component
import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  return <h1>Welcome, {session.name}</h1>;
}
```

```javascript
// Server Action
"use server";

import { getSession } from "@/lib/session";

export async function updateProfile(formData) {
  const session = await getSession();
  if (!session) throw new Error("Unauthorized");

  await db.user.update({
    where: { id: session.userId },
    data: { name: formData.get("name") },
  });
}
```

## Key takeaways

- **JWT sessions**: fast, stateless, stored in cookies. Hard to revoke.
- **Database sessions**: stored in DB, easy to revoke, slower per request.
- Always use `httpOnly`, `secure`, and `sameSite` cookie flags.
- Implement session refresh (sliding window) in middleware.
- Auth.js supports both strategies out of the box.
- Access sessions in Server Components with `auth()` or custom `getSession()`.
