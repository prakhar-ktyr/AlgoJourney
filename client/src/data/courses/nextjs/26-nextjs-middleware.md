---
title: Next.js Middleware
---

# Next.js Middleware

Middleware runs **before** a request is completed. It lets you modify the response, redirect, rewrite URLs, set headers, or check authentication — all at the edge, before the page renders.

## Creating middleware

Create a `middleware.js` file at the **root** of your project (next to `app/`):

```javascript
// src/middleware.js (or middleware.js at project root)
import { NextResponse } from "next/server";

export function middleware(request) {
  console.log("Request to:", request.nextUrl.pathname);
  return NextResponse.next();
}
```

## Matching routes

Use the `config.matcher` to specify which routes the middleware applies to:

```javascript
export function middleware(request) {
  // runs only for matched routes
}

export const config = {
  matcher: "/dashboard/:path*",
};
```

### Multiple matchers

```javascript
export const config = {
  matcher: ["/dashboard/:path*", "/api/:path*", "/admin/:path*"],
};
```

### Excluding static files

```javascript
export const config = {
  matcher: [
    // Match all paths except static files
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
```

## Redirects

```javascript
import { NextResponse } from "next/server";

export function middleware(request) {
  const { pathname } = request.nextUrl;

  // Redirect old paths
  if (pathname === "/old-page") {
    return NextResponse.redirect(new URL("/new-page", request.url));
  }

  return NextResponse.next();
}
```

## Rewrites

Rewrites serve a different page without changing the URL:

```javascript
export function middleware(request) {
  const { pathname } = request.nextUrl;

  // Rewrite /blog to /news (URL stays /blog)
  if (pathname.startsWith("/blog")) {
    return NextResponse.rewrite(
      new URL(pathname.replace("/blog", "/news"), request.url)
    );
  }

  return NextResponse.next();
}
```

## Authentication check

```javascript
import { NextResponse } from "next/server";

export function middleware(request) {
  const token = request.cookies.get("session")?.value;

  // Protect dashboard routes
  if (request.nextUrl.pathname.startsWith("/dashboard")) {
    if (!token) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*"],
};
```

## Setting headers

```javascript
export function middleware(request) {
  const response = NextResponse.next();

  // Add security headers
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");

  return response;
}
```

## Setting and reading cookies

```javascript
export function middleware(request) {
  const response = NextResponse.next();

  // Read a cookie
  const visited = request.cookies.get("visited")?.value;

  // Set a cookie
  if (!visited) {
    response.cookies.set("visited", "true", {
      httpOnly: true,
      maxAge: 60 * 60 * 24 * 30, // 30 days
    });
  }

  return response;
}
```

## Geolocation-based routing

```javascript
export function middleware(request) {
  const country = request.geo?.country || "US";

  if (country === "DE") {
    return NextResponse.rewrite(new URL("/de" + request.nextUrl.pathname, request.url));
  }

  return NextResponse.next();
}
```

## Rate limiting example

```javascript
const rateLimit = new Map();

export function middleware(request) {
  const ip = request.headers.get("x-forwarded-for") || "anonymous";
  const now = Date.now();
  const windowMs = 60 * 1000; // 1 minute window
  const maxRequests = 100;

  const record = rateLimit.get(ip) || { count: 0, start: now };

  if (now - record.start > windowMs) {
    record.count = 0;
    record.start = now;
  }

  record.count++;
  rateLimit.set(ip, record);

  if (record.count > maxRequests) {
    return NextResponse.json(
      { error: "Too many requests" },
      { status: 429 }
    );
  }

  return NextResponse.next();
}
```

> **Note**: This in-memory rate limiting only works for single-instance deployments. Use Redis or a similar store for production.

## Chaining middleware logic

Since there's only one middleware file, chain logic with conditionals:

```javascript
export function middleware(request) {
  const { pathname } = request.nextUrl;

  // 1. Authentication
  if (pathname.startsWith("/dashboard")) {
    const token = request.cookies.get("session")?.value;
    if (!token) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }

  // 2. Redirects
  if (pathname === "/old-blog") {
    return NextResponse.redirect(new URL("/blog", request.url));
  }

  // 3. Headers
  const response = NextResponse.next();
  response.headers.set("X-Request-Id", crypto.randomUUID());

  return response;
}
```

## Limitations

- Middleware runs on the **Edge Runtime** — limited Node.js APIs.
- Cannot use `fs`, most `node:` modules, or heavy npm packages.
- There's only **one** middleware file per project.
- Keep middleware fast — it runs on every matched request.

## Key takeaways

- Middleware runs **before** every matched request.
- Create `middleware.js` at the project root (next to `app/`).
- Use `config.matcher` to control which routes are matched.
- Common uses: authentication, redirects, rewrites, headers, cookies.
- Middleware runs on the **Edge Runtime** — keep it lightweight.
- Only one middleware file per project — use conditionals to chain logic.
