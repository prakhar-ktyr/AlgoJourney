---
title: Persisted Queries
---

# Persisted Queries

Persisted queries are pre-registered query strings identified by a hash. They improve security and performance.

---

## The Problem

Clients send full query strings on every request:

```json
{
  "query": "query GetUser($id: ID!) { user(id: $id) { name email posts { title } } }",
  "variables": { "id": "42" }
}
```

Issues:
- **Bandwidth** — query strings can be large
- **Security** — anyone can send any query
- **Parsing** — server parses the same query repeatedly

---

## How Persisted Queries Work

```
1. Build time: Register queries with hashes
   "abc123" → "query GetUser($id: ID!) { user(id: $id) { name email } }"

2. Runtime: Client sends only the hash
   { "extensions": { "persistedQuery": { "sha256Hash": "abc123" } }, "variables": { "id": "42" } }

3. Server looks up the full query by hash and executes it
```

---

## Automatic Persisted Queries (APQ)

Apollo's APQ protocol — no build step needed:

```
Client                              Server
  │                                   │
  │── Send hash only ───────────────▶│
  │                                   │ "I don't know this hash"
  │◀── PersistedQueryNotFound ───────│
  │                                   │
  │── Send hash + full query ───────▶│
  │                                   │ Cache: hash → query
  │◀── Response ────────────────────│
  │                                   │
  │── Send hash only (next time) ──▶│
  │                                   │ Found in cache!
  │◀── Response ────────────────────│
```

---

## Server Setup

```javascript
import { ApolloServer } from "@apollo/server";
import { ApolloServerPluginCacheControl } from "@apollo/server/plugin/cacheControl";

const server = new ApolloServer({
  typeDefs,
  resolvers,
  persistedQueries: {
    ttl: 900, // Cache for 15 minutes (seconds)
  },
});
```

APQ is **enabled by default** in Apollo Server 4.

---

## Client Setup (Apollo Client)

```javascript
import { createPersistedQueryLink } from "@apollo/client/link/persisted-queries";
import { createHttpLink } from "@apollo/client";
import { sha256 } from "crypto-hash";

const link = createPersistedQueryLink({ sha256 }).concat(
  createHttpLink({ uri: "/graphql" })
);
```

---

## Locked-Down Mode

For maximum security, only allow pre-registered queries:

```javascript
// At build time, generate a query manifest
const allowedQueries = {
  "abc123def456": "query GetUser($id: ID!) { ... }",
  "789ghi012jkl": "query GetPosts { ... }",
};

// Server rejects any query not in the manifest
const server = new ApolloServer({
  typeDefs,
  resolvers,
  persistedQueries: false, // Disable APQ
  plugins: [{
    async requestDidStart({ request }) {
      const hash = request.extensions?.persistedQuery?.sha256Hash;
      if (!hash || !allowedQueries[hash]) {
        throw new GraphQLError("Query not allowed");
      }
      request.query = allowedQueries[hash];
    },
  }],
});
```

---

## Benefits

| Benefit | Description |
|---------|-------------|
| **Security** | Clients can't send arbitrary queries |
| **Performance** | Smaller payloads, skip parsing |
| **Bandwidth** | Hash (64 chars) vs full query (thousands of chars) |
| **Caching** | CDN can cache by hash |

---

## Key Takeaways

- **Persisted queries** replace full query strings with hashes
- **APQ** (Automatic Persisted Queries) requires no build step
- **Locked-down mode** only allows pre-registered queries (maximum security)
- Benefits: smaller payloads, better security, CDN caching
- Apollo Server has APQ **enabled by default**

---

Next, we'll learn about **Security Best Practices** for GraphQL →
