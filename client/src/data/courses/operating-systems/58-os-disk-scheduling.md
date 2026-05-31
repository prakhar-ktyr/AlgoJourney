---
title: Disk Scheduling Algorithms
---

# Disk Scheduling Algorithms

When multiple processes request disk I/O simultaneously, the operating system must decide the **order** in which to service those requests. Since the dominant cost of disk access on a mechanical hard drive is the **seek time** (moving the read/write head to the correct track), intelligent scheduling can dramatically reduce total head movement and improve throughput. This lesson explores the classic disk scheduling algorithms, compares their performance, and discusses their relevance in the age of SSDs.

---

## Disk Drive Structure

A mechanical hard disk drive (HDD) consists of multiple rotating **platters** coated with magnetic material:

```text
        Top View of a Platter
    ┌─────────────────────────────┐
    │    ╭───────────────────╮    │
    │   ╭┤  Track 0 (outer)  ├╮   │
    │  ╭┤│                   │├╮  │
    │  │││  Track 1          │││  │
    │  │││  ╭─────────────╮  │││  │
    │  │││  │  Track 2    │  │││  │
    │  │││  │  ╭───────╮  │  │││  │
    │  │││  │  │ Track 3│  │  │││  │
    │  │││  │  │╭─────╮│  │  │││  │
    │  │││  │  ││Spindle│  │  │││  │
    │  │││  │  │╰─────╯│  │  │││  │
    │  │││  │  │       │  │  │││  │
    │  │││  │  ╰───────╯  │  │││  │
    │  │││  ╰─────────────╯  │││  │
    │  ╰┤│                   │├╯  │
    │   ╰┤                   ├╯   │
    │    ╰───────────────────╯    │
    │         ◀── head arm ──▶    │
    └─────────────────────────────┘

    Side View (Multiple Platters)
    ┌─────────────────────────┐
    │  ══════ Platter 0 ══════│ ← Surface 0 (top), Surface 1 (bottom)
    │  ══════ Platter 1 ══════│ ← Surface 2, Surface 3
    │  ══════ Platter 2 ══════│ ← Surface 4, Surface 5
    │         │               │
    │     Spindle              │
    │     (rotates)            │
    └─────────────────────────┘
    Head arm moves in/out ◀──▶
```

| Component    | Description                                                                  |
| ------------ | ---------------------------------------------------------------------------- |
| **Platter**  | Circular disk coated with magnetic material                                  |
| **Surface**  | Each platter has a top and bottom surface                                    |
| **Track**    | Concentric circle on a surface                                               |
| **Cylinder** | Set of tracks at the same position on all surfaces                           |
| **Sector**   | Arc segment of a track — smallest addressable unit (typically 512 B or 4 KB) |
| **Head**     | Read/write element — one per surface, all move together                      |
| **Arm**      | Mechanical arm that positions the heads                                      |

---

## Disk Access Time Components

The total time to read or write data has three parts:

$$T_{access} = T_{seek} + T_{rotation} + T_{transfer}$$

| Component                               | Formula                                    | Typical Value | Description                                         |
| --------------------------------------- | ------------------------------------------ | ------------- | --------------------------------------------------- |
| **Seek Time** ($T_{seek}$)              | Depends on distance                        | 3–12 ms       | Time to move head to target track                   |
| **Rotational Latency** ($T_{rotation}$) | $\frac{1}{2} \times \frac{60}{\text{RPM}}$ | 2–6 ms        | Average time for target sector to rotate under head |
| **Transfer Time** ($T_{transfer}$)      | $\frac{b}{rN}$                             | 0.01–1 ms     | Time to read/write the data                         |

Where:

- $b$ = bytes to transfer
- $r$ = rotation speed (rotations/second)
- $N$ = bytes per track

**Example** — 7200 RPM drive, reading one 4 KB sector:

$$T_{rotation} = \frac{1}{2} \times \frac{60}{7200} = \frac{1}{2} \times 8.33\text{ ms} = 4.17\text{ ms}$$

$$T_{transfer} = \frac{4096}{(120)(500 \times 10^3)} \approx 0.068\text{ ms}$$

