---
title: "Distributed Transactions and Sagas"
---

# Distributed Transactions and Sagas

In a monolithic application, a single database transaction can span multiple operations atomically. In a microservices architecture, data is distributed across services, each with its own database. The **Saga pattern** solves the problem of maintaining data consistency across these distributed services without relying on distributed locks.

---

## The Problem: Distributed Transactions

When a business operation spans multiple services, we need a way to ensure all-or-nothing semantics:

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│ Order Service│    │Payment Service│   │Inventory Svc│
│  (Order DB) │    │ (Payment DB) │   │(Inventory DB)│
└─────────────┘    └─────────────┘    └─────────────┘
       │                  │                   │
       └──────────────────┴───────────────────┘
              All must succeed or all must fail
```

### Why Traditional Transactions Don't Work

| Aspect | Monolith (ACID) | Microservices |
|--------|-----------------|---------------|
| Database | Single shared DB | Multiple DBs |
| Transaction scope | Local | Cross-service |
| Locking | Row/table locks | Not feasible |
| Rollback | Built-in | Must be explicit |
| Coordinator | DB engine | Custom logic |
| Latency | Low | High (network) |

---

## Two-Phase Commit (2PC)

The traditional approach to distributed transactions is **2PC**:

```
        Coordinator
       /     |     \
      /      |      \
Phase 1: PREPARE
    Participant A → "Yes, I can commit"
    Participant B → "Yes, I can commit"
    Participant C → "Yes, I can commit"

Phase 2: COMMIT
    Participant A → Committed
    Participant B → Committed
    Participant C → Committed
```

### Problems with 2PC

1. **Synchronous blocking** — all participants hold locks until commit/abort
2. **Single point of failure** — coordinator crash leaves participants in doubt
3. **Reduced availability** — any participant failure aborts the entire transaction
4. **Performance** — network round-trips and lock holding degrade throughput
5. **Not suitable for microservices** — tight coupling, long-held resources

---

## The Saga Pattern

A **Saga** is a sequence of local transactions where each transaction updates data within a single service. If one step fails, **compensating transactions** undo the preceding steps.

```
T1 → T2 → T3 → T4    (happy path)

T1 → T2 → T3 (fails) → C2 → C1    (compensation)
```

Where:
- `T1, T2, T3, T4` are local transactions (steps)
- `C1, C2` are compensating transactions (rollbacks)

### Key Principles

1. Each step is a **local ACID transaction** within one service
2. Steps execute **sequentially** (or with defined ordering)
3. Each step has a corresponding **compensating transaction**
4. If a step fails, compensations run in **reverse order**
5. Compensating transactions must be **idempotent** and **retryable**

---

## Choreography-Based Saga

In a choreography-based saga, each service publishes events that trigger the next step. There is no central coordinator.

```
Order       Payment      Inventory     Shipping
Service     Service      Service       Service
  │            │             │            │
  │ OrderCreated            │            │
  ├──────────►│             │            │
  │            │ PaymentCompleted        │
  │            ├────────────►│            │
  │            │             │ StockReserved
  │            │             ├───────────►│
  │            │             │            │ ShipmentScheduled
  │◄───────────┼─────────────┼────────────┤
  │ OrderConfirmed          │            │
```

### Implementation Example

```javascript
// Order Service - publishes OrderCreated event
class OrderService {
  async createOrder(orderData) {
    const order = await Order.create({
      ...orderData,
      status: "PENDING",
    });

    await eventBus.publish("OrderCreated", {
      orderId: order.id,
      customerId: order.customerId,
      items: order.items,
      totalAmount: order.totalAmount,
    });

    return order;
  }

  // Compensation: cancel order
  async cancelOrder(orderId, reason) {
    await Order.updateOne(
      { _id: orderId },
      { status: "CANCELLED", cancellationReason: reason }
    );

    await eventBus.publish("OrderCancelled", { orderId, reason });
  }
}
```

```javascript
// Payment Service - listens for OrderCreated
class PaymentService {
  constructor(eventBus) {
    eventBus.subscribe("OrderCreated", this.handleOrderCreated.bind(this));
    eventBus.subscribe("StockReservationFailed", this.refundPayment.bind(this));
  }

