---
title: Access Control & Sandboxing
section: "Security & Protection"
---

# Access Control & Sandboxing

Having established _who_ a user is (authentication) and _what_ they are allowed to do (protection), the operating system must enforce these policies through **access control models**. Different models provide different trade-offs between flexibility, security, and complexity. Beyond access control, **sandboxing** provides an additional layer of defense by isolating untrusted code so that even if it is compromised, the damage is contained. This lesson covers DAC, MAC, RBAC, ABAC, SELinux, AppArmor, and modern sandboxing technologies.

---

## Access Control Models Overview

An **access control model** defines the rules for how subjects (users, processes) access objects (files, devices, network resources).

| Model    | Full Name                      | Who Sets Policy?  | Flexibility | Security  |
| -------- | ------------------------------ | ----------------- | ----------- | --------- |
| **DAC**  | Discretionary Access Control   | Resource owner    | High        | Moderate  |
| **MAC**  | Mandatory Access Control       | System/admin      | Low         | High      |
| **RBAC** | Role-Based Access Control      | Admin (via roles) | Moderate    | High      |
| **ABAC** | Attribute-Based Access Control | Policy engine     | Very high   | Very high |

---

## DAC (Discretionary Access Control)

In DAC, the **owner** of a resource decides who can access it. This is the model used by traditional UNIX permissions and Windows NTFS ACLs.

```text
DAC Example — UNIX Permissions:

Owner: alice
  │
  ├── chmod 644 report.txt     (alice decides: owner rw, group r, others r)
  ├── chmod 600 secret.key     (alice decides: owner rw only)
  └── chmod 755 script.sh      (alice decides: owner rwx, others rx)

Alice has FULL DISCRETION over her files.
```

| Advantage                        | Disadvantage                                                        |
| -------------------------------- | ------------------------------------------------------------------- |
| Flexible — owners control access | Owner can accidentally grant too much                               |
| Easy to understand and manage    | No system-wide security policy enforcement                          |
| Standard on UNIX, Windows        | Trojan horse problem: malicious program inherits user's permissions |
| Minimal admin overhead           | Cannot prevent information flow (copy → share)                      |

> [!WARNING]
> The fundamental weakness of DAC: if User A runs a malicious program, that program inherits ALL of User A's permissions — it can read, copy, and exfiltrate any of User A's files.

---

## MAC (Mandatory Access Control)

In MAC, access decisions are made by the **system** based on security labels, not by resource owners. Users cannot override the policy.

### Bell-LaPadula Model (Confidentiality)

Designed for military classification systems. Two key rules:

| Rule              | Formal Name                 | Meaning                                                 | Purpose                                        |
| ----------------- | --------------------------- | ------------------------------------------------------- | ---------------------------------------------- |
| **No Read Up**    | Simple Security Property    | Subject cannot read objects at higher classification    | Prevents learning secrets above your clearance |
| **No Write Down** | \*-Property (Star Property) | Subject cannot write to objects at lower classification | Prevents leaking secrets to lower levels       |

```text
Bell-LaPadula Model:

Classification Levels:
  ┌───────────────┐
  │  TOP SECRET   │ ← Can read TS, S, C, U
  ├───────────────┤    Cannot write to S, C, U (no write down)
  │   SECRET      │ ← Can read S, C, U
  ├───────────────┤    Cannot read TS (no read up)
  │ CONFIDENTIAL  │ ← Can read C, U
  ├───────────────┤
  │ UNCLASSIFIED  │ ← Can read U only
  └───────────────┘

  General (TS clearance):     ✅ Read TS  ✅ Read S   ❌ Write S  ❌ Write C
  Sergeant (S clearance):     ❌ Read TS  ✅ Read S   ✅ Write TS ❌ Write C
  Private (C clearance):      ❌ Read TS  ❌ Read S   ✅ Write S  ✅ Read C
```

### Biba Model (Integrity)

