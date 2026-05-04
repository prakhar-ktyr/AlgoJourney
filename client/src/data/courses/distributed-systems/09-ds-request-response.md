---
title: "Request-Response Patterns"
---

# Request-Response Patterns in Distributed Systems

The **request-response** pattern is the most fundamental communication model in distributed systems. A client sends a request, waits for the server to process it, and receives a response. While simple in concept, building reliable request-response systems at scale involves timeouts, retries, circuit breakers, load balancing, service discovery, and much more.

In this lesson, you'll learn how to design robust request-response communication that can handle failures gracefully.

---

## Synchronous Request-Response

In **synchronous** request-response, the client blocks (waits) until the server sends back a response or a timeout occurs.

```
Client                    Server
  |                         |
  |------- Request -------->|
  |                         |  (processing)
  |<------ Response --------|
  |                         |
```

### Characteristics

| Property | Description |
|----------|-------------|
| **Blocking** | Client waits until response arrives |
| **Simple** | Easy to reason about — linear flow |
| **Coupled** | Client and server must both be available |
| **Latency-bound** | Total time = network round-trip + processing |

### When to Use

- CRUD operations where the client needs the result immediately
- User-facing APIs where the response is displayed right away
- Short-lived operations (< 1–2 seconds)

### When to Avoid

- Long-running operations (use async patterns instead)
- Fire-and-forget scenarios (use message queues)
- High fan-out communication (use pub/sub)

---

## HTTP Versions: 1.1 vs 2 vs 3

HTTP is the dominant protocol for request-response in distributed systems. Understanding the differences between versions is critical.

### HTTP/1.1

```
GET /api/users/42 HTTP/1.1
Host: api.example.com
Accept: application/json
Connection: keep-alive
```

- **One request per connection** at a time (head-of-line blocking)
- **Keep-alive** reuses TCP connections
- **Text-based** headers (verbose, uncompressed)
- **Pipelining** exists but is poorly supported

### HTTP/2

```
# Multiple streams over a single TCP connection
Stream 1: GET /api/users/42
Stream 3: GET /api/users/42/orders
Stream 5: GET /api/products?featured=true
```

- **Multiplexing**: multiple requests/responses over one TCP connection
- **Header compression** (HPACK) reduces overhead
- **Server push**: server can proactively send resources
- **Binary framing**: more efficient than text-based HTTP/1.1
- Still suffers from **TCP head-of-line blocking**

### HTTP/3

- Uses **QUIC** (UDP-based) instead of TCP
- Eliminates TCP head-of-line blocking
- **Faster connection establishment** (0-RTT or 1-RTT)
- Built-in encryption (TLS 1.3)
- Better performance on lossy networks (mobile, Wi-Fi)

### Comparison Table

| Feature | HTTP/1.1 | HTTP/2 | HTTP/3 |
|---------|----------|--------|--------|
| Transport | TCP | TCP | QUIC (UDP) |
| Multiplexing | No | Yes | Yes |
| Header Compression | No | HPACK | QPACK |
| Head-of-Line Blocking | Yes (application + TCP) | TCP-level only | No |
| Connection Setup | 2–3 RTT (TCP + TLS) | 2–3 RTT | 0–1 RTT |
| Server Push | No | Yes | Yes |
| Encryption | Optional | Practically required | Always (TLS 1.3) |

---

## REST API Design for Distributed Systems

REST (Representational State Transfer) is the most common API style for request-response in distributed systems.

### Key Principles

1. **Resources** are identified by URIs: `/api/orders/123`
2. **HTTP methods** map to operations:

| Method | Operation | Idempotent? | Safe? |
|--------|-----------|-------------|-------|
| GET | Read | Yes | Yes |
| POST | Create | No | No |
| PUT | Replace | Yes | No |
| PATCH | Partial update | No* | No |
| DELETE | Remove | Yes | No |

> \* PATCH *can* be idempotent depending on the implementation.

3. **Stateless**: each request contains all information needed to process it
4. **Standard status codes**: communicate outcome clearly

### Status Codes for Distributed Systems

```python
# Common status codes and their meanings
STATUS_CODES = {
    200: "OK — request succeeded",
    201: "Created — resource created",
    202: "Accepted — request queued for async processing",
    204: "No Content — success with no body",
    301: "Moved Permanently — use new URL",
    304: "Not Modified — use cached version",
    400: "Bad Request — client error",
    401: "Unauthorized — authentication required",
    403: "Forbidden — insufficient permissions",
    404: "Not Found — resource doesn't exist",
    409: "Conflict — state conflict",
    429: "Too Many Requests — rate limited",
    500: "Internal Server Error",
    502: "Bad Gateway — upstream failure",
    503: "Service Unavailable — overloaded or maintenance",
    504: "Gateway Timeout — upstream timeout",
}
```

