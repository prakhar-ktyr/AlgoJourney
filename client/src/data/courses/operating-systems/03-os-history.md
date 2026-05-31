---
title: History of Operating Systems
section: "Introduction & Foundations"
---

# History of Operating Systems

Understanding how operating systems evolved helps you appreciate _why_ modern OSes work the way they do. Every major feature — multiprogramming, virtual memory, file systems, networking — was invented to solve a real problem that engineers faced at the time. This lesson walks through six generations of OS evolution, from the era of vacuum tubes to today's cloud and mobile platforms.

> "Those who cannot remember the past are condemned to repeat it."
> — George Santayana (and equally true in systems design)

---

## The Generations at a Glance

| Generation | Era         | Key Innovation                  | Example Systems                  |
| ---------- | ----------- | ------------------------------- | -------------------------------- |
| 0          | 1940s       | No OS — manual wiring           | ENIAC, Colossus                  |
| 1          | 1950s       | Batch processing                | GM-NAA I/O, FMS                  |
| 2          | 1960s       | Multiprogramming & time-sharing | MULTICS, CTSS, OS/360            |
| 3          | 1970s–80s   | Personal computers & UNIX       | UNIX, CP/M, MS-DOS, Macintosh    |
| 4          | 1990s–2000s | Networked & GUI OSes            | Linux, Windows NT/XP, macOS      |
| 5          | 2010s+      | Mobile, cloud, containers       | Android, iOS, Docker, Kubernetes |

```text
Timeline of Operating System Evolution
========================================

1940     1950     1960     1970     1980     1990     2000     2010     2020
  |--------|--------|--------|--------|--------|--------|--------|--------|
  | Gen 0  | Gen 1  |  Gen 2         | Gen 3          |  Gen 4         |Gen 5
  | No OS  | Batch  |  Multiprog     | PCs & UNIX     |  Networks/GUI  |Cloud
  |        |        |  Time-sharing  |                |  Linux/NT      |Mobile
  |        |        |                |                |                |
  ENIAC    FMS     CTSS  MULTICS  UNIX  CP/M  DOS  Mac  Linux  NT  Android
  1946     1956    1961  1964     1969  1974  1981 1984  1991  1993  2008
```

---

## Generation 0: No Operating System (1940s)

The earliest computers had **no operating system at all**. Programmers interacted with the machine directly.

### How It Worked

1. The programmer **physically wired** the computer using plug boards and patch cables.
2. Programs were entered in **machine code** — raw binary patterns.
3. Only **one program** ran at a time, and the programmer had to be present for the entire run.
4. If the program had a bug, the programmer debugged by examining vacuum tubes and rewiring.

| Characteristic           | Detail                                              |
| ------------------------ | --------------------------------------------------- |
| **Input method**         | Plug boards, toggle switches                        |
| **Programming language** | Raw machine code (binary)                           |
| **Scheduling**           | None — one user at a time, signed up for time slots |
| **Error handling**       | Manual — examine lights, rewire                     |
| **Typical computer**     | ENIAC (1946), Colossus (1943)                       |
| **Size**                 | Room-sized, 18,000 vacuum tubes (ENIAC)             |
| **Speed**                | ~5,000 additions per second                         |

```text
Generation 0 Workflow
======================

  Programmer          Computer Room
  +--------+          +-------------------+
  | Write  |  walk    | Plug board /      |
  | program| ------> | wire the program  |
  | on     |          |                   |
  | paper  |          | Run               |
  +--------+          | Wait...           |
                      | Read output lamps |
       <------------- | Collect results   |
       results        +-------------------+

  Total cycle time: hours to days for one program
```

> [!NOTE]
> There was zero software infrastructure. The programmer _was_ the operating system — manually managing every resource.

---

## Generation 1: Batch Systems (1950s)

The **enormous waste of expensive computer time** in Generation 0 led to the invention of batch processing. Instead of one programmer at a time, jobs were collected and processed in batches.

### The Resident Monitor

The first piece of systems software was the **resident monitor** — a small program permanently loaded in memory that automatically loaded and ran jobs one after another.

```text
Memory Layout — Batch System
==============================

  +---------------------------+  High Address
  |                           |
  |     User Program Area     |
  |     (current job)         |
  |                           |
  +---------------------------+
  |     Resident Monitor      |
  |  - Job sequencing         |
  |  - I/O device drivers     |
  |  - Interrupt handling     |
  +---------------------------+  Low Address (0x0000)
```

