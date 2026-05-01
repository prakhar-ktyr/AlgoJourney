---
title: Next.js Route Handlers
---

# Next.js Route Handlers

Route Handlers let you create **API endpoints** using the Web Request and Response APIs. They replace the old `pages/api` directory from the Pages Router.

## Creating a route handler

Create a `route.js` file in the `app` directory:

```
src/app/api/hello/route.js → GET /api/hello
```

```javascript
// src/app/api/hello/route.js
import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({ message: "Hello, World!" });
}
```

## HTTP methods

Export functions named after HTTP methods:

```javascript
// src/app/api/posts/route.js
import { NextResponse } from "next/server";

export async function GET() {
  const posts = await db.post.findMany();
  return NextResponse.json(posts);
}

export async function POST(request) {
  const body = await request.json();
  const post = await db.post.create({ data: body });
  return NextResponse.json(post, { status: 201 });
}
```

Supported methods: `GET`, `POST`, `PUT`, `PATCH`, `DELETE`, `HEAD`, `OPTIONS`.

## Request object

The `request` parameter is a standard `Request` (extended by Next.js):

### Reading JSON body

```javascript
export async function POST(request) {
  const body = await request.json();
  // body is a parsed JavaScript object
}
```

### Reading form data

```javascript
export async function POST(request) {
  const formData = await request.formData();
  const name = formData.get("name");
  const email = formData.get("email");
}
```

### URL and search params

```javascript
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q");     // /api/search?q=hello
  const page = searchParams.get("page");   // /api/search?q=hello&page=2
}
```

### Headers

```javascript
import { headers } from "next/headers";

export async function GET() {
  const headersList = await headers();
  const token = headersList.get("authorization");
}
```

### Cookies

```javascript
import { cookies } from "next/headers";

export async function GET() {
  const cookieStore = await cookies();
  const session = cookieStore.get("session")?.value;

  return NextResponse.json({ session });
}
```

## Response helpers

```javascript
import { NextResponse } from "next/server";

// JSON response
return NextResponse.json({ data: "value" });

// Status code
return NextResponse.json({ error: "Not found" }, { status: 404 });

// Custom headers
return NextResponse.json(data, {
  headers: { "Cache-Control": "max-age=3600" },
});

// Redirect
return NextResponse.redirect(new URL("/login", request.url));

// Plain text
return new Response("Hello", { status: 200 });
```

## Dynamic route handlers

```
src/app/api/posts/[id]/route.js → /api/posts/123
```

```javascript
// src/app/api/posts/[id]/route.js
import { NextResponse } from "next/server";

export async function GET(request, { params }) {
  const { id } = await params;
  const post = await db.post.findUnique({ where: { id } });

  if (!post) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json(post);
}

export async function PUT(request, { params }) {
  const { id } = await params;
  const body = await request.json();

  const post = await db.post.update({
    where: { id },
    data: body,
  });

  return NextResponse.json(post);
}

export async function DELETE(request, { params }) {
  const { id } = await params;

  await db.post.delete({ where: { id } });

  return NextResponse.json({ deleted: true });
}
```

## CORS handling

```javascript
export async function GET() {
  const data = await getData();

  return NextResponse.json(data, {
    headers: {
      "Access-Control-Allow-Origin": "https://example.com",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}

export async function OPTIONS() {
  return new Response(null, {
    headers: {
      "Access-Control-Allow-Origin": "https://example.com",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}
```

## Streaming responses

```javascript
export async function GET() {
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      for (let i = 0; i < 5; i++) {
        controller.enqueue(encoder.encode(`data: ${i}\n\n`));
        await new Promise((r) => setTimeout(r, 1000));
      }
      controller.close();
    },
  });

  return new Response(stream, {
    headers: { "Content-Type": "text/event-stream" },
  });
}
```

## Caching behavior

- `GET` handlers **without** the `request` parameter are cached by default.
- Using `request`, `cookies()`, or `headers()` opts out of caching.

```javascript
// Cached (static)
export async function GET() {
  const data = await fetch("https://api.example.com/data");
  return NextResponse.json(await data.json());
}

// Not cached (dynamic)
export async function GET(request) {
  const data = await fetch("https://api.example.com/data");
  return NextResponse.json(await data.json());
}
```

Force dynamic:

```javascript
export const dynamic = "force-dynamic";
```

## Key takeaways

- Create `route.js` files to define API endpoints.
- Export `GET`, `POST`, `PUT`, `PATCH`, `DELETE` functions.
- Use `NextResponse.json()` for JSON responses.
- The `request` object follows Web standard APIs.
- `route.js` and `page.js` **cannot** coexist in the same folder.
- `GET` handlers without `request` are cached by default.
- Use dynamic route segments (`[id]`) for parameterized endpoints.