### Versioning Strategies

```bash
# URI versioning
GET /api/v1/users/42
GET /api/v2/users/42

# Header versioning
GET /api/users/42
Accept: application/vnd.myapi.v2+json

# Query parameter versioning
GET /api/users/42?version=2
```

---

## GraphQL as an Alternative

**GraphQL** solves common REST problems in distributed systems: over-fetching, under-fetching, and multiple round trips.

```graphql
# Single request fetches exactly what the client needs
query {
  user(id: 42) {
    name
    email
    orders(last: 5) {
      id
      total
      items {
        name
        quantity
      }
    }
  }
}
```

### REST vs GraphQL

| Aspect | REST | GraphQL |
|--------|------|---------|
| Endpoints | Multiple (`/users`, `/orders`) | Single (`/graphql`) |
| Data fetching | Fixed response shape | Client specifies shape |
| Over-fetching | Common | Eliminated |
| Under-fetching | Requires multiple requests | Single request |
| Caching | HTTP caching (simple) | More complex |
| Error handling | HTTP status codes | Always 200 + errors field |
| Learning curve | Lower | Higher |

### When GraphQL Shines

- Mobile apps with bandwidth constraints
- Complex relationships between resources
- Rapidly evolving frontends
- Aggregating data from multiple services (via federation)

### When REST Is Better

- Simple CRUD APIs
- File uploads/downloads
- Public APIs (better caching, simpler tooling)
- When HTTP caching is critical

---

## Timeouts and Retries

In distributed systems, **every remote call can fail**. Timeouts and retries are your first line of defense.

### Setting Timeouts

```python
import requests

# Always set timeouts — NEVER use infinite timeouts
try:
    response = requests.get(
        "https://api.example.com/users/42",
        timeout=(3.0, 10.0)  # (connect_timeout, read_timeout)
    )
    response.raise_for_status()
except requests.Timeout:
    print("Request timed out")
except requests.ConnectionError:
    print("Could not connect")
```

### Timeout Guidelines

| Timeout Type | Typical Value | Purpose |
|-------------|---------------|---------|
| Connect timeout | 1–5 seconds | Time to establish TCP connection |
| Read timeout | 5–30 seconds | Time to receive response |
| Total timeout | 10–60 seconds | End-to-end request time |
| Idle timeout | 60–300 seconds | Close idle keep-alive connections |

### Exponential Backoff with Jitter

Retrying failed requests immediately can overwhelm a recovering service. **Exponential backoff** increases the wait time between retries, and **jitter** prevents synchronized retry storms.

$$
\text{wait\_time} = \min\left(\text{base} \times 2^{\text{attempt}} + \text{random}(0, \text{jitter}),\ \text{max\_wait}\right)
$$

```python
import time
import random

def retry_with_backoff(func, max_retries=5, base_delay=1.0, max_delay=60.0):
    """Retry a function with exponential backoff and full jitter."""
    for attempt in range(max_retries):
        try:
            return func()
        except Exception as e:
            if attempt == max_retries - 1:
                raise  # Final attempt failed

            # Exponential backoff with full jitter
            exp_delay = base_delay * (2 ** attempt)
            wait_time = random.uniform(0, min(exp_delay, max_delay))

            print(f"Attempt {attempt + 1} failed: {e}")
            print(f"Retrying in {wait_time:.2f}s...")
            time.sleep(wait_time)
```

### Jitter Strategies

| Strategy | Formula | Use Case |
|----------|---------|----------|
| **Full jitter** | `random(0, base * 2^attempt)` | Best overall; recommended default |
| **Equal jitter** | `base * 2^attempt / 2 + random(0, base * 2^attempt / 2)` | Guarantees minimum wait |
| **Decorrelated jitter** | `random(base, prev_wait * 3)` | Good for correlated failures |

---

## Circuit Breaker Pattern

The **circuit breaker** prevents a failing service from being overwhelmed with requests, giving it time to recover.

### States

```
        ┌──────────────────────────────┐
        │                              │
   ┌────▼────┐   failure    ┌─────────┴──┐   timeout   ┌───────────┐
   │  CLOSED  │─────────────►│    OPEN     │────────────►│ HALF-OPEN │
   │ (normal) │  threshold   │ (fail fast) │  expires    │  (probe)  │
   └────┬─────┘              └─────────────┘             └─────┬─────┘
        │                         ▲                            │
        │  success                │  failure                   │ success
        └─────────────────────────┴────────────────────────────┘
```

