---
title: "Observability and Distributed Tracing"
---

# Observability and Distributed Tracing

Observability is the ability to understand the internal state of a system by examining its external outputs. In distributed systems, where requests traverse multiple services, observability is essential for debugging, performance optimization, and reliability.

---

## Why Observability Matters

Traditional monitoring answers "is the system up?" — observability answers "why is the system broken?"

| Challenge | Without Observability | With Observability |
|-----------|----------------------|-------------------|
| Latency spike | "Something is slow" | "Service B's DB query on endpoint /users takes 800ms" |
| Error burst | "500 errors increasing" | "Auth token validation fails when cache miss hits cold DB replica" |
| Cascading failure | "Everything is down" | "Payment service timeout causes cart service retry storm" |
| Resource exhaustion | "CPU is high" | "Goroutine leak in connection pool due to unclosed contexts" |

In a monolith, a stack trace tells you everything. In distributed systems, a single request may touch 10+ services — you need correlated signals across all of them.

---

## The Three Pillars of Observability

### 1. Metrics

Metrics are numeric measurements collected over time. They are lightweight, aggregatable, and ideal for alerting.

```
# Prometheus metric examples
http_requests_total{method="GET", endpoint="/api/orders", status="200"} 15234
http_request_duration_seconds{method="GET", endpoint="/api/orders", quantile="0.99"} 0.45
active_connections{service="payment-gateway"} 142
```

**Characteristics:**
- Fixed cost regardless of traffic volume
- Pre-aggregated (lose individual event detail)
- Best for dashboards and alerts

### 2. Logs

Logs are discrete, timestamped records of events. They provide rich context about what happened.

```json
{
  "timestamp": "2025-03-15T10:23:45.123Z",
  "level": "ERROR",
  "service": "order-service",
  "trace_id": "abc123def456",
  "span_id": "span789",
  "message": "Failed to process order",
  "order_id": "ORD-99821",
  "error": "insufficient inventory for SKU-4412",
  "user_id": "usr-5567"
}
```

**Characteristics:**
- High cardinality — every event is unique
- Expensive to store and query at scale
- Best for detailed investigation after detection

### 3. Traces

Traces represent the complete journey of a request through all services.

```
Trace ID: abc123def456
├── [API Gateway] GET /api/orders/99821  (12ms)
│   ├── [Auth Service] validate-token  (3ms)
│   ├── [Order Service] get-order  (8ms)
│   │   ├── [Cache] redis-lookup  (1ms) MISS
│   │   ├── [Database] postgres-query  (5ms)
│   │   └── [Cache] redis-set  (1ms)
│   └── [Response] serialize  (1ms)
```

**Characteristics:**
- Show causal relationships between operations
- Reveal latency bottlenecks across service boundaries
- Essential for understanding distributed request flow

---

## Distributed Tracing Concepts

### Traces and Spans

A **trace** represents a single logical operation (e.g., an API request) as it flows through the system.

A **span** is a single unit of work within a trace. Each span has:

| Field | Description | Example |
|-------|-------------|---------|
| Trace ID | Unique identifier for the entire trace | `4bf92f3577b34da6` |
| Span ID | Unique identifier for this span | `00f067aa0ba902b7` |
| Parent Span ID | ID of the calling span | `a2fb4a1d1a96d312` |
| Operation Name | What this span represents | `HTTP GET /users` |
| Start Time | When the span began | `1647345825123` |
| Duration | How long the span took | `45ms` |
| Status | Success/error | `OK` or `ERROR` |
| Attributes | Key-value metadata | `db.system=postgresql` |
| Events | Timestamped annotations | `cache miss at t+2ms` |

### Context Propagation

Context propagation passes trace information across service boundaries:

```
Service A                    Service B                    Service C
─────────                    ─────────                    ─────────
Create Trace ID ──────────► Extract Trace ID ──────────► Extract Trace ID
Create Span A               Create Span B                Create Span C
Inject into headers         Inject into headers          (leaf span)
     │                           │
     │  HTTP Header:             │  HTTP Header:
     │  traceparent:             │  traceparent:
     │  00-{traceId}-            │  00-{traceId}-
     │  {spanA}-01               │  {spanB}-01
     ▼                           ▼
```

