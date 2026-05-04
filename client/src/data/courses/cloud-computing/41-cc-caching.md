---
title: "Caching Strategies in the Cloud"
---

# Caching Strategies in the Cloud

Caching is one of the most powerful techniques for improving application performance, reducing latency, and lowering costs in cloud environments. In this lesson, you'll learn about different cache types, caching patterns, cloud services, and best practices for designing effective caching strategies.

---

## Why Caching Matters

Every time your application fetches data from a database, calls an external API, or computes a result, it takes time and resources. Caching stores the result so future requests can be served faster.

### The Performance Impact

| Metric               | Without Cache | With Cache   | Improvement |
|-----------------------|---------------|--------------|-------------|
| Database query        | 50–200 ms     | 1–5 ms       | 10–100x     |
| API response time     | 300–1000 ms   | 5–20 ms      | 15–200x     |
| Page load time        | 2–5 s         | 0.3–1 s      | 3–7x        |
| Database load         | 100%          | 10–30%       | 3–10x       |
| Monthly cost          | $1000         | $300–$500    | 2–3x        |

### Key Benefits

- **Reduced latency** — serve responses in milliseconds instead of seconds
- **Lower database load** — fewer queries hitting your primary database
- **Cost savings** — fewer compute cycles and database IOPS consumed
- **Better scalability** — handle more concurrent users with the same infrastructure
- **Improved availability** — serve cached data even if the origin is temporarily down

---

## Cache Types

Different layers of your application can benefit from different types of caching.

### 1. In-Memory Cache

Stores data directly in the application's memory (RAM). The fastest type of cache.

```python
# Simple in-memory cache using a dictionary
class InMemoryCache:
    def __init__(self):
        self._store = {}

    def get(self, key):
        entry = self._store.get(key)
        if entry is None:
            return None
        if entry["expires_at"] < time.time():
            del self._store[key]
            return None
        return entry["value"]

    def set(self, key, value, ttl_seconds=300):
        self._store[key] = {
            "value": value,
            "expires_at": time.time() + ttl_seconds,
        }
```

**Best for:** Single-instance applications, configuration data, small lookup tables.

**Limitations:** Not shared across multiple instances; data lost on restart.

### 2. Distributed Cache

A shared cache accessible by multiple application instances over the network.

```
┌─────────┐     ┌─────────┐     ┌─────────┐
│  App 1  │     │  App 2  │     │  App 3  │
└────┬────┘     └────┬────┘     └────┬────┘
     │               │               │
     └───────────────┼───────────────┘
                     │
              ┌──────┴──────┐
              │  Redis /    │
              │  Memcached  │
              └─────────────┘
```

**Best for:** Microservices, horizontally scaled applications, session storage.

### 3. CDN Cache (Content Delivery Network)

Caches static and dynamic content at edge locations around the world, close to end users.

```
User in Tokyo  ──→  Edge (Tokyo)    ──→  Cache HIT  ──→  Response (5 ms)
User in London ──→  Edge (London)   ──→  Cache MISS ──→  Origin (200 ms)
                                         then cached for next request
```

| CDN Service         | Provider | Key Feature                  |
|---------------------|----------|------------------------------|
| CloudFront          | AWS      | Deep integration with S3     |
| Azure CDN / Front Door | Azure | Global load balancing        |
| Cloud CDN           | GCP      | Anycast IP, HTTP/3 support   |
| Cloudflare          | Third-party | DDoS protection built-in  |

### 4. Database Cache

Caching at the database layer to speed up repeated queries.

- **Query result cache** — stores the result of a specific SQL query
- **Buffer pool** — keeps frequently accessed data pages in memory
- **Materialized views** — precomputed query results stored as tables

```sql
-- MySQL query cache (deprecated in 8.0, but illustrates the concept)
SELECT SQL_CACHE * FROM products WHERE category = 'electronics';

-- PostgreSQL materialized view (acts as a database-level cache)
CREATE MATERIALIZED VIEW popular_products AS
SELECT p.id, p.name, COUNT(o.id) AS order_count
FROM products p
JOIN orders o ON o.product_id = p.id
GROUP BY p.id, p.name
ORDER BY order_count DESC
LIMIT 100;

-- Refresh the materialized view periodically
REFRESH MATERIALIZED VIEW popular_products;
```

