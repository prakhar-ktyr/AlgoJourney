---
title: "Publish-Subscribe Pattern"
---

# Publish-Subscribe Pattern in Distributed Systems

The **publish-subscribe** (pub/sub) pattern decouples the producers of messages from the consumers. Publishers emit events to a topic without knowing who (if anyone) is listening, and subscribers receive events from topics they care about without knowing who published them.

This decoupling is a cornerstone of scalable, event-driven architectures.

---

## The Pub/Sub Model

### Core Components

```
┌───────────┐       ┌─────────────────┐       ┌────────────┐
│ Publisher  │──────►│   Topic/Channel  │──────►│ Subscriber │
│ (Producer) │       │   (Message Bus)  │       │ (Consumer) │
└───────────┘       └─────────────────┘       └────────────┘
                           │
                           ├──────────────────►┌────────────┐
                           │                   │ Subscriber │
                           │                   └────────────┘
                           │
                           └──────────────────►┌────────────┐
                                               │ Subscriber │
                                               └────────────┘
```

| Component | Role |
|-----------|------|
| **Publisher** | Produces messages and sends them to a topic |
| **Subscriber** | Registers interest in a topic and receives messages |
| **Topic / Channel** | Named category that groups related messages |
| **Message Broker** | Infrastructure that routes messages from publishers to subscribers |

### Key Properties

1. **Loose coupling**: Publishers and subscribers don't know about each other
2. **Many-to-many**: Multiple publishers can write to a topic; multiple subscribers can read
3. **Asynchronous**: Publishers don't wait for subscribers to process messages
4. **Push-based**: Messages are pushed to subscribers (vs. pull-based polling)

---

## Pub/Sub vs Message Queues

These are often confused, but they solve different problems.

```
Message Queue (Point-to-Point):       Pub/Sub (Broadcast):

Producer ──► Queue ──► Consumer       Publisher ──► Topic ──┬──► Sub A
                                                           ├──► Sub B
Each message consumed by               Each message delivered
exactly ONE consumer                    to ALL subscribers
```

| Feature | Message Queue | Pub/Sub |
|---------|--------------|---------|
| **Delivery** | One consumer gets each message | All subscribers get each message |
| **Pattern** | Competing consumers | Fan-out broadcast |
| **Coupling** | Producer knows queue exists | Publisher doesn't know subscribers |
| **Use case** | Work distribution, task processing | Event notification, broadcast |
| **Message lifetime** | Removed after consumption | Depends on implementation |
| **Scaling** | Add consumers to increase throughput | Add subscribers independently |
| **Examples** | RabbitMQ (default), SQS, Celery | Redis Pub/Sub, SNS, Kafka topics |

> **Note**: Some systems like Kafka blur the line — they use topics (pub/sub) but also support consumer groups (queue-like competing consumers).

---

## Pub/Sub Implementations

### Redis Pub/Sub

Redis provides the simplest pub/sub implementation — no persistence, no replay, pure real-time broadcasting.

```python
import redis

# Publisher
def publish_event(channel, message):
    r = redis.Redis(host="localhost", port=6379)
    r.publish(channel, message)
    print(f"Published to {channel}: {message}")

# Subscriber
def subscribe_to_events(channels):
    r = redis.Redis(host="localhost", port=6379)
    pubsub = r.pubsub()
    pubsub.subscribe(channels)

    print(f"Subscribed to: {channels}")
    for message in pubsub.listen():
        if message["type"] == "message":
            channel = message["channel"].decode()
            data = message["data"].decode()
            print(f"Received on {channel}: {data}")

# Usage
publish_event("orders", '{"order_id": 123, "status": "created"}')
subscribe_to_events(["orders", "payments"])
```

**Pros**: Simple, fast, built into Redis  
**Cons**: No persistence — missed messages are lost. No replay. No consumer groups.

### Apache Kafka as Pub/Sub

Kafka provides durable, replayable pub/sub with consumer groups.

