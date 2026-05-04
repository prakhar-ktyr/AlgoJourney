---
title: "Microservices Architecture"
---

# Microservices Architecture

In this lesson, you will learn how to design, build, and operate **microservices** — an architectural style that structures an application as a collection of loosely coupled, independently deployable services. You'll understand when to use microservices, which patterns to apply, and what challenges to expect.

---

## Monolith vs Microservices

### Monolithic Architecture

A **monolith** is a single, unified application where all functionality lives in one codebase and deploys as one unit.

```
┌──────────────────────────────────────┐
│            Monolith App              │
│  ┌──────┐ ┌───────┐ ┌────────────┐  │
│  │ Auth │ │ Orders│ │ Payments   │  │
│  │      │ │       │ │            │  │
│  └──┬───┘ └──┬────┘ └─────┬──────┘  │
│     └────────┼─────────────┘         │
│         ┌────▼─────┐                 │
│         │ Shared   │                 │
│         │ Database │                 │
│         └──────────┘                 │
└──────────────────────────────────────┘
```

### Microservices Architecture

A **microservices** application is composed of small, independent services that communicate over a network.

```
┌──────────┐    ┌──────────┐    ┌──────────────┐
│   Auth   │    │  Orders  │    │  Payments    │
│ Service  │◄──►│ Service  │◄──►│  Service     │
│   :3001  │    │   :3002  │    │    :3003     │
│  ┌────┐  │    │  ┌────┐  │    │  ┌────────┐  │
│  │ DB │  │    │  │ DB │  │    │  │   DB   │  │
│  └────┘  │    │  └────┘  │    │  └────────┘  │
└──────────┘    └──────────┘    └──────────────┘
```

### Side-by-Side Comparison

| Aspect | Monolith | Microservices |
|---|---|---|
| **Deployment** | All or nothing | Independent per service |
| **Scaling** | Scale entire app | Scale individual services |
| **Technology** | One tech stack | Different stack per service |
| **Database** | Single shared DB | Database per service |
| **Team structure** | One large team | Small, autonomous teams |
| **Complexity** | Simple to start | Complex infrastructure |
| **Failure isolation** | One bug can crash everything | Failures are contained |
| **Development speed** | Slows with size | Stays fast per team |
| **Testing** | Easier end-to-end | Harder integration testing |
| **Debugging** | Stack traces | Distributed tracing |

> **Important:** Monoliths are not bad! Many successful companies run monoliths. Microservices add complexity — choose them only when the benefits outweigh the costs.

---

## Microservices Principles

### 1. Single Responsibility

Each service does **one thing well** and owns a specific business capability.

```
✅ Good                          ❌ Bad
┌──────────────┐                 ┌──────────────────────────┐
│ User Service │                 │ User + Order + Payment   │
│ - Register   │                 │   Service                │
│ - Login      │                 │ - Register, Login        │
│ - Profile    │                 │ - Create Order           │
└──────────────┘                 │ - Process Payment        │
                                 └──────────────────────────┘
```

### 2. Decentralized Data Management

Each service owns its data. No shared databases.

```
✅ Each service has its own DB

  Auth Service ──► PostgreSQL
  Orders Service ──► MongoDB
  Search Service ──► Elasticsearch
  Cache Service ──► Redis

❌ All services share one DB

  Auth, Orders, Search ──► Single PostgreSQL
```

**Why?** Shared databases create tight coupling. If the Orders table schema changes, the Auth service might break.

### 3. Smart Endpoints, Dumb Pipes

Services expose well-defined APIs (smart endpoints). Communication infrastructure (the pipes) should be simple — basic HTTP or simple message queues, not complex ESB middleware.

```
✅ Smart endpoints                ❌ Dumb endpoints, smart pipes
┌─────────┐  HTTP   ┌─────────┐  ┌─────────┐         ┌─────────┐
│ Service │ ──────► │ Service │  │ Service │──► ESB ──►│ Service │
│  (API)  │         │  (API)  │  │ (thin)  │  (heavy) │ (thin)  │
└─────────┘         └─────────┘  └─────────┘  logic   └─────────┘
```

