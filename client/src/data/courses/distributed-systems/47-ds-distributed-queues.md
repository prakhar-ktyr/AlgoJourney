---
title: "Distributed Queues"
---

# Distributed Queues

A **distributed queue** is a message-passing mechanism that decouples producers from consumers across networked systems. Queues are one of the most fundamental primitives in distributed computing, enabling asynchronous communication, load leveling, and fault tolerance.

---

## Queue as a Fundamental Primitive

Queues serve as the backbone of loosely coupled architectures. They allow components to communicate without knowing about each other's existence, availability, or processing speed.

### Why Queues Matter

| Concern | How Queues Help |
|---------|----------------|
| Decoupling | Producers and consumers evolve independently |
| Buffering | Absorb traffic spikes without overloading consumers |
| Reliability | Messages persist even if consumers are temporarily down |
| Scalability | Add more consumers to increase throughput |
| Ordering | Provide sequencing guarantees where needed |

### Basic Queue Operations

```
Enqueue(message)   → Add message to the tail
Dequeue()          → Remove and return message from the head
Peek()             → View head message without removing
Acknowledge(id)    → Confirm successful processing
```

---

## FIFO Queues in Distributed Settings

A **FIFO (First-In, First-Out)** queue guarantees that messages are delivered in the exact order they were sent. This is straightforward in a single-process system but becomes complex when distributed.

### Challenges of Distributed FIFO

1. **Network reordering** — Packets may arrive out of order across nodes
2. **Multiple producers** — Interleaving from concurrent senders
3. **Partitioning** — Splitting queues for throughput breaks global ordering
4. **Redelivery** — Retries after failures can violate ordering

### Approaches to Maintain FIFO

| Approach | Description | Trade-off |
|----------|-------------|-----------|
| Single partition | All messages go through one node | Limits throughput |
| Sequence numbers | Attach monotonic IDs to messages | Consumers must reorder |
| Partition keys | FIFO within a partition key | Only partial ordering |
| Consensus-based | Use Raft/Paxos for total order | Higher latency |

### Example: Sequence Number Ordering

```python
class FIFOConsumer:
    def __init__(self):
        self.next_expected = 0
        self.buffer = {}

    def receive(self, seq_num, message):
        if seq_num == self.next_expected:
            self.process(message)
            self.next_expected += 1
            # Process any buffered messages
            while self.next_expected in self.buffer:
                self.process(self.buffer.pop(self.next_expected))
                self.next_expected += 1
        elif seq_num > self.next_expected:
            self.buffer[seq_num] = message
        # else: duplicate, ignore

    def process(self, message):
        print(f"Processing: {message}")
```

---

## Priority Queues

A **priority queue** delivers messages based on priority level rather than arrival order. Higher-priority messages are consumed before lower-priority ones.

### Implementation Strategies

| Strategy | Pros | Cons |
|----------|------|------|
| Multiple physical queues | Simple, clear separation | Consumer must poll multiple queues |
| Single queue with sorting | Unified consumer logic | Expensive reordering |
| Bucket-based | Good balance | Fixed number of priority levels |

### Example: Multi-Queue Priority

```javascript
// Producer assigns priority
async function enqueue(message, priority) {
  const queueName = `tasks-priority-${priority}`;
  await broker.publish(queueName, message);
}

// Consumer checks high-priority first
async function consume() {
  for (const priority of ["high", "medium", "low"]) {
    const msg = await broker.poll(`tasks-priority-${priority}`);
    if (msg) {
      await process(msg);
      return;
    }
  }
}
```

### Priority Starvation

Low-priority messages may never be processed if high-priority messages keep arriving. Solutions:

- **Aging** — Increase priority over time
- **Weighted fair queuing** — Process N high-priority for every 1 low-priority
- **Deadline-based** — Escalate if waiting too long

---

## Message Queue Implementations

### RabbitMQ (AMQP)

RabbitMQ implements the **Advanced Message Queuing Protocol (AMQP)**. It uses exchanges, bindings, and queues to route messages.

