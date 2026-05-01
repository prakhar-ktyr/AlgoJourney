---
title: Next.js API Design
---

# Next.js API Design

Route Handlers in Next.js let you build REST APIs alongside your pages. This lesson covers best practices for designing clean, consistent APIs.

## API structure

Organize Route Handlers under `app/api/`:

```
src/app/api/
├── posts/
│   ├── route.js           → GET /api/posts, POST /api/posts
│   └── [id]/
│       └── route.js       → GET /api/posts/:id, PUT, DELETE
├── users/
│   ├── route.js           → GET /api/users, POST /api/users
│   └── [id]/
│       └── route.js       → GET /api/users/:id
└── auth/
    ├── login/
    │   └── route.js       → POST /api/auth/login
    └── register/
        └── route.js       → POST /api/auth/register
```

## RESTful CRUD example

```javascript
// src/app/api/posts/route.js
import { db } from "@/lib/db";
import { NextResponse } from "next/server";

// GET /api/posts?page=1&limit=10
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const page = Number(searchParams.get("page")) || 1;
  const limit = Number(searchParams.get("limit")) || 10;
  const skip = (page - 1) * limit;

  const [posts, total] = await Promise.all([
    db.post.findMany({ skip, take: limit, orderBy: { createdAt: "desc" } }),
    db.post.count(),
  ]);

  return NextResponse.json({
    data: posts,
    pagination: { page, limit, total, pages: Math.ceil(total / limit) },
  });
}

// POST /api/posts
export async function POST(request) {
  const body = await request.json();
  const post = await db.post.create({ data: body });
  return NextResponse.json({ data: post }, { status: 201 });
}
```

```javascript
// src/app/api/posts/[id]/route.js
import { db } from "@/lib/db";
import { NextResponse } from "next/server";

// GET /api/posts/:id
export async function GET(request, { params }) {
  const { id } = await params;
  const post = await db.post.findUnique({ where: { id } });

  if (!post) {
    return NextResponse.json({ error: "Post not found" }, { status: 404 });
  }

  return NextResponse.json({ data: post });
}

// PUT /api/posts/:id
export async function PUT(request, { params }) {
  const { id } = await params;
  const body = await request.json();

  const post = await db.post.update({ where: { id }, data: body });
  return NextResponse.json({ data: post });
}

// DELETE /api/posts/:id
export async function DELETE(request, { params }) {
  const { id } = await params;
  await db.post.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
```

## Input validation

```javascript
import { z } from "zod";
import { NextResponse } from "next/server";

const CreatePostSchema = z.object({
  title: z.string().min(1).max(200),
  content: z.string().optional(),
  published: z.boolean().default(false),
});

export async function POST(request) {
  const body = await request.json();
  const result = CreatePostSchema.safeParse(body);

  if (!result.success) {
    return NextResponse.json(
      { error: "Validation failed", details: result.error.flatten().fieldErrors },
      { status: 400 }
    );
  }

  const post = await db.post.create({ data: result.data });
  return NextResponse.json({ data: post }, { status: 201 });
}
```

## Error handling

```javascript
export async function GET(request, { params }) {
  try {
    const { id } = await params;
    const post = await db.post.findUnique({ where: { id } });

    if (!post) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    return NextResponse.json({ data: post });
  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
```

## Authentication in API routes

```javascript
import { auth } from "@/auth";
import { NextResponse } from "next/server";

export async function POST(request) {
  const session = await auth();

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const post = await db.post.create({
    data: { ...body, authorId: session.user.id },
  });

  return NextResponse.json({ data: post }, { status: 201 });
}
```

## Consistent response format

```javascript
// src/lib/api.js
import { NextResponse } from "next/server";

export function success(data, status = 200) {
  return NextResponse.json({ data }, { status });
}

export function error(message, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

export function paginated(data, { page, limit, total }) {
  return NextResponse.json({
    data,
    pagination: { page, limit, total, pages: Math.ceil(total / limit) },
  });
}
```

## When to use Route Handlers vs Server Actions

| Feature | Route Handlers | Server Actions |
|---------|---------------|---------------|
| HTTP methods | GET, POST, PUT, DELETE | POST only |
| External access | Yes (any client) | No (same origin) |
| Form handling | Manual | Built-in |
| Caching | GET cached by default | Not cached |
| Use case | Public APIs, webhooks | Form mutations, data changes |

**Rule of thumb**: Use Server Actions for form submissions and data mutations. Use Route Handlers for APIs consumed by external clients or when you need specific HTTP methods.

## Key takeaways

- Organize APIs under `app/api/` with RESTful conventions.
- Validate all input with Zod before processing.
- Return consistent response shapes: `{ data }` or `{ error }`.
- Authenticate and authorize in every route handler.
- Use Route Handlers for external APIs, Server Actions for internal mutations.
- Handle errors gracefully — return proper HTTP status codes.
