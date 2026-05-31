---
title: Types of Operating Systems
---

# Types of Operating Systems

Not all operating systems are created equal. A real-time OS controlling an aircraft's flight systems has fundamentally different requirements than a desktop OS running a word processor. In this lesson we explore the major categories of operating systems, understand their design trade-offs, and learn how to choose the right type for a given application.

---

## Overview of OS Types

| Type                | Primary Goal                    | User Interaction                   | Example                        |
| ------------------- | ------------------------------- | ---------------------------------- | ------------------------------ |
| Batch OS            | Maximize throughput             | None (submit jobs, collect output) | IBM OS/360                     |
| Time-Sharing OS     | Minimize response time          | Interactive terminals              | UNIX, Linux                    |
| Real-Time OS (RTOS) | Meet deadlines                  | Minimal or none                    | VxWorks, FreeRTOS              |
| Distributed OS      | Transparency across nodes       | Appears as single system           | Amoeba, LOCUS                  |
| Network OS          | File/resource sharing           | Each machine has own OS            | Windows Server, Novell NetWare |
| Embedded OS         | Resource-efficient control      | Specialized (buttons, sensors)     | QNX, Embedded Linux            |
| Mobile OS           | Touch-friendly, power-efficient | Touchscreen, gestures              | Android, iOS                   |

---

## Batch Operating Systems

A **batch OS** collects jobs, groups them into batches, and processes them sequentially without user interaction.

> Think of a batch OS like a **laundromat's drop-off service**: you leave your clothes (jobs), the attendant washes batch after batch, and you pick up the results later.

### Characteristics

| Feature             | Description                                                |
| ------------------- | ---------------------------------------------------------- |
| **Job submission**  | Users submit jobs offline (historically via punched cards) |
| **Scheduling**      | First-Come-First-Served or priority-based                  |
| **Interaction**     | None during execution                                      |
| **Turnaround time** | Hours to days                                              |
| **CPU utilization** | Low if I/O-bound; improved with multiprogramming           |

### Workflow

```text
Batch OS Workflow
==================

  +---------+     +-----------+     +-----------+     +---------+
  |  Users  | --> |  Job      | --> |  Batch    | --> | Output  |
  | submit  |     |  Queue    |     | Processor |     | Queue   |
  | jobs    |     | (spooling)|     | (CPU)     |     | (print) |
  +---------+     +-----------+     +-----------+     +---------+
                        |                |
                        |   Jobs wait    |  Executes one
                        |   in queue     |  job at a time
                        +----------------+
```

### Advantages and Disadvantages

| Advantages                           | Disadvantages                                           |
| ------------------------------------ | ------------------------------------------------------- |
| Simple to implement                  | No user interaction during execution                    |
| Efficient for large, repetitive jobs | Long turnaround time                                    |
| Reduced idle time between jobs       | CPU idle during I/O (without multiprogramming)          |
| Good for payroll, bank statements    | Difficult to debug — errors found only after completion |

> [!NOTE]
> Modern "batch processing" still exists — think of nightly database backups, MapReduce jobs on Hadoop, or CI/CD pipeline runs. The concept lives on even though punched cards do not.

---

## Time-Sharing Operating Systems

A **time-sharing OS** allows multiple users to interact with the computer simultaneously by rapidly switching the CPU among them.

> Imagine a **teacher** (CPU) helping 30 students (users). The teacher gives each student 2 minutes of attention before moving to the next. Each student feels they have reasonable access, even though the teacher is shared.

### How Time-Sharing Works

```text
Time-Sharing — Round-Robin Scheduling
=======================================

  Time →  |--Q--|--Q--|--Q--|--Q--|--Q--|--Q--|--Q--|--Q--|
           User1 User2 User3 User1 User2 User3 User1 User2

  Q = time quantum (e.g., 10-100 milliseconds)

  Each user gets a slice of CPU time. When the quantum
  expires, the CPU switches to the next user.
```

### Characteristics

| Feature               | Description                                         |
| --------------------- | --------------------------------------------------- |
| **Response time**     | Short — typically < 1 second                        |
| **Context switching** | Frequent — CPU switches between users/processes     |
| **Memory**            | Multiple programs reside in memory simultaneously   |
| **Scheduling**        | Round-robin with time quantum                       |
| **Protection**        | Required — users must not interfere with each other |
| **Swapping**          | Jobs may be swapped to disk if memory is full       |

### Time-Sharing vs Batch

