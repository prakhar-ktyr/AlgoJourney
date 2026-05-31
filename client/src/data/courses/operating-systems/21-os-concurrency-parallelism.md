---
title: Concurrency vs Parallelism
---

# Concurrency vs Parallelism

These two terms are often used interchangeably, but they represent fundamentally different concepts. **Concurrency** is about _structure_ — managing multiple tasks that can make progress. **Parallelism** is about _execution_ — running multiple tasks simultaneously. Understanding this distinction is crucial for writing efficient multicore software. In this lesson, we formalize both concepts, explore the mathematics of speedup, and tackle the real challenges of multicore programming.

---

## Concurrency: Dealing With Many Things at Once

> **Concurrency** is the ability of a system to handle multiple tasks by interleaving their execution. The tasks may not actually run at the same instant — they simply make progress over overlapping time periods.

Think of a single chef in a kitchen preparing three dishes. The chef chops vegetables, puts a pot on the stove, starts the oven, comes back to stir the pot, then checks the oven. Only one action happens at a time, but all three dishes are "in progress."

### Concurrent Execution on a Single Core

```text
Time ──────────────────────────────────────────→

Core 0:  [  T1  |  T2  |  T1  |  T3  |  T2  |  T1  |  T3  ]

         T1, T2, T3 are interleaved on ONE core.
         At any instant, only ONE task runs.
         But all three make progress over time.
```

| Property               | Value                                |
| ---------------------- | ------------------------------------ |
| Number of cores        | 1                                    |
| Tasks in progress      | Multiple (3 in example)              |
| Simultaneous execution | No                                   |
| Mechanism              | Time-slicing / context switching     |
| Purpose                | Responsiveness, resource utilization |

---

## Parallelism: Doing Many Things at Once

> **Parallelism** is the simultaneous execution of multiple tasks on multiple processing units (cores, processors, machines).

Now imagine three chefs, each working on one dish at the same time. All three dishes are being prepared _simultaneously_.

### Parallel Execution on Multiple Cores

```text
Time ──────────────────────────────────────────→

Core 0:  [  T1  |  T1  |  T1  |  T1  |  T1  ]
Core 1:  [  T2  |  T2  |  T2  |  T2  |  T2  ]
Core 2:  [  T3  |  T3  |  T3  |  T3  |  T3  ]

         T1, T2, T3 each run on a SEPARATE core.
         All three execute at the SAME instant.
```

| Property               | Value                        |
| ---------------------- | ---------------------------- |
| Number of cores        | Multiple (3 in example)      |
| Tasks in progress      | Multiple                     |
| Simultaneous execution | Yes                          |
| Mechanism              | Multiple processing units    |
| Purpose                | Speed — complete work faster |

### The Crucial Distinction

| Aspect                       | Concurrency                   | Parallelism                           |
| ---------------------------- | ----------------------------- | ------------------------------------- |
| **Definition**               | Multiple tasks make progress  | Multiple tasks execute simultaneously |
| **Requires multicore?**      | No (works on single core)     | Yes (requires multiple cores)         |
| **Analogy**                  | One person juggling           | Multiple people working               |
| **About**                    | Structure / design            | Execution / performance               |
| **Goal**                     | Responsiveness, modularity    | Raw throughput / speedup              |
| **Can exist without other?** | Concurrent without parallel ✓ | Parallel implies concurrent ✓         |

> [!IMPORTANT]
> Parallelism is a subset of concurrency. All parallel programs are concurrent, but not all concurrent programs are parallel. You can have concurrency on a single-core machine through time-slicing, but you cannot have parallelism without multiple cores.

```text
┌──────────────────────────────────────────┐
│            Concurrency                   │
│  ┌───────────────────────────────────┐   │
│  │                                   │   │
│  │         Parallelism               │   │
│  │    (concurrent AND simultaneous)  │   │
│  │                                   │   │
│  └───────────────────────────────────┘   │
│                                          │
│  Concurrent but not parallel:            │
│  (interleaved on single core)            │
└──────────────────────────────────────────┘
```