The dual of Bell-LaPadula — focuses on **data integrity** rather than confidentiality:

| Rule             | Meaning                                             | Purpose                                        |
| ---------------- | --------------------------------------------------- | ---------------------------------------------- |
| **No Read Down** | Subject cannot read objects at lower integrity      | Prevents contamination from unreliable sources |
| **No Write Up**  | Subject cannot write to objects at higher integrity | Prevents corruption of trusted data            |

### Bell-LaPadula vs Biba

| Feature           | Bell-LaPadula                      | Biba                                  |
| ----------------- | ---------------------------------- | ------------------------------------- |
| **Protects**      | Confidentiality                    | Integrity                             |
| **No Read Up**    | ✅                                 | ❌ (No Read Down instead)             |
| **No Write Down** | ✅                                 | ❌ (No Write Up instead)              |
| **Use case**      | Military/government classification | Financial systems, software integrity |
| **Weakness**      | Ignores integrity                  | Ignores confidentiality               |

> [!NOTE]
> Bell-LaPadula and Biba are **incompatible** — applying both simultaneously is contradictory. Real systems typically choose one focus or use a more flexible model like RBAC.

---

## RBAC (Role-Based Access Control)

**RBAC** introduces an indirection layer: permissions are assigned to **roles**, and users are assigned to roles. This simplifies management enormously in organizations.

```text
RBAC Structure:

  Users              Roles              Permissions
  ┌───────┐     ┌───────────┐     ┌──────────────────┐
  │ Alice ├────▶│  Doctor   ├────▶│ Read patient     │
  │       │     │           │     │ records          │
  └───────┘     │           ├────▶│ Write            │
                │           │     │ prescriptions    │
  ┌───────┐     └───────────┘     └──────────────────┘
  │ Bob   ├────▶┌───────────┐     ┌──────────────────┐
  │       │     │  Nurse    ├────▶│ Read patient     │
  └───────┘     │           │     │ records          │
                │           ├────▶│ Administer       │
  ┌───────┐     └───────────┘     │ medication       │
  │ Carol ├────▶┌───────────┐     └──────────────────┘
  │       │     │  Admin    │     ┌──────────────────┐
  └───────┘     │           ├────▶│ Manage billing   │
                │           ├────▶│ Schedule          │
                │           │     │ appointments     │
                └───────────┘     └──────────────────┘
```

### Hospital RBAC Example

| Role           | Read Patient Records | Write Prescriptions | Administer Meds | View Billing   | Manage Users |
| -------------- | -------------------- | ------------------- | --------------- | -------------- | ------------ |
| **Doctor**     | ✅                   | ✅                  | ❌              | ❌             | ❌           |
| **Nurse**      | ✅                   | ❌                  | ✅              | ❌             | ❌           |
| **Pharmacist** | ✅ (limited)         | ❌                  | ❌              | ❌             | ❌           |
| **Admin**      | ❌                   | ❌                  | ❌              | ✅             | ✅           |
| **Auditor**    | ✅ (read-only)       | ❌                  | ❌              | ✅ (read-only) | ❌           |

RBAC advantages:

- **Scalability**: Add new users by assigning roles, not individual permissions
- **Separation of duties**: No single role has all permissions
- **Role hierarchy**: Senior roles inherit permissions from junior roles
- **Auditability**: Easy to answer "who can access patient records?"

---

## ABAC (Attribute-Based Access Control)

**ABAC** makes access decisions based on **attributes** of the subject, object, environment, and action. It's the most flexible model but also the most complex.

```text
ABAC Policy Example:

ALLOW if:
  subject.role == "doctor" AND
  subject.department == object.department AND
  action == "read" AND
  environment.time BETWEEN "08:00" AND "18:00" AND
  environment.location == "hospital_network"
```

| Attribute Type  | Examples                                           |
| --------------- | -------------------------------------------------- |
| **Subject**     | Role, department, clearance, location, device type |
| **Object**      | Classification, owner, department, creation date   |
| **Action**      | Read, write, execute, delete, approve              |
| **Environment** | Time of day, IP address, threat level, day of week |