  async handleOrderCreated(event) {
    try {
      const payment = await Payment.create({
        orderId: event.orderId,
        amount: event.totalAmount,
        status: "COMPLETED",
      });

      await eventBus.publish("PaymentCompleted", {
        orderId: event.orderId,
        paymentId: payment.id,
      });
    } catch (error) {
      await eventBus.publish("PaymentFailed", {
        orderId: event.orderId,
        reason: error.message,
      });
    }
  }

  // Compensation: refund payment
  async refundPayment(event) {
    await Payment.updateOne(
      { orderId: event.orderId },
      { status: "REFUNDED" }
    );

    await eventBus.publish("PaymentRefunded", {
      orderId: event.orderId,
    });
  }
}
```

### Pros and Cons of Choreography

| Pros | Cons |
|------|------|
| Simple, no coordinator needed | Hard to understand the overall flow |
| Loose coupling between services | Cyclic dependencies possible |
| Easy to add new steps | Difficult to test end-to-end |
| No single point of failure | Hard to track saga state |

---

## Orchestration-Based Saga

In an orchestration-based saga, a **central coordinator** (orchestrator) tells each participant what to do and when.

```
                ┌──────────────┐
                │  Saga        │
                │ Orchestrator │
                └──────┬───────┘
                       │
       ┌───────────────┼───────────────┐
       │               │               │
       ▼               ▼               ▼
┌────────────┐  ┌────────────┐  ┌────────────┐
│   Order    │  │  Payment   │  │ Inventory  │
│  Service   │  │  Service   │  │  Service   │
└────────────┘  └────────────┘  └────────────┘
```

### Implementation Example

```javascript
// Saga Orchestrator - Order Processing Saga
class OrderProcessingSaga {
  constructor(orderService, paymentService, inventoryService, shippingService) {
    this.orderService = orderService;
    this.paymentService = paymentService;
    this.inventoryService = inventoryService;
    this.shippingService = shippingService;
  }

  async execute(orderData) {
    const sagaLog = [];

    try {
      // Step 1: Create Order
      const order = await this.orderService.createOrder(orderData);
      sagaLog.push({ step: "createOrder", data: order });

      // Step 2: Process Payment
      const payment = await this.paymentService.processPayment({
        orderId: order.id,
        amount: order.totalAmount,
      });
      sagaLog.push({ step: "processPayment", data: payment });

      // Step 3: Reserve Inventory
      const reservation = await this.inventoryService.reserveStock({
        orderId: order.id,
        items: order.items,
      });
      sagaLog.push({ step: "reserveStock", data: reservation });

      // Step 4: Schedule Shipping
      const shipment = await this.shippingService.scheduleShipment({
        orderId: order.id,
        address: order.shippingAddress,
      });
      sagaLog.push({ step: "scheduleShipment", data: shipment });

      // All steps succeeded
      await this.orderService.confirmOrder(order.id);
      return { success: true, orderId: order.id };

    } catch (error) {
      // Compensate in reverse order
      await this.compensate(sagaLog);
      return { success: false, error: error.message };
    }
  }

