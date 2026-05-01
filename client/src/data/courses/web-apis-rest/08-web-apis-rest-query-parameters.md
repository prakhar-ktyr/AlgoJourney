---
title: Query Parameters
---

# Query Parameters

Query parameters let clients customize API responses — filtering results, sorting data, selecting fields, and controlling pagination. They appear after the `?` in a URL.

---

## Syntax

```
/api/users?role=admin&sort=name&page=2&limit=10
           └──┬────┘ └──┬───┘ └──┬─┘ └───┬───┘
         filter by   sort by   page 2   10 per page
           role       name
```

- Start with `?`
- Separate multiple params with `&`
- Each param is `key=value`
- Values are URL-encoded

---

## Reading Query Parameters

### In Express

```javascript
app.get("/api/users", (req, res) => {
  console.log(req.query);
  // For /api/users?role=admin&sort=name
  // { role: "admin", sort: "name" }

  const role = req.query.role;     // "admin"
  const sort = req.query.sort;     // "name"
  const page = req.query.page;     // undefined (not provided)
});
```

### In the Browser

```javascript
// Using URLSearchParams
const url = new URL("https://api.example.com/users?role=admin&sort=name");
const params = url.searchParams;

params.get("role");    // "admin"
params.get("sort");    // "name"
params.has("page");    // false

// Building query strings
const search = new URLSearchParams({
  role: "admin",
  sort: "name",
  page: "2",
});
console.log(search.toString()); // "role=admin&sort=name&page=2"
```

---

## Common Query Parameter Patterns

### Filtering

Filter results by field values:

```
GET /api/users?role=admin
GET /api/users?status=active&country=US
GET /api/products?minPrice=10&maxPrice=50
GET /api/products?category=electronics&inStock=true
```

```javascript
app.get("/api/users", (req, res) => {
  let results = users;

  if (req.query.role) {
    results = results.filter((u) => u.role === req.query.role);
  }
  if (req.query.status) {
    results = results.filter((u) => u.status === req.query.status);
  }

  res.json(results);
});
```

### Sorting

```
GET /api/users?sort=name          ← Sort by name ascending
GET /api/users?sort=-createdAt    ← Sort by date descending (prefix with -)
GET /api/users?sort=role,name     ← Sort by role, then name
```

```javascript
app.get("/api/users", (req, res) => {
  let results = [...users];

  if (req.query.sort) {
    const field = req.query.sort.replace("-", "");
    const order = req.query.sort.startsWith("-") ? -1 : 1;
    results.sort((a, b) => {
      if (a[field] < b[field]) return -1 * order;
      if (a[field] > b[field]) return 1 * order;
      return 0;
    });
  }

  res.json(results);
});
```

### Pagination

```
GET /api/users?page=1&limit=20    ← Page-based
GET /api/users?offset=0&limit=20  ← Offset-based
GET /api/users?cursor=abc123      ← Cursor-based
```

```javascript
app.get("/api/users", (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = Math.min(parseInt(req.query.limit) || 20, 100);
  const skip = (page - 1) * limit;

  const paginatedUsers = users.slice(skip, skip + limit);

  res.json({
    data: paginatedUsers,
    pagination: {
      page,
      limit,
      total: users.length,
      totalPages: Math.ceil(users.length / limit),
    },
  });
});
```

### Field Selection

Return only specified fields to reduce payload size:

```
GET /api/users?fields=name,email
GET /api/users?fields=id,name,avatar
```

```javascript
app.get("/api/users", (req, res) => {
  let results = users;

  if (req.query.fields) {
    const fields = req.query.fields.split(",");
    results = results.map((user) => {
      const filtered = {};
      for (const field of fields) {
        if (user[field] !== undefined) {
          filtered[field] = user[field];
        }
      }
      return filtered;
    });
  }

  res.json(results);
});
```

### Searching

```
GET /api/users?q=alice
GET /api/users?search=john+doe
```

```javascript
app.get("/api/users", (req, res) => {
  let results = users;

  if (req.query.q) {
    const query = req.query.q.toLowerCase();
    results = results.filter(
      (u) =>
        u.name.toLowerCase().includes(query) ||
        u.email.toLowerCase().includes(query)
    );
  }

  res.json(results);
});
```

---

## Combining Parameters

A real API call often uses multiple parameters:

```
GET /api/products?category=electronics&minPrice=50&maxPrice=500&sort=-rating&page=1&limit=20&fields=name,price,rating
```

This means: "Get electronics between $50–$500, sorted by highest rating, page 1 with 20 results, showing only name, price, and rating."

---

## Array Parameters

Multiple values for one key:

```
# Repeated key
GET /api/users?role=admin&role=editor

# Comma-separated
GET /api/users?roles=admin,editor

# Bracket notation
GET /api/users?roles[]=admin&roles[]=editor
```

```javascript
// Express parses repeated keys as arrays with qs parser
// /api/users?role=admin&role=editor → req.query.role = ["admin", "editor"]

// Comma-separated (parse manually)
const roles = req.query.roles?.split(",") || [];
```

---

## Query Params vs Path Params

| Feature | Path Parameter | Query Parameter |
|---------|---------------|-----------------|
| **Purpose** | Identify a resource | Filter/modify the response |
| **Required?** | Usually yes | Usually optional |
| **Example** | `/users/42` | `/users?role=admin` |
| **When to use** | The request doesn't make sense without it | The request works without it |

```
GET /api/users/42         ← "Get user 42" (path param = identity)
GET /api/users?role=admin ← "Get users, filtered by admin role" (query param = filter)
```

---

## Validation

Always validate query parameters:

```javascript
app.get("/api/users", (req, res) => {
  const page = parseInt(req.query.page);
  if (req.query.page && (isNaN(page) || page < 1)) {
    return res.status(400).json({ error: "page must be a positive integer" });
  }

  const limit = parseInt(req.query.limit) || 20;
  if (limit < 1 || limit > 100) {
    return res.status(400).json({ error: "limit must be between 1 and 100" });
  }

  const allowedSorts = ["name", "email", "createdAt", "-name", "-email", "-createdAt"];
  if (req.query.sort && !allowedSorts.includes(req.query.sort)) {
    return res.status(400).json({ error: `sort must be one of: ${allowedSorts.join(", ")}` });
  }

  // Process valid params...
});
```

---

## Key Takeaways

- Query parameters customize **how** data is returned (filtering, sorting, pagination)
- Path parameters identify **which** resource to act on
- Always provide **defaults** for optional parameters
- **Validate** and **sanitize** all query parameters
- Use **consistent naming** across your API
- Limit pagination size to prevent abuse (e.g., max 100 per page)

---

Next, we'll cover **Request Body & Payloads** — sending data to the server →