$$T_{access} = T_{seek} + 4.17\text{ ms} + 0.068\text{ ms}$$

Since seek time dominates (3-12 ms), **minimizing total seek distance is the primary goal** of disk scheduling.

---

## The Scheduling Problem

Consider a disk with **200 tracks** (numbered 0–199). The read/write head is currently at **track 53**, and the following requests arrive in this order:

$$\text{Request queue: } 98, 183, 37, 122, 14, 124, 65, 67$$

> We will trace every algorithm using this same request queue so you can directly compare their performance.

---

## FCFS (First-Come, First-Served)

The simplest approach: service requests in the **order they arrive**.

```text
Head movement:  53 → 98 → 183 → 37 → 122 → 14 → 124 → 65 → 67

Track:  0    14   37  53  65 67   98   122 124         183  199
        |     |    |   |   | |     |     |   |           |    |
        |     |    |   ●───┼─┼─────●     |   |           |    |
        |     |    |       | |     |     |   |           |    |
        |     |    |       | |     ●─────┼───┼───────────●    |
        |     |    |       | |           |   |           |    |
        |     |    ●───────┼─┼───────────●   |           |    |
        |     |            | |               |           |    |
        |     ●────────────┼─┼───────────────●           |    |
        |                  | |               |           |    |
        |                  | ●───────────────●           |    |
        |                  | |                           |    |
        |                  ●─●                           |    |

Sequence: 53 → 98 → 183 → 37 → 122 → 14 → 124 → 65 → 67
```

**Total seek distance:**

| Move      | From → To | Distance |
| --------- | --------- | -------- |
| 1         | 53 → 98   | 45       |
| 2         | 98 → 183  | 85       |
| 3         | 183 → 37  | 146      |
| 4         | 37 → 122  | 85       |
| 5         | 122 → 14  | 108      |
| 6         | 14 → 124  | 110      |
| 7         | 124 → 65  | 59       |
| 8         | 65 → 67   | 2        |
| **Total** |           | **640**  |

> [!NOTE]
> FCFS is fair (no starvation) but wildly inefficient — the head zigzags back and forth across the disk.

---

## SSTF (Shortest Seek Time First)

A **greedy** algorithm: always service the request **closest** to the current head position.

```text
Starting at 53, pick nearest:
53 → 65 → 67 → 37 → 14 → 98 → 122 → 124 → 183

Track:  0    14   37  53  65 67   98   122 124         183  199
        |     |    |   |   | |     |     |   |           |    |
        |     |    |   ●──▶●▶●     |     |   |           |    |
        |     |    |◀──┘          |     |   |           |    |
        |     |◀───┘              |     |   |           |    |
        |     └───────────────────▶●────▶●──▶●           |    |
        |                                    └───────────▶●   |
```

**Total seek distance:**

| Move      | From → To | Distance |
| --------- | --------- | -------- |
| 1         | 53 → 65   | 12       |
| 2         | 65 → 67   | 2        |
| 3         | 67 → 37   | 30       |
| 4         | 37 → 14   | 23       |
| 5         | 14 → 98   | 84       |
| 6         | 98 → 122  | 24       |
| 7         | 122 → 124 | 2        |
| 8         | 124 → 183 | 59       |
| **Total** |           | **236**  |

Much better than FCFS! But SSTF has a problem: **starvation**. If requests keep arriving near the current head position, distant requests may wait indefinitely.

> [!WARNING]
> SSTF is not optimal — it's a greedy heuristic. Finding the truly optimal schedule is equivalent to the Traveling Salesman Problem, which is NP-hard.

---

## SCAN (Elevator Algorithm)

The head moves in **one direction**, servicing all requests along the way, then **reverses** and services requests in the other direction — just like an elevator.

Assume the head starts at 53 moving **toward 0** (left):

