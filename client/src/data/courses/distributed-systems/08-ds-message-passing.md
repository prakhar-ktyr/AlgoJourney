---
title: Message Passing
---

## Message Passing

In this lesson, you'll learn about **message passing** — the communication model where distributed processes exchange information by sending and receiving messages through channels, queues, and brokers. Unlike RPC's synchronous request-response style, message passing enables **asynchronous, decoupled** communication.

---

## Why Message Passing?

RPC models communication as a function call: the caller **blocks** until the response arrives. Message passing takes a different approach: the sender puts a message on a channel and **moves on** without waiting.

```
RPC (synchronous):
  Client ──request──► Server
  Client    (waits...)
  Client ◄──response── Server

Message passing (asynchronous):
  Producer ──message──► Queue ──message──► Consumer
  Producer continues immediately!
```

### When Message Passing Wins Over RPC

| Scenario | Why Message Passing |
|----------|-------------------|
| Long-running tasks | Don't block the caller for minutes |
| Spike traffic | Queue absorbs bursts, consumers process at their pace |
| Decoupled services | Producer doesn't need to know who consumes |
| Fan-out | One message → many consumers |
| Reliability | Messages persist until processed |
| Different speeds | Fast producers, slow consumers |

---

## Direct vs Indirect Message Passing

### Direct Message Passing

The sender sends directly to the receiver. Both must know each other's address.

```
Process A ──message──► Process B

Requirements:
  • A must know B's address
  • B must be running when A sends
  • Tight coupling between A and B
```

Example: TCP sockets, UDP datagrams, direct HTTP calls.

### Indirect Message Passing

Messages go through an **intermediary** (queue, topic, broker). Sender and receiver don't need to know about each other.

```
Producer ──message──► [  Queue  ] ──message──► Consumer
                      intermediary

Benefits:
  • Producer doesn't know or care who consumes
  • Consumer doesn't know or care who produces
  • Temporal decoupling: they don't need to run simultaneously
  • Spatial decoupling: they don't need to know each other's address
```

Example: Message queues (RabbitMQ, Kafka, SQS).

---

## Synchronous vs Asynchronous Communication

| Aspect | Synchronous | Asynchronous |
|--------|------------|-------------|
| **Sender behavior** | Blocks until response | Sends and continues |
| **Coupling** | Temporal coupling (both must be alive) | No temporal coupling |
| **Latency impact** | Adds to end-to-end latency | Hides latency from sender |
| **Error handling** | Immediate error feedback | Delayed error handling |
| **Throughput** | Limited by slowest component | Buffered by queue |

### Synchronous Example

```python
import requests

def process_order_sync(order):
    """Synchronous: blocks at each step."""
    # Step 1: Validate payment (blocks ~200ms)
    payment = requests.post("http://payment-svc/charge", json=order)

    # Step 2: Reserve inventory (blocks ~150ms)
    inventory = requests.post("http://inventory-svc/reserve", json=order)

    # Step 3: Send confirmation email (blocks ~500ms)
    email = requests.post("http://email-svc/send", json=order)

    # Total: ~850ms — user waits for ALL of this!
    return {"status": "confirmed"}
```

### Asynchronous Example

```python
from kafka import KafkaProducer
import json

producer = KafkaProducer(
    bootstrap_servers=["localhost:9092"],
    value_serializer=lambda v: json.dumps(v).encode("utf-8"),
)

def process_order_async(order):
    """Asynchronous: returns immediately."""
    # Publish event — returns in ~5ms
    producer.send("order-events", value={
        "type": "ORDER_PLACED",
        "order": order,
    })

    # Payment, inventory, and email services
    # consume this event independently and in parallel!
    return {"status": "accepted", "message": "Processing your order"}

# Total: ~5ms — user gets immediate feedback!
# Other services process the order asynchronously.
```

---

## Message Queue Concepts

A **message queue** is a buffer that stores messages until they are consumed.

### Core Components

```
┌──────────┐    ┌────────────────────┐    ┌──────────┐
│ Producer │───►│   Message Queue    │───►│ Consumer │
│ (sender) │    │ ┌──┬──┬──┬──┬──┐  │    │(receiver)│
└──────────┘    │ │M1│M2│M3│M4│M5│  │    └──────────┘
                │ └──┴──┴──┴──┴──┘  │
                │   FIFO ordering   │
                └────────────────────┘
```