---

## Comparing All Access Control Models

| Feature               | DAC                 | MAC                  | RBAC                   | ABAC                    |
| --------------------- | ------------------- | -------------------- | ---------------------- | ----------------------- |
| **Policy setter**     | Resource owner      | System admin         | Role admin             | Policy engine           |
| **Granularity**       | Per-object          | Security labels      | Per-role               | Per-attribute           |
| **Flexibility**       | High                | Low                  | Moderate               | Very high               |
| **Scalability**       | Poor for large orgs | Good                 | Excellent              | Good (complex policies) |
| **Management effort** | Low (per-user)      | High (labels)        | Moderate (roles)       | High (policy writing)   |
| **Trojan resistance** | ❌ Poor             | ✅ Strong            | Moderate               | ✅ Strong               |
| **Standard use**      | UNIX, Windows       | Military, government | Enterprise, healthcare | Cloud, fine-grained     |
| **Example system**    | UNIX chmod          | SELinux              | AWS IAM roles          | AWS IAM policies        |

---

## SELinux: MAC Implementation in Linux

**Security-Enhanced Linux** (SELinux) adds MAC to the Linux kernel. Originally developed by the NSA, it's now standard in RHEL, Fedora, and CentOS.

### Type Enforcement

SELinux labels every process (subject) and file (object) with a **security context**:

```text
Security Context Format:
  user:role:type:level

Example:
  Process:  system_u:system_r:httpd_t:s0
  File:     system_u:object_r:httpd_sys_content_t:s0
```

### Example Policy Rules

```text
# Allow httpd process to read web content files
allow httpd_t httpd_sys_content_t:file { read open getattr };

# Allow httpd to bind to HTTP ports
allow httpd_t http_port_t:tcp_socket { name_bind };

# DENY httpd from reading user home directories (implicit)
# (No rule = denied by default!)

# Domain transition: when init starts httpd
type_transition init_t httpd_exec_t:process httpd_t;
```

| SELinux Mode   | Behavior                                                 |
| -------------- | -------------------------------------------------------- |
| **Enforcing**  | Policies are enforced — violations are denied and logged |
| **Permissive** | Policies are not enforced — violations are only logged   |
| **Disabled**   | SELinux is completely off                                |

```bash
# Check SELinux status
getenforce          # Returns: Enforcing, Permissive, or Disabled
sestatus            # Detailed status

# View file security context
ls -Z /var/www/html/index.html
# -rw-r--r--. root root system_u:object_r:httpd_sys_content_t:s0 index.html

# View process security context
ps -eZ | grep httpd
# system_u:system_r:httpd_t:s0  1234 ?  00:00:05 httpd
```

---

## AppArmor: Profile-Based MAC

**AppArmor** is an alternative to SELinux that's simpler to configure. Instead of labeling every object, it uses **path-based profiles** for each program.

```text
# AppArmor profile for /usr/bin/firefox
/usr/bin/firefox {
    # Allow reading system libraries
    /usr/lib/**                r,
    /lib/**                    r,

    # Allow reading/writing in user's home
    owner /home/*/.mozilla/**  rw,
    owner /home/*/Downloads/** rw,

    # Allow network access
    network inet stream,
    network inet dgram,

    # DENY access to sensitive files
    deny /etc/shadow           r,
    deny /etc/passwd           w,
    deny /home/*/.ssh/**       rw,
}
```

| Feature             | SELinux                               | AppArmor                            |
| ------------------- | ------------------------------------- | ----------------------------------- |
| **Approach**        | Label-based (type enforcement)        | Path-based (profiles)               |
| **Complexity**      | High — steep learning curve           | Moderate — easier to learn          |
| **Granularity**     | Very fine-grained                     | File-path level                     |
| **Default distros** | RHEL, Fedora, CentOS                  | Ubuntu, SUSE, Debian                |
| **File moves**      | Label follows file (more secure)      | Path changes = different rules      |
| **Policy creation** | Complex — requires deep understanding | Easier — can auto-generate profiles |