### W3C Trace Context Standard

The W3C Trace Context standard defines HTTP headers for propagation:

```http
traceparent: 00-4bf92f3577b34da6a3ce929d0e0e4736-00f067aa0ba902b7-01
             ──  ────────────────────────────────  ────────────────  ──
             ver         trace-id                      parent-id    flags

tracestate: vendor1=value1,vendor2=value2
```

**Fields:**
- `version`: Always `00` (current version)
- `trace-id`: 16-byte hex-encoded unique trace identifier
- `parent-id`: 8-byte hex-encoded span identifier
- `flags`: 8-bit field (`01` = sampled)

---

## OpenTelemetry

OpenTelemetry (OTel) is the industry-standard framework for observability instrumentation.

### Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Application                            │
│  ┌──────────┐  ┌──────────┐  ┌──────────────────────┐  │
│  │ OTel API │  │ OTel SDK │  │ Auto-Instrumentation │  │
│  └────┬─────┘  └────┬─────┘  └──────────┬───────────┘  │
│       │              │                    │              │
│       └──────────────┼────────────────────┘              │
│                      │                                   │
│              ┌───────▼────────┐                          │
│              │   Exporters    │                          │
│              └───────┬────────┘                          │
└──────────────────────┼───────────────────────────────────┘
                       │ OTLP (gRPC/HTTP)
               ┌───────▼────────┐
               │  OTel Collector │
               │  ┌──────────┐  │
               │  │ Receivers│  │
               │  ├──────────┤  │
               │  │Processors│  │
               │  ├──────────┤  │
               │  │ Exporters│  │
               │  └──────────┘  │
               └───────┬────────┘
                       │
          ┌────────────┼────────────┐
          ▼            ▼            ▼
      ┌───────┐   ┌───────┐   ┌───────┐
      │Jaeger │   │Prometheus│ │ Loki  │
      └───────┘   └─────────┘ └───────┘
```

### SDK Instrumentation Example

```javascript
const { NodeSDK } = require("@opentelemetry/sdk-node");
const { OTLPTraceExporter } = require("@opentelemetry/exporter-trace-otlp-grpc");
const { OTLPMetricExporter } = require("@opentelemetry/exporter-metrics-otlp-grpc");
const { getNodeAutoInstrumentations } = require("@opentelemetry/auto-instrumentations-node");
const { PeriodicExportingMetricReader } = require("@opentelemetry/sdk-metrics");

const sdk = new NodeSDK({
  serviceName: "order-service",
  traceExporter: new OTLPTraceExporter({
    url: "http://otel-collector:4317",
  }),
  metricReader: new PeriodicExportingMetricReader({
    exporter: new OTLPMetricExporter({
      url: "http://otel-collector:4317",
    }),
    exportIntervalMillis: 15000,
  }),
  instrumentations: [getNodeAutoInstrumentations()],
});

sdk.start();
```

### Creating Custom Spans

```javascript
const { trace } = require("@opentelemetry/api");

const tracer = trace.getTracer("order-service", "1.0.0");

async function processOrder(orderId) {
  return tracer.startActiveSpan("process-order", async (span) => {
    span.setAttribute("order.id", orderId);

    try {
      const inventory = await tracer.startActiveSpan("check-inventory", async (childSpan) => {
        const result = await inventoryService.check(orderId);
        childSpan.setAttribute("inventory.available", result.available);
        childSpan.end();
        return result;
      });

      if (!inventory.available) {
        span.setStatus({ code: SpanStatusCode.ERROR, message: "Out of stock" });
        throw new Error("Insufficient inventory");
      }

      await chargePayment(orderId);
      span.setStatus({ code: SpanStatusCode.OK });
    } catch (error) {
      span.recordException(error);
      span.setStatus({ code: SpanStatusCode.ERROR, message: error.message });
      throw error;
    } finally {
      span.end();
    }
  });
}
```

### OTel Collector Configuration

```yaml
# otel-collector-config.yaml
receivers:
  otlp:
    protocols:
      grpc:
        endpoint: 0.0.0.0:4317
      http:
        endpoint: 0.0.0.0:4318

