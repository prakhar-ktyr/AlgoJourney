---
title: "Microservices Patterns"
---

## Microservices Patterns

Microservices architecture structures an application as a collection of loosely coupled, independently deployable services. Each service owns its data and communicates with others through well-defined interfaces.

In this lesson, you will learn the key patterns that make microservices work in distributed systems — from decomposition strategies to communication, data management, migration, and testing.

---

## Why Microservices?

| Concern | Monolith | Microservices |
|---------|----------|---------------|
| Deployment | Single unit, all-or-nothing | Independent per service |
| Scaling | Scale entire app | Scale individual services |
| Technology | One stack | Polyglot (per service) |
| Team ownership | Shared codebase | Each team owns a service |
| Fault isolation | One bug can crash all | Failure contained to service |
| Complexity | In-process calls | Network calls, distributed state |

Microservices trade local complexity for operational complexity. They are not always the right choice — more on that at the end.

---

## Decomposition Patterns

Deciding how to split a monolith into services is the hardest design decision. Two dominant strategies exist.

### Decompose by Business Capability

A **business capability** is something the organization does to generate value.

| Business Capability | Service |
|---------------------|---------|
| Order Management | `order-service` |
| Inventory Tracking | `inventory-service` |
| Payment Processing | `payment-service` |
| Shipping & Delivery | `shipping-service` |
| Customer Support | `support-service` |

Each service maps directly to an organizational function and is owned by the team responsible for that capability.

### Decompose by Subdomain (DDD)

Domain-Driven Design identifies **bounded contexts** — areas where a particular model applies.

```
┌─────────────────────────────────────────────┐
│              E-Commerce Domain              │
├──────────────┬──────────────┬──────────────┤
│   Catalog    │   Ordering   │   Shipping   │
│  Context     │   Context    │   Context    │
│              │              │              │
│ Product      │ Order        │ Shipment     │
│ Category     │ LineItem     │ Carrier      │
│ Price        │ Payment      │ Tracking     │
└──────────────┴──────────────┴──────────────┘
```

Key DDD concepts for decomposition:

| Concept | Meaning |
|---------|---------|
| Bounded Context | Boundary within which a model is consistent |
| Ubiquitous Language | Shared vocabulary within a context |
| Context Map | How bounded contexts relate to each other |
| Anti-Corruption Layer | Translator between contexts |

**Rule of thumb:** If two pieces of data change together for the same business reason, they belong in the same service.

---

## Communication Patterns

Services must talk to each other. The two fundamental styles are synchronous and asynchronous.

### Synchronous Communication

The caller waits for a response before continuing.

#### REST (HTTP/JSON)

```javascript
// order-service calls inventory-service
const response = await fetch("http://inventory-service/api/items/42/reserve", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ quantity: 2 })
});

if (!response.ok) {
  throw new Error("Inventory reservation failed");
}
const reservation = await response.json();
```

**Pros:** Simple, widely understood, tooling-rich.  
**Cons:** Tight coupling, cascading failures, latency accumulation.

#### gRPC

```protobuf
// inventory.proto
service InventoryService {
  rpc ReserveItem (ReserveRequest) returns (ReserveResponse);
}

message ReserveRequest {
  string item_id = 1;
  int32 quantity = 2;
}

message ReserveResponse {
  string reservation_id = 1;
  bool success = 2;
}
```

**Pros:** Binary protocol (fast), strongly typed, streaming support, code generation.  
**Cons:** Less human-readable, requires proto management, browser support limited.

| Feature | REST | gRPC |
|---------|------|------|
| Protocol | HTTP/1.1 or 2 | HTTP/2 |
| Payload | JSON (text) | Protobuf (binary) |
| Contract | OpenAPI (optional) | .proto (required) |
| Streaming | Limited | Bidirectional |
| Browser support | Native | Via grpc-web proxy |
| Performance | Moderate | High |

### Asynchronous Communication (Events)

The caller publishes a message and does not wait for a response.

```javascript
// order-service publishes an event
await messageBroker.publish("order.created", {
  orderId: "ord-123",
  customerId: "cust-456",
  items: [{ itemId: "42", quantity: 2 }],
  timestamp: new Date().toISOString()
});

// inventory-service subscribes
messageBroker.subscribe("order.created", async (event) => {
  await reserveItems(event.orderId, event.items);
  await messageBroker.publish("inventory.reserved", {
    orderId: event.orderId,
    status: "reserved"
  });
});
```

**Pros:** Loose coupling, resilience (broker buffers), natural scalability.  
**Cons:** Eventual consistency, harder debugging, message ordering challenges.

