---
title: Multithreading Models
section: "Threads & Concurrency"
---

# Multithreading Models

In the previous lesson, we introduced user-level threads and kernel-level threads. But how do these two levels relate to each other? The **multithreading model** defines the mapping between user threads (visible to the programmer) and kernel threads (managed by the OS). This mapping profoundly affects concurrency, performance, and system behavior. In this lesson, we examine the three classical models and the hybrid two-level approach.

---

## Why Models Matter

The relationship between user threads and kernel threads determines critical system behaviors:

| Concern               | How the Model Affects It                                                |
| --------------------- | ----------------------------------------------------------------------- |
| **True parallelism**  | Can threads actually run on separate cores simultaneously?              |
| **Blocking behavior** | If one thread makes a blocking system call, are other threads affected? |
| **Creation overhead** | How expensive is it to create a new thread?                             |
| **Scalability**       | How many threads can the system support?                                |
| **Flexibility**       | Can the application customize its own scheduling?                       |

Let's define some notation first:

- **User thread (UT)**: A thread created and managed by a user-level thread library.
- **Kernel thread (KT)**: A thread that the OS kernel knows about and can schedule.

---

## Many-to-One Model

In the **Many-to-One** model, many user-level threads are mapped to a **single** kernel thread. Thread management is done entirely in user space by the thread library.

```text
    User Space                Kernel Space
 ┌──────────────┐          ┌──────────────┐
 │  UT1  UT2    │          │              │
 │    \  |      │          │              │
 │     \ |      │          │              │
 │  UT3──┼──UT4 │ ───────→ │     KT1      │
 │     / |      │          │              │
 │    /  |      │          │              │
 │  UT5  UT6    │          │              │
 └──────────────┘          └──────────────┘
       Many                     One
```

### Characteristics

| Property            | Many-to-One                                              |
| ------------------- | -------------------------------------------------------- |
| **Concurrency**     | Concurrent but not parallel — only one UT runs at a time |
| **Blocking**        | If one UT blocks on a system call, ALL UTs block         |
| **Creation cost**   | Very low (no system call needed)                         |
| **Context switch**  | Very fast (user-space only)                              |
| **Multicore usage** | Cannot use multiple cores                                |

### How It Works

The thread library maintains its own scheduler in user space. When a thread yields or the library preempts it, the library saves the thread's state and loads another thread's state — all without entering the kernel.

```text
Time ──→

KT1:  [  UT1  |  UT3  |  UT2  |  UT4  |  UT1  ]
         ↑ Library switches between UTs on one KT
```

### Examples

- **Green Threads** (early Java implementations before JDK 1.2)
- **GNU Portable Threads** (`pth`)
- **Solaris Green Threads** (early Solaris)

### Limitations

> [!WARNING]
> The Many-to-One model has two critical limitations:
>
> 1. **No parallelism**: Even on a 64-core machine, all user threads run on a single core.
> 2. **Blocking problem**: A single blocking I/O call freezes the entire process because the one kernel thread is blocked.

These limitations made this model largely **obsolete** for general-purpose systems.

---

## One-to-One Model

In the **One-to-One** model, each user-level thread maps to exactly one kernel thread. This is the most common model in modern operating systems.

```text
    User Space                Kernel Space
 ┌──────────────┐          ┌──────────────┐
 │     UT1      │ ───────→ │     KT1      │
 │     UT2      │ ───────→ │     KT2      │
 │     UT3      │ ───────→ │     KT3      │
 │     UT4      │ ───────→ │     KT4      │
 └──────────────┘          └──────────────┘
    One-to-One mapping
```

### Characteristics

| Property            | One-to-One                                       |
| ------------------- | ------------------------------------------------ |
| **Concurrency**     | True parallelism — threads run on separate cores |
| **Blocking**        | One thread blocking does NOT affect others       |
| **Creation cost**   | Higher (each UT requires a kernel thread)        |
| **Context switch**  | Kernel-mode switch required                      |
| **Multicore usage** | Full multicore utilization                       |

### How It Works

When the application creates a user thread, the OS creates a corresponding kernel thread. The kernel scheduler manages all threads and can dispatch them to any available core.

```text
Time ──→

Core 0:  [  UT1  |  UT3  |  UT1  |  UT3  ]
Core 1:  [  UT2  |  UT4  |  UT2  |  UT4  ]
            ↑ True parallel execution
```

### Examples

| Operating System | Implementation                                      |
| ---------------- | --------------------------------------------------- |
| **Linux**        | NPTL (Native POSIX Thread Library) since kernel 2.6 |
| **Windows**      | Win32 threads (since Windows 95/NT)                 |
| **macOS**        | Mach threads / pthreads                             |
| **FreeBSD**      | 1:1 threading since FreeBSD 7                       |