### 4. Design for Failure

Assume any service can fail at any time. Build resilience into every interaction.

### 5. Decentralized Governance

Teams choose their own tools, languages, and frameworks based on what's best for their service.

### 6. Evolutionary Design

Start with a monolith, extract services as boundaries become clear. Don't start with 50 microservices on day one.

---

## Communication Patterns

Services need to talk to each other. There are two fundamental approaches:

### Synchronous Communication

The caller **waits** for a response. Best for queries and operations that need immediate results.

#### REST (HTTP/JSON)

The most common approach. Simple, widely understood.

```javascript
// Order Service calls User Service
const response = await fetch("http://user-service:3001/api/users/123");
const user = await response.json();
```

```
Order Service ──── GET /api/users/123 ────► User Service
                ◄── { "id": 123, "name": "Alice" } ──
```

**Pros:** Simple, widely supported, human-readable
**Cons:** Tight coupling, cascading failures, latency

#### gRPC (Protocol Buffers)

High-performance RPC framework by Google. Uses binary serialization (Protocol Buffers) and HTTP/2.

```protobuf
// user.proto - Define the service contract
syntax = "proto3";

service UserService {
  rpc GetUser (UserRequest) returns (UserResponse);
  rpc ListUsers (ListRequest) returns (stream UserResponse);
}

message UserRequest {
  int32 id = 1;
}

message UserResponse {
  int32 id = 1;
  string name = 2;
  string email = 3;
}
```

**Pros:** 5-10x faster than JSON/REST, strong typing, streaming support
**Cons:** Not human-readable, more complex setup, browser support limited

#### REST vs gRPC

| Feature | REST | gRPC |
|---|---|---|
| **Protocol** | HTTP/1.1 or HTTP/2 | HTTP/2 |
| **Format** | JSON (text) | Protocol Buffers (binary) |
| **Speed** | Good | Excellent (5-10x faster) |
| **Streaming** | Limited | Bidirectional streaming |
| **Browser support** | Native | Requires grpc-web proxy |
| **Contract** | OpenAPI/Swagger (optional) | `.proto` files (required) |
| **Best for** | Public APIs, CRUD | Internal service-to-service |

### Asynchronous Communication

The caller sends a message and **doesn't wait** for a response. Best for events and operations that don't need immediate results.

#### Message Queues

A producer sends messages to a queue; a consumer picks them up.

```
Producer ──► [ Queue ] ──► Consumer

Order Service ──► [ order-created ] ──► Email Service
                                   ──► Inventory Service
                                   ──► Analytics Service
```

Popular message brokers:

| Broker | Best For |
|---|---|
| **RabbitMQ** | Traditional messaging, routing patterns |
| **Amazon SQS** | Simple managed queue, AWS ecosystem |
| **Redis Streams** | Lightweight, already using Redis |

#### Event Streaming

Events are published to a **log** that multiple consumers can read independently.

```
Producer ──► [ Event Stream / Topic ] ──► Consumer A
                                     ──► Consumer B
                                     ──► Consumer C
```

Popular platforms:

| Platform | Best For |
|---|---|
| **Apache Kafka** | High-throughput, event sourcing, real-time |
| **Amazon Kinesis** | AWS-native event streaming |
| **Apache Pulsar** | Multi-tenancy, geo-replication |

### Choosing Sync vs Async

| Criteria | Synchronous | Asynchronous |
|---|---|---|
| Need immediate response? | ✅ Yes | ❌ No |
| Failure tolerance | Low — cascading failures | High — decoupled |
| Coupling | Tight | Loose |
| Complexity | Lower | Higher (eventual consistency) |
| Examples | Get user profile, validate payment | Send email, update analytics, process order |

---

## Microservices Patterns