| State | Behavior |
|-------|----------|
| **Closed** | Requests flow normally; failures are counted |
| **Open** | All requests fail immediately (no remote call) |
| **Half-Open** | A few probe requests are allowed through to test recovery |

### Implementation

```python
import time
from enum import Enum

class CircuitState(Enum):
    CLOSED = "closed"
    OPEN = "open"
    HALF_OPEN = "half_open"

class CircuitBreaker:
    def __init__(self, failure_threshold=5, recovery_timeout=30,
                 half_open_max_calls=3):
        self.state = CircuitState.CLOSED
        self.failure_count = 0
        self.success_count = 0
        self.failure_threshold = failure_threshold
        self.recovery_timeout = recovery_timeout
        self.half_open_max_calls = half_open_max_calls
        self.last_failure_time = None

    def call(self, func, *args, **kwargs):
        if self.state == CircuitState.OPEN:
            if self._recovery_timeout_expired():
                self.state = CircuitState.HALF_OPEN
                self.success_count = 0
            else:
                raise CircuitBreakerOpenError("Circuit is OPEN")

        try:
            result = func(*args, **kwargs)
            self._on_success()
            return result
        except Exception as e:
            self._on_failure()
            raise

    def _on_success(self):
        if self.state == CircuitState.HALF_OPEN:
            self.success_count += 1
            if self.success_count >= self.half_open_max_calls:
                self.state = CircuitState.CLOSED
                self.failure_count = 0
        else:
            self.failure_count = 0

    def _on_failure(self):
        self.failure_count += 1
        self.last_failure_time = time.time()
        if self.failure_count >= self.failure_threshold:
            self.state = CircuitState.OPEN

    def _recovery_timeout_expired(self):
        return (time.time() - self.last_failure_time) >= self.recovery_timeout
```

---

## Bulkhead Pattern

The **bulkhead** pattern isolates components so that a failure in one doesn't cascade to others — like watertight compartments in a ship.

```
┌─────────────────────────────────────────┐
│              Application                │
│                                         │
│  ┌───────────┐  ┌───────────┐  ┌──────┐│
│  │ Pool: API │  │Pool: Auth │  │Pool: ││
│  │ (10 conn) │  │ (5 conn)  │  │ DB   ││
│  │           │  │           │  │(20)  ││
│  └───────────┘  └───────────┘  └──────┘│
│                                         │
│  If Auth pool is exhausted, API and DB  │
│  pools continue working normally.       │
└─────────────────────────────────────────┘
```

### Implementation Strategies

| Strategy | Description | Example |
|----------|-------------|---------|
| **Thread pool** | Separate thread pools per dependency | Hystrix-style |
| **Connection pool** | Separate connection pools | DB pool vs API pool |
| **Semaphore** | Limit concurrent calls per dependency | Lightweight alternative |
| **Process isolation** | Separate processes/containers | Microservices |

---

## Load Balancing

Load balancing distributes requests across multiple server instances to improve throughput and availability.

### Client-Side vs Server-Side

```
Server-Side Load Balancing:           Client-Side Load Balancing:

Client ──► Load Balancer ──► Server1  Client ──┬──► Server1
                         └──► Server2         ├──► Server2
                         └──► Server3         └──► Server3
                                      (client picks server)
```

| Aspect | Server-Side | Client-Side |
|--------|-------------|-------------|
| **Complexity** | At load balancer | At each client |
| **Single point of failure** | Yes (LB itself) | No |
| **Server awareness** | LB needs to know servers | Client needs to know servers |
| **Latency** | Extra hop through LB | Direct connection |
| **Examples** | NGINX, HAProxy, AWS ALB | Ribbon, gRPC client LB |

### Load Balancing Algorithms

| Algorithm | How It Works | Best For |
|-----------|-------------|----------|
| **Round Robin** | Cycle through servers in order | Equal-capacity servers |
| **Weighted Round Robin** | Higher-weight servers get more traffic | Mixed-capacity servers |
| **Least Connections** | Send to server with fewest active connections | Variable request durations |
| **Random** | Pick a random server | Simple, good with many servers |
| **Consistent Hashing** | Hash request key to server | Caching, sticky sessions |
| **Least Response Time** | Send to fastest-responding server | Latency-sensitive workloads |

---

## Service Discovery

In dynamic environments (containers, cloud), services come and go. **Service discovery** helps clients find available service instances.

### DNS-Based Discovery