processors:
  batch:
    timeout: 5s
    send_batch_size: 1024
  memory_limiter:
    check_interval: 1s
    limit_mib: 512
  attributes:
    actions:
      - key: environment
        value: production
        action: upsert

exporters:
  otlp/jaeger:
    endpoint: jaeger:4317
    tls:
      insecure: true
  prometheus:
    endpoint: 0.0.0.0:8889
  loki:
    endpoint: http://loki:3100/loki/api/v1/push

service:
  pipelines:
    traces:
      receivers: [otlp]
      processors: [memory_limiter, batch]
      exporters: [otlp/jaeger]
    metrics:
      receivers: [otlp]
      processors: [memory_limiter, batch]
      exporters: [prometheus]
    logs:
      receivers: [otlp]
      processors: [memory_limiter, batch, attributes]
      exporters: [loki]
```

---

## Tracing Backends: Jaeger and Zipkin

| Feature | Jaeger | Zipkin |
|---------|--------|--------|
| Origin | Uber (2015) | Twitter (2012) |
| Language | Go | Java |
| Storage | Cassandra, Elasticsearch, Kafka | Cassandra, Elasticsearch, MySQL |
| UI | Rich, dependency graph | Simpler, lightweight |
| Sampling | Adaptive, remote | Fixed rate |
| Protocol | OTLP, Thrift, gRPC | HTTP, Kafka |
| Best for | Large-scale production | Simpler deployments |

---

## Trace Sampling

At scale, tracing every request is prohibitively expensive. Sampling reduces volume while preserving visibility.

### Head-Based Sampling

Decision made at the start of a trace (before any spans are created):

```
Request arrives → Random number < sample rate? → Trace / Don't trace

Pros: Simple, predictable cost
Cons: May miss rare errors (only 1% sampled means 99% of errors invisible)
```

```yaml
# OTel SDK configuration
sampler:
  type: parentbased_traceidratio
  arg: 0.1  # Sample 10% of traces
```

### Tail-Based Sampling

Decision made after the trace completes (all spans collected first):

```
All spans collected → Evaluate rules → Keep interesting traces

Rules:
- Status = ERROR → always keep
- Duration > 2s → always keep
- Specific endpoint → always keep
- Otherwise → sample at 5%
```

```yaml
# OTel Collector tail sampling processor
processors:
  tail_sampling:
    decision_wait: 10s
    num_traces: 100000
    policies:
      - name: errors
        type: status_code
        status_code: { status_codes: [ERROR] }
      - name: slow-requests
        type: latency
        latency: { threshold_ms: 2000 }
      - name: default
        type: probabilistic
        probabilistic: { sampling_percentage: 5 }
