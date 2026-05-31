---
title: Segmentation
---

# Segmentation

Paging divides memory into fixed-size blocks — efficient for the hardware but invisible to the programmer. **Segmentation** takes a different approach: it divides memory according to the **user's logical view** of a program. Each segment represents a meaningful unit — the main code, a library, the stack, the heap, a symbol table — with its own size and protection attributes.

---

## The User's View of Memory

Programmers don't think of memory as a flat array of bytes. They think in terms of logical units:

```text
  Programmer's Mental Model:

  ┌──────────────────┐
  │  Main Program    │  ← Segment 0
  ├──────────────────┤
  │  Function Library│  ← Segment 1
  ├──────────────────┤
  │  Symbol Table    │  ← Segment 2
  ├──────────────────┤
  │  Stack           │  ← Segment 3
  ├──────────────────┤
  │  Heap            │  ← Segment 4
  └──────────────────┘

  Each segment has a different size,
  purpose, and protection requirement.
```

> **Segmentation** maps this user view directly into memory management. Each logical unit becomes a **segment** — a contiguous block of memory with its own base address and length.

---

## Logical Address in Segmentation

A logical address in a segmented system is a **two-dimensional** address:

$$\text{Logical Address} = (\text{segment number}, \text{offset})$$

This is different from paging, where the address is a single number split into page + offset.

```text
  Logical Address:
  ┌──────────────────┬──────────────┐
  │ Segment Number   │   Offset     │
  │      (s)         │    (d)       │
  └──────────────────┴──────────────┘
```

| Component              | Description                                  |
| ---------------------- | -------------------------------------------- |
| **Segment number (s)** | Identifies which segment (code, stack, etc.) |
| **Offset (d)**         | Position within that segment                 |

---

## Segment Table

Each process has a **segment table** that maps segment numbers to physical memory locations. Each entry contains:

| Field     | Purpose                                            |
| --------- | -------------------------------------------------- |
| **Base**  | Starting physical address of the segment in memory |
| **Limit** | Length of the segment (in bytes)                   |

```text
  Segment Table for Process P1:

  ┌─────────┬───────────┬─────────┐
  │ Segment │   Base    │  Limit  │
  ├─────────┼───────────┼─────────┤
  │    0    │   1400    │   1000  │
  │    1    │   6300    │    400  │
  │    2    │   4300    │    400  │
  │    3    │   3200    │   1100  │
  │    4    │   4700    │   1000  │
  └─────────┴───────────┴─────────┘
```

---

## Address Translation

Given logical address $(s, d)$:

1. Look up segment $s$ in the segment table to get **base** and **limit**.
2. **Check bounds**: Is $d < \text{limit}$?
   - **Yes**: physical address = $\text{base} + d$
   - **No**: trap to OS — **segmentation fault**!

```text
  Logical Address (s, d)
         │
         ↓
  ┌──────────────────────────────────────┐
  │          Segment Table               │
  │  ┌───────┬──────┬───────┐           │
  │  │  Seg  │ Base │ Limit │           │
  │  │   s   │  b   │  l    │           │
  │  └───────┴──┬───┴───┬───┘           │
  │             │       │                │
  │             ↓       ↓                │
  │         ┌───────────────┐            │
  │         │  d < limit ?  │            │
  │         └───┬───────┬───┘            │
  │          YES│       │NO              │
  │             ↓       ↓                │
  │     base + d = PA   TRAP             │
  │     (physical addr) (seg fault)      │
  └──────────────────────────────────────┘
```

### Worked Example

Using the segment table above, translate $(2, 53)$:

1. Segment 2: base = 4300, limit = 400.
2. Is $53 < 400$? Yes ✓
3. Physical address = $4300 + 53 = 4353$

Translate $(1, 500)$:

1. Segment 1: base = 6300, limit = 400.
2. Is $500 < 400$? **No** ✗ → **Segmentation fault!**

### Translation Table

| Logical Address (s, d) | Base | Limit | d < Limit?    | Physical Address |
| ---------------------- | ---- | ----- | ------------- | ---------------- |
| (0, 100)               | 1400 | 1000  | 100 < 1000 ✓  | 1500             |
| (0, 999)               | 1400 | 1000  | 999 < 1000 ✓  | 2399             |
| (1, 200)               | 6300 | 400   | 200 < 400 ✓   | 6500             |
| (2, 53)                | 4300 | 400   | 53 < 400 ✓    | 4353             |
| (3, 1100)              | 3200 | 1100  | 1100 < 1100 ✗ | **TRAP**         |
| (4, 0)                 | 4700 | 1000  | 0 < 1000 ✓    | 4700             |

---

## Segments in Physical Memory