| Broker | Use Case |
|--------|----------|
| Apache Kafka | High-throughput event streaming, log-based |
| RabbitMQ | Traditional message queue, routing flexibility |
| Amazon SQS/SNS | Managed, serverless-friendly |
| NATS | Lightweight, cloud-native |

---

## Data Management Patterns

### Database Per Service

Each microservice owns its private database. No other service may access it directly.

```
┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│ Order Service│    │Inventory Svc │    │Payment Svc   │
│              │    │              │    │              │
│  ┌────────┐  │    │  ┌────────┐  │    │  ┌────────┐  │
│  │PostgreSQL│ │    │  │ MongoDB │  │    │  │  MySQL │  │
│  └────────┘  │    │  └────────┘  │    │  └────────┘  │
└──────────────┘    └──────────────┘    └──────────────┘
```

**Benefits:**
- Services are truly independent
- Each picks the best database for its workload
- Schema changes don't ripple across services

**Challenges:**
- Cross-service queries are hard
- Distributed transactions are complex
- Data duplication is common

### Shared Database (Anti-Pattern)

Multiple services read/write the same database tables.

```
┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│ Order Service│  │Inventory Svc │  │Payment Svc   │
└──────┬───────┘  └──────┬───────┘  └──────┬───────┘
       │                 │                 │
       └─────────────────┼─────────────────┘
                         │
                  ┌──────┴──────┐
                  │  Shared DB  │
                  └─────────────┘
```

**Why it's an anti-pattern:**
- Tight coupling through the schema
- One service's migration breaks others
- No independent deployability
- Scaling bottleneck

---

## API Composition Pattern

When a client needs data from multiple services, an **API Composer** aggregates results.

```javascript
// api-gateway or BFF (Backend for Frontend)
app.get("/api/order-summary/:orderId", async (req, res) => {
  const { orderId } = req.params;

  // Fan out to multiple services in parallel
  const [order, payment, shipping] = await Promise.all([
    orderService.getOrder(orderId),
    paymentService.getPaymentStatus(orderId),
    shippingService.getTrackingInfo(orderId)
  ]);

  // Compose response
  res.json({
    orderId: order.id,
    items: order.items,
    total: order.total,
    paymentStatus: payment.status,
    trackingNumber: shipping.trackingNumber,
    estimatedDelivery: shipping.eta
  });
});
```

**Trade-offs:**
- Simple to implement
- Increases availability risk (any downstream failure = partial failure)
- Can lead to high latency if services are slow
- Use circuit breakers and timeouts to protect the composer

---

## CQRS (Command Query Responsibility Segregation)

Separate the **write model** (commands) from the **read model** (queries). Each is optimized for its workload.

```
        Commands                          Queries
  ┌────────────────┐              ┌────────────────┐
  │  Write Service │              │  Read Service  │
  │                │              │                │
  │  ┌──────────┐  │   events    │  ┌──────────┐  │
  │  │ Write DB │──┼─────────────┼─▶│ Read DB  │  │
  │  │(normalized)│ │              │  │(denormalized)│
  │  └──────────┘  │              │  └──────────┘  │
  └────────────────┘              └────────────────┘
```

```javascript
// Command side — validates and writes
async function placeOrder(command) {
  const order = new Order(command);
  await order.validate();
  await writeDb.orders.insert(order);
  await eventBus.publish("OrderPlaced", order.toEvent());
}

// Query side — reads from denormalized view
async function getOrderDashboard(customerId) {
  // Pre-joined, optimized for reads
  return readDb.orderDashboard.find({ customerId });
}

// Event handler updates read model
eventBus.subscribe("OrderPlaced", async (event) => {
  await readDb.orderDashboard.upsert({
    orderId: event.orderId,
    customerName: event.customerName,
    total: event.total,
    status: "placed"
  });
});
```

| Aspect | Without CQRS | With CQRS |
|--------|-------------|-----------|
| Read/Write scaling | Same database | Independent scaling |
| Query complexity | Joins at read time | Pre-computed views |
| Consistency | Strong | Eventually consistent |
| Complexity | Low | Higher (two models) |

**Use CQRS when:** Read and write workloads differ dramatically, or complex queries would slow writes.

---

## Strangler Fig Pattern (Migration)

Incrementally migrate from a monolith to microservices by routing traffic slice-by-slice.

```
Phase 1: All traffic → Monolith
Phase 2: /orders/* → Order Service, rest → Monolith
Phase 3: /orders/*, /payments/* → Microservices, rest → Monolith
Phase 4: All traffic → Microservices (monolith retired)
```