| Component | Role |
|-----------|------|
| **Producer** | Creates and sends messages to the queue |
| **Queue** | Stores messages in order, delivers to consumers |
| **Consumer** | Receives and processes messages from the queue |
| **Message** | The unit of data: headers + body (payload) |
| **Broker** | The server that manages queues and routing |

### Message Structure

```python
message = {
    # Headers (metadata)
    "id": "msg-abc-123",           # unique identifier
    "timestamp": "2026-05-04T10:30:00Z",
    "content_type": "application/json",
    "correlation_id": "order-456",  # links related messages
    "reply_to": "response-queue",   # for request-reply pattern
    "ttl": 3600,                    # time-to-live in seconds

    # Body (payload)
    "body": {
        "type": "ORDER_PLACED",
        "order_id": "ORD-789",
        "customer": "alice",
        "items": [{"sku": "WIDGET-1", "qty": 3}],
        "total": 29.99,
    },
}
```

### Topics and Partitions

**Topics** organize messages by category. **Partitions** split a topic for parallelism.

```
Topic: "order-events"
  ├── Partition 0: [msg1, msg4, msg7, ...]  → Consumer A
  ├── Partition 1: [msg2, msg5, msg8, ...]  → Consumer B
  └── Partition 2: [msg3, msg6, msg9, ...]  → Consumer C

Messages are distributed across partitions.
Each partition is consumed by one consumer in a group.
```

Partitions enable horizontal scaling. With $P$ partitions, you can have up to $P$ consumers working in parallel:

$$\text{Max parallelism} = \min(P, C)$$

where $C$ is the number of consumers in a consumer group.

---

## Message Brokers

A **message broker** is the infrastructure that manages message queuing, routing, and delivery.

### Comparison of Major Brokers

| Feature | RabbitMQ | Apache Kafka | AWS SQS | Redis Streams |
|---------|----------|-------------|---------|--------------|
| **Model** | Queue (push) | Log (pull) | Queue (pull) | Log (pull) |
| **Ordering** | Per-queue FIFO | Per-partition FIFO | Best-effort (FIFO option) | Per-stream |
| **Persistence** | Optional | Always (disk) | Always (managed) | Optional (RDB/AOF) |
| **Throughput** | ~50K msg/s | ~1M+ msg/s | ~3K msg/s per queue | ~100K+ msg/s |
| **Retention** | Until consumed | Time/size-based (days/weeks) | 4–14 days | Configurable |
| **Replay** | No (message deleted after ACK) | Yes (seek to any offset) | No | Yes (by ID) |
| **Protocol** | AMQP | Custom (TCP) | HTTP (AWS API) | RESP (Redis protocol) |
| **Best for** | Task queues, routing | Event streaming, logs | Serverless, AWS-native | Lightweight streaming |

### RabbitMQ: Exchange and Queue Model

```
Producer ──► Exchange ──► Queue 1 ──► Consumer A
                     └──► Queue 2 ──► Consumer B

Exchange types:
  • Direct:  route by exact routing key match
  • Fanout:  broadcast to ALL bound queues
  • Topic:   route by pattern (e.g., "order.*.created")
  • Headers: route by message header values
```

### RabbitMQ Example (Python with pika)

```python
import pika
import json

# --- Producer ---
def publish_message(queue_name, message):
    connection = pika.BlockingConnection(
        pika.ConnectionParameters("localhost")
    )
    channel = connection.channel()

    # Declare the queue (idempotent — safe to call multiple times)
    channel.queue_declare(queue=queue_name, durable=True)

    # Publish with persistence
    channel.basic_publish(
        exchange="",
        routing_key=queue_name,
        body=json.dumps(message),
        properties=pika.BasicProperties(
            delivery_mode=2,  # persistent message
            content_type="application/json",
        ),
    )
    print(f"Sent: {message}")
    connection.close()


# --- Consumer ---
def consume_messages(queue_name):
    connection = pika.BlockingConnection(
        pika.ConnectionParameters("localhost")
    )
    channel = connection.channel()
    channel.queue_declare(queue=queue_name, durable=True)

    # Fair dispatch: don't give more than 1 message at a time
    channel.basic_qos(prefetch_count=1)

    def callback(ch, method, properties, body):
        message = json.loads(body)
        print(f"Processing: {message}")
        # ... do work ...
        ch.basic_ack(delivery_tag=method.delivery_tag)  # acknowledge

    channel.basic_consume(queue=queue_name, on_message_callback=callback)
    print("Waiting for messages...")
    channel.start_consuming()


# Usage
publish_message("tasks", {"task": "send_email", "to": "alice@example.com"})
# In another process:
# consume_messages("tasks")
```

