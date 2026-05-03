---
title: Testing Event-Driven Systems
---

## Event-Driven Architectures

Event-driven systems communicate through asynchronous events rather than direct calls:

- **Pub/Sub**: Publishers emit events, subscribers react independently
- **Event Sourcing**: State is derived from a sequence of immutable events
- **CQRS**: Command Query Responsibility Segregation—separate write and read models
- **Event Streaming**: Continuous flow of events (Kafka, Kinesis, Pulsar)

These patterns introduce unique testing challenges: non-deterministic timing, eventual consistency, and complex event chains.

## Testing Event Publishers

Verify that your service correctly emits events:

- Assert the event is published to the correct topic/queue
- Verify the event payload matches the expected schema
- Ensure events are published only on successful operations (not on failure)
- Test event ordering when multiple events are emitted
- Validate event metadata (correlation IDs, timestamps, source)

## Testing Event Consumers

Given an incoming event, verify the consumer produces correct side effects:

- Process the event and verify database changes
- Verify downstream events are emitted (event chains)
- Test error handling: malformed events, missing fields
- Verify acknowledgment/rejection behavior
- Test consumer group rebalancing scenarios

## Message Broker Testing

Test interactions with real or simulated brokers:

| Broker | Test Approach |
|--------|---------------|
| Kafka | Embedded Kafka, Testcontainers, or in-memory |
| RabbitMQ | Testcontainers, management API assertions |
| SQS | LocalStack, moto, or ElasticMQ |
| Redis Pub/Sub | Testcontainers or embedded Redis |

## Eventual Consistency Testing

In event-driven systems, state changes are not immediate:

- **Polling**: Repeatedly check until expected state appears (with timeout)
- **Await patterns**: Use async/await with configurable timeouts
- **Test hooks**: Inject synchronization points for deterministic testing
- **Event capture**: Collect published events and assert after processing

## Idempotency Testing

Events may be delivered more than once. Test that:

- Processing the same event twice produces the same result
- No duplicate side effects (double charges, duplicate records)
- Idempotency keys are stored and checked correctly
- Out-of-order delivery is handled gracefully

## Code Examples

### Python: Testing Event Publisher and Consumer

```python
import pytest
import json
from unittest.mock import AsyncMock
from dataclasses import dataclass, asdict
from datetime import datetime, timezone
from uuid import uuid4


@dataclass
class OrderCreatedEvent:
    event_id: str
    order_id: str
    product_id: str
    quantity: int
    correlation_id: str
    timestamp: str


class EventPublisher:
    def __init__(self, broker_client):
        self.broker = broker_client
        self.published: list[dict] = []

    async def publish(self, topic: str, event) -> None:
        payload = json.dumps(asdict(event))
        await self.broker.send(topic, payload)
        self.published.append({"topic": topic, "event": asdict(event)})


class OrderService:
    def __init__(self, publisher: EventPublisher):
        self.publisher = publisher

    async def create_order(self, product_id: str, quantity: int) -> str:
        order_id = f"ORD-{uuid4().hex[:8]}"
        event = OrderCreatedEvent(
            event_id=f"EVT-{uuid4().hex[:8]}",
            order_id=order_id,
            product_id=product_id,
            quantity=quantity,
            correlation_id=f"COR-{uuid4().hex[:8]}",
            timestamp=datetime.now(timezone.utc).isoformat(),
        )
        await self.publisher.publish("order.created", event)
        return order_id


class InventoryConsumer:
    def __init__(self, inventory_repo):
        self.inventory_repo = inventory_repo
        self.processed_events: set[str] = set()

    async def handle(self, raw_message: str) -> None:
        data = json.loads(raw_message)
        if data["event_id"] in self.processed_events:
            return  # Idempotency
        await self.inventory_repo.reserve(data["product_id"], data["quantity"])
        self.processed_events.add(data["event_id"])


class TestOrderEventPublisher:
    @pytest.fixture
    def publisher(self):
        return EventPublisher(AsyncMock())

    @pytest.mark.asyncio
    async def test_publishes_order_created(self, publisher):
        service = OrderService(publisher)
        order_id = await service.create_order("PROD-001", 3)

        assert len(publisher.published) == 1
        evt = publisher.published[0]
        assert evt["topic"] == "order.created"
        assert evt["event"]["product_id"] == "PROD-001"
        assert evt["event"]["order_id"] == order_id

    @pytest.mark.asyncio
    async def test_event_has_metadata(self, publisher):
        service = OrderService(publisher)
        await service.create_order("PROD-001", 1)

        evt = publisher.published[0]["event"]
        assert evt["event_id"].startswith("EVT-")
        assert evt["correlation_id"].startswith("COR-")


class TestInventoryConsumer:
    @pytest.mark.asyncio
    async def test_reserves_stock(self):
        repo = AsyncMock()
        consumer = InventoryConsumer(repo)
        msg = json.dumps({"event_id": "E1", "product_id": "P1", "quantity": 5})

        await consumer.handle(msg)
        repo.reserve.assert_called_once_with("P1", 5)

    @pytest.mark.asyncio
    async def test_idempotent_processing(self):
        repo = AsyncMock()
        consumer = InventoryConsumer(repo)
        msg = json.dumps({"event_id": "E1", "product_id": "P1", "quantity": 5})

        await consumer.handle(msg)
        await consumer.handle(msg)  # Duplicate
        repo.reserve.assert_called_once()
```