Unlike paging, segments are of **variable size** and placed contiguously in physical memory:

```text
  Physical Memory:

  0    ┌────────────────────┐
       │   (other data)     │
  1400 ├────────────────────┤
       │ Seg 0 (1000 bytes) │  ← Main program
  2400 ├────────────────────┤
       │   (other data)     │
  3200 ├────────────────────┤
       │ Seg 3 (1100 bytes) │  ← Stack
  4300 ├────────────────────┤
       │ Seg 2 (400 bytes)  │  ← Symbol table
  4700 ├────────────────────┤
       │ Seg 4 (1000 bytes) │  ← Heap
  5700 ├────────────────────┤
       │   (other data)     │
  6300 ├────────────────────┤
       │ Seg 1 (400 bytes)  │  ← Library
  6700 ├────────────────────┤
       │   (free space)     │
       └────────────────────┘
```

---

## Protection and Sharing

Segmentation naturally supports **per-segment protection** because segments correspond to logical units:

### Protection Bits per Segment

| Segment          | Type | Read | Write | Execute |
| ---------------- | ---- | ---- | ----- | ------- |
| 0 (Code)         | Code | ✓    | ✗     | ✓       |
| 1 (Library)      | Code | ✓    | ✗     | ✓       |
| 2 (Symbol Table) | Data | ✓    | ✓     | ✗       |
| 3 (Stack)        | Data | ✓    | ✓     | ✗       |
| 4 (Heap)         | Data | ✓    | ✓     | ✗       |

### Sharing Code Segments

Two processes running the same program can share their code segment while having private data segments:

```text
  Process P1:                  Process P2:
  Segment Table                Segment Table
  ┌────┬──────┬─────┐         ┌────┬──────┬─────┐
  │ 0  │ 8000 │ 2000│ ──┐     │ 0  │ 8000 │ 2000│ ──┐  Same code!
  │ 1  │ 3000 │  500│   │     │ 1  │ 5000 │  600│   │
  └────┴──────┴─────┘   │     └────┴──────┴─────┘   │
                         │                            │
                         └──→ Physical 8000-9999 ←────┘
                              (Shared code segment)

  P1's data at 3000           P2's data at 5000
  (private)                   (private)
```

> [!TIP]
> Sharing at the segment level is more natural than sharing at the page level. A "shared library" maps directly to a shared segment, rather than requiring coordination across multiple shared pages.

---

## Segmentation vs Paging

| Feature                    | Paging                                           | Segmentation                            |
| -------------------------- | ------------------------------------------------ | --------------------------------------- |
| **Unit size**              | Fixed (e.g., 4 KB)                               | Variable (per segment)                  |
| **User visibility**        | Invisible to programmer                          | Visible — corresponds to logical units  |
| **Address format**         | Single linear address (split into page + offset) | Two-part: (segment, offset)             |
| **External fragmentation** | **None**                                         | **Yes** — segments are variable-sized   |
| **Internal fragmentation** | Yes (last page)                                  | **None** — segment exactly fits content |
| **Protection**             | Per page                                         | Per segment (more natural)              |
| **Sharing**                | Per page                                         | Per segment (more natural)              |
| **Hardware complexity**    | Moderate                                         | Moderate                                |
| **Table size**             | Can be very large                                | Typically small (few segments)          |
| **Used today**             | **Dominant**                                     | Mostly vestigial                        |

---

## External Fragmentation Returns

Because segments are variable-sized, they suffer the same external fragmentation problem as variable partitioning:

```text
  After several allocations and deallocations:

  ┌──────────────────────┐
  │ Seg A (2000 bytes)   │
  ├──────────────────────┤
  │ FREE (500 bytes)     │  ← Too small
  ├──────────────────────┤
  │ Seg B (1000 bytes)   │
  ├──────────────────────┤
  │ FREE (300 bytes)     │  ← Too small
  ├──────────────────────┤
  │ Seg C (1500 bytes)   │
  ├──────────────────────┤
  │ FREE (700 bytes)     │  ← Too small
  └──────────────────────┘

  Total free = 1500 bytes
  But a 1200-byte segment can't fit!
```

This is the fundamental weakness of segmentation compared to paging.

---

## Segmented Paging (Intel x86)

The Intel x86 architecture (from the 80386 onward) combined segmentation and paging into a **two-stage translation**:

$$\text{Logical} \xrightarrow{\text{Segmentation}} \text{Linear} \xrightarrow{\text{Paging}} \text{Physical}$$

### Two-Stage Translation