### Redis Streams Example (Python)

```python
import redis
import json

r = redis.Redis(host="localhost", port=6379)

# --- Producer ---
def produce(stream, message):
    """Add a message to a Redis stream."""
    msg_id = r.xadd(stream, {"data": json.dumps(message)})
    print(f"Produced message {msg_id}")
    return msg_id

# --- Consumer ---
def consume(stream, group, consumer_name):
    """Consume from a Redis stream with consumer groups."""
    # Create consumer group (ignore if exists)
    try:
        r.xgroup_create(stream, group, id="0", mkstream=True)
    except redis.exceptions.ResponseError:
        pass  # group already exists

    while True:
        # Read new messages for this consumer
        messages = r.xreadgroup(
            group, consumer_name,
            {stream: ">"},  # ">" means only new messages
            count=1, block=5000,  # block 5 seconds if no messages
        )

        for stream_name, msgs in messages:
            for msg_id, data in msgs:
                message = json.loads(data[b"data"])
                print(f"[{consumer_name}] Processing: {message}")
                # Acknowledge processing
                r.xack(stream_name, group, msg_id)
```

---

## Kafka Deep Dive

**Apache Kafka** is the most widely used distributed event streaming platform. It's designed for high-throughput, fault-tolerant, real-time data pipelines.

### Kafka Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Kafka Cluster                         │
│                                                          │
│  Broker 1          Broker 2          Broker 3            │
│  ┌──────────┐     ┌──────────┐     ┌──────────┐        │
│  │Topic A   │     │Topic A   │     │Topic A   │        │
│  │ Part 0 ★ │     │ Part 1 ★ │     │ Part 2 ★ │ ★=leader│
│  │ Part 1 ○ │     │ Part 2 ○ │     │ Part 0 ○ │ ○=replica│
│  └──────────┘     └──────────┘     └──────────┘        │
│                                                          │
│  ★ Leader: handles reads/writes                          │
│  ○ Follower: replicates for fault tolerance              │
└─────────────────────────────────────────────────────────┘
```

### Key Kafka Concepts

| Concept | Description |
|---------|-------------|
| **Topic** | A named feed of messages (like a database table) |
| **Partition** | An ordered, immutable sequence of messages within a topic |
| **Offset** | A unique, sequential ID for each message in a partition |
| **Producer** | Writes messages to topics |
| **Consumer** | Reads messages from topics |
| **Consumer Group** | A set of consumers that cooperate to consume a topic |
| **Broker** | A Kafka server that stores and serves messages |
| **Replication Factor** | How many copies of each partition exist |

### Kafka Partition and Offset Model

```
Topic: "orders" — Partition 0

Offset:  0    1    2    3    4    5    6    7    8
       ┌────┬────┬────┬────┬────┬────┬────┬────┬────┐
       │ m0 │ m1 │ m2 │ m3 │ m4 │ m5 │ m6 │ m7 │ m8 │
       └────┴────┴────┴────┴────┴────┴────┴────┴────┘
                        ▲                        ▲
                   Consumer A              Latest offset
                   (offset 3)              (new messages
                                            appended here)

• Consumers track their own offset (position)
• Multiple consumer groups can read the same topic independently
• Messages are NOT deleted after reading (unlike traditional queues)
• Retention is time-based (e.g., 7 days) or size-based (e.g., 100 GB)
```

### Consumer Groups

```
Topic: "orders" (3 partitions)

Consumer Group "order-processing":
  ┌────────────┐
  │ Partition 0 │──► Consumer A
  │ Partition 1 │──► Consumer B
  │ Partition 2 │──► Consumer C
  └────────────┘

Consumer Group "analytics":
  ┌────────────┐
  │ Partition 0 │──► Consumer X (reads ALL partitions)
  │ Partition 1 │──►
  │ Partition 2 │──►
  └────────────┘

