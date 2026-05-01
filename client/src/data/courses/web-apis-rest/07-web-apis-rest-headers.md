---
title: HTTP Headers
---

# HTTP Headers

HTTP headers carry **metadata** about the request or response. They control caching, authentication, content type, and more. Understanding headers is essential for building secure, performant APIs.

---

## What Are Headers?

Headers are key-value pairs sent with every HTTP request and response:

```
GET /api/users HTTP/1.1
Host: api.example.com
Accept: application/json
Authorization: Bearer eyJhbGciOiJIUzI1NiJ9...
User-Agent: Mozilla/5.0
```

```
HTTP/1.1 200 OK
Content-Type: application/json
Content-Length: 256
Cache-Control: max-age=3600
X-RateLimit-Remaining: 98
```

---

## Common Request Headers

| Header | Purpose | Example |
|--------|---------|---------|
| **Host** | Target server | `api.example.com` |
| **Accept** | Desired response format | `application/json` |
| **Content-Type** | Format of request body | `application/json` |
| **Authorization** | Authentication credentials | `Bearer token123` |
| **User-Agent** | Client software info | `Mozilla/5.0` |
| **Accept-Language** | Preferred language | `en-US, fr` |
| **Accept-Encoding** | Supported compression | `gzip, deflate` |
| **Cookie** | Session cookies | `session=abc123` |
| **If-None-Match** | Cache validation (ETag) | `"33a64df551425fcc55e"` |
| **If-Modified-Since** | Cache validation (date) | `Wed, 21 Oct 2023 07:28:00 GMT` |

---

## Common Response Headers

| Header | Purpose | Example |
|--------|---------|---------|
| **Content-Type** | Format of response body | `application/json; charset=utf-8` |
| **Content-Length** | Size of response in bytes | `256` |
| **Cache-Control** | Caching directives | `max-age=3600, public` |
| **ETag** | Resource version identifier | `"33a64df551425fcc55e"` |
| **Location** | URL of created resource | `/api/users/42` |
| **Set-Cookie** | Set a cookie | `session=abc; HttpOnly; Secure` |
| **Access-Control-Allow-Origin** | CORS permission | `https://myapp.com` |
| **X-RateLimit-Limit** | Max requests per window | `100` |
| **X-RateLimit-Remaining** | Requests left | `97` |
| **Retry-After** | When to retry (seconds) | `60` |

---

## Content-Type

The most important header for APIs. It tells the recipient the format of the body:

```
Content-Type: application/json              ← JSON (most common)
Content-Type: application/xml               ← XML
Content-Type: text/plain                    ← Plain text
Content-Type: multipart/form-data           ← File uploads
Content-Type: application/x-www-form-urlencoded  ← HTML form data
```

```javascript
// Setting Content-Type in Express
app.post("/api/users", (req, res) => {
  // Express reads Content-Type to parse req.body
  // express.json() middleware handles application/json
  res.json(user); // Automatically sets Content-Type: application/json
});
```

---

## Authorization

How clients send credentials:

```
// API Key
Authorization: ApiKey sk_live_abc123

// Bearer Token (JWT)
Authorization: Bearer eyJhbGciOiJIUzI1NiJ9.eyJ1c2VyIjoiYWxpY2UifQ.sig

// Basic Auth (base64 encoded username:password)
Authorization: Basic YWxpY2U6cGFzc3dvcmQ=
```

```javascript
// Reading the Authorization header in Express
app.get("/api/profile", (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "No token provided" });
  }
  const token = authHeader.split(" ")[1];
  // Verify token...
});
```

---

## Cache-Control

Controls how responses are cached:

```
Cache-Control: no-store                     ← Never cache
Cache-Control: no-cache                     ← Cache but revalidate every time
Cache-Control: max-age=3600                 ← Cache for 1 hour
Cache-Control: public, max-age=86400        ← Anyone can cache for 24h
Cache-Control: private, max-age=600         ← Only browser can cache for 10min
```

```javascript
// Setting cache headers in Express
app.get("/api/config", (req, res) => {
  res.set("Cache-Control", "public, max-age=3600");
  res.json(config);
});

app.get("/api/user/profile", (req, res) => {
  res.set("Cache-Control", "private, no-cache");
  res.json(profile);
});
```

---

## Custom Headers

APIs often use custom headers prefixed with `X-`:

```
X-Request-ID: abc-123-def-456     ← Unique request identifier
X-RateLimit-Limit: 100            ← Max requests per window
X-RateLimit-Remaining: 97         ← Remaining requests
X-RateLimit-Reset: 1625097600     ← When the window resets
X-Powered-By: Express             ← Server software (often removed for security)
```

```javascript
// Adding custom headers
app.use((req, res, next) => {
  res.set("X-Request-ID", crypto.randomUUID());
  next();
});

// Remove X-Powered-By for security
app.disable("x-powered-by");
```

---

## Security Headers

Essential headers for API security:

```javascript
app.use((req, res, next) => {
  // Prevent MIME type sniffing
  res.set("X-Content-Type-Options", "nosniff");

  // Prevent clickjacking
  res.set("X-Frame-Options", "DENY");

  // Strict Transport Security (HTTPS only)
  res.set("Strict-Transport-Security", "max-age=31536000; includeSubDomains");

  // Content Security Policy
  res.set("Content-Security-Policy", "default-src 'none'");

  next();
});
```

Or use the `helmet` middleware:

```javascript
import helmet from "helmet";
app.use(helmet());
```

---

## Working with Headers in JavaScript

```javascript
// Setting headers in fetch
const response = await fetch("/api/users", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "Authorization": "Bearer token123",
    "X-Request-ID": "abc-123",
  },
  body: JSON.stringify({ name: "Alice" }),
});

// Reading response headers
console.log(response.headers.get("Content-Type"));
console.log(response.headers.get("X-RateLimit-Remaining"));
```

---

## Try It Yourself

Use curl to inspect headers:

```bash
# See all response headers
curl -I https://api.github.com

# Send custom headers
curl -H "Accept: application/json" \
     -H "X-Custom: hello" \
     https://jsonplaceholder.typicode.com/posts/1
```

Look for:
1. `Content-Type` — what format is the response?
2. `X-RateLimit-*` — how many requests can you make?
3. Security headers — which ones are present?

---

## Key Takeaways

- Headers carry **metadata** about HTTP requests and responses
- **Content-Type** tells the format of the body (usually `application/json`)
- **Authorization** sends authentication credentials
- **Cache-Control** manages caching behavior
- Always set **security headers** (or use `helmet`)
- Custom headers use the `X-` prefix convention

---

Next, we'll learn about **Query Parameters** — how to filter, sort, and paginate API responses →
