---
title: Sorting & Filtering
---

# Sorting & Filtering

Good APIs let clients request exactly the data they need. Sorting and filtering are essential features for any list endpoint.

---

## Filtering

Let clients narrow results by field values:

```
GET /api/products?category=electronics
GET /api/products?minPrice=50&maxPrice=200
GET /api/products?inStock=true&brand=Apple
```

### Implementation

```javascript
app.get("/api/products", async (req, res) => {
  const filter = {};

  // Exact match
  if (req.query.category) filter.category = req.query.category;
  if (req.query.brand) filter.brand = req.query.brand;

  // Boolean
  if (req.query.inStock !== undefined) {
    filter.inStock = req.query.inStock === "true";
  }

  // Range
  if (req.query.minPrice || req.query.maxPrice) {
    filter.price = {};
    if (req.query.minPrice) filter.price.$gte = Number(req.query.minPrice);
    if (req.query.maxPrice) filter.price.$lte = Number(req.query.maxPrice);
  }

  // Date range
  if (req.query.since || req.query.until) {
    filter.createdAt = {};
    if (req.query.since) filter.createdAt.$gte = new Date(req.query.since);
    if (req.query.until) filter.createdAt.$lte = new Date(req.query.until);
  }

  // Text search
  if (req.query.q) {
    filter.$text = { $search: req.query.q };
  }

  const products = await Product.find(filter);
  res.json({ data: products, total: products.length });
});
```

### Whitelist Allowed Filters

Never pass user input directly to the database. Always whitelist:

```javascript
const ALLOWED_FILTERS = ["category", "brand", "inStock"];

function buildFilter(query) {
  const filter = {};
  for (const key of ALLOWED_FILTERS) {
    if (query[key] !== undefined) {
      filter[key] = query[key];
    }
  }
  return filter;
}
```

---

## Sorting

Let clients control the order of results:

```
GET /api/products?sort=price         ← Ascending by price
GET /api/products?sort=-price        ← Descending by price
GET /api/products?sort=-rating,price ← By rating desc, then price asc
```

### Implementation

```javascript
const ALLOWED_SORT_FIELDS = ["name", "price", "rating", "createdAt"];

app.get("/api/products", async (req, res) => {
  let sortOption = {};

  if (req.query.sort) {
    const fields = req.query.sort.split(",");
    for (const field of fields) {
      const isDesc = field.startsWith("-");
      const fieldName = isDesc ? field.slice(1) : field;

      if (ALLOWED_SORT_FIELDS.includes(fieldName)) {
        sortOption[fieldName] = isDesc ? -1 : 1;
      }
    }
  }

  // Default sort
  if (Object.keys(sortOption).length === 0) {
    sortOption = { createdAt: -1 };
  }

  const products = await Product.find().sort(sortOption);
  res.json({ data: products });
});
```

---

## Field Selection

Let clients request only the fields they need:

```
GET /api/products?fields=name,price,rating
```

```javascript
app.get("/api/products", async (req, res) => {
  let projection = {};

  if (req.query.fields) {
    const allowed = ["name", "price", "rating", "category", "image"];
    const requested = req.query.fields.split(",");
    for (const field of requested) {
      if (allowed.includes(field)) {
        projection[field] = 1;
      }
    }
  }

  const products = await Product.find({}, projection);
  res.json({ data: products });
});
```

---

## Search

Full-text search across multiple fields:

```
GET /api/products?q=wireless+headphones
```

```javascript
// Add text index to your schema
productSchema.index({ name: "text", description: "text" });

app.get("/api/products", async (req, res) => {
  const filter = {};

  if (req.query.q) {
    filter.$text = { $search: req.query.q };
  }

  const products = await Product.find(filter);
  res.json({ data: products });
});
```

For simple substring search without a text index:

```javascript
if (req.query.q) {
  const regex = new RegExp(escapeRegex(req.query.q), "i");
  filter.$or = [{ name: regex }, { description: regex }];
}

// Escape special regex characters for safety
function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
```

---

## Combining Everything

A single endpoint with all features:

```
GET /api/products?category=electronics&minPrice=50&sort=-rating&fields=name,price,rating&page=1&limit=20&q=wireless
```

```javascript
app.get("/api/products", async (req, res) => {
  // 1. Build filter
  const filter = buildFilter(req.query);

  // 2. Build sort
  const sort = buildSort(req.query.sort);

  // 3. Build projection
  const projection = buildProjection(req.query.fields);

  // 4. Pagination
  const page = Math.max(1, parseInt(req.query.page) || 1);
  const limit = Math.min(100, parseInt(req.query.limit) || 20);
  const skip = (page - 1) * limit;

  // 5. Execute
  const [data, total] = await Promise.all([
    Product.find(filter, projection).sort(sort).skip(skip).limit(limit),
    Product.countDocuments(filter),
  ]);

  res.json({
    data,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  });
});
```

---

## Key Takeaways

- **Whitelist** all filter fields, sort fields, and projection fields
- Use `-field` convention for **descending** sort
- Support **range filters** for numeric and date fields
- Combine filtering, sorting, field selection, and pagination in one endpoint
- **Escape** user input used in regex queries
- Set sensible **defaults** for all parameters

---

Next, we'll learn about **Error Handling** — building resilient APIs →
