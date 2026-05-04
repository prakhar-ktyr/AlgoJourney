---
title: "Logging and Log Analytics"
---

# Logging and Log Analytics

Welcome to this lesson on **Logging and Log Analytics** in cloud computing! Logs are the most detailed record of what happens inside your systems. They capture individual events, errors, transactions, and state changes — making them invaluable for debugging, auditing, and compliance.

In this lesson, you will learn about structured logging, cloud logging services, log aggregation patterns, query languages, cost optimization, and how to build a centralized logging solution.

---

## Why Logging Matters

Every application generates logs. The question is whether those logs are **useful** when you need them most.

```
Without good logging:
  "The app crashed sometime last night. No idea why."

With good logging:
  "At 02:14 UTC, the payment-service threw a CardDeclinedException
   for user usr_12345, order ord_67890. The upstream gateway returned
   HTTP 502 after a 30s timeout. Trace ID: abc-123-def."
```

Good logging transforms incident response from guesswork into systematic investigation.

---

## Structured vs Unstructured Logging

The single most important decision in your logging strategy is whether to use **structured** or **unstructured** logs.

### Unstructured Logs

Traditional plain-text log lines:

```
2026-05-04 10:15:32 ERROR PaymentService - Payment failed for user 12345, order 67890: CardDeclinedException
2026-05-04 10:15:33 INFO  OrderService - Rolling back order 67890
2026-05-04 10:15:33 WARN  NotificationService - Failed to send email to user 12345: SMTP timeout
```

**Problems with unstructured logs:**

- Hard to parse programmatically
- Inconsistent formats across services
- Difficult to filter and search
- Cannot aggregate or compute statistics

### Structured Logs

Machine-parseable formats (typically JSON):

```json
{
  "timestamp": "2026-05-04T10:15:32.456Z",
  "level": "ERROR",
  "service": "payment-service",
  "message": "Payment failed",
  "error": {
    "type": "CardDeclinedException",
    "code": "CARD_DECLINED",
    "retryable": false
  },
  "context": {
    "userId": "usr_12345",
    "orderId": "ord_67890",
    "amount": 49.99,
    "currency": "USD"
  },
  "traceId": "abc-123-def",
  "spanId": "span-456"
}
```

### Comparison

| Aspect | Unstructured | Structured |
|---|---|---|
| **Readability** | Easy for humans | Harder to scan visually |
| **Parseability** | Requires regex/custom parsers | Native JSON parsing |
| **Searchability** | Full-text only | Field-level queries |
| **Aggregation** | Very difficult | Easy — group by any field |
| **Cost** | Smaller per message | Larger per message |
| **Recommended** | Local development only | Production systems |

> **Best Practice:** Always use structured logging in production. Use a logging library that formats output as JSON.

---

## Log Levels

Log levels indicate the severity and importance of a log event. Use them consistently across your entire organization.

| Level | When to Use | Example |
|---|---|---|
| **TRACE** | Extremely detailed debugging info | "Entering function processPayment with args..." |
| **DEBUG** | Detailed diagnostic information | "Cache miss for key user:12345" |
| **INFO** | Normal operational events | "Order ord_67890 created successfully" |
| **WARN** | Something unexpected but recoverable | "Retry attempt 2/3 for payment gateway" |
| **ERROR** | An operation failed | "Payment processing failed: CardDeclinedException" |
| **FATAL** | Application cannot continue | "Database connection pool exhausted, shutting down" |

### Log Level Best Practices

```python
import logging
import json

logger = logging.getLogger("order-service")

# GOOD: Appropriate log levels with context
logger.info("Order created", extra={
    "orderId": "ord_67890",
    "userId": "usr_12345",
    "total": 49.99,
})

logger.warning("Payment retry", extra={
    "orderId": "ord_67890",
    "attempt": 2,
    "maxRetries": 3,
    "reason": "gateway_timeout",
})

logger.error("Payment failed", extra={
    "orderId": "ord_67890",
    "error": "CardDeclinedException",
    "userId": "usr_12345",
})

# BAD: Don't do these
logger.info("Entering function")          # Too noisy for INFO
logger.error("User not found")            # Not an error — use WARN or INFO
logger.debug(f"Full request body: {body}") # May log sensitive data
```