```java
// Producer (Publisher)
import org.apache.kafka.clients.producer.*;
import java.util.Properties;

public class OrderEventPublisher {
    private final KafkaProducer<String, String> producer;

    public OrderEventPublisher() {
        Properties props = new Properties();
        props.put("bootstrap.servers", "kafka:9092");
        props.put("key.serializer",
            "org.apache.kafka.common.serialization.StringSerializer");
        props.put("value.serializer",
            "org.apache.kafka.common.serialization.StringSerializer");
        props.put("acks", "all");  // Wait for all replicas
        this.producer = new KafkaProducer<>(props);
    }

    public void publishOrderEvent(String orderId, String event) {
        ProducerRecord<String, String> record =
            new ProducerRecord<>("order-events", orderId, event);

        producer.send(record, (metadata, exception) -> {
            if (exception != null) {
                System.err.println("Failed to publish: " + exception);
            } else {
                System.out.printf("Published to partition %d, offset %d%n",
                    metadata.partition(), metadata.offset());
            }
        });
    }
}
```

```java
// Consumer (Subscriber)
import org.apache.kafka.clients.consumer.*;
import java.time.Duration;
import java.util.*;

public class OrderEventSubscriber {
    private final KafkaConsumer<String, String> consumer;

    public OrderEventSubscriber(String groupId) {
        Properties props = new Properties();
        props.put("bootstrap.servers", "kafka:9092");
        props.put("group.id", groupId);
        props.put("key.deserializer",
            "org.apache.kafka.common.serialization.StringDeserializer");
        props.put("value.deserializer",
            "org.apache.kafka.common.serialization.StringDeserializer");
        props.put("auto.offset.reset", "earliest");
        this.consumer = new KafkaConsumer<>(props);
    }

    public void subscribe(String topic) {
        consumer.subscribe(Collections.singletonList(topic));

        while (true) {
            ConsumerRecords<String, String> records =
                consumer.poll(Duration.ofMillis(1000));

            for (ConsumerRecord<String, String> record : records) {
                System.out.printf("Received: key=%s, value=%s, "
                    + "partition=%d, offset=%d%n",
                    record.key(), record.value(),
                    record.partition(), record.offset());
                processEvent(record.value());
            }
        }
    }

    private void processEvent(String event) {
        // Process the event
    }
}
```

### Google Cloud Pub/Sub

```python
from google.cloud import pubsub_v1
import json

# Publisher
def publish_to_gcp(project_id, topic_id, message):
    publisher = pubsub_v1.PublisherClient()
    topic_path = publisher.topic_path(project_id, topic_id)

    data = json.dumps(message).encode("utf-8")
    future = publisher.publish(
        topic_path,
        data,
        origin="order-service",  # Custom attributes
        event_type="order.created"
    )
    print(f"Published message ID: {future.result()}")

# Subscriber
def subscribe_from_gcp(project_id, subscription_id):
    subscriber = pubsub_v1.SubscriberClient()
    subscription_path = subscriber.subscription_path(
        project_id, subscription_id
    )

    def callback(message):
        print(f"Received: {message.data.decode()}")
        print(f"Attributes: {message.attributes}")
        message.ack()  # Acknowledge processing

    streaming_pull = subscriber.subscribe(
        subscription_path, callback=callback
    )
    print(f"Listening on {subscription_path}...")
    streaming_pull.result()  # Block and listen
```

### AWS SNS (Simple Notification Service)

```python
import boto3
import json

sns = boto3.client("sns", region_name="us-east-1")

# Create a topic
response = sns.create_topic(Name="order-events")
topic_arn = response["TopicArn"]

# Publish
sns.publish(
    TopicArn=topic_arn,
    Message=json.dumps({"order_id": 123, "status": "created"}),
    MessageAttributes={
        "event_type": {
            "DataType": "String",
            "StringValue": "order.created"
        }
    }
)

# Subscribe (e.g., Lambda, SQS, HTTP endpoint)
sns.subscribe(
    TopicArn=topic_arn,
    Protocol="sqs",        # or "lambda", "https", "email"
    Endpoint="arn:aws:sqs:us-east-1:123456789:order-queue"
)
```

### Implementation Comparison

| Feature | Redis Pub/Sub | Kafka | GCP Pub/Sub | AWS SNS |
|---------|--------------|-------|-------------|---------|
| **Persistence** | No | Yes (log-based) | Yes | No (fan-out to durable targets) |
| **Replay** | No | Yes (offset-based) | Yes (seek) | No |
| **Ordering** | Per channel | Per partition | Per key (ordering keys) | No guarantee |
| **Consumer Groups** | No | Yes | Yes (subscriptions) | Via SQS |
| **Delivery** | At-most-once | At-least-once | At-least-once | At-least-once |
| **Latency** | Sub-millisecond | Low milliseconds | Tens of milliseconds | Tens of milliseconds |
| **Scale** | Single node | Millions/sec | Millions/sec | Millions/sec |

