---
title: Contiguous Memory Allocation
section: "Memory Management"
---

# Contiguous Memory Allocation

In contiguous memory allocation, each process occupies a **single, unbroken block** of physical memory. This is the simplest allocation strategy and the starting point for understanding more advanced approaches like paging and segmentation. While straightforward, contiguous allocation suffers from fragmentation problems that motivated the development of modern memory management.

---

## Concept

The physical memory is divided into two regions:

- **OS area**: typically held in low memory (or high memory on some architectures), protected from user processes.
- **User area**: the remaining memory, allocated to user processes.

```text
  ┌────────────────────────┐  Address 0
  │    Operating System    │
  │    (Resident)          │
  ├────────────────────────┤  OS boundary
  │                        │
  │    User Process Area   │
  │                        │
  │                        │
  │                        │
  └────────────────────────┘  Max Address
```

Each user process gets one contiguous chunk of this user area.

---

## Memory Partitioning

There are two fundamental partitioning schemes:

### Fixed (Static) Partitioning

Memory is divided into partitions of **predetermined size** at system boot. Each partition can hold exactly one process.

#### Equal-Sized Partitions

```text
  ┌────────────────────┐  0 KB
  │   OS (100 KB)      │
  ├────────────────────┤  100 KB
  │ Partition 1 (200KB)│  ← Process A (150 KB) → 50 KB wasted!
  ├────────────────────┤  300 KB
  │ Partition 2 (200KB)│  ← Process B (200 KB) → perfect fit
  ├────────────────────┤  500 KB
  │ Partition 3 (200KB)│  ← Process C (80 KB)  → 120 KB wasted!
  ├────────────────────┤  700 KB
  │ Partition 4 (200KB)│  ← Empty
  └────────────────────┘  900 KB
```

**Problem**: A 250 KB process cannot fit in any partition, even though total free space exceeds 250 KB. This is **internal fragmentation** — wasted space _within_ allocated partitions.

#### Unequal-Sized Partitions

```text
  ┌────────────────────┐  0 KB
  │   OS (100 KB)      │
  ├────────────────────┤  100 KB
  │ Partition 1 (50KB) │  ← Small processes
  ├────────────────────┤  150 KB
  │ Partition 2 (100KB)│  ← Medium processes
  ├────────────────────┤  250 KB
  │ Partition 3 (200KB)│  ← Larger processes
  ├────────────────────┤  450 KB
  │ Partition 4 (400KB)│  ← Largest processes
  └────────────────────┘  850 KB
```

Better match between process sizes and partitions, but still suffers from internal fragmentation.

### Fixed Partitioning Characteristics

| Aspect                      | Equal Partitions               | Unequal Partitions           |
| --------------------------- | ------------------------------ | ---------------------------- |
| **Internal fragmentation**  | High                           | Moderate                     |
| **Maximum process size**    | Limited to partition size      | Limited to largest partition |
| **Multiprogramming degree** | Fixed (= number of partitions) | Fixed                        |
| **Implementation**          | Very simple                    | Simple                       |
| **Flexibility**             | Very low                       | Low                          |

---

### Variable (Dynamic) Partitioning

Partitions are created **on demand**, sized exactly to each process's needs. No internal fragmentation — but a new problem emerges.

```text
  Initial State:           After loading A, B, C:
  ┌──────────────────┐     ┌──────────────────┐
  │    OS (100 KB)   │     │    OS (100 KB)   │
  ├──────────────────┤     ├──────────────────┤
  │                  │     │   A (200 KB)     │
  │   Free Space     │     ├──────────────────┤
  │   (900 KB)       │     │   B (150 KB)     │
  │                  │     ├──────────────────┤
  │                  │     │   C (300 KB)     │
  │                  │     ├──────────────────┤
  └──────────────────┘     │  Free (250 KB)   │
                           └──────────────────┘
```

Now suppose A and C finish, but B remains:

```text
  After A and C finish:         After D (200 KB) loaded:
  ┌──────────────────┐          ┌──────────────────┐
  │    OS (100 KB)   │          │    OS (100 KB)   │
  ├──────────────────┤          ├──────────────────┤
  │   HOLE (200 KB)  │          │   D (200 KB)     │
  ├──────────────────┤          ├──────────────────┤
  │   B (150 KB)     │          │   B (150 KB)     │
  ├──────────────────┤          ├──────────────────┤
  │   HOLE (300 KB)  │          │   HOLE (300 KB)  │
  ├──────────────────┤          ├──────────────────┤
  │   HOLE (250 KB)  │          │   HOLE (250 KB)  │
  └──────────────────┘          └──────────────────┘

  Total free = 750 KB           Can a 500 KB process fit?
  But no single hole ≥ 500 KB!  NO — external fragmentation!
```

