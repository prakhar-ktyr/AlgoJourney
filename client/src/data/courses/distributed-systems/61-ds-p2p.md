---
title: "Peer-to-Peer Systems"
---

# Peer-to-Peer Systems

Peer-to-Peer (P2P) systems are distributed architectures where nodes (peers) act as both clients and servers, sharing resources directly without a central coordinator.

---

## P2P Architecture vs Client-Server

In traditional client-server models, a central server provides resources to many clients. In P2P, every participant contributes and consumes resources simultaneously.

| Feature | Client-Server | Peer-to-Peer |
|---------|--------------|--------------|
| Central point of failure | Yes | No |
| Scalability cost | High (server upgrades) | Low (peers add capacity) |
| Resource ownership | Server owns resources | Peers share resources |
| Administration | Centralized | Decentralized |
| Bandwidth cost | Server bears all | Distributed among peers |
| Consistency | Easier to enforce | Harder to maintain |
| Discovery | Simple (known server) | Requires overlay network |

### Why P2P?

- **Scalability**: Each new peer adds capacity to the network
- **Fault tolerance**: No single point of failure
- **Cost efficiency**: No expensive server infrastructure
- **Censorship resistance**: Difficult to shut down

### Challenges of P2P

- **Discovery**: How do peers find each other?
- **Routing**: How to locate data without a central index?
- **Trust**: How to handle malicious peers?
- **NAT traversal**: How to connect peers behind firewalls?

---

## Types of P2P Networks

P2P networks are classified by how peers discover and route to each other.

### Unstructured P2P

Peers form random connections with no specific topology. Data placement is unrelated to the overlay structure.

#### Gnutella

Gnutella uses a **flooding-based** search protocol:

```
Query Propagation in Gnutella:

Peer A wants file "song.mp3"
    |
    ├──► Peer B (TTL=7) ──► Peer D (TTL=6) ──► Peer F (TTL=5)
    |                                              └── HAS FILE → QueryHit
    ├──► Peer C (TTL=7) ──► Peer E (TTL=6)
    |
    └──► Peer G (TTL=7)

QueryHit travels back along the reverse path.
File transfer happens directly: Peer A ←── Peer F
```

**Gnutella Protocol Messages:**

| Message | Purpose | Propagation |
|---------|---------|-------------|
| Ping | Discover peers | Flooded |
| Pong | Reply to Ping | Routed back |
| Query | Search for file | Flooded (TTL-limited) |
| QueryHit | Search result | Routed back |
| Push | Request behind firewall | Routed |

**Problems**: Flooding does not scale — O(N) messages per query.

#### Kazaa (FastTrack)

Kazaa introduced **super-peers** (also called ultra-peers):

```
┌─────────────────────────────────────────┐
│           Super-Peer Network            │
│                                         │
│   [SP1] ◄────────► [SP2] ◄────► [SP3]  │
│    │ │                │            │    │
│    │ └──────┐         │            │    │
└────│────────│─────────│────────────│────┘
     │        │         │            │
  ┌──┴──┐  ┌─┴──┐   ┌──┴──┐     ┌──┴──┐
  │P1 P2│  │P3  │   │P4 P5│     │P6   │
  └─────┘  └────┘   └─────┘     └─────┘
   Leaf      Leaf     Leaf        Leaf
   Nodes     Nodes    Nodes       Nodes
```

- Leaf nodes register files with their super-peer
- Queries are flooded only among super-peers
- Reduces message overhead significantly

---

### Structured P2P (DHTs)

Structured P2P networks use **Distributed Hash Tables (DHTs)** to deterministically map keys to peers, enabling O(log N) lookups.

#### Chord

Chord organizes peers on a circular identifier space (ring) of size 2^m.

```
Chord Ring (m=6, IDs 0-63):

              0
          /       \
        56          8
       /              \
     48    Peer 51     16
      |                 |
     40                24
       \              /
        36          32
          \       /
             28

Peer 51 is responsible for keys 49, 50, 51
(keys between predecessor+1 and own ID)
```

**Finger Table** for peer with ID `n`:

```
finger[i] = successor((n + 2^i) mod 2^m)

Example: Node 8, m=6
┌───────┬──────────────┬────────────┐
│ Entry │ Start (8+2^i)│ Successor  │
├───────┼──────────────┼────────────┤
│ 0     │ 9            │ 14         │
│ 1     │ 10           │ 14         │
│ 2     │ 12           │ 14         │
│ 3     │ 16           │ 21         │
│ 4     │ 24           │ 32         │
│ 5     │ 40           │ 42         │
└───────┴──────────────┴────────────┘
```

**Lookup complexity**: O(log N) hops to find any key.

#### Kademlia

Kademlia uses **XOR distance** as its metric: `distance(a, b) = a XOR b`.

```python
# Kademlia XOR distance
def xor_distance(node_a, node_b):
    return node_a ^ node_b

# Example: 160-bit IDs
node1 = 0b1010  # ID = 10
node2 = 0b1100  # ID = 12
distance = node1 ^ node2  # 0b0110 = 6

# Kademlia routing table: k-buckets
# Bucket i holds nodes at XOR distance [2^i, 2^(i+1))
class KademliaNode:
    def __init__(self, node_id, k=20):
        self.id = node_id
        self.k = k  # max bucket size
        # 160 buckets for 160-bit IDs
        self.buckets = [[] for _ in range(160)]

    def bucket_for(self, other_id):
        distance = self.id ^ other_id
        # Find highest set bit
        return distance.bit_length() - 1

    def lookup(self, target_id):
        """Iterative lookup: query alpha closest nodes"""
        closest = self.find_closest(target_id, count=self.k)
        # Query closest nodes, update with their responses
        # Converges in O(log N) rounds
        pass
```

**Kademlia Properties:**

| Property | Description |
|----------|-------------|
| Symmetric distance | XOR(a,b) = XOR(b,a) |
| Triangle inequality | Enables consistent routing |
| Iterative lookup | Parallel queries to α closest nodes |
| Lazy repair | Routing tables refreshed on use |
| Used in | BitTorrent DHT, Ethereum, IPFS |

---

### Hybrid P2P

Hybrid systems combine centralized coordination with P2P data transfer.

#### BitTorrent

BitTorrent is the most successful P2P file-sharing protocol, using a hybrid architecture with centralized tracking and P2P data exchange.

---

## BitTorrent Deep Dive

### Core Concepts

```
┌──────────────────────────────────────────────────┐
│                 BitTorrent Swarm                  │
│                                                  │
│  Tracker ─── coordinates peers                   │
│     │                                            │
│     ├── Seeder A (has 100% of file)              │
│     ├── Seeder B (has 100% of file)              │
│     ├── Leecher C (has pieces 1,3,5,7)          │
│     ├── Leecher D (has pieces 2,4,6,8)          │
│     └── Leecher E (has pieces 1,2,3)            │
│                                                  │
│  Leecher C downloads piece 2 from D             │
│  Leecher D downloads piece 3 from C             │
│  Both upload to E simultaneously                 │
└──────────────────────────────────────────────────┘
```

### Trackers

A **tracker** is an HTTP/HTTPS service that coordinates peers in a swarm:

1. Client sends announce request with info_hash, peer_id, port
2. Tracker returns a list of peers in the swarm
3. Client connects directly to peers for data transfer

```
GET /announce?info_hash=<hash>&peer_id=<id>&port=6881
    &uploaded=0&downloaded=0&left=1048576&event=started

Response:
{
  "interval": 1800,
  "peers": [
    {"ip": "192.168.1.5", "port": 6881},
    {"ip": "10.0.0.3", "port": 51413}
  ]
}
```

### Pieces and Blocks

Files are split into **pieces** (typically 256KB–4MB), each verified by SHA-1 hash:

```
File (100 MB)
├── Piece 0 [256KB] → SHA1: a3f2...
├── Piece 1 [256KB] → SHA1: b7c1...
├── Piece 2 [256KB] → SHA1: 9e4d...
│   ├── Block 0 [16KB]  ← transfer unit
│   ├── Block 1 [16KB]
│   ├── ...
│   └── Block 15 [16KB]
├── ...
└── Piece 399 [256KB] → SHA1: f1a8...
```

**Piece selection strategies:**

| Strategy | Description | When Used |
|----------|-------------|-----------|
| Rarest First | Download least available piece | Default |
| Random First | Random piece initially | First 4 pieces |
| Endgame Mode | Request remaining from all | Last few pieces |
| Sequential | In-order download | Streaming |