---

## Fan-Out Pattern

**Fan-out** sends a single event to multiple downstream services simultaneously.

```
                          ┌──► Email Service
                          │
Order Created ──► Topic ──┼──► Inventory Service
                          │
                          ├──► Analytics Service
                          │
                          └──► Notification Service
```

```python
# Fan-out with SNS → multiple SQS queues
import boto3

sns = boto3.client("sns")
sqs = boto3.client("sqs")

# One topic, multiple subscribers
topic_arn = "arn:aws:sns:us-east-1:123:order-events"

# Each service gets its own queue subscribed to the topic
queues = [
    "arn:aws:sqs:us-east-1:123:email-queue",
    "arn:aws:sqs:us-east-1:123:inventory-queue",
    "arn:aws:sqs:us-east-1:123:analytics-queue",
]

for queue_arn in queues:
    sns.subscribe(
        TopicArn=topic_arn,
        Protocol="sqs",
        Endpoint=queue_arn
    )

# Publishing once reaches ALL subscribers
sns.publish(
    TopicArn=topic_arn,
    Message='{"order_id": 123, "items": [...]}',
)
```

### Fan-Out Throughput

If a publisher emits $P$ messages per second to a topic with $S$ subscribers, the total message delivery rate is:

$$
\text{Total delivery rate} = P \times S
$$

For a topic with 10,000 messages/sec and 5 subscribers, the broker must handle $10{,}000 \times 5 = 50{,}000$ deliveries/sec.

---

## Event-Driven Architecture

Pub/sub is the backbone of **event-driven architecture** (EDA), where services communicate through events rather than direct calls.

### Request-Driven vs Event-Driven

| Aspect | Request-Driven | Event-Driven |
|--------|---------------|--------------|
| **Communication** | Synchronous, direct calls | Asynchronous, via events |
| **Coupling** | Tight — caller knows callee | Loose — publisher doesn't know subscribers |
| **Failure handling** | Caller must handle failures | Broker handles delivery |
| **Scalability** | Limited by slowest service | Services scale independently |
| **Debugging** | Easy — linear flow | Harder — distributed flow |

### Event Types

```python
# 1. Domain Events — something happened in the business domain
domain_event = {
    "type": "order.created",
    "timestamp": "2026-05-04T10:30:00Z",
    "data": {
        "order_id": "ord-123",
        "customer_id": "cust-456",
        "total": 99.99,
        "items": [{"sku": "WIDGET-1", "qty": 2}]
    }
}

# 2. Integration Events — communicate between bounded contexts
integration_event = {
    "type": "payment.completed",
    "source": "payment-service",
    "data": {
        "payment_id": "pay-789",
        "order_id": "ord-123",
        "amount": 99.99
    }
}

# 3. Notification Events — thin events that signal something happened
notification_event = {
    "type": "order.updated",
    "data": {
        "order_id": "ord-123"
        # Subscriber must call back for details
    }
}
```

---

## Event Sourcing with Pub/Sub

**Event sourcing** stores all changes as a sequence of events. Combined with pub/sub, it enables powerful patterns.

```
Command ──► Aggregate ──► Event Store ──► Pub/Sub ──► Projections
                              │                          │
                          (source of                 (read models,
                           truth)                    materialized views)
```

```python
# Event sourcing: an order as a sequence of events
class OrderAggregate:
    def __init__(self, order_id):
        self.order_id = order_id
        self.status = None
        self.items = []
        self.events = []  # Uncommitted events

    def create(self, customer_id, items):
        event = {
            "type": "OrderCreated",
            "data": {
                "order_id": self.order_id,
                "customer_id": customer_id,
                "items": items
            }
        }
        self._apply(event)
        self.events.append(event)

    def confirm(self):
        if self.status != "created":
            raise ValueError("Can only confirm created orders")
        event = {
            "type": "OrderConfirmed",
            "data": {"order_id": self.order_id}
        }
        self._apply(event)
        self.events.append(event)

    def _apply(self, event):
        if event["type"] == "OrderCreated":
            self.status = "created"
            self.items = event["data"]["items"]
        elif event["type"] == "OrderConfirmed":
            self.status = "confirmed"

    @classmethod
    def from_events(cls, order_id, events):
        """Rebuild state from event history."""
        order = cls(order_id)
        for event in events:
            order._apply(event)
        return order
```