```text
  Logical Address            Linear Address           Physical Address
  ┌─────────┬──────┐        ┌────────────────┐        ┌──────────────┐
  │Selector │Offset│ ──→    │  32-bit linear │  ──→   │  Physical    │
  │ (seg #) │      │  Seg   │  address       │  Page  │  address     │
  └─────────┴──────┘  Table └────────────────┘  Table └──────────────┘

  Stage 1: Segmentation          Stage 2: Paging
  selector → base + offset      linear → page table → frame + offset
  = linear address               = physical address
```

### Detailed Flow

```text
  ┌─────────────────────────────────────────────────────────────┐
  │                    x86 Address Translation                   │
  │                                                              │
  │  Logical: (segment selector, offset)                        │
  │       │                                                      │
  │       ↓                                                      │
  │  ┌──────────────────────┐                                   │
  │  │  Segment Descriptor  │  Contains: base, limit, type,    │
  │  │  Table (GDT/LDT)    │  privilege level, present bit     │
  │  └──────────┬───────────┘                                   │
  │             │                                                │
  │             ↓                                                │
  │  Linear Address = segment base + offset                     │
  │  (32 bits: directory | table | offset)                      │
  │       │                                                      │
  │       ↓                                                      │
  │  ┌──────────────────────┐                                   │
  │  │  Page Directory      │  10 bits → 1024 entries          │
  │  └──────────┬───────────┘                                   │
  │             │                                                │
  │             ↓                                                │
  │  ┌──────────────────────┐                                   │
  │  │  Page Table          │  10 bits → 1024 entries          │
  │  └──────────┬───────────┘                                   │
  │             │                                                │
  │             ↓                                                │
  │  Physical Address = frame base + page offset (12 bits)      │
  └─────────────────────────────────────────────────────────────┘
```

### x86 Segment Descriptor

Each segment has a descriptor in the GDT (Global Descriptor Table) or LDT (Local Descriptor Table):

| Field        | Size    | Purpose                                       |
| ------------ | ------- | --------------------------------------------- |
| Base Address | 32 bits | Starting address of segment                   |
| Limit        | 20 bits | Segment size (in bytes or 4 KB units)         |
| Type         | 4 bits  | Code/data, read/write/execute                 |
| DPL          | 2 bits  | Descriptor Privilege Level (0=kernel, 3=user) |
| Present      | 1 bit   | Is segment in memory?                         |
| Granularity  | 1 bit   | Limit in bytes (0) or 4 KB pages (1)          |

---

## Modern Systems: Flat Memory Model

Despite hardware support for segmentation, modern operating systems (Linux, Windows, macOS) use a **flat memory model** — all segments have base = 0 and limit = max, effectively making segmentation a no-op:

```text
  Modern OS Segment Configuration:

  Code Segment: base = 0, limit = 4 GB (or max)
  Data Segment: base = 0, limit = 4 GB (or max)
  Stack Segment: base = 0, limit = 4 GB (or max)

  Result: logical address = linear address
  Segmentation is "transparent" — only paging matters.
```

| Reason                     | Explanation                                         |
| -------------------------- | --------------------------------------------------- |
| **Portability**            | Not all architectures have segmentation             |
| **Simplicity**             | One translation scheme (paging) is simpler than two |
| **External fragmentation** | Segmentation reintroduces it; paging eliminates it  |
| **64-bit**                 | x86-64 largely removes segmentation support         |

> [!IMPORTANT]
> In x86-64 (64-bit mode), segmentation is almost completely disabled. The `CS`, `DS`, `ES`, `SS` segment registers are forced to base=0, limit=max. Only `FS` and `GS` retain non-zero bases (used for thread-local storage). **Paging is the sole memory management mechanism** in modern 64-bit systems.

### What Remains of Segmentation

| Use                   | Segment Register             | Purpose                                                       |
| --------------------- | ---------------------------- | ------------------------------------------------------------- |
| Thread-local storage  | `FS` (Linux), `GS` (Windows) | Per-thread data access without locks                          |
| Kernel vs user mode   | `CS` (code segment)          | Privilege level (ring 0 vs ring 3) stored in segment selector |
| CPU security features | Various                      | Intel SGX enclaves use segment-like protection                |

---

## Segmentation in Code

### C Program Memory Layout (Logical Segments)

```c
#include <stdio.h>
#include <stdlib.h>

// Segment: Code (text)
int main() {
    // Segment: Stack
    int local_var = 42;

    // Segment: Heap
    int *heap_var = (int *)malloc(sizeof(int));
    *heap_var = 100;

    // Segment: Data (initialized global/static)
    static int static_var = 7;

    printf("Code segment:  %p\n", (void *)main);
    printf("Stack segment: %p\n", (void *)&local_var);
    printf("Heap segment:  %p\n", (void *)heap_var);
    printf("Data segment:  %p\n", (void *)&static_var);

    free(heap_var);
    return 0;
}
```