### Choking and Tit-for-Tat

BitTorrent incentivizes uploading through **choking/unchoking**:

```
Every 10 seconds — Unchoke Algorithm:
1. Rank peers by upload rate TO us (reciprocation)
2. Unchoke top 4 peers (regular unchoke slots)
3. Every 30 seconds: "Optimistic unchoke" — randomly
   unchoke 1 peer (discover better partners)

Peer States:
┌────────────────────────────────────────┐
│ Peer A → Us:  interested, choked      │ We won't send to A
│ Peer B → Us:  interested, unchoked    │ We send to B
│ Peer C → Us:  not interested, choked  │ C doesn't want our data
│ Us → Peer B:  interested, unchoked    │ B sends to us
└────────────────────────────────────────┘
```

**Tit-for-Tat**: Peers that upload to you get unchoked (receive data back). Free-riders get choked.

### DHT (Distributed Hash Table) in BitTorrent

BitTorrent uses **Mainline DHT** (based on Kademlia) for trackerless operation:

```python
# Mainline DHT operations
# Nodes store peer lists keyed by info_hash

# To find peers for a torrent:
# 1. Compute info_hash of .torrent metadata
# 2. Find DHT nodes closest to info_hash (iterative lookup)
# 3. Ask those nodes for peers via get_peers
# 4. Announce yourself via announce_peer

# DHT message (Bencoded):
{
    "t": "aa",           # transaction ID
    "y": "q",            # query
    "q": "get_peers",    # method
    "a": {
        "id": "<node_id>",
        "info_hash": "<torrent_hash>"
    }
}
```

---

## IPFS (InterPlanetary File System)

IPFS is a P2P hypermedia protocol for content-addressed, decentralized storage.

### Content-Addressed Storage

Instead of location-based addressing (URL), IPFS uses **content identifiers (CIDs)**:

```
Traditional Web:
  https://example.com/docs/paper.pdf
  → Location can change, content may differ

IPFS:
  /ipfs/QmT5NvUtoM5nWFfrQdVrFtvGfKFmG7AHE8P34isapyhCxX
  → Hash of content, immutable, verifiable

CID Structure:
┌─────────────────────────────────────────────┐
│ Version │ Codec │ Hash Function │ Hash      │
│    1    │dag-pb │   sha2-256    │ abc123... │
└─────────────────────────────────────────────┘
```

### Merkle DAG

IPFS organizes data as a **Merkle Directed Acyclic Graph**:

```
Directory: /project
CID: QmRoot

QmRoot (directory)
├── QmFileA (index.html, 2KB)    ← leaf node
├── QmFileB (style.css, 5KB)     ← leaf node
└── QmDirC (images/)             ← subdirectory
    ├── QmFileD (logo.png, 1MB)
    │   ├── QmChunk1 (256KB)     ← large files split
    │   ├── QmChunk2 (256KB)       into chunks
    │   ├── QmChunk3 (256KB)
    │   └── QmChunk4 (256KB)
    └── QmFileE (bg.jpg, 50KB)   ← small file = 1 block

Changing any file changes all ancestor CIDs → tamper-evident
```

### libp2p

IPFS uses **libp2p** as its networking layer, providing modular P2P primitives:

| Module | Purpose | Examples |
|--------|---------|----------|
| Transport | Connection establishment | TCP, QUIC, WebSocket, WebRTC |
| Security | Encrypted channels | TLS 1.3, Noise |
| Multiplexing | Multiple streams per conn | yamux, mplex |
| Discovery | Find peers | mDNS, DHT, rendezvous |
| Routing | Content/peer routing | Kademlia DHT |
| PubSub | Message broadcasting | GossipSub, FloodSub |

```
libp2p Peer Identity:
┌─────────────────────────────────────────────┐
│ PeerID = multihash(public_key)              │
│                                             │
│ Multiaddr: /ip4/192.168.1.5/tcp/4001/p2p/  │
│            QmPeerID123...                   │
│                                             │
│ Supports multiple transports simultaneously │
└─────────────────────────────────────────────┘
```

---

## P2P Challenges

### NAT Traversal

Most peers are behind NAT (Network Address Translation), making direct connections difficult.