### 5. Application-Level Cache

Caching computed results, API responses, or rendered templates within the application.

```javascript
// Express.js middleware for API response caching
const redis = require("redis");
const client = redis.createClient();

function cacheMiddleware(ttlSeconds = 300) {
  return async (req, res, next) => {
    const key = `api:${req.originalUrl}`;
    const cached = await client.get(key);

    if (cached) {
      return res.json(JSON.parse(cached));
    }

    // Override res.json to cache the response
    const originalJson = res.json.bind(res);
    res.json = async (data) => {
      await client.setEx(key, ttlSeconds, JSON.stringify(data));
      return originalJson(data);
    };

    next();
  };
}

app.get("/api/products", cacheMiddleware(600), getProducts);
```

---

## Caching Patterns

Choosing the right caching pattern depends on your read/write ratio and consistency requirements.

### 1. Cache-Aside (Lazy Loading)

The application checks the cache first. On a miss, it fetches from the database, stores the result in the cache, and returns it.

```
   Read Request
        │
        ▼
   ┌─────────┐    Cache HIT
   │  Cache   │──────────────→ Return data
   └────┬────┘
        │ Cache MISS
        ▼
   ┌─────────┐
   │ Database │──→ Write to cache ──→ Return data
   └─────────┘
```

```python
def get_user(user_id):
    # Step 1: Check the cache
    cache_key = f"user:{user_id}"
    cached = redis_client.get(cache_key)
    if cached:
        return json.loads(cached)

    # Step 2: Fetch from database on cache miss
    user = db.query("SELECT * FROM users WHERE id = %s", user_id)
    if user is None:
        return None

    # Step 3: Populate the cache
    redis_client.setex(cache_key, 3600, json.dumps(user))

    return user
```

**Pros:** Only caches data that is actually requested; resilient to cache failures.

**Cons:** Initial request is slower (cache miss + write); potential for stale data.

### 2. Write-Through

Every write goes to both the cache and the database simultaneously.

```
   Write Request
        │
        ▼
   ┌─────────┐
   │  Cache   │ ←── Write
   └────┬────┘
        │
        ▼
   ┌─────────┐
   │ Database │ ←── Write
   └─────────┘
```

```python
def update_user(user_id, data):
    # Step 1: Update the database
    db.execute(
        "UPDATE users SET name=%s, email=%s WHERE id=%s",
        data["name"], data["email"], user_id,
    )

    # Step 2: Update the cache immediately
    cache_key = f"user:{user_id}"
    redis_client.setex(cache_key, 3600, json.dumps(data))

    return data
```

**Pros:** Cache is always consistent with the database.

**Cons:** Higher write latency; caches data that may never be read.

### 3. Write-Behind (Write-Back)

Writes go to the cache first. The cache asynchronously writes to the database later.

```
   Write Request
        │
        ▼
   ┌─────────┐
   │  Cache   │ ←── Write (immediate)
   └────┬────┘
        │ async (batched)
        ▼
   ┌─────────┐
   │ Database │ ←── Write (delayed)
   └─────────┘
```

**Pros:** Very fast writes; can batch multiple writes together.

**Cons:** Risk of data loss if the cache fails before writing to the database.

### 4. Read-Through

Similar to cache-aside, but the cache itself is responsible for loading data from the database on a miss.

```python
# Conceptual read-through cache
class ReadThroughCache:
    def __init__(self, cache_client, db_client, ttl=3600):
        self.cache = cache_client
        self.db = db_client
        self.ttl = ttl

    def get(self, key, query_fn):
        cached = self.cache.get(key)
        if cached:
            return json.loads(cached)

        # Cache handles the database fetch internally
        result = query_fn(self.db)
        if result:
            self.cache.setex(key, self.ttl, json.dumps(result))
        return result

# Usage
cache = ReadThroughCache(redis_client, db)
user = cache.get(
    f"user:{user_id}",
    lambda db: db.query("SELECT * FROM users WHERE id = %s", user_id),
)
```

