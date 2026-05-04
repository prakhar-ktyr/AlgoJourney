---
title: "Virtualization Deep Dive"
---

# Virtualization Deep Dive

In this lesson, you will learn about **virtualization** — the foundational technology that makes cloud computing possible. Virtualization allows you to run multiple operating systems and applications on a single physical machine, maximizing hardware utilization.

Think of virtualization like dividing a large apartment into multiple smaller units — each tenant thinks they have their own place, but they all share the same building.

---

## What Is Virtualization?

Virtualization is the process of creating a **virtual (software-based) version** of something — a server, storage device, network, or even an operating system.

```
Without Virtualization:           With Virtualization:

┌────────────┐                   ┌────────────────────────┐
│   App A    │                   │  VM1    VM2    VM3     │
│            │                   │ ┌────┐ ┌────┐ ┌────┐  │
│    OS      │                   │ │App │ │App │ │App │  │
│            │                   │ │ OS │ │ OS │ │ OS │  │
│  Hardware  │                   │ └────┘ └────┘ └────┘  │
└────────────┘                   │     Hypervisor         │
1 server = 1 app                 │     Hardware           │
(~15% utilization)               └────────────────────────┘
                                 1 server = many apps
                                 (~70-80% utilization)
```

**Key benefits of virtualization:**

| Benefit | Description |
|---------|-------------|
| **Server Consolidation** | Run multiple workloads on fewer physical servers |
| **Cost Reduction** | Less hardware, power, cooling, and space needed |
| **Isolation** | Each VM is independent — one crashing won't affect others |
| **Portability** | VMs can be moved between physical hosts |
| **Fast Provisioning** | Create a new server in minutes instead of weeks |
| **Disaster Recovery** | Easier backup, snapshot, and restore |

---

## Types of Virtualization

Virtualization is not limited to servers. There are several types, each addressing different infrastructure needs.

### 1. Hardware / Server Virtualization

The most common type — divides a physical server into multiple **virtual machines (VMs)**, each running its own operating system.

```
┌──────────────────────────────────────┐
│            Physical Server           │
│  ┌──────────┐ ┌──────────┐ ┌──────┐ │
│  │   VM 1   │ │   VM 2   │ │ VM 3 │ │
│  │ Windows  │ │  Ubuntu  │ │CentOS│ │
│  │ Server   │ │  22.04   │ │  9   │ │
│  └──────────┘ └──────────┘ └──────┘ │
│          Hypervisor Layer            │
│          Physical Hardware           │
│   (CPU, RAM, Storage, Network)       │
└──────────────────────────────────────┘
```

**Use cases:** Data centers, cloud providers (EC2, Azure VMs, GCE).

---

### 2. OS-Level Virtualization (Containers)

Instead of virtualizing the hardware, containers virtualize the **operating system**. Multiple containers share the host OS kernel.

```
Server Virtualization:         OS-Level (Containers):

┌──────┐ ┌──────┐ ┌──────┐   ┌──────┐ ┌──────┐ ┌──────┐
│ App  │ │ App  │ │ App  │   │ App  │ │ App  │ │ App  │
│Guest │ │Guest │ │Guest │   │ Libs │ │ Libs │ │ Libs │
│  OS  │ │  OS  │ │  OS  │   └──┬───┘ └──┬───┘ └──┬───┘
└──┬───┘ └──┬───┘ └──┬───┘      │        │        │
   └────────┼────────┘       ┌──▼────────▼────────▼──┐
     ┌──────▼──────┐         │    Container Runtime   │
     │ Hypervisor  │         │      (Docker, etc.)    │
     └──────┬──────┘         └───────────┬────────────┘
     ┌──────▼──────┐         ┌───────────▼────────────┐
     │  Host OS    │         │        Host OS          │
     └──────┬──────┘         └───────────┬────────────┘
     ┌──────▼──────┐         ┌───────────▼────────────┐
     │  Hardware   │         │        Hardware         │
     └─────────────┘         └────────────────────────┘
```

| Aspect | VMs | Containers |
|--------|-----|------------|
| **Size** | Gigabytes | Megabytes |
| **Startup** | Minutes | Seconds |
| **Isolation** | Strong (separate OS) | Process-level (shared kernel) |
| **Overhead** | Higher (full OS per VM) | Lower (shared OS kernel) |
| **Portability** | Hardware-dependent | Highly portable |
| **Density** | ~10-20 per host | ~100-1000 per host |