```text
Head moves LEFT first, then reverses RIGHT:
53 → 37 → 14 → 0 → 65 → 67 → 98 → 122 → 124 → 183

Track:  0    14   37  53  65 67   98   122 124         183  199
        |     |    |   |   | |     |     |   |           |    |
   ◀────●◀────●◀───●◀──●   | |     |     |   |           |    |
        |                   | |     |     |   |           |    |
        └──────────────────▶●▶●────▶●────▶●──▶●──────────▶●   |
                                                               |
Direction:  ◀◀◀ LEFT ◀◀◀  │  ▶▶▶ RIGHT ▶▶▶
                           │
                       reversal at 0
```

**Total seek distance:**

| Move      | From → To | Distance |
| --------- | --------- | -------- |
| 1         | 53 → 37   | 16       |
| 2         | 37 → 14   | 23       |
| 3         | 14 → 0    | 14       |
| 4         | 0 → 65    | 65       |
| 5         | 65 → 67   | 2        |
| 6         | 67 → 98   | 31       |
| 7         | 98 → 122  | 24       |
| 8         | 122 → 124 | 2        |
| 9         | 124 → 183 | 59       |
| **Total** |           | **236**  |

SCAN provides **no starvation** — every request is eventually serviced. However, tracks in the middle get served more frequently than tracks at the edges.

---

## C-SCAN (Circular SCAN)

C-SCAN treats the disk as **circular**: the head moves in one direction only, and after reaching the end, it **jumps back** to the beginning without servicing any requests on the return trip.

Head moves RIGHT, then jumps to 0:

```text
53 → 65 → 67 → 98 → 122 → 124 → 183 → 199 → [jump to 0] → 14 → 37

Track:  0    14   37  53  65 67   98   122 124         183  199
        |     |    |   |   | |     |     |   |           |    |
        |     |    |   ●──▶●▶●────▶●────▶●──▶●──────────▶●──▶●
        |     |    |                                           |
   ○────┼────▶●───▶●        ◀ ◀ ◀ ◀ jump (no service) ◀ ◀ ◀ ◀┘
        |
        └── start scanning from 0 again
```

**Total seek distance** (excluding the jump, which is fast on modern drives):

| Move      | From → To      | Distance |
| --------- | -------------- | -------- |
| 1         | 53 → 65        | 12       |
| 2         | 65 → 67        | 2        |
| 3         | 67 → 98        | 31       |
| 4         | 98 → 122       | 24       |
| 5         | 122 → 124      | 2        |
| 6         | 124 → 183      | 59       |
| 7         | 183 → 199      | 16       |
| 8         | 199 → 0 (jump) | 199      |
| 9         | 0 → 14         | 14       |
| 10        | 14 → 37        | 23       |
| **Total** |                | **382**  |

> [!NOTE]
> C-SCAN provides **more uniform wait times** than SCAN because it effectively treats all tracks equally — there's no "edge penalty" where extreme tracks wait longer.

---

## LOOK and C-LOOK

LOOK and C-LOOK are practical improvements: the head only travels as far as the **last request** in each direction, rather than going all the way to the disk edge.

### LOOK (Optimized SCAN)

Head starts at 53, moves left to last request (14), reverses right to last request (183):

```text
53 → 37 → 14 → 65 → 67 → 98 → 122 → 124 → 183

Track:  0    14   37  53  65 67   98   122 124         183  199
        |     |    |   |   | |     |     |   |           |    |
        |     ●◀───●◀──●   | |     |     |   |           |    |
        |     |             | |     |     |   |           |    |
        |     └────────────▶●▶●────▶●────▶●──▶●──────────▶●   |
        |                                                      |
   Stop at 14          Stop at 183 (don't go to 199)
  (don't go to 0)
```

**Total seek distance:**

| Move      | From → To | Distance |
| --------- | --------- | -------- |
| 1         | 53 → 37   | 16       |
| 2         | 37 → 14   | 23       |
| 3         | 14 → 65   | 51       |
| 4         | 65 → 67   | 2        |
| 5         | 67 → 98   | 31       |
| 6         | 98 → 122  | 24       |
| 7         | 122 → 124 | 2        |
| 8         | 124 → 183 | 59       |
| **Total** |           | **208**  |

### C-LOOK (Optimized C-SCAN)

