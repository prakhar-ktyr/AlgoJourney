---
title: "RESTful APIs and gRPC"
---

# RESTful APIs and gRPC

Communication between services is the backbone of any distributed system. **REST** and **gRPC** are two dominant paradigms for building service-to-service APIs. Understanding their design philosophies, trade-offs, and ideal use cases is essential for architecting reliable systems.

---

## REST Principles for Distributed Systems

**REST** (Representational State Transfer) is an architectural style defined by Roy Fielding in 2000. It leverages HTTP semantics to model interactions with resources.

### Core Constraints

| Constraint | Description |
|---|---|
| **Client-Server** | Separation of concerns between UI and data storage |
| **Stateless** | Each request contains all information needed to process it |
| **Cacheable** | Responses must declare themselves cacheable or non-cacheable |
| **Uniform Interface** | Standardised way to interact with resources |
| **Layered System** | Client cannot tell if it is connected directly to the server |
| **Code on Demand** | (Optional) Server can extend client functionality |

### Uniform Interface Sub-Constraints

1. **Resource identification** — URIs identify resources (`/orders/42`).
2. **Manipulation through representations** — JSON/XML payloads represent state.
3. **Self-descriptive messages** — Headers carry metadata (content type, caching).
4. **HATEOAS** — Responses include links to related actions.

### HTTP Methods Mapping

| Method | Operation | Idempotent | Safe |
|---|---|---|---|
| `GET` | Read a resource | Yes | Yes |
| `POST` | Create a resource | No | No |
| `PUT` | Replace a resource | Yes | No |
| `PATCH` | Partially update a resource | No* | No |
| `DELETE` | Remove a resource | Yes | No |

> \* `PATCH` can be made idempotent depending on the patch format.

### Example: RESTful Order Service

```http
GET /api/orders/42 HTTP/1.1
Host: orders.example.com
Accept: application/json
Authorization: Bearer eyJhbGciOi...
```

Response:

```json
{
  "id": 42,
  "status": "shipped",
  "items": [
    { "sku": "WIDGET-01", "qty": 3, "price": 9.99 }
  ],
  "total": 29.97,
  "_links": {
    "self": { "href": "/api/orders/42" },
    "cancel": { "href": "/api/orders/42/cancel", "method": "POST" },
    "customer": { "href": "/api/customers/7" }
  }
}
```

### REST Best Practices in Distributed Systems

```text
✅ Use nouns for resources        → /orders, /users/5
✅ Version your API               → /v1/orders
✅ Return proper status codes     → 201 Created, 404 Not Found
✅ Support pagination             → ?page=2&limit=20
✅ Use idempotency keys           → Idempotency-Key: abc-123
✅ Implement rate limiting        → 429 Too Many Requests
❌ Do not use verbs in URLs       → /getOrder ← wrong
❌ Do not ignore caching headers  → ETag, Cache-Control
```

### Status Codes for Distributed APIs

| Code | Meaning | When to Use |
|---|---|---|
| `200` | OK | Successful GET/PUT/PATCH |
| `201` | Created | Successful POST |
| `202` | Accepted | Async operation queued |
| `204` | No Content | Successful DELETE |
| `400` | Bad Request | Validation error |
| `401` | Unauthorized | Missing/invalid credentials |
| `404` | Not Found | Resource does not exist |
| `409` | Conflict | Concurrent modification |
| `429` | Too Many Requests | Rate limit exceeded |
| `500` | Internal Server Error | Unexpected server failure |
| `503` | Service Unavailable | Downstream dependency down |

---

## gRPC: Protocol Buffers and Streaming

**gRPC** (Google Remote Procedure Call) is a high-performance RPC framework that uses HTTP/2 and Protocol Buffers (protobuf) for serialisation.

### How gRPC Works

```text
┌──────────┐   HTTP/2 + Protobuf   ┌──────────┐
│  Client   │ ◄──────────────────► │  Server   │
│  (Stub)   │   Binary frames      │ (Service) │
└──────────┘                       └──────────┘
```