### How Batch Processing Worked

| Step | Action                                                             |
| ---- | ------------------------------------------------------------------ |
| 1    | Programmers submit jobs on **punched cards** to an operator        |
| 2    | Operator groups similar jobs into a **batch**                      |
| 3    | Batch is loaded into the computer via a **card reader**            |
| 4    | The resident monitor reads the first job's **control cards** (JCL) |
| 5    | Monitor loads the compiler, then the user program                  |
| 6    | Program runs to completion (or error)                              |
| 7    | Monitor automatically loads the **next job**                       |
| 8    | Output is printed and returned to programmers                      |

### Job Control Language (JCL) Example

```text
$JOB  SMITH, 1234
$FTN                    ← Load Fortran compiler
... Fortran source ...
$LOAD                   ← Load compiled program
$RUN                    ← Execute program
$END                    ← End of job
```

### Problems with Batch Systems

| Problem                  | Description                                                            |
| ------------------------ | ---------------------------------------------------------------------- |
| **CPU idle during I/O**  | While reading cards or printing, the CPU sat idle — a massive waste    |
| **No interaction**       | Programmer could not debug interactively; turnaround was hours or days |
| **No protection**        | A buggy job could overwrite the resident monitor                       |
| **Sequential execution** | Only one job at a time; no overlap of computation and I/O              |

> The CPU utilization problem was the primary motivation for the next generation.

---

## Generation 2: Multiprogramming & Time-Sharing (1960s)

### Multiprogramming

The key insight: while one job waits for I/O, **another job can use the CPU**. This requires keeping multiple jobs in memory simultaneously.

```text
Multiprogramming — Memory Layout
==================================

  +---------------------------+
  |       Job 3               |
  +---------------------------+
  |       Job 2               |
  +---------------------------+
  |       Job 1               |
  +---------------------------+
  |   Operating System        |
  +---------------------------+

  CPU switches between jobs when one blocks on I/O.
```

**CPU Utilization Formula:**

If a single job spends fraction $p$ of its time waiting for I/O, then with $n$ jobs in memory:

$$CPU\ Utilization = 1 - p^n$$

| Jobs in Memory ($n$) | I/O Wait ($p = 0.8$) | CPU Utilization |
| -------------------- | -------------------- | --------------- |
| 1                    | 80%                  | 20%             |
| 2                    | 80%                  | 36%             |
| 3                    | 80%                  | 49%             |
| 4                    | 80%                  | 59%             |
| 5                    | 80%                  | 67%             |
| 10                   | 80%                  | 89%             |

> [!TIP]
> This formula shows the dramatic improvement from multiprogramming. Going from 1 to 5 jobs more than triples CPU utilization!

### Time-Sharing (Multitasking)

**Time-sharing** extended multiprogramming to interactive users. Each user gets a small **time slice** (quantum) of CPU time, creating the illusion that each has their own computer.

| Feature           | Batch Multiprogramming   | Time-Sharing                  |
| ----------------- | ------------------------ | ----------------------------- |
| **Goal**          | Maximize CPU utilization | Minimize response time        |
| **Interaction**   | None — submit and wait   | Interactive terminal          |
| **Scheduling**    | Job priority, I/O events | Round-robin with time quantum |
| **Users**         | Operators only           | Multiple simultaneous users   |
| **Response time** | Hours to days            | Seconds                       |

### Landmark Systems of the 1960s

| System                                    | Year    | Innovation                                                                                   |
| ----------------------------------------- | ------- | -------------------------------------------------------------------------------------------- |
| **CTSS** (Compatible Time-Sharing System) | 1961    | First time-sharing system (MIT)                                                              |
| **OS/360**                                | 1964    | IBM's first OS family spanning multiple machine models                                       |
| **MULTICS**                               | 1964–69 | Ambitious multi-user OS; introduced hierarchical file system, security rings, virtual memory |
| **THE** (Technische Hogeschool Eindhoven) | 1968    | Dijkstra's layered OS — first formal OS structure                                            |

> "MULTICS was the most influential operating system that most people never used."
> — Popular OS folklore

### The Birth of UNIX (1969)

When MULTICS became too complex and expensive, **Ken Thompson** and **Dennis Ritchie** at Bell Labs created a simpler system on a spare PDP-7 minicomputer. They called it **UNICS** (Uniplexed Information and Computing Service) — a playful contrast to MULTICS. The name later became **UNIX**.