This is **external fragmentation**: total free memory is sufficient, but it's scattered in non-contiguous holes.

---

## Allocation Algorithms

When a new process needs $n$ bytes and there are multiple holes (free blocks), which hole should we choose? Four algorithms are commonly studied:

### First Fit

Scan the free list from the **beginning** and allocate the **first** hole large enough.

```text
  Free list: [100KB, 400KB, 200KB, 300KB, 150KB]
  Request: 180 KB

  Scan: 100KB? No. 400KB? Yes! → Allocate from 400KB hole.
  Remaining: [100KB, 220KB, 200KB, 300KB, 150KB]
```

### Best Fit

Search the **entire** free list and choose the **smallest** hole that is large enough.

```text
  Free list: [100KB, 400KB, 200KB, 300KB, 150KB]
  Request: 180 KB

  Candidates: 400KB, 200KB, 300KB
  Smallest fit: 200KB → Allocate from 200KB hole.
  Remaining: [100KB, 400KB, 20KB, 300KB, 150KB]

  Note: Creates a tiny 20KB leftover — hard to use!
```

### Worst Fit

Search the entire free list and choose the **largest** hole.

```text
  Free list: [100KB, 400KB, 200KB, 300KB, 150KB]
  Request: 180 KB

  Largest hole: 400KB → Allocate from 400KB hole.
  Remaining: [100KB, 220KB, 200KB, 300KB, 150KB]

  Idea: The large leftover (220KB) is more usable than
  Best Fit's tiny 20KB leftover.
```

### Next Fit

Like First Fit, but starts scanning from where the **last allocation** ended (not from the beginning).

```text
  Free list: [100KB, 400KB, 200KB, 300KB, 150KB]
  Last allocation was at position 2 (200KB hole).
  Request: 180 KB

  Scan from position 3: 300KB? Yes! → Allocate from 300KB hole.
  Remaining: [100KB, 400KB, 200KB, 120KB, 150KB]
```

---

### Comparison of Allocation Algorithms

| Algorithm     | Speed                        | External Fragmentation                       | Notes                                                              |
| ------------- | ---------------------------- | -------------------------------------------- | ------------------------------------------------------------------ |
| **First Fit** | Fast — stops at first match  | Moderate                                     | Generally the best practical choice                                |
| **Best Fit**  | Slow — must scan entire list | **High** — creates many tiny, unusable holes | Counterintuitively bad despite "best" name                         |
| **Worst Fit** | Slow — must scan entire list | Moderate-High                                | Rarely outperforms First Fit                                       |
| **Next Fit**  | Fast — like First Fit        | Moderate-High                                | Distributes allocation more evenly but may fragment rear of memory |

> [!TIP]
> Simulation studies have shown that **First Fit** and **Best Fit** are better than Worst Fit in terms of both speed and memory utilization. First Fit is generally preferred because it is faster — it doesn't need to scan the entire list.

---

## Worked Example: Memory Allocation Sequence

**System: 1000 KB total, OS takes 200 KB. Free: 800 KB.**

**Sequence of requests and releases (using First Fit):**

| Event      | Size   | Memory State (after event)                              |
| ---------- | ------ | ------------------------------------------------------- |
| Initial    | —      | `[OS:200][Free:800]`                                    |
| Load P1    | 300 KB | `[OS:200][P1:300][Free:500]`                            |
| Load P2    | 200 KB | `[OS:200][P1:300][P2:200][Free:300]`                    |
| Load P3    | 100 KB | `[OS:200][P1:300][P2:200][P3:100][Free:200]`            |
| Release P1 | —      | `[OS:200][Free:300][P2:200][P3:100][Free:200]`          |
| Load P4    | 250 KB | `[OS:200][P4:250][Free:50][P2:200][P3:100][Free:200]`   |
| Release P2 | —      | `[OS:200][P4:250][Free:50][Free:200][P3:100][Free:200]` |

```text
  Final memory state:
  ┌────────┬──────┬──────┬──────┬──────┬──────┐
  │OS:200  │P4:250│ F:50 │F:200 │P3:100│F:200 │
  └────────┴──────┴──────┴──────┴──────┴──────┘

  Total free = 50 + 200 + 200 = 450 KB
  But largest contiguous hole = 200 KB
  A 300 KB process CANNOT be loaded! → External fragmentation
```

