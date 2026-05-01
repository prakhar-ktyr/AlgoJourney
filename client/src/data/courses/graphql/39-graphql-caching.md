---
title: Caching
---

# Caching

Caching reduces database load and improves response times. GraphQL caching is more nuanced than REST due to the single endpoint.

---

## Caching Layers

```
Client Cache (Apollo Client)
    ↓
CDN Cache (persisted queries)
    ↓
Server Response Cache (Redis)
    ↓
DataLoader (per-request dedup)
    ↓
Database
```

---

## Server-Side Response Caching

Cache entire query responses:

```javascript
import responseCachePlugin from "@apollo/server-plugin-response-cache";

const server = new ApolloServer({
  typeDefs,
  resolvers,
  plugins: [responseCachePlugin()],
});
```

Control caching with directives:

```graphql
type Query {
  posts: [Post!]! @cacheControl(maxAge: 300)    # Cache 5 minutes
  me: User! @cacheControl(maxAge: 0, scope: PRIVATE)  # Never cache
}

type Post {
  id: ID!
  title: String! @cacheControl(maxAge: 3600)    # 1 hour
  viewCount: Int! @cacheControl(maxAge: 60)     # 1 minute
}
```

---

## Redis Caching in Resolvers

```javascript
import Redis from "ioredis";
const redis = new Redis();

const resolvers = {
  Query: {
    post: async (_, { id }) => {
      // Check cache first
      const cached = await redis.get(`post:${id}`);
      if (cached) return JSON.parse(cached);

      // Fetch from DB
      const post = await Post.findById(id);
      if (post) {
        await redis.setex(`post:${id}`, 300, JSON.stringify(post)); // Cache 5 min
      }
      return post;
    },
  },
  Mutation: {
    updatePost: async (_, { id, input }) => {
      const post = await Post.findByIdAndUpdate(id, input, { new: true });
      // Invalidate cache
      await redis.del(`post:${id}`);
      return post;
    },
  },
};
```

---

## CDN Caching

With persisted queries, CDNs can cache responses by query hash:

```
GET /graphql?extensions={"persistedQuery":{"sha256Hash":"abc123"}}&variables={}
```

Set HTTP cache headers:

```javascript
const server = new ApolloServer({
  typeDefs,
  resolvers,
  plugins: [
    responseCachePlugin(),
    {
      async requestDidStart() {
        return {
          async willSendResponse({ response }) {
            // Set cache headers for CDN
            response.http.headers.set("Cache-Control", "public, max-age=300");
          },
        };
      },
    },
  ],
});
```

---

## Cache Invalidation

```javascript
// Pattern: Invalidate on mutation
Mutation: {
  createPost: async (_, { input }, { user }) => {
    const post = await Post.create({ ...input, author: user.id });
    // Invalidate related caches
    await redis.del("posts:list");
    await redis.del(`user:${user.id}:posts`);
    return post;
  },
}
```

---

## Key Takeaways

- Cache at **multiple levels**: client, CDN, server, DataLoader
- Use **@cacheControl** directive for declarative cache policies
- **Redis** for server-side caching of expensive queries
- **Invalidate** cache on mutations
- **Persisted queries** enable CDN caching

---

Next, we'll learn about **Federation & Microservices** →