Key UNIX innovations:

- Written in **C** (Ritchie created C for this purpose) — first OS not written in assembly
- Simple, elegant design: "everything is a file"
- Hierarchical file system with `/` root
- Small, composable tools connected by **pipes** (`|`)
- Source code shared with universities, spawning BSD, System V, and eventually Linux

---

## Generation 3: Personal Computers (1970s–1980s)

The microprocessor revolution made computers affordable for individuals, fundamentally changing OS design goals.

### Key Systems

| System               | Year | Significance                                           |
| -------------------- | ---- | ------------------------------------------------------ |
| **CP/M**             | 1974 | First OS for microcomputers (Intel 8080); Gary Kildall |
| **Apple DOS**        | 1978 | OS for Apple II — brought computing to homes           |
| **MS-DOS**           | 1981 | Microsoft's OS for IBM PC; command-line interface      |
| **Macintosh System** | 1984 | First mass-market GUI OS (inspired by Xerox PARC)      |
| **Windows 1.0**      | 1985 | GUI shell over MS-DOS                                  |
| **MINIX**            | 1987 | Andrew Tanenbaum's teaching OS; inspired Linux         |

```text
The PC OS Family Tree
======================

  CP/M (1974)
    |
    +----> MS-DOS (1981)
              |
              +----> Windows 1.0 (1985)
              |        |
              |        +----> Windows 3.1 (1992)
              |                  |
              |                  +----> Windows 95 (1995)
              |                            |
              |                            +----> Windows XP (2001)
              |
              +----> OS/2 (1987, IBM + Microsoft)

  Xerox PARC (1973) ----> Macintosh (1984) ----> Mac OS X (2001)

  UNIX (1969)
    |
    +----> BSD (1977)
    |        |
    |        +----> FreeBSD / OpenBSD / NetBSD
    |        |
    |        +----> NeXTSTEP ----> Mac OS X / macOS (2001+)
    |
    +----> System V
    |        |
    |        +----> Solaris, HP-UX, AIX
    |
    +----> MINIX (1987) ----> [inspired] Linux (1991)
```

### Shift in Design Goals

| Batch/Mainframe Era                   | PC Era                                    |
| ------------------------------------- | ----------------------------------------- |
| Maximize CPU utilization              | Maximize user convenience                 |
| Serve many users                      | Serve one user                            |
| Expensive hardware, cheap programmers | Cheap hardware, expensive programmer time |
| Text terminals                        | Graphical user interfaces                 |

---

## Generation 4: The Modern Era (1990s–2000s)

### Linux (1991)

**Linus Torvalds**, a 21-year-old Finnish student, posted to the comp.os.minix newsgroup:

> "I'm doing a (free) operating system (just a hobby, won't be big and professional like GNU)..."
> — Linus Torvalds, August 25, 1991

Linux combined with the **GNU** project's tools (gcc, bash, coreutils) created a complete free operating system. Today, Linux powers:

| Domain         | Examples                         |
| -------------- | -------------------------------- |
| Servers        | 96% of top 1 million web servers |
| Cloud          | AWS, GCP, Azure instances        |
| Supercomputers | 100% of Top 500 supercomputers   |
| Mobile         | Android (Linux kernel)           |
| Embedded       | Routers, TVs, cars               |

### Windows NT (1993)

Microsoft built Windows NT from scratch as a modern, 32-bit, preemptive multitasking OS with:

- **Hybrid kernel** architecture
- Hardware abstraction layer (HAL)
- Support for multiple subsystems (Win32, POSIX, OS/2)
- NTFS file system with journaling and security

| Feature   | Windows 95/98                 | Windows NT/2000/XP                      |
| --------- | ----------------------------- | --------------------------------------- |
| Kernel    | 16/32-bit hybrid, cooperative | 32-bit, preemptive                      |
| Stability | Frequent crashes (BSOD)       | Much more stable                        |
| Security  | Minimal                       | User accounts, ACLs, NTFS permissions   |
| Target    | Home users                    | Business + home (XP unified both lines) |

### The GUI Revolution

| Year | Milestone                                        |
| ---- | ------------------------------------------------ |
| 1973 | Xerox Alto — first GUI computer (research)       |
| 1984 | Apple Macintosh — first mass-market GUI          |
| 1990 | Windows 3.0 — GUI gains mainstream adoption      |
| 1995 | Windows 95 — Start menu, taskbar become standard |
| 2001 | Mac OS X — UNIX-based GUI OS                     |