**Same sequence with Best Fit:**

| Event           | First Fit Result            | Best Fit Result             |
| --------------- | --------------------------- | --------------------------- |
| Load P4 (250KB) | Uses 300KB hole → 50KB left | Uses 300KB hole → 50KB left |

In this case, both give the same result. But in general, Best Fit tends to create more tiny, unusable fragments over time.

---

## The 50-Percent Rule

Statistical analysis by Knuth shows that under steady-state conditions with First Fit allocation:

> If there are $N$ allocated blocks, there will be approximately $\frac{N}{2}$ free holes (on average).

$$\text{Expected holes} \approx \frac{N}{2}$$

This means that roughly **one-third** of memory is wasted to external fragmentation:

$$\text{Fraction wasted} \approx \frac{1}{3}$$

> [!NOTE]
> The 50-percent rule is a statistical average under random allocation/deallocation patterns. In practice, the actual fragmentation depends on workload characteristics.

---

## Compaction

**Compaction** is the process of moving allocated blocks together to consolidate all free space into one large hole.

```text
  Before Compaction:                After Compaction:
  ┌────────┬──────┬──────┬──────┐  ┌────────┬──────┬──────┬──────────┐
  │OS:200  │P2:150│F:100 │P3:200│  │OS:200  │P2:150│P3:200│ F:450   │
  ├────────┤      ├──────┤      │  │        │      │      │          │
  │        │      │F:150 │F:200 │  │        │      │      │          │
  └────────┴──────┴──────┴──────┘  └────────┴──────┴──────┴──────────┘

  Free = 100 + 150 + 200 = 450 KB  Free = 450 KB (one contiguous block!)
  Largest hole = 200 KB             Largest hole = 450 KB
```

### When Is Compaction Possible?

| Condition                      | Compaction Possible?                                        |
| ------------------------------ | ----------------------------------------------------------- |
| Execution-time address binding | Yes — addresses resolved at runtime via relocation register |
| Load-time address binding      | No — addresses fixed at load time                           |
| Compile-time address binding   | No — addresses hardcoded in executable                      |

### Cost of Compaction

| Factor         | Cost                                                 |
| -------------- | ---------------------------------------------------- |
| **CPU time**   | Must move all bytes of every relocated process       |
| **I/O impact** | Processes doing I/O may need special handling        |
| **Downtime**   | Processes may be suspended during compaction         |
| **Complexity** | Must update base registers and all memory references |

For a system with 1 GB of allocated memory and a memory copy speed of 10 GB/s:

$$T_\text{compact} \approx \frac{1 \text{ GB}}{10 \text{ GB/s}} = 0.1 \text{ seconds}$$

This might seem fast, but during this time, no useful work is done.

---

## Fragmentation Summary

| Type         | Definition                              | Cause                                             | Solution                          |
| ------------ | --------------------------------------- | ------------------------------------------------- | --------------------------------- |
| **Internal** | Wasted space _inside_ allocated block   | Fixed partitions — process smaller than partition | Use variable partitions or paging |
| **External** | Wasted space _between_ allocated blocks | Variable partitions — scattered holes             | Compaction, or use paging         |

```text
  Internal Fragmentation:          External Fragmentation:

  ┌──────────────────┐             ┌──────────────────┐
  │ ┌──────────────┐ │             │████████████████  │
  │ │ Process      │ │             │                  │
  │ │ (uses 150KB) │ │             │████████████████  │
  │ │              │ │             │                  │
  │ ├──────────────┤ │             │████████████████  │
  │ │ WASTED       │ │             │                  │
  │ │ (50KB unused)│ │             │ Holes scattered  │
  │ └──────────────┘ │             │ throughout memory │
  │  Partition: 200KB │             │ Total free is    │
  └──────────────────┘             │ large but not    │
                                   │ contiguous       │
  Waste is INSIDE the              └──────────────────┘
  allocation.                      Waste is BETWEEN
                                   allocations.
```

---

## Implementation: Free List Management

The OS maintains a linked list of free memory holes:

```c
typedef struct hole {
    int start;          // Starting address of hole
    int size;           // Size of hole in KB
    struct hole *next;  // Next hole in list
} Hole;

// First Fit allocation
Hole* first_fit(Hole *free_list, int request_size) {
    Hole *current = free_list;
    while (current != NULL) {
        if (current->size >= request_size) {
            // Found a fit — allocate from this hole
            int allocated_start = current->start;
            current->start += request_size;
            current->size  -= request_size;

            if (current->size == 0) {
                // Remove empty hole from list
                remove_from_list(free_list, current);
            }
            return allocated_start;
        }
        current = current->next;
    }
    return NULL;  // No hole large enough
}
```