### Tradeoffs

> [!NOTE]
> The One-to-One model's main concern is that each user thread requires kernel resources. Creating 100,000 threads means 100,000 kernel thread structures, which consumes significant memory. Some systems impose limits on the maximum number of threads (e.g., Linux's `/proc/sys/kernel/threads-max`).

Despite this overhead, the One-to-One model dominates because its benefits (parallelism, non-blocking) far outweigh the cost of kernel thread creation on modern hardware.

---

## Many-to-Many Model

The **Many-to-Many** model multiplexes many user-level threads onto a smaller or equal number of kernel threads. This provides the best of both worlds — at the cost of complexity.

```text
    User Space                Kernel Space
 ┌──────────────┐          ┌──────────────┐
 │     UT1 ─────┼─────┬──→│     KT1      │
 │     UT2 ─────┼──┐  │   │              │
 │     UT3 ─────┼──┼──┤   │     KT2      │
 │     UT4 ─────┼──┘  │   │              │
 │     UT5 ─────┼─────┘   │     KT3      │
 │     UT6 ─────┼─────────→│              │
 └──────────────┘          └──────────────┘
    6 user threads          3 kernel threads
```

### Characteristics

| Property            | Many-to-Many                                                                                |
| ------------------- | ------------------------------------------------------------------------------------------- |
| **Concurrency**     | Parallel up to the number of kernel threads                                                 |
| **Blocking**        | One thread blocking doesn't block all — library can schedule another UT on the available KT |
| **Creation cost**   | Low for user threads; kernel threads created as needed                                      |
| **Context switch**  | Mix of fast (user-level) and slower (kernel-level) switches                                 |
| **Multicore usage** | Can use multiple cores (bounded by KT count)                                                |
| **Flexibility**     | Application can create unlimited UTs; OS decides KT count                                   |

### How It Works

A user-level thread library manages a pool of user threads and multiplexes them onto a smaller set of kernel threads. When one UT blocks, the library maps another UT to the now-available KT.

```text
Time ──→

KT1:  [  UT1  |  UT3  |  UT5  |  UT1  ]
KT2:  [  UT2  |  UT4  |  UT6  |  UT2  ]
KT3:  [  UT5  |  UT6  |  UT3  |  UT4  ]
         ↑ UTs are dynamically scheduled onto KTs
```

### Examples

- **Solaris** (prior to Solaris 9) with its LWP (Lightweight Process) model
- **HP-UX** threading
- **IRIX** threading
- **Windows ThreadFiber** (fibers multiplexed on threads)

### Why It's Rare Today

Despite its theoretical elegance, the Many-to-Many model is complex to implement correctly. The user-level scheduler must coordinate with the kernel scheduler, which introduces subtle bugs. Modern kernels have become efficient enough at managing kernel threads that the simpler One-to-One model is preferred.

---

## Two-Level Model

The **Two-Level** model is a variation of the Many-to-Many model that also allows certain user threads to be **bound** directly to a specific kernel thread (One-to-One binding) when needed.

```text
    User Space                Kernel Space
 ┌──────────────┐          ┌──────────────┐
 │     UT1 ─────┼────┬───→│     KT1      │
 │     UT2 ─────┼──┐ │    │              │
 │     UT3 ─────┼──┼─┘    │     KT2      │
 │              │  │       │              │
 │     UT4 ═════┼══╪═════→│     KT3      │ ← Bound
 │              │  │       │              │   (1:1)
 │     UT5 ─────┼──┘      │              │
 └──────────────┘          └──────────────┘

  ═══ = Bound (One-to-One)
  ─── = Multiplexed (Many-to-Many)
```

### Why Bind a Thread?

Some threads have **real-time requirements** or perform **critical operations** that need guaranteed kernel scheduling. By binding such threads directly to a kernel thread, you ensure they are not at the mercy of user-level scheduling.

| Thread Type                | Model Used   | Reason                       |
| -------------------------- | ------------ | ---------------------------- |
| Regular computation        | Many-to-Many | Flexibility, low overhead    |
| Real-time audio processing | Bound (1:1)  | Guaranteed kernel scheduling |
| I/O-intensive task         | Bound (1:1)  | Avoid blocking other threads |

### Examples

- **Solaris 8** (supported both bound and unbound threads via `THR_BOUND`)
- **HP-UX** threading
- **IRIX** with sproc/pthreads hybrid

---

## Comprehensive Model Comparison