| Criterion            | Batch OS                   | Time-Sharing OS                |
| -------------------- | -------------------------- | ------------------------------ |
| **Objective**        | Maximize throughput        | Minimize response time         |
| **User interaction** | None                       | Interactive (keyboard, screen) |
| **CPU scheduling**   | Job-based (FCFS, priority) | Process-based (Round Robin)    |
| **Turnaround**       | Hours–days                 | Seconds–minutes                |
| **Example**          | IBM OS/360 batch mode      | UNIX, CTSS                     |

---

## Real-Time Operating Systems (RTOS)

A **real-time OS** is designed to process data and deliver results within strict **time deadlines**. Missing a deadline is not just slow — it can be catastrophic.

> A real-time OS is like an **air traffic controller**: every instruction to a pilot must arrive on time. A delayed command could cause a collision.

### Hard vs Soft Real-Time

| Feature                 | Hard Real-Time                        | Soft Real-Time                         |
| ----------------------- | ------------------------------------- | -------------------------------------- |
| **Deadline**            | Absolute — missing it causes failure  | Flexible — missing it degrades quality |
| **Consequence of miss** | System failure, potential danger      | Reduced performance, user annoyance    |
| **Examples**            | Pacemaker, ABS brakes, flight control | Video streaming, VoIP, online gaming   |
| **Jitter tolerance**    | Near zero                             | Some acceptable                        |
| **Scheduling**          | Rate Monotonic, EDF                   | Priority-based with best-effort        |

### RTOS Architecture

```text
RTOS Architecture
==================

  +------------------------------------------+
  |         Real-Time Applications           |
  |  (Control loops, signal processing)      |
  +------------------------------------------+
  |         RTOS Kernel                      |
  |  +----------+  +----------+  +--------+ |
  |  | Priority |  |  Timer   |  | Inter- | |
  |  | Scheduler|  |  Manager |  |  rupt  | |
  |  |          |  |          |  | Handler| |
  |  +----------+  +----------+  +--------+ |
  +------------------------------------------+
  |         Hardware Abstraction Layer       |
  +------------------------------------------+
  |         Hardware (Sensors, Actuators)    |
  +------------------------------------------+

  Key property: Deterministic response time
  (worst-case execution time is bounded)
```

### Key RTOS Metrics

| Metric                  | Definition                       | Typical Value        |
| ----------------------- | -------------------------------- | -------------------- |
| **Interrupt latency**   | Time from interrupt to ISR start | 1–10 μs              |
| **Context switch time** | Time to switch between tasks     | 1–5 μs               |
| **Jitter**              | Variation in response time       | < 1 μs (hard RT)     |
| **Determinism**         | Predictability of timing         | Guaranteed (hard RT) |

### Common RTOS Examples

| RTOS         | Use Case                             | License         |
| ------------ | ------------------------------------ | --------------- |
| **VxWorks**  | Aerospace, defense, medical devices  | Proprietary     |
| **FreeRTOS** | IoT, microcontrollers (ESP32, STM32) | MIT Open Source |
| **QNX**      | Automotive (BlackBerry QNX), medical | Proprietary     |
| **RTEMS**    | Space missions (NASA rovers)         | Open Source     |
| **Zephyr**   | Wearables, IoT sensors               | Apache 2.0      |

$$\text{Schedulability (Rate Monotonic):} \quad \sum_{i=1}^{n} \frac{C_i}{T_i} \leq n(2^{1/n} - 1)$$

where $C_i$ is the computation time and $T_i$ is the period of task $i$. For large $n$, this bound converges to $\ln 2 \approx 0.693$.

---

## Distributed Operating Systems

A **distributed OS** manages a collection of independent computers and makes them appear to the user as a **single coherent system**.

> Think of a distributed OS like a **chain restaurant**: no matter which location you walk into, you get the same menu, same quality, same experience — even though each location has its own kitchen and staff.

### Key Properties

| Property             | Description                                                   |
| -------------------- | ------------------------------------------------------------- |
| **Transparency**     | Hides the fact that resources are distributed across machines |
| **Scalability**      | Can add more machines to handle more load                     |
| **Fault tolerance**  | Continues operating even if some nodes fail                   |
| **Concurrency**      | Multiple users and processes on multiple machines             |
| **Resource sharing** | CPU, memory, files shared across the network                  |

### Types of Transparency

