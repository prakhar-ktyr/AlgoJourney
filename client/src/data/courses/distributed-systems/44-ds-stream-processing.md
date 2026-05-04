---
title: "Stream Processing"
---

# Stream Processing

Stream processing is a data processing paradigm that handles continuous, unbounded data flows in real time, enabling immediate insights and actions as events occur.

---

## Batch vs Stream Processing

Understanding the difference between batch and stream processing is fundamental to choosing the right approach for your workload.

| Aspect | Batch Processing | Stream Processing |
|--------|-----------------|-------------------|
| Data scope | Bounded, finite datasets | Unbounded, continuous flows |
| Latency | Minutes to hours | Milliseconds to seconds |
| Processing trigger | Scheduled intervals | Event arrival |
| State | Recomputed per batch | Maintained incrementally |
| Complexity | Simpler programming model | Handles time, ordering, late data |
| Use cases | ETL, reports, ML training | Fraud detection, monitoring, IoT |
| Fault tolerance | Rerun entire batch | Checkpointing, replay |
| Resource usage | Burst, then idle | Steady, continuous |

```
Batch:    [====== Job 1 ======] ... [====== Job 2 ======]
Stream:   →e1→e2→e3→e4→e5→e6→e7→e8→ (continuous)
```

Modern architectures often combine both approaches (Lambda or Kappa architecture) to leverage the strengths of each.

---

## Stream Processing Concepts

### Events

An **event** is an immutable record of something that happened at a specific point in time.

```json
{
  "event_id": "evt-29381",
  "event_type": "purchase",
  "user_id": "u-1042",
  "amount": 59.99,
  "currency": "USD",
  "timestamp": "2026-05-04T10:23:45.123Z"
}
```

Key event properties:

| Property | Description |
|----------|-------------|
| Event time | When the event actually occurred |
| Processing time | When the system processes the event |
| Ingestion time | When the event enters the stream system |
| Key | Logical grouping attribute (e.g., user_id) |
| Payload | The event data itself |

---

### Windows

Windows group unbounded streams into finite chunks for aggregation.

#### Tumbling Windows

Fixed-size, non-overlapping time intervals.

```
Time:     |----5min----|----5min----|----5min----|
Events:    e1 e2 e3      e4 e5       e6 e7 e8
Window 1: [e1, e2, e3]
Window 2:              [e4, e5]
Window 3:                          [e6, e7, e8]
```

#### Sliding Windows

Fixed-size windows that advance by a slide interval, causing overlap.

```
Time:       0    1    2    3    4    5    6
Window 1:  [0---------3]
Window 2:       [1---------4]
Window 3:            [2---------5]
Window 4:                 [3---------6]
```

#### Session Windows

Dynamic windows that close after a gap of inactivity.

```
Events:  e1 e2 e3 ........(gap > timeout)........ e4 e5
Session 1: [e1, e2, e3]
Session 2:                                        [e4, e5]
```

| Window Type | Size | Overlap | Use Case |
|-------------|------|---------|----------|
| Tumbling | Fixed | No | Periodic aggregations (hourly counts) |
| Sliding | Fixed | Yes | Moving averages, trend detection |
| Session | Dynamic | No | User activity sessions |

---

### Watermarks

A **watermark** is a notion of progress in event time. It declares that no events with a timestamp earlier than the watermark are expected to arrive.

```
Watermark(t) = "All events with event_time <= t have been observed"

Processing timeline:
  Event(t=10) → Event(t=8) → Event(t=12) → Watermark(t=10) → Event(t=9)?
                                                                  ↑ LATE!
```

Watermarks allow the system to know when a window is "complete" and can emit results.

---

### Late Data

Events that arrive after the watermark has passed their window.

**Strategies for handling late data:**

| Strategy | Description | Trade-off |
|----------|-------------|-----------|
| Drop | Discard late events | Simple but lossy |
| Allow lateness | Accept within a grace period | Delayed final results |
| Retract & update | Emit corrections | Complex downstream handling |
| Side output | Route to separate stream | Requires separate pipeline |