1. Define service and messages in a `.proto` file.
2. Generate client stubs and server skeletons with `protoc`.
3. Client calls methods on the stub as if they were local.
4. gRPC handles serialisation, transport, and error propagation.

### Protocol Buffers

Protocol Buffers are a language-neutral, platform-neutral mechanism for serialising structured data.

```protobuf
syntax = "proto3";

package ecommerce;

// Message definitions
message Order {
  int32 id = 1;
  string status = 2;
  repeated OrderItem items = 3;
  double total = 4;
  google.protobuf.Timestamp created_at = 5;
}

message OrderItem {
  string sku = 1;
  int32 quantity = 2;
  double price = 3;
}

message GetOrderRequest {
  int32 order_id = 1;
}

message ListOrdersRequest {
  int32 customer_id = 1;
  int32 page_size = 2;
  string page_token = 3;
}

message ListOrdersResponse {
  repeated Order orders = 1;
  string next_page_token = 2;
}
```

### Protobuf Field Rules

| Rule | Syntax | Description |
|---|---|---|
| Singular | `string name = 1;` | Zero or one value (default) |
| Repeated | `repeated Item items = 3;` | Zero or more values (list) |
| Map | `map<string, int32> tags = 4;` | Key-value pairs |
| Oneof | `oneof payload { A a = 1; B b = 2; }` | Exactly one of the fields |
| Optional | `optional string note = 5;` | Explicit presence tracking |

### Defining a gRPC Service

```protobuf
service OrderService {
  // Unary RPC
  rpc GetOrder(GetOrderRequest) returns (Order);

  // Server streaming
  rpc WatchOrderStatus(GetOrderRequest) returns (stream OrderStatusUpdate);

  // Client streaming
  rpc UploadOrdersBatch(stream Order) returns (BatchResult);

  // Bidirectional streaming
  rpc OrderChat(stream ChatMessage) returns (stream ChatMessage);
}
```

### gRPC Streaming Modes

| Mode | Client | Server | Use Case |
|---|---|---|---|
| **Unary** | 1 request | 1 response | Simple CRUD operations |
| **Server streaming** | 1 request | N responses | Real-time feeds, log tailing |
| **Client streaming** | N requests | 1 response | File upload, batch ingestion |
| **Bidirectional** | N requests | N responses | Chat, multiplayer games |

#### Server Streaming Example (Go)

```go
func (s *server) WatchOrderStatus(
    req *pb.GetOrderRequest,
    stream pb.OrderService_WatchOrderStatusServer,
) error {
    orderID := req.GetOrderId()

    for {
        status, err := s.repo.GetStatus(orderID)
        if err != nil {
            return status.Errorf(codes.Internal, "failed: %v", err)
        }

        if err := stream.Send(&pb.OrderStatusUpdate{
            OrderId: orderID,
            Status:  status,
        }); err != nil {
            return err
        }

        time.Sleep(2 * time.Second)
    }
}
```

#### Client Streaming Example (Python)

```python
def UploadOrdersBatch(self, request_iterator, context):
    count = 0
    for order in request_iterator:
        self.repo.save(order)
        count += 1

    return pb2.BatchResult(
        processed=count,
        status="OK"
    )
```

### gRPC Error Handling

gRPC uses canonical status codes similar to HTTP but with clearer semantics:

| gRPC Code | HTTP Equiv. | Meaning |
|---|---|---|
| `OK` | 200 | Success |
| `INVALID_ARGUMENT` | 400 | Client sent bad data |
| `NOT_FOUND` | 404 | Resource does not exist |
| `ALREADY_EXISTS` | 409 | Duplicate creation |
| `PERMISSION_DENIED` | 403 | Auth succeeded but not allowed |
| `UNAUTHENTICATED` | 401 | Missing or invalid credentials |
| `RESOURCE_EXHAUSTED` | 429 | Quota or rate limit hit |
| `UNAVAILABLE` | 503 | Transient failure, retry |
| `DEADLINE_EXCEEDED` | 504 | Timeout exceeded |
| `INTERNAL` | 500 | Unexpected server error |