```

**Trade-offs:**

| Aspect | Head-Based | Tail-Based |
|--------|-----------|-----------|
| Cost | Predictable | Higher (buffer all spans) |
| Completeness | Random | Keeps all errors/anomalies |
| Complexity | Simple | Requires collector buffering |
| Latency to decision | Immediate | Delayed (wait for trace) |
| Memory | Low | High (must buffer) |

---

## Metrics Methodologies

### RED Method (Request-oriented)

For services that handle requests:

| Signal | Meaning | Example |
|--------|---------|---------|
| **R**ate | Requests per second | `rate(http_requests_total[5m])` |
| **E**rrors | Failed requests per second | `rate(http_requests_total{status=~"5.."}[5m])` |
| **D**uration | Time per request | `histogram_quantile(0.99, rate(http_request_duration_seconds_bucket[5m]))` |

### USE Method (Resource-oriented)

For infrastructure resources (CPU, memory, disk, network):

| Signal | Meaning | Example |
|--------|---------|---------|
| **U**tilization | % of resource busy | CPU usage 75% |
| **S**aturation | Work queued/waiting | 12 requests in queue |
| **E**rrors | Error events | 3 disk I/O errors |

### Combining RED and USE

```
                    ┌──────────────────────┐
                    │   User Request       │
                    └──────────┬───────────┘
                               │
                    ┌──────────▼───────────┐
                    │  API Gateway (RED)   │
                    │  Rate: 1200 req/s    │
                    │  Error: 0.1%         │
                    │  Duration p99: 120ms │
                    └──────────┬───────────┘
                               │
              ┌────────────────┼────────────────┐
              ▼                ▼                 ▼
    ┌─────────────┐  ┌─────────────┐  ┌──────────────┐
    │Order Svc    │  │Payment Svc  │  │Inventory Svc │
    │(RED)        │  │(RED)        │  │(RED)         │
    └──────┬──────┘  └──────┬──────┘  └──────┬───────┘
           │                │                 │
    ┌──────▼──────┐  ┌──────▼──────┐  ┌──────▼───────┐
    │PostgreSQL   │  │Redis Cache  │  │MongoDB       │
    │(USE)        │  │(USE)        │  │(USE)         │
    │Util: 45%    │  │Util: 60%    │  │Util: 30%     │
    │Sat: 2 queue │  │Sat: 0       │  │Sat: 0        │
    └─────────────┘  └─────────────┘  └──────────────┘
```

---

## Structured Logging with Correlation IDs

### Correlation Through Services

```javascript
// Middleware: extract trace context and inject into logger
function observabilityMiddleware(req, res, next) {
  const span = trace.getActiveSpan();
  const spanContext = span?.spanContext();

  req.logger = logger.child({
    trace_id: spanContext?.traceId,
    span_id: spanContext?.spanId,
    request_id: req.headers["x-request-id"] || crypto.randomUUID(),
    service: "order-service",
    method: req.method,
    path: req.path,
  });

  next();
}

// Usage in handler
app.post("/api/orders", async (req, res) => {
  req.logger.info({ order: req.body }, "Processing new order");

  try {
    const result = await processOrder(req.body);
    req.logger.info({ orderId: result.id }, "Order created successfully");
    res.json(result);
  } catch (error) {
    req.logger.error({ error: error.message, stack: error.stack }, "Order processing failed");
    res.status(500).json({ error: "Internal error" });
  }
});
```

### Querying Correlated Logs

With a shared `trace_id`, you can query all logs across services for a single request:

```
# Loki LogQL query
{service=~"order-service|payment-service|inventory-service"}
  | json
  | trace_id = "4bf92f3577b34da6a3ce929d0e0e4736"
  | line_format "{{.timestamp}} [{{.service}}] {{.message}}"
```

---

## Observability Platforms

### Grafana Stack (Open Source)

| Component | Purpose | Data Type |
|-----------|---------|-----------|
| **Prometheus** | Metrics collection and storage | Time-series metrics |
| **Loki** | Log aggregation | Logs |
| **Tempo** | Distributed trace storage | Traces |
| **Grafana** | Visualization and dashboards | All signals |
| **Mimir** | Long-term metrics storage | Metrics (scaled) |

```yaml
# docker-compose.yaml for Grafana observability stack
services:
  prometheus:
    image: prom/prometheus:latest
    volumes:
      - ./prometheus.yml:/etc/prometheus/prometheus.yml
    ports:
      - "9090:9090"

  loki:
    image: grafana/loki:latest
    ports:
      - "3100:3100"

  tempo:
    image: grafana/tempo:latest
    volumes:
      - ./tempo.yaml:/etc/tempo.yaml
    command: ["-config.file=/etc/tempo.yaml"]
    ports:
      - "3200:3200"   # tempo
      - "4317:4317"   # otlp grpc

  grafana:
    image: grafana/grafana:latest
    environment:
      - GF_AUTH_ANONYMOUS_ENABLED=true
    ports:
      - "3000:3000"
    volumes:
      - ./grafana-datasources.yaml:/etc/grafana/provisioning/datasources/datasources.yaml