After saving events to the store, they are published via pub/sub so that read models, analytics, and other services can react.

---

## Filtering and Routing

Not every subscriber needs every message. **Filtering** lets subscribers receive only relevant events.

### Topic-Based Filtering

```
orders.created     ──► Order Processing Subscriber
orders.shipped     ──► Shipping Notification Subscriber
orders.*           ──► Analytics Subscriber (gets all order events)
payments.completed ──► Payment Confirmation Subscriber
```

### Content-Based Filtering

```python
# AWS SNS filter policy — subscriber only gets high-value orders
sns.subscribe(
    TopicArn=topic_arn,
    Protocol="sqs",
    Endpoint=queue_arn,
    Attributes={
        "FilterPolicy": json.dumps({
            "event_type": ["order.created"],
            "order_value": [{"numeric": [">=", 1000]}]
        })
    }
)
```

### Attribute-Based Filtering (GCP Pub/Sub)

```python
# Subscriber with filter
subscriber.create_subscription(
    request={
        "name": subscription_path,
        "topic": topic_path,
        "filter": 'attributes.event_type = "order.created" '
                  'AND attributes.region = "us-east"'
    }
)
```

| Filtering Type | Where It Happens | Pros | Cons |
|---------------|------------------|------|------|
| **Topic-based** | Publisher chooses topic | Simple, fast | Requires multiple topics |
| **Content-based** | Broker filters | Flexible | Broker must inspect messages |
| **Client-side** | Subscriber filters | Full control | Wastes bandwidth |

---

## Delivery Guarantees

How many times will a subscriber receive each message?

### The Three Guarantees

| Guarantee | Description | Risk |
|-----------|-------------|------|
| **At-most-once** | Message delivered zero or one time | Messages can be **lost** |
| **At-least-once** | Message delivered one or more times | Messages can be **duplicated** |
| **Exactly-once** | Message delivered exactly one time | Hard to achieve; often approximate |

### At-Most-Once (Fire and Forget)

```python
# Redis Pub/Sub — if subscriber is offline, message is lost
publisher.publish("events", message)
# No acknowledgment, no persistence
```

### At-Least-Once (Ack After Processing)

```python
# Kafka consumer — commit offset after processing
for message in consumer:
    process(message)        # Process first
    consumer.commit()       # Then acknowledge
    # If crash after process() but before commit(),
    # message will be redelivered → duplicate
```

### Exactly-Once (Idempotent Processing)

