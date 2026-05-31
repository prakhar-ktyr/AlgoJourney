---
title: Virtualization & Containers
---

# Virtualization & Containers

**Virtualization** — the ability to run multiple operating systems simultaneously on a single physical machine — has transformed computing from dedicated hardware per application to the elastic, on-demand cloud we use today. Combined with **containers**, which provide lightweight, fast, and portable application packaging, virtualization technologies form the backbone of modern infrastructure. This lesson covers hypervisor architectures, CPU/memory/I/O virtualization techniques, container internals, and the emerging world of unikernels.

---

## What Is Virtualization?

Virtualization creates an **abstraction layer** between hardware and software, allowing multiple isolated environments to share the same physical resources.

```text
Without Virtualization:           With Virtualization:

┌───────────────┐                ┌─────────┐ ┌─────────┐ ┌─────────┐
│  Application  │                │  App A  │ │  App B  │ │  App C  │
├───────────────┤                ├─────────┤ ├─────────┤ ├─────────┤
│  Operating    │                │  OS A   │ │  OS B   │ │  OS C   │
│  System       │                │ (Linux) │ │(Windows)│ │(FreeBSD)│
├───────────────┤                ├─────────┴─┴─────────┴─┴─────────┤
│  Hardware     │                │         Hypervisor (VMM)         │
└───────────────┘                ├───────────────────────────────────┤
                                 │           Hardware               │
One OS per machine               └───────────────────────────────────┘
                                 Multiple OSes on ONE machine
```

### Historical Context

| Year | Milestone                                         |
| ---- | ------------------------------------------------- |
| 1967 | IBM CP-40 — first virtual machine system          |
| 1972 | IBM VM/370 — production VM platform on mainframes |
| 1999 | VMware Workstation — x86 virtualization for PCs   |
| 2003 | Xen — open-source paravirtualization hypervisor   |
| 2005 | Intel VT-x — hardware-assisted virtualization     |
| 2006 | AWS EC2 — cloud computing with Xen VMs            |
| 2007 | KVM — Linux kernel-based virtual machine          |
| 2013 | Docker — popularizes container-based deployment   |
| 2014 | Kubernetes — container orchestration at scale     |

---

## Hypervisor Types

A **hypervisor** (Virtual Machine Monitor — VMM) is the software that creates and manages virtual machines.

### Type 1: Bare-Metal Hypervisor

Runs **directly on hardware** with no host OS. Maximum performance and security.

```text
┌─────────┐  ┌─────────┐  ┌─────────┐
│  VM 1   │  │  VM 2   │  │  VM 3   │
│ (Linux) │  │(Windows)│  │ (Linux) │
├─────────┤  ├─────────┤  ├─────────┤
│ vCPUs   │  │ vCPUs   │  │ vCPUs   │
│ vRAM    │  │ vRAM    │  │ vRAM    │
│ vDisk   │  │ vDisk   │  │ vDisk   │
├─────────┴──┴─────────┴──┴─────────┤
│    Type 1 Hypervisor (VMM)         │
│    Xen / VMware ESXi / Hyper-V     │
├────────────────────────────────────┤
│          Physical Hardware          │
│    CPU  │  RAM  │  Disk  │  NIC    │
└────────────────────────────────────┘
```

### Type 2: Hosted Hypervisor

Runs **on top of a host OS** as a regular application.

```text
┌─────────┐  ┌─────────┐
│  VM 1   │  │  VM 2   │
│ (Linux) │  │(Windows)│
├─────────┤  ├─────────┤
│ vCPUs   │  │ vCPUs   │
│ vRAM    │  │ vRAM    │
├─────────┴──┴─────────┤     ┌──────────┐
│  Type 2 Hypervisor    │     │ Host OS  │
│  VirtualBox/VMware WS │     │ Apps     │
├───────────────────────┴─────┴──────────┤
│              Host OS (e.g., macOS)      │
├─────────────────────────────────────────┤
│            Physical Hardware            │
└─────────────────────────────────────────┘
```

