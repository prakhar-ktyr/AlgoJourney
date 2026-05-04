---
title: "Batch vs Stream Processing"
---

# Batch vs Stream Processing

Data processing in distributed systems falls into two fundamental paradigms: **batch processing** (processing bounded datasets) and **stream processing** (processing unbounded, continuous data). Understanding when and how to use each — or both — is critical for building scalable data architectures.

---

## Processing Paradigms Overview

| Aspect | Batch Processing | Stream Processing |
|--------|-----------------|-------------------|
| Data scope | Bounded (finite dataset) | Unbounded (infinite stream) |
| Latency | Minutes to hours | Milliseconds to seconds |
| Completeness | Complete view of data | Partial/approximate view |
| Complexity | Simpler logic | Complex state management |
| Fault tolerance | Restart from beginning | Checkpointing required |
| Use case | Analytics, reports, ETL | Real-time alerts, dashboards |

---

## Lambda Architecture

The **Lambda architecture**, proposed by Nathan Marz, addresses the need for both real-time and historically accurate results by running two parallel processing systems.

### Three Layers

```
                    ┌─────────────────────────────┐
                    │        Serving Layer         │
                    │   (Merged batch + speed)     │
                    └──────────┬──────────────────┘
                               │
              ┌────────────────┴────────────────┐
              │                                 │
    ┌─────────▼─────────┐           ┌──────────▼──────────┐
    │    Batch Layer     │           │    Speed Layer       │
    │  (Complete, slow)  │           │  (Approximate, fast) │
    └─────────▲─────────┘           └──────────▲──────────┘
              │                                 │
              └────────────────┬────────────────┘
                               │
                    ┌──────────▼──────────┐
                    │    Raw Data Stream   │
                    └─────────────────────┘
```

### Batch Layer

The batch layer processes the **master dataset** (all historical data) to produce **batch views**.

```python
# Example: Batch layer computing daily revenue
# Apache Spark batch job

from pyspark.sql import SparkSession
from pyspark.sql.functions import sum, col, to_date

spark = SparkSession.builder.appName("DailyRevenue").getOrCreate()

# Read all historical transactions
transactions = spark.read.parquet("s3://data-lake/transactions/")

# Compute complete daily revenue
daily_revenue = (
    transactions
    .withColumn("date", to_date(col("timestamp")))
    .groupBy("date")
    .agg(sum("amount").alias("total_revenue"))
)

# Write batch view
daily_revenue.write.mode("overwrite").parquet(
    "s3://batch-views/daily-revenue/"
)
```

**Characteristics:**
- Processes the entire dataset from scratch
- Results are always correct (eventual consistency)
- High latency (runs periodically, e.g., hourly/daily)
- Simple programming model

### Speed Layer

The speed layer processes only **recent data** to compensate for the batch layer's latency.

```python
# Example: Speed layer with Apache Kafka + Flink-style processing
# Real-time revenue accumulator

from dataclasses import dataclass, field
from datetime import datetime
from collections import defaultdict

@dataclass
class SpeedLayerState:
    revenue_since_last_batch: dict = field(
        default_factory=lambda: defaultdict(float)
    )
    last_batch_timestamp: datetime = None

class RevenueSpeedLayer:
    def __init__(self):
        self.state = SpeedLayerState()

    def process_event(self, event):
        """Process a single transaction event in real-time."""
        date_key = event["timestamp"].strftime("%Y-%m-%d")
        self.state.revenue_since_last_batch[date_key] += event["amount"]

    def get_real_time_view(self, date):
        """Return revenue accumulated since last batch run."""
        return self.state.revenue_since_last_batch.get(date, 0.0)

    def on_batch_complete(self, batch_timestamp):
        """Reset speed layer state after batch completes."""
        self.state.last_batch_timestamp = batch_timestamp
        self.state.revenue_since_last_batch.clear()
```

### Serving Layer

The serving layer **merges** batch views with speed layer results to answer queries.

