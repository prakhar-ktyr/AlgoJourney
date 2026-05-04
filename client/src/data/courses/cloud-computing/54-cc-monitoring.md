---
title: "Monitoring and Observability"
---

# Monitoring and Observability

Welcome to this lesson on **Monitoring and Observability** in cloud computing! In production environments, you need to know what's happening inside your systems at all times. Monitoring and observability are the practices and tools that give you that visibility.

In this lesson, you will learn about the three pillars of observability, cloud-native monitoring services, APM tools, distributed tracing, and how to build effective alerting strategies.

---

## Monitoring vs Observability

Before diving in, let's clarify two terms that are often used interchangeably but mean different things.

| Aspect | Monitoring | Observability |
|---|---|---|
| **Definition** | Tracking predefined metrics and alerts | Understanding system internals from external outputs |
| **Approach** | Reactive — "Is the system broken?" | Proactive — "Why is the system broken?" |
| **Scope** | Known failure modes | Unknown failure modes |
| **Data** | Metrics and thresholds | Metrics, logs, and traces combined |
| **Question** | "What is happening?" | "Why is it happening?" |
| **Analogy** | Dashboard warning lights in a car | A mechanic's full diagnostic system |

> **Think of it this way:** Monitoring tells you *when* something is wrong. Observability helps you figure out *why*.

---

## The Three Pillars of Observability

Observability rests on three foundational data types, often called the **three pillars**:

```
┌─────────────────────────────────────────────────┐
│              OBSERVABILITY                      │
│                                                 │
│   ┌──────────┐  ┌────────┐  ┌──────────┐       │
│   │ METRICS  │  │  LOGS  │  │  TRACES  │       │
│   │          │  │        │  │          │       │
│   │ Numbers  │  │ Events │  │ Requests │       │
│   │ over     │  │ with   │  │ across   │       │
│   │ time     │  │ detail │  │ services │       │
│   └──────────┘  └────────┘  └──────────┘       │
└─────────────────────────────────────────────────┘
```

### 1. Metrics

Metrics are **numerical measurements** collected at regular intervals. They answer questions like "How much?" and "How many?"

```
# Example metrics
cpu_utilization: 72%
request_count: 1,523 req/min
error_rate: 0.3%
response_time_p99: 245ms
memory_usage: 4.2 GB
```

**Characteristics of metrics:**

- Lightweight and cheap to store
- Easy to aggregate and visualize
- Great for dashboards and alerting
- Lose individual event detail

### 2. Logs

Logs are **timestamped records** of discrete events. They provide rich detail about what happened.

```json
{
  "timestamp": "2026-05-04T10:15:32.456Z",
  "level": "ERROR",
  "service": "payment-service",
  "message": "Payment processing failed",
  "error": "CardDeclinedException",
  "userId": "usr_12345",
  "orderId": "ord_67890",
  "amount": 49.99
}
```

**Characteristics of logs:**

- Rich contextual information
- Expensive to store at scale
- Hard to aggregate without structure
- Essential for debugging specific issues

### 3. Traces

Traces follow a **single request** as it flows through multiple services. They show the complete journey of a transaction.

```
Trace ID: abc-123-def

[Gateway]──→[Auth Service]──→[Order Service]──→[Payment Service]──→[Notification]
  2ms           15ms              45ms              120ms              8ms

Total Duration: 190ms
```

**Characteristics of traces:**

- Show causality across services
- Identify bottlenecks in distributed systems
- Higher overhead than metrics
- Essential for microservices debugging

---

## Cloud Monitoring Services

Each major cloud provider offers native monitoring services.

### AWS CloudWatch

CloudWatch is AWS's unified monitoring service.

```bash
# Create a CloudWatch alarm for high CPU
aws cloudwatch put-metric-alarm \
  --alarm-name "HighCPU" \
  --metric-name CPUUtilization \
  --namespace AWS/EC2 \
  --statistic Average \
  --period 300 \
  --threshold 80 \
  --comparison-operator GreaterThanThreshold \
  --evaluation-periods 2 \
  --alarm-actions arn:aws:sns:us-east-1:123456789:alerts
```