### Comparison

| Feature               | Type 1 (Bare-Metal)              | Type 2 (Hosted)                           |
| --------------------- | -------------------------------- | ----------------------------------------- |
| **Performance**       | Near-native                      | Moderate overhead                         |
| **Hardware access**   | Direct                           | Through host OS                           |
| **Security**          | Strong isolation                 | Depends on host OS security               |
| **Use case**          | Data centers, cloud, enterprise  | Development, testing, desktop             |
| **Examples**          | VMware ESXi, Xen, Hyper-V, KVM\* | VirtualBox, VMware Workstation, Parallels |
| **Requires host OS?** | No                               | Yes                                       |

> [!NOTE]
> **KVM** blurs the line — it's a kernel module that turns Linux itself into a Type 1 hypervisor. Technically, Linux is the hypervisor, making KVM Type 1, but it runs on a full Linux system, giving it Type 2 convenience.

---

## Virtualization Techniques

### Full Virtualization

The guest OS runs **completely unmodified**. The hypervisor must handle all privileged instructions.

| Approach               | How It Works                                                 | Example            |
| ---------------------- | ------------------------------------------------------------ | ------------------ |
| **Binary Translation** | Scan guest code, replace sensitive instructions at runtime   | VMware (early)     |
| **Hardware-Assisted**  | CPU traps sensitive instructions to hypervisor automatically | KVM, modern VMware |

### Paravirtualization

The guest OS is **modified** to cooperate with the hypervisor, replacing sensitive instructions with explicit **hypercalls**.

```text
Full Virtualization:
  Guest OS executes privileged instruction
  → CPU traps to hypervisor
  → Hypervisor emulates the instruction
  → Returns to guest
  (Guest doesn't know it's virtualized)

Paravirtualization:
  Guest OS calls hypercall API
  → Direct call to hypervisor
  → Hypervisor performs the operation
  → Returns to guest
  (Guest KNOWS it's virtualized — uses special API)
```

### Hardware-Assisted Virtualization

Intel **VT-x** and AMD **AMD-V** add hardware support for virtualization:

```text
Hardware-Assisted Virtualization (Intel VT-x):

┌──────────────────────────────────┐
│     VMX Non-Root Mode            │
│     (Guest OS runs here)         │
│                                  │
│  Guest executes sensitive instr  │
│           │                      │
│           │ VM Exit (automatic)  │
│           ▼                      │
├──────────────────────────────────┤
│     VMX Root Mode                │
│     (Hypervisor runs here)       │
│                                  │
│  Hypervisor handles the exit:    │
│  - Emulates the instruction      │
│  - Updates VMCS                  │
│  - VM Entry (resume guest)       │
│           │                      │
│           │ VM Entry             │
│           ▼                      │
│     VMX Non-Root Mode            │
│     (Guest resumes)              │
└──────────────────────────────────┘

VMCS = Virtual Machine Control Structure
(stores guest state, controls VM exits)
```

### Comparison

| Feature                | Full Virtualization           | Paravirtualization       | Hardware-Assisted    |
| ---------------------- | ----------------------------- | ------------------------ | -------------------- |
| **Guest modification** | None                          | Required (hypercalls)    | None                 |
| **Performance**        | Moderate (binary translation) | Best (direct hypercalls) | Near-native          |
| **Hardware needed**    | No special hardware           | No special hardware      | VT-x / AMD-V         |
| **Portability**        | Any OS                        | Only modified guests     | Any OS               |
| **Example**            | Early VMware                  | Xen PV, virtio           | KVM, VMware (modern) |

---

## CPU Virtualization

### Trap-and-Emulate

The classic virtualization technique: guest OS runs in user mode, privileged instructions **trap** to the hypervisor:

```text
Guest OS (Ring 1 or non-root):     Hypervisor (Ring 0 or VMX root):
  │                                  │
  ├── MOV to CR3 (page table)       │
  │   ← TRAP! (privileged) ────────▶│
  │                                  ├── Emulate: update shadow PT
  │   ← RESUME ◀────────────────────│
  │                                  │
  ├── CLI (disable interrupts)       │
  │   ← TRAP! ─────────────────────▶│
  │                                  ├── Emulate: set virtual IF
  │   ← RESUME ◀────────────────────│
```

### Popek-Goldberg Requirements

A CPU architecture is **classically virtualizable** if:

$$\text{Sensitive Instructions} \subseteq \text{Privileged Instructions}$$

| Term           | Definition                                          |
| -------------- | --------------------------------------------------- |
| **Sensitive**  | Instructions that depend on or affect machine state |
| **Privileged** | Instructions that trap when executed in user mode   |

> [!IMPORTANT]
> The original x86 architecture violated this requirement — some sensitive instructions (like `POPF`, `SGDT`) did NOT trap in user mode, they just silently behaved differently. This is why x86 virtualization required binary translation until VT-x was introduced.

---

## Memory Virtualization

Each VM thinks it has its own physical memory, but the hypervisor must map **guest physical addresses** to **host physical addresses**.

```text
Three levels of address translation:

Guest Virtual Addr ──▶ Guest Physical Addr ──▶ Host Physical Addr
      (GVA)                  (GPA)                  (HPA)
       │                      │                      │
  Guest page table       Hypervisor mapping      Actual RAM
  (managed by guest OS)  (managed by hypervisor)
```

### Shadow Page Tables

The hypervisor maintains a **shadow page table** that maps GVA directly to HPA:

```text
Guest Page Table:         Shadow Page Table:
GVA → GPA                 GVA → HPA (what CPU actually uses)

0x1000 → GPA 0x5000       0x1000 → HPA 0xA000
0x2000 → GPA 0x8000       0x2000 → HPA 0xF000
0x3000 → GPA 0x1000       0x3000 → HPA 0x3000

Hypervisor maintains mapping: GPA 0x5000 → HPA 0xA000, etc.
```

### Extended Page Tables (EPT / NPT)

Hardware-assisted: the CPU performs **two-level page table walk** automatically:

| Feature                    | Shadow Page Tables                   | EPT/NPT                      |
| -------------------------- | ------------------------------------ | ---------------------------- |
| **Maintained by**          | Hypervisor (software)                | CPU hardware                 |
| **TLB miss cost**          | One page walk                        | Two page walks (nested)      |
| **Overhead on PT changes** | High (hypervisor must update shadow) | None (guest modifies own PT) |
| **Complexity**             | Very complex                         | Simple for hypervisor        |
| **Performance**            | Good with caching                    | Better overall               |

---

## I/O Virtualization

| Approach                 | Description                                                                                | Performance                              | Flexibility                      |
| ------------------------ | ------------------------------------------------------------------------------------------ | ---------------------------------------- | -------------------------------- |
| **Emulation**            | Hypervisor emulates a standard device (e.g., Intel E1000 NIC)                              | Poor — every I/O register access traps   | High — any guest OS driver works |
| **Paravirtual (virtio)** | Guest uses special virtio drivers that talk directly to hypervisor via shared ring buffers | Good — minimal traps                     | Medium — requires virtio drivers |
| **Passthrough (IOMMU)**  | Physical device assigned directly to one VM                                                | Near-native — no hypervisor in data path | Low — device tied to one VM      |
| **SR-IOV**               | Hardware creates virtual functions (VFs) — each VM gets its own VF                         | Near-native                              | Medium — limited VFs per device  |

```text
I/O Virtualization Spectrum:

Flexibility ◀──────────────────────────────────▶ Performance
  Emulation      Paravirtual     Passthrough     SR-IOV
  (slow)         (virtio)        (IOMMU)        (hardware VFs)
  │              │               │               │
  Any driver     Special driver  1 device/VM     N VFs per device
```

---

## Containers