```go
// Returning a rich gRPC error
import "google.golang.org/grpc/status"

func (s *server) GetOrder(ctx context.Context, req *pb.GetOrderRequest) (*pb.Order, error) {
    order, err := s.repo.Find(req.GetOrderId())
    if err == ErrNotFound {
        return nil, status.Errorf(codes.NotFound,
            "order %d not found", req.GetOrderId())
    }
    if err != nil {
        return nil, status.Errorf(codes.Internal,
            "internal error: %v", err)
    }
    return order, nil
}
```

---

## REST vs gRPC Comparison

| Aspect | REST | gRPC |
|---|---|---|
| **Protocol** | HTTP/1.1 or HTTP/2 | HTTP/2 only |
| **Data format** | JSON (text) | Protobuf (binary) |
| **Contract** | OpenAPI / Swagger (optional) | `.proto` file (required) |
| **Code generation** | Optional (many tools) | Built-in (`protoc`) |
| **Browser support** | Native | Requires gRPC-Web proxy |
| **Streaming** | SSE, WebSocket (separate) | Native (4 modes) |
| **Performance** | Good | Excellent (2-10× faster) |
| **Payload size** | Larger (text + keys) | Smaller (binary + no keys) |
| **Human readability** | Easy (JSON in browser) | Hard (binary) |
| **Tooling** | curl, Postman, browser | grpcurl, BloomRPC |
| **Learning curve** | Low | Medium |
| **Ecosystem** | Ubiquitous | Growing rapidly |

### Serialisation Comparison

```text
JSON (REST):
{"id":42,"status":"shipped","total":29.97}
→ 43 bytes (text, self-describing)

Protobuf (gRPC):
08 2a 12 07 73 68 69 70 70 65 64 21 ...
→ 19 bytes (binary, schema-dependent)

Savings: ~56% smaller payload
```

### Latency Comparison

```text
┌──────────────────────────────────────────────┐
│        Average Latency (microseconds)        │
├──────────────┬───────────┬───────────────────┤
│ Payload Size │   REST    │      gRPC         │
├──────────────┼───────────┼───────────────────┤
│ Small (1 KB) │   850 μs  │   320 μs          │
│ Medium (10K) │  1200 μs  │   450 μs          │
│ Large (1 MB) │  8500 μs  │  2100 μs          │
└──────────────┴───────────┴───────────────────┘

* Benchmarks vary by hardware, network, and implementation
```

---

## API Gateway Pattern

An **API Gateway** sits between clients and backend services, routing requests and applying cross-cutting concerns.

```text
                    ┌─────────────────┐
  Mobile App ──────►│                 │──── REST ────► User Service
                    │                 │
  Web App ─────────►│   API Gateway   │──── gRPC ────► Order Service
                    │                 │
  3rd Party ───────►│                 │──── gRPC ────► Inventory Service
                    └─────────────────┘
                      │  │  │  │  │
                    Auth Rate TLS Log Route
                         Limit
```

### Gateway Responsibilities

| Concern | Description |
|---|---|
| **Routing** | Map external URLs to internal services |
| **Protocol translation** | REST ↔ gRPC conversion |
| **Authentication** | Validate tokens before forwarding |
| **Rate limiting** | Protect backends from overload |
| **Load balancing** | Distribute traffic across instances |
| **Response aggregation** | Combine multiple service calls |
| **Caching** | Cache frequent read responses |
| **Circuit breaking** | Stop forwarding to failing services |

### Gateway Configuration Example (Envoy)