```
Producer → Exchange → Binding → Queue → Consumer
```

**Key concepts:**

| Concept | Description |
|---------|-------------|
| Exchange | Routes messages to queues based on rules |
| Binding | Links an exchange to a queue with a routing key |
| Queue | Stores messages until consumed |
| Acknowledgment | Consumer confirms processing |

**Exchange types:**

- `direct` — Route by exact routing key match
- `fanout` — Broadcast to all bound queues
- `topic` — Route by pattern matching (e.g., `order.*.created`)
- `headers` — Route by message header attributes

```python
import pika

# Producer
connection = pika.BlockingConnection(
    pika.ConnectionParameters("localhost")
)
channel = connection.channel()
channel.queue_declare(queue="task_queue", durable=True)

channel.basic_publish(
    exchange="",
    routing_key="task_queue",
    body="Hello World",
    properties=pika.BasicProperties(delivery_mode=2)  # persistent
)
connection.close()

# Consumer
def callback(ch, method, properties, body):
    print(f"Received: {body}")
    ch.basic_ack(delivery_tag=method.delivery_tag)

channel.basic_qos(prefetch_count=1)
channel.basic_consume(queue="task_queue", on_message_callback=callback)
channel.start_consuming()
```

### Apache Kafka (as a Queue)

Kafka is a **distributed log** that can function as a queue using consumer groups.

```
Producer → Topic (Partitions) → Consumer Group → Consumers
```

**Key differences from traditional queues:**

| Feature | Traditional Queue | Kafka |
|---------|-------------------|-------|
| Message removal | Deleted after consumption | Retained for configurable time |
| Replay | Not possible | Seek to any offset |
| Ordering | Global FIFO | Per-partition FIFO |
| Scaling | Add queues | Add partitions |

```java
// Kafka Producer
Properties props = new Properties();
props.put("bootstrap.servers", "localhost:9092");
props.put("key.serializer", StringSerializer.class);
props.put("value.serializer", StringSerializer.class);

Producer<String, String> producer = new KafkaProducer<>(props);
producer.send(new ProducerRecord<>("orders", "key1", "order-data"));
producer.close();

// Kafka Consumer (as queue via consumer group)
Properties consumerProps = new Properties();
consumerProps.put("bootstrap.servers", "localhost:9092");
consumerProps.put("group.id", "order-processors");
consumerProps.put("enable.auto.commit", "false");

KafkaConsumer<String, String> consumer = new KafkaConsumer<>(consumerProps);
consumer.subscribe(Collections.singletonList("orders"));

while (true) {
    ConsumerRecords<String, String> records = consumer.poll(Duration.ofMillis(100));
    for (ConsumerRecord<String, String> record : records) {
        process(record.value());
    }
    consumer.commitSync();
}
```

### AWS SQS

Amazon **Simple Queue Service** is a fully managed queue with two variants:

| Feature | Standard Queue | FIFO Queue |
|---------|---------------|------------|
| Throughput | Nearly unlimited | 300 msg/s (batching: 3000) |
| Ordering | Best-effort | Strict FIFO |
| Delivery | At-least-once | Exactly-once |
| Deduplication | None | 5-minute window |

```python
import boto3

sqs = boto3.client("sqs", region_name="us-east-1")
queue_url = "https://sqs.us-east-1.amazonaws.com/123456789/my-queue"

# Send message
sqs.send_message(
    QueueUrl=queue_url,
    MessageBody="Process this order",
    MessageAttributes={
        "OrderType": {"DataType": "String", "StringValue": "premium"}
    }
)

# Receive and delete
response = sqs.receive_message(
    QueueUrl=queue_url,
    MaxNumberOfMessages=10,
    WaitTimeSeconds=20  # long polling
)

for message in response.get("Messages", []):
    process(message["Body"])
    sqs.delete_message(
        QueueUrl=queue_url,
        ReceiptHandle=message["ReceiptHandle"]
    )
```

