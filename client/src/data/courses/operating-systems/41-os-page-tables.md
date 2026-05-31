---
title: Page Tables & TLB
section: "Memory Management"
---

# Page Tables & TLB

A simple single-level page table works in theory but fails at scale. For a 32-bit address space with 4 KB pages, the page table has over **one million entries** — and for 64-bit systems, the numbers become astronomical. This lesson covers the hardware and data structures that make page tables practical: the Translation Lookaside Buffer (TLB), hierarchical page tables, hashed page tables, and inverted page tables.

---

## The Problem: Page Table Size

| Address Space   | Page Size | Page Table Entries    | Entry Size | Page Table Size         |
| --------------- | --------- | --------------------- | ---------- | ----------------------- |
| 32-bit (4 GB)   | 4 KB      | $2^{20} \approx 1$ M  | 4 bytes    | **4 MB** per process    |
| 32-bit (4 GB)   | 4 KB      | $2^{20}$              | 8 bytes    | **8 MB** per process    |
| 48-bit (256 TB) | 4 KB      | $2^{36} \approx 64$ B | 8 bytes    | **512 GB** per process! |
| 64-bit (16 EB)  | 4 KB      | $2^{52}$              | 8 bytes    | **32 PB** per process!! |

> [!WARNING]
> A 48-bit address space (used by x86-64) with a flat page table would require 512 GB just for the page table — more than most systems have in total RAM! Clearly, we need smarter approaches.

---

## Translation Lookaside Buffer (TLB)

The TLB is a small, extremely fast **hardware cache** that stores recently used page table entries. It is built from **associative memory** (Content-Addressable Memory, CAM) that can be searched in parallel.

### How the TLB Works

```text
  CPU generates logical address:
  ┌──────────────┬──────────┐
  │ Page Number  │  Offset  │
  └──────┬───────┴──────────┘
         │
         ↓
  ┌──────────────────────────────────┐
  │            TLB                    │
  │  ┌────────┬────────┐             │
  │  │ Page # │ Frame #│  Entry 1   │  All entries
  │  ├────────┼────────┤             │  searched
  │  │ Page # │ Frame #│  Entry 2   │  in PARALLEL
  │  ├────────┼────────┤             │  (associative
  │  │  ...   │  ...   │  ...       │   lookup)
  │  └────────┴────────┘             │
  └──────────┬───────────┬───────────┘
             │           │
          TLB HIT     TLB MISS
             │           │
             ↓           ↓
      Use frame #    Access page table
      directly       in memory, then
      → 1 memory     update TLB
        access       → 2+ memory accesses
```

### TLB Hit vs Miss

| Scenario     | Steps                                                                             | Memory Accesses            |
| ------------ | --------------------------------------------------------------------------------- | -------------------------- |
| **TLB Hit**  | TLB lookup → frame found → access memory                                          | 1 (plus TLB lookup, ~1 ns) |
| **TLB Miss** | TLB lookup → not found → read page table from memory → update TLB → access memory | 2+ (plus TLB lookup)       |

### TLB Characteristics

| Property                     | Typical Value                        |
| ---------------------------- | ------------------------------------ |
| Size                         | 64 - 1024 entries                    |
| Lookup time ($t_\text{TLB}$) | 0.5 - 1 ns                           |
| Hit ratio ($h$)              | 95% - 99%                            |
| Associativity                | Fully associative or set-associative |
| Replacement                  | LRU or random                        |

---

## Effective Access Time (EAT)

The EAT accounts for both TLB hits and misses:

$$\text{EAT} = h \times (t_\text{TLB} + t_\text{mem}) + (1-h) \times (t_\text{TLB} + 2 \times t_\text{mem})$$

Where:

- $h$ = TLB hit ratio
- $t_\text{TLB}$ = TLB lookup time
- $t_\text{mem}$ = memory access time

Simplifying:

$$\text{EAT} = t_\text{TLB} + t_\text{mem} + (1-h) \times t_\text{mem}$$

$$\text{EAT} = t_\text{TLB} + (2-h) \times t_\text{mem}$$

### Worked Examples

**Given**: $t_\text{TLB} = 1$ ns, $t_\text{mem} = 100$ ns.