Containers provide **OS-level virtualization** — they share the host kernel but isolate the user space.

### Linux Kernel Features

```text
Container = Namespaces + cgroups + Layered Filesystem

┌─────────────────────────────────────────────────────┐
│                    Container                         │
│  ┌─────────────────────────────────────────────┐    │
│  │  Application + Libraries + Config            │    │
│  └─────────────────────────────────────────────┘    │
│  ┌──────────────────┐  ┌──────────────────────┐    │
│  │   Namespaces      │  │      cgroups          │    │
│  │  (what you see)   │  │  (what you can use)   │    │
│  │  - PID namespace  │  │  - CPU limit: 2 cores │    │
│  │  - NET namespace  │  │  - MEM limit: 512 MB  │    │
│  │  - MNT namespace  │  │  - I/O limit: 100MB/s │    │
│  │  - UTS namespace  │  │  - PID limit: 100     │    │
│  │  - IPC namespace  │  │                       │    │
│  │  - USER namespace │  │                       │    │
│  └──────────────────┘  └──────────────────────┘    │
├─────────────────────────────────────────────────────┤
│              Host Linux Kernel (shared)              │
├─────────────────────────────────────────────────────┤
│                Physical Hardware                     │
└─────────────────────────────────────────────────────┘
```

### Docker: Container Platform

Docker provides tooling around Linux containers:

```text
Docker Architecture:

┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│   Container  │     │   Container  │     │   Container  │
│   (running)  │     │   (running)  │     │   (stopped)  │
└──────┬───────┘     └──────┬───────┘     └──────────────┘
       │                     │
       │   ┌─────────────────┘
       ▼   ▼
┌──────────────────┐
│   Docker Engine  │  (containerd + runc)
│   (daemon)       │
├──────────────────┤
│   Image Layer    │  Layered filesystem (OverlayFS)
│   ┌────────────┐ │
│   │  Layer 3   │ │  App code (read-write)
│   │  Layer 2   │ │  Dependencies (read-only)
│   │  Layer 1   │ │  Base OS (read-only, e.g., Ubuntu)
│   └────────────┘ │
└──────────────────┘
```

### Container vs VM Comparison

| Feature          | Container                  | Virtual Machine                         |
| ---------------- | -------------------------- | --------------------------------------- |
| **Startup time** | Milliseconds               | Seconds to minutes                      |
| **Image size**   | MB (10-500 MB typical)     | GB (1-50 GB typical)                    |
| **Overhead**     | ~1-3% CPU, minimal RAM     | 5-15% CPU, full OS RAM                  |
| **Kernel**       | Shared with host           | Separate per VM                         |
| **Isolation**    | Process-level (namespaces) | Hardware-level (hypervisor)             |
| **Security**     | Good (weaker than VM)      | Strong (hardware boundary)              |
| **Density**      | 100s-1000s per host        | 10s per host                            |
| **OS diversity** | Linux only (on Linux host) | Any OS                                  |
| **Portability**  | "Build once, run anywhere" | Machine image per platform              |
| **Use case**     | Microservices, CI/CD, dev  | Multi-tenant, legacy apps, different OS |

> [!TIP]
> The choice between containers and VMs isn't binary. Many production systems use **VMs for isolation** between tenants and **containers within VMs** for application packaging.

---

## Container Ecosystem

### OCI and Container Runtimes

The **Open Container Initiative (OCI)** defines standards for container images and runtimes:

| Component             | Description                 | Examples                              |
| --------------------- | --------------------------- | ------------------------------------- |
| **Image Spec**        | Format for container images | Docker images, OCI images             |
| **Runtime Spec**      | How to run a container      | runc (reference), crun, gVisor        |
| **Distribution Spec** | How to distribute images    | Docker Hub, GitHub Container Registry |