  async compensate(sagaLog) {
    const compensations = {
      scheduleShipment: (data) =>
        this.shippingService.cancelShipment(data.id),
      reserveStock: (data) =>
        this.inventoryService.releaseStock(data.orderId),
      processPayment: (data) =>
        this.paymentService.refundPayment(data.id),
      createOrder: (data) =>
        this.orderService.cancelOrder(data.id, "Saga compensation"),
    };

    // Execute compensations in reverse order
    for (const entry of sagaLog.reverse()) {
      try {
        const compensate = compensations[entry.step];
        if (compensate) {
          await compensate(entry.data);
        }
      } catch (compError) {
        // Log compensation failure - may need manual intervention
        console.error(`Compensation failed for ${entry.step}:`, compError);
      }
    }
  }
}
```

### Pros and Cons of Orchestration

| Pros | Cons |
|------|------|
| Clear visibility of saga flow | Coordinator is a single point of failure |
| Easy to add/modify steps | Risk of centralizing too much logic |
| Simple to test and debug | Tighter coupling to orchestrator |
| Saga state is centrally tracked | Additional service to maintain |

---

## Saga vs 2PC Comparison

| Feature | Saga | 2PC |
|---------|------|-----|
| Consistency | Eventual | Strong |
| Availability | High | Lower |
| Isolation | Weak (ACD) | Full ACID |
| Performance | Better | Worse (blocking) |
| Failure handling | Compensating txns | Rollback |
| Scalability | Highly scalable | Limited |
| Complexity | Business logic | Infrastructure |
| Suitable for | Microservices | Single cluster |

---

## Saga Isolation Problems

Since sagas lack the "I" (Isolation) in ACID, concurrent sagas can interfere with each other:

### 1. Lost Updates

```
Saga A: Read balance = $100
Saga B: Read balance = $100
Saga A: Set balance = $100 - $30 = $70
Saga B: Set balance = $100 - $50 = $50   ← Lost A's update!
```

### 2. Dirty Reads

```
Saga A: Step 1 succeeds (writes data)
Saga B: Reads A's uncommitted data
Saga A: Step 2 fails → compensates Step 1
Saga B: Now has stale/invalid data
```

### 3. Non-Repeatable Reads

A saga reads different values during its execution because another saga modified the data in between.

---

## Countermeasures for Isolation Problems

| Countermeasure | Description | Example |
|----------------|-------------|---------|
| **Semantic Lock** | Flag records as "in-progress" | `order.status = PENDING` |
| **Commutative Updates** | Use operations that work regardless of order | `balance += amount` |
| **Pessimistic View** | Reorder steps to minimize risk | Process payment last |
| **Reread Value** | Verify data hasn't changed before writing | Optimistic locking |
| **Version File** | Record operations and reorder them | Event log |
| **By Value** | Use business-level risk assessment | Low-risk: saga; high-risk: 2PC |

### Semantic Lock Example

```javascript
async function reserveStock(orderId, items) {
  for (const item of items) {
    const result = await Inventory.updateOne(
      {
        productId: item.productId,
        availableQty: { $gte: item.quantity },
        lockedBy: null,  // Semantic lock check
      },
      {
        $inc: { availableQty: -item.quantity },
        $set: { lockedBy: orderId, lockedAt: new Date() },
      }
    );

    if (result.modifiedCount === 0) {
      throw new Error(`Cannot reserve ${item.productId}`);
    }
  }
}
```

---

## Implementing Sagas with Frameworks

### Temporal (formerly Cadence)

```javascript
// Temporal Workflow Definition
import { proxyActivities, sleep } from "@temporalio/workflow";

const { createOrder, processPayment, reserveStock, scheduleShipment,
        cancelOrder, refundPayment, releaseStock } = proxyActivities({
  startToCloseTimeout: "30s",
  retry: { maximumAttempts: 3 },
});

export async function orderSaga(orderData) {
  let orderId, paymentId, reservationId;

  try {
    orderId = await createOrder(orderData);
    paymentId = await processPayment(orderId, orderData.amount);
    reservationId = await reserveStock(orderId, orderData.items);
    await scheduleShipment(orderId, orderData.address);
  } catch (error) {
    // Temporal handles compensation automatically with proper config
    if (reservationId) await releaseStock(reservationId);
    if (paymentId) await refundPayment(paymentId);
    if (orderId) await cancelOrder(orderId);
    throw error;
  }
}
```

### Eventuate Tram (Java)

```java
public class CreateOrderSaga implements SimpleSaga<CreateOrderSagaData> {