---

## Data Parallelism vs Task Parallelism

There are two fundamental types of parallelism:

### Data Parallelism

In **data parallelism**, the same operation is applied to different portions of a data set simultaneously.

```text
  Array: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]

  Thread 0:  Square [1, 2, 3]     → [1, 4, 9]
  Thread 1:  Square [4, 5, 6]     → [16, 25, 36]
  Thread 2:  Square [7, 8, 9]     → [49, 64, 81]
  Thread 3:  Square [10, 11, 12]  → [100, 121, 144]

  Same operation (square) on different data partitions.
```

**Example in C with OpenMP:**

```c
#pragma omp parallel for
for (int i = 0; i < N; i++) {
    result[i] = array[i] * array[i];
}
```

### Task Parallelism

In **task parallelism**, different operations are performed simultaneously, potentially on the same or different data.

```text
  Input Image:
  ┌─────────────────┐
  │                 │
  │    Photo.jpg    │
  │                 │
  └────────┬────────┘
           │
     ┌─────┼─────┐
     ↓     ↓     ↓
  Thread0  Thread1  Thread2
  Resize   Apply    Extract
  image    filter   metadata
     │     │     │
     ↓     ↓     ↓
  Output   Output  Output

  Different operations on the same (or related) data.
```

### Comparison

| Feature               | Data Parallelism                       | Task Parallelism                            |
| --------------------- | -------------------------------------- | ------------------------------------------- |
| **Work distribution** | Data is divided among threads          | Tasks (functions) are divided among threads |
| **Operation**         | Same operation on each chunk           | Different operations per thread             |
| **Scalability**       | Scales with data size                  | Scales with number of independent tasks     |
| **Load balance**      | Easy if data partitions are equal      | Hard — tasks may have different durations   |
| **Example**           | Matrix multiplication, image filtering | Pipeline: fetch → decode → render           |
| **OpenMP**            | `#pragma omp parallel for`             | `#pragma omp sections`                      |

---

## Amdahl's Law

**Amdahl's Law** quantifies the theoretical maximum speedup of a program when only a portion of it can be parallelized.

> "The overall performance improvement gained by optimizing a single part of a system is limited by the fraction of time that the improved part is actually used."
> — _Gene Amdahl, 1967_

### The Formula

$$S = \frac{1}{(1 - P) + \frac{P}{N}}$$

Where:

- $S$ = theoretical speedup of the whole program
- $P$ = fraction of the program that can be parallelized ($0 \leq P \leq 1$)
- $N$ = number of processors/cores

### Derivation

Consider a program with total execution time $T$:

- Serial portion: $(1 - P) \times T$
- Parallel portion: $P \times T$

With $N$ cores, the parallel portion takes $\frac{P \times T}{N}$, but the serial portion remains unchanged:

$$T_{parallel} = (1 - P) \times T + \frac{P \times T}{N}$$

$$S = \frac{T}{T_{parallel}} = \frac{T}{(1 - P) \times T + \frac{P \times T}{N}} = \frac{1}{(1 - P) + \frac{P}{N}}$$

### Example Calculations

**Example 1:** A program is 75% parallelizable ($P = 0.75$). What is the speedup with 4 cores?

$$S = \frac{1}{(1 - 0.75) + \frac{0.75}{4}} = \frac{1}{0.25 + 0.1875} = \frac{1}{0.4375} = 2.29\times$$

**Example 2:** Same program with 16 cores:

$$S = \frac{1}{0.25 + \frac{0.75}{16}} = \frac{1}{0.25 + 0.047} = \frac{1}{0.297} = 3.37\times$$

**Example 3:** Same program with $\infty$ cores:

$$S = \frac{1}{0.25 + 0} = \frac{1}{0.25} = 4.0\times$$

### Speedup Table for Various P and N