```
Peer A (public IP)          NAT Router          Peer B (private)
    │                       ┌───────┐              │
    │                       │ Maps  │              │
    │  ──── SYN ──────────► │ ports │──── SYN ───► │
    │                       │       │              │
    │  ◄─── SYN-ACK ────── │       │◄── SYN-ACK ─ │
    │                       └───────┘              │

Techniques:
1. STUN — Discover public IP/port mapping
2. TURN — Relay through intermediary server
3. ICE  — Try direct, fallback to relay
4. Hole punching — Coordinated simultaneous open
```

### Churn

Peers join and leave frequently, destabilizing the network:

```python
# Handling churn in a DHT
class DHTNode:
    def __init__(self):
        self.replication_factor = 3  # store on 3 nodes
        self.stabilize_interval = 30  # seconds

    def stabilize(self):
        """Periodically verify successor and fix fingers"""
        # Check if successor is still alive
        if not self.ping(self.successor):
            self.successor = self.successor_list[1]
        # Replicate data to new successors
        self.replicate_keys()

    def handle_join(self, new_node):
        """Transfer relevant keys to new node"""
        keys_to_transfer = [
            k for k in self.stored_keys
            if self.responsible(new_node, k)
        ]
        self.transfer(new_node, keys_to_transfer)
```

### Free-Riding

Some peers consume without contributing. Mitigation strategies:

| Strategy | Description | Used In |
|----------|-------------|---------|
| Tit-for-tat | Reciprocate uploads | BitTorrent |
| Reputation systems | Track contribution history | eMule credits |
| Token economics | Pay for resources | Filecoin, Storj |
| Contribution quotas | Minimum upload ratio | Private trackers |

### Sybil Attacks

An attacker creates many fake identities to gain disproportionate influence:

```
Normal Network:          Sybil Attack:
                         
  [A]──[B]──[C]           [A]──[S1]──[S2]
   │    │    │              │    │     │
  [D]──[E]──[F]           [S3]─[S4]──[S5]
                                │
Honest peers control         Attacker controls
routing and storage          majority of routing

Defenses:
- Proof of Work (computational cost per ID)
- Proof of Stake (economic cost per ID)
- Social graph verification (SybilGuard)
- Centralized admission (certificate authority)
```

---

## P2P Applications

### File Sharing

The original P2P use case: Napster, Gnutella, BitTorrent, eDonkey.

### P2P Streaming

```
Live Streaming Tree (Push-based):

         Source
        /      \
     [A]        [B]
    /   \      /   \
  [C]   [D] [E]   [F]
  / \    |    |   / \
[G] [H] [I] [J] [K] [L]

Mesh-based (Pull-based):
- Each peer requests chunks from multiple parents
- More resilient to peer departure
- Higher latency than tree-based
```

### CDN with WebRTC

Hybrid P2P-CDN reduces server bandwidth by having viewers share content:

```
Traditional CDN:          P2P-Assisted CDN:
                          
Server ──► Viewer 1       Server ──► Viewer 1 ──► Viewer 3
Server ──► Viewer 2                    │
Server ──► Viewer 3       Server ──► Viewer 2 ──► Viewer 4
Server ──► Viewer 4

Server bandwidth: O(N)    Server bandwidth: O(√N)
```

### Cryptocurrency Networks

Bitcoin, Ethereum use P2P for:
- Transaction propagation (gossip protocol)
- Block distribution
- Peer discovery (DNS seeds + addr messages)

---

## WebRTC for Browser P2P

WebRTC enables direct browser-to-browser communication without plugins.

```javascript
// WebRTC Connection Establishment
const peerConnection = new RTCPeerConnection({
  iceServers: [
    { urls: "stun:stun.l.google.com:19302" },
    { urls: "turn:turn.example.com", username: "user", credential: "pass" }
  ]
});

// Create data channel for arbitrary data
const dataChannel = peerConnection.createDataChannel("files");

dataChannel.onopen = () => {
  console.log("P2P connection established!");
  dataChannel.send("Hello from peer!");
};

dataChannel.onmessage = (event) => {
  console.log("Received:", event.data);
};

// Signaling (exchange SDP via server)
// 1. Caller creates offer
const offer = await peerConnection.createOffer();
await peerConnection.setLocalDescription(offer);
// Send offer to remote peer via signaling server

// 2. Callee receives offer, creates answer
await peerConnection.setRemoteDescription(offer);
const answer = await peerConnection.createAnswer();
await peerConnection.setLocalDescription(answer);
// Send answer back via signaling server

// 3. ICE candidates exchanged
peerConnection.onicecandidate = (event) => {
  if (event.candidate) {
    // Send candidate to remote peer via signaling server
    signalingServer.send(event.candidate);
  }
};
```