### Pattern Comparison

| Pattern       | Read Perf | Write Perf | Consistency | Complexity | Best For                |
|---------------|-----------|------------|-------------|------------|-------------------------|
| Cache-Aside   | Good      | N/A        | Eventual    | Low        | Read-heavy workloads    |
| Write-Through | Good      | Slower     | Strong      | Medium     | Read-heavy, consistent  |
| Write-Behind  | Good      | Fast       | Eventual    | High       | Write-heavy workloads   |
| Read-Through  | Good      | N/A        | Eventual    | Medium     | Simplified cache logic  |

---

## Cloud Caching Services

### AWS ElastiCache

AWS offers two managed caching engines:

| Feature           | Redis                  | Memcached             |
|-------------------|------------------------|-----------------------|
| Data structures   | Strings, lists, sets,  | Simple key-value only |
|                   | hashes, sorted sets    |                       |
| Persistence       | Yes (RDB/AOF)          | No                    |
| Replication       | Yes (read replicas)    | No                    |
| Cluster mode      | Yes                    | Yes (multi-node)      |
| Pub/Sub           | Yes                    | No                    |
| Lua scripting     | Yes                    | No                    |
| Max item size     | 512 MB                 | 1 MB                  |

```bash
# Create a Redis cluster with AWS CLI
aws elasticache create-cache-cluster \
  --cache-cluster-id my-redis \
  --engine redis \
  --cache-node-type cache.r6g.large \
  --num-cache-nodes 1
```

### Azure Cache for Redis

```bash
# Create Azure Cache for Redis
az redis create \
  --name my-redis-cache \
  --resource-group myResourceGroup \
  --location eastus \
  --sku Standard \
  --vm-size C1
```

### GCP Memorystore

```bash
# Create a Memorystore for Redis instance
gcloud redis instances create my-instance \
  --size=1 \
  --region=us-central1 \
  --redis-version=redis_7_0 \
  --tier=standard
```

### Service Comparison

| Feature            | ElastiCache         | Azure Cache for Redis | Memorystore         |
|--------------------|---------------------|-----------------------|---------------------|
| Engines            | Redis, Memcached    | Redis                 | Redis, Memcached    |
| Max memory         | 635 GB (cluster)    | 1.2 TB (Enterprise)   | 300 GB              |
| Multi-AZ           | Yes                 | Yes                   | Yes                 |
| Auto-failover      | Yes                 | Yes                   | Yes                 |
| Encryption at rest | Yes                 | Yes                   | Yes (CMEK)          |
| VPC integration    | Yes                 | VNet                  | VPC                 |

---

## Cache Invalidation Strategies

> "There are only two hard things in Computer Science: cache invalidation and naming things."
> — Phil Karlton

### 1. Time-To-Live (TTL)

Set an expiration time on cached data. After the TTL expires, the cache entry is removed.

```python
# Set TTL based on data volatility
CACHE_TTLS = {
    "user_profile": 3600,       # 1 hour — changes infrequently
    "product_listing": 300,     # 5 minutes — moderate updates
    "stock_price": 10,          # 10 seconds — changes rapidly
    "static_config": 86400,     # 24 hours — rarely changes
}

def cache_set(key, value, category):
    ttl = CACHE_TTLS.get(category, 300)
    redis_client.setex(key, ttl, json.dumps(value))
```

### 2. Event-Driven Invalidation

Invalidate cache entries when the underlying data changes.

```python
def update_product(product_id, data):
    # Update the database
    db.execute("UPDATE products SET ... WHERE id = %s", product_id)

    # Invalidate related cache entries
    redis_client.delete(f"product:{product_id}")
    redis_client.delete(f"product_list:all")
    redis_client.delete(f"category:{data['category']}")
```

### 3. Version-Based Invalidation

Append a version number to cache keys. Increment the version to invalidate all related entries.

```python
def get_cache_version(entity_type):
    version = redis_client.get(f"version:{entity_type}")
    return version or "1"

def get_product(product_id):
    version = get_cache_version("products")
    key = f"product:v{version}:{product_id}"
    cached = redis_client.get(key)
    if cached:
        return json.loads(cached)
    # ... fetch from DB and cache

def invalidate_products():
    redis_client.incr("version:products")
```

