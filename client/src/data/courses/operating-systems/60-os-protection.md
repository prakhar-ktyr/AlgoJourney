---
title: Protection Mechanisms
section: "Security & Protection"
---

# Protection Mechanisms

In a multiprogramming environment where multiple users and processes share the same hardware, the operating system must ensure that one process cannot interfere with another, that unauthorized users cannot access sensitive files, and that system resources are used only as intended. **Protection** provides the internal mechanisms to enforce these policies. This lesson covers protection domains, the access matrix model, and practical implementations like UNIX permissions and capability lists.

---

## Protection vs Security

These terms are often used interchangeably, but they address different concerns:

| Aspect           | Protection                            | Security                                |
| ---------------- | ------------------------------------- | --------------------------------------- |
| **Focus**        | Internal — enforce access policies    | External — defend against threats       |
| **Scope**        | Control access to resources           | Prevent unauthorized access, attacks    |
| **Mechanism**    | Access control, domains, capabilities | Encryption, authentication, firewalls   |
| **Threat model** | Accidental misuse, bugs               | Deliberate attacks, malware             |
| **Analogy**      | Door locks inside a building          | Guards, walls, and surveillance outside |

> **"Protection refers to a mechanism for controlling access of programs, processes, or users to the resources defined by a computer system."**
> — Silberschatz, Galvin & Gagne

---

## Goals of Protection

| Goal                             | Description                                                | Example                                   |
| -------------------------------- | ---------------------------------------------------------- | ----------------------------------------- |
| **Prevent unauthorized access**  | Only permitted users/processes access resources            | User A cannot read User B's files         |
| **Enforce policies**             | Translate organizational security policies to system rules | "Only HR can access payroll data"         |
| **Contain faults**               | Limit damage if a component fails or misbehaves            | A buggy driver cannot corrupt user memory |
| **Support sharing**              | Allow controlled sharing of resources                      | Multiple users read the same database     |
| **Principle of least privilege** | Grant minimum necessary access                             | A web server runs without root privileges |

---

## Principle of Least Privilege

> **"Every program and every privileged user of the system should operate using the least amount of privilege necessary to complete the job."**
> — Jerome Saltzer and Michael Schroeder (1975)

This is the single most important principle in protection design. If a web server only needs to read files from `/var/www`, it should have **no access** to `/etc/shadow`, `/home`, or any other directory.

| Violation                            | Risk                             | Correct Approach                        |
| ------------------------------------ | -------------------------------- | --------------------------------------- |
| Running web server as `root`         | Compromise = full system control | Run as `www-data` user                  |
| Granting `777` permissions           | Any user can modify/delete       | Grant only necessary `r/w/x` bits       |
| Application with `CAP_SYS_ADMIN`     | Overpowered, equivalent to root  | Grant only specific capabilities needed |
| Database running with all privileges | SQL injection = data theft       | Separate read-only and write accounts   |

---

## Protection Domains

A **protection domain** defines the set of resources a process can access and the operations it can perform on each.

> A domain is a set of **(object, access-rights)** pairs.

```text
Domain D1: {(File1, {read, write}), (File2, {read}), (Printer, {write})}
Domain D2: {(File1, {read}), (File3, {read, write, execute})}
Domain D3: {(File2, {read, write}), (Printer, {write}), (Network, {send})}
```

```text
         Objects
         ┌──────┬──────┬──────┬─────────┬─────────┐
         │File1 │File2 │File3 │ Printer │ Network │
    ┌────┼──────┼──────┼──────┼─────────┼─────────┤
D1  │    │ R,W  │  R   │      │   W     │         │
    ├────┼──────┼──────┼──────┼─────────┼─────────┤
D2  │    │  R   │      │R,W,X │         │         │
    ├────┼──────┼──────┼──────┼─────────┼─────────┤
D3  │    │      │ R,W  │      │   W     │  Send   │
    └────┴──────┴──────┴──────┴─────────┴─────────┘
```

### Process-Domain Binding

A process executes within a domain. The binding can be:

| Binding Type | Description                                  | Example                                 |
| ------------ | -------------------------------------------- | --------------------------------------- |
| **Static**   | Process stays in one domain for its lifetime | Simple systems                          |
| **Dynamic**  | Process can switch domains during execution  | UNIX: `setuid`, kernel/user mode switch |

### Domain Switching in UNIX

When a process executes a `setuid` program, it **switches domains** — temporarily gaining the privileges of the file owner:

```text
User "alice" (UID 1001)
     │
     ├── runs /usr/bin/passwd (owned by root, setuid bit set)
     │
     ▼
Process domain switches:
  Before: Domain of alice → {(alice_files, R/W), (passwd_shadow, NONE)}
  After:  Domain of root  → {(alice_files, R/W), (passwd_shadow, R/W)}
                               ▲
                               └── temporarily gains root access
                                   to /etc/shadow

     │
     ├── passwd modifies /etc/shadow (allowed in root domain)
     │
     ▼
Process exits → domain returns to alice
```

---

## The Access Matrix

The **access matrix** is the foundational model for protection. It defines exactly who can do what to which object.

|              | File1       | File2       | File3         | Printer | Domain 1 | Domain 2 |
| ------------ | ----------- | ----------- | ------------- | ------- | -------- | -------- |
| **Domain 1** | read, write | read        |               | write   |          | switch   |
| **Domain 2** | read        |             | read, execute |         |          |          |
| **Domain 3** |             | read, write |               | write   | switch   |          |

### Special Operations

| Operation   | Meaning                                  | Example                                 |
| ----------- | ---------------------------------------- | --------------------------------------- |
| **switch**  | Can switch to another domain             | D1 can switch to D2                     |
| **copy**    | Can copy access rights to another domain | D1 copies read(File1) to D3             |
| **owner**   | Can grant/revoke rights on an object     | Owner of File1 can add D3→File1:read    |
| **control** | Can modify rights in another domain      | D1 controls D3 — can change D3's rights |

The copy right can be further refined:

| Copy Variant     | Notation | Meaning                                           |
| ---------------- | -------- | ------------------------------------------------- |
| **Copy**         | R\*      | Can copy R to another domain (original retained)  |
| **Transfer**     | R†       | Can transfer R to another domain (original lost)  |
| **Limited Copy** | R\*⁻     | Can copy R, but the copy cannot be further copied |

---

## Access Matrix Implementations

The access matrix is a conceptual model. In practice, it's too sparse and large to store directly. Three implementation strategies exist:

### 1. Global Table

Store every non-empty entry as a triple: **(domain, object, rights-set)**.

```text
(D1, File1, {read, write})
(D1, File2, {read})
(D1, Printer, {write})
(D2, File1, {read})
(D2, File3, {read, execute})
(D3, File2, {read, write})
(D3, Printer, {write})
(D3, Network, {send})
```

### 2. Access Control Lists (ACLs) — Column-wise

For each **object**, store a list of (domain, rights) pairs. This is looking at the matrix column by column.

```text
File1:    [(D1, {R,W}), (D2, {R})]
File2:    [(D1, {R}), (D3, {R,W})]
File3:    [(D2, {R,X})]
Printer:  [(D1, {W}), (D3, {W})]
Network:  [(D3, {Send})]
```

### 3. Capability Lists — Row-wise

For each **domain** (process), store a list of (object, rights) pairs. Each entry is called a **capability** — an unforgeable token granting specific access.

```text
D1: [(File1, {R,W}), (File2, {R}), (Printer, {W})]
D2: [(File1, {R}), (File3, {R,X})]
D3: [(File2, {R,W}), (Printer, {W}), (Network, {Send})]
```

### Comparison

| Feature                | Global Table                        | ACL                                                | Capability List                                           |
| ---------------------- | ----------------------------------- | -------------------------------------------------- | --------------------------------------------------------- |
| **Storage**            | Large — stores all triples          | Per-object list                                    | Per-domain list                                           |
| **Access check speed** | Search entire table — slow          | Check object's list — fast for "who can access X?" | Check domain's list — fast for "what can D access?"       |
| **Revocation**         | Search and remove — slow            | Easy — remove entry from object's list             | Hard — must find and revoke capability across all domains |
| **Granting rights**    | Add triple                          | Add to object's ACL                                | Create and pass capability                                |
| **Used by**            | Rarely (too slow)                   | UNIX, Windows NTFS, cloud IAM                      | Mach kernel, capability-based microkernels                |
| **Security risk**      | Table corruption affects everything | Moderate                                           | Capability forgery or leakage                             |