---

### 3. Network Virtualization

Abstracts physical network resources into **virtual networks** that can be managed independently.

```
Physical Network:               Virtual Networks:

 ┌─────┐  ┌─────┐              ┌─────────────────┐
 │ SW1 │──│ SW2 │              │  VLAN 10 (Web)  │
 └──┬──┘  └──┬──┘              ├─────────────────┤
    │        │                 │  VLAN 20 (App)  │
 ┌──┴──┐  ┌──┴──┐              ├─────────────────┤
 │ SW3 │──│ SW4 │              │  VLAN 30 (DB)   │
 └─────┘  └─────┘              └─────────────────┘
 All on same hardware           Logically separated
```

**Technologies:**

- **VLANs** — Segment a physical network into virtual LANs
- **VPNs** — Create encrypted tunnels over public networks
- **SDN (Software-Defined Networking)** — Centralize network control in software
- **VPCs (Virtual Private Clouds)** — Isolated networks in the cloud
- **NFV (Network Functions Virtualization)** — Run firewalls, load balancers as software

---

### 4. Storage Virtualization

Pools physical storage from multiple devices into a **single logical storage unit**.

```
Physical Storage:              Virtualized Storage:

┌──────┐ ┌──────┐ ┌──────┐    ┌──────────────────────┐
│ SAN  │ │ NAS  │ │ DAS  │    │                      │
│ 10TB │ │ 5TB  │ │ 2TB  │ →  │   Virtual Storage    │
└──────┘ └──────┘ └──────┘    │      Pool: 17TB      │
                               │                      │
3 separate systems             └──────────────────────┘
                               1 unified pool
```

**Examples:**

| Technology | Description |
|-----------|-------------|
| **Amazon EBS** | Block storage volumes for EC2 instances |
| **Amazon S3** | Object storage (virtually unlimited) |
| **VMware vSAN** | Software-defined storage across server disks |
| **Ceph** | Open-source distributed storage system |
| **Storage Spaces Direct** | Microsoft's software-defined storage |

---

### 5. Desktop Virtualization (VDI)

Hosts desktop environments on a **central server** and delivers them to thin clients or remote users.

```
┌─────────────────────────────────────┐
│          Data Center                │
│  ┌─────────────────────────────┐    │
│  │    Virtual Desktop Pool     │    │
│  │  ┌─────┐ ┌─────┐ ┌─────┐   │    │
│  │  │ D1  │ │ D2  │ │ D3  │   │    │
│  │  └─────┘ └─────┘ └─────┘   │    │
│  └─────────────────────────────┘    │
└──────────────┬──────────────────────┘
               │ Network
    ┌──────────┼──────────┐
    ▼          ▼          ▼
┌──────┐  ┌──────┐  ┌──────┐
│Laptop│  │Tablet│  │ Thin │
│      │  │      │  │Client│
└──────┘  └──────┘  └──────┘
```

**Solutions:** Citrix Virtual Apps, VMware Horizon, Amazon WorkSpaces, Azure Virtual Desktop.

**Benefits:** Centralized management, data stays in the data center, access from any device.

---

## Hypervisors: The Virtualization Engine

A **hypervisor** (also called a Virtual Machine Monitor or VMM) is the software layer that creates and manages virtual machines.

### Type 1: Bare-Metal Hypervisors

Runs **directly on the physical hardware** — no host operating system needed.

```
┌──────────┐  ┌──────────┐  ┌──────────┐
│   VM 1   │  │   VM 2   │  │   VM 3   │
│ (Guest   │  │ (Guest   │  │ (Guest   │
│   OS)    │  │   OS)    │  │   OS)    │
└────┬─────┘  └────┬─────┘  └────┬─────┘
     └──────────────┼─────────────┘
              ┌─────▼─────┐
              │ Type 1    │
              │Hypervisor │  ← Runs ON the hardware
              └─────┬─────┘
              ┌─────▼─────┐
              │ Physical  │
              │ Hardware  │
              └───────────┘
```

| Hypervisor | Vendor | Key Features |
|-----------|--------|-------------|
| **VMware ESXi** | VMware | Industry standard, enterprise features, vSphere ecosystem |
| **Microsoft Hyper-V** | Microsoft | Built into Windows Server, Azure integration |
| **KVM** | Linux/Red Hat | Open-source, built into Linux kernel, basis for many clouds |
| **Xen** | Linux Foundation | Powers AWS EC2 (older instances), Citrix Hypervisor |

