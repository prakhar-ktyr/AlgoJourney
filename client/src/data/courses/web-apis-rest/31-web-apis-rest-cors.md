---
title: CORS
---

# CORS

**CORS** (Cross-Origin Resource Sharing) is a security mechanism that controls which websites can call your API from a browser. Without proper CORS setup, frontend apps on different domains can't access your API.

---

## The Same-Origin Policy

Browsers enforce the **same-origin policy**: JavaScript on `https://myapp.com` can only make requests to `https://myapp.com` by default.

```
https://myapp.com → https://myapp.com/api/users     ✅ Same origin
https://myapp.com → https://api.example.com/users    ❌ Blocked by CORS
```

An origin is the combination of **scheme + host + port**:
- `https://myapp.com` and `http://myapp.com` → different origin (scheme)
- `https://myapp.com` and `https://api.myapp.com` → different origin (host)
- `http://localhost:3000` and `http://localhost:5000` → different origin (port)

---

## How CORS Works

### Simple Requests

For simple GET/POST requests, the browser adds an `Origin` header:

```
GET /api/users HTTP/1.1
Origin: https://myapp.com
```

The server must respond with:

```
Access-Control-Allow-Origin: https://myapp.com
```

### Preflight Requests

For complex requests (PUT, DELETE, custom headers), the browser sends an OPTIONS preflight:

```
OPTIONS /api/users/42 HTTP/1.1
Origin: https://myapp.com
Access-Control-Request-Method: DELETE
Access-Control-Request-Headers: Authorization
```

Server responds:

```
Access-Control-Allow-Origin: https://myapp.com
Access-Control-Allow-Methods: GET, POST, PUT, DELETE
Access-Control-Allow-Headers: Authorization, Content-Type
Access-Control-Max-Age: 86400
```

Then the browser sends the actual request.

---

## Setting Up CORS in Express

```bash
npm install cors
```

### Allow All Origins (Development)

```javascript
import cors from "cors";
app.use(cors()); // Allows all origins
```

### Allow Specific Origins (Production)

```javascript
const allowedOrigins = [
  "https://myapp.com",
  "https://www.myapp.com",
  "https://admin.myapp.com",
];

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, curl)
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true, // Allow cookies
  maxAge: 86400, // Cache preflight for 24h
}));
```

### Per-Route CORS

```javascript
// Public endpoint — allow all
app.get("/api/public/data", cors(), (req, res) => {
  res.json({ data: "public" });
});

// Private endpoint — restricted
app.get("/api/private/data", cors({ origin: "https://myapp.com" }), (req, res) => {
  res.json({ data: "private" });
});
```

---

## Common CORS Errors

```
Access to fetch at 'http://localhost:5000/api/users' from origin
'http://localhost:3000' has been blocked by CORS policy
```

**Fix**: Add `cors()` middleware to your Express app.

```
Request header field authorization is not allowed by
Access-Control-Allow-Headers in preflight response
```

**Fix**: Add `Authorization` to `allowedHeaders`.

---

## Key Takeaways

- **CORS** controls which origins can access your API from browsers
- Use the `cors` npm package for easy setup
- In **development**, allow all origins
- In **production**, whitelist specific origins
- Always include `Authorization` and `Content-Type` in allowed headers
- CORS is a **browser** security feature — it doesn't affect curl or server-to-server calls

---

Next, we'll learn about **API Keys** — the simplest form of API authentication →