---

## Session Caching

Storing user sessions in a distributed cache enables stateless application servers.

```javascript
// Express.js session stored in Redis
const session = require("express-session");
const RedisStore = require("connect-redis").default;

app.use(
  session({
    store: new RedisStore({ client: redisClient }),
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: true,
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    },
  })
);
```

### Why Cache Sessions?

| Approach           | Scalability | Speed   | Persistence | Complexity |
|--------------------|-------------|---------|-------------|------------|
| In-memory (server) | Poor        | Fastest | None        | Low        |
| Database           | Good        | Slow    | Strong      | Low        |
| Redis/Memcached    | Excellent   | Fast    | Optional    | Medium     |
| Signed cookies     | Excellent   | Fast    | Client-side | Low        |

---

## Cache Warming

Pre-populating the cache with expected data before traffic arrives.

```python
async def warm_cache():
    """Pre-load frequently accessed data into cache."""
    # Top 100 products
    products = db.query(
        "SELECT * FROM products ORDER BY view_count DESC LIMIT 100"
    )
    for product in products:
        key = f"product:{product['id']}"
        redis_client.setex(key, 3600, json.dumps(product))

    # Category listings
    categories = db.query("SELECT DISTINCT category FROM products")
    for cat in categories:
        products = db.query(
            "SELECT * FROM products WHERE category = %s", cat
        )
        redis_client.setex(
            f"category:{cat}", 1800, json.dumps(products)
        )

    print(f"Cache warmed: {len(products)} products, {len(categories)} categories")
```

**When to warm the cache:**

- Application startup / deployment
- Before expected traffic spikes (e.g., product launch, sale event)
- After a cache flush or infrastructure change
- On a schedule for time-sensitive data

---

## Monitoring Cache Performance

### Key Metrics to Track

| Metric               | Target        | What It Tells You                        |
|----------------------|---------------|------------------------------------------|
| Cache hit rate       | > 90%         | How often the cache serves requests      |
| Cache miss rate      | < 10%         | How often data must be fetched from DB   |
| Eviction count       | Low / stable  | Whether the cache has enough memory      |
| Memory usage         | < 80%         | Room for growth                          |
| Latency (p99)        | < 5 ms        | Cache response time                      |
| Connection count     | Within limits | Number of active client connections      |

```bash
# Redis CLI — quick health check
redis-cli INFO stats | grep -E "keyspace_hits|keyspace_misses"

# Calculate hit rate
# hit_rate = keyspace_hits / (keyspace_hits + keyspace_misses) * 100
```

```python
def log_cache_metrics():
    info = redis_client.info("stats")
    hits = info["keyspace_hits"]
    misses = info["keyspace_misses"]
    total = hits + misses
    hit_rate = (hits / total * 100) if total > 0 else 0
    print(f"Cache hit rate: {hit_rate:.1f}%  (hits={hits}, misses={misses})")
```

---

## Common Pitfalls

### 1. Thundering Herd

When a popular cache entry expires, many requests simultaneously hit the database.

```
Cache expires at T=0
  T=0.001  Request A → cache MISS → query DB
  T=0.002  Request B → cache MISS → query DB
  T=0.003  Request C → cache MISS → query DB
  ...hundreds of concurrent DB queries
```

**Solution:** Use a lock so only one request fetches from the DB.

```python
def get_with_lock(key, fetch_fn, ttl=3600):
    cached = redis_client.get(key)
    if cached:
        return json.loads(cached)

    lock_key = f"lock:{key}"
    # Try to acquire a lock (SET NX with expiration)
    if redis_client.set(lock_key, "1", nx=True, ex=10):
        try:
            result = fetch_fn()
            redis_client.setex(key, ttl, json.dumps(result))
            return result
        finally:
            redis_client.delete(lock_key)
    else:
        # Another process is fetching; wait and retry
        time.sleep(0.1)
        return get_with_lock(key, fetch_fn, ttl)
```