**WebRTC Architecture:**

```
┌──────────┐  Signaling   ┌──────────┐
│ Browser A│◄────────────►│ Browser B│
│          │  (via server) │          │
│  ┌────┐  │              │  ┌────┐  │
│  │SRTP│  │◄═══════════►│  │SRTP│  │  ← Media (direct)
│  └────┘  │              │  └────┘  │
│  ┌────┐  │              │  ┌────┐  │
│  │SCTP│  │◄═══════════►│  │SCTP│  │  ← Data (direct)
│  └────┘  │              │  └────┘  │
└──────────┘              └──────────┘

Signaling = SDP + ICE candidates (small, via server)
Media/Data = Direct P2P (high bandwidth, low latency)
```

---

## P2P vs Centralized Trade-Offs

| Dimension | Centralized | P2P |
|-----------|-------------|-----|
| Latency | Predictable (client→server) | Variable (depends on peers) |
| Throughput | Limited by server capacity | Scales with peer count |
| Consistency | Strong (single authority) | Eventual (no authority) |
| Availability | Server uptime = system uptime | Resilient to individual failures |
| Security | Trusted server, easy auth | Must handle untrusted peers |
| Legal compliance | Clear responsibility | Accountability challenges |
| Development complexity | Lower | Higher |
| Operational cost | High (infrastructure) | Low (peers bear cost) |

### When to Use P2P

```
Use P2P when:
✓ Data is large and popular (file sharing, streaming)
✓ Low server cost is essential
✓ Censorship resistance matters
✓ Users have good upstream bandwidth
✓ Latency tolerance is acceptable

Use Client-Server when:
✓ Strong consistency required (banking, inventory)
✓ Low latency critical (gaming, real-time)
✓ Legal compliance needed (content moderation)
✓ Clients have limited bandwidth/compute
✓ Simple development and operations preferred
```

---

## Exercises

1. **Chord Lookup**: In a Chord ring with m=4 (IDs 0–15), nodes exist at positions 1, 4, 7, 10, 14. Compute the finger table for node 4. Trace the lookup path for key 12 starting from node 1.

2. **XOR Distance**: Given Kademlia node IDs (8-bit): A=01010101, B=10101010, C=01100110. Calculate XOR distances between all pairs. Which two nodes are closest?

3. **BitTorrent Simulation**: A 512MB file has 2048 pieces. 5 seeders and 20 leechers are in the swarm. Each peer has 10 Mbps upload. Estimate the minimum time for a new leecher to download the complete file assuming optimal piece distribution.

4. **Design Exercise**: Design a P2P chat application. Address: peer discovery, NAT traversal, message delivery when peers are offline, and protection against Sybil attacks. Draw the architecture diagram.

5. **IPFS Merkle DAG**: A directory contains 3 files: `a.txt` (100B), `b.txt` (500KB), `c.txt` (2MB). IPFS uses 256KB chunks. Draw the Merkle DAG structure and explain what happens when `a.txt` is modified.

6. **WebRTC Implementation**: Write pseudocode for a P2P file transfer application using WebRTC DataChannels. Include the signaling flow, chunking strategy for large files, and progress reporting.

---

## Summary

- P2P eliminates central servers by having peers share resources directly
- **Unstructured** networks (Gnutella) use flooding — simple but unscalable
- **Structured** networks (Chord, Kademlia) provide O(log N) lookups via DHTs
- **BitTorrent** combines trackers with tit-for-tat incentives for efficient file distribution
- **IPFS** uses content-addressing and Merkle DAGs for a decentralized web
- **WebRTC** enables browser-native P2P communication
- Key challenges include NAT traversal, churn handling, and Sybil resistance
- Choose P2P for scalable distribution; choose centralized for consistency and simplicity