```python
def best_fit(free_list, request_size):
    """Find the smallest hole that fits the request."""
    best = None
    for hole in free_list:
        if hole['size'] >= request_size:
            if best is None or hole['size'] < best['size']:
                best = hole

    if best:
        allocated_start = best['start']
        best['start'] += request_size
        best['size'] -= request_size
        if best['size'] == 0:
            free_list.remove(best)
        return allocated_start
    return None  # No fit found
```

---

## Buddy System (Bonus)

The **buddy system** is a compromise between fixed and variable partitioning. Memory is allocated in blocks of size $2^k$ for some integer $k$.

```text
  1024 KB total:

  Request 100 KB:
  Need 128 KB (next power of 2)

  Split: 1024 → 512 + 512
  Split: 512  → 256 + 256
  Split: 256  → 128 + 128
  Allocate: one 128 KB block

  ┌───────┬───────┬───────────┬───────────────────┐
  │A: 128 │F: 128 │  F: 256   │     F: 512        │
  └───────┴───────┴───────────┴───────────────────┘
```

| Aspect                     | Buddy System                                   |
| -------------------------- | ---------------------------------------------- |
| **Internal fragmentation** | Moderate (round up to $2^k$)                   |
| **External fragmentation** | Minimal (buddies can merge back)               |
| **Allocation speed**       | Fast ($O(\log n)$)                             |
| **Coalescing**             | Easy — merge adjacent "buddies" when both free |
| **Used by**                | Linux kernel (for physical page allocation)    |

---

## Try It Yourself

**Exercise 1:** A system has 1 MB of user memory. The following processes arrive and depart:

1. Load A (200 KB), Load B (300 KB), Load C (100 KB)
2. Release A
3. Load D (150 KB)

Draw the memory state after each step using First Fit. Is there external fragmentation after step 3?

:::details Solution
| Step | Memory State |
|------|-------------|
| After Load A | `[A:200][Free:824]` |
| After Load B | `[A:200][B:300][Free:524]` |
| After Load C | `[A:200][B:300][C:100][Free:424]` |
| After Release A | `[Free:200][B:300][C:100][Free:424]` |
| After Load D (First Fit) | `[D:150][Free:50][B:300][C:100][Free:424]` |

After step 3: Free = 50 + 424 = 474 KB. A 400 KB process could fit in the 424 KB hole but not in a single block larger than 474 KB. There is **mild external fragmentation** (50 KB hole likely too small to be useful).
:::

**Exercise 2:** Given holes of sizes [300, 600, 350, 200, 750, 125] KB, allocate a 365 KB process using (a) First Fit, (b) Best Fit, (c) Worst Fit. Show the remaining hole sizes.

:::details Solution
**(a) First Fit:** Scan from beginning. 300? No. 600? Yes! Allocate 365 from 600.
Remaining: [300, 235, 350, 200, 750, 125]

**(b) Best Fit:** Smallest hole ≥ 365. Candidates: 600, 750. Smallest = 600. Allocate 365 from 600.
Remaining: [300, 235, 350, 200, 750, 125] (same as First Fit in this case!)

Actually, let me re-check. Candidates: 600 (235 left), 350 (too small, 350<365), 750 (385 left). Smallest adequate = 600.
Remaining: [300, 235, 350, 200, 750, 125]

**(c) Worst Fit:** Largest hole = 750. Allocate 365 from 750.
Remaining: [300, 600, 350, 200, 385, 125]
:::

---

## Key Takeaways

- In **contiguous allocation**, each process occupies a single continuous block of memory.
- **Fixed partitioning** creates predetermined partitions — simple but causes **internal fragmentation**.
- **Variable partitioning** creates partitions on demand — eliminates internal fragmentation but causes **external fragmentation**.
- **First Fit** (scan from beginning) is generally the fastest and most practical allocation algorithm.
- **Best Fit** paradoxically creates the most unusable tiny fragments. **Worst Fit** wastes the largest holes.
- The **50-percent rule** predicts that ~1/3 of memory is wasted to fragmentation under First Fit.
- **Compaction** consolidates free space but is expensive and requires execution-time address binding.
- External fragmentation is the primary motivation for **paging**, which we study next.
- The **buddy system** uses power-of-2 block sizes for efficient allocation and coalescing.
