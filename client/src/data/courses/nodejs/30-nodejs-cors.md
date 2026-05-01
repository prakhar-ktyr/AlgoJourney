---
title: Node.js CORS
---

# Node.js CORS

**CORS** (Cross-Origin Resource Sharing) is a security mechanism that controls which websites can make requests to your API. If your front end is on `localhost:3000` and your API is on `localhost:5000`, the browser blocks the request unless CORS is configured.

## The same-origin policy

Browsers enforce the **same-origin policy**: JavaScript on `https://myapp.com` can only make requests to `https://myapp.com`. Requests to `https://api.example.com` are blocked.

An "origin" is the combination of protocol + hostname + port:

```
https://myapp.com:443    ← origin
https://myapp.com:3000   ← different origin (different port)
http://myapp.com:443     ← different origin (different protocol)
https://api.myapp.com    ← different origin (different hostname)
```

## How CORS works

When a browser makes a cross-origin request, it:

1. **Simple requests** (GET, POST with simple headers): The browser sends the request and checks the response headers.
2. **Preflight requests** (PUT, DELETE, custom headers): The browser sends an OPTIONS request first to ask permission.

### Preflight flow

```
Browser                           Server
  │                                  │
  │── OPTIONS /api/users ──────────>│  ← "Can I make this request?"
  │   Origin: https://myapp.com     │
  │   Access-Control-Request-Method: DELETE
  │                                  │
  │<── 204 No Content ─────────────│  ← "Yes, you can"
  │   Access-Control-Allow-Origin: https://myapp.com
  │   Access-Control-Allow-Methods: GET, POST, DELETE
  │                                  │
  │── DELETE /api/users/42 ────────>│  ← actual request
  │   Origin: https://myapp.com     │
  │                                  │
  │<── 200 OK ─────────────────────│  ← actual response
  │   Access-Control-Allow-Origin: https://myapp.com
```

## Setting up CORS with the cors package

```bash
npm install cors
```

### Allow all origins (development)

```javascript
import express from "express";
import cors from "cors";

const app = express();
app.use(cors()); // allows ALL origins
```

### Allow specific origins (production)

```javascript
app.use(cors({
  origin: "https://myapp.com",
}));
```

### Multiple origins

```javascript
app.use(cors({
  origin: [
    "https://myapp.com",
    "https://admin.myapp.com",
    "http://localhost:3000", // for development
  ],
}));
```

### Dynamic origin

```javascript
const allowedOrigins = [
  "https://myapp.com",
  "https://admin.myapp.com",
];

if (process.env.NODE_ENV !== "production") {
  allowedOrigins.push("http://localhost:3000");
}

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, curl, Postman)
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
}));
```

## CORS options

```javascript
app.use(cors({
  origin: "https://myapp.com",
  methods: ["GET", "POST", "PUT", "DELETE"],     // allowed HTTP methods
  allowedHeaders: ["Content-Type", "Authorization"], // allowed request headers
  exposedHeaders: ["X-Total-Count"],              // headers the browser can read
  credentials: true,                              // allow cookies/auth headers
  maxAge: 86400,                                  // preflight cache duration (seconds)
}));
```

### credentials: true

If your client sends cookies or the `Authorization` header:

```javascript
// Server
app.use(cors({
  origin: "https://myapp.com", // must be specific, not "*"
  credentials: true,
}));

// Client (fetch)
fetch("https://api.myapp.com/data", {
  credentials: "include", // send cookies
});
```

> **Important:** When `credentials: true`, the `origin` cannot be `*`. You must specify the exact origin.

## Per-route CORS

```javascript
import cors from "cors";

// Public API — allow all origins
app.get("/api/public", cors(), (req, res) => {
  res.json({ message: "Anyone can access this" });
});

// Restricted API — specific origin only
const restrictedCors = cors({ origin: "https://admin.myapp.com" });
app.get("/api/admin", restrictedCors, (req, res) => {
  res.json({ message: "Admin only" });
});
```

## Manual CORS (without the cors package)

If you want to understand what the `cors` package does under the hood:

```javascript
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "https://myapp.com");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Max-Age", "86400");

  // Handle preflight
  if (req.method === "OPTIONS") {
    return res.status(204).end();
  }

  next();
});
```

## Common CORS errors

### "No 'Access-Control-Allow-Origin' header is present"

The server isn't sending CORS headers. Add the `cors` middleware.

### "Credential is not supported if the CORS header 'Access-Control-Allow-Origin' is '*'"

When using cookies/auth, you can't use `origin: "*"`. Specify the exact origin.

### "Method DELETE is not allowed by Access-Control-Allow-Methods"

Add the method to the `methods` array:

```javascript
cors({ methods: ["GET", "POST", "PUT", "DELETE"] })
```

### "Request header field Authorization is not allowed"

Add it to `allowedHeaders`:

```javascript
cors({ allowedHeaders: ["Content-Type", "Authorization"] })
```

## CORS in development

During development, your React dev server (port 3000) calls your API (port 5000). Two approaches:

### 1. Configure CORS on the server

```javascript
if (process.env.NODE_ENV !== "production") {
  app.use(cors({ origin: "http://localhost:3000", credentials: true }));
}
```

### 2. Use a proxy in the dev server

In `vite.config.js`:

```javascript
export default {
  server: {
    proxy: {
      "/api": "http://localhost:5000",
    },
  },
};
```

The proxy approach avoids CORS entirely in development — the browser thinks it's talking to the same origin.

## Key takeaways

- CORS controls which origins can call your API from a browser.
- Use the `cors` package for easy configuration.
- In production, always specify exact allowed origins — never `*` with credentials.
- Use a dev server proxy to avoid CORS issues during development.
- Preflight (OPTIONS) requests happen automatically for non-simple requests.
