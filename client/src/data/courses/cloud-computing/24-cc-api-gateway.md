---
title: "API Gateways and Service Mesh"
---

# API Gateways and Service Mesh

In modern cloud architectures, applications are broken into dozens — sometimes hundreds — of microservices. Every one of those services needs to be reached, secured, and monitored. **API gateways** and **service meshes** are the two pillars that make this manageable.

This lesson walks you through both concepts from the ground up, with hands-on examples and comparisons so you can pick the right tool for the job.

---

## What Is an API Gateway?

An **API gateway** is a server that sits between your clients (browsers, mobile apps, IoT devices) and your backend services. It acts as the single entry point for all API traffic.

Think of it as a **receptionist in a large office building**. Instead of visitors wandering around looking for rooms, the receptionist directs them, checks their IDs, and controls how many people enter at once.

```
┌────────┐        ┌──────────────┐        ┌──────────┐
│ Client │───────▶│ API Gateway  │───────▶│ Service A│
└────────┘        │              │        └──────────┘
                  │  • Routing   │        ┌──────────┐
                  │  • Auth      │───────▶│ Service B│
                  │  • Rate Limit│        └──────────┘
                  │  • Caching   │        ┌──────────┐
                  │  • Transform │───────▶│ Service C│
                  └──────────────┘        └──────────┘
```

### Why Do You Need One?

Without an API gateway every client must:

- Know the address of every service
- Handle authentication separately for each service
- Deal with different response formats
- Retry failed requests on its own

With an API gateway, clients talk to **one endpoint** and the gateway handles the rest.

---

## Core Features of an API Gateway

### 1. Request Routing

The gateway inspects incoming requests and forwards them to the correct backend service based on the URL path, HTTP method, headers, or query parameters.

```yaml
# Example: route configuration (conceptual)
routes:
  - path: /api/users/**
    service: user-service
    port: 8001

  - path: /api/orders/**
    service: order-service
    port: 8002

  - path: /api/products/**
    service: product-service
    port: 8003
```

A single request to `https://api.example.com/api/users/42` is routed internally to `user-service:8001/42`.

---

### 2. Rate Limiting

Rate limiting protects your services from being overwhelmed by too many requests.

| Strategy | Description | Use Case |
|---|---|---|
| **Fixed Window** | Allow N requests per fixed time window (e.g., 100/min) | Simple public APIs |
| **Sliding Window** | Smooths out bursts by sliding the window continuously | General purpose |
| **Token Bucket** | Tokens refill at a steady rate; each request costs a token | Bursty traffic |
| **Leaky Bucket** | Requests queue and drain at a fixed rate | Steady throughput |

**Example — Token Bucket in pseudocode:**

```python
class TokenBucket:
    def __init__(self, capacity, refill_rate):
        self.capacity = capacity
        self.tokens = capacity
        self.refill_rate = refill_rate   # tokens per second
        self.last_refill = time.now()

    def allow_request(self):
        self._refill()
        if self.tokens >= 1:
            self.tokens -= 1
            return True
        return False          # 429 Too Many Requests

    def _refill(self):
        now = time.now()
        elapsed = now - self.last_refill
        self.tokens = min(self.capacity,
                          self.tokens + elapsed * self.refill_rate)
        self.last_refill = now
```

---

### 3. Authentication and Authorization

The gateway can validate credentials **before** traffic ever reaches your services.

Common auth patterns handled at the gateway:

| Pattern | How It Works |
|---|---|
| **API Key** | Client sends a key in a header; gateway validates it |
| **OAuth 2.0 / JWT** | Gateway verifies the JWT signature and claims |
| **mTLS** | Both client and server present certificates |
| **Basic Auth** | Username/password encoded in the `Authorization` header |

```
Client ──▶ API Gateway (validate JWT) ──▶ Backend Service
                │
                ▼
          Token is valid?
          ├── Yes ──▶ Forward request + attach user context
          └── No  ──▶ Return 401 Unauthorized
```

This means your backend services **never have to check tokens themselves** — they can trust the gateway already did it.

---

### 4. Load Balancing

An API gateway distributes traffic across multiple instances of a service so no single instance is overloaded.