• Each partition is assigned to exactly ONE consumer in a group
• Different groups consume independently (different offsets)
• Adding consumers rebalances partition assignments
```

### Kafka Retention

Unlike traditional queues, Kafka **retains messages** even after consumption:

| Retention Policy | Configuration | Example |
|-----------------|--------------|---------|
| **Time-based** | `retention.ms` | Keep for 7 days |
| **Size-based** | `retention.bytes` | Keep up to 100 GB per partition |
| **Compaction** | `cleanup.policy=compact` | Keep latest value per key |

### Kafka Producer Example (Python)

```python
from kafka import KafkaProducer
import json
import time

# Create a producer
producer = KafkaProducer(
    bootstrap_servers=["localhost:9092"],
    value_serializer=lambda v: json.dumps(v).encode("utf-8"),
    key_serializer=lambda k: k.encode("utf-8") if k else None,
    acks="all",           # wait for all replicas
    retries=3,            # retry on failure
    linger_ms=10,         # batch messages for 10ms
    batch_size=16384,     # batch up to 16KB
)

def publish_order(order_id, order_data):
    """Publish an order event to Kafka."""
    future = producer.send(
        topic="orders",
        key=order_id,           # key determines partition
        value={
            "event": "ORDER_CREATED",
            "order_id": order_id,
            "data": order_data,
            "timestamp": time.time(),
        },
    )

    # Wait for confirmation (optional — makes it synchronous)
    metadata = future.get(timeout=10)
    print(
        f"Sent to partition {metadata.partition} "
        f"at offset {metadata.offset}"
    )

# Publish some orders
publish_order("ORD-001", {"customer": "alice", "total": 49.99})
publish_order("ORD-002", {"customer": "bob", "total": 129.99})
publish_order("ORD-003", {"customer": "charlie", "total": 9.99})

# Flush and close
producer.flush()
producer.close()
```

### Kafka Consumer Example (Python)

```python
from kafka import KafkaConsumer
import json

# Create a consumer in a consumer group
consumer = KafkaConsumer(
    "orders",                                 # topic
    bootstrap_servers=["localhost:9092"],
    group_id="order-processing",              # consumer group
    auto_offset_reset="earliest",             # start from beginning
    enable_auto_commit=False,                 # manual commit for safety
    value_deserializer=lambda m: json.loads(m.decode("utf-8")),
)

print("Consuming from 'orders' topic...")

for message in consumer:
    print(f"Partition: {message.partition}")
    print(f"Offset: {message.offset}")
    print(f"Key: {message.key}")
    print(f"Value: {message.value}")
    print("---")

    # Process the message
    order = message.value
    if order["event"] == "ORDER_CREATED":
        process_order(order["data"])

    # Manually commit offset after successful processing
    consumer.commit()
```

### Kafka with Docker (Quick Start)

```bash
# Start Kafka with Docker Compose
cat > docker-compose.yml << 'EOF'
version: '3'
services:
  zookeeper:
    image: confluentinc/cp-zookeeper:7.5.0
    environment:
      ZOOKEEPER_CLIENT_PORT: 2181

  kafka:
    image: confluentinc/cp-kafka:7.5.0
    depends_on:
      - zookeeper
    ports:
      - "9092:9092"
    environment:
      KAFKA_BROKER_ID: 1
      KAFKA_ZOOKEEPER_CONNECT: zookeeper:2181
      KAFKA_ADVERTISED_LISTENERS: PLAINTEXT://localhost:9092
      KAFKA_OFFSETS_TOPIC_REPLICATION_FACTOR: 1
EOF

docker-compose up -d

# Create a topic
docker exec -it kafka kafka-topics \
  --create --topic orders \
  --bootstrap-server localhost:9092 \
  --partitions 3 \
  --replication-factor 1

# List topics
docker exec -it kafka kafka-topics \
  --list --bootstrap-server localhost:9092

# Produce from command line
echo '{"event":"test"}' | docker exec -i kafka kafka-console-producer \
  --bootstrap-server localhost:9092 --topic orders

# Consume from command line
docker exec -it kafka kafka-console-consumer \
  --bootstrap-server localhost:9092 \
  --topic orders --from-beginning