### What NOT to Log

| Never Log | Why |
|---|---|
| Passwords or secrets | Security — could be exposed in log storage |
| Credit card numbers | PCI-DSS compliance violation |
| Full request/response bodies | May contain PII; very expensive at scale |
| Health check successes | Noise — only log failures |
| Per-iteration debug output | Extreme volume with no value in production |

---

## Cloud Logging Services

### AWS CloudWatch Logs

CloudWatch Logs organizes data into **log groups** and **log streams**.

```bash
# Create a log group
aws logs create-log-group --log-group-name /app/payment-service

# Set retention (important for cost control!)
aws logs put-retention-policy \
  --log-group-name /app/payment-service \
  --retention-in-days 30

# Send a log event programmatically
aws logs put-log-events \
  --log-group-name /app/payment-service \
  --log-stream-name "instance-001/2026/05/04" \
  --log-events \
    timestamp=$(date +%s000),message='{"level":"ERROR","message":"Payment failed"}'
```

### Azure Log Analytics

Azure uses **Log Analytics workspaces** to centralize logs.

```
// KQL query in Azure Log Analytics
AppRequests
| where TimeGenerated > ago(1h)
| where ResultCode >= 500
| summarize ErrorCount = count() by bin(TimeGenerated, 5m), AppRoleName
| render timechart
```

### Google Cloud Logging

Cloud Logging (formerly Stackdriver Logging) integrates with all GCP services.

```bash
# Write a structured log entry
gcloud logging write my-log \
  '{"severity":"ERROR","message":"Payment failed","orderId":"ord_67890"}' \
  --payload-type=json

# Read recent logs
gcloud logging read 'resource.type="gae_app" AND severity>=ERROR' \
  --limit=10 \
  --format=json
```

---

## Log Aggregation Patterns

In distributed systems, logs are scattered across many instances and services. **Log aggregation** collects them into a central location.

### Pattern 1: Sidecar

A sidecar container runs alongside your application and forwards logs.

```
┌─────────────────────────────┐
│           Pod               │
│  ┌──────────┐  ┌─────────┐ │
│  │   App    │──│ Sidecar │─│──→ Central Log Store
│  │Container │  │(Fluentd)│ │
│  └──────────┘  └─────────┘ │
└─────────────────────────────┘
```

```yaml
# Kubernetes pod with Fluentd sidecar
apiVersion: v1
kind: Pod
spec:
  containers:
    - name: app
      image: my-app:latest
      volumeMounts:
        - name: logs
          mountPath: /var/log/app

    - name: log-forwarder
      image: fluent/fluentd:latest
      volumeMounts:
        - name: logs
          mountPath: /var/log/app
          readOnly: true
      env:
        - name: FLUENT_ELASTICSEARCH_HOST
          value: "elasticsearch.logging.svc"

  volumes:
    - name: logs
      emptyDir: {}
```

### Pattern 2: Node-Level Agent

A single agent per node collects logs from all containers on that node.

```
┌─────────────────────────────────────────┐
│              Node                        │
│  ┌──────┐  ┌──────┐  ┌──────┐          │
│  │App 1 │  │App 2 │  │App 3 │          │
│  └──┬───┘  └──┬───┘  └──┬───┘          │
│     │         │         │               │
│     └─────────┼─────────┘               │
│               │                         │
│         ┌─────┴─────┐                   │
│         │ DaemonSet │───→ Central Store  │
│         │ (Fluentd) │                   │
│         └───────────┘                   │
└─────────────────────────────────────────┘
```