```python
class ServingLayer:
    def __init__(self, batch_store, speed_layer):
        self.batch_store = batch_store
        self.speed_layer = speed_layer

    def query_revenue(self, date):
        """Merge batch and real-time views."""
        batch_result = self.batch_store.get(date, 0.0)
        realtime_delta = self.speed_layer.get_real_time_view(date)
        return batch_result + realtime_delta
```

### Lambda Architecture Trade-offs

| Pros | Cons |
|------|------|
| Accurate historical results | Dual codebase maintenance |
| Low-latency real-time view | Complexity of merging views |
| Fault-tolerant (batch recomputes) | Higher infrastructure cost |
| Handles late-arriving data | Synchronization challenges |

---

## Kappa Architecture

The **Kappa architecture**, proposed by Jay Kreps (LinkedIn), simplifies Lambda by using **only stream processing** for both real-time and historical workloads.

### Core Idea

```
    ┌─────────────────────────────────────────────┐
    │              Immutable Log                    │
    │        (e.g., Apache Kafka)                  │
    └──────────────────┬──────────────────────────┘
                       │
         ┌─────────────▼─────────────┐
         │    Stream Processing       │
         │    (Single pipeline)       │
         └─────────────┬─────────────┘
                       │
         ┌─────────────▼─────────────┐
         │      Serving Layer         │
         └───────────────────────────┘
```

### How Reprocessing Works

Instead of a batch layer, Kappa replays the log from the beginning when corrections are needed:

```python
# Kappa architecture: stream processing with reprocessing capability

class KappaProcessor:
    """
    Single stream processor that handles both real-time
    and historical reprocessing by replaying the log.
    """

    def __init__(self, kafka_consumer, output_store):
        self.consumer = kafka_consumer
        self.output = output_store

    def run(self, start_offset="latest"):
        """
        Process events from a given offset.
        - 'latest': real-time processing
        - 'earliest': full reprocessing (like a batch job)
        - specific offset: partial reprocessing
        """
        self.consumer.seek(start_offset)

        for event in self.consumer:
            result = self.transform(event)
            self.output.upsert(result)

    def transform(self, event):
        """Single transformation logic — no dual codebase."""
        return {
            "key": event["user_id"],
            "revenue": event["amount"],
            "window": event["timestamp"].strftime("%Y-%m-%d"),
        }

    def reprocess(self):
        """
        Reprocessing: spin up a new instance reading from
        the beginning, write to a new output table, then swap.
        """
        new_output = self.output.create_new_version()
        self.consumer.seek("earliest")

        for event in self.consumer:
            result = self.transform(event)
            new_output.upsert(result)

        # Atomic swap
        self.output.swap_to(new_output)
```

### Kappa Architecture Trade-offs

| Pros | Cons |
|------|------|
| Single codebase | Log retention costs |
| Simpler operations | Reprocessing can be slow |
| Easier evolution | Not ideal for complex analytics |
| Lower infrastructure | Requires idempotent processing |

---

## Lambda vs Kappa Comparison

| Criteria | Lambda | Kappa |
|----------|--------|-------|
| Codebase | Dual (batch + stream) | Single (stream only) |
| Reprocessing | Batch layer recomputes | Replay from log |
| Accuracy | Batch guarantees correctness | Depends on stream guarantees |
| Operational cost | Higher (two systems) | Lower (one system) |
| Best for | Complex analytics + real-time | Event-driven applications |
| Data retention | Arbitrary | Bounded by log retention |
| Debugging | Harder (two paths) | Easier (one path) |

---

## Batch Processing Strengths

### Complete Data Access

Batch processing sees the **entire dataset**, enabling computations that require global knowledge:

```python
# Operations that benefit from complete data
# 1. Exact percentiles (need all values)
# 2. Graph algorithms (need full graph)
# 3. ML model training (need all features)
# 4. Historical trend analysis

# Example: Computing exact median (impossible in streaming)
from pyspark.sql.functions import percentile_approx, expr

exact_median = (
    spark.read.parquet("s3://data/user-sessions/")
    .selectExpr("percentile(session_duration, 0.5) as median")
    .collect()[0]["median"]
)
```

### Complex Analytics

```python
# Multi-pass algorithms only feasible in batch
# Example: PageRank (iterative graph computation)

def pagerank_batch(graph, iterations=20, damping=0.85):
    """PageRank requires multiple passes over the full graph."""
    num_nodes = graph.num_vertices
    ranks = {node: 1.0 / num_nodes for node in graph.vertices}

    for _ in range(iterations):
        new_ranks = {}
        for node in graph.vertices:
            rank_sum = sum(
                ranks[neighbor] / graph.out_degree(neighbor)
                for neighbor in graph.in_neighbors(node)
            )
            new_ranks[node] = (1 - damping) / num_nodes + damping * rank_sum
        ranks = new_ranks

    return ranks
```

### Historical Reprocessing

When business logic changes, batch can recompute all historical results:

```python
# Reprocessing scenario: pricing model changed retroactively
def reprocess_with_new_pricing(start_date, end_date, new_model):
    """Recompute all invoices with updated pricing."""
    orders = load_all_orders(start_date, end_date)

    recalculated = orders.map(lambda order: {
        **order,
        "total": new_model.calculate(order["items"]),
        "reprocessed_at": datetime.now(),
    })

    recalculated.write.mode("overwrite").parquet(
        "s3://data/invoices-v2/"
    )
```

---

## Stream Processing Strengths

### Low Latency

```python
# Real-time fraud detection (must respond in < 100ms)

class FraudDetector:
    def __init__(self):
        self.user_profiles = {}  # Maintained in-stream state

    def process_transaction(self, txn):
        user = self.user_profiles.get(txn["user_id"])

        if self.is_suspicious(txn, user):
            return {"action": "BLOCK", "reason": self.reason, "latency_ms": 12}

        self.update_profile(txn)
        return {"action": "ALLOW"}

    def is_suspicious(self, txn, profile):
        if profile is None:
            return False
        # Velocity check
        if txn["amount"] > profile["avg_amount"] * 10:
            self.reason = "Amount 10x above average"
            return True
        # Geo-impossibility
        if self.impossible_travel(txn["location"], profile["last_location"],
                                   txn["timestamp"], profile["last_timestamp"]):
            self.reason = "Impossible travel detected"
            return True
        return False
```

### Real-Time Decisions

| Use Case | Latency Requirement | Example |
|----------|-------------------|---------|
| Fraud detection | < 100 ms | Block suspicious transactions |
| Ad bidding | < 50 ms | Real-time auction decisions |
| IoT alerting | < 1 s | Equipment failure warnings |
| Recommendations | < 200 ms | "Users also viewed" updates |
| Surge pricing | < 5 s | Dynamic pricing adjustments |

---

## Unified Processing: Apache Beam Model

Apache Beam provides a **single programming model** for both batch and stream:

```python
# Apache Beam: same code runs on batch or stream runner

import apache_beam as beam
from apache_beam.transforms.window import FixedWindows
from apache_beam.transforms.trigger import AfterWatermark

def revenue_pipeline(pipeline_options):
    with beam.Pipeline(options=pipeline_options) as p:
        (
            p
            | "ReadEvents" >> beam.io.ReadFromPubSub(topic="transactions")
            # OR for batch: beam.io.ReadFromParquet("gs://data/txns/")
            | "Window" >> beam.WindowInto(
                FixedWindows(60 * 60),  # 1-hour windows
                trigger=AfterWatermark(
                    early=beam.transforms.trigger.AfterCount(100)
                ),
                accumulation_mode=beam.transforms.trigger.AccumulationMode.ACCUMULATING,
            )
            | "ExtractRevenue" >> beam.Map(lambda e: (e["region"], e["amount"]))
            | "SumByRegion" >> beam.CombinePerKey(sum)
            | "Write" >> beam.io.WriteToBigQuery("project:dataset.revenue")
        )
```