**Characteristics:**

- **Better performance** — no host OS overhead
- **More secure** — smaller attack surface
- **Used in production** — data centers and cloud providers
- **Requires dedicated hardware**

---

### Type 2: Hosted Hypervisors

Runs **on top of a host operating system**, like any other application.

```
┌──────────┐  ┌──────────┐
│   VM 1   │  │   VM 2   │
│ (Guest   │  │ (Guest   │
│   OS)    │  │   OS)    │
└────┬─────┘  └────┬─────┘
     └──────┬──────┘
      ┌─────▼─────┐
      │  Type 2   │
      │Hypervisor │  ← Runs AS AN APP on the host OS
      └─────┬─────┘
      ┌─────▼─────┐
      │  Host OS  │  ← Windows, macOS, Linux
      └─────┬─────┘
      ┌─────▼─────┐
      │ Physical  │
      │ Hardware  │
      └───────────┘
```

| Hypervisor | Platform | Key Features |
|-----------|----------|-------------|
| **Oracle VirtualBox** | Cross-platform | Free, open-source, great for learning |
| **VMware Workstation** | Windows/Linux | Professional features, snapshots |
| **VMware Fusion** | macOS | Run Windows/Linux on Mac |
| **Parallels Desktop** | macOS | Optimized for Mac, excellent integration |
| **QEMU** | Cross-platform | Open-source, CPU emulation support |

**Characteristics:**

- **Easier to set up** — install like any app
- **More overhead** — host OS consumes resources
- **Great for development** — test on different OS without dual boot
- **Not for production** — performance penalty

---

### Type 1 vs Type 2 Comparison

| Feature | Type 1 (Bare-Metal) | Type 2 (Hosted) |
|---------|-------------------|-----------------|
| **Performance** | Near-native | Moderate overhead |
| **Security** | Higher (smaller attack surface) | Lower (host OS vulnerabilities) |
| **Use case** | Production, data centers | Development, testing |
| **Management** | Remote management tools | Desktop GUI |
| **Examples** | ESXi, KVM, Hyper-V | VirtualBox, VMware Workstation |
| **Cost** | Often commercial licenses | Free options available |
| **Setup** | Dedicated server required | Any desktop/laptop |

---

## How Virtual Machines Work

Understanding the three pillars of VM execution: CPU, memory, and I/O virtualization.

### CPU Virtualization

The hypervisor must share the physical CPU among multiple VMs while maintaining isolation.

```
Physical CPU Cores:     ┌──────┬──────┬──────┬──────┐
                        │Core 0│Core 1│Core 2│Core 3│
                        └──┬───┴──┬───┴──┬───┴──┬───┘
                           │      │      │      │
Hypervisor Scheduling:     │      │      │      │
                        ┌──▼──┐┌──▼──┐┌──▼──┐┌──▼──┐
                        │vCPU0││vCPU1││vCPU0││vCPU1│
                        │ VM1 ││ VM1 ││ VM2 ││ VM2 │
                        └─────┘└─────┘└─────┘└─────┘
```

**Techniques:**

| Technique | Description |
|-----------|-------------|
| **Full Virtualization** | Guest OS runs unmodified; hypervisor translates all instructions |
| **Para-Virtualization** | Guest OS is modified to communicate with hypervisor directly (faster) |
| **Hardware-Assisted** | CPU has built-in support (Intel VT-x, AMD-V); best performance |

```bash
# Check if your CPU supports hardware virtualization (Linux)
grep -E 'vmx|svm' /proc/cpuinfo

# vmx = Intel VT-x
# svm = AMD-V
```

---

### Memory Virtualization

Each VM believes it has its own contiguous physical memory, but the hypervisor maps it to actual RAM.

```
VM 1 sees:              VM 2 sees:
┌──────────────┐        ┌──────────────┐
│ 0x0000-0xFFFF│        │ 0x0000-0xFFFF│
│   "4 GB RAM" │        │   "8 GB RAM" │
└──────┬───────┘        └──────┬───────┘
       │                       │
       └──────────┬────────────┘
                  ▼
      ┌──────────────────────┐
      │    Hypervisor MMU    │  ← Maps virtual → physical
      │  (Memory Management)│
      └──────────┬───────────┘
                 ▼
      ┌──────────────────────┐
      │  Physical RAM: 32 GB │
      │  0x00000 - 0x7FFFF   │
      └──────────────────────┘
```