| Transparency Type | What It Hides                          | Example                                      |
| ----------------- | -------------------------------------- | -------------------------------------------- |
| **Access**        | How resources are accessed             | Same API for local and remote files          |
| **Location**      | Where resources are physically located | File `/data/file.txt` could be on any server |
| **Migration**     | That a resource has moved              | Moving a VM between hosts without downtime   |
| **Replication**   | That multiple copies exist             | Reading from any database replica            |
| **Failure**       | That a component has failed            | Automatic failover to a backup server        |

```text
Distributed OS — Logical View
===============================

  User sees ONE system:
  +--------------------------------------------------+
  |              Single System Image                  |
  |  /home/user/file.txt    (could be on any node)    |
  |  process P1              (could run on any node)   |
  +--------------------------------------------------+

  Reality — Multiple machines:
  +----------+    +----------+    +----------+
  | Node A   |    | Node B   |    | Node C   |
  | CPU: 4   |    | CPU: 8   |    | CPU: 4   |
  | RAM: 16G |    | RAM: 32G |    | RAM: 16G |
  | Disk: 1T |    | Disk: 2T |    | Disk: 1T |
  +----+-----+    +----+-----+    +----+-----+
       |               |               |
  =====+===============+===============+=======
              High-Speed Network
```

---

## Network Operating Systems

A **network OS** provides services (file sharing, printing, authentication) to client machines over a network, but each machine retains its **own operating system**.

| Feature              | Network OS                                      | Distributed OS                |
| -------------------- | ----------------------------------------------- | ----------------------------- |
| **Machine identity** | Each machine is distinct                        | Machines appear as one system |
| **User awareness**   | Users know which machine they are on            | Users see a single system     |
| **File access**      | Explicit remote access (e.g., `\\server\share`) | Transparent — looks local     |
| **Administration**   | Per-machine management                          | Centralized management        |
| **Examples**         | Windows Server, NFS, Samba                      | Amoeba, LOCUS, Google's Borg  |

```text
Network OS Architecture
=========================

  +--------+   +--------+   +--------+
  | Client |   | Client |   | Client |
  | (Win10)|   | (macOS)|   | (Linux)|
  +---+----+   +---+----+   +---+----+
      |            |            |
  ====+============+============+======
             Local Area Network
  ====+============+============+======
      |            |            |
  +---+------------|------------+---+
  |           File Server           |
  |      (Windows Server / NFS)     |
  |  Shared files, printers, auth   |
  +---------------------------------+
```

---

## Embedded Operating Systems

An **embedded OS** runs on specialized hardware with limited resources (small CPU, limited RAM, no disk) and is designed for a **specific task**.

> An embedded OS is like the **autopilot in an elevator**: it does one thing extremely well, runs continuously, and must be incredibly reliable.

### Characteristics

| Feature       | Description                                     |
| ------------- | ----------------------------------------------- |
| **Resources** | Very limited CPU, memory (KB–MB range), no disk |
| **Task**      | Single-purpose or narrow set of functions       |
| **Boot time** | Very fast — often < 1 second                    |
| **Real-time** | Often has real-time constraints                 |
| **UI**        | Minimal — buttons, LEDs, small screens          |
| **Power**     | Must be power-efficient (battery-operated)      |

### Examples of Embedded Systems

| Device                    | Embedded OS                | CPU              | RAM         |
| ------------------------- | -------------------------- | ---------------- | ----------- |
| Washing machine           | Custom firmware / FreeRTOS | 8-bit MCU        | 2–32 KB     |
| Car engine control        | AUTOSAR / QNX              | 32-bit ARM       | 256 KB–2 MB |
| Smart thermostat          | Zephyr / Embedded Linux    | ARM Cortex-M     | 256 KB      |
| Medical ventilator        | VxWorks                    | ARM Cortex-R     | 1–4 MB      |
| Mars Rover (Perseverance) | VxWorks                    | RAD750 (PowerPC) | 256 MB      |
| Wi-Fi Router              | OpenWrt (Embedded Linux)   | MIPS / ARM       | 32–128 MB   |

---

## Mobile Operating Systems

**Mobile OSes** are designed for smartphones and tablets — devices with touchscreens, batteries, cellular radios, and sensors. They must balance **performance**, **power efficiency**, and **security**.

### Key Design Considerations

| Consideration        | How Mobile OSes Address It                             |
| -------------------- | ------------------------------------------------------ |
| **Power management** | Aggressive sleep states, app suspension, doze mode     |
| **Touch input**      | Touch event handling, gesture recognition              |
| **App isolation**    | Each app runs in its own sandbox (process, filesystem) |
| **Security**         | App store review, permissions system, encryption       |
| **Connectivity**     | Wi-Fi, cellular, Bluetooth, GPS management             |
| **Sensors**          | Accelerometer, gyroscope, camera, fingerprint          |