### Beam's Key Abstractions

| Concept | Description |
|---------|-------------|
| PCollection | Bounded or unbounded dataset |
| Window | Groups elements by time |
| Trigger | When to emit results |
| Watermark | Tracks event-time progress |
| Accumulation | How to handle late data |

---

## When to Use Each Approach

### Choose Batch When:

- **Complete accuracy** is required (financial reports, compliance)
- **Complex multi-pass algorithms** (ML training, graph analytics)
- **Data arrives in bulk** (daily file drops, database exports)
- **Cost optimization** matters more than latency
- **Historical reprocessing** is frequent

### Choose Stream When:

- **Low latency** is critical (fraud, monitoring, alerting)
- **Data is naturally unbounded** (IoT sensors, click streams)
- **Real-time dashboards** are required
- **Event-driven architectures** drive the system
- **Immediate action** is needed on each event

### Choose Hybrid When:

- **Both real-time views and accurate reports** are needed
- **Gradual migration** from batch to stream
- **Different SLAs** for different consumers
- **Regulatory requirements** demand both speed and accuracy

---

## Cost Considerations

| Factor | Batch | Stream |
|--------|-------|--------|
| Compute | Pay for scheduled runs | Always-on resources |
| Storage | Data lake (cheap) | State stores + log (moderate) |
| Infrastructure | Simpler (fewer moving parts) | Complex (brokers, state, checkpoints) |
| Scaling | Vertical (bigger cluster) | Horizontal (add partitions) |
| Failure cost | Re-run entire job | Checkpoint recovery |

### Cost Optimization Strategies

```python
# Batch: Use spot/preemptible instances
batch_config = {
    "cluster": "ephemeral",
    "instances": "spot",
    "schedule": "0 2 * * *",  # Run at 2 AM (cheaper)
    "estimated_cost": "$0.50/run",
}

# Stream: Right-size with auto-scaling
stream_config = {
    "min_instances": 2,
    "max_instances": 20,
    "scale_metric": "consumer_lag",
    "scale_threshold": 10000,  # messages behind
    "estimated_cost": "$200/month baseline",
}
```

---

## Real-World Architecture Examples

### Netflix: Lambda-Style Hybrid

```
┌─────────────────────────────────────────────────┐
│                  Netflix Data Pipeline            │
├─────────────────────────────────────────────────┤
│                                                   │
│  Viewing Events ──► Kafka ──┬──► Flink (Stream)  │
│                             │    └─► Real-time    │
│                             │       recommendations│
│                             │                     │
│                             └──► S3 ──► Spark     │
│                                  (Batch)          │
│                                  └─► A/B test     │
│                                     analysis,     │
│                                     ML training   │
└─────────────────────────────────────────────────┘
```

**Key decisions:**
- Stream for personalization (< 1 s latency)
- Batch for analytics and model training (daily)
- Separate pipelines, shared data lake

### LinkedIn: Kappa-Style

```
┌─────────────────────────────────────────────────┐
│              LinkedIn Data Pipeline               │
├─────────────────────────────────────────────────┤
│                                                   │
│  All Events ──► Kafka (immutable log) ──► Samza  │
│                                           │      │
│                 ┌─────────────────────────┘      │
│                 ▼                                 │
│         ┌──────────────┐                         │
│         │ Stream Jobs: │                         │
│         │ - Feed ranking│                        │
│         │ - Who viewed  │                        │
│         │ - Notifications│                       │
│         │ - Metrics     │                        │
│         └──────────────┘                         │
│                                                   │
│  Reprocessing: replay Kafka from offset 0        │
└─────────────────────────────────────────────────┘
```

**Key decisions:**
- Single processing paradigm (stream)
- Kafka as the source of truth (long retention)
- Reprocess by replaying the log

