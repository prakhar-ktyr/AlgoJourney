---
title: Introduction to Memory Management
section: "Memory Management"
---

# Introduction to Memory Management

Every program must reside in memory to execute. The operating system's **memory manager** is responsible for allocating memory to processes, tracking what's in use, protecting processes from each other, and making the best use of a limited resource. Memory management is one of the most critical OS functions — poor memory management leads to crashes, security vulnerabilities, and terrible performance.

---

## The Memory Hierarchy

Modern computers use a hierarchy of storage, each level trading speed for capacity:

```text
                    ┌─────────┐
                    │Registers│  ← Fastest, smallest (bytes)
                    └────┬────┘
                    ┌────┴────┐
                    │ L1 Cache│  (~1ns, 32-64 KB)
                    └────┬────┘
                    ┌────┴────┐
                    │ L2 Cache│  (~4ns, 256 KB - 1 MB)
                    └────┬────┘
                    ┌────┴────┐
                    │ L3 Cache│  (~10ns, 4-64 MB)
                    └────┬────┘
               ┌─────────┴─────────┐
               │    Main Memory    │  (~100ns, 4-256 GB)
               │      (RAM)        │
               └─────────┬─────────┘
            ┌─────────────┴──────────────┐
            │    Solid State Drive       │  (~50-100μs, 256 GB - 4 TB)
            │         (SSD)              │
            └─────────────┬──────────────┘
       ┌──────────────────┴───────────────────┐
       │        Hard Disk Drive (HDD)          │  (~5-10ms, 1-20 TB)
       └───────────────────────────────────────┘
```

### Speed, Size, and Cost Comparison

| Level          | Typical Size  | Access Time | Cost per GB (approx.) | Volatile? |
| -------------- | ------------- | ----------- | --------------------- | --------- |
| **Registers**  | ~1 KB         | < 1 ns      | —                     | Yes       |
| **L1 Cache**   | 32-64 KB      | ~1 ns       | —                     | Yes       |
| **L2 Cache**   | 256 KB - 1 MB | ~4 ns       | —                     | Yes       |
| **L3 Cache**   | 4-64 MB       | ~10 ns      | —                     | Yes       |
| **RAM (DRAM)** | 4-256 GB      | ~100 ns     | $3-5                  | Yes       |
| **SSD**        | 256 GB - 4 TB | ~50-100 μs  | $0.10-0.20            | No        |
| **HDD**        | 1-20 TB       | ~5-10 ms    | $0.02-0.03            | No        |

> **Key ratio**: RAM is about 100,000× faster than HDD. Managing what stays in RAM vs what goes to disk has an enormous impact on performance.

---

## Why Memory Management Matters

### The Multiprogramming Imperative

In a multiprogramming system, multiple processes share main memory simultaneously. Without management:

```text
  Unmanaged Memory:               Managed Memory:

  ┌────────────┐                   ┌────────────┐
  │ Process A  │ ← writes to      │ Process A  │ ← protected region
  │ data here  │   any address     ├────────────┤
  ├────────────┤                   │ Process B  │ ← protected region
  │ Process B  │ ← A could        ├────────────┤
  │ data here  │   overwrite B!   │ Process C  │ ← protected region
  ├────────────┤                   ├────────────┤
  │     OS     │ ← A could        │     OS     │ ← protected!
  └────────────┘   corrupt OS!     └────────────┘
```

### Memory Manager Responsibilities

| Responsibility   | Description                                                        |
| ---------------- | ------------------------------------------------------------------ |
| **Allocation**   | Assign memory regions to processes when they start or request more |
| **Tracking**     | Know which parts of memory are in use and which are free           |
| **Protection**   | Prevent processes from accessing each other's memory or the OS     |
| **Sharing**      | Allow controlled sharing when desired (shared libraries, IPC)      |
| **Relocation**   | Allow processes to be loaded at any address; move them if needed   |
| **Deallocation** | Reclaim memory when processes terminate                            |

---

## Address Binding

Programs refer to memory using addresses. But at what point are these addresses determined? This is **address binding** — the mapping from symbolic addresses (like variable names) to actual memory locations.

### Three Binding Times

