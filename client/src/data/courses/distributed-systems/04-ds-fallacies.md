---
title: Fallacies of Distributed Computing
---

## Fallacies of Distributed Computing

In this lesson, you'll learn about the **8 Fallacies of Distributed Computing** — false assumptions that programmers new to distributed systems invariably make. Understanding these fallacies will save you from costly mistakes.

---

## Background

In 1994, **Peter Deutsch** at Sun Microsystems compiled a list of 7 false assumptions that developers make when building distributed systems. **James Gosling** (creator of Java) later added an 8th. These are known as the **Fallacies of Distributed Computing**.

Despite being over 30 years old, these fallacies remain **just as relevant today** — arguably more so, with the rise of cloud computing, microservices, and globally distributed applications.

### The 8 Fallacies at a Glance

| # | Fallacy | Reality |
|---|---------|---------|
| 1 | The network is reliable | Networks fail all the time |
| 2 | Latency is zero | Every network hop adds delay |
| 3 | Bandwidth is infinite | Bandwidth is limited and costly |
| 4 | The network is secure | Networks are attack surfaces |
| 5 | Topology doesn't change | Network topology changes constantly |
| 6 | There is one administrator | Many teams manage the network |
| 7 | Transport cost is zero | Serialization and transmission have real costs |
| 8 | The network is homogeneous | Networks use diverse technologies |

---

## Fallacy 1: The Network Is Reliable

### The Assumption

> "If I send a message, it will be delivered."

Developers who've only built single-machine applications assume network communication is like a function call — you send data and it arrives. Always. Instantly.

### The Reality

Networks fail in many ways:

| Failure Mode | Cause | Frequency |
|-------------|-------|-----------|
| **Packet loss** | Congested routers drop packets | Common (0.1-1% on the internet) |
| **Connection reset** | Server crashes, firewall kills idle connections | Common |
| **DNS failure** | DNS server down or misconfigured | Occasional |
| **Hardware failure** | Switch, router, or NIC dies | Regular in large deployments |
| **Cable cut** | Construction, animals, anchors damage cables | Happens to undersea cables yearly |
| **Partition** | Network split — some nodes can't reach others | Rare but devastating |

### Real-World Examples

**Amazon S3 outage (2017)**: A typo in a command taken servers offline, causing a cascading failure across hundreds of services that depend on S3. Thousands of websites went down.

**Cloudflare outage (2020)**: A network configuration error in a backbone router caused a 27-minute outage affecting millions of websites.

**Facebook outage (2021)**: A BGP configuration error made Facebook, WhatsApp, and Instagram unreachable for 6 hours. The outage was so severe that engineers couldn't even enter the data centers because the badge system was also down.

### How to Design for It

```python
import time
import random

def send_with_retry(message, destination, max_retries=3):
    """Send a message with exponential backoff and retry."""
    for attempt in range(max_retries):
        try:
            response = network.send(message, destination)
            return response
        except NetworkError as e:
            if attempt == max_retries - 1:
                raise  # Give up after max retries

            # Exponential backoff with jitter
            wait_time = (2 ** attempt) + random.uniform(0, 1)
            print(f"Attempt {attempt + 1} failed: {e}. "
                  f"Retrying in {wait_time:.1f}s...")
            time.sleep(wait_time)
```

