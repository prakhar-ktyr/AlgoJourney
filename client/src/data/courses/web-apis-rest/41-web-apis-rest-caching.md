---
title: Caching Strategies
---

# Caching Strategies

Caching reduces response times and server load by storing frequently requested data closer to the client.

---

## Cache Layers

```
Client Cache → CDN → Reverse Proxy → Application Cache → Database
  (browser)   (edge)   (Nginx)       (Redis/memory)
```

---

## HTTP Caching Headers

### Cache-Control

```javascript
// Public, cacheable for 1 hour
app.get("/api/products", (req, res) => {
  res.set("Cache-Control", "public, max-age=3600");
  res.json(products);
});

// Private (user-specific), cache for 5 minutes
app.get("/api/profile", authenticate, (req, res) => {
  res.set("Cache-Control", "private, max-age=300");
  res.json(profile);
});

// Never cache
app.get("/api/notifications", (req, res) => {
  res.set("Cache-Control", "no-store");
  res.json(notifications);
});
```

### ETag (Entity Tag)

A fingerprint of the resource for conditional requests:

```javascript
import { createHash } from "crypto";

app.get("/api/products/:id", (req, res) => {
  const product = getProduct(req.params.id);
  const etag = createHash("md5").update(JSON.stringify(product)).digest("hex");

  // If client's cached version matches, return 304
  if (req.headers["if-none-match"] === `"${etag}"`) {
    return res.status(304).send();
  }

  res.set("ETag", `"${etag}"`);
  res.json(product);
});
```

---

## Application-Level Caching

### In-Memory Cache

```javascript
const cache = new Map();

function cacheMiddleware(ttlSeconds) {
  return (req, res, next) => {
    const key = req.originalUrl;
    const cached = cache.get(key);

    if (cached && Date.now() - cached.timestamp < ttlSeconds * 1000) {
      return res.json(cached.data);
    }

    // Override res.json to capture response
    const originalJson = res.json.bind(res);
    res.json = (data) => {
      cache.set(key, { data, timestamp: Date.now() });
      return originalJson(data);
    };

    next();
  };
}

// Cache for 5 minutes
app.get("/api/popular-products", cacheMiddleware(300), async (req, res) => {
  const products = await Product.find().sort({ views: -1 }).limit(20);
  res.json(products);
});
```

### Redis Cache

For production, use Redis:

```javascript
import { createClient } from "redis";
const redis = createClient();
await redis.connect();

async function redisCache(key, ttl, fetchFn) {
  const cached = await redis.get(key);
  if (cached) return JSON.parse(cached);

  const fresh = await fetchFn();
  await redis.setEx(key, ttl, JSON.stringify(fresh));
  return fresh;
}

app.get("/api/stats", async (req, res) => {
  const stats = await redisCache("stats", 60, async () => {
    return {
      totalUsers: await User.countDocuments(),
      totalPosts: await Post.countDocuments(),
    };
  });
  res.json(stats);
});
```

---

## Cache Invalidation

The hardest problem in caching. Common strategies:

```javascript
// 1. Time-based (TTL) — cache expires after N seconds
await redis.setEx("products", 300, JSON.stringify(products));

// 2. Event-based — invalidate when data changes
app.post("/api/products", async (req, res) => {
  const product = await Product.create(req.body);
  await redis.del("products"); // Invalidate cache
  res.status(201).json(product);
});

// 3. Cache-aside — read from cache, fallback to DB
async function getProduct(id) {
  const cached = await redis.get(`product:${id}`);
  if (cached) return JSON.parse(cached);

  const product = await Product.findById(id);
  if (product) await redis.setEx(`product:${id}`, 300, JSON.stringify(product));
  return product;
}
```

---

## Key Takeaways

- Use **HTTP caching headers** (Cache-Control, ETag) for client/CDN caching
- Use **Redis** for application-level caching in production
- **Cache-Control: public** for shared data, **private** for user-specific data
- **ETags** enable conditional requests (304 Not Modified)
- Cache **invalidation** is the hardest part — use TTL + event-based strategies
- Don't cache everything — focus on expensive queries and popular endpoints

---

Next, we'll learn about **Content Negotiation** — serving different response formats →