| P (Parallel %) |  N=2  |  N=4  |  N=8  |  N=16  |  N=64  |    N=∞     |
| :------------: | :---: | :---: | :---: | :----: | :----: | :--------: |
|      50%       | 1.33× | 1.60× | 1.78× | 1.88×  | 1.97×  |  **2.0×**  |
|      75%       | 1.60× | 2.29× | 2.91× | 3.37×  | 3.76×  |  **4.0×**  |
|      90%       | 1.82× | 3.08× | 4.71× | 5.93×  | 7.80×  | **10.0×**  |
|      95%       | 1.90× | 3.48× | 5.93× | 8.42×  | 13.91× | **20.0×**  |
|      99%       | 1.98× | 3.88× | 7.48× | 13.91× | 39.26× | **100.0×** |

### Visual Speedup Chart

```text
Speedup
  20× ┤                                           ● P=95%
      │                                      ●
  16× ┤                                 ●
      │                            ●
  12× ┤                       ●
      │                  ●                    ▲ P=90%
   8× ┤             ▲─────────────────▲──▲
      │        ▲
   4× ┤   ▲──────────■─────────■──■──■ P=75%
      │ ■
   2× ┤ ▲─●──────────────────────────── P=50%
      │ ■
   1× ┼───┬───┬───┬───┬───┬───┬───┬───
      1   2   4   8  16  32  64  128
                 Number of Cores (N)
```

> [!WARNING]
> Amdahl's Law delivers a sobering message: **the serial portion of your program sets an absolute limit on speedup**, no matter how many cores you add. A program that is only 50% parallelizable can never achieve more than 2× speedup, even with a million cores.

---

## Gustafson's Law

**Gustafson's Law** (1988) offers a more optimistic perspective by considering **scaled speedup** — the idea that as we add more processors, we also increase the problem size.

### The Formula

$$S = N - \alpha(N - 1)$$

Where:

- $S$ = scaled speedup
- $N$ = number of processors
- $\alpha$ = serial fraction of the _parallel_ execution (not the original sequential execution)

### Key Insight

Amdahl's Law assumes a **fixed problem size** — the same work divided among more cores. Gustafson's Law assumes we **scale the problem**: given more cores, we do a proportionally larger computation in the same time.

| Perspective     | Amdahl's Law                       | Gustafson's Law                              |
| --------------- | ---------------------------------- | -------------------------------------------- |
| Problem size    | Fixed                              | Scales with N                                |
| Serial fraction | Of total sequential time           | Of parallel execution time                   |
| Viewpoint       | How fast can I solve THIS problem? | How big a problem can I solve in fixed time? |
| Outlook         | Pessimistic (diminishing returns)  | Optimistic (scaled problems benefit)         |

### Example

With $N = 64$ processors and $\alpha = 0.05$ (5% serial):

$$S = 64 - 0.05 \times (64 - 1) = 64 - 3.15 = 60.85\times$$

Compare with Amdahl's Law ($P = 0.95$, $N = 64$):

$$S = \frac{1}{0.05 + \frac{0.95}{64}} = \frac{1}{0.05 + 0.0148} = \frac{1}{0.0648} = 15.42\times$$

The difference is dramatic because Gustafson assumes we're solving a bigger problem with the extra processors.

---

## Multicore Programming Challenges

Moving from theory to practice, multicore programming introduces several significant challenges:

### The Five Challenge Areas

| Challenge                 | Description                                                      | Example                                             |
| ------------------------- | ---------------------------------------------------------------- | --------------------------------------------------- |
| **Dividing activities**   | Identifying independent tasks that can run in parallel           | Which parts of a web server can be parallelized?    |
| **Balance**               | Ensuring all cores do roughly equal work                         | One core processing 90% of data defeats the purpose |
| **Data splitting**        | Partitioning data so threads can work independently              | Splitting a matrix for parallel multiplication      |
| **Data dependency**       | Managing cases where one computation depends on another's result | Computing B requires result of A                    |
| **Testing and debugging** | Reproducing and diagnosing timing-dependent bugs                 | Race condition appears once every 10,000 runs       |

### Data Dependency Example