### Azure Service Bus

Azure Service Bus provides enterprise messaging with **queues** and **topics/subscriptions**.

| Feature | Description |
|---------|-------------|
| Sessions | Group related messages for ordered processing |
| Transactions | Atomic send/receive operations |
| Dead-lettering | Automatic handling of poison messages |
| Scheduled delivery | Send messages for future processing |
| Duplicate detection | Configurable time window |

---

## Queue Patterns

### Work Queue (Task Distribution)

Distribute tasks among multiple workers for parallel processing.

```
Producer → Queue → Worker 1
                 → Worker 2
                 → Worker 3
```

Each message is delivered to exactly one worker. Workers acknowledge after processing.

### Request-Reply

Implement synchronous-style communication over asynchronous queues.

```
Client → Request Queue → Server
Client ← Reply Queue   ← Server
```

```python
# Client sends request with reply-to and correlation ID
import uuid

correlation_id = str(uuid.uuid4())
channel.basic_publish(
    exchange="",
    routing_key="rpc_queue",
    properties=pika.BasicProperties(
        reply_to="amq.rabbitmq.reply-to",
        correlation_id=correlation_id,
    ),
    body="compute_fibonacci(30)"
)
```

### Competing Consumers

Multiple consumers compete to process messages from the same queue. The broker ensures each message goes to only one consumer.

```
                    ┌─── Consumer A (fast)
Queue ──────────────├─── Consumer B (medium)
                    └─── Consumer C (slow)
```

**Prefetch/QoS** controls how many unacknowledged messages each consumer can hold:

```python
# Limit each consumer to 1 unacknowledged message
channel.basic_qos(prefetch_count=1)
```

---

## Delivery Guarantees

### At-Most-Once Delivery

The message is delivered **zero or one time**. No retries on failure.

```
Producer → Broker → Consumer
                    (if ACK lost, message is gone)
```

- **Use when:** Losing a message is acceptable (metrics, logs)
- **Implementation:** Fire-and-forget, no acknowledgment required

### At-Least-Once Delivery

The message is delivered **one or more times**. Retries ensure delivery but may cause duplicates.

```
Producer → Broker → Consumer
                    (if ACK lost, broker resends)
                    → Consumer (duplicate!)
```

- **Use when:** Every message must be processed (orders, payments)
- **Implementation:** Acknowledgment + retry with timeout
- **Consumer must be idempotent**

### Exactly-Once Delivery

The message is processed **exactly one time**. The hardest guarantee to achieve.

| Approach | Mechanism |
|----------|-----------|
| Idempotent consumer | Deduplicate using message ID |
| Transactional outbox | Write message + state in one DB transaction |
| Kafka transactions | Producer/consumer transactions with isolation |
| Deduplication window | Broker rejects duplicates within time window |

```python
# Idempotent consumer pattern
def process_message(message):
    msg_id = message["id"]

    # Check if already processed
    if db.processed_messages.find_one({"_id": msg_id}):
        return  # Skip duplicate

    # Process and record atomically
    with db.start_session() as session:
        with session.start_transaction():
            execute_business_logic(message)
            db.processed_messages.insert_one(
                {"_id": msg_id, "processed_at": datetime.utcnow()},
                session=session
            )
```

---

## Ordering Guarantees

| System | Ordering Guarantee |
|--------|--------------------|
| RabbitMQ | Per-queue FIFO (single consumer) |
| Kafka | Per-partition FIFO |
| AWS SQS Standard | Best-effort (no guarantee) |
| AWS SQS FIFO | Strict FIFO per message group |
| Azure Service Bus | FIFO with sessions |

### Partition-Level Ordering (Kafka)

```
Topic: orders (3 partitions)

Partition 0: [order-1, order-4, order-7]  → Consumer A
Partition 1: [order-2, order-5, order-8]  → Consumer B
Partition 2: [order-3, order-6, order-9]  → Consumer C
```

