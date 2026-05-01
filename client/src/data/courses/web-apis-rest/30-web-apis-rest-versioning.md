---
title: API Versioning
---

# API Versioning

APIs evolve over time. Versioning lets you make breaking changes without disrupting existing clients.

---

## Why Version?

When you need to:
- Change the response format
- Remove or rename fields
- Change validation rules
- Restructure endpoints

Without versioning, changing the API breaks all existing clients simultaneously.

---

## Versioning Strategies

### 1. URL Path Versioning (Most Common)

```
GET /api/v1/users
GET /api/v2/users
```

```javascript
import v1Router from "./routes/v1/index.js";
import v2Router from "./routes/v2/index.js";

app.use("/api/v1", v1Router);
app.use("/api/v2", v2Router);
```

**Pros**: Clear, visible, easy to test, cacheable
**Cons**: Duplicates routes

### 2. Header Versioning

```
GET /api/users
Accept: application/vnd.myapi.v2+json
```

```javascript
app.get("/api/users", (req, res) => {
  const accept = req.headers.accept || "";
  const version = accept.includes("v2") ? 2 : 1;

  if (version === 2) {
    res.json({ data: users.map(serializeUserV2) });
  } else {
    res.json({ data: users.map(serializeUserV1) });
  }
});
```

**Pros**: Clean URLs, same resource
**Cons**: Harder to test (can't paste URL in browser), not cacheable by default

### 3. Query Parameter

```
GET /api/users?version=2
```

**Pros**: Simple
**Cons**: Pollutes query params, easy to forget

### Recommendation

Use **URL path versioning**. It's the most widely used and easiest to work with.

---

## When to Version

**Breaking changes** (require new version):
- Removing a field from the response
- Changing a field's type
- Changing a required field to optional (or vice versa)
- Changing the URL structure

**Non-breaking changes** (no new version needed):
- Adding a new field to the response
- Adding a new optional parameter
- Adding a new endpoint
- Fixing a bug

---

## Version Transition

```javascript
// v1 — original response
// GET /api/v1/users/42
{
  "id": 42,
  "name": "Alice Johnson",    // Full name as one field
  "email": "alice@example.com"
}

// v2 — split name into first/last
// GET /api/v2/users/42
{
  "id": 42,
  "firstName": "Alice",       // Breaking change
  "lastName": "Johnson",      // Breaking change
  "email": "alice@example.com"
}
```

Both versions run simultaneously. Clients migrate at their own pace.

---

## Deprecation

When retiring an old version:

1. **Announce** the deprecation date well in advance
2. **Add headers** to warn clients:

```javascript
app.use("/api/v1", (req, res, next) => {
  res.set("Deprecation", "true");
  res.set("Sunset", "2025-06-01T00:00:00Z");
  res.set("Link", '</api/v2>; rel="successor-version"');
  next();
});
```

3. **Monitor** v1 usage to know when it's safe to remove
4. **Return 410 Gone** after the sunset date

---

## Key Takeaways

- Version your API to make **breaking changes** safely
- **URL path versioning** (`/api/v1/`) is the most practical approach
- Only increment versions for **breaking changes**
- **Deprecate** old versions with headers and advance notice
- Keep the number of active versions small (2–3 max)

---

Next, we'll learn about **CORS** — enabling cross-origin API access →