```nginx
# nginx routing during migration
upstream monolith {
  server monolith:8080;
}
upstream order_service {
  server order-service:3000;
}

server {
  # Migrated routes
  location /api/orders {
    proxy_pass http://order_service;
  }

  # Everything else still goes to monolith
  location / {
    proxy_pass http://monolith;
  }
}
```

**Key principles:**
1. Never rewrite from scratch — migrate incrementally
2. Both old and new systems coexist during transition
3. Rollback is simple — just change the routing rule
4. Named after the strangler fig tree that grows around its host

---

## Sidecar Pattern

Deploy a helper process alongside your service to handle cross-cutting concerns.

```
┌─────────────────────────────────────┐
│            Pod / Host               │
│                                     │
│  ┌─────────────┐  ┌─────────────┐  │
│  │   Service   │  │   Sidecar   │  │
│  │  (business  │◀─▶│  (logging,  │  │
│  │   logic)    │  │  proxy, TLS)│  │
│  └─────────────┘  └─────────────┘  │
│                                     │
└─────────────────────────────────────┘
```

Common sidecar responsibilities:

| Concern | Example Sidecar |
|---------|-----------------|
| Service mesh proxy | Envoy, Linkerd-proxy |
| Log collection | Fluentd, Filebeat |
| Configuration | Consul agent |
| Monitoring | Prometheus exporter |
| Security | OAuth2 proxy |

**Benefits:** Language-agnostic, separate lifecycle, reusable across services.

---

## Ambassador Pattern

A specialized sidecar that acts as an out-of-process proxy for remote service communication.

```javascript
// Without ambassador — retry/circuit-breaking logic in every service
async function callPaymentService(data) {
  let retries = 3;
  while (retries > 0) {
    try {
      return await fetch("http://payment-service/charge", { ... });
    } catch (err) {
      retries--;
      await sleep(1000 * (4 - retries));
    }
  }
  throw new Error("Payment service unavailable");
}

// With ambassador — service calls localhost, ambassador handles resilience
async function callPaymentService(data) {
  // Ambassador at localhost:9000 handles retries, circuit breaking, TLS
  return await fetch("http://localhost:9000/payment-service/charge", { ... });
}
```

The ambassador handles: retries, circuit breaking, timeouts, TLS termination, load balancing, and observability — outside your application code.

---

## Anti-Corruption Layer (ACL)

A translation layer that prevents one service's model from leaking into another.

```javascript
// Anti-Corruption Layer between new Order Service and legacy ERP
class ERPAntiCorruptionLayer {
  constructor(erpClient) {
    this.erp = erpClient;
  }

  // Translate from our clean domain model to ERP's messy API
  async createOrder(order) {
    const erpPayload = {
      CUST_NO: order.customerId,         // ERP uses CUST_NO
      ORD_DT: this.formatDate(order.date), // ERP date format: YYYYMMDD
      LINES: order.items.map(item => ({
        PROD_CD: item.sku,               // ERP calls it PROD_CD
        QTY: item.quantity,
        PRC: item.price * 100            // ERP stores cents
      }))
    };
    const result = await this.erp.submitOrder(erpPayload);
    // Translate response back to our model
    return { erpOrderId: result.ORD_ID, status: this.mapStatus(result.STS) };
  }

  mapStatus(erpStatus) {
    const mapping = { "A": "accepted", "R": "rejected", "P": "pending" };
    return mapping[erpStatus] || "unknown";
  }

  formatDate(date) {
    return date.toISOString().slice(0, 10).replace(/-/g, "");
  }
}
```

**Use an ACL when:** Integrating with legacy systems, third-party APIs, or any system whose model you don't want polluting your domain.

---

## Testing Microservices

### Contract Testing

Verify that a consumer and provider agree on the API contract without deploying both.

```javascript
// Consumer-side contract (using Pact)
const { Pact } = require("@pact-foundation/pact");

describe("Order Service → Inventory Service contract", () => {
  const provider = new Pact({
    consumer: "OrderService",
    provider: "InventoryService",
    port: 1234
  });

  it("can reserve an item", async () => {
    await provider.addInteraction({
      state: "item 42 has stock",
      uponReceiving: "a reserve request",
      withRequest: {
        method: "POST",
        path: "/api/items/42/reserve",
        body: { quantity: 2 }
      },
      willRespondWith: {
        status: 200,
        body: { reservationId: like("res-001"), success: true }
      }
    });

    // Run your actual client code against the mock
    const result = await inventoryClient.reserve("42", 2);
    expect(result.success).toBe(true);
  });
});
```

### Integration Testing

Test real interactions between services using test containers.

