---
title: Networking Fundamentals for Distributed Systems
---

## Networking Fundamentals for Distributed Systems

In this lesson, you'll learn the **networking foundations** that underpin every distributed system — from the models that organize network communication to the practical realities of latency, partitions, and reliable delivery.

Every distributed system is built on top of a network. Understanding how networks work is **essential** to building reliable distributed applications.

---

## Why Networking Matters for Distributed Systems

Distributed systems are, at their core, processes communicating over a network. Every design decision — consistency, availability, fault tolerance — depends on the **properties of the underlying network**.

```
┌──────────┐    Network    ┌──────────┐
│  Node A  │◄────────────►│  Node B  │
└──────────┘               └──────────┘
      │                          │
      │      What can go wrong?  │
      │  • Messages can be lost  │
      │  • Messages can be delayed│
      │  • Messages can arrive   │
      │    out of order          │
      │  • The network can split │
      └──────────────────────────┘
```

---

## The OSI Model Review

The **OSI (Open Systems Interconnection)** model organizes network communication into 7 layers. Each layer has a specific responsibility.

| Layer | Name | Purpose | Example |
|-------|------|---------|---------|
| 7 | **Application** | User-facing protocols | HTTP, gRPC, DNS |
| 6 | **Presentation** | Data encoding/encryption | TLS, JSON, Protobuf |
| 5 | **Session** | Connection management | RPC sessions |
| 4 | **Transport** | Reliable/unreliable delivery | TCP, UDP |
| 3 | **Network** | Routing between networks | IP, ICMP |
| 2 | **Data Link** | Local network delivery | Ethernet, Wi-Fi |
| 1 | **Physical** | Raw bit transmission | Cables, radio waves |

### How Data Flows Through the Layers

```
Application:   "GET /api/users"
     ↓ encapsulate
Transport:     TCP segment (src port: 54321, dst port: 80)
     ↓ encapsulate
Network:       IP packet (src: 10.0.0.5, dst: 93.184.216.34)
     ↓ encapsulate
Data Link:     Ethernet frame (MAC addresses)
     ↓ transmit
Physical:      Electrical signals on the wire
```

> **Note:** In practice, distributed systems engineers mostly work with **layers 4–7** (Transport through Application).

---

## The TCP/IP Model

The **TCP/IP model** is what the internet actually uses. It simplifies the OSI model into 4 layers:

| TCP/IP Layer | OSI Equivalent | Key Protocols |
|-------------|----------------|---------------|
| **Application** | Layers 5–7 | HTTP, DNS, gRPC, SMTP |
| **Transport** | Layer 4 | TCP, UDP, QUIC |
| **Internet** | Layer 3 | IP (v4/v6), ICMP |
| **Link** | Layers 1–2 | Ethernet, Wi-Fi, ARP |

### IP Addresses and Ports

Every process in a distributed system is identified by an **IP address + port** combination:

```
Address:  192.168.1.100:8080
          ─────────────  ────
          IP address     Port

IPv4: 32 bits → ~4.3 billion addresses
IPv6: 128 bits → ~3.4 × 10³⁸ addresses
```

The number of possible IPv6 addresses is:

$$2^{128} \approx 3.4 \times 10^{38}$$

Ports range from 0 to 65535 ($2^{16} - 1$):

| Port Range | Name | Usage |
|-----------|------|-------|
| 0–1023 | Well-known | HTTP (80), HTTPS (443), SSH (22) |
| 1024–49151 | Registered | MySQL (3306), PostgreSQL (5432) |
| 49152–65535 | Dynamic/Ephemeral | Client-side ports |

---

## TCP vs UDP in Distributed Systems

The **transport layer** choice has huge implications for distributed system design.

### TCP (Transmission Control Protocol)

TCP provides **reliable, ordered, connection-oriented** communication.

| Feature | TCP Behavior |
|---------|-------------|
| **Reliability** | Retransmits lost packets |
| **Ordering** | Delivers data in order |
| **Connection** | 3-way handshake before data transfer |
| **Flow control** | Adjusts speed to receiver capacity |
| **Congestion control** | Adjusts speed to network capacity |

**TCP 3-Way Handshake:**

```
Client                Server
  │                      │
  │──── SYN ────────────►│
  │                      │
  │◄─── SYN-ACK ────────│
  │                      │
  │──── ACK ────────────►│
  │                      │
  │   Connection open!   │
```