**Key concepts:**

- **Memory Overcommitment** — Allocate more virtual memory than physical RAM exists
- **Ballooning** — Hypervisor reclaims idle memory from VMs
- **Transparent Page Sharing (TPS)** — Deduplicate identical memory pages across VMs
- **Memory Compression** — Compress infrequently used pages instead of swapping to disk

---

### I/O Virtualization

Virtualizing access to disks, network cards, and other I/O devices.

```
┌──────┐  ┌──────┐  ┌──────┐
│ VM 1 │  │ VM 2 │  │ VM 3 │
│vNIC  │  │vNIC  │  │vNIC  │
│vDisk │  │vDisk │  │vDisk │
└──┬───┘  └──┬───┘  └──┬───┘
   └─────────┼─────────┘
       ┌─────▼──────┐
       │ Hypervisor │  ← Multiplexes I/O access
       │  I/O Stack │
       └─────┬──────┘
       ┌─────▼──────┐
       │ Physical   │
       │ NIC + Disk │
       └────────────┘
```

**I/O virtualization methods:**

| Method | Performance | Compatibility |
|--------|-------------|--------------|
| **Emulated** | Slow — software emulates hardware | Works with any guest OS |
| **Paravirtual (virtio)** | Fast — guest uses optimized drivers | Requires virtio drivers |
| **Passthrough (SR-IOV)** | Near-native — direct hardware access | Limited sharing ability |

```bash
# Check if SR-IOV is supported on a network interface (Linux)
lspci -v | grep -i "single root"

# List virtio devices in a KVM guest
lspci | grep -i virtio
```

---

## VM Lifecycle Management

Understanding how VMs move through different states:

```
                    ┌──────────┐
           ┌───────│ Template │
           │       └──────────┘
           ▼
     ┌───────────┐     ┌───────────┐
     │  Created  │────→│  Running  │◄──────┐
     └───────────┘     └─────┬─────┘       │
                             │             │
                    ┌────────┼────────┐    │
                    ▼        ▼        ▼    │
              ┌────────┐┌────────┐┌──────┐ │
              │Paused  ││Saved  ││Stopped│─┘
              │        ││State  ││       │
              └────┬───┘└───┬───┘└───┬───┘
                   │        │        │
                   └────────┼────────┘
                            ▼
                      ┌──────────┐
                      │ Deleted  │
                      └──────────┘
```

**Common operations:**

```bash
# VirtualBox CLI examples

# Create a VM
VBoxManage createvm --name "WebServer" --ostype Ubuntu_64 --register

# Configure resources
VBoxManage modifyvm "WebServer" --memory 4096 --cpus 2

# Start a VM
VBoxManage startvm "WebServer" --type headless

# Take a snapshot
VBoxManage snapshot "WebServer" take "before-update"

# Pause / Resume
VBoxManage controlvm "WebServer" pause
VBoxManage controlvm "WebServer" resume

# Shut down gracefully
VBoxManage controlvm "WebServer" acpipowerbutton

# Restore a snapshot
VBoxManage snapshot "WebServer" restore "before-update"
```

**Snapshots** capture the entire state of a VM at a point in time:

| Snapshot Type | What It Captures |
|--------------|-----------------|
| **Disk snapshot** | State of all virtual disks |
| **Memory snapshot** | Contents of RAM (running state) |
| **Full snapshot** | Disk + memory + VM configuration |

---

## Live Migration

Live migration moves a **running VM from one physical host to another** with zero or near-zero downtime.

```
Step 1: Pre-copy memory        Step 2: Final sync

Host A              Host B     Host A              Host B
┌──────┐           ┌──────┐   ┌──────┐           ┌──────┐
│ VM   │ ────────→ │ VM   │   │ VM   │ ──final─→ │ VM   │
│(runs)│  memory   │(copy)│   │(pause│  pages    │(runs)│
└──────┘  pages    └──────┘   └──────┘           └──────┘
                               ~milliseconds of downtime
```

**How it works (pre-copy migration):**