### 2. Cache Stampede

Similar to thundering herd but caused by cache warming or bulk invalidation.

**Solution:** Stagger TTLs with random jitter.

```python
import random

def set_with_jitter(key, value, base_ttl=3600):
    # Add ±10% random jitter to prevent simultaneous expirations
    jitter = random.randint(-base_ttl // 10, base_ttl // 10)
    ttl = base_ttl + jitter
    redis_client.setex(key, ttl, json.dumps(value))
```

### 3. Cache Penetration

Repeated requests for data that doesn't exist bypass the cache every time.

**Solution:** Cache null results with a short TTL.

```python
def get_user_safe(user_id):
    key = f"user:{user_id}"
    cached = redis_client.get(key)

    if cached == "NULL_MARKER":
        return None  # Known non-existent
    if cached:
        return json.loads(cached)

    user = db.query("SELECT * FROM users WHERE id = %s", user_id)
    if user is None:
        # Cache the "not found" result to prevent repeated DB hits
        redis_client.setex(key, 60, "NULL_MARKER")
        return None

    redis_client.setex(key, 3600, json.dumps(user))
    return user
```

### 4. Hot Key Problem

A single cache key receives disproportionate traffic, overloading one cache node.

**Solution:** Replicate the hot key across multiple keys.

```python
import random

def get_hot_key(base_key, replicas=5):
    replica_index = random.randint(0, replicas - 1)
    key = f"{base_key}:r{replica_index}"
    return redis_client.get(key)

def set_hot_key(base_key, value, ttl=3600, replicas=5):
    for i in range(replicas):
        key = f"{base_key}:r{i}"
        redis_client.setex(key, ttl, json.dumps(value))
```

---

## Exercises

### Exercise 1: Choose the Right Pattern

For each scenario, decide which caching pattern (cache-aside, write-through, write-behind, or read-through) is most appropriate:

1. An e-commerce product catalog with 10,000 products, updated once daily.
2. A real-time stock ticker with prices changing every second.
3. A social media feed that is read 1,000x more than it is written.
4. A logging service that writes 100,000 events per second.

**Answers:**

1. **Cache-aside** — infrequent writes, read-heavy; lazy-load on demand.
2. **Write-through** — need the cache always in sync with the latest price.
3. **Cache-aside** or **Read-through** — read-heavy, lazy loading is efficient.
4. **Write-behind** — high write throughput benefits from buffering and batching.

### Exercise 2: Design a TTL Strategy

Assign appropriate TTL values and justify your choices:

| Data Type                | Suggested TTL | Reason                                  |
|--------------------------|---------------|-----------------------------------------|
| User profile             | ?             |                                         |
| Product price            | ?             |                                         |
| News article list        | ?             |                                         |
| Static site navigation   | ?             |                                         |
| Real-time dashboard data | ?             |                                         |

### Exercise 3: Implement Cache-Aside

Write a cache-aside function in your preferred language that:
- Accepts a cache key, a database query function, and a TTL
- Returns cached data on hit
- Fetches from DB, caches, and returns on miss
- Handles the thundering herd problem with a lock

---

## Key Takeaways

- **Caching dramatically improves performance** — often 10–100x faster reads.
- **Choose the right cache type** for each layer: CDN for static assets, distributed cache for shared state, in-memory for single-instance hot data.
- **Cache-aside is the most common pattern** — simple, flexible, and resilient.
- **Cache invalidation is hard** — use TTL as a safety net, event-driven invalidation for consistency, and version keys for bulk invalidation.
- **Monitor your cache** — track hit rate, memory usage, and latency; a low hit rate means your caching strategy needs adjustment.
- **Plan for failure** — caches should enhance performance, not be a single point of failure. Your app should still work (slower) if the cache is down.
- **Beware of thundering herd and cache stampede** — use locks and TTL jitter to prevent database overload when cache entries expire.

---

## Further Reading

- AWS ElastiCache Best Practices
- Redis documentation on caching patterns
- Azure Cache for Redis — Performance best practices
- Google Cloud Memorystore documentation
- Martin Fowler — "Caching Patterns"
