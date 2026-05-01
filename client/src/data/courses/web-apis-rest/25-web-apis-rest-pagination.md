---
title: Pagination
---

# Pagination

When an API has thousands of records, you can't return them all at once. Pagination splits results into manageable pages.

---

## Three Pagination Strategies

### 1. Offset-Based (Page/Limit)

The simplest and most common approach:

```
GET /api/posts?page=2&limit=20
```

```javascript
app.get("/api/posts", async (req, res) => {
  const page = Math.max(1, parseInt(req.query.page) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 20));
  const skip = (page - 1) * limit;

  const [data, total] = await Promise.all([
    Post.find().sort({ createdAt: -1 }).skip(skip).limit(limit),
    Post.countDocuments(),
  ]);

  res.json({
    data,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      hasNext: page * limit < total,
      hasPrev: page > 1,
    },
  });
});
```

**Pros**: Simple, supports random page access
**Cons**: Inconsistent results if data changes between pages, slow on large datasets (skip is O(n))

### 2. Cursor-Based

Uses a pointer to the last item on the current page:

```
GET /api/posts?cursor=eyJpZCI6MTAwfQ&limit=20
```

```javascript
app.get("/api/posts", async (req, res) => {
  const limit = Math.min(100, parseInt(req.query.limit) || 20);
  const filter = {};

  if (req.query.cursor) {
    const cursor = JSON.parse(
      Buffer.from(req.query.cursor, "base64url").toString()
    );
    filter._id = { $lt: cursor.id };
  }

  const data = await Post.find(filter)
    .sort({ _id: -1 })
    .limit(limit + 1); // Fetch one extra to check if there's a next page

  const hasNext = data.length > limit;
  if (hasNext) data.pop(); // Remove the extra item

  const nextCursor = hasNext
    ? Buffer.from(JSON.stringify({ id: data[data.length - 1]._id })).toString("base64url")
    : null;

  res.json({
    data,
    pagination: {
      limit,
      nextCursor,
      hasNext,
    },
  });
});
```

**Pros**: Consistent results, performant on large datasets
**Cons**: Can't jump to arbitrary pages, more complex

### 3. Keyset Pagination

Similar to cursor but uses actual field values:

```
GET /api/posts?after=2024-01-15T10:30:00Z&limit=20
```

```javascript
app.get("/api/posts", async (req, res) => {
  const limit = parseInt(req.query.limit) || 20;
  const filter = {};

  if (req.query.after) {
    filter.createdAt = { $lt: new Date(req.query.after) };
  }

  const data = await Post.find(filter)
    .sort({ createdAt: -1 })
    .limit(limit + 1);

  const hasNext = data.length > limit;
  if (hasNext) data.pop();

  res.json({
    data,
    pagination: {
      limit,
      hasNext,
      nextAfter: hasNext ? data[data.length - 1].createdAt : null,
    },
  });
});
```

---

## Which Strategy to Use?

| Strategy | Best For |
|----------|----------|
| **Offset** | Small datasets, admin panels, simple UIs |
| **Cursor** | Large datasets, infinite scroll, social feeds |
| **Keyset** | Time-series data, logs, ordered streams |

---

## Pagination Response with Links

Include navigation links (HATEOAS):

```javascript
const baseUrl = `/api/posts?limit=${limit}`;

res.json({
  data,
  pagination: {
    page,
    limit,
    total,
    totalPages,
  },
  links: {
    self: `${baseUrl}&page=${page}`,
    first: `${baseUrl}&page=1`,
    last: `${baseUrl}&page=${totalPages}`,
    prev: page > 1 ? `${baseUrl}&page=${page - 1}` : null,
    next: page < totalPages ? `${baseUrl}&page=${page + 1}` : null,
  },
});
```

---

## Key Takeaways

- Always **paginate** list endpoints — never return unbounded results
- **Offset pagination** is simplest and works for most cases
- **Cursor pagination** is better for large, real-time datasets
- Always include **metadata** (total, page, hasNext)
- Set a **maximum limit** (e.g., 100) to prevent abuse
- Include **navigation links** for better developer experience

---

Next, we'll implement **Sorting & Filtering** for flexible data querying →
