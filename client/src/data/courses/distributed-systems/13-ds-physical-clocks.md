---
title: "Physical Clocks and Clock Synchronization"
---

# Physical Clocks and Clock Synchronization

Time is one of the most fundamental — and most treacherous — concepts in distributed systems. In a single-machine program, you can call "get current time" and trust the answer. In a distributed system, **no two machines share the same clock**, and even small disagreements about "what time is it?" can lead to catastrophic bugs.

This lesson explores how physical clocks work, why they drift, and the algorithms engineers use to keep them synchronized.

---

## Why Time Matters in Distributed Systems

Distributed systems rely on time for:

| Purpose | Example |
|---|---|
| **Ordering events** | Did write A happen before write B? |
| **Cache expiration** | Is this cached value still valid? |
| **Lease management** | Has this lock expired? |
| **Log correlation** | Merging logs from 50 servers |
| **Consistency** | Snapshot isolation in databases |
| **Security** | Certificate validity, token expiry |

If two nodes disagree on the current time by even a few milliseconds, a lock that one node thinks is still held might appear expired to another — causing **split-brain** scenarios and data corruption.

---

## How Physical Clocks Work

### Quartz Oscillators

Most computers keep time using a **quartz crystal oscillator**. A small quartz crystal vibrates at a precise frequency (typically 32,768 Hz) when voltage is applied. The system counts these vibrations to track elapsed time.

**Accuracy:** Quartz clocks drift by roughly $10^{-6}$ seconds per second — about **1 second per 12 days**.

```
Drift rate (ρ):
  Typical quartz:  ρ ≈ 10⁻⁶  (1 ppm)
  Good quartz:     ρ ≈ 10⁻⁷  (0.1 ppm)
  
Time error after t seconds:
  error ≤ ρ × t
```

**Example:** At $\rho = 10^{-6}$, after 1 day (86,400 s):

$$\text{error} \leq 10^{-6} \times 86400 = 0.0864 \text{ seconds} \approx 86 \text{ ms}$$

### Atomic Clocks

Atomic clocks measure time by observing the resonance frequency of atoms — typically **cesium-133** or **rubidium**.

| Clock Type | Drift Rate | Error per Day |
|---|---|---|
| Quartz oscillator | $\sim 10^{-6}$ s/s | ~86 ms |
| Rubidium atomic | $\sim 10^{-11}$ s/s | ~0.9 μs |
| Cesium atomic | $\sim 10^{-13}$ s/s | ~0.009 μs |
| Hydrogen maser | $\sim 10^{-15}$ s/s | ~0.00009 μs |

Atomic clocks are expensive and large. Most servers don't have one — they rely on synchronization protocols to stay close to an authoritative time source.

---

## Clock Drift and Clock Skew

Two important concepts:

**Clock drift** — the rate at which a clock deviates from a perfect reference clock.

$$\text{drift}(C) = \frac{dC(t)}{dt} - 1$$

A perfect clock has drift = 0. If $\frac{dC(t)}{dt} = 1.00001$, the clock runs slightly fast.

**Clock skew** — the difference between two clocks at a specific moment:

$$\text{skew}(A, B, t) = C_A(t) - C_B(t)$$

```
Timeline:  Real time →
  Node A:  |----*----|----*----|----*----|  (runs slightly fast)
  Node B:  |---*----|---*----|---*----|     (runs slightly slow)
  
  At real time t₀: skew = C_A(t₀) - C_B(t₀) = +3ms
  At real time t₁: skew grows to +7ms (drift accumulates)
```

Even if you synchronize two clocks perfectly at time $t_0$, drift causes their skew to grow over time. This is why **periodic resynchronization** is essential.

---

## Clock Synchronization Algorithms

### Cristian's Algorithm (1989)

The simplest approach: a client asks a **time server** for the current time.

**Protocol:**

```
Client                          Time Server
  |                                  |
  |--- "What time is it?" --------->|  t₁ (client records send time)
  |                                  |
  |<-- "It is T_server" ------------|  
  |                                  |
  t₂ (client records receive time)
```

**Steps:**