```
                    ┌───────────────┐
               ┌───▶│ Service A - 1 │
               │    └───────────────┘
Gateway ───────┤    ┌───────────────┐
               ├───▶│ Service A - 2 │
               │    └───────────────┘
               │    ┌───────────────┐
               └───▶│ Service A - 3 │
                    └───────────────┘
```

We will cover load-balancing algorithms in depth in the next lesson.

---

### 5. Request / Response Transformation

The gateway can modify requests and responses on the fly:

- **Header injection** — add `X-Request-ID` for tracing
- **Body transformation** — convert XML ↔ JSON
- **Field filtering** — strip sensitive fields before sending to the client
- **Aggregation** — combine responses from multiple services into one

```json
// Client receives ONE response:
{
  "user": { "id": 42, "name": "Alice" },
  "orders": [ { "id": 101, "total": 59.99 } ],
  "recommendations": [ "Widget Pro", "Gadget Max" ]
}

// But internally the gateway called THREE services:
//   GET /users/42
//   GET /orders?userId=42
//   GET /recommendations?userId=42
```

---

### 6. Caching

The gateway can cache responses for frequently requested, rarely changing data.

| Header | Purpose |
|---|---|
| `Cache-Control: max-age=300` | Cache for 5 minutes |
| `ETag` | Validate if the resource changed |
| `Vary: Accept-Encoding` | Separate cache entries per encoding |

Caching at the gateway reduces latency **and** backend load.

---

## Key API Gateway Products

| Product | Provider | Highlights |
|---|---|---|
| **AWS API Gateway** | Amazon | Fully managed, REST & WebSocket, Lambda integration |
| **Azure API Management** | Microsoft | Developer portal, policy engine, hybrid support |
| **Kong** | Kong Inc. | Open-source core, plugin ecosystem, Kubernetes-native |
| **Apigee** | Google | Analytics-heavy, monetisation features |
| **Traefik** | Traefik Labs | Auto-discovery, Docker & K8s native, free tier |
| **NGINX** | F5 | High performance, reverse proxy + gateway |

### AWS API Gateway — Quick Example

```yaml
# AWS SAM template snippet
Resources:
  MyApi:
    Type: AWS::Serverless::Api
    Properties:
      StageName: prod
      Auth:
        DefaultAuthorizer: MyCognitoAuth
        Authorizers:
          MyCognitoAuth:
            UserPoolArn: !GetAtt UserPool.Arn

  GetUsersFunction:
    Type: AWS::Serverless::Function
    Properties:
      Handler: src/users.handler
      Runtime: nodejs20.x
      Events:
        GetUsers:
          Type: Api
          Properties:
            RestApiId: !Ref MyApi
            Path: /users
            Method: GET
```

---

## RESTful API Design with an API Gateway

When designing APIs that will sit behind a gateway, follow these best practices:

### URL Structure

```
GET    /api/v1/users          # List users
GET    /api/v1/users/42       # Get user by ID
POST   /api/v1/users          # Create user
PUT    /api/v1/users/42       # Update user
DELETE /api/v1/users/42       # Delete user
```

### Versioning Strategies

| Strategy | Example | Pros | Cons |
|---|---|---|---|
| **URI path** | `/v1/users` | Simple, visible | Clutters URLs |
| **Query param** | `/users?version=1` | Easy to add | Easy to forget |
| **Header** | `Accept: application/vnd.api.v1+json` | Clean URLs | Harder to test |

The gateway handles version routing so backend services only need to implement the latest version.

### Status Codes at the Gateway

| Code | Meaning | When the Gateway Returns It |
|---|---|---|
| `200` | OK | Successful request |
| `400` | Bad Request | Malformed request body or params |
| `401` | Unauthorized | Missing or invalid auth token |
| `403` | Forbidden | Valid token but insufficient permissions |
| `429` | Too Many Requests | Rate limit exceeded |
| `502` | Bad Gateway | Backend service unreachable |
| `503` | Service Unavailable | Backend overloaded / maintenance |
| `504` | Gateway Timeout | Backend took too long |

---

## What Is a Service Mesh?

A **service mesh** handles **service-to-service** (east-west) communication, while an API gateway handles **client-to-service** (north-south) communication.

```
       North-South (API Gateway)
              │
              ▼
┌──────────────────────────────────┐
│         Internal Network         │
│                                  │
│  Service A ◄──────► Service B    │
│       │      East-West           │
│       │     (Service Mesh)       │
│       ▼                          │
│  Service C ◄──────► Service D    │
│                                  │
└──────────────────────────────────┘
```