```text
  Statement 1:  A = B + C
  Statement 2:  D = A * E     ← Depends on Statement 1!
  Statement 3:  F = G - H     ← Independent

  Can parallelize: {S1, S3} then S2
  Cannot parallelize: {S1, S2} simultaneously
```

### Dependency Graph

```text
  ┌─────┐     ┌─────┐
  │ S1  │     │ S3  │   ← S1 and S3 can run in parallel
  │A=B+C│     │F=G-H│
  └──┬──┘     └─────┘
     │
     ↓ (data dependency: A)
  ┌─────┐
  │ S2  │               ← S2 must wait for S1
  │D=A*E│
  └─────┘
```

### The Testing Problem

Concurrent bugs are notoriously hard to reproduce:

| Bug Type           | Why It's Hard                                                                        |
| ------------------ | ------------------------------------------------------------------------------------ |
| **Race condition** | Depends on exact timing of thread interleaving — may appear only under specific load |
| **Deadlock**       | Requires specific ordering of lock acquisitions — may not occur in testing           |
| **Livelock**       | Threads keep running but make no progress — hard to detect                           |
| **Starvation**     | One thread never gets resources — may only appear under high contention              |

> [!TIP]
> Tools like **ThreadSanitizer** (TSan), **Helgrind** (Valgrind), and **Intel Inspector** can detect race conditions and deadlocks by instrumenting memory accesses at runtime.

---

## Practical Speedup Calculations

### Problem: Matrix-Vector Multiplication

Multiply a $1000 \times 1000$ matrix by a $1000 \times 1$ vector. Each row-vector dot product is independent.

**Sequential time:** $T_1 = 1000 \times 1000 = 10^6$ multiply-add operations

**With 4 cores:** Each core handles 250 rows.
$T_4 = 250 \times 1000 = 250{,}000$ operations (plus small overhead for thread management)

**Speedup:** $S = \frac{10^6}{250{,}000} \approx 4.0\times$ (nearly linear — this is _embarrassingly parallel_)

### Problem: Parallel Search with Serial Merge

Search an array of $N = 10^8$ elements. The search is 95% of the time; the merge/result-combining step is 5%.

With $N = 8$ cores:

$$S = \frac{1}{(1 - 0.95) + \frac{0.95}{8}} = \frac{1}{0.05 + 0.119} = \frac{1}{0.169} = 5.93\times$$

Efficiency: $E = \frac{S}{N} = \frac{5.93}{8} = 74.1\%$

| Metric                         | Value |
| ------------------------------ | ----- |
| Serial fraction                | 5%    |
| Cores                          | 8     |
| Speedup                        | 5.93× |
| Efficiency                     | 74.1% |
| Ideal speedup                  | 8×    |
| Speedup lost to serial portion | 2.07× |

### Efficiency Formula

$$E = \frac{S}{N} = \frac{1}{N \times (1 - P) + P}$$

Where $E = 1.0$ (100%) means perfect linear speedup, and $E < 1.0$ indicates overhead from serialization.

---

## Real-World Concurrency and Parallelism

| Application                  | Concurrency Type                         | Parallelism Type                                      |
| ---------------------------- | ---------------------------------------- | ----------------------------------------------------- |
| Web server handling requests | Concurrent (many clients)                | Data parallel (same handler, different requests)      |
| Video encoding               | Task parallel (encode + audio + mux)     | Data parallel (frames divided across cores)           |
| Database query execution     | Concurrent (multiple queries)            | Data parallel (table scan across partitions)          |
| Game engine                  | Task parallel (physics + AI + rendering) | Data parallel (particles, NPCs across cores)          |
| MapReduce                    | Both                                     | Map phase: data parallel; Reduce phase: task parallel |

### MapReduce as Parallelism