```
// Flink example: allowed lateness
stream
  .keyBy(event -> event.getUserId())
  .window(TumblingEventTimeWindows.of(Time.minutes(5)))
  .allowedLateness(Time.minutes(2))
  .sideOutputLateData(lateOutputTag)
  .aggregate(new CountAggregate());
```

---

## Apache Kafka Streams

Kafka Streams is a client library for building stream processing applications on top of Apache Kafka.

### Topology

A Kafka Streams application is defined as a **topology** — a directed acyclic graph of stream processors.

```java
StreamsBuilder builder = new StreamsBuilder();

// Source → Process → Sink
builder.stream("input-topic")                    // Source
       .filter((key, value) -> value != null)    // Processor
       .mapValues(value -> value.toUpperCase())  // Processor
       .to("output-topic");                      // Sink

KafkaStreams streams = new KafkaStreams(builder.build(), props);
streams.start();
```

### KStream vs KTable

| Concept | KStream | KTable |
|---------|---------|--------|
| Semantics | Record stream (append) | Changelog stream (upsert) |
| Interpretation | Each record is an event | Each record is an update |
| Analogy | INSERT log | Latest state per key |
| Size over time | Grows unbounded | Bounded by unique keys |

```java
// KStream: all purchases
KStream<String, Purchase> purchases = builder.stream("purchases");

// KTable: latest profile per user
KTable<String, UserProfile> profiles = builder.table("user-profiles");

// Join: enrich purchases with current profile
KStream<String, EnrichedPurchase> enriched = purchases.join(
    profiles,
    (purchase, profile) -> new EnrichedPurchase(purchase, profile)
);
```

### Exactly-Once Semantics

Kafka Streams achieves exactly-once processing through:

1. **Idempotent producers** — prevent duplicate writes
2. **Transactional writes** — atomic multi-partition commits
3. **Read-committed consumers** — only see committed data

```java
Properties props = new Properties();
props.put(StreamsConfig.PROCESSING_GUARANTEE_CONFIG,
          StreamsConfig.EXACTLY_ONCE_V2);
```

---

## Apache Flink

Apache Flink is a distributed stream processing framework designed for stateful computations over unbounded and bounded data.

### DataStream API

```java
StreamExecutionEnvironment env =
    StreamExecutionEnvironment.getExecutionEnvironment();

DataStream<String> input = env.addSource(new FlinkKafkaConsumer<>(
    "events", new SimpleStringSchema(), kafkaProps));

DataStream<Alert> alerts = input
    .map(json -> Event.fromJson(json))
    .keyBy(Event::getUserId)
    .window(TumblingEventTimeWindows.of(Time.minutes(1)))
    .aggregate(new SuspiciousActivityDetector());

alerts.addSink(new AlertNotificationSink());

env.execute("Fraud Detection Pipeline");
```

### Event Time and Watermarks

```java
DataStream<Event> withTimestamps = input
    .assignTimestampsAndWatermarks(
        WatermarkStrategy
            .<Event>forBoundedOutOfOrderness(Duration.ofSeconds(5))
            .withTimestampAssigner((event, ts) -> event.getTimestamp())
    );
```

### Checkpointing

Flink uses **distributed snapshots** (Chandy-Lamport algorithm) for fault tolerance.

```java
env.enableCheckpointing(60000); // every 60 seconds
env.getCheckpointConfig().setCheckpointingMode(CheckpointingMode.EXACTLY_ONCE);
env.getCheckpointConfig().setMinPauseBetweenCheckpoints(30000);
env.getCheckpointConfig().setCheckpointTimeout(120000);
```

| Feature | Checkpoints | Savepoints |
|---------|-------------|------------|
| Trigger | Automatic, periodic | Manual (operator-initiated) |
| Purpose | Fault recovery | Upgrades, migrations, scaling |
| Lifecycle | Managed by Flink | Managed by operator |
| Cost | Lightweight, incremental | Full snapshot |