| Hit Ratio ($h$) | EAT (ns)                                    | Slowdown vs Direct Access |
| --------------- | ------------------------------------------- | ------------------------- |
| 100%            | $1 + 100 = 101$                             | 1%                        |
| 99%             | $1 + (2 - 0.99) \times 100 = 1 + 101 = 102$ | 2%                        |
| 98%             | $1 + (2 - 0.98) \times 100 = 1 + 102 = 103$ | 3%                        |
| 95%             | $1 + (2 - 0.95) \times 100 = 1 + 105 = 106$ | 6%                        |
| 90%             | $1 + (2 - 0.90) \times 100 = 1 + 110 = 111$ | 11%                       |
| 80%             | $1 + (2 - 0.80) \times 100 = 1 + 120 = 121$ | 21%                       |
| 50%             | $1 + (2 - 0.50) \times 100 = 1 + 150 = 151$ | 51%                       |

> [!TIP]
> Even a 95% hit ratio gives only 6% overhead. TLBs are effective because programs exhibit **locality of reference** — they tend to access the same pages repeatedly.

---

## TLB Reach

**TLB reach** is the amount of memory accessible through the TLB without a miss:

$$\text{TLB Reach} = \text{TLB entries} \times \text{Page size}$$

| TLB Entries | Page Size         | TLB Reach  |
| ----------- | ----------------- | ---------- |
| 64          | 4 KB              | 256 KB     |
| 256         | 4 KB              | 1 MB       |
| 1024        | 4 KB              | 4 MB       |
| 256         | 2 MB (huge pages) | **512 MB** |
| 1024        | 2 MB              | **2 GB**   |

> Increasing page size or TLB entries both increase TLB reach. **Huge pages** dramatically improve TLB reach for memory-intensive applications.

---

## TLB and Context Switches

When the OS switches between processes, the TLB entries become invalid (they belong to the previous process). Two approaches:

| Approach              | Method                                             | Cost                                           |
| --------------------- | -------------------------------------------------- | ---------------------------------------------- |
| **Flush TLB**         | Clear all entries on context switch                | High — every access after switch is a TLB miss |
| **Tagged TLB (ASID)** | Each TLB entry includes an Address Space ID (ASID) | Low — entries from multiple processes coexist  |

```text
  Tagged TLB Entry:
  ┌──────┬────────────┬────────────┐
  │ ASID │ Page Number │ Frame Num  │
  │ (P1) │     5       │    23      │
  └──────┴────────────┴────────────┘

  ASID = Address Space Identifier
  Each process has a unique ASID
  TLB can hold entries for multiple processes simultaneously
```

---

## Hierarchical (Multi-Level) Page Tables

Instead of one huge flat page table, break it into a **hierarchy** of smaller tables. Only the tables that are actually needed are kept in memory.

### Two-Level Page Table

For a 32-bit address space with 4 KB pages:

```text
  Logical Address (32 bits):
  ┌────────────┬────────────┬──────────────┐
  │  p1 (10)   │  p2 (10)   │  d (12)      │
  │ Outer page │ Inner page │  Offset      │
  └──────┬─────┴─────┬──────┴──────────────┘
         │           │
         ↓           │
  ┌──────────────┐   │
  │ Outer Page   │   │
  │ Table        │   │
  │ (1024 entries│   │
  │  always in   │   │
  │  memory)     │   │
  │ ┌──────────┐ │   │
  │ │ entry p1 │─┼───┘
  │ └──────────┘ │
  └──────────────┘
         │
         ↓
  ┌──────────────┐
  │ Inner Page   │
  │ Table        │
  │ (1024 entries│
  │  loaded only │
  │  if needed)  │
  │ ┌──────────┐ │
  │ │ entry p2 │─┼──→ Frame number → + d → Physical Address
  │ └──────────┘ │
  └──────────────┘
```

### Why Two-Level Saves Space

A flat page table for 32-bit, 4 KB pages = 4 MB (always allocated).

With two-level paging:

- Outer table: 1024 entries × 4 bytes = **4 KB** (always in memory)
- Each inner table: 1024 entries × 4 bytes = **4 KB** (only loaded if needed)
- If a process uses only 2 MB of its 4 GB address space (2 inner tables), total = 4 KB + 2 × 4 KB = **12 KB**

**Savings: 4 MB → 12 KB** for a sparse address space!

### Why Sparse Saves

```text
  Typical process address space:

  0x00000000 ┌──────────────────┐
             │ Code (used)       │ ← 1-2 inner page tables
             ├──────────────────┤
             │ Data (used)       │ ← 1-2 inner page tables
             ├──────────────────┤
             │                  │
             │   HUGE GAP       │ ← NO inner page tables needed!
             │   (unused)       │    Outer table entry = NULL
             │                  │
             ├──────────────────┤
             │ Heap (growing ↑) │ ← 1-2 inner page tables
             │                  │
             │   GAP            │ ← No tables needed
             │                  │
             │ Stack (growing ↓)│ ← 1-2 inner page tables
  0xFFFFFFFF └──────────────────┘

  Only ~10 inner tables instead of 1024!
```

