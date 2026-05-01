---
title: Next.js Protected Routes
---

# Next.js Protected Routes

Protected routes restrict access to authenticated users. Next.js offers multiple ways to protect routes — in middleware, Server Components, or layouts.

## Middleware protection (recommended)

The most efficient approach — checks auth before the page renders:

```javascript
// src/middleware.js
import { auth } from "./auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  const isLoggedIn = !!req.auth;
  const isProtected = req.nextUrl.pathname.startsWith("/dashboard");
  const isAuthPage = req.nextUrl.pathname.startsWith("/login");

  if (isProtected && !isLoggedIn) {
    const loginUrl = new URL("/login", req.nextUrl.origin);
    loginUrl.searchParams.set("callbackUrl", req.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (isAuthPage && isLoggedIn) {
    return NextResponse.redirect(new URL("/dashboard", req.nextUrl.origin));
  }
});

export const config = {
  matcher: ["/dashboard/:path*", "/login"],
};
```

### Custom middleware (without Auth.js)

```javascript
import { NextResponse } from "next/server";
import { jwtVerify } from "jose";

const secret = new TextEncoder().encode(process.env.JWT_SECRET);

const protectedPaths = ["/dashboard", "/settings", "/profile"];

export async function middleware(request) {
  const { pathname } = request.nextUrl;
  const isProtected = protectedPaths.some((p) => pathname.startsWith(p));

  if (!isProtected) return NextResponse.next();

  const token = request.cookies.get("session")?.value;

  if (!token) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  try {
    await jwtVerify(token, secret);
    return NextResponse.next();
  } catch {
    return NextResponse.redirect(new URL("/login", request.url));
  }
}
```

## Server Component protection

Check auth directly in the page:

```javascript
import { auth } from "@/auth";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const session = await auth();

  if (!session) {
    redirect("/login");
  }

  return <h1>Dashboard — {session.user.name}</h1>;
}
```

## Layout-level protection

Protect all routes under a layout:

```javascript
// src/app/(protected)/layout.js
import { auth } from "@/auth";
import { redirect } from "next/navigation";

export default async function ProtectedLayout({ children }) {
  const session = await auth();

  if (!session) {
    redirect("/login");
  }

  return (
    <div>
      <nav>Authenticated Nav</nav>
      <main>{children}</main>
    </div>
  );
}
```

All pages under `(protected)/` are automatically protected.

## Protecting API routes

```javascript
// src/app/api/private/route.js
import { auth } from "@/auth";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await auth();

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  return NextResponse.json({ data: "secret" });
}
```

## Protecting Server Actions

```javascript
"use server";

import { auth } from "@/auth";

export async function updateProfile(formData) {
  const session = await auth();

  if (!session) {
    throw new Error("Unauthorized");
  }

  await db.user.update({
    where: { id: session.user.id },
    data: { name: formData.get("name") },
  });
}
```

## Callback URL pattern

Redirect back to the original page after login:

```javascript
// Login page
export default async function LoginPage({ searchParams }) {
  const { callbackUrl } = await searchParams;

  return (
    <form action={async (formData) => {
      "use server";
      await signIn("credentials", {
        ...Object.fromEntries(formData),
        redirectTo: callbackUrl || "/dashboard",
      });
    }}>
      <input name="email" type="email" />
      <input name="password" type="password" />
      <button type="submit">Sign In</button>
    </form>
  );
}
```

## Comparison of approaches

| Approach | Runs | Pros | Cons |
|----------|------|------|------|
| Middleware | Before render | Fastest, universal | Limited to Edge Runtime |
| Server Component | During render | Full Node.js access | Page starts rendering first |
| Layout | During render | Protects all children | Same as Server Component |

## Key takeaways

- **Middleware** is the best place for auth checks — runs before any rendering.
- Use **layout-level** protection to secure all routes in a group.
- Always protect **Server Actions** and **API routes** — don't rely only on UI.
- Implement **callback URLs** to redirect users back after login.
- Defense in depth: protect in middleware AND in Server Components/Actions.
