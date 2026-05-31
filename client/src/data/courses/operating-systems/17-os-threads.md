---
title: Introduction to Threads
---

# Introduction to Threads

Every modern application you use — from web browsers to video games — relies on **threads** to deliver a responsive experience. A thread is the smallest unit of CPU utilization, and understanding threads is the first step toward mastering concurrent programming. In this lesson, we explore what threads are, how they differ from processes, and why multithreading has become the default paradigm in modern software.

---

## What Is a Thread?

> A **thread** (sometimes called a _lightweight process_) is a basic unit of CPU utilization. It comprises a thread ID, a program counter, a register set, and a stack.

Think of a process as an **office** — it has its own space, furniture, and filing cabinets. A thread is a **worker** inside that office. Multiple workers can share the same office space (memory), but each has their own notepad (registers) and task list (stack). They can collaborate quickly because they don't need to shout across buildings; they simply turn around and talk.

| Attribute       | Description                                              |
| --------------- | -------------------------------------------------------- |
| Thread ID       | Unique identifier for the thread within its process      |
| Program Counter | Tracks the next instruction to execute                   |
| Register Set    | Current values in CPU registers for this thread          |
| Stack           | Function call history, local variables, return addresses |

A single process can contain one or many threads. When a process has exactly one thread, it is called a **single-threaded process**. When it has more, it is a **multi-threaded process**.

> [!NOTE]
> The term "lightweight process" comes from the fact that creating a thread is far cheaper than creating a new process because threads share the parent process's address space.

---

## Thread vs Process

Understanding the distinction between threads and processes is fundamental. Here is a comprehensive comparison:

| Feature             | Process                                     | Thread                                          |
| ------------------- | ------------------------------------------- | ----------------------------------------------- |
| **Address Space**   | Each process has its own address space      | Threads share the process's address space       |
| **Creation Cost**   | High — requires duplicating memory mappings | Low — only needs new stack & register set       |
| **Context Switch**  | Expensive — TLB flush, page table swap      | Cheaper — shared address space, no TLB flush    |
| **Communication**   | IPC (pipes, sockets, shared memory setup)   | Direct shared memory access                     |
| **Isolation**       | Strong — crash in one doesn't affect others | Weak — one thread crash can kill entire process |
| **Memory Overhead** | High — separate code, data, heap, stack     | Low — only separate stack and registers         |
| **Security**        | Better isolation between processes          | No memory protection between threads            |
| **Scalability**     | Limited by IPC overhead                     | Better for shared-data workloads                |

