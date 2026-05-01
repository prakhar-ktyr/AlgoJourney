---
title: Next.js Cookies and Headers
---

# Next.js Cookies and Headers

Next.js provides `cookies()` and `headers()` functions to read request cookies and headers in Server Components, Server Actions, and Route Handlers. Using these functions makes your page dynamic (server-rendered per request).

## Reading cookies

```javascript
import { cookies } from "next/headers";

export default async function Page() {
  const cookieStore = await cookies();

  const theme = cookieStore.get("theme")?.value || "light";
  const session = cookieStore.get("session")?.value;

  return (
    <div data-theme={theme}>
      {session ? <p>Logged in</p> : <p>Not logged in</p>}
    </div>
  );
}
```

### Cookie methods

```javascript
const cookieStore = await cookies();

// Get a single cookie
cookieStore.get("name");          // { name, value, path, ... } or undefined
cookieStore.get("name")?.value;   // string or undefined

// Check if cookie exists
cookieStore.has("session");       // boolean

// Get all cookies
cookieStore.getAll();             // array of cookies
```

## Setting cookies

Set cookies in **Server Actions** or **Route Handlers** (not in Server Components):

```javascript
"use server";

import { cookies } from "next/headers";

export async function setTheme(theme) {
  const cookieStore = await cookies();

  cookieStore.set("theme", theme, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 365, // 1 year
    path: "/",
  });
}

export async function logout() {
  const cookieStore = await cookies();
  cookieStore.delete("session");
}
```

### In Route Handlers

```javascript
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function POST(request) {
  const cookieStore = await cookies();
  cookieStore.set("visited", "true");

  return NextResponse.json({ success: true });
}
```

## Reading headers

```javascript
import { headers } from "next/headers";

export default async function Page() {
  const headersList = await headers();

  const userAgent = headersList.get("user-agent");
  const referer = headersList.get("referer");
  const acceptLanguage = headersList.get("accept-language");

  return (
    <div>
      <p>Browser: {userAgent}</p>
      <p>Came from: {referer || "Direct"}</p>
      <p>Language: {acceptLanguage}</p>
    </div>
  );
}
```

## Setting response headers

In Route Handlers:

```javascript
import { NextResponse } from "next/server";

export async function GET() {
  const response = NextResponse.json({ data: "value" });

  response.headers.set("X-Custom-Header", "custom-value");
  response.headers.set("Cache-Control", "public, max-age=3600");

  return response;
}
```

In Middleware:

```javascript
import { NextResponse } from "next/server";

export function middleware(request) {
  const response = NextResponse.next();
  response.headers.set("X-Frame-Options", "DENY");
  return response;
}
```

## Common patterns

### Auth check with cookies

```javascript
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const cookieStore = await cookies();
  const session = cookieStore.get("session");

  if (!session) {
    redirect("/login");
  }

  const user = await verifySession(session.value);
  return <h1>Welcome, {user.name}</h1>;
}
```

### Language detection from headers

```javascript
import { headers } from "next/headers";

export default async function Page() {
  const headersList = await headers();
  const lang = headersList.get("accept-language")?.split(",")[0]?.split("-")[0] || "en";

  const content = await getContent(lang);
  return <div>{content}</div>;
}
```

### Cookie consent

```javascript
"use server";

import { cookies } from "next/headers";

export async function acceptCookies() {
  const cookieStore = await cookies();
  cookieStore.set("consent", "accepted", {
    httpOnly: true,
    secure: true,
    maxAge: 60 * 60 * 24 * 365,
  });
}
```

## Important notes

- `cookies()` and `headers()` make your route **dynamic** — it will be server-rendered on every request.
- You can only **read** cookies and headers in Server Components. To **set** them, use Server Actions or Route Handlers.
- Always `await` the `cookies()` and `headers()` calls.

## Key takeaways

- `cookies()` reads cookies; set/delete in Server Actions or Route Handlers.
- `headers()` reads request headers.
- Both make the page **dynamic** (no static generation).
- Use secure cookie options: `httpOnly`, `secure`, `sameSite`.
- Set response headers in Route Handlers or Middleware.
- Always `await` both functions before accessing their methods.