**Key features:**

| Feature | Description |
|---|---|
| Metrics | 10-second granularity, 15 months retention |
| Alarms | Threshold, anomaly detection, composite alarms |
| Dashboards | Custom visualizations with widgets |
| Logs | Log groups, streams, and Insights queries |
| Events/EventBridge | React to state changes in AWS resources |
| Synthetics | Canary scripts to monitor endpoints |
| ServiceLens | End-to-end observability with traces |

### Azure Monitor

Azure Monitor provides comprehensive monitoring for Azure resources.

```json
// Azure Monitor alert rule (ARM template snippet)
{
  "type": "Microsoft.Insights/metricAlerts",
  "properties": {
    "severity": 2,
    "criteria": {
      "odata.type": "Microsoft.Azure.Monitor.SingleResourceMultipleMetricCriteria",
      "allOf": [
        {
          "name": "HighCPU",
          "metricName": "Percentage CPU",
          "operator": "GreaterThan",
          "threshold": 80,
          "timeAggregation": "Average"
        }
      ]
    },
    "windowSize": "PT5M",
    "evaluationFrequency": "PT1M"
  }
}
```

### Google Cloud Monitoring

Formerly Stackdriver, Cloud Monitoring integrates across GCP services.

```yaml
# Cloud Monitoring alert policy (YAML)
displayName: "High CPU Alert"
conditions:
  - displayName: "CPU > 80%"
    conditionThreshold:
      filter: >
        resource.type = "gce_instance"
        AND metric.type = "compute.googleapis.com/instance/cpu/utilization"
      comparison: COMPARISON_GT
      thresholdValue: 0.8
      duration: "300s"
      aggregations:
        - alignmentPeriod: "60s"
          perSeriesAligner: ALIGN_MEAN
```

### Comparison Table

| Feature | AWS CloudWatch | Azure Monitor | GCP Cloud Monitoring |
|---|---|---|---|
| **Metrics retention** | 15 months | 93 days | 6 weeks (free) |
| **Custom metrics** | Yes (paid) | Yes (paid) | Yes (paid) |
| **Log analytics** | CloudWatch Insights | Log Analytics (KQL) | Log Explorer |
| **Tracing** | X-Ray | Application Insights | Cloud Trace |
| **Dashboards** | CloudWatch Dashboards | Azure Dashboards | Cloud Dashboards |
| **Free tier** | 10 custom metrics | 5 GB logs/month | 150 MB logs/month |

---

## Custom Metrics

Beyond built-in infrastructure metrics, you should track **custom metrics** specific to your application.

### Common Custom Metrics

```python
# Example: Publishing custom metrics with AWS SDK (boto3)
import boto3
from datetime import datetime

cloudwatch = boto3.client("cloudwatch")

# Business metric: orders processed
cloudwatch.put_metric_data(
    Namespace="MyApp/Orders",
    MetricData=[
        {
            "MetricName": "OrdersProcessed",
            "Timestamp": datetime.utcnow(),
            "Value": 42,
            "Unit": "Count",
            "Dimensions": [
                {"Name": "Region", "Value": "us-east-1"},
                {"Name": "OrderType", "Value": "premium"},
            ],
        }
    ],
)
```

### Types of Custom Metrics

| Type | Example | Use Case |
|---|---|---|
| **Counter** | `requests_total` | Things that only go up |
| **Gauge** | `queue_depth` | Values that go up and down |
| **Histogram** | `response_time_bucket` | Distribution of values |
| **Summary** | `request_duration_p99` | Percentiles of a distribution |

### Dashboard Design Best Practices

A well-designed dashboard follows the **USE Method** (Utilization, Saturation, Errors):