Messages with the same key always go to the same partition, guaranteeing order for that key.

---

## Dead Letter Queues (DLQ)

A **dead letter queue** captures messages that cannot be processed after repeated attempts.

### When Messages Are Dead-Lettered

- Maximum retry count exceeded
- Message TTL (time-to-live) expired
- Queue length limit reached
- Consumer explicitly rejects the message

### DLQ Architecture

```
Main Queue → Consumer (fails) → Retry Queue (delay)
                                      ↓ (max retries)
                              Dead Letter Queue → Alert → Manual Review
```

### Example: Retry with Exponential Backoff

```javascript
async function processWithRetry(message, maxRetries = 3) {
  const retryCount = message.headers["x-retry-count"] || 0;

  try {
    await processMessage(message);
    await channel.ack(message);
  } catch (error) {
    if (retryCount >= maxRetries) {
      // Send to DLQ
      await channel.publish("", "dead-letter-queue", message.content, {
        headers: { ...message.headers, "x-error": error.message },
      });
      await channel.ack(message);
    } else {
      // Retry with delay
      const delay = Math.pow(2, retryCount) * 1000;
      await channel.publish("", "retry-queue", message.content, {
        headers: { "x-retry-count": retryCount + 1, "x-delay": delay },
      });
      await channel.ack(message);
    }
  }
}
```

---

## Backpressure

**Backpressure** is a mechanism to prevent producers from overwhelming consumers when they cannot keep up.

### Backpressure Strategies

| Strategy | Description | Example |
|----------|-------------|---------|
| Blocking | Producer waits until space available | Bounded queue with blocking enqueue |
| Dropping | Discard messages when full | Ring buffer / circular queue |
| Rate limiting | Throttle producer send rate | Token bucket at producer |
| Signaling | Notify producer to slow down | Credit-based flow control |
| Scaling | Add more consumers dynamically | Auto-scaling consumer group |

### Example: Credit-Based Flow Control

```python
class BackpressureQueue:
    def __init__(self, capacity=1000):
        self.capacity = capacity
        self.queue = []
        self.credits = capacity

    def request_credits(self, count):
        """Consumer grants credits to producer."""
        available = min(count, self.capacity - len(self.queue))
        self.credits = available
        return available

    def send(self, message):
        if self.credits <= 0:
            raise BackpressureException("No credits available")
        self.queue.append(message)
        self.credits -= 1

    def receive(self):
        if self.queue:
            return self.queue.pop(0)
        return None
```

---

## Queue Monitoring

### Key Metrics to Track

| Metric | What It Indicates | Alert Threshold |
|--------|-------------------|-----------------|
| Queue depth | Messages waiting | Growing over time |
| Consumer lag | How far behind consumers are | Increasing lag |
| Processing rate | Messages processed/sec | Dropping below baseline |
| Error rate | Failed message processing | Above 1-5% |
| Message age | Oldest unprocessed message | Exceeds SLA |
| Consumer count | Active consumers | Below minimum |

### Monitoring Commands (RabbitMQ)

```bash
# List queues with message counts
rabbitmqctl list_queues name messages consumers

# Check queue depth
rabbitmqctl list_queues name messages_ready messages_unacknowledged
```

### Kafka Consumer Lag

```bash
# Check consumer group lag
kafka-consumer-groups.sh --bootstrap-server localhost:9092 \
  --group order-processors --describe

# Output:
# TOPIC    PARTITION  CURRENT-OFFSET  LOG-END-OFFSET  LAG
# orders   0          1000            1050            50
# orders   1          980             1020            40
```

---

## Comparison Table of Queue Systems