> [!IMPORTANT]
> The shared address space of threads is both their greatest strength (fast communication) and greatest weakness (no memory protection — one thread can corrupt another thread's data).

---

## Single-Threaded vs Multi-Threaded Processes

### Single-Threaded Process

In a single-threaded process, there is exactly one flow of execution. The process has one program counter, one stack, and one set of registers.

```text
┌──────────────────────────────────┐
│           PROCESS                │
│                                  │
│  ┌──────────┐  ┌──────────────┐  │
│  │   Code   │  │    Data      │  │
│  │ (Text)   │  │ (Globals)    │  │
│  └──────────┘  └──────────────┘  │
│                                  │
│  ┌──────────┐  ┌──────────────┐  │
│  │  Files   │  │    Heap      │  │
│  │ (Open)   │  │              │  │
│  └──────────┘  └──────────────┘  │
│                                  │
│  ┌────────────────────────────┐  │
│  │  Registers │ Stack │ PC    │  │
│  │       (Single Thread)      │  │
│  └────────────────────────────┘  │
└──────────────────────────────────┘
```

### Multi-Threaded Process

In a multi-threaded process, multiple threads share the code, data, and files sections, but each thread has its **own** stack, registers, and program counter.

```text
┌───────────────────────────────────────────────┐
│                   PROCESS                     │
│                                               │
│  ┌──────────┐  ┌──────────┐  ┌────────────┐  │
│  │   Code   │  │   Data   │  │   Files    │  │
│  │ (Shared) │  │ (Shared) │  │  (Shared)  │  │
│  └──────────┘  └──────────┘  └────────────┘  │
│                                               │
│  ┌──────────┐  ┌──────────┐  ┌────────────┐  │
│  │ Thread 1 │  │ Thread 2 │  │  Thread 3  │  │
│  │ ──────── │  │ ──────── │  │ ────────── │  │
│  │ Regs     │  │ Regs     │  │ Regs       │  │
│  │ PC       │  │ PC       │  │ PC         │  │
│  │ Stack    │  │ Stack    │  │ Stack      │  │
│  └──────────┘  └──────────┘  └────────────┘  │
└───────────────────────────────────────────────┘
```

### Memory Layout in Detail

Below is a more detailed view of how memory is organized in a multi-threaded process:

```text
High Address
┌──────────────────────────┐
│    Thread 3 Stack        │  ← Each thread has
│    ↓ grows down          │    its own stack
├──────────────────────────┤
│    Guard Page            │  ← Prevents stack overflow
├──────────────────────────┤    into adjacent stack
│    Thread 2 Stack        │
│    ↓ grows down          │
├──────────────────────────┤
│    Guard Page            │
├──────────────────────────┤
│    Thread 1 Stack (Main) │
│    ↓ grows down          │
├──────────────────────────┤
│                          │
│    Heap (Shared)         │
│    ↑ grows up            │
├──────────────────────────┤
│    BSS  (Uninitialized   │
│          global data)    │  ← All threads share
├──────────────────────────┤    these regions
│    Data (Initialized     │
│          global data)    │
├──────────────────────────┤
│    Text (Code)           │
└──────────────────────────┘
Low Address
```

> [!TIP]
> Guard pages between thread stacks are small unmapped memory regions that trigger a segmentation fault if a thread's stack overflows, preventing silent corruption of another thread's stack.

---

## Benefits of Multithreading

There are four major categories of benefits that multithreading provides:

### 1. Responsiveness

Multithreading allows an application to remain interactive even when part of it is performing a lengthy operation. A user interface thread can continue processing user input while a background thread performs computation.

### 2. Resource Sharing

Threads within the same process share memory and resources by default. This eliminates the overhead of setting up shared memory or message passing required for inter-process communication.

### 3. Economy

Thread creation is significantly cheaper than process creation:

| Operation           | Process                             | Thread                 |
| ------------------- | ----------------------------------- | ---------------------- |
| **Creation time**   | ~10,000 μs (fork)                   | ~100 μs                |
| **Context switch**  | ~1,000–5,000 μs                     | ~100–500 μs            |
| **Memory overhead** | Megabytes (full address space copy) | Kilobytes (stack only) |
| **Termination**     | Expensive cleanup                   | Lightweight teardown   |

> On Solaris, creating a thread was approximately 30× faster than creating a process, and context switching was about 5× faster.

### 4. Scalability

Threads allow programs to take advantage of multiprocessor and multicore architectures. A single-threaded process can only run on one core, regardless of how many cores are available.

```text
Single-threaded on 4-core machine:

  Core 0:  [████████████████████]  ← Process runs here
  Core 1:  [                    ]  ← Idle
  Core 2:  [                    ]  ← Idle
  Core 3:  [                    ]  ← Idle

Multi-threaded (4 threads) on 4-core machine:

  Core 0:  [████████████████████]  ← Thread 1
  Core 1:  [████████████████████]  ← Thread 2
  Core 2:  [████████████████████]  ← Thread 3
  Core 3:  [████████████████████]  ← Thread 4
```

---

## Real-World Examples of Multithreading

### Web Browser

A modern web browser uses multiple threads for different responsibilities:

| Thread                | Responsibility                                        |
| --------------------- | ----------------------------------------------------- |
| **UI Thread**         | Handles user input — clicks, scrolls, keyboard events |
| **Rendering Thread**  | Paints pixels on screen, handles CSS layout           |
| **Network Thread**    | Fetches resources (HTML, CSS, images) from servers    |
| **JavaScript Thread** | Executes JavaScript code                              |
| **GPU Thread**        | Handles hardware-accelerated compositing              |

```text
┌─────────── Web Browser Process ────────────┐
│                                             │
│  UI Thread ──→ Rendering Thread             │
│      │              │                       │
│      │              ↓                       │
│      │         GPU Thread                   │
│      │                                      │
│      └──→ Network Thread ──→ Cache Thread   │
│                                             │
│           JavaScript Thread                 │
└─────────────────────────────────────────────┘
```

### Web Server

A multi-threaded web server handles each client request in a separate thread:

```text
                 ┌───────────────────┐
  Client A ────→ │  Worker Thread 1  │
                 ├───────────────────┤
  Client B ────→ │  Worker Thread 2  │──→ Shared
                 ├───────────────────┤    Resources
  Client C ────→ │  Worker Thread 3  │    (DB Pool,
                 ├───────────────────┤     Cache)
  Client D ────→ │  Worker Thread 4  │
                 └───────────────────┘
```

This is far more efficient than the older model of `fork()`-ing a new process per client request.

### Word Processor

A word processor like Microsoft Word uses threads for:

| Thread             | Task                                           |
| ------------------ | ---------------------------------------------- |
| Display thread     | Formats and renders the document on screen     |
| Spell-check thread | Continuously checks spelling in the background |
| Auto-save thread   | Periodically saves the document to disk        |
| Input thread       | Captures keyboard and mouse events             |

---

## Thread Types: User-Level vs Kernel-Level

Threads can be implemented in two fundamental places: entirely in user space, or with direct kernel support.

### User-Level Threads (ULTs)

User-level threads are managed entirely by a **user-space thread library** without kernel involvement. The kernel is unaware of their existence — it sees only a single-threaded process.

```text
┌─────────────────────────────────┐
│        User Space               │
│  ┌──────────────────────────┐   │
│  │    Thread Library         │   │
│  │  ┌─────┐ ┌─────┐ ┌─────┐│   │
│  │  │ T1  │ │ T2  │ │ T3  ││   │
│  │  └─────┘ └─────┘ └─────┘│   │
│  │    (scheduling, switch)  │   │
│  └──────────────────────────┘   │
├─────────────────────────────────┤
│        Kernel Space             │
│  ┌──────────────────────────┐   │
│  │   Sees 1 process only    │   │
│  │   (1 kernel thread)      │   │
│  └──────────────────────────┘   │
└─────────────────────────────────┘
```

### Kernel-Level Threads (KLTs)

Kernel-level threads are managed directly by the operating system kernel. The kernel maintains thread state and performs scheduling at the thread level.

```text
┌─────────────────────────────────┐
│        User Space               │
│  ┌─────┐  ┌─────┐  ┌─────┐     │
│  │ T1  │  │ T2  │  │ T3  │     │
│  └──┬──┘  └──┬──┘  └──┬──┘     │
├─────┼────────┼────────┼─────────┤
│     ↓        ↓        ↓        │
│  ┌─────┐  ┌─────┐  ┌─────┐    │
│  │ KT1 │  │ KT2 │  │ KT3 │    │
│  └─────┘  └─────┘  └─────┘    │
│        Kernel Space             │
└─────────────────────────────────┘
```

### Comparison Table

| Feature                | User-Level Threads                        | Kernel-Level Threads                    |
| ---------------------- | ----------------------------------------- | --------------------------------------- |
| **Management**         | Thread library in user space              | Operating system kernel                 |
| **Kernel awareness**   | Kernel does not know about threads        | Kernel manages each thread              |
| **Creation speed**     | Very fast (no system call)                | Slower (requires system call)           |
| **Context switch**     | Fast (no kernel mode switch)              | Slower (kernel mode switch needed)      |
| **Blocking behavior**  | One thread blocks → entire process blocks | Only the blocking thread is suspended   |
| **Multiprocessor use** | Cannot run threads on different cores     | Can schedule threads on different cores |
| **Portability**        | Highly portable (library-level)           | OS-dependent                            |
| **Examples**           | GNU Portable Threads, Green Threads       | Linux pthreads (NPTL), Windows threads  |

> [!WARNING]
> The main disadvantage of user-level threads is that a single blocking system call (e.g., `read()`) will block the **entire process**, because the kernel doesn't know about the other threads. This is why most modern systems use kernel-level threads.

### When to Use Each

| Scenario                                    | Best Choice              | Reason                                   |
| ------------------------------------------- | ------------------------ | ---------------------------------------- |
| I/O-bound application with blocking calls   | Kernel threads           | Blocking one thread doesn't block others |
| Compute-bound with fine-grained parallelism | User threads (or hybrid) | Low overhead for frequent switching      |
| Must utilize multiple CPU cores             | Kernel threads           | Kernel can schedule on different cores   |
| Embedded system with no thread-aware kernel | User threads             | Works without kernel support             |

---

## A Simple Multi-Threaded Program in C

Here is a basic example using POSIX threads (Pthreads) to illustrate how threads work in practice:

```c
#include <stdio.h>
#include <pthread.h>

void *print_hello(void *arg) {
    int id = *(int *)arg;
    printf("Hello from thread %d!\n", id);
    return NULL;
}

int main() {
    pthread_t threads[3];
    int ids[3] = {1, 2, 3};

    for (int i = 0; i < 3; i++) {
        pthread_create(&threads[i], NULL, print_hello, &ids[i]);
    }

    for (int i = 0; i < 3; i++) {
        pthread_join(threads[i], NULL);
    }

    printf("All threads completed.\n");
    return 0;
}
```

Compile and run:

```bash
gcc -pthread thread_demo.c -o thread_demo
./thread_demo
```

> [!NOTE]
> The order of output from threads is **non-deterministic** — you may see different orderings on each run because the OS scheduler decides which thread runs when.

---

## Historical Context

The concept of threads evolved gradually:

| Year          | Milestone                                                  |
| ------------- | ---------------------------------------------------------- |
| 1960s         | Multiprogramming introduced — multiple processes in memory |
| 1979          | First lightweight process concepts appeared in research    |
| 1993          | POSIX.1c standard defined Pthreads                         |
| 1996          | Java introduced built-in thread support                    |
| 2003          | Linux adopted NPTL (Native POSIX Thread Library)           |
| 2000s–present | Multicore revolution made multithreading essential         |

---

## Try It Yourself

**Exercise 1:** Consider a video streaming application. Identify at least four threads it might use and explain the role of each.

:::details Solution

1. **Network thread**: Downloads video data from the streaming server in chunks.
2. **Decoding thread**: Decodes compressed video frames (H.264/H.265) into raw frames.
3. **Audio thread**: Decodes and plays audio in sync with video.
4. **UI thread**: Handles user controls (play, pause, volume, seek bar).
5. **Buffering thread**: Manages a buffer of pre-decoded frames to prevent stuttering.
   :::

**Exercise 2:** A process has 4 user-level threads on a machine with 4 CPU cores. Can all 4 threads run simultaneously? What if they were kernel-level threads?

:::details Solution

- **User-level threads**: No. The kernel sees only one process (one kernel thread). It can schedule this process on only one core at a time, so at most one user-level thread runs at any moment.
- **Kernel-level threads**: Yes. The kernel is aware of all 4 threads and can schedule each on a separate core, allowing true parallel execution.
  :::

**Exercise 3:** Explain why creating a thread is cheaper than creating a process. What resources are shared vs. duplicated?

:::details Solution
When a new **process** is created (via `fork()`), the OS must duplicate the entire address space — page tables, file descriptors, signal handlers, memory mappings, etc. Even with copy-on-write, the metadata setup is expensive.

When a new **thread** is created, it shares the existing address space, code, data, heap, and open files. The OS only needs to allocate:

- A new **stack** (typically 1–8 MB)
- A new **thread control block** (registers, PC, thread ID)

This makes thread creation roughly 10–30× faster than process creation.
:::

---

## Key Takeaways

- A **thread** is the smallest unit of CPU utilization — it has its own PC, registers, and stack but shares code, data, and files with other threads in the same process.
- Threads are sometimes called **lightweight processes** because they are far cheaper to create and switch between than full processes.
- Multithreading provides four key benefits: **responsiveness**, **resource sharing**, **economy**, and **scalability**.
- **User-level threads** are fast to create and switch but cannot exploit multiple cores and suffer from blocking problems.
- **Kernel-level threads** are managed by the OS, can run on multiple cores, but incur higher overhead for creation and switching.
- Modern operating systems (Linux, Windows, macOS) primarily use kernel-level threads for their scheduling advantages.
- The shared address space of threads makes communication easy but requires careful **synchronization** to avoid data corruption — a topic we'll explore in depth in upcoming lessons.