```yaml
static_resources:
  listeners:
    - name: http_listener
      address:
        socket_address:
          address: 0.0.0.0
          port_value: 8080
      filter_chains:
        - filters:
            - name: envoy.filters.network.http_connection_manager
              typed_config:
                "@type": type.googleapis.com/envoy.extensions.filters
                route_config:
                  virtual_hosts:
                    - name: backend
                      domains: ["*"]
                      routes:
                        - match:
                            prefix: "/api/orders"
                          route:
                            cluster: order_service
                        - match:
                            prefix: "/api/users"
                          route:
                            cluster: user_service
  clusters:
    - name: order_service
      type: STRICT_DNS
      lb_policy: ROUND_ROBIN
      typed_extension_protocol_options:
        envoy.extensions.upstreams.http.v3.HttpProtocolOptions:
          explicit_http_config:
            http2_protocol_options: {}   # gRPC uses HTTP/2
      load_assignment:
        cluster_name: order_service
        endpoints:
          - lb_endpoints:
              - endpoint:
                  address:
                    socket_address:
                      address: order-svc
                      port_value: 50051
```

### BFF (Backend for Frontend) Variant

```text
┌────────────┐     ┌─────────────┐
│  Mobile BFF │◄───│  Mobile App  │
│  (REST)     │    └─────────────┘
└──────┬──────┘
       │ gRPC
       ▼
┌──────────────┐
│  Microservices│
└──────────────┘
       ▲
       │ gRPC
┌──────┴──────┐
│   Web BFF   │◄───┌─────────────┐
│  (GraphQL)  │    │   Web App    │
└─────────────┘    └─────────────┘
```

Each frontend gets a tailored API layer while backend services communicate via gRPC.

---

## When to Use Each

### Choose REST When

- **Public-facing APIs** — Broad client support, easy to consume.
- **Browser clients** — Native HTTP, no proxy needed.
- **Simple CRUD** — Resource-oriented operations map cleanly.
- **Third-party integrations** — Universally understood.
- **Rapid prototyping** — Minimal setup, curl-friendly.

### Choose gRPC When

- **Service-to-service** — Internal microservice communication.
- **High throughput** — Latency-sensitive, high-volume traffic.
- **Streaming data** — Real-time updates, event streams.
- **Polyglot systems** — Auto-generated clients for 10+ languages.
- **Strict contracts** — Schema evolution with backward compatibility.

### Decision Matrix

```text
                        Low Latency Needed?
                         /              \
                       Yes               No
                       /                  \
              Internal Only?         Public API?
               /        \            /        \
             Yes         No        Yes         No
             /            \        /            \
          gRPC          gRPC     REST        REST or
        (pure)        + REST   (pure)        gRPC
                      gateway               (evaluate)
```

### Hybrid Architecture Example

```text
┌─────────────────────────────────────────────────┐
│                  System Design                   │
├─────────────────────────────────────────────────┤
│                                                  │
│  External ──REST──► API Gateway ──gRPC──► Auth   │
│                         │                        │
│                         ├──gRPC──► Orders         │
│                         │                        │
│                         ├──gRPC──► Inventory      │
│                         │                        │
│                         └──gRPC──► Payments       │
│                                                  │
│  Admin UI ──REST──► Admin BFF ──gRPC──► Orders   │
│                                                  │
│  Mobile ──REST──► Mobile BFF ──gRPC──► Auth      │
│                                                  │
└─────────────────────────────────────────────────┘

External clients speak REST.
Internal services speak gRPC.
Gateways translate between the two.
```

---

## Exercises

### Exercise 1: Design a REST API

Design RESTful endpoints for a **distributed file storage** service. Define:

- Resource URIs for files and folders
- HTTP methods for each operation
- Request/response bodies (JSON)
- Appropriate status codes
- Pagination for listing files

<details>
<summary>Solution</summary>

```text
Resources:
  /api/v1/folders
  /api/v1/folders/{id}
  /api/v1/folders/{id}/files
  /api/v1/files/{id}
  /api/v1/files/{id}/content

Operations:
  POST   /api/v1/folders              → 201 Created
  GET    /api/v1/folders/{id}         → 200 OK
  DELETE /api/v1/folders/{id}         → 204 No Content

  POST   /api/v1/folders/{id}/files   → 201 Created
  GET    /api/v1/files/{id}           → 200 OK (metadata)
  GET    /api/v1/files/{id}/content   → 200 OK (binary)
  PUT    /api/v1/files/{id}           → 200 OK
  DELETE /api/v1/files/{id}           → 204 No Content

  GET    /api/v1/folders/{id}/files?page=1&limit=50
         → 200 OK with Link header for pagination

Headers:
  Idempotency-Key: <uuid>  (for POST)
  If-Match: <etag>         (for PUT/DELETE)
  Content-Range: bytes     (for large file uploads)
```