**Typical output on x86-64 Linux:**

```text
Code segment:  0x401136         ← Low addresses
Data segment:  0x404030         ← After code
Heap segment:  0x1a3f010        ← Growing upward
Stack segment: 0x7ffd2a3b1c4c  ← High addresses, growing downward
```

```text
  Virtual Address Space Layout (modern flat model):

  0x000000000000 ┌─────────────────────┐
                 │ Text (Code)          │  ← Old "code segment"
                 ├─────────────────────┤
                 │ Data (initialized)   │  ← Old "data segment"
                 ├─────────────────────┤
                 │ BSS (uninitialized)  │
                 ├─────────────────────┤
                 │ Heap ↓              │  ← Grows downward (upward in addresses)
                 │                     │
                 │     (unmapped)      │
                 │                     │
                 │ Stack ↑             │  ← Grows upward (downward in addresses)
  0x7FFFFFFFFFFF └─────────────────────┘

  All in ONE flat segment (base=0, limit=max)
  Protection is handled by PAGE-LEVEL permissions.
```

---

## Comparison Summary

| Feature                    | Pure Segmentation     | Pure Paging         | Segmented Paging       |
| -------------------------- | --------------------- | ------------------- | ---------------------- |
| **External fragmentation** | Yes                   | No                  | No (paging handles it) |
| **Internal fragmentation** | No                    | Yes (minor)         | Yes (minor)            |
| **Sharing**                | Natural (per segment) | Possible (per page) | Both                   |
| **Protection**             | Per segment           | Per page            | Both                   |
| **Translation overhead**   | 1 table lookup        | 1+ table lookups    | 2+ table lookups       |
| **Modern usage**           | Rare                  | **Dominant**        | Legacy (32-bit x86)    |

---

## Try It Yourself

**Exercise 1:** A process has 4 segments with the following segment table:

| Segment | Base | Limit |
| ------- | ---- | ----- |
| 0       | 219  | 600   |
| 1       | 2300 | 14    |
| 2       | 90   | 100   |
| 3       | 1327 | 580   |

Translate: (0, 430), (1, 10), (2, 500), (3, 400).

:::details Solution
| Logical (s, d) | Base | Limit | d < Limit? | Physical Address |
|----------------|------|-------|-----------|-----------------|
| (0, 430) | 219 | 600 | 430 < 600 ✓ | 219 + 430 = **649** |
| (1, 10) | 2300 | 14 | 10 < 14 ✓ | 2300 + 10 = **2310** |
| (2, 500) | 90 | 100 | 500 < 100 ✗ | **Segmentation fault!** |
| (3, 400) | 1327 | 580 | 400 < 580 ✓ | 1327 + 400 = **1727** |
:::

**Exercise 2:** Why did modern 64-bit operating systems abandon segmentation in favor of a flat memory model with paging? List at least three reasons.

:::details Solution

1. **External fragmentation**: Segmentation causes external fragmentation because segments are variable-sized. Paging with fixed-size pages eliminates this entirely.

2. **Portability**: Not all CPU architectures support segmentation. By using a flat model, OS code is portable across x86, ARM, RISC-V, etc. — only paging support is needed.

3. **Complexity**: Two-stage translation (segmentation + paging) is more complex than paging alone. It adds hardware cost, increases TLB pressure, and complicates the OS memory manager.

4. **Redundancy**: Page-level protection bits provide the same protection capabilities as segment-level protection, making segmentation's protection features redundant.

5. **64-bit address spaces**: With 48+ bit virtual addresses, the address space is large enough that the "logical grouping" benefit of segments is unnecessary — processes can simply place code, data, heap, and stack at different ranges within one flat space.
   :::

---

## Key Takeaways

- **Segmentation** divides memory according to the programmer's logical view: code, data, stack, heap, libraries.
- A logical address is a pair $(s, d)$ — segment number and offset. The segment table maps $s$ to a (base, limit) pair.
- Translation: check $d < \text{limit}$, then $\text{PA} = \text{base} + d$. Violation causes a **segmentation fault**.
- Segmentation provides **natural protection and sharing** at the segment level.
- **External fragmentation** returns with segmentation because segments are variable-sized — this is its major weakness.
- Intel x86 combined **segmented paging**: logical → linear (segmentation) → physical (paging).
- Modern 64-bit systems use a **flat memory model** — all segments have base=0, limit=max — making segmentation a no-op. **Paging is the sole mechanism**.
- Segmentation survives only for niche uses: thread-local storage (`FS`/`GS` registers), privilege levels, and security features.