### 1. API Gateway

A single entry point that routes requests to the appropriate services.

```
                    ┌───────────────┐
  Client ──────────►│  API Gateway  │
                    │               │
                    │  /users/*  ──────► User Service
                    │  /orders/* ──────► Order Service
                    │  /payments/*─────► Payment Service
                    └───────────────┘
```

**Responsibilities:**
- Request routing
- Authentication & authorization
- Rate limiting
- Response aggregation
- SSL termination
- Request/response transformation

**Popular implementations:**
- **Kong** (open-source)
- **AWS API Gateway** (managed)
- **NGINX** (reverse proxy)
- **Envoy** (cloud-native)

### 2. Service Discovery

How services find each other's network addresses.

```
                    ┌──────────────────┐
                    │ Service Registry │
                    │                  │
  Order Service ───►│ user-service:    │
  "Where is the     │   192.168.1.10   │
   user service?"   │   192.168.1.11   │
                    │                  │
                    │ order-service:   │
                    │   192.168.1.20   │
                    └──────────────────┘
```

| Approach | How It Works | Example |
|---|---|---|
| **Client-side** | Client queries registry, picks instance | Netflix Eureka |
| **Server-side** | Load balancer queries registry | AWS ALB, Kubernetes Services |
| **DNS-based** | Services register DNS records | Kubernetes CoreDNS, Consul |

> In **Kubernetes**, service discovery is built in — you access services by name (e.g., `http://user-service:3001`).

### 3. Circuit Breaker

Prevents cascading failures when a downstream service is unhealthy.

```
States:
┌────────┐     failure threshold     ┌──────┐
│ CLOSED │ ─────────────────────────►│ OPEN │
│(normal)│                           │(fail)│
└────┬───┘                           └──┬───┘
     ▲                                  │
     │        ┌────────────┐            │
     │        │ HALF-OPEN  │◄───────────┘
     └────────│ (testing)  │    timeout
   success    └────────────┘
```

```javascript
// Pseudo-code for circuit breaker
class CircuitBreaker {
  constructor(options) {
    this.failureThreshold = options.failureThreshold || 5;
    this.resetTimeout = options.resetTimeout || 30000;
    this.state = "CLOSED";
    this.failureCount = 0;
  }

  async call(fn) {
    if (this.state === "OPEN") {
      throw new Error("Circuit is OPEN — service unavailable");
    }

    try {
      const result = await fn();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }

  onSuccess() {
    this.failureCount = 0;
    this.state = "CLOSED";
  }

  onFailure() {
    this.failureCount++;
    if (this.failureCount >= this.failureThreshold) {
      this.state = "OPEN";
      setTimeout(() => { this.state = "HALF-OPEN"; }, this.resetTimeout);
    }
  }
}
```

### 4. Saga Pattern

Manages distributed transactions across multiple services using a sequence of local transactions.

```
Order Saga (Choreography):

  Order Service         Payment Service       Inventory Service
       │                      │                       │
       │── order.created ────►│                       │
       │                      │── payment.success ───►│
       │                      │                       │── inventory.reserved
       │◄────────────────── saga.completed ───────────│
       │                      │                       │
  If payment fails:           │                       │
       │◄── payment.failed ───│                       │
       │── order.cancelled                            │
```

**Two approaches:**

| Approach | How It Works | Best For |
|---|---|---|
| **Choreography** | Services react to events from other services | Simple workflows (3-4 steps) |
| **Orchestration** | A central coordinator directs the workflow | Complex workflows (5+ steps) |

### 5. CQRS (Command Query Responsibility Segregation)

Separate the **read** and **write** models for a service.

```
                  ┌──────────────────┐
   Write ────────►│  Command Model   │──► Write DB (PostgreSQL)
  (Commands)      │  (Normalized)    │         │
                  └──────────────────┘         │ Sync
                                               ▼
                  ┌──────────────────┐    Read DB
   Read ─────────►│  Query Model     │◄── (Elasticsearch,
  (Queries)       │  (Denormalized)  │     Redis, etc.)
                  └──────────────────┘
```