### Uber: Hybrid with Unified Engine

```
┌─────────────────────────────────────────────────┐
│               Uber Data Platform                  │
├─────────────────────────────────────────────────┤
│                                                   │
│  Trip Events ──► Kafka ──► Apache Flink          │
│                             │                    │
│            ┌────────────────┼────────────────┐   │
│            ▼                ▼                ▼   │
│      Real-time ETA    Surge Pricing    Batch ETL │
│      (< 100ms)       (< 5s)          (hourly)   │
│                                                   │
│  Same Flink cluster handles all three workloads  │
│  Different job configurations for latency/       │
│  throughput trade-offs                           │
└─────────────────────────────────────────────────┘
```

**Key decisions:**
- Unified engine (Flink) for batch and stream
- Different latency SLAs per use case
- Single operational model

---

## Choosing the Right Approach

### Decision Framework

```
Start
  │
  ▼
Is latency < 1 minute required?
  │
  ├─ YES ──► Is data naturally unbounded?
  │            │
  │            ├─ YES ──► STREAM PROCESSING
  │            │
  │            └─ NO ──► MICRO-BATCH (Spark Streaming)
  │
  └─ NO ──► Is exact accuracy required?
              │
              ├─ YES ──► BATCH PROCESSING
              │
              └─ NO ──► Can you maintain two codebases?
                          │
                          ├─ YES ──► LAMBDA (batch + stream)
                          │
                          └─ NO ──► KAPPA (stream + replay)
```

### Summary Table

| Scenario | Recommended | Reasoning |
|----------|-------------|-----------|
| Daily financial reports | Batch | Accuracy, complete data |
| Real-time fraud detection | Stream | Low latency critical |
| User activity dashboard | Hybrid | Real-time view + accurate history |
| ML model training | Batch | Complex, multi-pass |
| IoT anomaly detection | Stream | Continuous, low latency |
| Data warehouse ETL | Batch | Bulk transforms, cost-efficient |
| Live leaderboard | Stream | Immediate updates |
| Compliance audit | Batch | Complete, verifiable |

---

## Exercises

1. **Architecture Design**: A ride-sharing company needs to (a) calculate surge pricing in real-time, (b) generate weekly driver payment reports, and (c) train an ETA prediction model daily. Design an architecture specifying which components use batch vs stream processing and justify each choice.

2. **Lambda to Kappa Migration**: You have a Lambda architecture with a Spark batch layer and a Kafka Streams speed layer. Outline the steps to migrate to Kappa architecture. What are the risks? What must be true about your Kafka retention policy?

3. **Cost Analysis**: Compare the monthly cost of running a batch job (4-hour Spark cluster, 100 nodes, daily) vs an always-on stream processor (8 Flink nodes, 24/7). Assume $0.10/node/hour for spot and $0.30/node/hour for on-demand. When does each approach become more cost-effective?

4. **Unified Pipeline**: Write pseudocode for an Apache Beam pipeline that computes hourly page-view counts. Show how the same pipeline logic runs on both a batch runner (for backfill) and a streaming runner (for real-time). Include windowing, triggering, and late-data handling.

5. **Reprocessing Strategy**: Your stream processing job has a bug that miscounted events for the past 3 days. Design a reprocessing strategy for both Lambda and Kappa architectures. Compare the recovery time, data consistency guarantees, and operational steps required.

---

## Summary

- **Batch processing** excels at complete, accurate, complex analytics over bounded data
- **Stream processing** excels at low-latency, real-time processing of unbounded data
- **Lambda architecture** combines both but requires dual codebase maintenance
- **Kappa architecture** simplifies with stream-only processing and log replay
- **Apache Beam** provides a unified model that abstracts over both paradigms
- Choose based on **latency requirements**, **accuracy needs**, **operational complexity tolerance**, and **cost constraints**
- Real-world systems often use **hybrid approaches** tailored to specific workload characteristics