---

## Sandboxing

**Sandboxing** isolates untrusted code from the rest of the system, limiting the damage if the code is malicious or buggy.

### seccomp: System Call Filtering

**seccomp** (secure computing) restricts which system calls a process can make.

```c
#include <linux/seccomp.h>
#include <sys/prctl.h>

// Strict mode: only read(), write(), _exit(), sigreturn() allowed
prctl(PR_SET_SECCOMP, SECCOMP_MODE_STRICT);

// BPF mode: custom filter (used by Chrome, Docker)
// Allow: read, write, open, close, mmap, ...
// Deny: execve, socket, ptrace, ...
struct sock_filter filter[] = {
    BPF_STMT(BPF_LD | BPF_W | BPF_ABS,
             offsetof(struct seccomp_data, nr)),
    BPF_JUMP(BPF_JMP | BPF_JEQ | BPF_K, __NR_execve, 0, 1),
    BPF_STMT(BPF_RET | BPF_K, SECCOMP_RET_KILL),  // Kill on execve
    BPF_STMT(BPF_RET | BPF_K, SECCOMP_RET_ALLOW),  // Allow others
};
```

### chroot Jail

**chroot** changes the apparent root directory for a process, limiting its view of the filesystem:

```text
Real filesystem:                 Process sees (after chroot):
/                                /
├── bin/                         ├── bin/
├── etc/                         │   └── bash
│   ├── passwd    ← HIDDEN       ├── lib/
│   └── shadow    ← HIDDEN       │   └── libc.so
├── home/         ← HIDDEN       └── data/
├── var/                             └── app_files/
│   └── www/
│       └── jail/  ← chroot here
│           ├── bin/
│           │   └── bash
│           ├── lib/
│           │   └── libc.so
│           └── data/
│               └── app_files/
```

```bash
# Create and enter a chroot jail
sudo chroot /var/www/jail /bin/bash
# Now the process thinks /var/www/jail is /
```

> [!WARNING]
> **chroot is NOT a security boundary!** A root process inside a chroot can escape using `mknod`, `mount`, or file descriptor tricks. It's a convenience mechanism, not a security sandbox. Use namespaces or containers for real isolation.

### Containers (Namespaces + cgroups)

Linux containers combine **namespaces** (isolation) and **cgroups** (resource limits) to create lightweight sandboxes:

| Namespace  | Isolates          | Effect                                  |
| ---------- | ----------------- | --------------------------------------- |
| **PID**    | Process IDs       | Container sees only its own processes   |
| **NET**    | Network stack     | Container has its own IP, ports, routes |
| **MNT**    | Mount points      | Container has its own filesystem view   |
| **UTS**    | Hostname          | Container has its own hostname          |
| **IPC**    | IPC resources     | Separate shared memory, semaphores      |
| **USER**   | User/group IDs    | Container root ≠ host root              |
| **CGROUP** | cgroup visibility | Container sees only its own cgroups     |

| cgroup Resource | Control                         |
| --------------- | ------------------------------- |
| **CPU**         | Limit CPU time/shares           |
| **Memory**      | Limit RAM usage, OOM behavior   |
| **Block I/O**   | Limit disk read/write bandwidth |
| **Network**     | Limit network bandwidth         |
| **PIDs**        | Limit number of processes       |

### Browser Sandboxing

Modern browsers like Chrome use **multi-process architecture** with sandboxing:

```text
Chrome Process Architecture:

┌───────────────────────────────────────────────┐
│              Browser Process                   │
│  (privileged — manages UI, tabs, network)      │
│  Full system access                            │
└──────────┬────────────┬────────────┬──────────┘
           │            │            │
    ┌──────▼──────┐ ┌───▼──────┐ ┌──▼───────┐
    │ Renderer    │ │ Renderer │ │ Renderer  │
    │ Process     │ │ Process  │ │ Process   │
    │ (Tab 1)     │ │ (Tab 2)  │ │ (Tab 3)  │
    │             │ │          │ │           │
    │ SANDBOXED:  │ │SANDBOXED │ │SANDBOXED  │
    │ - seccomp   │ │          │ │           │
    │ - namespaces│ │          │ │           │
    │ - no file   │ │          │ │           │
    │   access    │ │          │ │           │
    │ - no network│ │          │ │           │
    │   (direct)  │ │          │ │           │
    └─────────────┘ └──────────┘ └───────────┘

    If Tab 1 is compromised (malicious JS):
    - Cannot access Tab 2's data (separate process)
    - Cannot access filesystem (seccomp blocks)
    - Cannot access network directly (must go through browser process)
```

### Mobile App Sandboxing

| Platform    | Mechanism                                      | Key Features                                     |
| ----------- | ---------------------------------------------- | ------------------------------------------------ |
| **Android** | Each app runs as separate Linux user + SELinux | Per-app UID, permission system, intent-based IPC |
| **iOS**     | App Sandbox + mandatory code signing           | No inter-app file access, entitlements, XPC      |

---

## Capability-Based Security

In capability-based systems, access rights are represented as **unforgeable tokens** (capabilities) that a process must possess to access an object.

```text
Capability-based vs ACL-based access check:

ACL-based (identity check):
  Process → "I am alice, open /etc/data"
  OS → Check ACL of /etc/data → alice has read → ALLOW

Capability-based (token check):
  Process → "Here is my capability token for /etc/data"
  OS → Token valid? → read permission? → ALLOW

  The process doesn't need to prove identity —
  possession of the capability IS the authorization.
```