**When to use:** High read-to-write ratio, complex querying needs, different scaling for reads vs writes.

### 6. Event Sourcing

Store **events** instead of current state. The current state is derived by replaying events.

```
Traditional:                    Event Sourcing:
┌─────────────────┐            ┌──────────────────────────────┐
│ Account         │            │ Event Log                    │
│ balance: $500   │            │ 1. AccountCreated($0)        │
│                 │            │ 2. MoneyDeposited($1000)     │
└─────────────────┘            │ 3. MoneyWithdrawn($300)      │
                               │ 4. MoneyWithdrawn($200)      │
  (We only know                │                              │
   the final state)            │ Current balance: $500        │
                               │ (replay all events)          │
                               └──────────────────────────────┘
```

**Benefits:** Complete audit trail, time-travel debugging, rebuild read models from events

**Drawbacks:** Complexity, eventual consistency, event schema evolution

---

## Challenges of Microservices

### 1. Distributed Transactions

With multiple databases, you can't use a simple `BEGIN...COMMIT`.

```
❌ This won't work across services:

BEGIN TRANSACTION
  INSERT INTO orders ...    -- Order Service DB
  UPDATE inventory ...      -- Inventory Service DB
  INSERT INTO payments ...  -- Payment Service DB
COMMIT
```

**Solutions:** Saga pattern, eventual consistency, compensating transactions.

### 2. Debugging Distributed Systems

A single user request may touch 10+ services. Finding where it failed is challenging.

```
User Request → API Gateway → Auth → Orders → Inventory → Payment → Email
                                         ↓
                                   Where did it fail? 🤔
```

**Solution:** Distributed tracing with correlation IDs (see Observability section below).

### 3. Testing Complexity

| Test Type | Monolith | Microservices |
|---|---|---|
| **Unit tests** | Same | Same |
| **Integration tests** | Easy (one process) | Hard (multiple services) |
| **End-to-end tests** | Simple | Very complex |
| **Contract tests** | N/A | Essential |

**Contract testing** ensures services agree on API shapes:

```javascript
// Consumer contract test (Order Service)
// "I expect User Service to return { id, name, email }"
describe("User Service Contract", () => {
  it("should return user with expected fields", async () => {
    const user = await userClient.getUser(1);
    expect(user).toHaveProperty("id");
    expect(user).toHaveProperty("name");
    expect(user).toHaveProperty("email");
  });
});
```

Tools: **Pact**, **Spring Cloud Contract**

### 4. Data Consistency

With database-per-service, you lose immediate consistency.

```
Order placed → Payment processed → Inventory updated
                   (each step might fail)
                   (data is eventually consistent)
```

**Strategies:**
- Accept **eventual consistency** for most operations
- Use the **Saga pattern** for multi-service transactions
- Use **event sourcing** for auditability
- Use **idempotent operations** to handle retries safely

### 5. Network Reliability

Networks fail. Services timeout. Messages get lost.

**Defensive coding patterns:**

```javascript
// Retry with exponential backoff
async function callWithRetry(fn, maxRetries = 3) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      if (attempt === maxRetries) throw error;
      const delay = Math.pow(2, attempt) * 100; // 200, 400, 800ms
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }
}

// Timeout wrapper
async function callWithTimeout(fn, timeoutMs = 5000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fn(controller.signal);
  } finally {
    clearTimeout(timer);
  }
}
```

---

## Observability

Observability is the ability to understand the internal state of a system by examining its outputs. The **three pillars** are:

### 1. Distributed Tracing

Track a single request as it flows through multiple services.

```
Trace ID: abc-123
├── API Gateway       [  0ms - 250ms ]
│   ├── Auth Service  [ 10ms -  50ms ]
│   ├── Order Service [ 55ms - 200ms ]
│   │   ├── DB Query  [ 60ms - 100ms ]
│   │   └── Payment   [105ms - 190ms ]
│   └── Email Service [205ms - 240ms ] (async)
```