| Feature                   | Many-to-One       | One-to-One                  | Many-to-Many                 | Two-Level       |
| ------------------------- | ----------------- | --------------------------- | ---------------------------- | --------------- |
| **User:Kernel ratio**     | N:1               | 1:1                         | N:M (N ≥ M)                  | N:M + bound     |
| **True parallelism**      | ✗                 | ✓                           | ✓ (limited by M)             | ✓               |
| **Blocking behavior**     | All threads block | Only blocking thread        | Can reschedule               | Can reschedule  |
| **Thread creation cost**  | Very low          | Medium                      | Low (user) / Medium (kernel) | Mixed           |
| **Max threads**           | Unlimited (user)  | Limited by kernel resources | Flexible                     | Flexible        |
| **Implementation**        | Simple            | Simple                      | Complex                      | Very complex    |
| **Multicore utilization** | Single core only  | Full                        | Partial to full              | Full            |
| **Modern relevance**      | Obsolete          | **Dominant**                | Declining                    | Rare            |
| **OS examples**           | GNU Pth           | Linux NPTL, Windows         | Solaris ≤ 8, HP-UX           | Solaris 8, IRIX |

> [!IMPORTANT]
> Almost all modern general-purpose operating systems have converged on the **One-to-One** model. The simplicity of the 1:1 mapping, combined with increasingly efficient kernel thread implementations, has made the more complex models unnecessary for most workloads.

---

## Evolution of Threading in Linux

Linux's threading history illustrates the industry's evolution toward the One-to-One model.

### LinuxThreads (1996–2003)

The original Linux threading implementation was called **LinuxThreads**, created by Xavier Leroy.

| Aspect              | LinuxThreads                                              |
| ------------------- | --------------------------------------------------------- |
| **Model**           | One-to-One (each pthread = one kernel `clone()` process)  |
| **Process ID**      | Each thread had a **different PID** (confusing!)          |
| **Signal handling** | Signals were per-thread, not per-process — violated POSIX |
| **Manager thread**  | Required a hidden manager thread for housekeeping         |
| **Max threads**     | Limited by PID space (typically 32,768)                   |

### NPTL — Native POSIX Thread Library (2003–present)

**NPTL** was developed by Ulrich Drepper and Ingo Molnár at Red Hat to fix LinuxThreads' problems.

| Aspect              | NPTL                                                    |
| ------------------- | ------------------------------------------------------- |
| **Model**           | One-to-One                                              |
| **Process ID**      | All threads share the **same PID** (POSIX compliant)    |
| **Thread ID**       | Unique TID per thread, but same TGID (thread group ID)  |
| **Signal handling** | Proper process-directed and thread-directed signals     |
| **Futex**           | Uses fast userspace mutexes (futex) for synchronization |
| **Performance**     | Thread creation ~4× faster than LinuxThreads            |
| **Scalability**     | Supports millions of threads                            |

```text
LinuxThreads (old):          NPTL (modern):
┌──────┐ ┌──────┐           ┌──────────────────┐
│PID=10│ │PID=11│           │ PID=10 (TGID=10) │
│ T1   │ │ T2   │           │ ┌────┐  ┌────┐   │
└──────┘ └──────┘           │ │TID │  │TID │   │
┌──────┐                    │ │ 10 │  │ 11 │   │
│PID=12│                    │ └────┘  └────┘   │
│ Mgr  │ ← hidden          │  T1       T2     │
└──────┘   manager          └──────────────────┘
```

### Checking Your System

You can check which threading library your Linux system uses:

```bash
getconf GNU_LIBPTHREAD_VERSION
# Output: NPTL 2.35
```

> [!TIP]
> On modern Linux, the `clone()` system call with the `CLONE_THREAD` flag is used to create threads. This flag tells the kernel that the new task should share the same thread group (process) as the caller.

---

## Lightweight Processes (LWPs)

In the Many-to-Many and Two-Level models, an intermediate abstraction called a **Lightweight Process (LWP)** sits between user threads and kernel threads.

```text
    User Space        LWP Layer         Kernel Space
 ┌────────────┐   ┌──────────────┐   ┌──────────────┐
 │  UT1  UT2  │   │  LWP1  LWP2 │   │  KT1    KT2  │
 │    ↓    ↓  │   │   ↓     ↓   │   │   ↓      ↓   │
 │  UT3  UT4  │──→│  LWP3       │──→│  KT3         │
 │    ↓       │   │   ↓         │   │   ↓           │
 │  UT5       │   │             │   │               │
 └────────────┘   └──────────────┘   └──────────────┘
```