True exactly-once delivery is generally impossible in distributed systems (see the Two Generals' Problem). The practical approach is **at-least-once delivery + idempotent processing**:

```python
import hashlib

class IdempotentSubscriber:
    def __init__(self):
        self.processed_ids = set()  # In production, use a database

    def handle_message(self, message):
        msg_id = message["id"]

        # Deduplicate
        if msg_id in self.processed_ids:
            print(f"Skipping duplicate: {msg_id}")
            return

        # Process
        self._process(message)

        # Mark as processed
        self.processed_ids.add(msg_id)

    def _process(self, message):
        # Actual business logic
        pass
```

---

## Ordering in Pub/Sub

Message ordering is one of the hardest problems in distributed pub/sub.

### The Challenge

```
Publisher sends:    Event A → Event B → Event C

Subscriber receives (no ordering guarantee):
                   Event B → Event A → Event C  ✗ Wrong!
```

### Ordering Strategies

| Strategy | How It Works | Trade-off |
|----------|-------------|-----------|
| **No ordering** | Messages arrive in any order | Maximum throughput |
| **Per-partition** | Order within a partition (Kafka) | Must choose partition key wisely |
| **Per-key** | Order for same key (GCP ordering keys) | Keys with high volume become bottlenecks |
| **Total ordering** | Global order across all messages | Severely limits throughput |
| **Causal ordering** | Preserve cause-effect relationships | Complex to implement |

### Kafka Partition-Based Ordering

```python
from kafka import KafkaProducer

producer = KafkaProducer(bootstrap_servers="kafka:9092")

# Messages with the same key go to the same partition → ordered
producer.send(
    "order-events",
    key=b"order-123",     # Partition key
    value=b'{"status": "created"}'
)
producer.send(
    "order-events",
    key=b"order-123",     # Same key → same partition → ordered
    value=b'{"status": "confirmed"}'
)
```

The number of partitions limits parallelism. With $P$ partitions, you can have at most $P$ consumers in a consumer group:

$$
\text{max\_consumers} = P
$$

---

## Scalability of Pub/Sub

### Scaling Publishers

Publishers are stateless — add more instances freely:

```
Publisher 1 ──┐
Publisher 2 ──┼──► Topic (partitioned) ──► Subscribers
Publisher 3 ──┘
```

### Scaling Subscribers (Consumer Groups)

```
                    ┌──► Consumer 1 (Partition 0, 1)
Topic ──────────────┤
(4 partitions)      ├──► Consumer 2 (Partition 2)
                    │
                    └──► Consumer 3 (Partition 3)
```

Each partition is consumed by exactly one consumer in a group. To scale:

1. **Add partitions** to the topic
2. **Add consumers** to the group (up to partition count)

### Scaling the Broker

| Strategy | Description |
|----------|-------------|
| **Partitioning** | Split topic into partitions across brokers |
| **Replication** | Copy partitions to multiple brokers for fault tolerance |
| **Tiered storage** | Move old data to cheaper storage (Kafka Tiered Storage) |
| **Federation** | Connect multiple broker clusters |

### Throughput Estimation

For a system with $P$ partitions, each handling $T$ messages/sec, and a replication factor of $R$:

$$
\text{Effective throughput} = P \times T
$$

$$
\text{Total broker write load} = P \times T \times R
$$

---

## Use Cases

### 1. Real-Time Notifications

```python
# Notification service subscribing to multiple event topics
class NotificationService:
    def __init__(self):
        self.handlers = {
            "order.created": self._send_order_confirmation,
            "order.shipped": self._send_shipping_update,
            "payment.failed": self._send_payment_alert,
        }

    def handle_event(self, event):
        event_type = event["type"]
        handler = self.handlers.get(event_type)
        if handler:
            handler(event["data"])

    def _send_order_confirmation(self, data):
        send_email(
            to=data["customer_email"],
            subject=f"Order {data['order_id']} confirmed!",
            template="order_confirmation",
            context=data
        )

    def _send_shipping_update(self, data):
        send_push_notification(
            user_id=data["customer_id"],
            title="Your order has shipped!",
            body=f"Tracking: {data['tracking_number']}"
        )

    def _send_payment_alert(self, data):
        send_sms(
            to=data["customer_phone"],
            message=f"Payment failed for order {data['order_id']}. "
                    f"Please update your payment method."
        )
```

### 2. Microservice Communication

```
┌────────────┐     order.created     ┌─────────────────┐
│   Order    │─────────────────────►  │   Inventory     │
│  Service   │                        │   Service       │
└────────────┘                        └─────────────────┘
      │
      │ order.created                 ┌─────────────────┐
      └─────────────────────────────► │   Billing       │
                                      │   Service       │
                                      └─────────────────┘
```

### 3. Log Aggregation

```python
# Application publishes structured logs to Kafka
import json
import logging
from kafka import KafkaProducer

class KafkaLogHandler(logging.Handler):
    def __init__(self, topic="application-logs"):
        super().__init__()
        self.producer = KafkaProducer(
            bootstrap_servers="kafka:9092",
            value_serializer=lambda v: json.dumps(v).encode()
        )
        self.topic = topic

    def emit(self, record):
        log_entry = {
            "timestamp": record.created,
            "level": record.levelname,
            "logger": record.name,
            "message": record.getMessage(),
            "service": "order-service",
            "hostname": record.hostname if hasattr(record, "hostname")
                        else "unknown",
        }
        self.producer.send(self.topic, value=log_entry)

# Subscriber: ELK stack, Datadog, or custom aggregator
# reads from "application-logs" topic
```

### 4. Real-Time Updates (WebSocket + Pub/Sub)

```python
# Server-side: bridge between pub/sub and WebSocket clients
import asyncio
import aioredis
import websockets

async def websocket_handler(websocket, path):
    """Bridge Redis pub/sub to WebSocket clients."""
    redis = await aioredis.from_url("redis://localhost")
    pubsub = redis.pubsub()

    # Subscribe to user-specific channel
    user_id = await websocket.recv()
    await pubsub.subscribe(f"user:{user_id}:notifications")

    try:
        async for message in pubsub.listen():
            if message["type"] == "message":
                await websocket.send(message["data"].decode())
    finally:
        await pubsub.unsubscribe(f"user:{user_id}:notifications")
        await redis.close()
```

---

## Practical: Building a Notification System

Let's build a complete notification system using pub/sub.

### Architecture

```
┌──────────┐     ┌──────────────┐     ┌──────────────────┐
│  Services │────►│  Kafka Topic  │────►│ Notification     │
│  (publish │     │ "events"      │     │ Consumer         │
│   events) │     └──────────────┘     │                  │
└──────────┘                           │ ┌──────────────┐ │
                                       │ │ Email Sender │ │
                                       │ ├──────────────┤ │
                                       │ │ SMS Sender   │ │
                                       │ ├──────────────┤ │
                                       │ │ Push Sender  │ │
                                       │ └──────────────┘ │
                                       └──────────────────┘
```

### Step 1: Define Events

```python
from dataclasses import dataclass, asdict
from datetime import datetime
from enum import Enum
import json
import uuid

class EventType(Enum):
    ORDER_CREATED = "order.created"
    ORDER_SHIPPED = "order.shipped"
    PAYMENT_FAILED = "payment.failed"
    USER_REGISTERED = "user.registered"

@dataclass
class Event:
    event_id: str
    event_type: str
    timestamp: str
    source: str
    data: dict

    @classmethod
    def create(cls, event_type: EventType, source: str, data: dict):
        return cls(
            event_id=str(uuid.uuid4()),
            event_type=event_type.value,
            timestamp=datetime.utcnow().isoformat() + "Z",
            source=source,
            data=data
        )

    def to_json(self):
        return json.dumps(asdict(self))
```

### Step 2: Publish Events

```python
from kafka import KafkaProducer

class EventPublisher:
    def __init__(self, bootstrap_servers="kafka:9092"):
        self.producer = KafkaProducer(
            bootstrap_servers=bootstrap_servers,
            value_serializer=lambda v: v.encode("utf-8"),
            key_serializer=lambda k: k.encode("utf-8") if k else None,
            acks="all",
            retries=3,
        )

    def publish(self, topic, event, partition_key=None):
        self.producer.send(
            topic,
            key=partition_key,
            value=event.to_json()
        )
        self.producer.flush()

# Usage in Order Service
publisher = EventPublisher()

event = Event.create(
    event_type=EventType.ORDER_CREATED,
    source="order-service",
    data={
        "order_id": "ord-123",
        "customer_id": "cust-456",
        "customer_email": "user@example.com",
        "total": 149.99
    }
)

publisher.publish(
    topic="order-events",
    event=event,
    partition_key="cust-456"  # Ordering per customer
)
```

### Step 3: Consume and Route Notifications

```python
from kafka import KafkaConsumer
import json

class NotificationConsumer:
    def __init__(self, topics, group_id="notification-service"):
        self.consumer = KafkaConsumer(
            *topics,
            bootstrap_servers="kafka:9092",
            group_id=group_id,
            auto_offset_reset="earliest",
            value_deserializer=lambda v: json.loads(v.decode()),
        )
        self.processed_ids = set()  # Idempotency (use DB in production)
        self.routers = {
            "order.created": [
                self._email_order_confirmation,
                self._push_order_update,
            ],
            "order.shipped": [
                self._email_shipping_notification,
                self._sms_shipping_update,
                self._push_order_update,
            ],
            "payment.failed": [
                self._email_payment_alert,
                self._sms_payment_alert,
            ],
        }

    def run(self):
        print("Notification consumer started...")
        for message in self.consumer:
            event = message.value
            event_id = event.get("event_id")

            # Idempotency check
            if event_id in self.processed_ids:
                continue

            event_type = event.get("event_type")
            handlers = self.routers.get(event_type, [])

            for handler in handlers:
                try:
                    handler(event["data"])
                except Exception as e:
                    print(f"Handler {handler.__name__} failed: {e}")
                    # In production: send to dead-letter queue

            self.processed_ids.add(event_id)

    def _email_order_confirmation(self, data):
        print(f"EMAIL → Order {data['order_id']} confirmed "
              f"for {data['customer_email']}")

    def _push_order_update(self, data):
        print(f"PUSH → Order {data['order_id']} update "
              f"for customer {data['customer_id']}")

    def _email_shipping_notification(self, data):
        print(f"EMAIL → Order {data['order_id']} shipped")

    def _sms_shipping_update(self, data):
        print(f"SMS → Order {data['order_id']} shipped")

    def _email_payment_alert(self, data):
        print(f"EMAIL → Payment failed for order {data['order_id']}")

    def _sms_payment_alert(self, data):
        print(f"SMS → Payment failed for order {data['order_id']}")

# Run the consumer
if __name__ == "__main__":
    consumer = NotificationConsumer(
        topics=["order-events", "payment-events"]
    )
    consumer.run()
```

### Step 4: Dead-Letter Queue for Failed Messages

```python
class DeadLetterHandler:
    def __init__(self, dlq_topic="notification-dlq"):
        self.publisher = EventPublisher()
        self.dlq_topic = dlq_topic

    def send_to_dlq(self, original_event, error, retry_count):
        dlq_message = {
            "original_event": original_event,
            "error": str(error),
            "retry_count": retry_count,
            "failed_at": datetime.utcnow().isoformat() + "Z",
        }
        dlq_event = Event.create(
            event_type=EventType.ORDER_CREATED,  # Reuse type
            source="notification-service",
            data=dlq_message
        )
        self.publisher.publish(self.dlq_topic, dlq_event)
```

---

## Exercises

### Exercise 1: Pub/Sub vs Queue Decision

For each scenario, decide whether pub/sub or a message queue is more appropriate:

1. Processing uploaded images (resize, compress, generate thumbnails)
2. Notifying multiple services when a user signs up
3. Distributing work across a pool of workers
4. Broadcasting live sports scores to thousands of clients
5. Sending password reset emails

### Exercise 2: Ordering Challenge

You have an e-commerce system with these events for order `ord-123`:

```
Event A: order.created  (timestamp: T1)
Event B: order.paid     (timestamp: T2)
Event C: order.shipped  (timestamp: T3)
```

1. If using Kafka with 4 partitions, how do you ensure these events are processed in order?
2. What happens if the partition key is the `event_type` instead of `order_id`?
3. Design a solution that handles out-of-order delivery gracefully.

### Exercise 3: Throughput Calculation

A Kafka cluster has:
- 3 brokers
- Topic with 12 partitions
- Replication factor of 3
- Each partition handles 5,000 messages/sec

Calculate:
1. Maximum consumer parallelism (consumers per group)
2. Effective read throughput
3. Total write load across all brokers

### Exercise 4: Build a Chat System

Design a real-time chat system using pub/sub:

- Users can join multiple chat rooms
- Messages are delivered to all participants in a room
- Messages must be ordered within a room
- Users should see message history when joining

Which pub/sub technology would you choose, and why? Sketch the topic/subscription structure.

---

## Key Takeaways

- **Pub/sub decouples** publishers from subscribers, enabling independent scaling and evolution
- **Pub/sub broadcasts** messages to all subscribers; message queues deliver to one consumer — choose based on your use case
- **Kafka** provides durable, replayable pub/sub with strong ordering per partition
- **Redis Pub/Sub** is the simplest option but offers no persistence — great for real-time, ephemeral messaging
- **Fan-out** multiplies message volume: $P \times S$ total deliveries for $P$ messages and $S$ subscribers
- **Event-driven architecture** uses pub/sub as its backbone for loose coupling between services
- **Exactly-once delivery** is impractical — use at-least-once delivery with idempotent consumers
- **Ordering** is only guaranteed within a partition/key — design your partition keys carefully
- **Filtering** reduces unnecessary message delivery — use topic-based or content-based filtering
- **Dead-letter queues** capture messages that fail processing so they can be investigated later
- **Consumer groups** enable horizontal scaling of subscribers up to the partition count
- When combining pub/sub with event sourcing, the event store is the source of truth and pub/sub is the distribution mechanism