### Savepoints

```bash
# Trigger a savepoint
flink savepoint <jobId> s3://bucket/savepoints/

# Resume from savepoint
flink run -s s3://bucket/savepoints/savepoint-abc123 myJob.jar
```

---

## Apache Storm (Brief)

Apache Storm was one of the earliest real-time stream processing systems.

| Concept | Description |
|---------|-------------|
| Spout | Source of streams (reads from queue) |
| Bolt | Processing logic (filter, aggregate, join) |
| Topology | DAG of spouts and bolts |
| Tuple | Basic data unit |
| Nimbus | Master node (job distribution) |
| Supervisor | Worker node |

Storm has largely been superseded by Flink and Kafka Streams for new projects, but remains in production at some organizations.

---

## Cloud Stream Processing Services

### AWS Kinesis

| Service | Purpose |
|---------|---------|
| Kinesis Data Streams | Ingest and store real-time data |
| Kinesis Data Firehose | Load streams into data stores |
| Kinesis Data Analytics | SQL/Flink queries on streams |

```python
import boto3

kinesis = boto3.client("kinesis")

# Produce
kinesis.put_record(
    StreamName="user-events",
    Data=json.dumps(event).encode(),
    PartitionKey=event["user_id"]
)

# Consume
response = kinesis.get_records(ShardIterator=shard_iterator, Limit=100)
for record in response["Records"]:
    process(json.loads(record["Data"]))
```

### Google Dataflow

Google Dataflow implements the **Apache Beam** programming model, unifying batch and stream processing.

```python
import apache_beam as beam

with beam.Pipeline(options=pipeline_options) as p:
    (p
     | "Read" >> beam.io.ReadFromPubSub(topic="projects/my-proj/topics/events")
     | "Parse" >> beam.Map(parse_json)
     | "Window" >> beam.WindowInto(beam.window.FixedWindows(60))
     | "Count" >> beam.combiners.Count.PerKey()
     | "Write" >> beam.io.WriteToBigQuery("project:dataset.table"))
```

---

## Stream Processing Patterns

### Event-Time Processing

Process events based on when they occurred, not when they arrive.

```
Event arrives at processing_time=10:05 with event_time=10:02
→ Assigned to the 10:00-10:05 window (based on event_time)
→ NOT the 10:05-10:10 window (which processing_time would suggest)
```

### Windowed Aggregation

```java
// Count logins per user per hour
stream
    .keyBy(Event::getUserId)
    .window(TumblingEventTimeWindows.of(Time.hours(1)))
    .aggregate(new AggregateFunction<Event, Long, Long>() {
        public Long createAccumulator() { return 0L; }
        public Long add(Event event, Long acc) { return acc + 1; }
        public Long getResult(Long acc) { return acc; }
        public Long merge(Long a, Long b) { return a + b; }
    });
```

### Stream-Table Join

Enrich a stream of events with the latest state from a table.

```
Stream (orders):    {order_id: 1, product_id: "P100", qty: 2}
Table (products):   {product_id: "P100", name: "Widget", price: 9.99}
                          ↓ JOIN on product_id
Result:             {order_id: 1, product: "Widget", total: 19.98}
```

```java
// Kafka Streams stream-table join
KStream<String, Order> orders = builder.stream("orders");
KTable<String, Product> products = builder.table("products");

orders
    .selectKey((k, v) -> v.getProductId())
    .join(products, (order, product) ->
        new EnrichedOrder(order, product.getName(), order.getQty() * product.getPrice()))
    .to("enriched-orders");
```

---

## Exactly-Once Semantics in Streaming

Achieving exactly-once is one of the hardest problems in distributed stream processing.

| Guarantee | Description | Duplicate results? |
|-----------|-------------|-------------------|
| At-most-once | Fire and forget | No duplicates, but data loss |
| At-least-once | Retry on failure | Duplicates possible |
| Exactly-once | Each event processed once | No duplicates, no loss |