### JavaScript: Testing Event Publisher and Consumer

```javascript
const { EventEmitter } = require("events");

class EventBus {
  constructor() {
    this.emitter = new EventEmitter();
    this.published = [];
  }
  publish(topic, event) {
    this.published.push({ topic, event });
    this.emitter.emit(topic, event);
  }
  subscribe(topic, handler) { this.emitter.on(topic, handler); }
  waitForEvent(topic, timeout = 5000) {
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => reject(new Error("Timeout")), timeout);
      this.emitter.once(topic, (e) => { clearTimeout(timer); resolve(e); });
    });
  }
}

class OrderService {
  constructor(eventBus) { this.eventBus = eventBus; }
  createOrder(productId, quantity) {
    const orderId = `ORD-${Date.now()}`;
    this.eventBus.publish("order.created", {
      eventId: `EVT-${Date.now()}`, orderId, productId, quantity,
      correlationId: `COR-${Date.now()}`,
    });
    return orderId;
  }
}

class InventoryConsumer {
  constructor(eventBus, repo) {
    this.repo = repo;
    this.processed = new Set();
    eventBus.subscribe("order.created", (e) => this.handle(e));
  }
  async handle(event) {
    if (this.processed.has(event.eventId)) return;
    await this.repo.reserve(event.productId, event.quantity);
    this.processed.add(event.eventId);
  }
}

describe("Event-Driven Order System", () => {
  let eventBus;
  beforeEach(() => { eventBus = new EventBus(); });

  describe("Publisher", () => {
    test("emits order.created event", () => {
      const service = new OrderService(eventBus);
      const orderId = service.createOrder("PROD-001", 3);

      expect(eventBus.published).toHaveLength(1);
      expect(eventBus.published[0].topic).toBe("order.created");
      expect(eventBus.published[0].event.orderId).toBe(orderId);
      expect(eventBus.published[0].event.productId).toBe("PROD-001");
    });
  });

  describe("Consumer", () => {
    test("reserves stock on event", async () => {
      const repo = { reserve: jest.fn().mockResolvedValue(true) };
      new InventoryConsumer(eventBus, repo);
      eventBus.publish("order.created", {
        eventId: "E1", orderId: "O1", productId: "P1", quantity: 5,
      });
      await new Promise((r) => setTimeout(r, 10));
      expect(repo.reserve).toHaveBeenCalledWith("P1", 5);
    });

    test("is idempotent", async () => {
      const repo = { reserve: jest.fn().mockResolvedValue(true) };
      const consumer = new InventoryConsumer(eventBus, repo);
      const event = { eventId: "E1", productId: "P1", quantity: 2 };

      await consumer.handle(event);
      await consumer.handle(event);
      expect(repo.reserve).toHaveBeenCalledTimes(1);
    });
  });
});
```

### Java: Testing Event Publisher and Consumer

```java
package com.example.events;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.context.ApplicationEventPublisher;

import java.time.Instant;
import java.util.HashSet;
import java.util.Set;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

record OrderCreatedEvent(String eventId, String orderId, String productId,
                         int quantity, String correlationId, Instant timestamp) {}

interface InventoryRepository { boolean reserve(String productId, int quantity); }

class OrderService {
    private final ApplicationEventPublisher publisher;
    OrderService(ApplicationEventPublisher publisher) { this.publisher = publisher; }

    String createOrder(String productId, int quantity) {
        String orderId = "ORD-" + UUID.randomUUID().toString().substring(0, 8);
        var event = new OrderCreatedEvent(
            "EVT-" + UUID.randomUUID().toString().substring(0, 8),
            orderId, productId, quantity,
            "COR-" + UUID.randomUUID().toString().substring(0, 8), Instant.now());
        publisher.publishEvent(event);
        return orderId;
    }
}

class InventoryConsumer {
    private final InventoryRepository repo;
    private final Set<String> processed = new HashSet<>();
    InventoryConsumer(InventoryRepository repo) { this.repo = repo; }

    void handle(OrderCreatedEvent event) {
        if (processed.contains(event.eventId())) return;
        repo.reserve(event.productId(), event.quantity());
        processed.add(event.eventId());
    }
}

@ExtendWith(MockitoExtension.class)
class OrderServiceEventTest {
    @Mock ApplicationEventPublisher publisher;

    @Test
    void shouldPublishOrderCreatedEvent() {
        var service = new OrderService(publisher);
        String orderId = service.createOrder("PROD-001", 3);

        ArgumentCaptor<OrderCreatedEvent> captor = ArgumentCaptor.forClass(OrderCreatedEvent.class);
        verify(publisher).publishEvent(captor.capture());
        assertEquals(orderId, captor.getValue().orderId());
        assertEquals("PROD-001", captor.getValue().productId());
        assertEquals(3, captor.getValue().quantity());
    }
}

@ExtendWith(MockitoExtension.class)
class InventoryConsumerTest {
    @Mock InventoryRepository repo;

    @Test
    void shouldReserveStock() {
        var consumer = new InventoryConsumer(repo);
        var event = new OrderCreatedEvent("E1", "O1", "P1", 5, "C1", Instant.now());
        consumer.handle(event);
        verify(repo).reserve("P1", 5);
    }

    @Test
    void shouldBeIdempotent() {
        when(repo.reserve(anyString(), anyInt())).thenReturn(true);
        var consumer = new InventoryConsumer(repo);
        var event = new OrderCreatedEvent("E1", "O1", "P1", 2, "C1", Instant.now());
        consumer.handle(event);
        consumer.handle(event);
        verify(repo, times(1)).reserve(anyString(), anyInt());
    }
}
```