```
┌─────────────────────────────────────────────────────┐
│                  SERVICE DASHBOARD                   │
├──────────────────┬──────────────────┬────────────────┤
│  Request Rate    │  Error Rate      │  Latency p99   │
│  ████████ 1.2k/s│  ░░░░░░░░ 0.3%  │  ████░░░ 245ms │
├──────────────────┼──────────────────┼────────────────┤
│  CPU Utilization │  Memory Usage    │  Disk I/O      │
│  ██████░░ 72%   │  █████░░░ 62%   │  ███░░░░ 35%   │
├──────────────────┼──────────────────┼────────────────┤
│  Queue Depth     │  Active Conns    │  Cache Hit Rate │
│  ██░░░░░░ 23    │  ████░░░░ 412   │  ████████ 94%  │
└──────────────────┴──────────────────┴────────────────┘
```

---

## APM Tools and Distributed Tracing

Application Performance Monitoring (APM) tools combine metrics, logs, and traces to give deep application-level visibility.

### Cloud-Native APM Services

#### AWS X-Ray

```python
# Instrumenting a Flask app with AWS X-Ray
from aws_xray_sdk.core import xray_recorder
from aws_xray_sdk.ext.flask.middleware import XRayMiddleware

app = Flask(__name__)
xray_recorder.configure(service="order-service")
XRayMiddleware(app, xray_recorder)

@app.route("/api/orders")
def get_orders():
    # X-Ray automatically traces this request
    # and captures downstream calls
    orders = db.query("SELECT * FROM orders")
    return jsonify(orders)
```

#### Azure Application Insights

```python
# Instrumenting with Application Insights
from opencensus.ext.azure.trace_exporter import AzureExporter
from opencensus.trace.tracer import Tracer

tracer = Tracer(
    exporter=AzureExporter(
        connection_string="InstrumentationKey=your-key-here"
    )
)

with tracer.span(name="ProcessOrder"):
    # Your application logic
    validate_order(order)
    process_payment(order)
    send_confirmation(order)
```

#### Google Cloud Trace

```python
# Instrumenting with Cloud Trace
from opentelemetry import trace
from opentelemetry.exporter.cloud_trace import CloudTraceSpanExporter
from opentelemetry.sdk.trace import TracerProvider
from opentelemetry.sdk.trace.export import BatchSpanProcessor

tracer_provider = TracerProvider()
cloud_trace_exporter = CloudTraceSpanExporter()
tracer_provider.add_span_processor(
    BatchSpanProcessor(cloud_trace_exporter)
)
trace.set_tracer_provider(tracer_provider)

tracer = trace.get_tracer(__name__)

with tracer.start_as_current_span("process-order"):
    # Traced operation
    pass
```

### OpenTelemetry — The Vendor-Neutral Standard

**OpenTelemetry (OTel)** is an open-source, vendor-neutral framework for instrumentation. It's becoming the industry standard.

```python
# OpenTelemetry setup — works with ANY backend
from opentelemetry import trace, metrics
from opentelemetry.sdk.trace import TracerProvider
from opentelemetry.sdk.metrics import MeterProvider
from opentelemetry.sdk.trace.export import BatchSpanProcessor
from opentelemetry.exporter.otlp.proto.grpc.trace_exporter import OTLPSpanExporter

# Configure tracing
tracer_provider = TracerProvider()
otlp_exporter = OTLPSpanExporter(endpoint="http://collector:4317")
tracer_provider.add_span_processor(BatchSpanProcessor(otlp_exporter))
trace.set_tracer_provider(tracer_provider)

# Create a tracer
tracer = trace.get_tracer("my-service")

# Use it in your code
with tracer.start_as_current_span("handle-request") as span:
    span.set_attribute("http.method", "GET")
    span.set_attribute("http.url", "/api/users")
    # Process the request...
```

**Why OpenTelemetry?**

- Vendor-neutral — switch backends without code changes
- Supports metrics, logs, and traces
- Auto-instrumentation for popular frameworks
- Growing ecosystem and community
- Backed by CNCF

---

## Health Checks and Synthetic Monitoring

### Health Check Endpoints

Every service should expose health check endpoints:

```javascript
// Express.js health check endpoints
app.get("/health", (req, res) => {
  res.status(200).json({ status: "healthy" });
});

app.get("/health/ready", async (req, res) => {
  // Readiness: can this instance serve traffic?
  const dbHealthy = await checkDatabase();
  const cacheHealthy = await checkCache();

  if (dbHealthy && cacheHealthy) {
    res.status(200).json({
      status: "ready",
      checks: { database: "up", cache: "up" },
    });
  } else {
    res.status(503).json({
      status: "not ready",
      checks: {
        database: dbHealthy ? "up" : "down",
        cache: cacheHealthy ? "up" : "down",
      },
    });
  }
});

app.get("/health/live", (req, res) => {
  // Liveness: is this process alive?
  res.status(200).json({ status: "alive" });
});
```

### Synthetic Monitoring

Synthetic monitoring simulates user interactions to detect issues before real users are affected.

```python
# AWS CloudWatch Synthetics canary
# This script runs every 5 minutes to check your API
import requests

def handler(event, context):
    endpoints = [
        {"url": "https://api.example.com/health", "expected_status": 200},
        {"url": "https://api.example.com/api/products", "expected_status": 200},
        {"url": "https://www.example.com", "expected_status": 200},
    ]

    for endpoint in endpoints:
        response = requests.get(endpoint["url"], timeout=10)
        assert response.status_code == endpoint["expected_status"], \
            f"Expected {endpoint['expected_status']}, got {response.status_code}"

    return {"statusCode": 200, "body": "All checks passed"}
```

---

## SLIs, SLOs, and Error Budgets

These concepts from **Site Reliability Engineering (SRE)** formalize how you measure and manage service reliability.

### Definitions

| Term | Full Name | Definition | Example |
|---|---|---|---|
| **SLI** | Service Level Indicator | A quantitative measure of service quality | Request latency, error rate |
| **SLO** | Service Level Objective | A target value for an SLI | 99.9% of requests < 200ms |
| **SLA** | Service Level Agreement | A contract with consequences for missing SLOs | 99.95% uptime or credits issued |
| **Error Budget** | — | The allowed amount of unreliability (100% − SLO) | 0.1% = ~43 min downtime/month |

### Calculating Error Budgets

```
SLO = 99.9% availability

Error Budget = 100% - 99.9% = 0.1%

In a 30-day month:
  Total minutes = 30 × 24 × 60 = 43,200 minutes
  Allowed downtime = 43,200 × 0.001 = 43.2 minutes

If you've used 30 minutes this month:
  Remaining budget = 43.2 - 30 = 13.2 minutes
  Budget consumed = 30 / 43.2 = 69.4%
```

### Common SLOs by Tier

| Availability | Monthly Downtime | Typical Use |
|---|---|---|
| 99% ("two nines") | 7.2 hours | Internal tools |
| 99.9% ("three nines") | 43.2 minutes | Standard web apps |
| 99.95% | 21.6 minutes | E-commerce, SaaS |
| 99.99% ("four nines") | 4.3 minutes | Financial, healthcare |
| 99.999% ("five nines") | 26 seconds | Critical infrastructure |

---

## Alerting Best Practices

Bad alerting leads to **alert fatigue** — when teams receive so many alerts they start ignoring them.

### The Alerting Hierarchy

```
         ╔═══════════════╗
         ║   PAGE (P1)   ║  ← Wake someone up
         ║  Service DOWN ║
         ╠═══════════════╣
         ║  TICKET (P2)  ║  ← Fix during business hours
         ║  SLO burning  ║
         ╠═══════════════╣
         ║   LOG (P3)    ║  ← Investigate when possible
         ║  Warning sign ║
         ╠═══════════════╣
         ║  DASHBOARD    ║  ← Visible but no notification
         ║  Informational║
         ╚═══════════════╝
```

### Rules for Effective Alerting

1. **Every alert must be actionable** — if you can't do anything about it, don't alert on it
2. **Alert on symptoms, not causes** — alert on "error rate > 1%" not "CPU > 80%"
3. **Use multi-window burn rates** — avoid flapping alerts from brief spikes
4. **Include runbook links** — every alert should link to remediation steps
5. **Set proper severity levels** — not everything is P1
6. **Review alerts regularly** — delete alerts nobody acts on