| Feature             | ACL-Based                  | Capability-Based                  |
| ------------------- | -------------------------- | --------------------------------- |
| **Access check**    | "Who are you?"             | "What token do you have?"         |
| **Delegation**      | Complex (modify ACL)       | Simple (pass the token)           |
| **Revocation**      | Easy (modify object's ACL) | Hard (must invalidate all copies) |
| **Confused deputy** | Vulnerable                 | Resistant                         |
| **Example**         | UNIX file permissions      | UNIX file descriptors, Capsicum   |

> [!TIP]
> **UNIX file descriptors** are actually capabilities! Once a process opens a file and gets fd=3, it can pass that fd to a child process via `fork()` — the child can access the file even without permission in the ACL, because it holds the capability (fd).

---

## Comparing Isolation Mechanisms

| Feature                | chroot           | Container                    | VM                          | Browser Sandbox   |
| ---------------------- | ---------------- | ---------------------------- | --------------------------- | ----------------- |
| **Isolation level**    | Filesystem only  | Process-level (ns + cgroups) | Hardware-level (hypervisor) | Process + seccomp |
| **Kernel shared?**     | Yes              | Yes                          | No (separate kernel)        | Yes               |
| **Overhead**           | None             | Very low (~1-2%)             | Moderate (5-15%)            | Low               |
| **Startup time**       | Instant          | Milliseconds                 | Seconds to minutes          | Milliseconds      |
| **Security**           | Weak (escapable) | Good (with seccomp)          | Strong (hardware boundary)  | Good              |
| **Resource isolation** | None             | Via cgroups                  | Full (virtual HW)           | Partial           |
| **Density**            | High             | Very high (1000s/host)       | Low (10s/host)              | Per-tab           |
| **Use case**           | Legacy isolation | Microservices, CI/CD         | Multi-tenant cloud          | Web browsing      |

```text
Isolation Strength Spectrum:

Weak                                                  Strong
◀──────────────────────────────────────────────────────▶
chroot    namespace    container    gVisor    VM    bare-metal
 │          │            │           │        │         │
 │  filesystem  process   ns+cgroup  user     hypervisor  physical
 │   view only  isolation +seccomp   kernel   isolation    isolation
```

---

## Try It Yourself

**Exercise 1:** In the Bell-LaPadula model, a user with SECRET clearance wants to: (a) read a CONFIDENTIAL document, (b) read a TOP SECRET document, (c) write to an UNCLASSIFIED file. Which operations are allowed?

:::details Solution
| Operation | Rule Applied | Allowed? | Reason |
|---|---|---|---|
| (a) Read CONFIDENTIAL | No Read Up | ✅ Yes | SECRET > CONFIDENTIAL (reading down) |
| (b) Read TOP SECRET | No Read Up | ❌ No | SECRET < TOP SECRET (reading up) |
| (c) Write UNCLASSIFIED | No Write Down | ❌ No | SECRET > UNCLASSIFIED (writing down — could leak secrets) |

The \*-Property (No Write Down) prevents a SECRET user from copying classified information into an unclassified file, which would make it readable by everyone.
:::

**Exercise 2:** An organization has 500 employees across 10 departments. Compare the management effort for DAC vs RBAC when a new file server is added and all employees in the "Engineering" department (80 people) need read access.

:::details Solution
**DAC approach:**

- Go to the file server's ACL
- Add 80 individual user entries with read permission
- If a new engineer joins, manually add them to this server's ACL
- If an engineer transfers departments, manually remove them
- For 100 file servers, this means 80 × 100 = 8,000 ACL entries to manage

**RBAC approach:**

- Create (or reuse) the "Engineer" role
- Grant "Engineer" role read access to the file server
- That's 1 permission change
- New engineers automatically get access when assigned the role
- Transferred employees lose access when role is removed
- For 100 file servers, just 100 role-permission assignments

RBAC reduces management from **O(users × resources)** to **O(roles × resources)**. With 10 roles vs 500 users, that's a **50× reduction** in management effort.
:::

**Exercise 3:** A Docker container runs a web server. The container uses PID namespace, NET namespace, and MNT namespace. For each namespace, explain what specific isolation it provides.

:::details Solution
| Namespace | What the Container Sees | What It Cannot See |
|---|---|---|
| **PID** | Only its own processes (PID 1 = web server, PID 2 = worker, etc.) | Cannot see or signal host processes or other containers' processes |
| **NET** | Its own network stack: its own IP address (e.g., 172.17.0.2), its own ports (can bind to port 80 without conflicting with host's port 80), its own routing table | Cannot see host's network interfaces or other containers' IPs directly |
| **MNT** | Its own filesystem: the container image's root filesystem, any mounted volumes | Cannot see host's root filesystem, other containers' filesystems, or unmounted host directories |

Together, these namespaces make the container appear to be a separate machine with its own processes, network, and files — while actually sharing the host kernel.
:::

---

## Key Takeaways

- **DAC** (owner-controlled) is flexible but vulnerable to the trojan horse problem; **MAC** (system-enforced) is secure but rigid; **RBAC** (role-based) balances security and manageability; **ABAC** (attribute-based) offers maximum flexibility
- **Bell-LaPadula** enforces confidentiality (no read up, no write down); **Biba** enforces integrity (no read down, no write up) — they address complementary concerns
- **SELinux** provides fine-grained MAC via type enforcement and security contexts; **AppArmor** offers simpler path-based profiles — both add mandatory security beyond UNIX DAC
- **Sandboxing** isolates untrusted code: **seccomp** restricts system calls, **chroot** limits filesystem view (but is escapable), **containers** combine namespaces + cgroups for practical isolation
- **Browser sandboxing** uses per-tab processes with restricted system call access, protecting users from malicious web content
- **Capability-based security** uses unforgeable tokens instead of identity checks — UNIX file descriptors are a common example
- Isolation mechanisms range from weak (chroot) to strong (VMs), with containers offering an excellent balance of security, performance, and density for most use cases