```text
  Source Code         Object Code          Load Module          Memory
  ┌──────────┐       ┌───────────┐       ┌───────────┐       ┌──────────┐
  │ int x;   │ ──→   │ x at      │ ──→   │ x at      │ ──→   │ x at     │
  │ x = 42;  │ compile│ offset 100│ link  │ addr 1400 │ load  │ addr 1400│
  └──────────┘       └───────────┘       └───────────┘       └──────────┘
                      Compile-time         Load-time         Execution-time
```

| Binding Time       | When                               | Address Known   | Can Relocate?                            | Example                                 |
| ------------------ | ---------------------------------- | --------------- | ---------------------------------------- | --------------------------------------- |
| **Compile time**   | During compilation                 | At compile time | No — must recompile                      | MS-DOS `.COM` files; embedded systems   |
| **Load time**      | When program is loaded into memory | At load time    | Yes — by reloading                       | Relocatable code with relocation table  |
| **Execution time** | During runtime, each memory access | At runtime      | Yes — process can be moved while running | Modern OSes with hardware support (MMU) |

> [!IMPORTANT]
> **Execution-time binding** is used by all modern general-purpose operating systems. It requires **hardware support** (an MMU — Memory Management Unit) but enables virtual memory, dynamic relocation, and memory protection.

### Compile-Time Binding

If you know at compile time where the process will be loaded, the compiler generates **absolute addresses**:

```c
// Compile-time binding: addresses are fixed
// If loaded at address 0x1000:
int *x = (int *)0x1400;  // x is always at 0x1400
*x = 42;
```

### Load-Time Binding

The compiler generates **relocatable code** with relative addresses. The loader adjusts all addresses when loading:

```text
  Relocatable object:          After loading at base 0x5000:

  MOV R1, [offset 100]    →    MOV R1, [0x5100]
  JMP [offset 200]        →    JMP [0x5200]
```

### Execution-Time Binding

Addresses are translated **on every memory access** by hardware. The program uses **logical addresses** that the MMU translates to **physical addresses**:

$$\text{Physical Address} = \text{Base Register} + \text{Logical Address}$$

---

## Static vs Dynamic Loading

| Aspect           | Static Loading                                             | Dynamic Loading                                          |
| ---------------- | ---------------------------------------------------------- | -------------------------------------------------------- |
| **When**         | Entire program loaded before execution                     | Routines loaded only when called                         |
| **Memory usage** | Higher — entire program in memory even if parts are unused | Lower — only active parts in memory                      |
| **Performance**  | No loading overhead during execution                       | Small overhead when loading a routine for the first time |
| **Example**      | Simple embedded programs                                   | Large applications with seldom-used features             |

### Dynamic Loading

```c
// Dynamic loading in C (using dlopen on Linux/macOS)
#include <dlfcn.h>

void use_rarely_needed_feature() {
    void *handle = dlopen("libfeature.so", RTLD_LAZY);
    if (!handle) {
        fprintf(stderr, "Cannot load library: %s\n", dlerror());
        return;
    }

    // Get function pointer
    void (*feature_func)() = dlsym(handle, "do_feature");
    feature_func();   // Call the dynamically loaded function

    dlclose(handle);  // Unload when done
}
```

> [!NOTE]
> Dynamic loading does not require OS support — it can be implemented entirely by the application. However, OSes typically provide libraries (`dlopen`, `LoadLibrary`) to facilitate it.

---

## Static vs Dynamic Linking

| Aspect              | Static Linking                               | Dynamic Linking                                   |
| ------------------- | -------------------------------------------- | ------------------------------------------------- |
| **When**            | At compile/link time                         | At load time or runtime                           |
| **Binary size**     | Larger — library code embedded in executable | Smaller — executable references shared library    |
| **Memory sharing**  | Each process has its own copy                | Multiple processes share one copy in memory       |
| **Updates**         | Must recompile to update library             | Update library file, all programs use new version |
| **File extensions** | `.a` (Unix), `.lib` (Windows)                | `.so` (Unix), `.dll` (Windows), `.dylib` (macOS)  |

### Shared Libraries (Dynamic Linking)

