---
title: Next.js Security
---

# Next.js Security

Security is critical for production applications. This lesson covers common vulnerabilities and how Next.js helps you prevent them.

## Cross-Site Scripting (XSS)

React automatically escapes content rendered in JSX, preventing most XSS attacks:

```javascript
// ✅ Safe — React escapes this
const userInput = '<script>alert("xss")</script>';
return <p>{userInput}</p>;
// Renders: &lt;script&gt;alert("xss")&lt;/script&gt;
```

### Dangerous patterns

```javascript
// ❌ DANGEROUS — never use dangerouslySetInnerHTML with user input
return <div dangerouslySetInnerHTML={{ __html: userInput }} />;

// ✅ If you must render HTML, sanitize it first
import DOMPurify from "isomorphic-dompurify";
const clean = DOMPurify.sanitize(userInput);
return <div dangerouslySetInnerHTML={{ __html: clean }} />;
```

## Cross-Site Request Forgery (CSRF)

Server Actions have built-in CSRF protection — they check the `Origin` header automatically.

For custom API routes, verify the origin:

```javascript
export async function POST(request) {
  const origin = request.headers.get("origin");
  const allowedOrigins = [process.env.NEXT_PUBLIC_APP_URL];

  if (!allowedOrigins.includes(origin)) {
    return new Response("Forbidden", { status: 403 });
  }

  // process request...
}
```

## Security headers

Set headers in `next.config.js`:

```javascript
const nextConfig = {
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-XSS-Protection", value: "1; mode=block" },
          {
            key: "Content-Security-Policy",
            value: "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:;",
          },
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
        ],
      },
    ];
  },
};
```

Or in middleware:

```javascript
export function middleware(request) {
  const response = NextResponse.next();
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-Content-Type-Options", "nosniff");
  return response;
}
```

## Environment variables

Keep secrets server-side:

```bash
# .env.local
DATABASE_URL=postgresql://...          # Server only
API_SECRET=sk_live_...                  # Server only
NEXT_PUBLIC_APP_URL=https://myapp.com   # Exposed to client
```

- Variables **without** `NEXT_PUBLIC_` are only available on the server.
- Variables **with** `NEXT_PUBLIC_` are bundled into client JavaScript.

```javascript
// ✅ Server only — safe
const secret = process.env.API_SECRET;

// ⚠️ Exposed to browser — don't put secrets here
const url = process.env.NEXT_PUBLIC_APP_URL;
```

## Input validation

Always validate and sanitize on the server:

```javascript
"use server";

import { z } from "zod";

const CommentSchema = z.object({
  content: z.string().min(1).max(1000).trim(),
  postId: z.string().uuid(),
});

export async function addComment(formData) {
  const result = CommentSchema.safeParse({
    content: formData.get("content"),
    postId: formData.get("postId"),
  });

  if (!result.success) {
    return { error: "Invalid input" };
  }

  // Safe to use result.data
  await db.comment.create({ data: result.data });
}
```

## SQL injection prevention

Use parameterized queries (ORMs handle this automatically):

```javascript
// ❌ DANGEROUS — SQL injection
const user = await db.$queryRaw`SELECT * FROM users WHERE id = ${userId}`;
// Actually Prisma template literals ARE safe — but raw strings aren't:

// ❌ DANGEROUS
await db.$queryRawUnsafe(`SELECT * FROM users WHERE name = '${name}'`);

// ✅ Safe — parameterized
await db.$queryRaw`SELECT * FROM users WHERE name = ${name}`;
// or just use the ORM:
await db.user.findMany({ where: { name } });
```

## Rate limiting

Protect API routes from abuse:

```javascript
// src/lib/rate-limit.js
const requests = new Map();

export function rateLimit(ip, limit = 10, windowMs = 60000) {
  const now = Date.now();
  const record = requests.get(ip) || { count: 0, start: now };

  if (now - record.start > windowMs) {
    record.count = 0;
    record.start = now;
  }

  record.count++;
  requests.set(ip, record);

  return record.count <= limit;
}
```

> **Note**: Use Redis for production rate limiting across multiple instances.

## Server-only code

Prevent server code from accidentally running on the client:

```javascript
import "server-only";

export async function getSecretData() {
  return db.secret.findMany();
}
```

If a Client Component tries to import this, it throws a build error.

## Security checklist

- [ ] Use `httpOnly`, `secure`, `sameSite` flags on cookies
- [ ] Validate all input on the server with Zod or similar
- [ ] Never expose secrets via `NEXT_PUBLIC_` variables
- [ ] Set security headers (CSP, HSTS, X-Frame-Options)
- [ ] Sanitize HTML if using `dangerouslySetInnerHTML`
- [ ] Use parameterized queries (ORMs do this automatically)
- [ ] Implement rate limiting on public API routes
- [ ] Use `server-only` to prevent server code leaks
- [ ] Check authentication AND authorization in Server Actions
- [ ] Keep dependencies updated (`npm audit`)

## Key takeaways

- React prevents XSS by default — avoid `dangerouslySetInnerHTML`.
- Server Actions have built-in CSRF protection.
- Set security headers in `next.config.js` or middleware.
- Only `NEXT_PUBLIC_` variables reach the browser — keep secrets without the prefix.
- Always validate input on the server with schema validation.
- Use `server-only` to prevent accidental client imports.