```bash
# Simple: use DNS SRV records
dig SRV _http._tcp.user-service.internal

# Response:
# _http._tcp.user-service.internal. 300 IN SRV 10 50 8080 host1.internal.
# _http._tcp.user-service.internal. 300 IN SRV 10 50 8080 host2.internal.
```

**Pros**: Simple, standard, no extra infrastructure  
**Cons**: TTL caching delays updates, limited health info

### Registry-Based Discovery

```python
# Register service with Consul
import requests

registration = {
    "ID": "user-service-1",
    "Name": "user-service",
    "Address": "10.0.1.5",
    "Port": 8080,
    "Check": {
        "HTTP": "http://10.0.1.5:8080/health",
        "Interval": "10s",
        "Timeout": "3s",
    }
}

requests.put(
    "http://consul:8500/v1/agent/service/register",
    json=registration
)

# Discover healthy instances
response = requests.get(
    "http://consul:8500/v1/health/service/user-service?passing=true"
)
instances = response.json()
```

### Comparison

| Approach | Examples | Pros | Cons |
|----------|----------|------|------|
| **DNS-based** | CoreDNS, Route 53 | Simple, universal | Slow updates (TTL), no health |
| **Registry-based** | Consul, Eureka, etcd | Health checks, metadata | Extra infrastructure |
| **Platform-based** | Kubernetes Services | Built-in, automatic | Tied to platform |

---

## Health Checks

Health checks let load balancers and service registries know if an instance is ready to serve traffic.

```python
from flask import Flask, jsonify
import psycopg2

app = Flask(__name__)

@app.route("/health/live")
def liveness():
    """Is the process alive?"""
    return jsonify({"status": "alive"}), 200

@app.route("/health/ready")
def readiness():
    """Can the service handle requests?"""
    checks = {}

    # Check database connectivity
    try:
        conn = psycopg2.connect("dbname=mydb")
        conn.close()
        checks["database"] = "ok"
    except Exception:
        checks["database"] = "failed"
        return jsonify({"status": "not ready", "checks": checks}), 503

    # Check required dependencies
    # ... more checks ...

    return jsonify({"status": "ready", "checks": checks}), 200
```

| Check Type | Purpose | Failure Action |
|-----------|---------|----------------|
| **Liveness** | Is the process running? | Restart the instance |
| **Readiness** | Can it handle requests? | Stop routing traffic to it |
| **Startup** | Has it finished initializing? | Wait before checking liveness |

---

## Connection Pooling

Creating a new connection for every request is expensive. **Connection pools** maintain a set of reusable connections.

```python
# Python example with connection pooling
from sqlalchemy import create_engine

engine = create_engine(
    "postgresql://user:pass@db:5432/mydb",
    pool_size=20,           # Maintain 20 connections
    max_overflow=10,        # Allow 10 extra under load
    pool_timeout=30,        # Wait 30s for a connection
    pool_recycle=3600,      # Recycle connections after 1 hour
    pool_pre_ping=True,     # Verify connection before using
)
```

### Pool Sizing

A common formula for optimal pool size:

$$
\text{pool\_size} = T_n \times \left( C_m - 1 \right) + 1
$$

Where $T_n$ is the number of threads and $C_m$ is the number of simultaneous connections each thread needs. A practical rule of thumb:

$$
\text{pool\_size} \approx 2 \times \text{CPU\_cores} + \text{disk\_spindles}
$$

---

## Rate Limiting

**Rate limiting** protects services from being overwhelmed by too many requests.

### Common Algorithms

| Algorithm | Description | Pros | Cons |
|-----------|-------------|------|------|
| **Token Bucket** | Tokens added at fixed rate; each request consumes one | Allows bursts | Slightly complex |
| **Leaky Bucket** | Requests processed at fixed rate; excess queued | Smooth output | No bursts allowed |
| **Fixed Window** | Count requests in fixed time windows | Simple | Burst at window edges |
| **Sliding Window Log** | Track timestamp of each request | Accurate | Memory-intensive |
| **Sliding Window Counter** | Weighted count across windows | Good balance | Approximate |

### Token Bucket Example

```python
import time
import threading

class TokenBucket:
    def __init__(self, rate, capacity):
        self.rate = rate          # Tokens added per second
        self.capacity = capacity  # Maximum tokens
        self.tokens = capacity
        self.last_refill = time.monotonic()
        self.lock = threading.Lock()

    def allow_request(self):
        with self.lock:
            now = time.monotonic()
            elapsed = now - self.last_refill
            self.tokens = min(
                self.capacity,
                self.tokens + elapsed * self.rate
            )
            self.last_refill = now

            if self.tokens >= 1:
                self.tokens -= 1
                return True
            return False

# Allow 100 requests/second with burst of 150
limiter = TokenBucket(rate=100, capacity=150)

if limiter.allow_request():
    # Process request
    pass
else:
    # Return 429 Too Many Requests
    pass
```