| Runtime             | Type            | Isolation                    | Use Case                |
| ------------------- | --------------- | ---------------------------- | ----------------------- |
| **runc**            | Standard        | Namespaces + cgroups         | Default Docker runtime  |
| **crun**            | Standard (fast) | Namespaces + cgroups         | Performance-critical    |
| **gVisor (runsc)**  | Sandboxed       | User-space kernel intercept  | Untrusted workloads     |
| **Kata Containers** | VM-based        | Lightweight VM per container | Strong isolation needed |

### Container Orchestration: Kubernetes

**Kubernetes** (K8s) manages containers at scale:

```text
Kubernetes Architecture:

┌──────────────────────────────────────────────────────────┐
│                    Control Plane                          │
│  ┌────────────┐  ┌────────────┐  ┌───────────────────┐  │
│  │ API Server │  │ Scheduler  │  │ Controller Manager│  │
│  └────────────┘  └────────────┘  └───────────────────┘  │
│  ┌─────────────────────┐                                  │
│  │       etcd           │  (distributed key-value store)  │
│  └─────────────────────┘                                  │
└──────────────────────────────────────────────────────────┘
              │                    │                    │
     ┌────────▼──────┐   ┌────────▼──────┐   ┌────────▼──────┐
     │   Worker Node │   │   Worker Node │   │   Worker Node │
     │  ┌──────────┐ │   │  ┌──────────┐ │   │  ┌──────────┐ │
     │  │ Pod      │ │   │  │ Pod      │ │   │  │ Pod      │ │
     │  │┌────┐┌──┐│ │   │  │┌────┐   │ │   │  │┌────┐   │ │
     │  ││Ctr1││C2││ │   │  ││Ctr1│   │ │   │  ││Ctr1│   │ │
     │  │└────┘└──┘│ │   │  │└────┘   │ │   │  │└────┘   │ │
     │  └──────────┘ │   │  └──────────┘ │   │  └──────────┘ │
     │  ┌──────────┐ │   │               │   │  ┌──────────┐ │
     │  │ kubelet  │ │   │  ┌──────────┐ │   │  │ kubelet  │ │
     │  └──────────┘ │   │  │ kubelet  │ │   │  └──────────┘ │
     └───────────────┘   │  └──────────┘ │   └───────────────┘
                         └───────────────┘
```

---

## Unikernels

A **unikernel** is a single-purpose, single-address-space machine image that packages an application with only the OS library components it needs.

```text
Traditional VM:              Unikernel:

┌──────────────┐             ┌──────────────┐
│ Application  │             │ Application  │
├──────────────┤             │    +         │
│ Libraries    │             │ OS Libraries │
├──────────────┤             │ (only needed │
│ Full OS      │             │  components) │
│ (scheduler,  │             └──────┬───────┘
│  drivers,    │                    │
│  shell,      │             ┌──────▼───────┐
│  utils, ...) │             │  Hypervisor  │
├──────────────┤             └──────────────┘
│ Hypervisor   │
└──────────────┘

Size: 1-50 GB                Size: 1-50 MB
Boot: seconds                Boot: milliseconds
Attack surface: HUGE         Attack surface: TINY
```

| Feature            | Unikernel                     | Traditional VM       | Container      |
| ------------------ | ----------------------------- | -------------------- | -------------- |
| **Size**           | 1-50 MB                       | 1-50 GB              | 10-500 MB      |
| **Boot time**      | 10-100 ms                     | 10-60 s              | 100-500 ms     |
| **Attack surface** | Minimal (no shell, no users)  | Large (full OS)      | Medium         |
| **Multi-process**  | No (single app)               | Yes                  | Yes            |
| **Examples**       | MirageOS, IncludeOS, Unikraft | Linux VM, Windows VM | Docker, Podman |

> [!NOTE]
> Unikernels are ideal for **single-purpose** workloads: DNS servers, load balancers, firewalls. They trade flexibility (no shell, no debugging tools) for extreme performance and minimal attack surface.

---

## Try It Yourself