1. Client records $t_1$ (local time when request is sent).
2. Server replies with its current time $T_{\text{server}}$.
3. Client records $t_2$ (local time when reply arrives).
4. Client estimates round-trip time: $\text{RTT} = t_2 - t_1$.
5. Client sets its clock to:

$$T_{\text{new}} = T_{\text{server}} + \frac{\text{RTT}}{2}$$

**Accuracy:** The estimate is accurate within $\pm \frac{\text{RTT}}{2}$. To improve accuracy, repeat multiple times and discard outliers (high-RTT samples).

**Limitations:**

- Assumes symmetric network delay (send delay ≈ receive delay).
- Single point of failure (one time server).
- Server must be trusted.

---

### Berkeley Algorithm (1989)

Unlike Cristian's algorithm, the Berkeley algorithm does **not** require an accurate time server. Instead, a coordinator **averages** the clocks of all nodes.

**Protocol:**

```
Step 1: Coordinator polls all nodes for their time
  Coordinator → Node A: "What is your time?"
  Coordinator → Node B: "What is your time?"
  Coordinator → Node C: "What is your time?"

Step 2: Nodes reply
  Node A → Coordinator: "3:00:05"
  Node B → Coordinator: "3:00:02"
  Node C → Coordinator: "3:00:08"
  Coordinator's own clock:  "3:00:03"

Step 3: Coordinator computes average (adjusting for RTT)
  Average = (3:00:05 + 3:00:02 + 3:00:08 + 3:00:03) / 4
          = 3:00:04.5

Step 4: Coordinator sends adjustments
  Node A: adjust by -0.5s
  Node B: adjust by +2.5s
  Node C: adjust by -3.5s
  Coordinator: adjust by +1.5s
```

**Key properties:**

- No external time source needed.
- Outlier clocks can be excluded from the average.
- If the coordinator fails, an election algorithm picks a new one.
- The result is **internal consistency**, not accuracy to UTC.

---

### NTP (Network Time Protocol)

NTP is the dominant clock synchronization protocol on the Internet, designed by David Mills in 1985 and still in use today (NTPv4, RFC 5905).

#### NTP Architecture: Stratum Levels

NTP organizes time sources in a hierarchy:

```
Stratum 0:  Atomic clocks, GPS receivers (reference clocks)
    │
Stratum 1:  Servers directly connected to Stratum 0
    │           (e.g., time.nist.gov, pool.ntp.org)
    │
Stratum 2:  Servers synchronized to Stratum 1
    │
Stratum 3:  Servers synchronized to Stratum 2
    │
   ...
    │
Stratum 15: Maximum (Stratum 16 = unsynchronized)
```

| Stratum | Typical Accuracy | Example |
|---|---|---|
| 0 | Reference | Atomic clock, GPS |
| 1 | ~1 μs | National lab servers |
| 2 | ~10 ms | ISP time servers |
| 3 | ~100 ms | Corporate servers |

#### NTP Offset Calculation

NTP uses four timestamps to calculate clock offset and round-trip delay:

```
Client                          Server
  |                                |
  |--- request ------→            |  t₁ (client send)
  |                    t₂ (server receive)
  |                    t₃ (server send)
  |            ←------ response --|
  t₄ (client receive)             |
```

**Round-trip delay:**

$$\delta = (t_4 - t_1) - (t_3 - t_2)$$

**Clock offset:**

$$\theta = \frac{(t_2 - t_1) + (t_3 - t_4)}{2}$$

The offset $\theta$ tells the client how much to adjust its clock. NTP applies corrections **gradually** (slewing) rather than jumping the clock, to avoid breaking time-dependent applications.

#### NTP Modes

| Mode | Description |
|---|---|
| **Client/Server** | Client polls server periodically |
| **Symmetric** | Peers synchronize with each other |
| **Broadcast** | Server broadcasts time to LAN |
| **Manycast** | Client discovers servers via multicast |

**Accuracy:** NTP achieves ~1 ms on LANs, ~10–100 ms over the Internet.

---

## GPS Time

The **Global Positioning System** provides highly accurate time as a byproduct of positioning. Each GPS satellite carries multiple atomic clocks and broadcasts the current time.

