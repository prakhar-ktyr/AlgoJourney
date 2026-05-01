---
title: Next.js Authentication
---

# Next.js Authentication

Authentication verifies **who** the user is. Next.js works with any auth solution, but the most popular is **Auth.js** (formerly NextAuth.js), which handles OAuth, credentials, JWT, and session management.

## Auth.js setup

```bash
npm install next-auth@beta
```

### Configuration

```javascript
// src/auth.js
import NextAuth from "next-auth";
import GitHub from "next-auth/providers/github";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    GitHub({
      clientId: process.env.GITHUB_ID,
      clientSecret: process.env.GITHUB_SECRET,
    }),
    Google({
      clientId: process.env.GOOGLE_ID,
      clientSecret: process.env.GOOGLE_SECRET,
    }),
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const user = await getUserByEmail(credentials.email);
        if (!user) return null;

        const valid = await verifyPassword(credentials.password, user.passwordHash);
        if (!valid) return null;

        return { id: user.id, name: user.name, email: user.email };
      },
    }),
  ],
});
```

### Route handler

```javascript
// src/app/api/auth/[...nextauth]/route.js
import { handlers } from "@/auth";

export const { GET, POST } = handlers;
```

## Getting the session

### In Server Components

```javascript
import { auth } from "@/auth";

export default async function DashboardPage() {
  const session = await auth();

  if (!session) {
    return <p>Please sign in</p>;
  }

  return <h1>Welcome, {session.user.name}</h1>;
}
```

### In Client Components

```javascript
"use client";

import { useSession } from "next-auth/react";

export default function UserMenu() {
  const { data: session, status } = useSession();

  if (status === "loading") return <p>Loading...</p>;
  if (!session) return <a href="/api/auth/signin">Sign in</a>;

  return <p>Hello, {session.user.name}</p>;
}
```

### Session provider (required for client-side)

```javascript
// src/app/providers.js
"use client";

import { SessionProvider } from "next-auth/react";

export default function Providers({ children }) {
  return <SessionProvider>{children}</SessionProvider>;
}
```

## Sign in / sign out

### With Server Actions

```javascript
import { signIn, signOut } from "@/auth";

export default function AuthButtons() {
  return (
    <div>
      <form action={async () => {
        "use server";
        await signIn("github");
      }}>
        <button type="submit">Sign in with GitHub</button>
      </form>

      <form action={async () => {
        "use server";
        await signOut();
      }}>
        <button type="submit">Sign out</button>
      </form>
    </div>
  );
}
```

### With Client Components

```javascript
"use client";

import { signIn, signOut } from "next-auth/react";

export function SignInButton() {
  return <button onClick={() => signIn("github")}>Sign in</button>;
}

export function SignOutButton() {
  return <button onClick={() => signOut()}>Sign out</button>;
}
```

## Protecting pages in middleware

```javascript
// src/middleware.js
import { auth } from "./auth";

export default auth((req) => {
  if (!req.auth && req.nextUrl.pathname.startsWith("/dashboard")) {
    const loginUrl = new URL("/api/auth/signin", req.nextUrl.origin);
    return Response.redirect(loginUrl);
  }
});

export const config = {
  matcher: ["/dashboard/:path*"],
};
```

## Custom auth (without Auth.js)

For full control, implement auth manually:

```javascript
// src/lib/auth.js
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

const secret = new TextEncoder().encode(process.env.JWT_SECRET);

export async function createSession(userId) {
  const token = await new SignJWT({ userId })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("7d")
    .sign(secret);

  const cookieStore = await cookies();
  cookieStore.set("session", token, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7,
  });
}

export async function getSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get("session")?.value;
  if (!token) return null;

  try {
    const { payload } = await jwtVerify(token, secret);
    return payload;
  } catch {
    return null;
  }
}
```

## Key takeaways

- **Auth.js** is the most popular auth library for Next.js — supports OAuth, credentials, JWT.
- Use `auth()` in Server Components and `useSession()` in Client Components.
- Protect routes with **middleware** for server-side auth checks.
- Sign in/out works with both Server Actions and client-side functions.
- For custom auth, use JWT with `jose` library and httpOnly cookies.
- Never store tokens in `localStorage` — use httpOnly cookies.