```text
  Static Linking:                Dynamic Linking:

  ┌──────────────┐              ┌──────────────┐
  │ Program A    │              │ Program A    │───┐
  │ + libc code  │ (200 MB)    │ (small)      │   │
  └──────────────┘              └──────────────┘   │  ┌──────────┐
  ┌──────────────┐              ┌──────────────┐   ├──│ libc.so  │
  │ Program B    │              │ Program B    │───┘  │ (shared) │
  │ + libc code  │ (200 MB)    │ (small)      │      └──────────┘
  └──────────────┘              └──────────────┘

  Total: 400 MB                 Total: ~little + 1 copy of libc
```

> **Shared libraries** save enormous amounts of memory. The C standard library (`libc`) is used by virtually every process — sharing one copy saves gigabytes across a running system.

### Stub Mechanism

When a program calls a function from a shared library, the call initially goes through a **stub** — a small piece of code that:

1. Checks if the library is loaded in memory.
2. If not, loads it.
3. Replaces itself with the actual function address.
4. Jumps to the real function.

```text
  First call:                    Subsequent calls:

  call printf_stub               call printf (direct)
       │                              │
       ↓                              ↓
  ┌──────────────┐              ┌──────────────┐
  │ Is libc      │              │ printf()     │
  │ loaded?      │              │ (actual code)│
  │  NO → load   │              └──────────────┘
  │  Update addr │
  │  Jump to     │
  │  printf()    │
  └──────────────┘
```

---

## Memory Protection: Base and Limit Registers

The simplest hardware mechanism for memory protection uses two special CPU registers:

| Register           | Purpose                                                   |
| ------------------ | --------------------------------------------------------- |
| **Base register**  | Holds the smallest legal physical address for the process |
| **Limit register** | Specifies the size of the address range                   |

### Protection Mechanism

A legal address must satisfy:

$$\text{base} \leq \text{address} < \text{base} + \text{limit}$$

```text
  ┌──────────────────────────────────────┐
  │              CPU                      │
  │                                       │
  │   Logical    ┌───────────────┐       │
  │   Address ──→│   ≥ base?     │       │
  │              │   < base+limit?│       │
  │              └───────┬───────┘       │
  │                      │               │
  │              ┌───────┴───────┐       │
  │              │  YES        NO │       │
  │              ↓               ↓       │
  │           ACCESS          TRAP TO    │
  │           MEMORY          OS (seg    │
  │                           fault)     │
  └──────────────────────────────────────┘
```

### Example

```text
  Memory Layout:

  Address 0    ┌──────────────────┐
               │   Operating      │
               │   System         │
  Address 1000 ├──────────────────┤  ← Base = 1000
               │                  │
               │   Process A      │
               │                  │
  Address 4000 ├──────────────────┤  ← Base + Limit (1000 + 3000)
               │                  │
               │   Process B      │
               │                  │
  Address 7000 ├──────────────────┤
               │   Free Memory    │
               └──────────────────┘

  Process A: Base = 1000, Limit = 3000
  Address 2500 → Legal (1000 ≤ 2500 < 4000) ✓
  Address 500  → Illegal (500 < 1000) → TRAP ✗
  Address 4500 → Illegal (4500 ≥ 4000) → TRAP ✗
```

> [!WARNING]
> Only the **operating system** can modify the base and limit registers (they are privileged/protected registers). This prevents a user process from expanding its own address range to access another process's memory.

### Hardware Support Diagram

```text
  CPU generates        Base Register    Limit Register
  logical address      ┌────────┐       ┌────────┐
       │               │  1000  │       │  3000  │
       │               └───┬────┘       └───┬────┘
       ↓                   │                │
  ┌────────────────────────┴────────────────┴────────┐
  │                COMPARATOR                          │
  │  Is address ≥ base AND address < base + limit?     │
  │  ├── YES → Send address to memory bus              │
  │  └── NO  → Generate addressing exception (trap)    │
  └────────────────────────────────────────────────────┘
```

---

## Swapping

**Swapping** is the process of temporarily moving a process from main memory to disk (backing store) to free memory for other processes, and then bringing it back later.

```text
  ┌──────────┐     swap out      ┌──────────────┐
  │  Memory  │ ─────────────→    │  Disk         │
  │          │                   │  (Backing     │
  │ Process  │ ←─────────────    │   Store)      │
  │          │     swap in       │               │
  └──────────┘                   └──────────────┘
```