### Pattern 3: Direct Push (Centralized)

Applications send logs directly to the central store via an SDK or API.

```
┌──────┐
│App 1 │───┐
└──────┘   │
┌──────┐   ├───→ Central Log Store (CloudWatch / Elasticsearch)
│App 2 │───┤
└──────┘   │
┌──────┐   │
│App 3 │───┘
└──────┘
```

### Comparison

| Pattern | Pros | Cons |
|---|---|---|
| **Sidecar** | Per-pod isolation, easy config | Higher resource usage per pod |
| **Node Agent** | Efficient, one agent per node | Shared config for all pods |
| **Direct Push** | Simplest setup, no extra containers | Couples app to log backend |

---

## ELK / EFK Stack in the Cloud

The **ELK stack** (Elasticsearch, Logstash, Kibana) and its variant **EFK** (Elasticsearch, Fluentd, Kibana) are popular open-source logging solutions.

```
┌─────────┐     ┌───────────┐     ┌───────────────┐     ┌─────────┐
│  Apps   │────→│  Fluentd  │────→│ Elasticsearch │────→│ Kibana  │
│ (Logs)  │     │ (Collect) │     │   (Store &    │     │(Visualize│
│         │     │           │     │    Index)     │     │ & Query) │
└─────────┘     └───────────┘     └───────────────┘     └─────────┘
```

### Managed ELK Options

| Provider | Service | Notes |
|---|---|---|
| **AWS** | Amazon OpenSearch Service | Fork of Elasticsearch |
| **Azure** | Elastic Cloud on Azure | Official Elastic partnership |
| **GCP** | Elastic Cloud on GCP | Official Elastic partnership |
| **Elastic** | Elastic Cloud | Vendor-hosted, multi-cloud |

```yaml
# Fluentd configuration for Kubernetes → Elasticsearch
<source>
  @type tail
  path /var/log/containers/*.log
  pos_file /var/log/fluentd-containers.log.pos
  tag kubernetes.*
  <parse>
    @type json
    time_key time
    time_format %Y-%m-%dT%H:%M:%S.%NZ
  </parse>
</source>

<filter kubernetes.**>
  @type kubernetes_metadata
</filter>

<match kubernetes.**>
  @type elasticsearch
  host elasticsearch.logging.svc
  port 9200
  index_name fluentd-k8s
  type_name _doc
  logstash_format true
  logstash_prefix k8s-logs
  <buffer>
    flush_interval 5s
    chunk_limit_size 2M
    retry_max_interval 30
  </buffer>
</match>
```

---

## Log Query Languages

Each platform has its own query language. Here are the most common ones.

### CloudWatch Logs Insights (AWS)

```sql
-- Find the top 10 slowest API requests in the last hour
fields @timestamp, @message, latencyMs, endpoint
| filter latencyMs > 1000
| sort latencyMs desc
| limit 10

-- Count errors by service in 5-minute buckets
fields @timestamp, level, service
| filter level = "ERROR"
| stats count(*) as errorCount by bin(5m), service

-- Find all logs for a specific trace ID
fields @timestamp, @message
| filter traceId = "abc-123-def"
| sort @timestamp asc
```

### KQL — Kusto Query Language (Azure)

```
// Find errors in the last hour
AppTraces
| where TimeGenerated > ago(1h)
| where SeverityLevel >= 3
| project TimeGenerated, Message, AppRoleName, OperationId
| order by TimeGenerated desc

// Error rate by service, 5-minute intervals
AppRequests
| where TimeGenerated > ago(24h)
| summarize
    TotalRequests = count(),
    FailedRequests = countif(Success == false),
    ErrorRate = round(100.0 * countif(Success == false) / count(), 2)
  by bin(TimeGenerated, 5m), AppRoleName
| render timechart

// Trace a single request across services
union AppRequests, AppDependencies, AppTraces
| where OperationId == "abc-123-def"
| order by TimeGenerated asc
| project TimeGenerated, ItemType, Name, Message, DurationMs
```