**Key patterns**:
- **Retry with exponential backoff** — Don't hammer a failing server
- **Circuit breakers** — Stop calling a service that's consistently failing
- **Timeouts** — Never wait forever for a response
- **Idempotency** — Make operations safe to retry (retrying a payment shouldn't charge twice)
- **Fallbacks** — Have a degraded-but-functional alternative

```
Normal operation:
  Request ──► Service A ──► Response

Service A failing:
  Request ──► Circuit Breaker ──► OPEN
                    │
                    ▼
              Fallback/Cache ──► Degraded Response
```

---

## Fallacy 2: Latency Is Zero

### The Assumption

> "Network calls are as fast as local function calls."

### The Reality

Even within a single data center, network latency is **orders of magnitude** greater than local operations:

| Operation | Latency |
|-----------|---------|
| L1 cache reference | 0.5 ns |
| L2 cache reference | 7 ns |
| RAM access | 100 ns |
| SSD read | 16,000 ns (16 μs) |
| **Network round-trip (same data center)** | **500,000 ns (0.5 ms)** |
| **Network round-trip (same region)** | **5,000,000 ns (5 ms)** |
| **Network round-trip (cross-continent)** | **100,000,000 ns (100 ms)** |
| HDD seek | 10,000,000 ns (10 ms) |

A network call within the same data center is **5,000x slower** than a RAM access. A cross-continent call is **1,000,000x slower**.

### The "Chatty" Protocol Problem

Latency compounds with the number of round trips. Consider fetching a user profile:

```
Chatty approach (BAD — 4 round trips):
  Client ──► Get user info          ──► 50ms
  Client ──► Get user's orders      ──► 50ms
  Client ──► Get user's preferences ──► 50ms
  Client ──► Get user's avatar      ──► 50ms
  Total: 200ms

Batch approach (GOOD — 1 round trip):
  Client ──► Get user profile (all data) ──► 60ms
  Total: 60ms
```

### How to Design for It

- **Batch requests** — Combine multiple small requests into one
- **Caching** — Store frequently accessed data locally
- **Prefetching** — Anticipate what data will be needed and fetch it early
- **Async processing** — Don't block the user waiting for non-critical operations
- **Data locality** — Move computation to where the data is, not the other way around
- **CDNs** — Cache content at edge locations near users

```python
# BAD: N+1 query problem
users = db.query("SELECT * FROM users LIMIT 100")
for user in users:
    # 100 separate network calls!
    orders = db.query(f"SELECT * FROM orders WHERE user_id = {user.id}")

# GOOD: Single query with JOIN
results = db.query("""
    SELECT u.*, o.*
    FROM users u
    LEFT JOIN orders o ON u.id = o.user_id
    LIMIT 100
""")
```

### Latency Math for System Design

When designing APIs, always calculate the **latency budget**:

If your SLA is 200ms response time:

```
Latency Budget: 200ms total
  ├── Network: client → load balancer     10ms
  ├── Network: LB → application server     2ms
  ├── Application processing               20ms
  ├── Network: app → database               2ms
  ├── Database query                        50ms
  ├── Network: database → app               2ms
  ├── Network: app → cache                  1ms
  ├── Cache lookup                          1ms
  ├── Serialization/deserialization         5ms
  ├── Network: app → LB                     2ms
  └── Network: LB → client                 10ms
                                          ─────
  Total:                                  105ms
  Remaining budget:                        95ms
```

Every additional network hop eats into your budget.

---

## Fallacy 3: Bandwidth Is Infinite

### The Assumption

> "I can send as much data as I want over the network."

### The Reality

Bandwidth is finite, expensive, and shared:

| Connection | Typical Bandwidth |
|-----------|------------------|
| Home WiFi | 50-500 Mbps |
| 4G Mobile | 10-50 Mbps |
| Server NIC | 1-25 Gbps |
| Data center backbone | 100-400 Gbps |
| Undersea cable | 200-500 Tbps (shared by millions) |

### When Bandwidth Matters

```
Scenario: Replicate a 1 TB database across regions

At 1 Gbps:  1 TB ÷ 1 Gbps = ~2.2 hours
At 10 Gbps: 1 TB ÷ 10 Gbps = ~13 minutes

But this ENTIRE pipe is used for replication.
Other traffic gets zero bandwidth during this time!
```

### The Bandwidth-Latency Product

The amount of data "in flight" at any moment:

$$\text{Data in flight} = \text{Bandwidth} \times \text{Latency}$$

For a 1 Gbps link with 100ms latency:

$$1 \text{ Gbps} \times 100 \text{ ms} = 100 \text{ Mb} = 12.5 \text{ MB}$$

This means 12.5 MB of data can be in the network at any moment. TCP's window size must accommodate this for full utilization.

### How to Design for It

- **Compress data** — Use gzip, zstd, or protocol-specific compression
- **Send only what's needed** — Use pagination, field selection (GraphQL), delta updates
- **Use efficient serialization** — Protocol Buffers and Avro are much smaller than JSON/XML
- **Implement backpressure** — Slow down producers when consumers can't keep up

```json
// BAD: Sending entire objects when only names are needed
{
  "users": [
    {"id": 1, "name": "Alice", "email": "...", "address": "...",
     "phone": "...", "avatar": "<base64 blob>", ...},
    // × 10,000 users = HUGE payload
  ]
}

// GOOD: Send only what's needed
{
  "users": [
    {"id": 1, "name": "Alice"},
    // × 10,000 users = manageable
  ]
}
```

| Format | Size for 1000 records |
|--------|----------------------|
| XML | ~1.2 MB |
| JSON | ~800 KB |
| Protocol Buffers | ~300 KB |
| Compressed Protobuf | ~100 KB |

---

## Fallacy 4: The Network Is Secure

### The Assumption

> "Data transmitted over the network is safe from interception or tampering."

### The Reality

Network traffic traverses many intermediaries — any of which could be compromised:

```
Your App ──► Switch ──► Router ──► ISP ──► Internet backbone
                                            ──► ISP ──► Router ──► Server

Any hop could be:
  • Eavesdropping (reading your data)
  • Modifying data in transit (MITM attack)
  • Impersonating a legitimate server
  • Injecting malicious responses
```

### Common Attack Vectors

| Attack | Description | Mitigation |
|--------|-------------|------------|
| **Eavesdropping** | Reading unencrypted traffic | TLS/SSL encryption |
| **Man-in-the-middle** | Intercepting and altering traffic | Certificate pinning, mutual TLS |
| **Replay attacks** | Re-sending captured valid requests | Nonces, timestamps, HMAC |
| **DNS spoofing** | Redirecting DNS to malicious servers | DNSSEC, DNS over HTTPS |
| **DDoS** | Overwhelming a service with traffic | Rate limiting, CDN, WAF |
| **Injection** | Sending malicious data in requests | Input validation, parameterized queries |

### How to Design for It

```python
# ALWAYS use TLS for service-to-service communication
import ssl
import http.client

context = ssl.create_default_context()
# Verify certificates, check hostnames
connection = http.client.HTTPSConnection(
    "api.internal.example.com",
    context=context
)
```

**Security principles for distributed systems**:
- **Encrypt everything in transit** — Use TLS for all internal and external communication
- **Authenticate all parties** — Mutual TLS (mTLS) between services
- **Authorize every request** — Don't trust internal traffic automatically
- **Validate all input** — Every service boundary is a security boundary
- **Principle of least privilege** — Services should have minimal permissions
- **Zero trust architecture** — Never trust, always verify (even internal networks)

### Modern Relevance

With microservices, the network attack surface has exploded:

```
Monolith:    1 entry point to secure
Microservices: 50+ services × connections between them = hundreds of network paths

Each path is a potential attack vector!
```

Service meshes (like Istio, Linkerd) help by automatically providing mTLS between services.

---

## Fallacy 5: Topology Doesn't Change

### The Assumption

> "The network layout (which machines are connected to which) is static."

### The Reality

Network topology changes constantly:

| Change | Cause | Frequency |
|--------|-------|-----------|
| Server added/removed | Auto-scaling, maintenance | Daily |
| Route change | BGP updates, traffic engineering | Continuously |
| Failover | Hardware failure, disaster recovery | Weekly-monthly |
| Cloud instance relocation | Spot instances, rebalancing | Hourly |
| DNS changes | Service discovery updates | Continuously |

### Consequences

- **Hard-coded IP addresses break** when machines move
- **Cached routes become stale** after topology changes
- **Assumptions about co-location** fail when VMs migrate

### How to Design for It

```python
# BAD: Hard-coded addresses
DATABASE_HOST = "192.168.1.42"

# GOOD: Service discovery
DATABASE_HOST = service_registry.lookup("database-primary")
# Returns current healthy instance, wherever it is
```

**Key patterns**:
- **Service discovery** — Use systems like Consul, etcd, or Kubernetes DNS to find services by name
- **Load balancers** — Abstract away individual server addresses
- **Health checks** — Continuously verify that endpoints are reachable
- **DNS with short TTLs** — Allow rapid re-routing during topology changes

```
Service A needs to call Service B:

Static (fragile):
  Service A ──► 10.0.1.42:8080 (hard-coded)

Dynamic (resilient):
  Service A ──► DNS: "service-b.internal"
            ──► Service Registry returns: 10.0.2.17:8080
            ──► Health check: OK
            ──► Send request
```

---

## Fallacy 6: There Is One Administrator

### The Assumption

> "A single person or team controls the entire network and all services."

### The Reality

In any non-trivial system, many different teams, organizations, and even companies manage different parts:

```
Your Application
  └── Your team manages app servers
       └── Platform team manages Kubernetes cluster
            └── Cloud provider manages physical infrastructure
                 └── ISP manages network transit
                      └── DNS provider manages name resolution
                           └── CDN provider manages edge caching
                                └── Third-party APIs (Stripe, Twilio)
                                     └── Their infrastructure teams...
```

### Consequences

- **Different policies** — Each organization has its own security, uptime, and change management policies
- **Blame game** — When something breaks, determining who is responsible is hard
- **Coordination overhead** — Changes that cross organizational boundaries are slow
- **Inconsistent SLAs** — Your 99.99% availability depends on every upstream also being 99.99%+
- **No global visibility** — You can't see the full picture of what's happening

### Compound SLA Problem

If your service depends on 5 external services, each with 99.9% availability:

$$\text{Overall availability} = (0.999)^5 = 0.995 = 99.5\%$$

That's only **99.5%** — not 99.9%! Each dependency **multiplies** your downtime.

| Dependencies | Compound Availability | Annual Downtime |
|-------------|----------------------|-----------------|
| 1 | 99.9% | 8.7 hours |
| 3 | 99.7% | 26.3 hours |
| 5 | 99.5% | 43.8 hours |
| 10 | 99.0% | 87.6 hours |
| 20 | 98.0% | 175.2 hours |

### How to Design for It

- **Assume dependencies will fail** — Build fallbacks and graceful degradation
- **Limit external dependencies** — The fewer, the better
- **Set aggressive timeouts** — Don't let slow dependencies hang your system
- **Monitor everything** — Observe latency and errors at every boundary
- **Define clear contracts** — Use SLAs, API versioning, and change notification policies
- **Use circuit breakers** — Automatically stop calling failing dependencies

---

## Fallacy 7: Transport Cost Is Zero

### The Assumption

> "Sending data over the network is free in terms of time, CPU, and money."

### The Reality

Network transport has three types of costs:

### Computational Cost

Serializing, deserializing, encrypting, and compressing data all consume CPU:

```python
import json
import time

data = {"users": [{"id": i, "name": f"User {i}",
                   "scores": list(range(100))} for i in range(10000)]}

# Serialization cost
start = time.time()
json_bytes = json.dumps(data).encode()
serialize_time = time.time() - start

# Deserialization cost
start = time.time()
parsed = json.loads(json_bytes)
deserialize_time = time.time() - start

print(f"Serialize:   {serialize_time*1000:.1f} ms")
print(f"Deserialize: {deserialize_time*1000:.1f} ms")
print(f"Payload:     {len(json_bytes) / 1024:.1f} KB")

# For 1000 requests/second, that's significant CPU time!
```

### Financial Cost

Cloud providers charge for network traffic:

| Traffic Type | AWS Cost (approximate) |
|-------------|----------------------|
| Same AZ | Free |
| Cross AZ (same region) | $0.01/GB |
| Cross region | $0.02/GB |
| Internet egress | $0.09/GB |
| CloudFront (CDN) | $0.085/GB |

For a service doing 1 TB/day of cross-region traffic: $0.02 × 1,000 × 30 = **$600/month** just for network!

### Infrastructure Cost

- Load balancers, firewalls, and proxies need hardware/software
- TLS termination consumes CPU
- Network monitoring and logging require storage
- Service meshes add sidecar proxies to every pod

### How to Design for It

- **Minimize data transfer** — Don't send unnecessary fields
- **Use efficient formats** — Binary formats (Protobuf, Avro) over text (JSON, XML)
- **Keep traffic local** — Co-locate services that communicate frequently
- **Cache aggressively** — Reduce repeated transfers of the same data
- **Compress payloads** — Especially for large responses

```
Service A and Service B exchange 10 GB/day

If in SAME availability zone:        $0/month
If in DIFFERENT availability zones:   $3/month
If in DIFFERENT regions:              $6/month
If serving to INTERNET:               $27/month

Co-locating services saves real money at scale!
```

---

## Fallacy 8: The Network Is Homogeneous

### The Assumption

> "All nodes use the same network technology, protocols, and data formats."

### The Reality

Real networks are a patchwork of different technologies:

| Layer | Heterogeneity |
|-------|--------------|
| **Physical** | Ethernet, WiFi, 5G, fiber, satellite |
| **Protocols** | TCP, UDP, HTTP/1.1, HTTP/2, HTTP/3 (QUIC), gRPC, WebSocket |
| **Serialization** | JSON, XML, Protobuf, Avro, MessagePack, CBOR |
| **Encoding** | UTF-8, UTF-16, ASCII, Latin-1 |
| **Byte order** | Big-endian, little-endian |
| **OS** | Linux, Windows, macOS, embedded RTOS |
| **Languages** | Java, Python, Go, Rust, C++, JavaScript |
| **Time zones** | UTC, local, with/without DST |
| **Date formats** | ISO 8601, Unix timestamps, locale-specific |

### The Interoperability Challenge

```
Mobile App (Swift, iOS)
    ↕ HTTP/2, JSON
API Gateway (Go)
    ↕ gRPC, Protobuf
User Service (Java)
    ↕ JDBC, binary protocol
PostgreSQL Database
    ↕ WAL streaming
PostgreSQL Replica
```

Each boundary requires format translation, protocol adaptation, and error mapping.

### How to Design for It

- **Standard protocols** — Use widely adopted protocols (HTTP, gRPC) at service boundaries
- **Schema definitions** — Use schemas (Protobuf, OpenAPI, JSON Schema) as contracts
- **UTF-8 everywhere** — Standardize on one text encoding
- **ISO 8601 dates** — Use a standard date format (`2024-01-15T14:30:00Z`)
- **API versioning** — Support gradual migration between formats
- **Use middleware/adapters** — Abstract protocol differences behind common interfaces

```python
# Standard date handling
from datetime import datetime, timezone

# ALWAYS use UTC internally
now = datetime.now(timezone.utc)

# ALWAYS use ISO 8601 for serialization
timestamp = now.isoformat()  # "2024-01-15T14:30:00+00:00"

# Convert to local time only for display
local_time = now.astimezone(user_timezone)
```

---

## Summary Table: All 8 Fallacies

| # | Fallacy | Consequence of Believing It | How to Avoid |
|---|---------|---------------------------|--------------|
| 1 | Network is reliable | Dropped messages, lost data | Retries, idempotency, circuit breakers |
| 2 | Latency is zero | Slow UX, chatty protocols | Batching, caching, async |
| 3 | Bandwidth is infinite | Network congestion, slow transfers | Compression, pagination, efficient formats |
| 4 | Network is secure | Data breaches, MITM attacks | TLS, mTLS, zero trust |
| 5 | Topology doesn't change | Broken connections, stale routes | Service discovery, health checks |
| 6 | One administrator | Coordination failures, blame games | SLAs, monitoring, fallbacks |
| 7 | Transport cost is zero | Wasted CPU, high cloud bills | Efficient serialization, co-location |
| 8 | Network is homogeneous | Integration failures, encoding bugs | Standard protocols, schemas |

---

## Modern Relevance

These 30-year-old fallacies are **more relevant than ever** in the age of:

### Cloud Computing

- Networks span multiple availability zones and regions
- Resources are ephemeral (VMs come and go)
- You share infrastructure with other tenants (noisy neighbors)

### Microservices

- Instead of one process, you have hundreds communicating over the network
- Every function call that was local is now a network call
- The blast radius of each fallacy is multiplied

### Edge Computing

- Devices at the edge have unreliable, high-latency connections
- Bandwidth to edge devices is severely limited
- Topology changes as devices move (mobile, IoT)

### Global Distribution

- Latency between regions is a hard physical constraint
- Different regions have different regulations, administrators, and network characteristics
- The network between regions is the least reliable and most expensive

---

## Try It Yourself

### Exercise 1: Fallacy Identification

For each scenario, identify which fallacy (or fallacies) are being violated:

1. A developer writes code that calls a remote API without any error handling
2. A service makes 50 sequential REST calls to render a single page
3. An application sends full database records (including unused fields) to the frontend
4. Internal microservices communicate using plain HTTP (no TLS)
5. Service configuration uses hard-coded IP addresses
6. An architect designs a system with 15 external API dependencies and promises 99.99% uptime
7. A developer uses `datetime.now()` (local time) in log timestamps across global services

<details>
<summary>Click to see answers</summary>

1. **Fallacy 1** (Network is reliable) — No retry, no error handling
2. **Fallacy 2** (Latency is zero) — Chatty protocol, no batching
3. **Fallacy 3** (Bandwidth is infinite) — Sending unnecessary data
4. **Fallacy 4** (Network is secure) — No encryption for internal traffic
5. **Fallacy 5** (Topology doesn't change) — Hard-coded addresses
6. **Fallacy 6** (One administrator) — Compound availability: $(0.9999)^{15} = 99.85\%$, not 99.99%
7. **Fallacy 8** (Network is homogeneous) — Assuming all servers use the same timezone

</details>

### Exercise 2: Design Review

Review this code and identify all the fallacies it assumes:

```java
public class OrderService {
    private static final String PAYMENT_URL = "http://10.0.1.42:8080";
    
    public Order createOrder(OrderRequest request) {
        // Call payment service
        PaymentResult payment = httpClient.post(
            PAYMENT_URL + "/charge",
            request.getPaymentInfo()
        );
        
        // Call inventory service
        InventoryResult inventory = httpClient.post(
            "http://10.0.1.43:8081/reserve",
            request.getItems()
        );
        
        // Call notification service
        httpClient.post(
            "http://10.0.1.44:8082/notify",
            new NotificationRequest(request.getUserEmail(), "Order placed!")
        );
        
        return new Order(payment, inventory);
    }
}
```

<details>
<summary>Click to see answers</summary>

- **Fallacy 1**: No error handling, no retries — what if payment service is down?
- **Fallacy 2**: Three sequential network calls — should batch or parallelize
- **Fallacy 4**: Using `http://` not `https://` — no encryption
- **Fallacy 5**: Hard-coded IP addresses (`10.0.1.42`, etc.) — will break on topology change
- **Fallacy 7**: No consideration of serialization format — using default (probably JSON, which is verbose)

Improved version would use service discovery, HTTPS, retry logic, parallel calls for independent operations, and async notification.

</details>

### Exercise 3: Calculate the Cost

Your microservice architecture has:
- 20 services
- Each service averages 100 inter-service calls/second
- Average payload size: 5 KB
- Services are spread across 3 AWS availability zones

Calculate:
1. Total inter-service traffic per day (in GB)
2. Monthly cross-AZ network cost (at $0.01/GB per direction)

<details>
<summary>Click to see answers</summary>

1. Traffic per day:
   - 20 services × 100 calls/s = 2,000 calls/second
   - 2,000 × 5 KB = 10,000 KB/s = ~10 MB/s
   - Per day: 10 MB/s × 86,400 s = 864,000 MB = **864 GB/day**

2. Assuming ~2/3 of traffic crosses AZ boundaries:
   - Cross-AZ traffic: 864 × 2/3 = ~576 GB/day
   - Monthly: 576 × 30 = 17,280 GB
   - Cost (both directions): 17,280 × $0.01 × 2 = **$345.60/month**
   - That's just network transfer cost — not including compute, storage, etc.!

</details>

---

## Key Takeaways

- The **8 Fallacies of Distributed Computing** are false assumptions that lead to fragile, slow, and insecure systems
- **The network is unreliable** — Always implement retries, timeouts, and circuit breakers
- **Latency is not zero** — Batch requests, cache data, and minimize round trips
- **Bandwidth is finite** — Compress data, use efficient formats, and send only what's needed
- **The network is not secure** — Encrypt everything, authenticate all parties, validate all input
- **Topology changes** — Use service discovery instead of hard-coded addresses
- **Multiple administrators exist** — Account for compound failure probabilities across dependencies
- **Transport has real costs** — Consider CPU, financial, and infrastructure costs of network communication
- **The network is heterogeneous** — Use standard protocols and formats at boundaries
- These fallacies are **more relevant than ever** with cloud computing, microservices, and global distribution
- In the next lesson, we'll formalize how we think about distributed systems through **system models and properties**
