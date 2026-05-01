---
title: Content Negotiation & Compression
---

# Content Negotiation & Compression

Content negotiation lets clients request different response formats. Compression reduces payload sizes for faster transfers.

---

## Content Negotiation

The client specifies preferred formats via the `Accept` header:

```
GET /api/users/42
Accept: application/json        → JSON response
Accept: application/xml         → XML response
Accept: text/csv                → CSV response
```

### Implementation

```javascript
app.get("/api/users/:id", (req, res) => {
  const user = { id: 42, name: "Alice", email: "alice@example.com" };

  res.format({
    "application/json": () => res.json(user),
    "text/csv": () => {
      res.type("csv").send(`id,name,email\n${user.id},${user.name},${user.email}`);
    },
    default: () => res.status(406).json({ error: "Not Acceptable" }),
  });
});
```

Most APIs only support JSON, which is fine. Document what formats you support.

---

## Response Compression

Compress responses to reduce bandwidth:

```bash
npm install compression
```

```javascript
import compression from "compression";

app.use(compression({
  threshold: 1024, // Only compress responses > 1KB
  filter: (req, res) => {
    // Don't compress if client doesn't accept it
    if (req.headers["x-no-compression"]) return false;
    return compression.filter(req, res);
  },
}));
```

This enables **gzip** and **Brotli** compression automatically. A 50KB JSON response might shrink to 5KB.

---

## Compression Headers

```
Request:
Accept-Encoding: gzip, deflate, br

Response:
Content-Encoding: gzip
Content-Length: 4521    (compressed size)
```

---

## Key Takeaways

- Use the `Accept` header for content negotiation
- Most APIs only need **JSON** — that's fine
- Use the `compression` middleware to **gzip** responses
- Compression reduces bandwidth significantly for JSON payloads
- Set a **threshold** — don't compress tiny responses

---

Next, we'll learn about **Webhooks** — server-to-server event notifications →
