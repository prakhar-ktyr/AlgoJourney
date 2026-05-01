---
title: Monitoring & Observability
---

# Monitoring & Observability

Monitor your GraphQL API's health, performance, and errors in production.

---

## What to Monitor

| Metric | Why |
|--------|-----|
| Resolver execution time | Find slow resolvers |
| Error rate by operation | Track failing queries |
| Request rate | Understand traffic patterns |
| Query complexity scores | Detect expensive queries |
| Cache hit rate | Measure caching effectiveness |

---

## Resolver Timing Plugin

```javascript
const timingPlugin = {
  async requestDidStart({ request }) {
    const operationName = request.operationName || "anonymous";
    const start = Date.now();

    return {
      async executionDidStart() {
        return {
          willResolveField({ info }) {
            const fieldStart = Date.now();
            return () => {
              const duration = Date.now() - fieldStart;
              if (duration > 50) {
                logger.warn({
                  type: "slow_resolver",
                  field: `${info.parentType.name}.${info.fieldName}`,
                  duration,
                  operation: operationName,
                });
              }
            };
          },
        };
      },
      async willSendResponse() {
        const duration = Date.now() - start;
        logger.info({
          type: "graphql_request",
          operation: operationName,
          duration,
        });
      },
      async didEncounterErrors({ errors }) {
        for (const error of errors) {
          logger.error({
            type: "graphql_error",
            operation: operationName,
            message: error.message,
            code: error.extensions?.code,
            path: error.path,
          });
        }
      },
    };
  },
};
```

---

## Apollo Studio

Apollo's managed service for monitoring:

```javascript
import { ApolloServer } from "@apollo/server";

const server = new ApolloServer({
  typeDefs,
  resolvers,
  apollo: {
    key: process.env.APOLLO_KEY,
    graphRef: "my-graph@production",
  },
});
```

Apollo Studio provides:
- Operation-level metrics
- Error tracking
- Schema change history
- Field usage statistics

---

## Health Check

```javascript
app.get("/api/health", async (req, res) => {
  const checks = {
    server: "healthy",
    database: "unknown",
    uptime: process.uptime(),
  };

  try {
    await mongoose.connection.db.admin().ping();
    checks.database = "healthy";
  } catch {
    checks.database = "unhealthy";
    return res.status(503).json(checks);
  }

  res.json(checks);
});
```

---

## Error Tracking with Sentry

```javascript
import * as Sentry from "@sentry/node";

const sentryPlugin = {
  async requestDidStart() {
    return {
      async didEncounterErrors({ errors, request }) {
        for (const error of errors) {
          Sentry.captureException(error, {
            tags: { operation: request.operationName },
            extra: { query: request.query, variables: request.variables },
          });
        }
      },
    };
  },
};
```

---

## Alerting Rules

Set alerts for:

- Error rate > 5% for 5 minutes
- P95 response time > 2 seconds
- Any resolver > 5 seconds
- Health check failing
- Query complexity spikes

---

## Key Takeaways

- Monitor **resolver-level** performance, not just request-level
- Track **operations by name** for granular insights
- Use **Apollo Studio** for managed GraphQL monitoring
- **Sentry** for error tracking with GraphQL context
- Set **alerts** on error rates and response times

---

Next, we'll learn about **Deployment & CI/CD** →