### Log Explorer (GCP)

```
-- Find errors in a specific service
resource.type="cloud_run_revision"
resource.labels.service_name="payment-service"
severity>=ERROR
timestamp>="2026-05-04T00:00:00Z"

-- Search by a specific field in JSON payload
jsonPayload.orderId="ord_67890"

-- Combine multiple filters
resource.type="gke_container"
jsonPayload.level="ERROR"
jsonPayload.service="order-service"
NOT jsonPayload.message:"health check"
```

### Query Language Comparison

| Feature | CloudWatch Insights | KQL (Azure) | Log Explorer (GCP) |
|---|---|---|---|
| **Syntax style** | Pipe-based | Pipe-based (tabular) | Filter-based |
| **Aggregation** | `stats count() by` | `summarize count() by` | Via log-based metrics |
| **Regex** | `parse` with patterns | `matches regex` | `=~` operator |
| **Joins** | Not supported | `join`, `union` | Not in Log Explorer |
| **Visualization** | Basic charts | Rich charts, render | Integrated dashboards |
| **Learning curve** | Low | Medium | Low |

---

## Log-Based Metrics

You can create **metrics from log data** — count occurrences of patterns, extract numeric values, and turn them into time-series data for dashboards and alerting.

```bash
# AWS: Create a metric filter from logs
aws logs put-metric-filter \
  --log-group-name /app/payment-service \
  --filter-name "PaymentErrors" \
  --filter-pattern '{ $.level = "ERROR" && $.service = "payment-service" }' \
  --metric-transformations \
    metricName=PaymentErrorCount,\
    metricNamespace=MyApp/Errors,\
    metricValue=1

# Now you can alarm on this metric!
aws cloudwatch put-metric-alarm \
  --alarm-name "TooManyPaymentErrors" \
  --metric-name PaymentErrorCount \
  --namespace MyApp/Errors \
  --statistic Sum \
  --period 300 \
  --threshold 10 \
  --comparison-operator GreaterThanThreshold \
  --evaluation-periods 1 \
  --alarm-actions arn:aws:sns:us-east-1:123456789:production-alerts
```

---

## Log Routing and Filtering

Not all logs need to go to the same destination. **Log routing** sends different logs to different sinks based on rules.

```
                    ┌──→ Hot Storage (30 days)
                    │    Elasticsearch — fast queries
                    │
  All Logs ──→ Router ──→ Warm Storage (90 days)
                    │    S3 / Blob — cheaper, slower
                    │
                    └──→ Cold Storage (7 years)
                         Glacier / Archive — compliance
```

### GCP Log Router Example

```bash
# Route ERROR logs to BigQuery for analytics
gcloud logging sinks create error-to-bigquery \
  bigquery.googleapis.com/projects/my-project/datasets/error_logs \
  --log-filter='severity>=ERROR'

# Route audit logs to Cloud Storage for compliance
gcloud logging sinks create audit-to-storage \
  storage.googleapis.com/my-audit-bucket \
  --log-filter='logName:"cloudaudit.googleapis.com"'

# Exclude noisy health check logs to save cost
gcloud logging sinks update _Default \
  --add-exclusion='name=health-checks,filter=httpRequest.requestUrl="/health"'
```

---

## Cost Optimization for Logging

Logging can become one of your **biggest cloud expenses** if not managed carefully.

### Cost Drivers

| Factor | Impact | Mitigation |
|---|---|---|
| **Volume** | More logs = more cost | Filter at source, sample verbose logs |
| **Retention** | Longer retention = more cost | Set retention policies per log group |
| **Indexing** | Indexed fields cost more | Only index fields you query |
| **Queries** | Scanned data costs money | Use specific time ranges and filters |
| **Cross-region** | Data transfer fees | Keep logs in the same region as workloads |

