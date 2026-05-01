---
title: Monitoring & Logging
---

# Monitoring & Logging

Once your API is in production, you need visibility into its health, performance, and errors.

---

## Structured Logging

Use structured (JSON) logs instead of plain text:

```bash
npm install pino
```

```javascript
import pino from "pino";

const logger = pino({
  level: process.env.LOG_LEVEL || "info",
});

// Usage
logger.info({ userId: "123", action: "login" }, "User logged in");
logger.error({ err, requestId: "abc" }, "Failed to process payment");
```

### Request Logging Middleware

```bash
npm install pino-http
```

```javascript
import pinoHttp from "pino-http";

app.use(pinoHttp({
  logger,
  customProps: (req) => ({
    requestId: req.headers["x-request-id"] || crypto.randomUUID(),
  }),
}));
```

Output:

```json
{
  "level": 30,
  "time": 1705334400000,
  "msg": "request completed",
  "req": { "method": "GET", "url": "/api/users" },
  "res": { "statusCode": 200 },
  "responseTime": 45,
  "requestId": "abc-123"
}
```

---

## Health Check Endpoint

```javascript
app.get("/api/health", async (req, res) => {
  const checks = {
    uptime: process.uptime(),
    timestamp: Date.now(),
    database: "unknown",
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

## Metrics to Track

| Metric | What It Tells You |
|--------|-------------------|
| **Response time** (p50, p95, p99) | How fast your API responds |
| **Error rate** | Percentage of 5xx responses |
| **Request rate** | Requests per second |
| **Uptime** | Availability percentage |
| **CPU/Memory** | Resource utilization |
| **Database query time** | DB performance |

---

## Application Performance Monitoring (APM)

Popular tools:

| Tool | Type | Best For |
|------|------|----------|
| **Datadog** | Full APM | Enterprise monitoring |
| **New Relic** | Full APM | Detailed traces |
| **Sentry** | Error tracking | Error monitoring |
| **Grafana + Prometheus** | Self-hosted | Custom dashboards |
| **Better Stack** | Logs + uptime | Simple monitoring |

---

## Error Tracking with Sentry

```bash
npm install @sentry/node
```

```javascript
import * as Sentry from "@sentry/node";

Sentry.init({ dsn: process.env.SENTRY_DSN });

// Add as error handler (after all routes)
app.use((err, req, res, next) => {
  Sentry.captureException(err);
  logger.error({ err, path: req.path }, "Unhandled error");
  res.status(500).json({ error: { code: "INTERNAL_ERROR" } });
});
```

---

## Alerting

Set up alerts for:

- **Error rate > 5%** for 5 minutes
- **Response time p95 > 2 seconds**
- **Health check fails** 3 times in a row
- **Disk usage > 80%**
- **Memory usage > 90%**

---

## Key Takeaways

- Use **structured logging** (JSON) — easier to search and analyze
- Add a **health check** endpoint for uptime monitoring
- Track **response time**, **error rate**, and **request volume**
- Use **APM tools** (Datadog, Sentry) for production observability
- Set up **alerts** for anomalies before users notice

---

Next, we'll learn about **Best Practices & Capstone** — putting it all together →