1. **Initial Phase** — Copy all memory pages to the destination host
2. **Iterative Phase** — Re-copy pages that changed during the transfer (dirty pages)
3. **Stop-and-Copy** — Briefly pause the VM, copy final dirty pages
4. **Activation** — Resume the VM on the destination host
5. **Cleanup** — Release resources on the source host

**Use cases:**

- **Hardware maintenance** — Move VMs off a server before upgrading it
- **Load balancing** — Redistribute VMs across hosts evenly
- **Power management** — Consolidate VMs to fewer hosts during low-demand periods
- **Disaster avoidance** — Move VMs away from a host showing early failure signs

```bash
# KVM/libvirt live migration example
virsh migrate --live --persistent \
  myvm \
  qemu+ssh://destination-host/system \
  --verbose
```

---

## VMs vs Containers: A Detailed Comparison

Both VMs and containers provide isolation, but at different levels of the stack.

```
Virtual Machines:                   Containers:

┌──────┐ ┌──────┐ ┌──────┐        ┌──────┐ ┌──────┐ ┌──────┐
│ App1 │ │ App2 │ │ App3 │        │ App1 │ │ App2 │ │ App3 │
│      │ │      │ │      │        │ Libs │ │ Libs │ │ Libs │
│Guest │ │Guest │ │Guest │        └──┬───┘ └──┬───┘ └──┬───┘
│ OS   │ │ OS   │ │ OS   │           │        │        │
│(2GB) │ │(2GB) │ │(2GB) │        ┌──▼────────▼────────▼──┐
└──┬───┘ └──┬───┘ └──┬───┘        │   Container Runtime   │
   └────────┼────────┘            └───────────┬────────────┘
     ┌──────▼──────┐              ┌───────────▼────────────┐
     │ Hypervisor  │              │      Host OS Kernel    │
     └──────┬──────┘              └───────────┬────────────┘
     ┌──────▼──────┐              ┌───────────▼────────────┐
     │  Host OS    │              │        Hardware        │
     └──────┬──────┘              └────────────────────────┘
     ┌──────▼──────┐
     │  Hardware   │
     └─────────────┘

 Total overhead: ~6 GB           Total overhead: ~100 MB
 (3 × 2 GB guest OS)            (shared kernel)
```

| Feature | Virtual Machines | Containers |
|---------|-----------------|------------|
| **Isolation Level** | Hardware-level (strong) | Process-level (moderate) |
| **Boot Time** | Minutes | Seconds |
| **Image Size** | Gigabytes | Megabytes |
| **Resource Overhead** | High (full OS per VM) | Low (shared kernel) |
| **Density** | 10-20 per host | 100-1000+ per host |
| **OS Support** | Any OS (Linux, Windows, etc.) | Same as host kernel |
| **Security Isolation** | Stronger | Weaker (kernel shared) |
| **Portability** | Good (with hypervisor) | Excellent (any container runtime) |
| **Use Case** | Different OS, strong isolation | Microservices, CI/CD |
| **Management** | vSphere, Hyper-V Manager | Kubernetes, Docker Swarm |

**When to use VMs:**

- Running **different operating systems** (Windows on Linux host)
- Need **strong security isolation** (multi-tenant environments)
- Running **legacy applications** that need full OS environments
- **Compliance requirements** that mandate hardware-level isolation

**When to use containers:**

- **Microservices** architecture
- **CI/CD pipelines** — fast build and deploy
- **Cloud-native** applications
- Maximizing **resource density**

**Best of both worlds:** Many organizations run containers inside VMs for combined benefits:

```
┌─────────────────────────────────────┐
│              VM (Security)          │
│  ┌──────┐  ┌──────┐  ┌──────┐     │
│  │Cont 1│  │Cont 2│  │Cont 3│     │
│  │      │  │      │  │      │     │
│  └──────┘  └──────┘  └──────┘     │
│       Container Runtime            │
│         Guest OS                   │
└─────────────────────────────────────┘
```

---

## Performance Overhead

Virtualization introduces overhead. Understanding where helps you optimize.

### Overhead Sources and Mitigation

| Source | Overhead | Mitigation |
|--------|----------|------------|
| **CPU** | 2-5% with hardware assist | Enable VT-x/AMD-V, use paravirtualization |
| **Memory** | Hypervisor page table overhead | Use large pages (2 MB / 1 GB), TPS |
| **Disk I/O** | Translation layer latency | Use virtio drivers, SSD backing, SR-IOV |
| **Network I/O** | Virtual switch processing | SR-IOV passthrough, DPDK |
| **Context switching** | VM exit/entry costs | Reduce VM exits, use posted interrupts |