```

---

## Message Delivery Guarantees

The most critical design decision in any messaging system.

### At-Most-Once

Each message is delivered **zero or one time**. Messages may be lost but are never duplicated.

```
Producer ──msg──► Broker ──msg──► Consumer
                              ✗ (consumer crashes before processing)
                              Message is ACKed but lost!

How: Auto-commit offsets BEFORE processing.
```

| Aspect | Detail |
|--------|--------|
| **Implementation** | Commit offset, then process |
| **Risk** | Message loss on consumer crash |
| **Use case** | Metrics, logs (losing a few is okay) |

### At-Least-Once

Each message is delivered **one or more times**. No messages are lost, but duplicates may occur.

```
Producer ──msg──► Broker ──msg──► Consumer (processes OK)
                              ──msg──► Consumer (processes OK)
                              ✗ (ACK lost)
                  Broker ──msg──► Consumer (DUPLICATE!)

How: Process first, then commit offset.
```

| Aspect | Detail |
|--------|--------|
| **Implementation** | Process, then commit offset |
| **Risk** | Duplicate processing on failure |
| **Use case** | Most systems — combine with idempotent consumers |

### Exactly-Once

Each message is processed **exactly one time**. The hardest guarantee to achieve.

```
Strategy 1: Idempotent producer + transactional consumer
  Producer ──msg(id=42)──► Broker (dedup by id)
  Consumer: process + commit offset atomically

Strategy 2: Outbox pattern
  Consumer: write result + offset to DB in one transaction
  On restart: check last committed offset, resume from there
```

| Aspect | Detail |
|--------|--------|
| **Implementation** | Transactions, dedup, idempotency |
| **Risk** | Performance overhead, complexity |
| **Use case** | Financial transactions, inventory updates |

### Comparison Summary

| Guarantee | Messages Lost? | Duplicates? | Complexity | Performance |
|-----------|---------------|------------|------------|-------------|
| **At-most-once** | Yes | No | Low | Highest |
| **At-least-once** | No | Yes | Medium | High |
| **Exactly-once** | No | No | High | Lower |

> **Practical tip**: Most systems use **at-least-once** delivery with **idempotent consumers**. This is simpler and more performant than true exactly-once.

---

## Dead Letter Queues (DLQ)

A **Dead Letter Queue** holds messages that **failed processing** after multiple retries. Instead of losing them or retrying forever, they're set aside for investigation.

```
Main Queue                  Dead Letter Queue
┌────────────┐             ┌────────────────┐
│ msg1 (ok) ──► process ✓  │                │
│ msg2 (bad)──► process ✗  │                │
│            ──► retry 1 ✗ │                │
│            ──► retry 2 ✗ │                │
│            ──► retry 3 ✗ │ msg2 (failed) │ ← moved here
│ msg3 (ok) ──► process ✓  │                │
└────────────┘             └────────────────┘
                           Investigate & fix manually
```

### DLQ Implementation Pattern

```python
import json
import time

MAX_RETRIES = 3
BACKOFF_BASE = 2  # seconds

def process_with_dlq(message, retry_count=0):
    """Process a message with retry logic and DLQ."""
    try:
        result = process_message(message)
        return result
    except Exception as e:
        if retry_count < MAX_RETRIES:
            # Exponential backoff: 2^n seconds
            wait_time = BACKOFF_BASE ** retry_count
            print(f"Retry {retry_count + 1}/{MAX_RETRIES} "
                  f"in {wait_time}s: {e}")
            time.sleep(wait_time)
            return process_with_dlq(message, retry_count + 1)
        else:
            # Send to Dead Letter Queue
            send_to_dlq(message, error=str(e))
            print(f"Message sent to DLQ after {MAX_RETRIES} retries")

def send_to_dlq(message, error):
    """Send a failed message to the Dead Letter Queue."""
    dlq_message = {
        "original_message": message,
        "error": error,
        "failed_at": time.time(),
        "retries_exhausted": MAX_RETRIES,
    }
    producer.send("orders-dlq", value=dlq_message)
```

---

## Back Pressure

**Back pressure** is a mechanism to prevent fast producers from overwhelming slow consumers.

```
Without back pressure:
  Producer (1000 msg/s) ──► Queue ──► Consumer (100 msg/s)
                            │
                     Queue grows unboundedly!
                     → Out of memory → CRASH