### How Frameworks Achieve Exactly-Once

| Framework | Mechanism |
|-----------|-----------|
| Kafka Streams | Idempotent producers + transactions |
| Flink | Distributed snapshots + 2PC sinks |
| Dataflow/Beam | Deterministic processing + deduplication |

**End-to-end exactly-once** requires coordination across the entire pipeline:

```
Source (idempotent read)
  → Processing (checkpointed state)
    → Sink (transactional/idempotent write)
```

If any component breaks the guarantee, the whole pipeline degrades.

---

## Use Cases

### Fraud Detection

```
Transaction stream → Feature extraction → ML scoring → Alert/Block
                         ↑
                   Historical patterns (table)

Requirements:
- Sub-second latency (block before authorization completes)
- Stateful: track user behavior patterns
- Exactly-once: no double-charges or missed fraud
```

### Real-Time Analytics

```
Clickstream → Sessionize → Aggregate → Dashboard
                                           ↑
                              Updates every second

Example metrics:
- Active users right now
- Revenue in current hour
- Error rate in last 5 minutes
```

### IoT (Internet of Things)

```
Sensor readings → Filter anomalies → Window (5s) → Avg → Alert if threshold
     ↑
 Millions of devices, high throughput, variable latency

Challenges:
- Out-of-order data from unreliable networks
- Device clock drift (event time vs processing time)
- Massive scale with low per-event cost
```

---

## Comparison of Stream Processing Frameworks

| Feature | Kafka Streams | Flink | Storm | Kinesis | Dataflow |
|---------|--------------|-------|-------|---------|----------|
| Deployment | Library (JVM) | Cluster | Cluster | Managed | Managed |
| Latency | Low | Very low | Very low | Low | Low |
| State management | RocksDB | RocksDB/Heap | External | DynamoDB | Internal |
| Exactly-once | Yes | Yes | No (at-least) | With dedup | Yes |
| Windowing | Full support | Full support | Basic | Basic | Full support |
| Language | Java/Kotlin | Java/Scala/Python | Java/Clojure | Any (SDK) | Java/Python/Go |
| Best for | Kafka-native apps | Complex event processing | Legacy systems | AWS ecosystem | GCP ecosystem |

---

## Exercises

1. **Window Design**: You need to detect if a user makes more than 5 purchases within any 10-minute period. Which window type would you use and why? How would you handle late-arriving events?

2. **Watermark Strategy**: Given a stream where events can arrive up to 30 seconds late, design a watermark strategy. What is the trade-off between setting the out-of-orderness bound to 30s vs 5s?

3. **Kafka Streams Topology**: Write a Kafka Streams topology that:
   - Reads from a topic "page-views"
   - Filters out bot traffic (user-agent contains "bot")
   - Counts page views per URL in 1-minute tumbling windows
   - Outputs results to "page-view-counts"

4. **Exactly-Once Analysis**: Explain why achieving exactly-once semantics end-to-end is harder than within a single framework. What happens if your sink is an HTTP API that doesn't support idempotent writes?

5. **Architecture Choice**: A company needs to process 1 million events/second for real-time fraud detection with sub-100ms latency. They use AWS. Compare using Kinesis Data Analytics vs self-managed Flink on EKS. What factors should influence the decision?

---

## Summary

| Concept | Key Takeaway |
|---------|-------------|
| Stream vs Batch | Streams handle unbounded data with low latency |
| Windows | Group unbounded streams for finite computations |
| Watermarks | Track progress in event time, trigger window emission |
| Late data | Must be handled explicitly (drop, allow, retract) |
| Kafka Streams | Library-based, Kafka-native, exactly-once |
| Flink | Full-featured, stateful, checkpoint-based recovery |
| Exactly-once | Requires coordination across source, processing, and sink |
| Patterns | Event-time processing, windowed aggregation, stream-table join |