```javascript
// Integration test with Testcontainers
import { GenericContainer } from "testcontainers";

describe("Order flow integration", () => {
  let kafka, orderService, inventoryService;

  beforeAll(async () => {
    kafka = await new GenericContainer("confluentinc/cp-kafka")
      .withExposedPorts(9092)
      .start();

    // Start services pointing to test Kafka
    orderService = await startOrderService({ kafkaPort: kafka.getMappedPort(9092) });
    inventoryService = await startInventoryService({ kafkaPort: kafka.getMappedPort(9092) });
  });

  it("placing an order reserves inventory", async () => {
    const res = await fetch(`${orderService.url}/api/orders`, {
      method: "POST",
      body: JSON.stringify({ items: [{ id: "42", qty: 1 }] })
    });
    expect(res.status).toBe(201);

    // Wait for async event processing
    await waitFor(() =>
      expect(getReservations("42")).resolves.toHaveLength(1)
    );
  });

  afterAll(async () => {
    await kafka.stop();
  });
});
```

| Testing Level | Scope | Speed | Confidence |
|---------------|-------|-------|------------|
| Unit | Single function/class | Fast | Low (mocked deps) |
| Contract | Consumer ↔ Provider API | Fast | Medium |
| Integration | Multiple services + infra | Slow | High |
| End-to-End | Full system | Slowest | Highest |

---

## Service Mesh Overview

A **service mesh** is a dedicated infrastructure layer for managing service-to-service communication.

```
┌────────────────────────────────────────────────────┐
│                  Control Plane                      │
│  (Configuration, Policies, Certificates, Metrics)  │
└───────────────────────┬────────────────────────────┘
                        │ pushes config
        ┌───────────────┼───────────────┐
        ▼               ▼               ▼
┌──────────────┐ ┌──────────────┐ ┌──────────────┐
│  Service A   │ │  Service B   │ │  Service C   │
│  ┌────────┐  │ │  ┌────────┐  │ │  ┌────────┐  │
│  │ Proxy  │◀─┼─┼─▶│ Proxy  │◀─┼─┼─▶│ Proxy  │  │
│  │(Envoy) │  │ │  │(Envoy) │  │ │  │(Envoy) │  │
│  └────────┘  │ │  └────────┘  │ │  └────────┘  │
└──────────────┘ └──────────────┘ └──────────────┘
         Data Plane (sidecar proxies)
```

| Feature | What It Does |
|---------|-------------|
| mTLS | Automatic encryption between services |
| Traffic management | Canary deploys, traffic splitting, retries |
| Observability | Distributed tracing, metrics, access logs |
| Resilience | Circuit breaking, rate limiting, timeouts |
| Authorization | Service-to-service access policies |

Popular service meshes: **Istio**, **Linkerd**, **Consul Connect**.

---

## When a Monolith Is Better

Microservices add significant complexity. Prefer a monolith when:

| Situation | Why Monolith Wins |
|-----------|-------------------|
| Small team (< 8 people) | Communication overhead outweighs benefits |
| Early-stage product | Domain boundaries are unclear |
| Simple domain | No need for independent scaling |
| Tight latency requirements | Network hops add latency |
| No DevOps maturity | Microservices need CI/CD, containers, orchestration |

**Start with a well-structured monolith.** Extract services only when you have clear bounded contexts and a team large enough to own them independently.

The best architecture is the one your team can operate reliably.

---

## Summary

| Pattern | Purpose |
|---------|---------|
| Decompose by business capability | Align services to organizational functions |
| Decompose by subdomain (DDD) | Align services to bounded contexts |
| Database per service | Data autonomy and independent deployment |
| API Composition | Aggregate data from multiple services |
| CQRS | Separate read and write models for optimization |
| Strangler Fig | Incremental monolith-to-microservices migration |
| Sidecar | Cross-cutting concerns in a co-located process |
| Ambassador | Outbound proxy for resilience and observability |
| Anti-Corruption Layer | Isolate from external/legacy models |
| Service Mesh | Infrastructure-level communication management |

---

## Exercises

1. You have a monolithic e-commerce app. Identify 4 bounded contexts and draw a context map showing their relationships.

2. Design the event flow for an order placement: which events are published, which services subscribe, and what happens if the inventory reservation fails?

3. Given this scenario — Service A calls B, which calls C, which calls D — what resilience patterns would you apply at each hop? What happens if D is down for 30 seconds?

4. Write the CQRS event handlers for a "Product Review" feature: the command side stores reviews, the query side maintains an average rating per product.

5. Your team is migrating a monolith's user authentication to a new service. Describe how you would apply the Strangler Fig pattern, including routing rules and rollback strategy.

6. Compare contract testing vs. integration testing for a checkout flow involving 3 services. When would you prefer one over the other?