### Performance Comparison

```
Relative Performance (higher is better):

Bare Metal:    ████████████████████████████████████ 100%
Type 1 VM:     ██████████████████████████████████   95%
Container:     ███████████████████████████████████  98%
Type 2 VM:     ████████████████████████████████     88%
Emulated:      ████████████████████                 50%
```

```bash
# Benchmark disk I/O in a VM (Linux)
# Sequential write test
dd if=/dev/zero of=/tmp/testfile bs=1M count=1024 conv=fdatasync

# Random I/O test with fio
fio --name=random-rw --ioengine=libaio --iodepth=16 \
    --rw=randrw --bs=4k --size=1G --numjobs=4 \
    --runtime=60 --group_reporting
```

---

## Nested Virtualization

Nested virtualization is running a **hypervisor inside a virtual machine** — a VM within a VM.

```
┌─────────────────────────────────────────────┐
│              Physical Host                   │
│  ┌───────────────────────────────────────┐   │
│  │           L0 Hypervisor (KVM)         │   │
│  │  ┌─────────────────────────────────┐  │   │
│  │  │        L1 VM (Guest)            │  │   │
│  │  │  ┌───────────────────────────┐  │  │   │
│  │  │  │   L1 Hypervisor (KVM)    │  │  │   │
│  │  │  │  ┌─────────┐ ┌─────────┐ │  │  │   │
│  │  │  │  │  L2 VM  │ │  L2 VM  │ │  │  │   │
│  │  │  │  │  (Nest) │ │  (Nest) │ │  │  │   │
│  │  │  │  └─────────┘ └─────────┘ │  │  │   │
│  │  │  └───────────────────────────┘  │  │   │
│  │  └─────────────────────────────────┘  │   │
│  └───────────────────────────────────────┘   │
└─────────────────────────────────────────────┘
```

**Use cases:**

- **Training and education** — Practice setting up hypervisors without dedicated hardware
- **CI/CD testing** — Test infrastructure code that deploys VMs
- **Cloud development** — Develop cloud features on your laptop
- **Hypervisor migration testing** — Test migrating between hypervisor platforms

```bash
# Enable nested virtualization on KVM (Linux)
# Check current status
cat /sys/module/kvm_intel/parameters/nested
# or
cat /sys/module/kvm_amd/parameters/nested

# Enable it (Intel)
sudo modprobe -r kvm_intel
sudo modprobe kvm_intel nested=1

# Make it persistent
echo "options kvm_intel nested=1" | sudo tee /etc/modprobe.d/kvm.conf
```

**Cloud provider support:**

| Provider | Nested Virtualization |
|----------|----------------------|
| **AWS** | Supported on metal instances (.metal) |
| **Azure** | Supported on Dv3/Ev3 and newer |
| **GCP** | Supported on all machine types |

---

## GPU Virtualization

Modern workloads like AI/ML, video rendering, and scientific computing require GPU access from virtual machines.

### GPU Virtualization Methods

| Method | Description | Performance | Sharing |
|--------|-------------|-------------|---------|
| **GPU Passthrough** | Entire GPU dedicated to one VM | Near-native | No sharing |
| **vGPU (Virtual GPU)** | GPU partitioned into virtual units | 90-95% | Multiple VMs |
| **API Remoting** | Intercept GPU API calls, execute remotely | Variable | Multiple VMs |
| **SR-IOV for GPU** | Hardware-based GPU partitioning | Near-native | Multiple VMs |

```
GPU Passthrough:          vGPU (Partitioned):

┌──────┐                 ┌──────┐ ┌──────┐ ┌──────┐
│ VM 1 │                 │ VM 1 │ │ VM 2 │ │ VM 3 │
│      │                 │vGPU-1│ │vGPU-2│ │vGPU-3│
└──┬───┘                 └──┬───┘ └──┬───┘ └──┬───┘
   │                        └────────┼────────┘
┌──▼────────────┐        ┌──────────▼──────────┐
│  Full GPU     │        │   GPU + vGPU Manager │
│  (Dedicated)  │        │   (NVIDIA GRID, etc.)│
└───────────────┘        └─────────────────────┘
```