With back pressure:
  Producer (1000 msg/s) ──► Queue (max 10K) ──► Consumer (100 msg/s)
                            │
                     Queue full → signal producer to slow down
```

### Back Pressure Strategies

| Strategy | How It Works | Trade-off |
|----------|-------------|-----------|
| **Block** | Producer blocks when queue is full | Simple but reduces throughput |
| **Drop** | Drop oldest or newest messages | Lossy but prevents overflow |
| **Buffer to disk** | Spill overflow to disk | Slower but no data loss |
| **Rate limit** | Limit producer send rate | Predictable but may reject |
| **Scale consumers** | Auto-scale consumer count | Best but complex infrastructure |

### Implementing Back Pressure (Python)

```python
import queue
import threading
import time

class BackPressureQueue:
    """A queue with back pressure support."""

    def __init__(self, max_size=1000, high_water=800, low_water=200):
        self.queue = queue.Queue(maxsize=max_size)
        self.high_water = high_water   # start applying pressure
        self.low_water = low_water     # release pressure
        self.pressure_on = False

    def put(self, message, timeout=30):
        """Put a message, blocking if queue is too full."""
        current_size = self.queue.qsize()

        if current_size >= self.high_water:
            self.pressure_on = True
            print(f"Back pressure ON (queue: {current_size})")

        if self.pressure_on and current_size > self.low_water:
            time.sleep(0.1)  # slow down the producer

        if current_size <= self.low_water:
            self.pressure_on = False

        self.queue.put(message, timeout=timeout)

    def get(self, timeout=5):
        """Get a message from the queue."""
        return self.queue.get(timeout=timeout)
```

---

## Message Ordering Guarantees

Ordering is tricky in distributed messaging systems.

### Ordering Levels

| Level | Guarantee | How |
|-------|-----------|-----|
| **No ordering** | Messages arrive in any order | Multiple partitions, no keys |
| **Partition ordering** | Ordered within a partition | Use consistent keys |
| **Total ordering** | All messages globally ordered | Single partition (limits throughput) |

### Achieving Partition Ordering in Kafka

```python
# Messages with the same KEY go to the same PARTITION
# → guaranteed ordering for that key

# All events for order "ORD-123" go to the same partition
producer.send("orders", key="ORD-123", value={"event": "CREATED"})
producer.send("orders", key="ORD-123", value={"event": "PAID"})
producer.send("orders", key="ORD-123", value={"event": "SHIPPED"})

# These are guaranteed to arrive in order:
# CREATED → PAID → SHIPPED

# But events for DIFFERENT orders may interleave:
# ORD-123:CREATED, ORD-456:CREATED, ORD-123:PAID, ...
```

### The Partition Assignment Formula

Kafka assigns a key to a partition using:

$$\text{partition} = \text{hash}(\text{key}) \mod P$$

where $P$ is the number of partitions. This ensures the same key always maps to the same partition.

> **Warning**: If you change the number of partitions ($P$), the mapping changes and ordering guarantees for existing keys may be broken!

---

## Common Messaging Patterns

### Publish-Subscribe (Pub/Sub)

One publisher, many subscribers. Each subscriber gets a copy of every message.

```
Publisher ──event──► Topic
                      ├──► Subscriber A (notifications)
                      ├──► Subscriber B (analytics)
                      └──► Subscriber C (audit log)
```

### Work Queue (Competing Consumers)

Multiple consumers share the work. Each message is processed by **exactly one** consumer.

```
Producer ──tasks──► Queue ──task1──► Worker A
                         ──task2──► Worker B
                         ──task3──► Worker A
                         ──task4──► Worker C
```

### Request-Reply

Simulate synchronous RPC over async messaging.

```
Client ──request──► Request Queue ──► Server
Client ◄──reply────  Reply Queue  ◄── Server

Message includes:
  correlation_id: links reply to request
  reply_to: which queue to send the reply to
```

### Event Sourcing

Store all state changes as a sequence of events, rather than just the current state.

```
Events (immutable log):
  1. AccountCreated(id=A, balance=0)
  2. MoneyDeposited(id=A, amount=100)
  3. MoneyWithdrawn(id=A, amount=30)
  4. MoneyDeposited(id=A, amount=50)