Head moves right to last request (183), jumps to first request (14), continues right:

```text
53 → 65 → 67 → 98 → 122 → 124 → 183 → [jump to 14] → 37

Track:  0    14   37  53  65 67   98   122 124         183  199
        |     |    |   |   | |     |     |   |           |    |
        |     |    |   ●──▶●▶●────▶●────▶●──▶●──────────▶●   |
        |     |    |                                      |   |
        |     ●───▶●     ◀ ◀ ◀ ◀ jump (no service) ◀ ◀ ◀┘   |
```

**Total seek distance:**

| Move      | From → To       | Distance |
| --------- | --------------- | -------- |
| 1         | 53 → 65         | 12       |
| 2         | 65 → 67         | 2        |
| 3         | 67 → 98         | 31       |
| 4         | 98 → 122        | 24       |
| 5         | 122 → 124       | 2        |
| 6         | 124 → 183       | 59       |
| 7         | 183 → 14 (jump) | 169      |
| 8         | 14 → 37         | 23       |
| **Total** |                 | **322**  |

---

## Algorithm Comparison

| Algorithm  | Total Seek (our example) | Starvation?               | Fairness                  | Complexity  | Best Use Case                   |
| ---------- | ------------------------ | ------------------------- | ------------------------- | ----------- | ------------------------------- |
| **FCFS**   | 640                      | No                        | High — arrival order      | Very simple | Light I/O load                  |
| **SSTF**   | 236                      | Yes — far requests starve | Low                       | Moderate    | General purpose                 |
| **SCAN**   | 236                      | No                        | Moderate — middle favored | Moderate    | Medium-heavy load               |
| **C-SCAN** | 382\*                    | No                        | High — uniform wait       | Moderate    | Heavy load, fairness needed     |
| **LOOK**   | 208                      | No                        | Moderate                  | Moderate    | Practical default               |
| **C-LOOK** | 322\*                    | No                        | High                      | Moderate    | Practical default with fairness |

_\*C-SCAN and C-LOOK totals include the jump distance. In practice, the jump is much faster than seeks because the head moves without stopping._

> [!TIP]
> **LOOK** and **C-LOOK** are what real operating systems typically implement. They provide the benefits of SCAN/C-SCAN without the unnecessary travel to disk edges.

---

## Selecting a Scheduling Algorithm

| Workload                       | Recommended Algorithm         | Reason                                  |
| ------------------------------ | ----------------------------- | --------------------------------------- |
| Light, few concurrent requests | FCFS                          | Simplicity, no overhead                 |
| General purpose                | LOOK or C-LOOK                | Good balance of throughput and fairness |
| Database (random I/O heavy)    | SSTF or LOOK                  | Minimize seek distance                  |
| Batch processing (sequential)  | SCAN or C-SCAN                | Predictable, no starvation              |
| Real-time systems              | Earliest Deadline First (EDF) | Meet timing constraints                 |

---

## SSD Implications

Solid-State Drives (SSDs) have **no moving parts** — there is no seek time and no rotational latency:

| Component              | HDD          | SSD            |
| ---------------------- | ------------ | -------------- |
| **Seek time**          | 3–12 ms      | 0 (no head)    |
| **Rotational latency** | 2–6 ms       | 0 (no platter) |
| **Random read**        | ~10 ms       | ~0.1 ms        |
| **Sequential read**    | 100–200 MB/s | 500–7000 MB/s  |
| **Scheduling benefit** | Very high    | Minimal        |

Since SSD access time is nearly uniform regardless of address, **disk scheduling algorithms provide little benefit**. Instead, SSD firmware focuses on:

- **Wear leveling**: distributing writes evenly across flash cells to extend lifespan
- **Garbage collection**: reclaiming invalidated pages
- **TRIM support**: allowing the OS to inform the SSD which blocks are no longer in use
- **Queue depth optimization**: modern NVMe SSDs support 64K queues with 64K commands each