</details>

### Exercise 2: Write a Protobuf Definition

Define a `.proto` file for a **distributed task queue** with:

- Task message (id, type, payload, priority, status)
- Service with submit, get status, and stream results RPCs

<details>
<summary>Solution</summary>

```protobuf
syntax = "proto3";
package taskqueue;

import "google/protobuf/timestamp.proto";
import "google/protobuf/any.proto";

enum Priority {
  LOW = 0;
  MEDIUM = 1;
  HIGH = 2;
  CRITICAL = 3;
}

enum TaskStatus {
  QUEUED = 0;
  RUNNING = 1;
  COMPLETED = 2;
  FAILED = 3;
}

message Task {
  string id = 1;
  string type = 2;
  bytes payload = 3;
  Priority priority = 4;
  TaskStatus status = 5;
  google.protobuf.Timestamp created_at = 6;
  string result = 7;
}

message SubmitTaskRequest {
  string type = 1;
  bytes payload = 2;
  Priority priority = 3;
}

message SubmitTaskResponse {
  string task_id = 1;
  int32 queue_position = 2;
}

message GetTaskStatusRequest {
  string task_id = 1;
}

message TaskResult {
  string task_id = 1;
  TaskStatus status = 2;
  bytes output = 3;
  string error = 4;
}

service TaskQueueService {
  rpc SubmitTask(SubmitTaskRequest) returns (SubmitTaskResponse);
  rpc GetTaskStatus(GetTaskStatusRequest) returns (Task);
  rpc StreamResults(GetTaskStatusRequest) returns (stream TaskResult);
  rpc SubmitBatch(stream SubmitTaskRequest) returns (SubmitTaskResponse);
}
```

</details>

### Exercise 3: REST vs gRPC Decision

For each scenario, decide whether to use REST, gRPC, or both. Justify your choice.

| # | Scenario |
|---|---|
| 1 | Public e-commerce product catalogue API |
| 2 | Real-time stock price feed between services |
| 3 | Mobile app talking to its backend |
| 4 | Inter-service communication in a payment system |
| 5 | Webhook delivery to third-party integrators |

<details>
<summary>Solution</summary>

| # | Choice | Reasoning |
|---|---|---|
| 1 | **REST** | Public API, browser-friendly, cacheable product data |
| 2 | **gRPC** | Server streaming, low latency, internal service |
| 3 | **REST** (external) + **gRPC** (internal) | Mobile uses REST via BFF; BFF talks gRPC to backends |
| 4 | **gRPC** | Internal, strict contracts, low latency, idempotency at app level |
| 5 | **REST** | Webhooks are HTTP POST callbacks; third parties expect REST |

</details>

---

## Summary

| Concept | Key Takeaway |
|---|---|
| **REST** | Resource-oriented, HTTP-native, universally supported |
| **gRPC** | RPC-oriented, binary-efficient, streaming-native |
| **Protocol Buffers** | Compact binary serialisation with strong typing |
| **Streaming** | gRPC supports 4 modes; REST needs SSE or WebSocket |
| **API Gateway** | Translates between external REST and internal gRPC |
| **Hybrid approach** | REST for external, gRPC for internal is a common pattern |

> **Rule of thumb:** Use REST at the edge (public APIs, browsers) and gRPC at the core (service-to-service). An API gateway bridges the two worlds.

---

## Next Steps

- Study **service mesh** integration with gRPC (Istio, Linkerd).
- Explore **gRPC-Web** for browser-based gRPC clients.
- Learn **GraphQL** as a third option for flexible client queries.
- Practice implementing **idempotency** and **retry logic** for both paradigms.