### Why Do You Need a Service Mesh?

As the number of microservices grows, managing communication between them becomes hard:

- **Security** — How do you encrypt traffic between services?
- **Reliability** — What happens when a service is slow or down?
- **Observability** — How do you trace a request across 10 services?
- **Traffic Control** — How do you do canary deployments?

A service mesh solves all of these **without changing application code**.

---

## The Sidecar Proxy Pattern

The core idea of a service mesh is the **sidecar proxy**. Every service gets a small proxy container deployed alongside it (the "sidecar"). All inbound and outbound traffic flows through this proxy.

```
┌─────────────────────────────────┐
│           Pod / VM              │
│  ┌───────────┐  ┌────────────┐ │
│  │  Service   │  │  Sidecar   │ │
│  │  (your     │◄─┤  Proxy     │◄──── Incoming traffic
│  │   code)    │──▶│ (Envoy)   │────▶ Outgoing traffic
│  └───────────┘  └────────────┘ │
└─────────────────────────────────┘
```

The sidecar intercepts all network calls transparently. Your application code does not know the proxy exists.

### Benefits of the Sidecar Pattern

1. **Language-agnostic** — works with any language (Java, Go, Python, Node.js)
2. **No code changes** — security and observability are added at the infrastructure layer
3. **Consistent** — every service gets the same behaviour
4. **Upgradable** — update the proxy without touching application code

---

## Key Service Mesh Products

| Product | Maintained By | Proxy | Highlights |
|---|---|---|---|
| **Istio** | Google, IBM, Lyft | Envoy | Feature-rich, most adopted |
| **Linkerd** | Buoyant | linkerd2-proxy (Rust) | Lightweight, simple |
| **Consul Connect** | HashiCorp | Built-in / Envoy | Works outside Kubernetes too |
| **Cilium** | Isovalent (Cisco) | eBPF-based | No sidecar needed, kernel-level |
| **AWS App Mesh** | Amazon | Envoy | Tight AWS integration |

---

## Mutual TLS (mTLS)

In a service mesh, **mTLS** (mutual TLS) encrypts all traffic between services and verifies identity in **both** directions.

```
Service A                           Service B
   │                                     │
   ├── Presents its certificate ────────▶│
   │                                     │
   │◀──── Presents its certificate ──────┤
   │                                     │
   │◄════ Encrypted connection ════════▶│
```

### How mTLS Works in a Mesh

1. The mesh **control plane** acts as a Certificate Authority (CA).
2. Each sidecar proxy gets a short-lived certificate automatically.
3. Certificates are rotated frequently (e.g., every 24 hours).
4. Services verify each other's identity before exchanging data.

**You get encryption + identity without writing any TLS code.**

```yaml
# Istio PeerAuthentication — enforce mTLS cluster-wide
apiVersion: security.istio.io/v1beta1
kind: PeerAuthentication
metadata:
  name: default
  namespace: istio-system
spec:
  mtls:
    mode: STRICT        # All traffic MUST be mTLS
```

---

## Traffic Management

A service mesh gives you fine-grained control over how traffic flows.

### Canary Deployments

Route a small percentage of traffic to a new version:

```yaml
# Istio VirtualService — 90/10 split
apiVersion: networking.istio.io/v1alpha3
kind: VirtualService
metadata:
  name: my-service
spec:
  hosts:
    - my-service
  http:
    - route:
        - destination:
            host: my-service
            subset: v1
          weight: 90
        - destination:
            host: my-service
            subset: v2
          weight: 10
```

### Other Traffic Features

| Feature | Description |
|---|---|
| **Retries** | Automatically retry failed requests (with backoff) |
| **Timeouts** | Set max wait time for a response |
| **Circuit Breaking** | Stop sending traffic to a failing service |
| **Fault Injection** | Simulate failures for chaos testing |
| **Mirroring** | Send a copy of live traffic to a test service |
| **Header-based routing** | Route by header value (A/B testing) |

### Circuit Breaker Example