### Example: Multi-Window Burn Rate Alert

```yaml
# Alert when SLO error budget is burning too fast
# instead of alerting on every individual error
alert: ErrorBudgetBurnRate
expr: |
  (
    # Short window (5 min) — catches fast burns
    sum(rate(http_requests_total{status=~"5.."}[5m]))
    / sum(rate(http_requests_total[5m]))
  ) > (14.4 * 0.001)  # 14.4x burn rate against 99.9% SLO
  AND
  (
    # Long window (1 hour) — confirms sustained issue
    sum(rate(http_requests_total{status=~"5.."}[1h]))
    / sum(rate(http_requests_total[1h]))
  ) > (14.4 * 0.001)
severity: page
```

---

## Observability Platforms

While cloud-native tools work well, many teams use third-party platforms for unified, multi-cloud observability.

| Platform | Strengths | Pricing Model |
|---|---|---|
| **Datadog** | Full-stack, easy setup, wide integrations | Per host + per GB logs |
| **Grafana + Prometheus** | Open source, flexible, self-hosted or cloud | Free (self-hosted) or per-series (cloud) |
| **New Relic** | Strong APM, generous free tier | Per GB ingested |
| **Splunk** | Powerful log analytics, enterprise-grade | Per GB indexed |
| **Elastic (ELK)** | Open source search, log analytics | Free (self-hosted) or per-resource (cloud) |
| **Dynatrace** | AI-powered root cause analysis | Per host |

### Grafana + Prometheus Stack

This open-source combination is extremely popular:

```yaml
# docker-compose.yml — Prometheus + Grafana stack
version: "3.8"
services:
  prometheus:
    image: prom/prometheus:latest
    volumes:
      - ./prometheus.yml:/etc/prometheus/prometheus.yml
    ports:
      - "9090:9090"

  grafana:
    image: grafana/grafana:latest
    ports:
      - "3000:3000"
    environment:
      - GF_SECURITY_ADMIN_PASSWORD=admin
    volumes:
      - grafana-data:/var/lib/grafana

volumes:
  grafana-data:
```

```yaml
# prometheus.yml — Prometheus configuration
global:
  scrape_interval: 15s

scrape_configs:
  - job_name: "my-app"
    static_configs:
      - targets: ["app:8080"]
    metrics_path: /metrics
```

---

## Practical: Setting Up CloudWatch Alarms and Dashboards

Let's walk through setting up a complete monitoring solution on AWS.

### Step 1: Create a Dashboard

```bash
# Create a CloudWatch dashboard
aws cloudwatch put-dashboard \
  --dashboard-name "ProductionOverview" \
  --dashboard-body '{
    "widgets": [
      {
        "type": "metric",
        "x": 0, "y": 0, "width": 12, "height": 6,
        "properties": {
          "metrics": [
            ["AWS/EC2", "CPUUtilization", "InstanceId", "i-1234567890abcdef0"]
          ],
          "period": 300,
          "stat": "Average",
          "region": "us-east-1",
          "title": "EC2 CPU Utilization"
        }
      },
      {
        "type": "metric",
        "x": 12, "y": 0, "width": 12, "height": 6,
        "properties": {
          "metrics": [
            ["AWS/ApplicationELB", "RequestCount", "LoadBalancer", "app/my-alb/1234567890"]
          ],
          "period": 60,
          "stat": "Sum",
          "title": "ALB Request Count"
        }
      }
    ]
  }'
```

### Step 2: Set Up Alarms