| Feature | RabbitMQ | Kafka | AWS SQS | Azure Service Bus |
|---------|----------|-------|---------|-------------------|
| **Model** | Message broker | Distributed log | Managed queue | Enterprise broker |
| **Protocol** | AMQP, MQTT, STOMP | Custom (TCP) | HTTP/HTTPS | AMQP, HTTP |
| **Ordering** | Per-queue FIFO | Per-partition | Best-effort / FIFO | FIFO with sessions |
| **Retention** | Until consumed | Time-based (days/weeks) | 4 days (max 14) | 14 days (max) |
| **Replay** | No | Yes (seek to offset) | No | No |
| **Throughput** | ~50K msg/s | Millions msg/s | Nearly unlimited | ~2000 msg/s per unit |
| **Latency** | Sub-millisecond | Low milliseconds | 10-20 ms | Low milliseconds |
| **Delivery** | At-least-once | At-least-once / exactly-once | At-least-once / exactly-once (FIFO) | At-least-once |
| **Dead letter** | Built-in | Manual (separate topic) | Built-in | Built-in |
| **Routing** | Exchanges + bindings | Topic + partitions | None (point-to-point) | Topics + subscriptions |
| **Hosting** | Self-managed / Cloud | Self-managed / Confluent | Fully managed (AWS) | Fully managed (Azure) |
| **Best for** | Complex routing, RPC | High-throughput streaming | Simple cloud queues | Enterprise integration |

---

## When to Use Queues vs Direct Communication

| Scenario | Use Queues | Use Direct (HTTP/gRPC) |
|----------|-----------|------------------------|
| Async processing | ✅ Decouple request from processing | ❌ Caller blocks |
| Spike handling | ✅ Buffer absorbs load | ❌ Target overloaded |
| Reliable delivery | ✅ Persisted until consumed | ❌ Lost if target is down |
| Real-time response | ❌ Adds latency | ✅ Immediate reply |
| Simple request-reply | ❌ Overhead for correlation | ✅ Natural fit |
| Fan-out / broadcast | ✅ Pub/sub patterns | ❌ Caller must know all targets |
| Ordering requirements | ✅ FIFO guarantees | ❌ No inherent ordering |
| Tight coupling OK | ❌ Unnecessary complexity | ✅ Simpler architecture |

### Decision Framework

```
Do you need an immediate response?
├── Yes → Direct communication (HTTP/gRPC)
└── No
    ├── Can the consumer be temporarily unavailable?
    │   ├── Yes → Use a queue
    │   └── No → Direct communication
    └── Do you have traffic spikes?
        ├── Yes → Use a queue for load leveling
        └── No → Either works; choose simpler option
```

---

## Try It Yourself

### Exercise 1: Design a Queue System

You are building an e-commerce platform. Design the queue architecture for:
- Order processing (must not lose orders)
- Email notifications (can tolerate occasional loss)
- Real-time inventory updates (ordering matters)

**Consider:** Which queue system would you choose for each? What delivery guarantees do you need?

### Exercise 2: Implement Idempotent Consumer

Write a consumer that processes payment messages exactly once, even if the same message is delivered multiple times.

```python
# Your implementation here
class PaymentConsumer:
    def __init__(self, db):
        self.db = db

    def process(self, message):
        # TODO: Implement idempotent processing
        # 1. Check if message already processed
        # 2. If not, process payment and record message ID
        # 3. If yes, skip (return success without processing)
        pass
```

### Exercise 3: Backpressure Simulation

Given a producer generating 1000 messages/second and a consumer processing 200 messages/second:

1. How quickly does the queue grow?
2. At what queue depth should you trigger auto-scaling?
3. How many consumers do you need at steady state?

---

## Summary

- Distributed queues decouple producers from consumers, enabling **asynchronous, reliable communication**
- **FIFO ordering** is hard in distributed settings — use partition keys or sequence numbers
- Choose delivery guarantees based on your use case: **at-most-once** (fast), **at-least-once** (safe), **exactly-once** (complex)
- **Dead letter queues** prevent poison messages from blocking processing
- **Backpressure** mechanisms protect consumers from being overwhelmed
- Monitor **queue depth, consumer lag, and error rates** as primary health indicators
- Use queues when you need decoupling, buffering, or reliability; use direct communication for real-time request-reply