**NVIDIA GPU virtualization products:**

| Product | Use Case |
|---------|----------|
| **NVIDIA vGPU** | Virtual desktops with GPU acceleration |
| **NVIDIA A100 MIG** | Partition a single GPU into up to 7 instances |
| **NVIDIA GRID** | Graphics-intensive virtual workstations |

```bash
# Check GPU availability in a VM
nvidia-smi

# Example output showing vGPU:
# +-----------------------------------------------------------------------------+
# | NVIDIA-SMI 535.86       Driver Version: 535.86       CUDA Version: 12.2     |
# |-------------------------------+----------------------+----------------------+
# | GPU  Name        Persistence-M| Bus-Id        Disp.A | Volatile Uncorr. ECC |
# | Fan  Temp  Perf  Pwr:Usage/Cap|         Memory-Usage | GPU-Util  Compute M. |
# |   0  GRID V100-8Q        On   | 00000000:02:02.0 Off |                  N/A |
# | N/A   N/A    P8    N/A /  N/A |    512MiB /  8192MiB |      0%      Default |
# +-------------------------------+----------------------+----------------------+
```

---

## Practical: Creating a VM with VirtualBox

Here is a step-by-step process for creating a virtual machine:

```bash
# Step 1: Install VirtualBox (macOS)
brew install --cask virtualbox

# Step 2: Download an Ubuntu ISO
curl -LO https://releases.ubuntu.com/22.04/ubuntu-22.04-live-server-amd64.iso

# Step 3: Create and configure a VM via CLI
VBoxManage createvm --name "UbuntuServer" \
  --ostype "Ubuntu_64" \
  --register

# Allocate 2 CPUs and 4 GB RAM
VBoxManage modifyvm "UbuntuServer" \
  --cpus 2 \
  --memory 4096 \
  --vram 16

# Create a 20 GB virtual hard disk
VBoxManage createmedium disk \
  --filename ~/VMs/UbuntuServer.vdi \
  --size 20480 \
  --format VDI

# Add a SATA controller and attach the disk
VBoxManage storagectl "UbuntuServer" --name "SATA" --add sata
VBoxManage storageattach "UbuntuServer" \
  --storagectl "SATA" --port 0 --device 0 \
  --type hdd --medium ~/VMs/UbuntuServer.vdi

# Attach the ISO for installation
VBoxManage storagectl "UbuntuServer" --name "IDE" --add ide
VBoxManage storageattach "UbuntuServer" \
  --storagectl "IDE" --port 0 --device 0 \
  --type dvddrive --medium ubuntu-22.04-live-server-amd64.iso

# Configure networking (NAT with port forwarding for SSH)
VBoxManage modifyvm "UbuntuServer" --nic1 nat
VBoxManage modifyvm "UbuntuServer" \
  --natpf1 "ssh,tcp,,2222,,22"

# Step 4: Start the VM
VBoxManage startvm "UbuntuServer" --type headless

# Step 5: SSH into the VM after installation
ssh -p 2222 user@localhost
```

---

## Exercises

### Exercise 1: Hypervisor Classification

Classify each hypervisor as Type 1 (bare-metal) or Type 2 (hosted):

| Hypervisor | Type 1 or Type 2? |
|-----------|-------------------|
| VMware ESXi | ? |
| Oracle VirtualBox | ? |
| KVM | ? |
| VMware Workstation | ? |
| Microsoft Hyper-V | ? |
| Parallels Desktop | ? |
| Xen | ? |

<details>
<summary>View Answers</summary>

| Hypervisor | Type |
|-----------|------|
| VMware ESXi | **Type 1** — Bare-metal, runs directly on hardware |
| Oracle VirtualBox | **Type 2** — Runs on a host OS |
| KVM | **Type 1** — Built into the Linux kernel (though Linux runs, KVM turns it into a hypervisor) |
| VMware Workstation | **Type 2** — Runs as an application on Windows/Linux |
| Microsoft Hyper-V | **Type 1** — Bare-metal (installs beneath the Windows partition) |
| Parallels Desktop | **Type 2** — Runs on macOS |
| Xen | **Type 1** — Bare-metal, the host OS runs as Dom0 |

</details>

---

### Exercise 2: VM vs Container Decision

For each scenario, decide whether you would use a **VM** or a **Container**:

1. Running a Windows application on a Linux server
2. Deploying 50 instances of a Node.js microservice
3. Isolating workloads for different customers with strict security requirements
4. Running CI/CD build and test pipelines
5. Hosting a legacy Oracle database that requires a specific RHEL version

<details>
<summary>View Answers</summary>

1. **VM** — Containers require the same OS kernel; you need a Windows VM
2. **Container** — Lightweight, fast to start, easy to scale horizontally
3. **VM** — Stronger isolation (separate kernels) for multi-tenant security
4. **Container** — Fast startup, disposable, consistent environments
5. **VM** — Specific OS requirement, legacy application compatibility

</details>

---

### Exercise 3: Memory Calculation

A physical server has **64 GB of RAM**. You want to run the following VMs:

| VM | OS Overhead | Application Memory | Total |
|----|------------|-------------------|-------|
| Web Server 1 | 1 GB | 3 GB | 4 GB |
| Web Server 2 | 1 GB | 3 GB | 4 GB |
| App Server | 2 GB | 6 GB | 8 GB |
| Database | 2 GB | 14 GB | 16 GB |
| Monitoring | 1 GB | 1 GB | 2 GB |

Calculate:
1. Total memory required for all VMs
2. Memory remaining for the hypervisor and overhead
3. Can you add another 8 GB app server? What feature might help?

<details>
<summary>View Answers</summary>

1. Total VM memory: 4 + 4 + 8 + 16 + 2 = **34 GB**
2. Remaining: 64 - 34 = **30 GB** (hypervisor typically needs 2-4 GB, leaving ~26-28 GB)
3. Yes, you have 30 GB remaining, so an 8 GB VM easily fits (22 GB still free).
   If you were running low on memory, **memory overcommitment** and **ballooning** could help by reclaiming idle memory from VMs that allocated but aren't actively using it.

</details>

---

### Exercise 4: Matching Virtualization Types

Match each technology to its virtualization type:

| Technology | Options |
|-----------|---------|
| A. Docker | Hardware, OS-Level, Network, Storage, Desktop |
| B. VMware ESXi | Hardware, OS-Level, Network, Storage, Desktop |
| C. Amazon EBS | Hardware, OS-Level, Network, Storage, Desktop |
| D. Citrix Virtual Apps | Hardware, OS-Level, Network, Storage, Desktop |
| E. VPC | Hardware, OS-Level, Network, Storage, Desktop |

<details>
<summary>View Answers</summary>

| Technology | Type |
|-----------|------|
| A. Docker | **OS-Level Virtualization** (containers share host kernel) |
| B. VMware ESXi | **Hardware/Server Virtualization** (bare-metal hypervisor) |
| C. Amazon EBS | **Storage Virtualization** (virtual block storage) |
| D. Citrix Virtual Apps | **Desktop Virtualization** (VDI solution) |
| E. VPC | **Network Virtualization** (virtual private cloud network) |

</details>

---

## Key Takeaways

| Concept | Summary |
|---------|---------|
| **Virtualization** | Creating virtual versions of physical resources |
| **Server Virtualization** | Multiple VMs on one physical server |
| **OS-Level (Containers)** | Lightweight isolation sharing the host kernel |
| **Network Virtualization** | Virtual networks (VLANs, VPCs, SDN) |
| **Storage Virtualization** | Pooling storage into logical units |
| **Desktop Virtualization** | Centralized desktops delivered remotely |
| **Type 1 Hypervisor** | Bare-metal — runs on hardware (ESXi, KVM, Hyper-V) |
| **Type 2 Hypervisor** | Hosted — runs on an OS (VirtualBox, VMware Workstation) |
| **CPU Virtualization** | Hardware-assisted (VT-x/AMD-V) for best performance |
| **Memory Virtualization** | Overcommitment, ballooning, page sharing |
| **I/O Virtualization** | Emulated → paravirtual (virtio) → passthrough (SR-IOV) |
| **Live Migration** | Move running VMs between hosts with near-zero downtime |
| **VMs vs Containers** | VMs = strong isolation; Containers = lightweight and fast |
| **Nested Virtualization** | Running a hypervisor inside a VM |
| **GPU Virtualization** | Passthrough, vGPU, or MIG for GPU workloads |

---

In the next lesson, you will explore **Containers and Docker**, building on the virtualization concepts you learned here to understand how lightweight containerization has transformed application deployment.
