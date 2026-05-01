---
title: Rate Limiting
---

# Rate Limiting

Rate limiting prevents abuse by restricting how many requests a client can make in a given time window.

---

## HTTP-Level Rate Limiting

The simplest approach — limit requests to the `/graphql` endpoint:

```javascript
import { rateLimit } from "express-rate-limit";

const limiter = rateLimit({
  windowMs: 60 * 1000,  // 1 minute
  max: 100,             // 100 requests per minute
  message: { errors: [{ message: "Too many requests" }] },
});

app.use("/graphql", limiter, expressMiddleware(server));
```

---

## Query Complexity Limiting

A single GraphQL request can be very expensive. Limit by **complexity score**:

```graphql
# This query fetches potentially thousands of items
query {
  users(first: 100) {
    posts(first: 50) {
      comments(first: 50) {
        author { name }
      }
    }
  }
}
# Complexity: 100 + 100*50 + 100*50*50 = 255,100 operations!
```

---

## Implementing Complexity Limiting

```bash
npm install graphql-query-complexity
```

```javascript
import { createComplexityPlugin, simpleEstimator, fieldExtensionsEstimator } from "graphql-query-complexity";

const server = new ApolloServer({
  typeDefs,
  resolvers,
  plugins: [
    {
      async requestDidStart() {
        return {
          async didResolveOperation({ request, document }) {
            const complexity = getComplexity({
              schema,
              query: document,
              variables: request.variables,
              estimators: [
                fieldExtensionsEstimator(),
                simpleEstimator({ defaultComplexity: 1 }),
              ],
            });

            if (complexity > 1000) {
              throw new GraphQLError(
                `Query too complex: ${complexity}. Maximum allowed: 1000`
              );
            }
          },
        };
      },
    },
  ],
});
```

---

## Per-User Rate Limiting

Different limits for different users:

```javascript
import { rateLimit } from "express-rate-limit";

const limiter = rateLimit({
  windowMs: 60 * 1000,
  max: (req) => {
    // Authenticated users get more requests
    if (req.user?.role === "ADMIN") return 1000;
    if (req.user) return 200;
    return 50; // Anonymous
  },
  keyGenerator: (req) => req.user?.id || req.ip,
});
```

---

## Response Headers

Include rate limit info in responses:

```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 87
X-RateLimit-Reset: 1705334460
```

---

## Key Takeaways

- Apply **HTTP-level** rate limiting as a baseline
- Use **query complexity** analysis to prevent expensive queries
- Set **per-user** limits (higher for authenticated/paying users)
- Include rate limit headers in responses
- Return clear error messages when limits are exceeded

---

Next, we'll learn about **Query Depth & Complexity Limiting** →