Current state (derived):
  Account A: balance = 0 + 100 - 30 + 50 = $120
```

---

## Practical Example: Order Processing Pipeline

```
┌──────────┐     ┌──────────┐     ┌──────────┐     ┌──────────┐
│  Order   │     │ Payment  │     │Inventory │     │  Email   │
│  Service │     │ Service  │     │ Service  │     │ Service  │
└────┬─────┘     └────┬─────┘     └────┬─────┘     └────┬─────┘
     │                │                │                │
     │ ORDER_PLACED   │                │                │
     ├───────────────►│                │                │
     │                │ PAYMENT_OK     │                │
     │                ├───────────────►│                │
     │                │                │ INVENTORY_     │
     │                │                │ RESERVED       │
     │                │                ├───────────────►│
     │                │                │                │ SEND
     │                │                │                │ EMAIL
     ▼                ▼                ▼                ▼
  [order-events] [payment-events] [inventory-events] [notification-events]
     Kafka Topics
```

```python
# Order Service: publishes ORDER_PLACED
def place_order(order):
    producer.send("order-events", key=order["id"], value={
        "type": "ORDER_PLACED",
        "order": order,
    })

# Payment Service: consumes ORDER_PLACED, publishes PAYMENT_OK
def handle_order_placed(event):
    order = event["order"]
    charge_result = charge_customer(order)
    producer.send("payment-events", key=order["id"], value={
        "type": "PAYMENT_OK" if charge_result else "PAYMENT_FAILED",
        "order_id": order["id"],
    })

# Inventory Service: consumes PAYMENT_OK, publishes INVENTORY_RESERVED
def handle_payment_ok(event):
    result = reserve_inventory(event["order_id"])
    producer.send("inventory-events", key=event["order_id"], value={
        "type": "INVENTORY_RESERVED" if result else "OUT_OF_STOCK",
        "order_id": event["order_id"],
    })

# Email Service: consumes INVENTORY_RESERVED, sends confirmation
def handle_inventory_reserved(event):
    send_confirmation_email(event["order_id"])
```

---

## Exercises

1. **Queue Implementation**: Implement a simple in-memory message queue in Python with `publish(topic, message)` and `subscribe(topic, callback)` methods. Support multiple subscribers per topic.

2. **Delivery Guarantees**: You have a consumer that processes messages and writes results to a database. Describe step-by-step how you would implement at-least-once delivery. What could go wrong? How would you add idempotency?

3. **Kafka Partitioning**: A topic has 6 partitions and your consumer group has 4 consumers. Draw the partition assignment. What happens if you add 2 more consumers? What if you add 10?

4. **DLQ Analysis**: Design a DLQ monitoring system. What metrics would you track? How would you alert on problems? How would you replay messages from the DLQ?

5. **Back Pressure Design**: You have a producer generating 10,000 events/second, but your consumer can only handle 2,000 events/second. Design a system with:
   - A bounded queue of 50,000 messages
   - Back pressure that slows the producer when the queue is 80% full
   - Auto-scaling that adds consumers when the queue stays above 60% for 5 minutes

---

## Key Takeaways

| Concept | Key Point |
|---------|-----------|
| **Message passing** | Asynchronous, decoupled communication between processes |
| **Direct vs indirect** | Use brokers (indirect) for decoupling and reliability |
| **Sync vs async** | Async enables parallelism and absorbs traffic spikes |
| **Message brokers** | RabbitMQ for routing, Kafka for streaming, SQS for serverless |
| **Kafka** | Distributed log; partitions for parallelism, offsets for replay |
| **Consumer groups** | Cooperative consumption; max parallelism = partition count |
| **At-most-once** | May lose messages; commit before process |
| **At-least-once** | May duplicate; process then commit + idempotent consumers |
| **Exactly-once** | Hardest; needs transactions or idempotency + dedup |
| **DLQ** | Safety net for messages that can't be processed |
| **Back pressure** | Prevent fast producers from overwhelming slow consumers |
| **Ordering** | Per-partition via consistent keys; total ordering = 1 partition |

---

## Next Steps

With networking, RPC, and message passing covered, you now understand the three fundamental communication models in distributed systems. The next lessons will build on these foundations to explore **time, clocks, and ordering** — how distributed systems agree on "what happened when."