---

## Generation 5: Mobile & Cloud (2010s–Present)

### Mobile Operating Systems

| Feature              | Android                        | iOS                             |
| -------------------- | ------------------------------ | ------------------------------- |
| **Based on**         | Linux kernel                   | XNU kernel (Mach + BSD)         |
| **Released**         | 2008                           | 2007                            |
| **Language**         | Java/Kotlin (apps), C (kernel) | Swift/Obj-C (apps), C (kernel)  |
| **Open source**      | Yes (AOSP)                     | No (mostly proprietary)         |
| **App distribution** | Google Play Store              | Apple App Store                 |
| **Market share**     | ~72%                           | ~27%                            |
| **Security model**   | App sandboxing, permissions    | App sandboxing, stricter review |

### Cloud and Containerization

The cloud era brought fundamental changes to how we think about operating systems.

| Concept         | Year | Description                                               |
| --------------- | ---- | --------------------------------------------------------- |
| **VMware ESXi** | 2001 | Type-1 hypervisor — run multiple OSes on one machine      |
| **Amazon EC2**  | 2006 | Rent virtual machines in the cloud                        |
| **Docker**      | 2013 | Lightweight containers using Linux namespaces and cgroups |
| **Kubernetes**  | 2014 | Orchestrate thousands of containers                       |
| **Serverless**  | 2014 | AWS Lambda — run code without managing servers at all     |

```text
Evolution of Compute Abstraction
==================================

  Physical     Virtual        Container       Serverless
  Machines     Machines       (Docker)        (Lambda)
  +---------+  +---------+   +---------+     +---------+
  |  App    |  |  App    |   |  App    |     |  Func   |
  |  Libs   |  |  Libs   |   |  Libs   |     +---------+
  |  OS     |  |  OS     |   +---------+         |
  +---------+  +---------+   | Container|     Platform
  | Hardware|  |Hypervisor|   | Runtime |     manages
  +---------+  +---------+   +---------+     everything
               | Hardware|   | Host OS |
               +---------+   +---------+
                              | Hardware|
                              +---------+

  Increasing abstraction  ──────────────────>
  Decreasing control      ──────────────────>
```

---

## Key Figures in OS History

| Person               | Contribution                                          | Era       |
| -------------------- | ----------------------------------------------------- | --------- |
| **Alan Turing**      | Theoretical foundations of computation                | 1930s–40s |
| **John von Neumann** | Stored-program computer architecture                  | 1940s     |
| **Grace Hopper**     | First compiler (A-0); coined "debugging"              | 1950s     |
| **Edsger Dijkstra**  | Layered OS (THE), semaphores, concurrency theory      | 1960s     |
| **Fernando Corbató** | Time-sharing (CTSS, MULTICS); password authentication | 1960s     |
| **Ken Thompson**     | Co-created UNIX; invented B language                  | 1969      |
| **Dennis Ritchie**   | Co-created UNIX; invented C language                  | 1969–72   |
| **Gary Kildall**     | Created CP/M — first microcomputer OS                 | 1974      |
| **Bill Gates**       | MS-DOS, Windows — dominated PC market                 | 1980s     |
| **Steve Jobs**       | Macintosh GUI, NeXTSTEP → macOS, iOS                  | 1984–2011 |
| **Andrew Tanenbaum** | Created MINIX; wrote influential OS textbooks         | 1987      |
| **Linus Torvalds**   | Created Linux kernel                                  | 1991      |
| **Richard Stallman** | GNU Project, Free Software Foundation, GPL            | 1983      |

---

## Evolution of Key OS Concepts

Each major OS concept evolved over multiple generations:

| Concept            | Gen 0–1              | Gen 2               | Gen 3                   | Gen 4–5                               |
| ------------------ | -------------------- | ------------------- | ----------------------- | ------------------------------------- |
| **Scheduling**     | None (one job)       | Job queue, priority | Round-robin, preemptive | MLFQ, CFS, real-time, container-aware |
| **Memory**         | Direct physical      | Fixed partitions    | Paging, virtual memory  | Demand paging, NUMA, huge pages       |
| **Storage**        | Punched cards/tape   | Magnetic drums      | Hard disks, FAT/ext     | SSDs, NVMe, distributed FS            |
| **Concurrency**    | None                 | Multiprogramming    | Threads, mutexes        | Lock-free, async/await, coroutines    |
| **Security**       | Physical access only | Passwords           | ACLs, file permissions  | Sandboxing, encryption, TEEs          |
| **User Interface** | Switches, lights     | Terminals (text)    | CLI (shell)             | GUI, touch, voice, VR                 |
| **Networking**     | None                 | Terminals connected | LAN, TCP/IP             | Cloud, microservices, CDN             |