```yaml
# Istio DestinationRule — circuit breaker
apiVersion: networking.istio.io/v1alpha3
kind: DestinationRule
metadata:
  name: my-service
spec:
  host: my-service
  trafficPolicy:
    connectionPool:
      tcp:
        maxConnections: 100
      http:
        h2UpgradePolicy: DEFAULT
        http1MaxPendingRequests: 50
        http2MaxRequests: 100
    outlierDetection:
      consecutive5xxErrors: 5
      interval: 30s
      baseEjectionTime: 60s
      maxEjectionPercent: 50
```

---

## Observability Through the Mesh

Because **all traffic** passes through sidecar proxies, the mesh can collect metrics, logs, and traces automatically.

### The Three Pillars

| Pillar | What It Gives You | Tools |
|---|---|---|
| **Metrics** | Request rate, error rate, latency (RED) | Prometheus, Grafana |
| **Distributed Tracing** | End-to-end request path across services | Jaeger, Zipkin |
| **Access Logs** | Detailed per-request records | Fluentd, ELK stack |

### Example: Prometheus Metrics from Envoy

```promql
# Request rate for my-service (requests per second)
rate(istio_requests_total{
  destination_service="my-service.default.svc.cluster.local"
}[5m])

# P99 latency
histogram_quantile(0.99,
  rate(istio_request_duration_milliseconds_bucket{
    destination_service="my-service.default.svc.cluster.local"
  }[5m])
)

# Error rate (5xx responses)
rate(istio_requests_total{
  destination_service="my-service.default.svc.cluster.local",
  response_code=~"5.."
}[5m])
```

### Service Topology Visualization

Tools like **Kiali** (for Istio) generate live service maps:

```
        ┌─────────┐     ┌─────────┐
   ────▶│ Frontend │────▶│  Auth   │
        └────┬────┘     └─────────┘
             │
             ▼
        ┌─────────┐     ┌─────────┐
        │  Orders │────▶│ Payment │
        └────┬────┘     └─────────┘
             │
             ▼
        ┌──────────┐
        │ Inventory│
        └──────────┘

  Line thickness = request volume
  Color = error rate (green → red)
```

---

## API Gateway vs Service Mesh — Comparison

| Aspect | API Gateway | Service Mesh |
|---|---|---|
| **Traffic direction** | North-South (client → service) | East-West (service → service) |
| **Deployment** | Edge of the network | Inside the cluster |
| **Main purpose** | External API management | Internal service communication |
| **Auth** | Client authentication (JWT, API key) | Service identity (mTLS) |
| **Rate limiting** | Per-client quotas | Per-service circuit breaking |
| **Load balancing** | Across services | Across service instances |
| **Observability** | API analytics | Distributed tracing |
| **Code changes** | Minimal (configure routes) | None (sidecar proxy) |
| **Examples** | Kong, AWS API GW, Apigee | Istio, Linkerd, Consul |

### When to Use What

| Scenario | Use |
|---|---|
| Expose APIs to external consumers | API Gateway |
| Secure internal microservice traffic | Service Mesh |
| Rate-limit public API calls | API Gateway |
| Canary deploy a new service version | Service Mesh |
| Aggregate multiple service responses | API Gateway |
| Trace requests across 20 internal services | Service Mesh |
| Both external + complex internal traffic | **Both together** |

### Using Both Together

```
Internet
   │
   ▼
┌──────────────┐
│ API Gateway  │  ◄── North-South: auth, rate limit, routing
└──────┬───────┘
       │
       ▼
┌────────────────────────────────────────────┐
│              Service Mesh                  │
│  ┌────────┐  ┌────────┐  ┌────────┐       │
│  │ Svc A  │◄▶│ Svc B  │◄▶│ Svc C  │       │
│  └────────┘  └────────┘  └────────┘       │
│     ◄── East-West: mTLS, tracing,         │
│         retries, circuit breaking          │
└────────────────────────────────────────────┘
```

---

## Hands-On Exercises

### Exercise 1 — Design an API Gateway Configuration

You have three microservices: `user-service`, `order-service`, and `notification-service`.

**Task**: Write a conceptual route configuration that:

1. Routes `/api/users/**` to `user-service`
2. Routes `/api/orders/**` to `order-service`
3. Routes `/api/notifications/**` to `notification-service`
4. Requires JWT authentication on all routes
5. Applies rate limiting of 100 requests/minute per API key

<details>
<summary>View Solution</summary>

