---
title: Performance Optimization
---

# Performance Optimization

Optimize your GraphQL API for speed and efficiency at every layer.

---

## 1. DataLoader (Batch + Cache)

Solve N+1 queries:

```javascript
// Without DataLoader: 10 posts = 11 queries
// With DataLoader: 10 posts = 2 queries
const resolvers = {
  Post: {
    author: (post, _, { loaders }) => loaders.user.load(post.authorId),
  },
};
```

---

## 2. Select Only Requested Fields

Don't fetch all columns — only what the query asks for:

```javascript
import { graphqlFields } from "graphql-fields";

const resolvers = {
  Query: {
    users: (_, __, ___, info) => {
      const requested = Object.keys(graphqlFields(info));
      // Only SELECT requested fields
      return User.find({}).select(requested.join(" "));
    },
  },
};
```

---

## 3. Database Indexes

Index fields used in filters and sorts:

```javascript
// Mongoose indexes
userSchema.index({ email: 1 }, { unique: true });
postSchema.index({ author: 1, createdAt: -1 });
postSchema.index({ status: 1, createdAt: -1 });
postSchema.index({ title: "text", body: "text" }); // Text search
```

---

## 4. Query Complexity Budgets

Prevent expensive queries:

```javascript
// Reject queries with complexity > 1000
if (complexity > 1000) {
  throw new GraphQLError("Query too complex");
}
```

---

## 5. Pagination

Never return unbounded lists:

```graphql
type Query {
  # ❌ Can return millions of rows
  posts: [Post!]!

  # ✅ Bounded
  posts(first: Int = 20, after: String): PostConnection!
}
```

---

## 6. Caching Strategy

```
Layer 1: CDN (persisted queries + GET) — minutes
Layer 2: Redis (resolver-level) — seconds to minutes
Layer 3: DataLoader (per-request) — dedup within request
Layer 4: Database query cache — seconds
```

---

## 7. Defer and Stream (Experimental)

Return data incrementally:

```graphql
query {
  user(id: "1") {
    name
    ... @defer {
      expensiveAnalytics {
        totalViews
        monthlyGrowth
      }
    }
  }
}
```

The client receives `name` immediately, then `expensiveAnalytics` when ready.

---

## 8. Monitoring

Track resolver performance:

```javascript
const timingPlugin = {
  async requestDidStart() {
    return {
      async executionDidStart() {
        return {
          willResolveField({ info }) {
            const start = Date.now();
            return () => {
              const duration = Date.now() - start;
              if (duration > 100) {
                console.warn(`Slow resolver: ${info.parentType}.${info.fieldName} (${duration}ms)`);
              }
            };
          },
        };
      },
    };
  },
};
```

---

## Performance Checklist

- [ ] DataLoader for all relationship resolvers
- [ ] Database indexes on filtered/sorted fields
- [ ] Pagination on all list fields
- [ ] Query depth and complexity limits
- [ ] Response caching (Redis + CDN)
- [ ] Select only requested fields
- [ ] Monitor slow resolvers
- [ ] Connection pooling for databases

---

## Key Takeaways

- **DataLoader** is the #1 performance optimization
- **Index** fields used in queries and filters
- **Paginate** every list — never return unbounded data
- **Cache** at multiple layers (CDN, Redis, DataLoader)
- **Monitor** resolver performance to find bottlenecks

---

Next, we'll learn about **Apollo Client Setup** — the client side →