### Cost Reduction Strategies

```python
# Strategy 1: Log sampling for high-volume endpoints
import random
import logging

logger = logging.getLogger("api")

def log_with_sampling(message, sample_rate=0.1, **kwargs):
    """Log only a percentage of messages for high-volume events."""
    if random.random() < sample_rate:
        logger.info(message, extra={**kwargs, "sampled": True, "sample_rate": sample_rate})

# Log 100% of errors, 10% of successful requests
@app.route("/api/search")
def search():
    results = perform_search(request.args["q"])
    log_with_sampling(
        "Search completed",
        sample_rate=0.1,
        query=request.args["q"],
        resultCount=len(results),
    )
    return jsonify(results)
```

```bash
# Strategy 2: Set appropriate retention periods
# Hot logs: 7-30 days (expensive storage, fast query)
aws logs put-retention-policy \
  --log-group-name /app/api-gateway \
  --retention-in-days 14

# Warm logs: 90 days (medium cost)
aws logs put-retention-policy \
  --log-group-name /app/background-jobs \
  --retention-in-days 90

# Compliance logs: export to S3 Glacier for long-term
aws logs create-export-task \
  --log-group-name /app/audit-logs \
  --destination "my-archive-bucket" \
  --from $(date -d '30 days ago' +%s000) \
  --to $(date +%s000)
```

### Monthly Cost Estimate (Example)

| Component | Volume | Service | Estimated Cost |
|---|---|---|---|
| Application logs | 500 GB/month | CloudWatch Logs | ~$250/month |
| Log queries | 100 queries/day | CloudWatch Insights | ~$25/month |
| Long-term archive | 2 TB total | S3 Glacier | ~$8/month |
| Dashboards | 3 dashboards | CloudWatch | ~$9/month |
| **Total** | | | **~$292/month** |

---

## Compliance Logging Requirements

Many industries have strict requirements about what must be logged and how long logs must be retained.

| Standard | Requirement | Retention |
|---|---|---|
| **PCI-DSS** | Audit trails for all access to cardholder data | 1 year (3 months immediately accessible) |
| **HIPAA** | Audit logs for access to protected health information | 6 years |
| **SOC 2** | Log all system access, changes, and security events | Defined by policy (typically 1 year) |
| **GDPR** | Log data access; must be able to delete user data from logs | Based on legitimate interest |
| **SOX** | Financial system audit trails | 7 years |

### Compliance Logging Checklist

```
✓ Log all authentication attempts (success and failure)
✓ Log all authorization decisions (access granted/denied)
✓ Log all data access (read/write/delete)
✓ Log all administrative actions (config changes, deployments)
✓ Log all security events (firewall, WAF, intrusion detection)
✓ Include timestamps in UTC with millisecond precision
✓ Include user identity (who performed the action)
✓ Include source IP and user agent
✓ Protect log integrity (immutable storage, checksums)
✓ Encrypt logs at rest and in transit
```

---

## Correlation IDs for Distributed Systems

In microservices, a single user action can trigger requests across dozens of services. **Correlation IDs** (also called trace IDs) tie all those logs together.

```
User Request
    │
    ▼
┌─────────┐   correlationId: "req-abc-123"
│ Gateway  │──────────────────────────────┐
└────┬─────┘                              │
     │                                    │
     ▼                                    ▼
┌─────────┐                         ┌──────────┐
│  Auth   │                         │  Order   │
│ Service │                         │ Service  │
└────┬────┘                         └────┬─────┘
     │                                   │
     │              correlationId        ▼
     │              propagated →   ┌──────────┐
     │                             │ Payment  │
     │                             │ Service  │
     └─────────────────────────────┴──────────┘

All logs from all services share: correlationId = "req-abc-123"
```

### Implementation