---

## A Simple Timeline Exercise

To help remember the chronology, consider this simplified timeline:

```text
Year    Event
----    ---------------------------------------------------
1946    ENIAC operational — no OS
1956    GM-NAA I/O — first batch system
1961    CTSS — first time-sharing system
1964    MULTICS begins; OS/360 released
1969    UNIX born at Bell Labs
1974    CP/M — first microcomputer OS
1981    MS-DOS — IBM PC operating system
1984    Macintosh — first mass-market GUI
1987    MINIX — teaching OS by Tanenbaum
1991    Linux 0.01 — Linus Torvalds
1993    Windows NT — modern Windows kernel
1995    Windows 95 — GUI becomes standard
2001    Mac OS X — UNIX-based Mac OS
2007    iPhone / iOS — mobile revolution
2008    Android 1.0 — open mobile OS
2013    Docker — container revolution
2014    Kubernetes — container orchestration
```

---

## Try It Yourself

**Exercise 1:** Why did multiprogramming dramatically improve CPU utilization? Use the formula $CPU\ Utilization = 1 - p^n$ to calculate utilization for 7 jobs where each job spends 70% of its time waiting for I/O.

:::details Solution
Given: $p = 0.7$ (I/O wait fraction), $n = 7$ jobs.

$$CPU\ Utilization = 1 - p^n = 1 - 0.7^7 = 1 - 0.0824 = 0.9176$$

So CPU utilization is approximately **91.8%** — compared to only 30% with a single job. Multiprogramming improved utilization by keeping the CPU busy while other jobs wait for I/O.
:::

**Exercise 2:** Arrange the following events in chronological order: Linux kernel created, UNIX created, MULTICS project started, MS-DOS released, Docker released, ENIAC operational.

:::details Solution

1. **ENIAC operational** — 1946
2. **MULTICS project started** — 1964
3. **UNIX created** — 1969
4. **MS-DOS released** — 1981
5. **Linux kernel created** — 1991
6. **Docker released** — 2013
   :::

**Exercise 3:** Explain why UNIX being written in C was revolutionary. What problem did it solve that previous operating systems faced?

:::details Solution
Before UNIX, operating systems were written in **assembly language**, which is specific to a particular CPU architecture. This meant that porting an OS to a new machine required rewriting the entire system from scratch — an enormous effort.

By writing UNIX in **C** (a high-level language that Dennis Ritchie designed for this purpose), the UNIX team made the OS **portable**. To run UNIX on a new machine, developers only needed to:

1. Write a C compiler for the new architecture.
2. Rewrite a small amount of machine-specific code (device drivers, boot code).
3. Recompile the rest of the OS.

This portability is why UNIX spread to so many different hardware platforms and ultimately led to the diverse ecosystem of UNIX-like systems we have today (Linux, macOS, BSD, Android).
:::

---

## Key Takeaways

- Operating systems evolved through **six generations**, each solving critical problems of the previous era.
- **Batch systems** (1950s) eliminated the waste of manual machine setup but left the CPU idle during I/O.
- **Multiprogramming** (1960s) dramatically improved CPU utilization by keeping multiple jobs in memory.
- **Time-sharing** gave interactive access to multiple users, leading to the modern concept of multitasking.
- **UNIX** (1969) introduced portable, elegant OS design — its ideas dominate computing to this day.
- **Personal computers** (1970s–80s) shifted OS goals from hardware efficiency to user convenience and GUI.
- **Linux** (1991) brought open-source, UNIX-like computing to the masses and now dominates servers, cloud, and mobile (via Android).
- The **cloud era** introduced virtualization, containers, and serverless — abstracting away the OS itself.
- Key figures like **Dijkstra**, **Thompson**, **Ritchie**, **Torvalds**, and **Stallman** shaped the OS landscape we use today.
- Understanding this history helps you appreciate _why_ modern OS features exist and how they are likely to evolve.