```yaml
gateway:
  auth:
    default: jwt
    jwt:
      issuer: https://auth.example.com
      audience: my-api

  rate_limit:
    default:
      requests: 100
      window: 60s
      key: api_key

  routes:
    - path: /api/users/**
      service: user-service
      port: 8001
      methods: [GET, POST, PUT, DELETE]

    - path: /api/orders/**
      service: order-service
      port: 8002
      methods: [GET, POST, PUT]

    - path: /api/notifications/**
      service: notification-service
      port: 8003
      methods: [GET, POST]
```

</details>

---

### Exercise 2 — mTLS Policy

Write an Istio `PeerAuthentication` resource that:

1. Enforces strict mTLS in the `production` namespace
2. Allows permissive mTLS (accepts plain text too) in the `staging` namespace

<details>
<summary>View Solution</summary>

```yaml
# production — strict mTLS
apiVersion: security.istio.io/v1beta1
kind: PeerAuthentication
metadata:
  name: default
  namespace: production
spec:
  mtls:
    mode: STRICT

---
# staging — permissive mTLS
apiVersion: security.istio.io/v1beta1
kind: PeerAuthentication
metadata:
  name: default
  namespace: staging
spec:
  mtls:
    mode: PERMISSIVE
```

</details>

---

### Exercise 3 — Canary Deployment

You want to roll out `v2` of `payment-service` to 5 % of traffic, keeping 95 % on `v1`.

Write the Istio `VirtualService` and `DestinationRule`.

<details>
<summary>View Solution</summary>

```yaml
# VirtualService — traffic split
apiVersion: networking.istio.io/v1alpha3
kind: VirtualService
metadata:
  name: payment-service
spec:
  hosts:
    - payment-service
  http:
    - route:
        - destination:
            host: payment-service
            subset: v1
          weight: 95
        - destination:
            host: payment-service
            subset: v2
          weight: 5

---
# DestinationRule — define subsets
apiVersion: networking.istio.io/v1alpha3
kind: DestinationRule
metadata:
  name: payment-service
spec:
  host: payment-service
  subsets:
    - name: v1
      labels:
        version: v1
    - name: v2
      labels:
        version: v2
```

</details>

---

### Exercise 4 — Choose the Right Tool

For each scenario, decide whether you need an **API Gateway**, a **Service Mesh**, or **both**:

| # | Scenario | Your Answer |
|---|---|---|
| 1 | A mobile app needs to call your backend APIs with OAuth tokens | ? |
| 2 | You need to trace a request that flows through 8 internal services | ? |
| 3 | You want to rate-limit a third-party partner to 1 000 req/hour | ? |
| 4 | You need to encrypt all traffic between internal services | ? |
| 5 | You want to do a canary rollout and aggregate external API responses | ? |

<details>
<summary>View Answers</summary>

| # | Answer |
|---|---|
| 1 | **API Gateway** — client authentication |
| 2 | **Service Mesh** — distributed tracing |
| 3 | **API Gateway** — per-client rate limiting |
| 4 | **Service Mesh** — mTLS |
| 5 | **Both** — gateway for aggregation, mesh for canary |

</details>

---

## Key Takeaways

1. An **API gateway** is the single entry point for external traffic — it handles routing, auth, rate limiting, caching, and transformation.
2. A **service mesh** manages internal service-to-service traffic using sidecar proxies — no code changes needed.
3. The **sidecar proxy pattern** intercepts all network traffic transparently, enabling security and observability at the infrastructure layer.
4. **mTLS** in a service mesh encrypts traffic and verifies service identity automatically.
5. Service meshes provide powerful **traffic management**: canary deployments, circuit breaking, retries, and fault injection.
6. **Observability** (metrics, traces, logs) comes free when all traffic flows through the mesh.
7. API gateways and service meshes are **complementary** — use both in production microservice architectures.
8. Choose **API gateway** for north-south (client → service) and **service mesh** for east-west (service → service) concerns.

---

## Further Reading

- [AWS API Gateway Documentation](https://docs.aws.amazon.com/apigateway/)
- [Kong Gateway OSS](https://docs.konghq.com/gateway/latest/)
- [Istio Documentation](https://istio.io/latest/docs/)
- [Linkerd Getting Started](https://linkerd.io/2/getting-started/)
- [Envoy Proxy](https://www.envoyproxy.io/docs/envoy/latest/)
- [The Service Mesh Manifesto](https://buoyant.io/service-mesh-manifesto)