```javascript
// Express middleware to generate/propagate correlation IDs
import { randomUUID } from "crypto";

function correlationMiddleware(req, res, next) {
  // Use existing correlation ID from header, or generate a new one
  const correlationId =
    req.headers["x-correlation-id"] || randomUUID();

  // Attach to request for downstream use
  req.correlationId = correlationId;

  // Include in response headers for debugging
  res.setHeader("x-correlation-id", correlationId);

  next();
}

// Use in logging
app.use(correlationMiddleware);

app.get("/api/orders/:id", (req, res) => {
  logger.info({
    message: "Fetching order",
    correlationId: req.correlationId,
    orderId: req.params.id,
    service: "order-service",
  });

  // When calling other services, propagate the ID
  const paymentStatus = await fetch("http://payment-service/status", {
    headers: { "x-correlation-id": req.correlationId },
  });

  // ...
});
```

### Searching by Correlation ID

```sql
-- CloudWatch Insights: find all logs for one request
fields @timestamp, service, level, message
| filter correlationId = "req-abc-123"
| sort @timestamp asc
```

```
-- GCP Log Explorer
jsonPayload.correlationId="req-abc-123"
```

```
// Azure KQL
AppTraces
| where Properties.correlationId == "req-abc-123"
| order by TimeGenerated asc
```

---

## Practical: Building a Centralized Logging Solution

Let's build a complete centralized logging solution on AWS.

### Architecture

```
┌──────────┐  ┌──────────┐  ┌──────────┐
│ Service A│  │ Service B│  │ Service C│
│ (ECS)    │  │ (Lambda) │  │ (EC2)    │
└────┬─────┘  └────┬─────┘  └────┬─────┘
     │              │              │
     └──────────────┼──────────────┘
                    │
              ┌─────┴─────┐
              │ CloudWatch │
              │   Logs     │
              └─────┬──────┘
                    │
         ┌──────────┼──────────┐
         │          │          │
    ┌────┴───┐ ┌────┴───┐ ┌───┴────┐
    │Insights│ │Alarms  │ │S3 Export│
    │Queries │ │& SNS   │ │(Archive)│
    └────────┘ └────────┘ └────────┘
```

### Step 1: Configure Structured Logging in Your App

```javascript
// Structured logger using Winston (Node.js)
import winston from "winston";

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || "info",
  format: winston.format.combine(
    winston.format.timestamp({ format: "YYYY-MM-DDTHH:mm:ss.SSSZ" }),
    winston.format.json()
  ),
  defaultMeta: {
    service: process.env.SERVICE_NAME || "unknown",
    environment: process.env.NODE_ENV || "development",
    version: process.env.APP_VERSION || "0.0.0",
  },
  transports: [new winston.transports.Console()],
});

// Usage
logger.info("Order created", {
  orderId: "ord_67890",
  userId: "usr_12345",
  total: 49.99,
  correlationId: req.correlationId,
});
```

### Step 2: Set Up Log Groups with Retention

```bash
#!/bin/bash
# setup-log-groups.sh

SERVICES=("api-gateway" "order-service" "payment-service" "notification-service")

for service in "${SERVICES[@]}"; do
  # Create log group
  aws logs create-log-group \
    --log-group-name "/app/${service}" \
    --tags Environment=production,Service="${service}"

  # Set 30-day retention
  aws logs put-retention-policy \
    --log-group-name "/app/${service}" \
    --retention-in-days 30

  echo "Created log group for ${service}"
done
```

### Step 3: Create Metric Filters and Alarms

```bash
# Create metric filters for each error type
aws logs put-metric-filter \
  --log-group-name /app/payment-service \
  --filter-name "PaymentTimeouts" \
  --filter-pattern '{ $.level = "ERROR" && $.error.type = "TimeoutException" }' \
  --metric-transformations \
    metricName=PaymentTimeouts,metricNamespace=MyApp,metricValue=1

aws logs put-metric-filter \
  --log-group-name /app/payment-service \
  --filter-name "PaymentDeclines" \
  --filter-pattern '{ $.level = "ERROR" && $.error.type = "CardDeclinedException" }' \
  --metric-transformations \
    metricName=PaymentDeclines,metricNamespace=MyApp,metricValue=1
```