```text
    Input Data
    ┌──────────────────────────────────┐
    │ chunk1 │ chunk2 │ chunk3 │chunk4 │
    └───┬────┴───┬────┴───┬────┴──┬───┘
        ↓        ↓        ↓       ↓
    ┌───────┐┌───────┐┌───────┐┌───────┐
    │ Map 1 ││ Map 2 ││ Map 3 ││ Map 4 │  DATA PARALLEL
    └───┬───┘└───┬───┘└───┬───┘└───┬───┘
        │        │        │        │
        └────────┴───┬────┴────────┘
                     ↓
              ┌──────────────┐
              │   Shuffle    │               SYNCHRONIZATION
              └──────┬───────┘
          ┌──────────┼──────────┐
          ↓          ↓          ↓
    ┌──────────┐┌──────────┐┌──────────┐
    │ Reduce 1 ││ Reduce 2 ││ Reduce 3 │   TASK PARALLEL
    └──────────┘└──────────┘└──────────┘
```

---

## Try It Yourself

**Exercise 1:** A program takes 100 seconds to run sequentially. Profiling shows that 20 seconds are inherently serial. What is the maximum speedup with (a) 4 cores, (b) 16 cores, (c) unlimited cores?

:::details Solution
Serial fraction: $1 - P = \frac{20}{100} = 0.2$, so $P = 0.8$.

(a) $S_4 = \frac{1}{0.2 + \frac{0.8}{4}} = \frac{1}{0.2 + 0.2} = \frac{1}{0.4} = 2.5\times$

(b) $S_{16} = \frac{1}{0.2 + \frac{0.8}{16}} = \frac{1}{0.2 + 0.05} = \frac{1}{0.25} = 4.0\times$

(c) $S_{\infty} = \frac{1}{0.2 + 0} = \frac{1}{0.2} = 5.0\times$

Even with infinite cores, the program can never run faster than 20 seconds (the serial portion).
:::

**Exercise 2:** Using Gustafson's Law, compute the scaled speedup for a program with serial fraction $\alpha = 0.02$ running on 128 processors.

:::details Solution
$$S = N - \alpha(N - 1) = 128 - 0.02 \times (128 - 1) = 128 - 0.02 \times 127 = 128 - 2.54 = 125.46\times$$

Compare with Amdahl's ($P = 0.98$, $N = 128$):
$$S = \frac{1}{0.02 + \frac{0.98}{128}} = \frac{1}{0.02 + 0.00766} = \frac{1}{0.02766} = 36.2\times$$

Gustafson's Law predicts much higher speedup because it assumes the problem size grows with the number of processors.
:::

**Exercise 3:** Classify each of the following as data parallelism, task parallelism, or both:
(a) Applying a blur filter to every pixel of a 4K image
(b) A pipeline: download → decompress → decrypt → display
(c) Training a neural network with mini-batch gradient descent

:::details Solution
(a) **Data parallelism** — the same operation (blur) is applied to different pixels/regions of the image simultaneously.

(b) **Task parallelism** — each stage (download, decompress, decrypt, display) is a different task that can run concurrently in a pipeline.

(c) **Both** — Data parallelism: each mini-batch's gradient computation is distributed across GPUs/cores. Task parallelism: forward pass, backward pass, and weight update can be pipelined across different mini-batches.
:::

---

## Key Takeaways

- **Concurrency** is about structure — managing multiple tasks that can make progress through interleaving. It works on a single core.
- **Parallelism** is about execution — running multiple tasks simultaneously on multiple cores. It requires multiple processing units.
- **Data parallelism** applies the same operation to different data partitions; **task parallelism** runs different operations concurrently.
- **Amdahl's Law** ($S = \frac{1}{(1-P) + P/N}$) shows that the serial fraction sets an absolute ceiling on speedup — a sobering reminder for parallel programmers.
- **Gustafson's Law** ($S = N - \alpha(N-1)$) offers a more optimistic view by assuming problem size scales with core count.
- Multicore programming faces five key challenges: **dividing work**, **balancing load**, **splitting data**, **managing dependencies**, and **testing/debugging**.
- Always profile before parallelizing — identify the serial bottleneck (Amdahl's serial fraction) and target the parallelizable portion for maximum impact.