---

### Three-Level and Four-Level Paging

For larger address spaces, more levels are needed:

| Architecture          | Address Bits Used | Levels | Structure              |
| --------------------- | ----------------- | ------ | ---------------------- |
| 32-bit x86            | 32                | 2      | 10 + 10 + 12           |
| x86-64 (48-bit)       | 48                | 4      | 9 + 9 + 9 + 9 + 12     |
| x86-64 (57-bit, LA57) | 57                | 5      | 9 + 9 + 9 + 9 + 9 + 12 |
| AArch64 (48-bit)      | 48                | 4      | 9 + 9 + 9 + 9 + 12     |

**x86-64 four-level paging:**

```text
  48-bit Virtual Address:
  ┌──────┬──────┬──────┬──────┬────────────┐
  │PML4  │ PDP  │ PD   │ PT   │  Offset    │
  │(9bit)│(9bit)│(9bit)│(9bit)│ (12 bits)  │
  └──┬───┴──┬───┴──┬───┴──┬───┴────────────┘
     │      │      │      │
     ↓      ↓      ↓      ↓
  PML4 → Page Dir  → Page Dir → Page     → Frame
  Table   Pointer    Entry      Table       + Offset
          Table                  Entry      = Physical

  PML4 = Page Map Level 4
  PDP  = Page Directory Pointer
  PD   = Page Directory
  PT   = Page Table
```

> [!NOTE]
> Each level has $2^9 = 512$ entries. With 8-byte entries, each table is $512 \times 8 = 4$ KB — exactly one page! This is by design — it simplifies memory management.

---

## Hashed Page Tables

For address spaces larger than 32 bits, **hashed page tables** offer an alternative:

```text
  Logical page number p
         │
         ↓
  ┌──── Hash ────┐
  │ h(p) = index │
  └──────┬───────┘
         │
         ↓
  ┌──────────────────────────────────────┐
  │ Hash Table                            │
  │ ┌─────────────────────────────┐      │
  │ │ index: [p1, frame1, next] ──→      │
  │ │        [p2, frame2, next] ──→ ... │
  │ │        (chain for collisions)      │
  │ └─────────────────────────────┘      │
  └──────────────────────────────────────┘

  Each entry: (virtual page number, frame number, next pointer)
  Search the chain until p matches.
```

| Advantage                                                     | Disadvantage                      |
| ------------------------------------------------------------- | --------------------------------- |
| Works well for sparse, large address spaces                   | Hash collisions → chain traversal |
| Table size proportional to allocated pages, not address space | More complex than hierarchical    |
| $O(1)$ average lookup                                         | Worst case $O(n)$ with bad hash   |

### Clustered Page Tables

A variation where each hash entry maps to multiple page frames (a cluster), reducing the number of hash lookups for sequential page accesses.

---

## Inverted Page Tables

Instead of one page table per process, maintain a **single, global page table** with one entry per **physical frame**:

```text
  Traditional Page Table:         Inverted Page Table:
  (one per process)               (one for entire system)

  Process 1: page → frame        Frame 0: ┌──────┬──────┐
  Process 2: page → frame                  │ PID  │ Page │
  Process 3: page → frame        Frame 1: ├──────┼──────┤
  ...                                      │ PID  │ Page │
  (N × M entries total)          Frame 2: ├──────┼──────┤
                                           │ PID  │ Page │
                                  ...      │ ...  │ ...  │
                                  Frame F: └──────┴──────┘

                                  F entries (one per frame)
```

### Address Translation with Inverted Page Table

Logical address = (PID, page number, offset).

To translate: search the entire inverted page table for an entry matching (PID, page number). The index where it's found _is_ the frame number.

| Advantage                                      | Disadvantage                         |
| ---------------------------------------------- | ------------------------------------ |
| Fixed size regardless of logical address space | **Linear search** needed — slow!     |
| One table for all processes                    | Difficult to implement shared pages  |
| Saves memory for large address spaces          | Usually combined with hash for speed |

$$\text{Table size} = \text{Number of physical frames} \times \text{entry size}$$

For 4 GB RAM with 4 KB pages: $\frac{4 \text{ GB}}{4 \text{ KB}} = 2^{20}$ entries — manageable!

### Used by: PowerPC, UltraSPARC, IA-64 (Itanium)

---

## Comparison of Page Table Structures