| Aspect                 | Description                                            |
| ---------------------- | ------------------------------------------------------ |
| **Swap out**           | Move a process from RAM to disk                        |
| **Swap in**            | Move a process from disk back to RAM                   |
| **Backing store**      | Disk area (swap partition/file) dedicated to swapping  |
| **When used**          | When total memory demand exceeds physical memory       |
| **Performance impact** | Significant — disk access is ~100,000× slower than RAM |

### Swap Time Calculation

The total swap time is dominated by disk transfer:

$$T_\text{swap} = 2 \times \frac{\text{process size}}{\text{transfer rate}}$$

(Factor of 2 for swap out + swap in)

**Example**: Process size = 100 MB, disk transfer rate = 50 MB/s:

$$T_\text{swap} = 2 \times \frac{100}{50} = 4 \text{ seconds}$$

> [!NOTE]
> Modern systems use **demand paging** (covered in a later lesson) rather than swapping entire processes. This is far more efficient because only the needed pages are transferred.

---

## Memory Allocation Approaches — Preview

We will study these in upcoming lessons:

| Approach                  | Key Idea                                       | Fragmentation                  |
| ------------------------- | ---------------------------------------------- | ------------------------------ |
| **Contiguous allocation** | Each process gets one contiguous block         | External fragmentation         |
| **Paging**                | Fixed-size pages mapped to frames              | Internal fragmentation (minor) |
| **Segmentation**          | Logical segments of varying size               | External fragmentation         |
| **Virtual memory**        | Illusion of unlimited memory via demand paging | Managed transparently          |

---

## Try It Yourself

**Exercise 1:** A system has 16 GB of RAM with a disk transfer rate of 200 MB/s. How long does it take to swap out and swap in a process that occupies 2 GB?

:::details Solution
$$T_\text{swap} = 2 \times \frac{2048 \text{ MB}}{200 \text{ MB/s}} = 2 \times 10.24 = 20.48 \text{ seconds}$$

This is over 20 seconds of unproductive time! This illustrates why swapping entire processes is impractical for large processes and why demand paging (loading only needed pages) is preferred.
:::

**Exercise 2:** A process has base register = 5000 and limit register = 8000. Which of these logical addresses are legal: 4000, 5000, 8000, 12000, 13000, 13001?

:::details Solution
Legal range: $5000 \leq \text{address} < 5000 + 8000 = 13000$

| Address | Legal? | Reason                             |
| ------- | ------ | ---------------------------------- |
| 4000    | No     | 4000 < 5000 (below base)           |
| 5000    | Yes    | 5000 ≥ 5000 and 5000 < 13000       |
| 8000    | Yes    | 8000 ≥ 5000 and 8000 < 13000       |
| 12000   | Yes    | 12000 ≥ 5000 and 12000 < 13000     |
| 13000   | No     | 13000 is NOT < 13000 (at boundary) |
| 13001   | No     | 13001 > 13000 (above limit)        |

:::

**Exercise 3:** Explain why dynamic linking saves memory in a system running 50 instances of a web server, all using the same SSL library (10 MB).

:::details Solution
With **static linking**: each of the 50 instances contains its own copy of the SSL library.

- Total memory for SSL: $50 \times 10 = 500$ MB

With **dynamic linking**: all 50 instances share a single copy of `libssl.so` in memory.

- Total memory for SSL: $10$ MB (one shared copy)

**Savings: 490 MB** — a 98% reduction. This is why shared libraries are essential for systems running many processes that use common libraries.
:::

---

## Key Takeaways

- The **memory hierarchy** trades speed for capacity: registers (fastest, smallest) → cache → RAM → SSD → HDD (slowest, largest).
- The **memory manager** handles allocation, tracking, protection, sharing, relocation, and deallocation of memory.
- **Address binding** can occur at compile time, load time, or execution time — modern systems use execution-time binding with hardware support.
- **Dynamic loading** loads routines only when called; **dynamic linking** shares library code across processes via shared libraries (`.so`, `.dll`).
- **Base and limit registers** provide simple hardware-based memory protection — only the OS can modify these registers.
- **Swapping** moves entire processes between RAM and disk — effective but slow; superseded by demand paging in modern systems.
- Memory management is foundational to process isolation, security, and efficient multiprogramming.