### Android vs iOS

| Feature           | Android                        | iOS                              |
| ----------------- | ------------------------------ | -------------------------------- |
| **Kernel**        | Linux                          | XNU (Mach + BSD)                 |
| **App language**  | Kotlin / Java                  | Swift / Objective-C              |
| **App format**    | APK / AAB                      | IPA                              |
| **Runtime**       | ART (Android Runtime)          | Native (compiled ahead-of-time)  |
| **File system**   | ext4 / F2FS                    | APFS                             |
| **Open source**   | Yes (AOSP)                     | No                               |
| **Customization** | High (launchers, default apps) | Low (controlled ecosystem)       |
| **Update model**  | Fragmented (OEM-dependent)     | Unified (Apple controls updates) |

```text
Mobile OS Architecture (Android)
==================================

  +--------------------------------------------+
  |          Applications                      |
  |  (Phone, Camera, Browser, Third-party)     |
  +--------------------------------------------+
  |          Application Framework             |
  |  (Activity Manager, Window Manager,        |
  |   Content Providers, Package Manager)      |
  +--------------------------------------------+
  |          Android Runtime (ART)             |
  |  (DEX bytecode → native code via AOT)      |
  +--------------------------------------------+
  |          Native Libraries                  |
  |  (libc, OpenGL ES, SQLite, WebKit)         |
  +--------------------------------------------+
  |          Hardware Abstraction Layer (HAL)   |
  +--------------------------------------------+
  |          Linux Kernel                      |
  |  (Binder IPC, Power Mgmt, Drivers)         |
  +--------------------------------------------+
```

---

## Comprehensive Comparison

| Feature           | Batch            | Time-Sharing         | RTOS             | Distributed  | Network        | Embedded        | Mobile       |
| ----------------- | ---------------- | -------------------- | ---------------- | ------------ | -------------- | --------------- | ------------ |
| **Response time** | Hours            | Seconds              | Microseconds     | Milliseconds | Milliseconds   | Microseconds–ms | Milliseconds |
| **Users**         | None (offline)   | Multiple interactive | None/few         | Multiple     | Multiple       | None            | One          |
| **Throughput**    | High             | Medium               | Low–Med          | High         | Medium         | Low             | Medium       |
| **Complexity**    | Low              | Medium               | Medium           | Very High    | Medium         | Low–Med         | High         |
| **Reliability**   | Medium           | Medium               | Very High        | High         | Medium         | Very High       | High         |
| **Resources**     | Large mainframes | Servers/desktops     | Microcontrollers | Clusters     | Servers        | Tiny MCUs       | Smartphones  |
| **Example**       | Hadoop batch     | Ubuntu               | FreeRTOS         | Google Borg  | Windows Server | QNX in cars     | Android      |

---

## Decision Flowchart: Choosing an OS Type

```text
                    Start: What is your application?
                              |
              +---------------+---------------+
              |                               |
        Is it safety-                   Does it need
        critical or has                 multiple users?
        strict deadlines?                     |
              |                     +---------+---------+
        +-----+-----+              |                   |
        | Yes       | No           Yes                 No
        v           |              |                   |
  +----------+      |        Need network         Single purpose?
  | RTOS     |      |        transparency?              |
  | (Hard or |      |              |              +-----+-----+
  |  Soft)   |      |        +-----+-----+        | Yes       | No
  +----------+      |        | Yes       | No     v           |
                    |        v           v    +----------+     |
                    |   +---------+ +------+ | Embedded |     |
                    |   |Distrib- | |Network| | OS       |     |
                    |   |uted OS  | |OS     | +----------+     |
                    |   +---------+ +------+                  |
                    |                                          |
                    +------------------+-----------------------+
                                       |
                              Is it a mobile device
                              (phone/tablet)?
                                       |
                                 +-----+-----+
                                 | Yes       | No
                                 v           v
                            +--------+  +------------+
                            | Mobile |  | Time-      |
                            | OS     |  | Sharing /  |
                            +--------+  | General-   |
                                        | Purpose OS |
                                        +------------+
```

---

## Hybrid and Emerging Categories

Modern operating systems rarely fit neatly into one category. Here are some hybrid and emerging types:

| Category              | Description                                 | Example                                |
| --------------------- | ------------------------------------------- | -------------------------------------- |
| **Desktop + Server**  | Same kernel for personal and server use     | Linux (Ubuntu Desktop / Ubuntu Server) |
| **Mobile + Embedded** | Mobile features on embedded hardware        | Android Things, Tizen                  |
| **Cloud OS**          | Manages cloud infrastructure at scale       | Google Borg, OpenStack                 |
| **Container OS**      | Minimal OS optimized for running containers | CoreOS, Bottlerocket, Flatcar          |
| **Unikernel**         | Single-purpose OS image for one application | MirageOS, IncludeOS                    |
| **Library OS**        | App links directly against OS components    | Exokernel, Unikraft                    |

> [!IMPORTANT]
> In practice, a modern general-purpose OS like Linux can operate as a time-sharing OS, a batch processing server, a network OS, an embedded OS, or a mobile OS (Android) — depending on how it is configured and deployed.

---

## Try It Yourself

**Exercise 1:** A hospital needs an OS for its patient-monitoring system that tracks heart rate and blood pressure in real time. A delayed alert could endanger a patient's life. What type of OS should they use, and should it be hard or soft real-time? Justify your answer.

:::details Solution
The hospital should use a **Hard Real-Time Operating System (RTOS)** such as **VxWorks** or **QNX**.

**Justification:**

- Patient monitoring is **safety-critical** — a delayed alert about a dangerous heart rate could cause a death.
- **Hard real-time** is necessary because missing a deadline is not merely inconvenient; it can have catastrophic consequences.
- The system must have **deterministic response times** with bounded worst-case latency.
- Soft real-time would be insufficient because occasional deadline misses (even if rare) are unacceptable in a life-threatening context.
  :::

**Exercise 2:** Fill in the blanks in this comparison table:

| Feature          | Batch OS | Time-Sharing OS | RTOS              |
| ---------------- | -------- | --------------- | ----------------- |
| Primary goal     | ?        | ?               | ?                 |
| User interaction | ?        | Interactive     | ?                 |
| Scheduling focus | ?        | ?               | Meeting deadlines |

:::details Solution
| Feature | Batch OS | Time-Sharing OS | RTOS |
|---------|----------|----------------|------|
| Primary goal | **Maximize throughput** | **Minimize response time** | **Meet deadlines** |
| User interaction | **None (offline)** | Interactive | **Minimal or none** |
| Scheduling focus | **Job completion order** | **Fair time distribution (round-robin)** | Meeting deadlines |
:::

**Exercise 3:** A company wants to build a smart refrigerator that can connect to Wi-Fi, display recipes, and allow remote monitoring via a phone app. What type(s) of OS would be appropriate? Consider the constraints of the device.

:::details Solution
A smart refrigerator would best use an **Embedded OS**, specifically one with networking capabilities. Good choices include:

1. **Embedded Linux** (e.g., Yocto Project-based) — provides Wi-Fi support, web server capability, and a rich ecosystem of libraries for the display and networking features.
2. **Android Things** (now deprecated but illustrative) — would provide a familiar app framework for the recipe display.

Key considerations:

- The refrigerator has **limited resources** (compared to a phone or desktop) but more than a bare microcontroller.
- It needs **networking** (Wi-Fi for remote monitoring).
- It needs a **display driver** for the recipe screen.
- It does **not** need hard real-time guarantees — delayed recipe display is not dangerous.
- **Power** is not a concern (plugged in), but **reliability** is (should run 24/7 for years).

An RTOS like FreeRTOS would be too minimal for the display and networking requirements, while a full desktop OS would be wasteful.
:::

---

## Key Takeaways

- Operating systems are classified by their **design goals**: throughput (batch), responsiveness (time-sharing), predictability (RTOS), transparency (distributed), simplicity (embedded), or mobility (mobile).
- **Batch OSes** maximize throughput by processing jobs without interaction — the concept survives in modern big-data pipelines.
- **Time-sharing OSes** give multiple users the illusion of dedicated access through rapid CPU switching.
- **Real-time OSes** guarantee deadline compliance; **hard** RT means a missed deadline is a system failure, while **soft** RT tolerates occasional misses.
- **Distributed OSes** hide the complexity of multiple networked machines behind a single system image.
- **Embedded OSes** run on resource-constrained hardware for dedicated tasks — they are everywhere, from cars to medical devices.
- **Mobile OSes** balance performance, power efficiency, and security for touch-driven, battery-powered devices.
- Modern operating systems are often **hybrids** — Linux, for example, can function as nearly every type depending on configuration.
- Choosing the right OS type requires analyzing **deadlines**, **user interaction**, **resource constraints**, and **reliability requirements**.