```

### Commercial Platforms

| Platform | Strengths | Pricing Model |
|----------|-----------|---------------|
| **Datadog** | Unified platform, APM, infrastructure | Per host + ingestion |
| **New Relic** | Full-stack observability, AI ops | Per-GB ingested |
| **Honeycomb** | High-cardinality exploration | Per-event |
| **Splunk** | Log analytics, enterprise | Per-GB indexed |
| **Dynatrace** | AI-powered, auto-discovery | Per-host |

---

## Building Observable Systems

### Design Principles

1. **Instrument at boundaries** — trace every inter-service call, DB query, cache access
2. **Use semantic conventions** — follow OpenTelemetry naming standards
3. **Propagate context always** — never break the trace chain
4. **Add business context** — include order IDs, user IDs, feature flags in spans
5. **Alert on symptoms, not causes** — alert on error rate, not CPU usage

### Observability Checklist

```markdown
□ Every service emits traces via OpenTelemetry
□ Context propagation works across all communication channels
  □ HTTP (W3C traceparent header)
  □ gRPC (metadata)
  □ Message queues (message attributes)
  □ Async jobs (job metadata)
□ Structured JSON logging with trace_id correlation
□ RED metrics for every service endpoint
□ USE metrics for infrastructure resources
□ Dashboards showing service topology and health
□ Alerts configured for error rate, latency, saturation
□ Runbooks linked to each alert
□ Sampling strategy documented and tuned
□ SLOs defined with error budgets
```

### SLI/SLO Integration

```yaml
# SLO definition
slos:
  - name: order-api-availability
    description: "Orders API returns successful responses"
    sli:
      events:
        good: rate(http_requests_total{service="order-api", status=~"2.."}[5m])
        total: rate(http_requests_total{service="order-api"}[5m])
    objectives:
      - target: 0.999  # 99.9% availability
        window: 30d
    alerting:
      burn_rate:
        - short_window: 5m
          long_window: 1h
          factor: 14.4  # 1h budget consumed in 5m
```

---

## Exercises

### Exercise 1: Trace Analysis

Given this trace, identify the bottleneck:

```
Trace: e4a12b...
├── [gateway] /api/checkout  total=1850ms
│   ├── [auth] validate      45ms
│   ├── [cart] get-items     120ms
│   │   └── [redis] GET      3ms
│   ├── [inventory] reserve  1520ms  ← ???
│   │   ├── [db] SELECT      15ms
│   │   ├── [db] UPDATE      1480ms  ← ROOT CAUSE
│   │   └── [cache] invalidate 8ms
│   └── [payment] charge     140ms
```

**Questions:**
1. What is the total request latency?
2. Which service is the bottleneck?
3. What specific operation causes the slowdown?
4. What might cause a 1480ms database UPDATE?

### Exercise 2: Design a Sampling Strategy

Your system processes 50,000 requests/second. Storage budget allows 500 traces/second. Design a sampling strategy that:

- Captures all errors
- Captures all requests slower than 2 seconds
- Captures requests from VIP customers
- Randomly samples remaining traffic

Write a tail-based sampling configuration.

### Exercise 3: Correlation Query

A user reports order `ORD-12345` failed. Write queries to investigate:

1. A Tempo/Jaeger query to find the trace
2. A Loki query to find all logs for that trace
3. A Prometheus query to check if the error rate spiked

---

## Summary

| Concept | Purpose |
|---------|---------|
| Three Pillars | Metrics (aggregates), Logs (events), Traces (flow) |
| Distributed Tracing | Follow requests across service boundaries |
| Context Propagation | Pass trace IDs via headers (W3C Trace Context) |
| OpenTelemetry | Vendor-neutral instrumentation standard |
| Head-Based Sampling | Decide at trace start — simple, cheap |
| Tail-Based Sampling | Decide after completion — keeps anomalies |
| RED Method | Rate, Errors, Duration — for services |
| USE Method | Utilization, Saturation, Errors — for resources |
| Correlation IDs | Link logs to traces for full context |
| SLOs | Define reliability targets, alert on budget burn |

Observability transforms "the system is broken" into "here's exactly why, where, and since when." It is not a tool you install — it is a property you design into your distributed system from the beginning.