> [!TIP]
> Most real systems use a **hybrid**: ACLs at the file system level (UNIX permissions, NTFS DACLs) and capability-like tokens at the API level (file descriptors in UNIX are essentially capabilities).

---

## UNIX Permission Model

UNIX uses a simplified ACL with **three categories** and **three permission bits** each:

```text
$ ls -l report.txt
-rw-r--r-- 1 alice staff 4096 May 30 10:00 report.txt
 │││││││││
 │├┤├┤├┤
 │ │ │ └── Others:  r-- (read only)
 │ │ └──── Group:   r-- (read only)
 │ └────── User:    rw- (read, write)
 └──────── Type:    - (regular file)
```

| Permission      | On Files             | On Directories                   |
| --------------- | -------------------- | -------------------------------- |
| **r** (read)    | View file contents   | List directory contents (`ls`)   |
| **w** (write)   | Modify file contents | Create/delete files in directory |
| **x** (execute) | Run as program       | Enter directory (`cd`)           |

### Numeric (Octal) Representation

| Permission | Binary | Octal |
| ---------- | ------ | ----- |
| `---`      | 000    | 0     |
| `--x`      | 001    | 1     |
| `-w-`      | 010    | 2     |
| `-wx`      | 011    | 3     |
| `r--`      | 100    | 4     |
| `r-x`      | 101    | 5     |
| `rw-`      | 110    | 6     |
| `rwx`      | 111    | 7     |

```bash
# Common permission settings
chmod 755 script.sh    # rwxr-xr-x  Owner: full, Others: read+execute
chmod 644 data.txt     # rw-r--r--  Owner: read+write, Others: read
chmod 600 secret.key   # rw-------  Owner only
chmod 777 public.txt   # rwxrwxrwx  DANGEROUS — everyone has full access
```

### Changing Ownership

```bash
chown alice:staff report.txt    # Change owner to alice, group to staff
chown -R bob:dev /project/      # Recursive ownership change
```

---

## setuid and setgid

The **setuid** and **setgid** bits allow a program to run with the privileges of the file **owner** (or group), not the user who executed it. This is a form of **controlled domain switching**.

```bash
$ ls -l /usr/bin/passwd
-rwsr-xr-x 1 root root 59640 May 30 10:00 /usr/bin/passwd
   ^
   └── 's' in owner execute position = setuid bit is set
```

| Bit            | Effect                                      | Example                                                  |
| -------------- | ------------------------------------------- | -------------------------------------------------------- |
| **setuid**     | Process runs as file owner                  | `/usr/bin/passwd` (runs as root to modify `/etc/shadow`) |
| **setgid**     | Process runs as file group                  | `/usr/bin/crontab` (runs as crontab group)               |
| **sticky bit** | On directories: only owner can delete files | `/tmp` (users can't delete others' files)                |

### Security Implications

```text
Security Risk of setuid:

1. Normal program: runs with user's privileges ─── LOW RISK
2. setuid root program: runs with ROOT privileges ─── HIGH RISK

If a setuid root program has a vulnerability:
   User exploit → buffer overflow → attacker gets ROOT shell!

This is why:
   - setuid programs should be minimal and audited
   - Modern systems use CAPABILITIES instead of setuid
   - setuid programs should drop privileges ASAP
```

```c
// Properly dropping privileges in a setuid program
#include <unistd.h>
#include <sys/types.h>

int main() {
    // Running as root due to setuid

    // Open the privileged resource
    int fd = open("/etc/shadow", O_RDONLY);

    // DROP privileges immediately
    setuid(getuid());  // Set effective UID back to real UID

    // Now running as regular user
    // Process the file using the already-open fd
    // Even if exploited from here, attacker only gets user privileges

    close(fd);
    return 0;
}
```