**How GPS time works:**

1. GPS satellites broadcast their position and timestamp.
2. A receiver computes position by triangulating signals from ≥4 satellites.
3. The timing signal provides time accurate to ~10–50 nanoseconds.

```
Satellite 1  ──── signal (t₁) ────→  ┌──────────┐
Satellite 2  ──── signal (t₂) ────→  │   GPS    │  → Accurate time
Satellite 3  ──── signal (t₃) ────→  │ Receiver │  → Position (bonus)
Satellite 4  ──── signal (t₄) ────→  └──────────┘
```

**Limitations:**

- Requires line-of-sight to sky (doesn't work indoors or underground).
- GPS receivers add cost.
- Signal can be jammed or spoofed.

GPS time differs from UTC — GPS doesn't include leap seconds. As of 2024, GPS time is 18 seconds ahead of UTC.

---

## Precision Time Protocol (PTP)

**IEEE 1588 Precision Time Protocol** provides sub-microsecond synchronization on local networks. It is used in:

- Financial trading systems (timestamping trades)
- Telecommunications (5G base stations)
- Industrial automation
- Power grid synchronization

PTP improves on NTP by using **hardware timestamping** — network interface cards (NICs) stamp packets at the physical layer, eliminating software-induced jitter.

| Feature | NTP | PTP |
|---|---|---|
| Accuracy | ~1 ms (LAN) | ~10–100 ns (LAN) |
| Timestamping | Software | Hardware |
| Scope | Internet-wide | Local network |
| Cost | Free | Requires PTP-capable hardware |
| Standard | RFC 5905 | IEEE 1588 |

**PTP Architecture:**

```
Grandmaster Clock (GPS/atomic)
    │
    ├── Boundary Clock (switch)
    │       │
    │       ├── Ordinary Clock (server)
    │       └── Ordinary Clock (server)
    │
    └── Transparent Clock (switch)
            │
            └── Ordinary Clock (server)
```

---

## Google TrueTime (Spanner)

Google's **TrueTime** API, used in Cloud Spanner, takes a radically different approach: instead of returning a single timestamp, it returns an **interval** that is guaranteed to contain the true time.

```javascript
// TrueTime API (conceptual)
const tt = TrueTime.now();
// Returns: { earliest: t - ε, latest: t + ε }

tt.earliest  // Guaranteed: actual time ≥ earliest
tt.latest    // Guaranteed: actual time ≤ latest
```

The uncertainty interval $\epsilon$ is typically 1–7 ms and depends on how recently the server synchronized with its time references.

### How TrueTime Works

Each Google data center has:

- **GPS receivers** — provide accurate time but can fail.
- **Atomic clocks (rubidium)** — drift slowly but don't fail the same way GPS does.

```
Data Center Time References:
  ┌─── GPS Receiver 1 ───┐
  ├─── GPS Receiver 2 ───┤
  ├─── Atomic Clock 1  ──┤──→  Time Master  ──→  TrueTime API
  ├─── Atomic Clock 2  ──┤      (Marzullo's     (returns interval)
  └─── GPS Receiver 3 ───┘       algorithm)
```

### Why Intervals Matter

Spanner uses TrueTime for **external consistency** (linearizability). If transaction $T_1$ commits before transaction $T_2$ starts, Spanner guarantees $T_1$'s commit timestamp < $T_2$'s commit timestamp.

The key insight: if two intervals don't overlap, we **know** the ordering.

$$\text{If } T_1.\text{latest} < T_2.\text{earliest, then } T_1 \text{ happened before } T_2$$

When intervals overlap, Spanner **waits** for the uncertainty to pass (called **commit-wait**):

$$\text{wait time} = 2\epsilon$$

This is why minimizing $\epsilon$ is critical — smaller uncertainty means shorter waits and higher throughput.

---

## Problems with Physical Clocks in Distributed Systems

Even with synchronization, physical clocks remain unreliable for distributed ordering:

### 1. Clock Jumps

NTP may **step** the clock forward or backward when the skew is large (>128 ms by default). This means:

```
Timestamp log:
  10:00:00.100 — Event A
  10:00:00.200 — Event B
  09:59:59.900 — Event C  ← Clock jumped backward!
  
Observed order: A, B, C
Actual order:   A, B, C (but C appears to predate A!)
```

### 2. Leap Seconds

UTC occasionally adds a leap second. On June 30, 2012, a leap second bug caused widespread outages (Reddit, Mozilla, Linux kernel issues).

```
Normal:  23:59:58 → 23:59:59 → 00:00:00
Leap:    23:59:58 → 23:59:59 → 23:59:60 → 00:00:00
                                   ↑ many systems crash here
```

### 3. Smeared Time

Google introduced **leap smearing** — spreading the extra second over a 24-hour window. But smeared clocks disagree with non-smeared clocks during the smear window.

### 4. VM Clock Issues

Virtual machines face additional problems:

- **Clock pause** when VM is suspended/migrated.
- **Stolen time** when hypervisor schedules other VMs.
- **TSC drift** across CPU cores.

---

## Monotonic vs Wall-Clock Time

Modern operating systems expose **two types of clocks** to handle these problems:

### Wall-Clock Time (Time-of-Day Clock)

Returns the current date and time. Can jump forward or backward due to NTP adjustments.

```python
import time

# Wall-clock time (can jump!)
wall = time.time()  
# Returns: 1714838400.123456 (seconds since Unix epoch)

# Human-readable
from datetime import datetime
now = datetime.now()
# Returns: 2026-05-04 12:00:00.123456
```

**Use for:** displaying time to users, timestamps in logs, expiration checks against external deadlines.

**Do NOT use for:** measuring elapsed time, timeouts, performance benchmarks.

### Monotonic Clock (Steady Clock)

Returns a value that **only moves forward** and is unaffected by NTP adjustments. The absolute value is meaningless — only differences matter.

```python
import time

# Monotonic clock (never jumps backward)
start = time.monotonic()
# ... do some work ...
end = time.monotonic()

elapsed = end - start  # Guaranteed ≥ 0
print(f"Operation took {elapsed:.3f} seconds")
```

**Use for:** measuring elapsed time, timeouts, rate limiting, performance benchmarks.

**Do NOT use for:** correlating events across machines (value is local only).

### Comparison

| Property | Wall-Clock | Monotonic |
|---|---|---|
| Can jump backward | Yes | No |
| Affected by NTP | Yes | No |
| Meaningful across machines | Somewhat | No |
| Epoch-based | Yes (Unix epoch) | No (arbitrary origin) |
| Use for durations | **No** | **Yes** |
| Use for timestamps | **Yes** | **No** |

---

## Time APIs in Programming Languages

Different languages expose these clocks differently:

```java
// Java
Instant.now()                  // Wall-clock (can jump)
System.nanoTime()              // Monotonic (for durations)
Duration.between(start, end)   // Use with Instant

// Go
time.Now()                     // Wall-clock
time.Since(start)              // Uses monotonic internally (Go 1.9+)
// Go's time.Time embeds both wall and monotonic readings!

// C++
std::chrono::system_clock      // Wall-clock
std::chrono::steady_clock      // Monotonic (guaranteed)

// Rust
std::time::SystemTime          // Wall-clock
std::time::Instant             // Monotonic
```

```javascript
// JavaScript / Node.js
Date.now()                     // Wall-clock (milliseconds)
performance.now()              // Monotonic (high-resolution)
process.hrtime.bigint()        // Monotonic (nanoseconds, Node.js)
```

**Rule of thumb:** If you're measuring "how long did this take?" → monotonic. If you're answering "when did this happen?" → wall-clock (but be aware of its limitations).

---

## Clock Synchronization in Practice

Here's how major systems handle time:

| System | Approach | Accuracy |
|---|---|---|
| **AWS** | NTP (Amazon Time Sync Service) | ~1 ms |
| **Google Cloud** | TrueTime (GPS + atomic) | ~1–7 ms interval |
| **CockroachDB** | NTP + hybrid logical clocks | ~100 ms max offset |
| **YugabyteDB** | NTP + hybrid logical clocks | Configurable |
| **Financial exchanges** | PTP (hardware timestamping) | ~1 μs |
| **5G networks** | PTP + SyncE | ~1 μs |

---

## Try It Yourself ✏️

### Exercise 1: Cristian's Algorithm

A client sends a time request at $t_1 = 100$ ms (local clock). The server's time is $T_s = 500$ ms. The client receives the response at $t_2 = 110$ ms.

1. What is the round-trip time?
2. What should the client set its clock to?
3. What is the maximum error in this estimate?

<details>
<summary>Solution</summary>

1. $\text{RTT} = t_2 - t_1 = 110 - 100 = 10$ ms

2. $T_{\text{new}} = T_s + \frac{\text{RTT}}{2} = 500 + 5 = 505$ ms

3. Maximum error = $\frac{\text{RTT}}{2} = 5$ ms

The true time when the response arrives is somewhere between $T_s$ (if all delay is on the return path) and $T_s + \text{RTT}$ (if all delay is on the outgoing path). Our estimate of $T_s + \frac{\text{RTT}}{2}$ splits the difference.

</details>

### Exercise 2: NTP Offset

An NTP client records these four timestamps:

- $t_1 = 1000$ (client send)
- $t_2 = 1004$ (server receive)
- $t_3 = 1005$ (server send)
- $t_4 = 1009$ (client receive)

Calculate the round-trip delay and clock offset.

<details>
<summary>Solution</summary>

**Round-trip delay:**

$$\delta = (t_4 - t_1) - (t_3 - t_2) = (1009 - 1000) - (1005 - 1004) = 9 - 1 = 8$$

**Clock offset:**

$$\theta = \frac{(t_2 - t_1) + (t_3 - t_4)}{2} = \frac{(1004 - 1000) + (1005 - 1009)}{2} = \frac{4 + (-4)}{2} = 0$$

The clocks are perfectly synchronized (offset = 0), with a network round-trip delay of 8 units.

</details>

### Exercise 3: TrueTime Ordering

Two TrueTime readings:

- $TT_1 = [100, 106]$ (earliest, latest)
- $TT_2 = [104, 110]$

Can you determine which event happened first?

<details>
<summary>Solution</summary>

**No.** The intervals overlap ($[104, 106]$ is the overlap region).

- $TT_1.\text{latest} = 106 > TT_2.\text{earliest} = 104$

Since $TT_1.\text{latest} \not< TT_2.\text{earliest}$, we cannot conclude $TT_1$ happened before $TT_2$.

Spanner would need to **commit-wait** to ensure non-overlapping intervals before establishing an ordering guarantee.

</details>

### Exercise 4: Clock Bug

What's wrong with this code?

```python
import time

def is_cache_valid(cached_at, ttl_seconds):
    return time.time() - cached_at < ttl_seconds

start = time.time()
run_benchmark()
elapsed = time.time() - start
print(f"Benchmark took {elapsed:.3f}s")
```

<details>
<summary>Solution</summary>

**The `is_cache_valid` function is acceptable** — it needs wall-clock time for absolute time comparisons (though it's vulnerable to clock jumps).

**The benchmark is wrong** — it uses `time.time()` (wall-clock) for measuring elapsed time. If NTP adjusts the clock between `start` and end, the result could be negative or wildly inaccurate.

**Fix the benchmark:**

```python
start = time.monotonic()
run_benchmark()
elapsed = time.monotonic() - start
print(f"Benchmark took {elapsed:.3f}s")
```

</details>

---

## Key Takeaways

- Physical clocks **drift** — even good quartz oscillators lose ~86 ms/day.
- **Cristian's** and **Berkeley** algorithms work for simple setups; **NTP** is the Internet standard.
- NTP achieves ~1 ms accuracy on LANs via a stratum-based hierarchy.
- **PTP** provides sub-microsecond accuracy using hardware timestamping.
- Google **TrueTime** returns time intervals with bounded uncertainty, enabling externally consistent transactions.
- **Never use wall-clock time to measure durations** — use monotonic clocks.
- Physical clocks alone cannot reliably order events across machines — that's why distributed systems also use **logical clocks** (covered in the next lesson).

---