Each LWP appears to the user-level thread library as a **virtual processor** on which the library can schedule user threads. The key benefit is that the application (or thread library) can request more or fewer LWPs from the kernel based on its needs.

| Concept                  | Definition                                                                                           |
| ------------------------ | ---------------------------------------------------------------------------------------------------- |
| **LWP**                  | Kernel-supported execution context; virtual processor for user threads                               |
| **Scheduler Activation** | Mechanism by which the kernel notifies the thread library (upcall) about events like thread blocking |

---

## Choosing a Model: Decision Framework

```text
                    ┌─────────────────────┐
                    │  Need true parallel  │
                    │    execution?        │
                    └──────────┬──────────┘
                      Yes      │       No
                    ┌──────────┴──────────┐
            ┌───────┴─────┐        ┌──────┴──────┐
            │ Need many   │        │ Many-to-One │
            │ lightweight │        │  (if low    │
            │ threads?    │        │   overhead  │
            └──────┬──────┘        │   is key)   │
             Yes   │    No         └─────────────┘
         ┌─────────┴───────┐
    ┌────┴────┐     ┌──────┴──────┐
    │Many-to- │     │ One-to-One  │
    │ Many    │     │ (default    │
    │         │     │  choice)    │
    └─────────┘     └─────────────┘
```

In practice, the **One-to-One** model is the right choice for the vast majority of applications today.

---

## Try It Yourself

**Exercise 1:** You're designing a chat server that handles 50,000 concurrent connections. Discuss which threading model would be appropriate and why. What alternative approach might be even better?

:::details Solution
With 50,000 connections, creating 50,000 kernel threads (One-to-One) would consume enormous resources (at 8 MB stack each, that's 400 GB just for stacks!). A Many-to-Many model could help by multiplexing many user threads onto fewer kernel threads.

However, the **best modern approach** is event-driven I/O (using `epoll` on Linux, `kqueue` on macOS) combined with a **thread pool**. A small number of worker threads handle I/O events for all connections. This is the model used by nginx, Node.js, and Go's goroutine scheduler (which is essentially a modern Many-to-Many model with an M:N scheduler).
:::

**Exercise 2:** In the Many-to-One model, Thread A calls `read()` to read from a slow network socket. What happens to Threads B, C, and D? How does the One-to-One model handle the same situation differently?

:::details Solution
**Many-to-One:** When Thread A calls `read()`, the **only** kernel thread enters a blocking state waiting for data. Since all user threads are multiplexed onto this single kernel thread, Threads B, C, and D **cannot run** until the `read()` completes. The entire process is effectively blocked.

**One-to-One:** Thread A's kernel thread blocks on `read()`, but Threads B, C, and D each have their own kernel threads. The kernel continues to schedule those threads on available cores, so they run normally while Thread A waits for data.
:::

**Exercise 3:** Explain why Solaris transitioned from the Many-to-Many model to the One-to-One model in Solaris 9.

:::details Solution
Solaris initially used the Many-to-Many model with LWPs because kernel threads were expensive in early Unix systems. As hardware improved and kernel implementations became more efficient (especially with optimizations like lazy TLB flushing and cheaper `clone()` calls), the overhead of kernel threads dropped significantly.

The Many-to-Many model's complexity — managing two levels of scheduling, handling scheduler activations, dealing with priority inversions between user and kernel schedulers — became more costly than the overhead it was designed to avoid. The simpler One-to-One model provided equivalent or better performance with far less code complexity.

Solaris 9 (2002) adopted a 1:1 model, joining Linux (NPTL) and Windows in the industry consensus.
:::

---

## Key Takeaways

- The **multithreading model** defines how user-level threads map to kernel-level threads, directly affecting parallelism, blocking behavior, and overhead.
- **Many-to-One**: Many user threads → one kernel thread. Fast but no parallelism and vulnerable to blocking. Largely obsolete.
- **One-to-One**: Each user thread → one kernel thread. True parallelism, no blocking issues, but higher resource cost. **The dominant model today**.
- **Many-to-Many**: Many user threads → fewer kernel threads. Flexible but complex to implement correctly.
- **Two-Level**: Extends Many-to-Many by allowing some threads to be bound directly to kernel threads for guaranteed scheduling.
- **Linux evolved** from LinuxThreads (broken POSIX semantics) to **NPTL** (fully POSIX-compliant, fast, 1:1 model).
- Modern systems overwhelmingly use One-to-One because kernel thread overhead has become negligible on contemporary hardware.
- Lightweight Processes (LWPs) act as an intermediary in Many-to-Many models, serving as virtual processors for user threads.