**Exercise 1:** A cloud provider runs 10 VMs on a server with 128 GB RAM. Each VM runs a full Linux OS consuming 2 GB for the kernel and system services. If the provider switches to containers, how much RAM is saved?

:::details Solution
**With VMs:**

- Each VM's OS overhead: 2 GB × 10 VMs = **20 GB** wasted on duplicate OS copies
- Each VM has its own kernel, init system, system daemons, etc.

**With containers:**

- One shared kernel: ~2 GB total (not duplicated)
- Savings: 20 GB - 2 GB = **18 GB** freed for actual application workloads

That's 18 GB of RAM recovered — enough to run **significantly more** application instances. In practice, each container's base image also shares layers (OverlayFS), further reducing memory usage through copy-on-write.
:::

**Exercise 2:** An x86 CPU without VT-x encounters a `POPF` instruction in guest code. This instruction is **sensitive** (it can modify the interrupt flag) but **not privileged** (it doesn't trap in user mode). How does a hypervisor handle this? What are two solutions?

:::details Solution
Since `POPF` is sensitive but not privileged, it violates the Popek-Goldberg requirement. In user mode, `POPF` silently ignores the interrupt flag bits instead of trapping.

**Solution 1: Binary Translation**
The hypervisor scans guest code before execution and replaces `POPF` with a sequence that:

1. Traps to the hypervisor
2. Hypervisor emulates the full `POPF` behavior
3. Returns to guest
   This is what early VMware did.

**Solution 2: Hardware-Assisted Virtualization (VT-x)**
With VT-x, the CPU adds a new execution mode (VMX non-root) where ALL sensitive instructions trap to the hypervisor, regardless of whether they're privileged. This eliminates the need for binary translation entirely.
:::

**Exercise 3:** Compare the isolation provided by Docker containers vs gVisor containers. Why would you choose gVisor for running untrusted user code?

:::details Solution
**Docker (runc):**

- Uses Linux namespaces and cgroups for isolation
- Container processes make system calls **directly to the host kernel**
- If a kernel vulnerability is exploited, the attacker breaks out of the container
- ~330+ system calls available to container by default

**gVisor (runsc):**

- Interposes a **user-space kernel** (called Sentry) between the container and the host kernel
- Container system calls go to Sentry, which re-implements ~200 Linux syscalls in Go
- Sentry itself uses only ~20 host system calls (via seccomp filtering)
- Even if the application exploits a vulnerability in Sentry, it still can't access the host kernel directly

**Why gVisor for untrusted code:**

- Dramatically reduced attack surface: ~20 host syscalls vs ~330
- Kernel vulnerabilities in Linux don't directly apply to Sentry
- Memory-safe implementation in Go reduces memory corruption bugs
- Trade-off: 2-5× performance overhead for system-call-heavy workloads
  :::

---

## Key Takeaways

- **Virtualization** runs multiple OS instances on one physical machine; **Type 1 hypervisors** (bare-metal) offer better performance while **Type 2** (hosted) offer convenience
- **Full virtualization** requires no guest OS changes; **paravirtualization** modifies guests for better performance; **hardware-assisted** (VT-x/AMD-V) provides near-native speed with unmodified guests
- **CPU virtualization** uses trap-and-emulate; the Popek-Goldberg theorem defines when this works classically; x86 required VT-x to become properly virtualizable
- **Memory virtualization** adds an extra translation layer (GVA→GPA→HPA); **EPT/NPT** handles this in hardware, eliminating complex shadow page tables
- **I/O virtualization** ranges from full emulation (slow, compatible) to SR-IOV passthrough (fast, limited) — **virtio** provides a practical middle ground
- **Containers** share the host kernel using namespaces (isolation) and cgroups (resource limits), providing 100× better density than VMs with millisecond startup
- **Docker** packages containers with layered filesystems; **Kubernetes** orchestrates containers at scale across clusters
- **Unikernels** compile applications with only needed OS components, achieving sub-megabyte images and millisecond boot times at the cost of flexibility