---

## Idempotency in Request-Response

An operation is **idempotent** if performing it multiple times has the same effect as performing it once. This is crucial for safe retries.

### Making APIs Idempotent

```python
import uuid

# Client generates an idempotency key
idempotency_key = str(uuid.uuid4())

# Send request with the key
headers = {
    "Idempotency-Key": idempotency_key
}

# Server implementation
class PaymentService:
    def __init__(self):
        self.processed_keys = {}  # key -> response

    def process_payment(self, idempotency_key, payment_data):
        # Check if already processed
        if idempotency_key in self.processed_keys:
            return self.processed_keys[idempotency_key]

        # Process the payment
        result = self._charge(payment_data)

        # Store the result for future duplicate requests
        self.processed_keys[idempotency_key] = result
        return result
```

### Idempotency by HTTP Method

| Method | Naturally Idempotent? | Strategy |
|--------|----------------------|----------|
| GET | Yes | Always safe to retry |
| PUT | Yes | Full replacement is idempotent |
| DELETE | Yes | Deleting twice = same result |
| POST | **No** | Use idempotency keys |
| PATCH | **Depends** | Use conditional updates (ETags) |

---

## Putting It All Together

Here's how these patterns combine in a production system:

```python
import requests
from requests.adapters import HTTPAdapter
from urllib3.util.retry import Retry

def create_resilient_client():
    """Create an HTTP client with production-grade resilience."""
    session = requests.Session()

    # Retry strategy with exponential backoff
    retry_strategy = Retry(
        total=3,
        backoff_factor=1,           # 1s, 2s, 4s
        status_forcelist=[429, 500, 502, 503, 504],
        allowed_methods=["GET", "PUT", "DELETE"],  # Only idempotent
    )

    adapter = HTTPAdapter(
        max_retries=retry_strategy,
        pool_connections=10,        # Connection pool size
        pool_maxsize=20,            # Max connections per host
    )

    session.mount("http://", adapter)
    session.mount("https://", adapter)

    return session

# Usage
client = create_resilient_client()
response = client.get(
    "https://api.example.com/users/42",
    timeout=(3, 10),
    headers={"Accept": "application/json"}
)
```

---

## Exercises

### Exercise 1: Timeout Calculator

Given a service chain A → B → C, where each hop has 100ms network latency and service C takes 500ms to process:

1. What is the minimum total latency for A's request?
2. If A's timeout is 2 seconds, what should B's timeout for calling C be?
3. What happens if B's timeout is greater than A's timeout?

### Exercise 2: Implement Retry Logic

Write a function that retries an HTTP GET request with:
- Maximum 4 retries
- Exponential backoff starting at 500ms
- Full jitter
- Only retry on 5xx status codes and connection errors
- Do NOT retry on 4xx status codes

### Exercise 3: Circuit Breaker Configuration

A service handles 1000 requests/second. 5% of requests to a dependency are failing.

1. How many failures occur per minute?
2. If your circuit breaker threshold is 50 failures in a 60-second window, will it trip?
3. What recovery timeout would you set, and why?

### Exercise 4: Rate Limiter Design

Design a rate limiter for an API with these tiers:

| Tier | Requests/min | Burst |
|------|-------------|-------|
| Free | 60 | 10 |
| Pro | 600 | 100 |
| Enterprise | 6000 | 1000 |

Which algorithm would you choose? Implement it using a token bucket.

---

## Key Takeaways

- **Always set timeouts** on every remote call — infinite timeouts are a bug
- **Use exponential backoff with jitter** for retries to avoid thundering herd
- **Circuit breakers** prevent cascading failures by failing fast
- **Bulkheads** isolate failures so one bad dependency doesn't take down everything
- **Load balancing** distributes traffic; choose the algorithm based on your workload
- **Service discovery** is essential in dynamic environments (containers, cloud)
- **Health checks** let infrastructure route traffic only to healthy instances
- **Connection pooling** avoids the overhead of creating connections per request
- **Rate limiting** protects services from being overwhelmed
- **Idempotency keys** make non-idempotent operations safe to retry
- **HTTP/2 and HTTP/3** offer significant improvements over HTTP/1.1 for distributed systems
- Combine these patterns together for production-grade resilience