**How it works:**

```javascript
// Each request carries a trace ID
app.use((req, res, next) => {
  req.traceId = req.headers["x-trace-id"] || generateTraceId();
  // Pass trace ID to downstream calls
  res.setHeader("x-trace-id", req.traceId);
  next();
});
```

**Tools:** Jaeger, Zipkin, AWS X-Ray, Datadog APM, OpenTelemetry

### 2. Centralized Logging

Aggregate logs from all services into one searchable system.

```
┌──────────────┐
│ Service A    │──┐
│ Service B    │──┼──► Log Aggregator ──► Search & Dashboard
│ Service C    │──┘    (ELK / Loki)      (Kibana / Grafana)
└──────────────┘
```

**Structured logging** (JSON format) is essential:

```javascript
// ✅ Structured log
logger.info({
  event: "order.created",
  orderId: "ord-456",
  userId: "usr-123",
  amount: 99.99,
  traceId: "abc-123",
  timestamp: "2026-05-04T10:30:00Z",
});

// ❌ Unstructured log
console.log("Order created for user 123, amount $99.99");
```

**Tools:**
- **ELK Stack** (Elasticsearch, Logstash, Kibana)
- **Grafana Loki** (lightweight alternative)
- **AWS CloudWatch Logs**
- **Datadog Logs**

### 3. Metrics

Numerical measurements collected over time.

```
Key metrics to track:
┌───────────────────────────────────────────┐
│ RED Method (for services)                 │
│  • Rate:   Requests per second            │
│  • Errors: Error rate (%)                 │
│  • Duration: Response time (p50, p95, p99)│
├───────────────────────────────────────────┤
│ USE Method (for infrastructure)           │
│  • Utilization: % of resource used        │
│  • Saturation: Amount of queued work      │
│  • Errors: Error count                    │
└───────────────────────────────────────────┘
```

**Tools:** Prometheus + Grafana, Datadog, AWS CloudWatch, New Relic

### Observability Stack Example

```yaml
# docker-compose.yml for local observability
services:
  app:
    build: .
    ports:
      - "3000:3000"

  prometheus:
    image: prom/prometheus
    volumes:
      - ./prometheus.yml:/etc/prometheus/prometheus.yml
    ports:
      - "9090:9090"

  grafana:
    image: grafana/grafana
    ports:
      - "3001:3000"
    environment:
      - GF_SECURITY_ADMIN_PASSWORD=admin

  jaeger:
    image: jaegertracing/all-in-one
    ports:
      - "16686:16686"   # UI
      - "4318:4318"     # OpenTelemetry
```

---

## When Microservices Are Overkill

Microservices are **not always** the right choice. They add significant operational complexity.

### You Probably DON'T Need Microservices If:

| Signal | Why |
|---|---|
| Small team (< 5 developers) | Coordination overhead outweighs benefits |
| Simple domain | One service handles it fine |
| Early-stage startup | You don't know your domain boundaries yet |
| Low traffic | Scaling individual services isn't needed |
| No DevOps maturity | CI/CD, monitoring, containerization must be in place first |

### You Might Need Microservices If:

| Signal | Why |
|---|---|
| Large team (20+ developers) | Independent teams deploy independently |
| Different scaling needs | Some services need 10x more resources |
| Multiple technology needs | Python for ML, Go for performance, Node for APIs |
| High availability required | Isolate failures to individual services |
| Complex, well-understood domain | Clear bounded contexts exist |

### The Sensible Path

```
Start here ──► Modular Monolith ──► Extract services ──► Microservices
                                    as needed
```

A **modular monolith** gives you most of the design benefits (clear boundaries, single responsibility) without the operational complexity:

```
┌────────────────────────────────────────────┐
│           Modular Monolith                 │
│  ┌──────────┐ ┌──────────┐ ┌────────────┐ │
│  │  Auth    │ │  Orders  │ │  Payments  │ │
│  │  Module  │ │  Module  │ │  Module    │ │
│  │  (clear  │ │  (clear  │ │  (clear    │ │
│  │   API)   │ │   API)   │ │   API)     │ │
│  └──────────┘ └──────────┘ └────────────┘ │
│         Single deployment unit             │
└────────────────────────────────────────────┘
```

---

## Hands-On Exercise

### Task: Design a Microservices Architecture

Design an e-commerce system with the following requirements:

1. **Identify services:** Break the system into microservices. Consider:
   - User management (registration, authentication)
   - Product catalog (browsing, search)
   - Shopping cart
   - Order processing
   - Payment processing
   - Notification (email, SMS)
   - Inventory management

2. **For each service, decide:**

| Decision | Options |
|---|---|
| Database type | PostgreSQL, MongoDB, Redis, Elasticsearch |
| Communication | REST, gRPC, Message Queue |
| Scaling needs | Low, Medium, High |

3. **Draw the architecture:**

```
                        ┌──────────────┐
        Client ────────►│ API Gateway  │
                        └──────┬───────┘
                  ┌────────────┼────────────┐
                  ▼            ▼            ▼
           ┌──────────┐ ┌──────────┐ ┌──────────┐
           │  Users   │ │ Products │ │  Cart    │
           └──────────┘ └──────────┘ └────┬─────┘
                                          │
                              ┌───────────▼───────────┐
                              │      Orders           │
                              └───────────┬───────────┘
                         ┌────────────────┼────────────┐
                         ▼                ▼            ▼
                  ┌──────────┐    ┌──────────┐  ┌──────────┐
                  │ Payment  │    │Inventory │  │  Notify  │
                  └──────────┘    └──────────┘  └──────────┘
```

4. **Answer these questions:**
   - Which communications should be synchronous? Which asynchronous?
   - Where would you apply the Circuit Breaker pattern?
   - Which services need the Saga pattern for distributed transactions?
   - What happens if the Payment service is down during checkout?

---

## Quick Reference

### Pattern Decision Matrix

| Pattern | Use When | Avoid When |
|---|---|---|
| **API Gateway** | Multiple clients, cross-cutting concerns | Single service, simple routing |
| **Circuit Breaker** | Unreliable downstream services | Internal, reliable calls |
| **Saga** | Multi-service transactions | Single-service operations |
| **CQRS** | High read-to-write ratio, complex queries | Simple CRUD apps |
| **Event Sourcing** | Audit trails, temporal queries needed | Simple state management |
| **Service Discovery** | Dynamic environments, auto-scaling | Static, small deployments |

### Communication Decision Tree

```
Need immediate response?
├── Yes → Synchronous
│   ├── Public API? → REST
│   └── Internal, high perf? → gRPC
└── No → Asynchronous
    ├── One consumer? → Message Queue
    └── Multiple consumers? → Event Streaming
```

---

## Key Takeaways

| Concept | Summary |
|---|---|
| **Microservices** | Small, independent services each owning a business capability |
| **Single responsibility** | One service = one domain area, one database |
| **Sync vs Async** | REST/gRPC for queries; message queues/events for workflows |
| **API Gateway** | Single entry point for routing, auth, rate limiting |
| **Circuit Breaker** | Fail fast when a downstream service is unhealthy |
| **Saga Pattern** | Manage distributed transactions via choreography or orchestration |
| **CQRS** | Separate read and write models for performance |
| **Observability** | Tracing + logging + metrics = understanding distributed systems |
| **Start simple** | Begin with a modular monolith; extract services as needed |
| **Not always right** | Microservices add complexity — choose them deliberately |

---

## What's Next?

In the next lesson, you'll explore **Serverless Computing** — a cloud model where you run code without managing any infrastructure, including how serverless and microservices complement each other.