### Step 4: Create Useful Insights Queries

```sql
-- Save as "Error Summary" query
fields @timestamp, level, service, message, error.type
| filter level = "ERROR"
| stats count(*) as errorCount by service, error.type
| sort errorCount desc

-- Save as "Slow Requests" query
fields @timestamp, endpoint, latencyMs, userId
| filter latencyMs > 2000
| sort latencyMs desc
| limit 50

-- Save as "User Activity" query (for support investigations)
fields @timestamp, service, message, endpoint
| filter userId = "USER_ID_HERE"
| sort @timestamp asc
| limit 200
```

### Step 5: Set Up Log Export for Long-Term Archive

```bash
# Create S3 bucket for log archive
aws s3 mb s3://my-app-log-archive --region us-east-1

# Create export task for last 30 days
aws logs create-export-task \
  --task-name "monthly-archive" \
  --log-group-name "/app/payment-service" \
  --from $(date -d '30 days ago' +%s000) \
  --to $(date +%s000) \
  --destination "my-app-log-archive" \
  --destination-prefix "payment-service/2026/05"
```

---

## Exercises

1. **Structured Logging:**
   Convert the following unstructured log lines into structured JSON format. Include at least 5 fields per log entry:
   ```
   2026-05-04 10:15:32 ERROR - Failed to connect to database after 3 retries
   2026-05-04 10:15:33 INFO - Fallback cache activated for user service
   2026-05-04 10:15:35 WARN - Request queue depth at 89% capacity
   ```

2. **Log Query Challenge:**
   Write CloudWatch Insights queries to answer these questions:
   - What are the top 5 most common error types in the last 24 hours?
   - What is the average response time per endpoint in 15-minute intervals?
   - Find all logs associated with a specific user ID across all services.

3. **Cost Optimization:**
   Your team is spending $2,000/month on CloudWatch Logs. Identify at least 5 strategies to reduce this cost by 50%, and explain the trade-offs for each.

4. **Correlation ID Implementation:**
   Design a correlation ID propagation scheme for a system with 4 microservices. Draw the flow diagram and write middleware code for one service.

5. **Compliance Audit:**
   You're building a healthcare application (HIPAA). List all the events that must be logged, the fields each log entry must contain, and the retention policy you would implement.

---

## Key Takeaways

| Concept | Summary |
|---|---|
| **Structured Logging** | Always use JSON-formatted logs in production for queryability |
| **Log Levels** | Use consistently: TRACE → DEBUG → INFO → WARN → ERROR → FATAL |
| **Cloud Services** | CloudWatch Logs (AWS), Log Analytics (Azure), Cloud Logging (GCP) |
| **Aggregation Patterns** | Sidecar, node-agent, or direct push — choose based on your platform |
| **ELK/EFK Stack** | Elasticsearch + Fluentd/Logstash + Kibana for self-managed logging |
| **Query Languages** | CloudWatch Insights, KQL, Log Explorer — learn your platform's language |
| **Log-Based Metrics** | Convert log patterns into metrics for dashboards and alerts |
| **Log Routing** | Send different logs to different destinations based on severity/type |
| **Cost Control** | Set retention, sample verbose logs, filter noise, use tiered storage |
| **Compliance** | Know your requirements (PCI, HIPAA, SOC 2) — retention matters |
| **Correlation IDs** | Propagate a unique ID through all services for end-to-end tracing |
| **Don't Log Secrets** | Never log passwords, tokens, PII, or credit card numbers |

---

## What's Next?

In the next lesson, you'll explore **Cloud Compliance and Governance** — how to enforce policies, manage regulatory requirements, and ensure your cloud infrastructure meets industry standards.