> [!WARNING]
> The `setuid` mechanism is one of the most common sources of **privilege escalation** vulnerabilities. Modern Linux systems prefer **capabilities** (`CAP_DAC_OVERRIDE`, `CAP_NET_BIND_SERVICE`, etc.) which grant fine-grained privileges instead of full root access.

---

## Linux Capabilities

Instead of the all-or-nothing `setuid root`, Linux **capabilities** break root privileges into ~40 individual permissions:

| Capability             | Grants                        | Replaces setuid for           |
| ---------------------- | ----------------------------- | ----------------------------- |
| `CAP_NET_BIND_SERVICE` | Bind to ports < 1024          | Web server binding to port 80 |
| `CAP_DAC_OVERRIDE`     | Bypass file permission checks | File management tools         |
| `CAP_SYS_ADMIN`        | Various sysadmin operations   | mount, swapon, etc.           |
| `CAP_SETUID`           | Change UID                    | Login programs                |
| `CAP_NET_RAW`          | Use raw sockets               | ping, traceroute              |
| `CAP_SYS_PTRACE`       | Trace any process             | Debuggers                     |

```bash
# Grant a specific capability instead of setuid
sudo setcap 'cap_net_bind_service=+ep' /usr/bin/myserver
# Now myserver can bind to port 80 without running as root
```

---

## Try It Yourself

**Exercise 1:** Given the following access matrix, determine which operations are allowed and which are denied:

|            | File A      | File B      | Printer |
| ---------- | ----------- | ----------- | ------- |
| **User 1** | read, write | read        | write   |
| **User 2** | read        | read, write |         |
| **User 3** |             |             | write   |

a) Can User 2 write to File A?
b) Can User 3 read File B?
c) Can User 1 print a document?

:::details Solution
a) **Denied.** User 2 has only `read` access to File A, not `write`.

b) **Denied.** User 3 has no entry for File B — no access at all.

c) **Allowed.** User 1 has `write` access to Printer (printing is a write operation to the printer device).
:::

**Exercise 2:** A file has UNIX permissions `-rwxr-x---`. Who can do what?

:::details Solution
Breaking down: `-rwxr-x---`

| Category   | Permissions | Can Do                          |
| ---------- | ----------- | ------------------------------- |
| **Owner**  | `rwx`       | Read, write, and execute        |
| **Group**  | `r-x`       | Read and execute, but NOT write |
| **Others** | `---`       | Nothing — no access at all      |

In octal: `750`

To set this: `chmod 750 filename`
:::

**Exercise 3:** Why is storing access rights as **capabilities** (row-wise) harder to revoke than **ACLs** (column-wise)?

:::details Solution
**With ACLs (column-wise, stored per object):**
To revoke User X's access to File F, you go to File F's ACL and remove User X's entry. This is a **single, localized operation**.

**With Capabilities (row-wise, stored per process):**
To revoke User X's access to File F, you must:

1. Find User X's capability list
2. Remove the capability for File F
3. But User X might have **copied** the capability to other processes!
4. You must search **all** processes to find and revoke all copies
5. This is essentially a **distributed garbage collection** problem

This is why capability-based systems often use **indirect capabilities** that reference a central table — revocation then only requires modifying the table entry.
:::

---

## Key Takeaways

- **Protection** is about internal mechanisms to enforce access policies; **security** defends against external threats — both are needed
- The **Principle of Least Privilege** is the cornerstone: every process should operate with the minimum rights necessary to do its job
- A **protection domain** is a set of (object, access-rights) pairs; processes execute within domains and may switch domains under controlled conditions
- The **access matrix** model defines all access rights — rows are domains, columns are objects, entries are permission sets
- The access matrix is implemented as **ACLs** (per-object lists, easy to revoke), **capability lists** (per-process lists, easy to check), or a combination
- UNIX uses a simplified ACL: **rwx** permissions for **user/group/others**, plus special bits (**setuid**, **setgid**, **sticky**)
- **setuid** programs are powerful but dangerous — they enable domain switching but create privilege escalation risks if buggy
- Modern Linux uses **capabilities** to grant fine-grained privileges instead of all-or-nothing root access, following the principle of least privilege