### C#: Testing Event Publisher and Consumer

```csharp
using Moq;
using Xunit;

namespace OrderSystem.Tests;

public record OrderCreatedEvent(string EventId, string OrderId, string ProductId,
    int Quantity, string CorrelationId, DateTime Timestamp);

public interface IEventBus
{
    Task PublishAsync<T>(string topic, T @event) where T : class;
    List<(string Topic, object Event)> Published { get; }
}

public class InMemoryEventBus : IEventBus
{
    public List<(string Topic, object Event)> Published { get; } = new();
    public Task PublishAsync<T>(string topic, T @event) where T : class
    {
        Published.Add((topic, @event));
        return Task.CompletedTask;
    }
}

public class OrderService
{
    private readonly IEventBus _bus;
    public OrderService(IEventBus bus) => _bus = bus;

    public async Task<string> CreateOrderAsync(string productId, int quantity)
    {
        var orderId = $"ORD-{Guid.NewGuid().ToString()[..8]}";
        var evt = new OrderCreatedEvent(
            $"EVT-{Guid.NewGuid().ToString()[..8]}", orderId,
            productId, quantity,
            $"COR-{Guid.NewGuid().ToString()[..8]}", DateTime.UtcNow);
        await _bus.PublishAsync("order.created", evt);
        return orderId;
    }
}

public interface IInventoryRepo { Task<bool> ReserveAsync(string productId, int qty); }

public class InventoryConsumer
{
    private readonly IInventoryRepo _repo;
    private readonly HashSet<string> _processed = new();
    public InventoryConsumer(IInventoryRepo repo) => _repo = repo;

    public async Task HandleAsync(OrderCreatedEvent evt)
    {
        if (_processed.Contains(evt.EventId)) return;
        await _repo.ReserveAsync(evt.ProductId, evt.Quantity);
        _processed.Add(evt.EventId);
    }
}

public class OrderServiceEventTests
{
    [Fact]
    public async Task CreateOrder_PublishesEvent()
    {
        var bus = new InMemoryEventBus();
        var service = new OrderService(bus);

        var orderId = await service.CreateOrderAsync("PROD-001", 3);

        Assert.Single(bus.Published);
        var (topic, evt) = bus.Published[0];
        var order = Assert.IsType<OrderCreatedEvent>(evt);
        Assert.Equal("order.created", topic);
        Assert.Equal(orderId, order.OrderId);
        Assert.Equal("PROD-001", order.ProductId);
    }
}

public class InventoryConsumerTests
{
    [Fact]
    public async Task Handle_ReservesStock()
    {
        var repo = new Mock<IInventoryRepo>();
        repo.Setup(r => r.ReserveAsync("P1", 5)).ReturnsAsync(true);
        var consumer = new InventoryConsumer(repo.Object);

        await consumer.HandleAsync(new OrderCreatedEvent("E1", "O1", "P1", 5, "C1", DateTime.UtcNow));

        repo.Verify(r => r.ReserveAsync("P1", 5), Times.Once);
    }

    [Fact]
    public async Task Handle_IsIdempotent()
    {
        var repo = new Mock<IInventoryRepo>();
        repo.Setup(r => r.ReserveAsync(It.IsAny<string>(), It.IsAny<int>())).ReturnsAsync(true);
        var consumer = new InventoryConsumer(repo.Object);
        var evt = new OrderCreatedEvent("E1", "O1", "P1", 2, "C1", DateTime.UtcNow);

        await consumer.HandleAsync(evt);
        await consumer.HandleAsync(evt);

        repo.Verify(r => r.ReserveAsync(It.IsAny<string>(), It.IsAny<int>()), Times.Once);
    }
}
```

## Best Practices

1. **Test events as contracts**: Event schemas are public APIs—test their structure
2. **Always test idempotency**: Assume every event will be delivered at least twice
3. **Use correlation IDs**: Trace event chains across services in tests
4. **Test failure paths**: Broker down, consumer crash, malformed events
5. **Avoid timing dependencies**: Use synchronization primitives, not `sleep()`
6. **Test event ordering**: Verify behavior when events arrive out of order
7. **Monitor in production**: Event-driven bugs often only manifest under load