### UDP (User Datagram Protocol)

UDP provides **unreliable, unordered, connectionless** communication.

| Feature | UDP Behavior |
|---------|-------------|
| **Reliability** | No retransmission (fire and forget) |
| **Ordering** | No ordering guarantees |
| **Connection** | No handshake needed |
| **Overhead** | Minimal header (8 bytes vs TCP's 20+) |
| **Speed** | Lower latency |

### When to Use Each

| Use Case | Protocol | Why |
|----------|----------|-----|
| Database replication | **TCP** | Every byte matters, order matters |
| HTTP/gRPC APIs | **TCP** | Reliability required |
| Heartbeat/health checks | **UDP** | Speed > reliability |
| Log shipping | **TCP** or **UDP** | Depends on loss tolerance |
| Service discovery | **UDP** | Fast lookups (DNS uses UDP) |
| Video streaming | **UDP** | Tolerate loss, need low latency |
| Gossip protocols | **UDP** | Redundancy handles loss |

---

## Sockets Programming Basics

A **socket** is the programming interface for network communication. It represents one endpoint of a two-way communication link.

### TCP Server in Python

```python
import socket

def start_tcp_server(host="0.0.0.0", port=8080):
    """A simple TCP echo server."""
    # Create a TCP socket
    server_socket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)

    # Allow port reuse (important for distributed systems!)
    server_socket.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)

    # Bind to address and start listening
    server_socket.bind((host, port))
    server_socket.listen(5)  # backlog queue size
    print(f"Server listening on {host}:{port}")

    while True:
        # Accept a new connection
        client_socket, client_addr = server_socket.accept()
        print(f"Connection from {client_addr}")

        try:
            # Receive data (up to 4096 bytes)
            data = client_socket.recv(4096)
            if data:
                print(f"Received: {data.decode()}")
                # Echo it back
                client_socket.sendall(data)
        finally:
            client_socket.close()

if __name__ == "__main__":
    start_tcp_server()
```

### TCP Client in Python

```python
import socket

def send_message(host="localhost", port=8080, message="Hello!"):
    """Send a message to the TCP server and get a response."""
    client_socket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)

    try:
        # Connect to the server
        client_socket.connect((host, port))

        # Send data
        client_socket.sendall(message.encode())

        # Receive response
        response = client_socket.recv(4096)
        print(f"Response: {response.decode()}")
    finally:
        client_socket.close()

if __name__ == "__main__":
    send_message()
```

### UDP Socket Example in Python

```python
import socket

# UDP Server
def udp_server(host="0.0.0.0", port=9090):
    sock = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)  # DGRAM = UDP
    sock.bind((host, port))
    print(f"UDP server on {host}:{port}")

    while True:
        data, addr = sock.recvfrom(4096)
        print(f"From {addr}: {data.decode()}")
        sock.sendto(b"ACK", addr)  # No connection needed!

# UDP Client
def udp_client(host="localhost", port=9090):
    sock = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
    sock.sendto(b"Ping!", (host, port))

    response, _ = sock.recvfrom(4096)
    print(f"Response: {response.decode()}")
```

> **Try It:** Run the TCP server in one terminal and the client in another. Then try the same with UDP. Notice how UDP doesn't need `connect()` or `accept()`.

---

## Connection Management

In distributed systems, managing connections efficiently is critical. A single node might need to communicate with hundreds of other nodes.

### Connection Pooling

Creating a new TCP connection for every request is expensive (3-way handshake + TLS negotiation). **Connection pooling** reuses existing connections.

```python
import socket
from collections import deque

class ConnectionPool:
    """A simple connection pool for TCP connections."""

    def __init__(self, host, port, max_size=10):
        self.host = host
        self.port = port
        self.max_size = max_size
        self.pool = deque()  # available connections

    def get_connection(self):
        """Get a connection from the pool or create a new one."""
        if self.pool:
            return self.pool.popleft()

        sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        sock.connect((self.host, self.port))
        return sock

    def return_connection(self, sock):
        """Return a connection to the pool."""
        if len(self.pool) < self.max_size:
            self.pool.append(sock)
        else:
            sock.close()  # pool is full, discard
```

### Keep-Alive and Timeouts

```python
import socket

sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)

# Enable TCP keep-alive (detect dead connections)
sock.setsockopt(socket.SOL_SOCKET, socket.SO_KEEPALIVE, 1)

# Set timeouts (don't wait forever!)
sock.settimeout(5.0)  # 5-second timeout for all operations

try:
    sock.connect(("example.com", 80))
except socket.timeout:
    print("Connection timed out — node may be down")
```

---

## Network Partitions

A **network partition** occurs when some nodes can communicate with each other but **not with other nodes**. This is the "P" in the **CAP theorem**.

```
      Network Partition
           ║
┌──────────║──────────┐
│  Node A  ║  Node C  │
│  Node B  ║  Node D  │
│          ║          │
│ Partition║Partition │
│    Left  ║  Right   │
└──────────║──────────┘
           ║
  A ↔ B ✓  ║  C ↔ D ✓
  A ↔ C ✗  ║  B ↔ D ✗
```

### Types of Partitions

| Type | Description | Example |
|------|-------------|---------|
| **Full partition** | Complete split into two groups | Data center link failure |
| **Partial partition** | Some pairs can communicate, others can't | Asymmetric routing failure |
| **Asymmetric partition** | A can reach B, but B can't reach A | Firewall misconfiguration |

### How Systems Handle Partitions

| Strategy | Behavior During Partition | Trade-off |
|----------|--------------------------|-----------|
| **CP (Consistency)** | Reject writes to minority partition | Availability sacrificed |
| **AP (Availability)** | Accept writes everywhere, reconcile later | Consistency sacrificed |
| **Detect and alert** | Stop accepting requests, alert operators | Both sacrificed temporarily |

---

## Bandwidth and Latency

Two fundamental network metrics that constrain distributed system design.

### Bandwidth

**Bandwidth** is the maximum data transfer rate — how much data the pipe can carry.

| Link Type | Typical Bandwidth |
|-----------|------------------|
| Home Wi-Fi | 100–1000 Mbps |
| Data center link | 10–100 Gbps |
| Cross-region WAN | 1–10 Gbps |
| Submarine cable | 200+ Tbps (total) |

### Latency

**Latency** is the time for a message to travel from source to destination.

| Route | Typical Round-Trip Time (RTT) |
|-------|------------------------------|
| Same data center | 0.1–1 ms |
| Same region | 1–5 ms |
| Cross-continent | 30–100 ms |
| Global (e.g., US ↔ Australia) | 150–300 ms |

### The Speed of Light Limit

Light travels at $c \approx 3 \times 10^8$ m/s in a vacuum. In fiber optic cable, it's about $\frac{2}{3}c$:

$$v_{fiber} \approx 2 \times 10^8 \text{ m/s}$$

New York to London is ~5,500 km. Minimum one-way latency:

$$t = \frac{5{,}500 \times 10^3}{2 \times 10^8} = 27.5 \text{ ms}$$

Minimum RTT ≈ 55 ms. **You cannot beat the speed of light** — this sets a hard floor on latency.

### Bandwidth-Delay Product

The **bandwidth-delay product (BDP)** tells you how much data is "in flight" at any moment:

$$BDP = \text{Bandwidth} \times \text{RTT}$$

For a 1 Gbps link with 100 ms RTT:

$$BDP = 1 \times 10^9 \times 0.1 = 100 \times 10^6 \text{ bits} = 12.5 \text{ MB}$$

This means 12.5 MB of data can be in transit at once — the TCP window size should match this for optimal throughput.

---

## Reliable vs Unreliable Delivery

### Unreliable Delivery (Best Effort)

IP and UDP provide **best-effort delivery**: packets may be lost, duplicated, or reordered.

```
Sender:   [1] [2] [3] [4] [5]
           ↓   ↓   ✗   ↓   ↓   ← packet 3 lost
Receiver: [1] [2]     [4] [5]
```

### Reliable Delivery Mechanisms

TCP provides reliability through several mechanisms:

| Mechanism | How It Works |
|-----------|-------------|
| **Sequence numbers** | Number each byte to detect gaps |
| **Acknowledgments (ACKs)** | Receiver confirms what it got |
| **Retransmission** | Resend after timeout or duplicate ACKs |
| **Checksums** | Detect corrupted data |

```
Sender              Receiver
  │── Seq 1 ───────►│
  │── Seq 2 ───────►│
  │── Seq 3 ──✗     │  (lost!)
  │── Seq 4 ───────►│
  │                  │
  │◄── ACK 1,2,4 ──│  (gap detected!)
  │                  │
  │── Seq 3 ───────►│  (retransmit)
  │                  │
  │◄── ACK 1-4 ────│  (all received)
```

### Application-Level Reliability

Even with TCP, distributed systems need **application-level reliability**:

- **Idempotency**: safe to retry without side effects
- **Deduplication**: detect and discard duplicate messages
- **End-to-end checksums**: verify data integrity across the full path

---

## Multicast and Broadcast

### Unicast vs Broadcast vs Multicast

| Mode | Description | Use Case |
|------|-------------|----------|
| **Unicast** | One sender → one receiver | API calls, database queries |
| **Broadcast** | One sender → all nodes | ARP requests, service discovery |
| **Multicast** | One sender → a group of nodes | Pub/sub, group membership |

### IP Multicast

```
Multicast address range: 224.0.0.0 – 239.255.255.255

Sender sends ONE packet to multicast group 239.1.1.1
  → Network replicates it to all group members
  → Much more efficient than N unicast messages!
```

### Application-Level Multicast

In practice, most distributed systems use **application-level multicast** because IP multicast is unreliable and not supported across the internet.

```
        Gossip Protocol (Application-Level Multicast)

Round 1:  A tells B and C
Round 2:  B tells D, C tells E
Round 3:  D tells F, E tells G

After O(log N) rounds, all N nodes have the message!
```

The number of rounds to reach all $N$ nodes with fan-out $f$:

$$\text{Rounds} \approx \lceil \log_f N \rceil$$

---

## Network Topologies for Distributed Systems

The **topology** defines how nodes are connected.

| Topology | Description | Pros | Cons |
|----------|-------------|------|------|
| **Star** | All nodes connect to a central hub | Simple, easy routing | Single point of failure |
| **Mesh** | Every node connects to every other | Highly resilient | $O(N^2)$ connections |
| **Ring** | Nodes form a circle | Equal load distribution | Single break disrupts ring |
| **Tree** | Hierarchical structure | Scalable routing | Root is a bottleneck |
| **Hybrid** | Mix of topologies | Best of multiple worlds | Complex to manage |

```
Star:          Mesh:          Ring:
    B              A───B          A───B
    │              │╲ ╱│          │   │
A───Hub───C        │ ╳ │          D   C
    │              │╱ ╲│          │   │
    D              C───D          F───E
```

### Data Center Topology: Fat Tree / Clos

Modern data centers use a **fat-tree (Clos) topology** for high bandwidth and redundancy:

```
       ┌─────┐   ┌─────┐
       │Core1│   │Core2│     ← Core switches
       └──┬──┘   └──┬──┘
     ┌────┼────┬────┼────┐
  ┌──┴─┐┌─┴──┐┌┴──┐┌┴──┐
  │Agg1││Agg2││Agg3││Agg4│  ← Aggregation
  └─┬──┘└─┬──┘└─┬──┘└─┬──┘
  ┌─┴─┐ ┌─┴─┐ ┌─┴─┐ ┌─┴─┐
  │ToR│ │ToR│ │ToR│ │ToR│   ← Top-of-Rack
  └─┬─┘ └─┬─┘ └─┬─┘ └─┬─┘
  Servers  Servers ...        ← Servers
```

---

## NAT Traversal

**NAT (Network Address Translation)** lets multiple devices share a single public IP. This creates challenges for distributed systems where nodes need to reach each other directly.

### The NAT Problem

```
Private network:          Public internet:
  10.0.0.1 ──┐
  10.0.0.2 ──┼── NAT ── 203.0.113.5
  10.0.0.3 ──┘
```

Nodes behind different NATs **cannot connect to each other** directly. Solutions include:

| Technique | How It Works | Limitation |
|-----------|-------------|------------|
| **Port forwarding** | Manually map external port to internal IP | Requires router access |
| **STUN** | Discover your public IP/port via a server | Fails with symmetric NAT |
| **TURN** | Relay traffic through a server | Adds latency, costs bandwidth |
| **Hole punching** | Both sides send packets simultaneously | Unreliable, NAT-dependent |
| **UPnP/NAT-PMP** | Automatically configure port mapping | Security risk, not always available |

### STUN Example (Using bash)

```bash
# Discover your public IP using a STUN server
# (conceptual — real STUN uses a binary protocol)
curl -s https://api.ipify.org
# Output: 203.0.113.5

# Check if a port is reachable from outside
nc -zv your-public-ip 8080
```

---

## DNS as a Distributed System

The **Domain Name System (DNS)** is one of the oldest and most successful distributed systems. It translates domain names to IP addresses.

### DNS Hierarchy

```
                    Root (.)
                   ╱    ╲
               .com     .org
              ╱    ╲
         google   example
        ╱     ╲
     www     mail
```

### DNS Resolution Process

```
Client                Local DNS        Root DNS     .com DNS    example.com DNS
  │                      │               │             │              │
  │─ example.com? ──────►│               │             │              │
  │                      │─ .com? ──────►│             │              │
  │                      │◄─ go to .com ─│             │              │
  │                      │─ example.com? ──────────────►│              │
  │                      │◄─ go to ns.example.com ─────│              │
  │                      │─ example.com? ──────────────────────────────►│
  │                      │◄─ 93.184.216.34 ────────────────────────────│
  │◄─ 93.184.216.34 ────│               │             │              │
```

### DNS as Distributed System Design

| Property | DNS Approach |
|----------|-------------|
| **Scalability** | Hierarchical delegation |
| **Availability** | Multiple nameservers per zone |
| **Caching** | TTL-based caching at every level |
| **Consistency** | Eventual consistency (propagation delay) |
| **Partition tolerance** | Cached answers survive partitions |

### DNS for Service Discovery

In modern distributed systems, DNS is used for **service discovery**:

```bash
# Kubernetes uses DNS for service discovery
# A service named "user-service" in namespace "prod" is reachable at:
nslookup user-service.prod.svc.cluster.local

# SRV records provide port information too
dig SRV _grpc._tcp.user-service.prod.svc.cluster.local

# AWS Route 53 / Cloud DNS for cross-region service discovery
dig A api.us-east.myapp.internal
```

### DNS Round-Robin Load Balancing

```bash
# Multiple A records for the same domain
$ dig A example.com
example.com.   300  IN  A  93.184.216.34
example.com.   300  IN  A  93.184.216.35
example.com.   300  IN  A  93.184.216.36

# Each client picks a different IP → basic load balancing!
```

---

## Testing Network Behavior (Practical Tools)

```bash
# Measure latency to a host
ping -c 5 google.com

# Trace the route packets take
traceroute google.com

# Test TCP connectivity
nc -zv example.com 80

# Simulate network issues (Linux — useful for testing!)
# Add 100ms latency
sudo tc qdisc add dev eth0 root netem delay 100ms

# Simulate 10% packet loss
sudo tc qdisc add dev eth0 root netem loss 10%

# Limit bandwidth to 1 Mbit/s
sudo tc qdisc add dev eth0 root tbf rate 1mbit burst 32kbit latency 400ms

# Remove all simulated issues
sudo tc qdisc del dev eth0 root
```

---

## Exercises

1. **TCP Echo Server**: Extend the TCP server example to handle multiple clients concurrently using Python's `threading` or `select` module.

2. **Latency Calculator**: Given two cities and their approximate distance, calculate the minimum possible RTT over fiber optic cable. Remember: $v_{fiber} \approx 2 \times 10^8$ m/s.

3. **Partition Scenario**: You have 5 nodes (A–E). A network partition splits them into {A, B} and {C, D, E}. If you're building a CP system with majority quorum, which partition can continue serving writes? Why?

4. **DNS Exploration**: Use `dig` or `nslookup` to trace how DNS resolves `google.com`. How many nameservers are involved? What are the TTL values?

5. **UDP vs TCP**: Write a simple benchmark that sends 10,000 short messages via TCP and UDP. Measure the total time for each. When does UDP's speed advantage matter?

---

## Key Takeaways

| Concept | Key Point |
|---------|-----------|
| **OSI/TCP-IP** | Know layers 4–7 well; most distributed systems work here |
| **TCP vs UDP** | TCP = reliable + ordered; UDP = fast + lightweight |
| **Sockets** | The fundamental API for network communication |
| **Partitions** | Networks **will** partition; design for it (CAP theorem) |
| **Latency** | Speed of light sets a hard floor; can't be eliminated |
| **Bandwidth** | Measure BDP to size buffers and windows correctly |
| **Multicast** | Application-level gossip often beats IP multicast |
| **NAT** | Real-world obstacle; use STUN/TURN for peer-to-peer |
| **DNS** | A distributed system itself; used for service discovery |

---

## Next Steps

Now that you understand the networking substrate, the next lesson covers **Remote Procedure Calls (RPC)** — the abstraction that makes distributed communication feel like local function calls.