```python
# Simulating disk scheduling algorithms
def fcfs(head, requests):
    """First-Come, First-Served disk scheduling."""
    total_distance = 0
    current = head
    order = []

    for req in requests:
        distance = abs(req - current)
        total_distance += distance
        order.append(req)
        current = req

    return total_distance, order

def sstf(head, requests):
    """Shortest Seek Time First disk scheduling."""
    total_distance = 0
    current = head
    remaining = list(requests)
    order = []

    while remaining:
        # Find closest request
        closest = min(remaining, key=lambda r: abs(r - current))
        distance = abs(closest - current)
        total_distance += distance
        order.append(closest)
        current = closest
        remaining.remove(closest)

    return total_distance, order

# Test with our reference queue
head = 53
requests = [98, 183, 37, 122, 14, 124, 65, 67]

fcfs_dist, fcfs_order = fcfs(head, requests)
sstf_dist, sstf_order = sstf(head, requests)

print(f"FCFS: distance={fcfs_dist}, order={fcfs_order}")
print(f"SSTF: distance={sstf_dist}, order={sstf_order}")
# Output:
# FCFS: distance=640, order=[98, 183, 37, 122, 14, 124, 65, 67]
# SSTF: distance=236, order=[65, 67, 37, 14, 98, 122, 124, 183]
```

---

## Try It Yourself

**Exercise 1:** A disk has 300 tracks (0–299). The head starts at track 100. The request queue is: 86, 147, 91, 177, 94, 150, 102, 175, 130. Calculate the total seek distance for FCFS and SSTF.

:::details Solution
**FCFS** (service in arrival order):
100→86→147→91→177→94→150→102→175→130

| Move      | Distance |
| --------- | -------- |
| 100→86    | 14       |
| 86→147    | 61       |
| 147→91    | 56       |
| 91→177    | 86       |
| 177→94    | 83       |
| 94→150    | 56       |
| 150→102   | 48       |
| 102→175   | 73       |
| 175→130   | 45       |
| **Total** | **522**  |

**SSTF** (always pick closest):
100→102→94→91→86→130→147→150→175→177

| Move      | Distance |
| --------- | -------- |
| 100→102   | 2        |
| 102→94    | 8        |
| 94→91     | 3        |
| 91→86     | 5        |
| 86→130    | 44       |
| 130→147   | 17       |
| 147→150   | 3        |
| 150→175   | 25       |
| 175→177   | 2        |
| **Total** | **109**  |

:::

**Exercise 2:** A 10,000 RPM disk has an average seek time of 4 ms. The disk has 500 sectors per track, each 512 bytes. What is the average time to read a random 4 KB block?

:::details Solution
Rotational latency: $T_{rotation} = \frac{1}{2} \times \frac{60}{10{,}000} = \frac{1}{2} \times 6\text{ ms} = 3\text{ ms}$

Sectors needed for 4 KB: $\frac{4096}{512} = 8$ sectors

One rotation reads all 500 sectors in $6$ ms, so reading 8 sectors:
$T_{transfer} = \frac{8}{500} \times 6\text{ ms} = 0.096\text{ ms}$

$T_{access} = 4 + 3 + 0.096 = 7.096\text{ ms}$

Seek time dominates at **56%** of total access time. This is why disk scheduling is critical!
:::

---

## Key Takeaways

- Disk access time = $T_{seek} + T_{rotation} + T_{transfer}$, with **seek time dominating** for random I/O
- **FCFS** is fair but inefficient — the head zigzags wildly across the disk
- **SSTF** minimizes immediate seek distance (greedy) but risks **starvation** of distant requests
- **SCAN** (elevator) eliminates starvation by sweeping in one direction then reversing, but favors middle tracks
- **C-SCAN** provides **uniform wait times** by treating the disk as circular — only services in one direction
- **LOOK** and **C-LOOK** are practical variants that stop at the last actual request instead of going to disk edges — these are what real OSes implement
- For **SSDs**, scheduling algorithms are largely irrelevant since there are no mechanical delays — the focus shifts to wear leveling, garbage collection, and queue management
- The choice of algorithm depends on workload: SSTF/LOOK for throughput, C-LOOK for fairness, FCFS for simplicity