```bash
# Create an SNS topic for alerts
aws sns create-topic --name production-alerts

# Subscribe your email
aws sns subscribe \
  --topic-arn arn:aws:sns:us-east-1:123456789:production-alerts \
  --protocol email \
  --notification-endpoint team@example.com

# Create a high error rate alarm
aws cloudwatch put-metric-alarm \
  --alarm-name "HighErrorRate" \
  --alarm-description "Error rate exceeds 1% for 5 minutes" \
  --metric-name "5XXError" \
  --namespace "AWS/ApplicationELB" \
  --statistic Sum \
  --period 300 \
  --threshold 10 \
  --comparison-operator GreaterThanThreshold \
  --evaluation-periods 1 \
  --alarm-actions arn:aws:sns:us-east-1:123456789:production-alerts \
  --dimensions Name=LoadBalancer,Value=app/my-alb/1234567890
```

### Step 3: Publish Custom Application Metrics

```python
import boto3
import time

cloudwatch = boto3.client("cloudwatch")

def publish_app_metrics(request_count, error_count, latency_ms):
    """Publish custom application metrics to CloudWatch."""
    cloudwatch.put_metric_data(
        Namespace="MyApp/API",
        MetricData=[
            {
                "MetricName": "RequestCount",
                "Value": request_count,
                "Unit": "Count",
            },
            {
                "MetricName": "ErrorCount",
                "Value": error_count,
                "Unit": "Count",
            },
            {
                "MetricName": "Latency",
                "Value": latency_ms,
                "Unit": "Milliseconds",
                "StatisticValues": {
                    "SampleCount": request_count,
                    "Sum": latency_ms * request_count,
                    "Minimum": latency_ms * 0.5,
                    "Maximum": latency_ms * 2.0,
                },
            },
        ],
    )
```

### Step 4: Create a Composite Alarm

```bash
# Composite alarm: triggers only when BOTH conditions are true
aws cloudwatch put-composite-alarm \
  --alarm-name "CriticalServiceDegraded" \
  --alarm-rule 'ALARM("HighErrorRate") AND ALARM("HighLatency")' \
  --alarm-actions arn:aws:sns:us-east-1:123456789:production-alerts \
  --alarm-description "Service is experiencing both high errors and high latency"
```

---

## Exercises

1. **Three Pillars Identification:**
   You receive a report that "the checkout page is slow." Map out which pillar (metrics, logs, or traces) you would use first, second, and third — and what specific data you would look for in each.

2. **SLO Calculation:**
   Your e-commerce API has an SLO of 99.95% availability. Calculate the monthly error budget in minutes. If you've had two outages this month (12 minutes and 8 minutes), how much budget remains?

3. **Alert Design:**
   Design an alerting strategy for a payment processing service. Define three alerts at different severity levels (page, ticket, dashboard) with specific thresholds and actions.

4. **Dashboard Design:**
   Sketch a monitoring dashboard for a web application with 5 microservices. List the top 8 widgets you would include and explain why each matters.

5. **OpenTelemetry Integration:**
   Write a Python function that creates an OpenTelemetry span with at least 3 custom attributes and a child span for a database call.

---

## Key Takeaways

| Concept | Summary |
|---|---|
| **Monitoring vs Observability** | Monitoring detects known issues; observability helps diagnose unknown ones |
| **Three Pillars** | Metrics (numbers over time), Logs (event details), Traces (request flows) |
| **Cloud Services** | CloudWatch (AWS), Azure Monitor (Azure), Cloud Monitoring (GCP) |
| **Custom Metrics** | Track business-specific KPIs beyond infrastructure metrics |
| **OpenTelemetry** | Vendor-neutral standard for instrumentation — use it |
| **SLIs/SLOs** | Quantify reliability targets; error budgets balance reliability vs velocity |
| **Alert Fatigue** | Only alert on actionable symptoms; use burn rates, not raw thresholds |
| **Health Checks** | Expose `/health/live` and `/health/ready` endpoints in every service |
| **Dashboards** | Follow the USE method: Utilization, Saturation, Errors |
| **Observability Platforms** | Datadog, Grafana, New Relic provide unified multi-cloud visibility |

---

## What's Next?

In the next lesson, you'll learn about **Logging and Log Analytics** — how to build centralized logging solutions, write effective log queries, and optimize logging costs in the cloud.