  private final SagaDefinition<CreateOrderSagaData> sagaDefinition =
    step()
      .invokeLocal(this::createOrder)
      .withCompensation(this::rejectOrder)
    .step()
      .invokeParticipant(this::reserveCredit)
      .withCompensation(this::releaseCredit)
    .step()
      .invokeParticipant(this::reserveStock)
      .withCompensation(this::releaseStock)
    .step()
      .invokeLocal(this::approveOrder)
    .build();

  @Override
  public SagaDefinition<CreateOrderSagaData> getSagaDefinition() {
    return sagaDefinition;
  }
}
```

### Framework Comparison

| Framework | Language | Approach | Persistence | Best For |
|-----------|----------|----------|-------------|----------|
| Temporal | Multi-lang | Orchestration | Built-in | Complex workflows |
| Eventuate | Java | Both | Event store | Java microservices |
| Axon | Java/Kotlin | Both | Event store | CQRS + Event Sourcing |
| MassTransit | .NET | Both | Multiple | .NET microservices |
| NServiceBus | .NET | Orchestration | Multiple | Enterprise .NET |

---

## Practical Design Considerations

### 1. Idempotency

Every saga step and compensation must be idempotent:

```javascript
async function processPayment(orderId, amount) {
  // Use orderId as idempotency key
  const existing = await Payment.findOne({ orderId, status: "COMPLETED" });
  if (existing) return existing; // Already processed

  return await Payment.create({
    orderId,
    amount,
    status: "COMPLETED",
    processedAt: new Date(),
  });
}
```

### 2. Saga State Machine

```
STARTED → PAYMENT_PENDING → PAYMENT_DONE → STOCK_RESERVED →
SHIPMENT_SCHEDULED → COMPLETED

At any failure point:
→ COMPENSATING → COMPENSATED → FAILED
```

### 3. Timeout and Deadlines

```javascript
const sagaConfig = {
  steps: [
    { name: "payment", timeout: 30000, retries: 3 },
    { name: "inventory", timeout: 10000, retries: 2 },
    { name: "shipping", timeout: 60000, retries: 1 },
  ],
  globalTimeout: 120000, // 2 minutes for entire saga
};
```

### 4. Observability

Track saga execution with correlation IDs:

```javascript
const sagaContext = {
  sagaId: uuid(),
  correlationId: req.headers["x-correlation-id"],
  startedAt: Date.now(),
  steps: [],
};

// Log each step
sagaContext.steps.push({
  name: "processPayment",
  status: "completed",
  duration: 245,
  timestamp: Date.now(),
});
```

---

## Exercises

### Exercise 1: Design a Saga

Design a saga for a **travel booking** system that books a flight, hotel, and car rental. Define:
- The sequence of steps
- Compensating transactions for each step
- What happens if the car rental fails after flight and hotel are booked

### Exercise 2: Implement Compensation

Given this partial saga, implement the missing compensation logic:

```javascript
class TripBookingSaga {
  async execute(tripData) {
    const steps = [];
    try {
      steps.push(await this.bookFlight(tripData));
      steps.push(await this.bookHotel(tripData));
      steps.push(await this.bookCar(tripData));
      return { success: true };
    } catch (error) {
      // TODO: Implement compensation
    }
  }
}
```

### Exercise 3: Choreography vs Orchestration

For each scenario, decide whether choreography or orchestration is more appropriate and explain why:
1. A 3-step saga with simple linear flow
2. A 10-step saga with conditional branching
3. A saga where steps can execute in parallel

---

## Summary

| Concept | Key Takeaway |
|---------|--------------|
| Saga | Sequence of local transactions with compensations |
| Choreography | Event-driven, decentralized, loosely coupled |
| Orchestration | Centralized coordinator, clear flow visibility |
| Compensation | Undo semantics for each step (must be idempotent) |
| Isolation | Sagas lack ACID isolation; use countermeasures |
| Frameworks | Temporal, Eventuate, Axon automate saga management |

---

## Further Reading

- "Microservices Patterns" by Chris Richardson — Chapter 4: Sagas
- Temporal.io documentation
- "Designing Data-Intensive Applications" by Martin Kleppmann — Chapter 9
- Saga pattern on microservices.io