| Structure               | Space Efficiency            | Lookup Speed                | Best For                   | Used By                 |
| ----------------------- | --------------------------- | --------------------------- | -------------------------- | ----------------------- |
| **Flat (single-level)** | Poor for large spaces       | $O(1)$ with direct indexing | Small address spaces       | Simple embedded systems |
| **Two-level**           | Good for sparse spaces      | 2 memory accesses           | 32-bit systems             | x86 (32-bit)            |
| **Four-level**          | Excellent for sparse spaces | 4 memory accesses           | 64-bit systems             | **x86-64, AArch64**     |
| **Hashed**              | Proportional to used pages  | $O(1)$ average              | Very large, sparse spaces  | Uncommon in practice    |
| **Inverted**            | Best (one table for all)    | $O(n)$ or $O(1)$ with hash  | Very large physical memory | PowerPC, Itanium        |

---

## Putting It All Together: TLB + Multi-Level Page Table

In practice, both mechanisms work together:

```text
  CPU generates virtual address
        │
        ↓
  ┌──────────────┐
  │   TLB Lookup  │ ← Parallel, ~1 ns
  └──────┬───────┘
         │
    ┌────┴────┐
    │ HIT     │ MISS
    │         │
    ↓         ↓
  Access   ┌──────────────┐
  Memory   │ Page Table   │ ← 4 memory accesses (4-level)
  (1 access)│ Walk         │
           └──────┬───────┘
                  │
                  ↓
           Update TLB
           Access Memory (1 access)

  Hit:  TLB time + 1 memory access
  Miss: TLB time + 4 memory accesses + 1 memory access = 5 accesses!
```

### EAT with Multi-Level Pages

For a 4-level page table:

$$\text{EAT} = h \times (t_\text{TLB} + t_\text{mem}) + (1-h) \times (t_\text{TLB} + 5 \times t_\text{mem})$$

With $h = 0.99$, $t_\text{TLB} = 1$ ns, $t_\text{mem} = 100$ ns:

$$\text{EAT} = 0.99 \times 101 + 0.01 \times 501 = 99.99 + 5.01 = 105 \text{ ns}$$

Only 5% overhead despite 4 levels — the TLB absorbs almost all the cost!

---

## Try It Yourself

**Exercise 1:** A system has a TLB with 128 entries and uses 4 KB pages. If the TLB hit ratio is 97% and memory access time is 80 ns with TLB lookup time of 2 ns, calculate the EAT.

:::details Solution
$$\text{EAT} = h(t_\text{TLB} + t_\text{mem}) + (1-h)(t_\text{TLB} + 2 \times t_\text{mem})$$

$$= 0.97(2 + 80) + 0.03(2 + 160)$$

$$= 0.97 \times 82 + 0.03 \times 162$$

$$= 79.54 + 4.86 = 84.4 \text{ ns}$$

Slowdown: $(84.4 - 80) / 80 = 5.5\%$

TLB Reach: $128 \times 4 \text{ KB} = 512 \text{ KB}$
:::

**Exercise 2:** How would you split a 42-bit virtual address for a three-level page table with 4 KB pages? How many entries are in each table?

:::details Solution
Page offset = 12 bits (for 4 KB pages).
Remaining: $42 - 12 = 30$ bits for page numbers.
Split evenly: $10 + 10 + 10 + 12$.

- Level 1: $2^{10} = 1024$ entries
- Level 2: $2^{10} = 1024$ entries per table
- Level 3: $2^{10} = 1024$ entries per table
- Offset: 12 bits (4 KB pages)

Each table with 4-byte entries: $1024 \times 4 = 4$ KB = 1 page. ✓
:::

---

## Key Takeaways

- A flat page table for 64-bit systems would be impossibly large — multi-level structures are essential.
- The **TLB** is a fast hardware cache for page table entries with typical hit ratios of 95-99%, making paging practical.
- **Effective Access Time**: $\text{EAT} = t_\text{TLB} + (2-h) \times t_\text{mem}$ for single-level; more memory accesses for multi-level on TLB miss.
- **TLB Reach** = entries × page size — increased with larger pages or more TLB entries.
- **Hierarchical page tables** (2, 4, 5 levels) save space by only allocating tables for used address regions.
- **Hashed page tables** work well for very large, sparse address spaces.
- **Inverted page tables** have one entry per physical frame — space-efficient but slow to search without hashing.
- Modern systems (x86-64) use **4-level page tables** with a **TLB** — the TLB absorbs the cost of multi-level walks.
- **ASIDs** (tagged TLBs) avoid flushing the TLB on context switches.
