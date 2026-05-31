---
title: File System Mounting & Sharing
---

# File System Mounting & Sharing

A typical computer has multiple storage devices — an SSD, a USB drive, a network share — each potentially using a different file system. **Mounting** is the process that weaves these disparate file systems into a single, unified directory tree. Beyond mounting, modern operating systems must also handle **file sharing** among multiple users and across **networked file systems**. In this lesson, we explore how all of this works — from the mount operation itself, through the Virtual File System abstraction layer, to network protocols like NFS.

---

## The Mount Operation

> **Mounting** attaches a file system located on a device (or a remote server) to a specific point in the existing directory tree called the **mount point**.

Think of mounting like plugging a new wing into a building. Once attached, you walk through the main building and seamlessly enter the new wing — you don't need a separate entrance.

### How Mounting Works

```text
  Before mounting:

  /                           /dev/sdb1 (ext4)
  ├── home/                   ┌─────────────┐
  │   ├── alice/              │ / (root)     │
  │   └── bob/                │ ├── alice/   │
  ├── etc/                    │ │   └── docs │
  └── mnt/                    │ └── bob/     │
      └── (empty)             │     └── code │
                              └─────────────┘

  After: mount /dev/sdb1 /home

  /
  ├── home/  ← mount point (now shows contents of /dev/sdb1)
  │   ├── alice/
  │   │   └── docs
  │   └── bob/
  │       └── code
  ├── etc/
  └── mnt/
```

### Mount System Call

```c
#include <sys/mount.h>

// mount(source, target, filesystem_type, flags, data)
int ret = mount("/dev/sdb1", "/home", "ext4", MS_NOATIME, NULL);
if (ret != 0) {
    perror("mount");
}
```

```python
import subprocess

# Mount using system command
subprocess.run(["mount", "-t", "ext4", "/dev/sdb1", "/home"], check=True)
```

### Mount Flags

| Flag             | Description                                |
| ---------------- | ------------------------------------------ |
| `MS_RDONLY`      | Mount read-only                            |
| `MS_NOEXEC`      | Disallow program execution                 |
| `MS_NOSUID`      | Ignore set-user-ID bits                    |
| `MS_NOATIME`     | Don't update access times (performance)    |
| `MS_NODEV`       | Disallow device file access                |
| `MS_SYNCHRONOUS` | Write synchronously                        |
| `MS_REMOUNT`     | Change flags on already-mounted filesystem |

---

## The Mount Table

The kernel maintains a **mount table** that tracks all currently mounted file systems.

| Device               | Mount Point | FS Type | Options    | Dump | Pass |
| -------------------- | ----------- | ------- | ---------- | ---- | ---- |
| `/dev/sda1`          | `/`         | ext4    | `defaults` | 1    | 1    |
| `/dev/sda2`          | `/boot`     | ext4    | `defaults` | 1    | 2    |
| `/dev/sdb1`          | `/home`     | ext4    | `noatime`  | 1    | 2    |
| `tmpfs`              | `/tmp`      | tmpfs   | `size=2G`  | 0    | 0    |
| `192.168.1.5:/share` | `/mnt/nfs`  | nfs     | `rw,soft`  | 0    | 0    |

On Linux, this information is visible in `/proc/mounts` and configured in `/etc/fstab`.

### Boot File System vs Additional File Systems

| Category                    | Description                                                           | Example                              |
| --------------------------- | --------------------------------------------------------------------- | ------------------------------------ |
| **Boot (root) file system** | Always mounted at `/`; contains the kernel and essential system files | `/dev/sda1` mounted at `/`           |
| **Additional file systems** | Mounted during boot or on-demand at various mount points              | `/dev/sdb1` at `/home`               |
| **Virtual file systems**    | Kernel-generated, no physical device                                  | `proc` at `/proc`, `sysfs` at `/sys` |
| **Network file systems**    | Remote storage over the network                                       | NFS, SMB at `/mnt/share`             |

---

## Virtual File System (VFS)

Modern operating systems support **many** different file system types — ext4, NTFS, FAT32, NFS, ZFS, APFS, and more. The **Virtual File System** (VFS) is an abstraction layer that provides a uniform interface to all of them.

> The **VFS** defines a common set of operations and data structures that all file systems must implement. User programs and even the kernel interact with files through this generic interface, never directly with any specific file system.

### VFS Architecture

```text
  ┌────────────────────────────────────────────────────────┐
  │                  User Applications                     │
  │          open()  read()  write()  close()              │
  └────────────────────────┬───────────────────────────────┘
                           │ System Call Interface
  ┌────────────────────────▼───────────────────────────────┐
  │                                                        │
  │              Virtual File System (VFS)                 │
  │                                                        │
  │  ┌──────────────┐  ┌──────────┐  ┌───────────────┐    │
  │  │ Superblock   │  │  Inode   │  │   Dentry      │    │
  │  │ Object       │  │  Object  │  │   Object      │    │
  │  └──────────────┘  └──────────┘  │   (dcache)    │    │
  │  ┌──────────────┐                └───────────────┘    │
  │  │ File Object  │                                     │
  │  └──────────────┘                                     │
  └───┬──────────────┬──────────────┬─────────────────────┘
      │              │              │
  ┌───▼────┐    ┌────▼───┐    ┌────▼────┐    ┌──────────┐
  │  ext4  │    │  NTFS  │    │   NFS   │    │  FAT32   │
  │ driver │    │ driver │    │ client  │    │  driver  │
  └───┬────┘    └────┬───┘    └────┬────┘    └────┬─────┘
      │              │              │              │
  ┌───▼────┐    ┌────▼───┐    ┌────▼────┐    ┌────▼─────┐
  │ Local  │    │ Local  │    │ Network │    │ USB      │
  │ Disk   │    │ Disk   │    │         │    │ Drive    │
  └────────┘    └────────┘    └─────────┘    └──────────┘
```

### VFS Objects

| VFS Object     | Description                                                                | Lifetime                       |
| -------------- | -------------------------------------------------------------------------- | ------------------------------ |
| **Superblock** | Represents a mounted file system (block size, total blocks, FS operations) | While FS is mounted            |
| **Inode**      | Represents a specific file (metadata, data block pointers)                 | While file is in use or cached |
| **Dentry**     | Represents a directory entry — the name-to-inode mapping (part of dcache)  | Cached for fast path lookup    |
| **File**       | Represents an open file for a process (offset, access mode)                | While file is open             |

### Key VFS Operations

| Object         | Operation             | Description                                    |
| -------------- | --------------------- | ---------------------------------------------- |
| **Superblock** | `alloc_inode()`       | Allocate a new inode on this file system       |
| **Superblock** | `write_super()`       | Flush superblock to disk                       |
| **Inode**      | `lookup()`            | Find a directory entry by name                 |
| **Inode**      | `create()`            | Create a new file                              |
| **Inode**      | `mkdir()`             | Create a new directory                         |
| **Inode**      | `link()` / `unlink()` | Create/remove a hard link                      |
| **Dentry**     | `d_compare()`         | Compare entry names (case-sensitive or not)    |
| **Dentry**     | `d_delete()`          | Called when dentry's reference count reaches 0 |
| **File**       | `read()` / `write()`  | Transfer data to/from user space               |
| **File**       | `mmap()`              | Map file into address space                    |
| **File**       | `fsync()`             | Flush file data to stable storage              |

> [!NOTE]
> When you call `open("/mnt/usb/photo.jpg", O_RDONLY)`, the VFS resolves the path, determines that `/mnt/usb` is a FAT32 mount, and dispatches the call to the FAT32 driver's `open` implementation. Your code never needs to know the underlying file system.

### The vnode / inode Abstraction

Some UNIX variants use the term **vnode** (virtual node) for the VFS-level inode object, distinguishing it from the on-disk inode:

| Concept          | vnode (VFS)                                           | inode (on-disk)                          |
| ---------------- | ----------------------------------------------------- | ---------------------------------------- |
| **Location**     | In-memory kernel object                               | On-disk data structure                   |
| **Contents**     | File system type, operations pointer, reference count | Block pointers, permissions, timestamps  |
| **Purpose**      | Uniform interface across FS types                     | Persistent file metadata for one FS type |
| **Created when** | File is accessed/opened                               | File is created on disk                  |

---

## File Sharing

On multi-user systems, files are often shared between users or processes. The OS must provide mechanisms for controlled sharing.

### Owner, Group, and World

UNIX systems implement a three-tier permission model:

```text
  -rwxr-x--- 1 alice developers 4096 Jun 1 10:00 project.c
   │││││││││
   ││││││││└── other (world): no access
   │││││││└─── other: no access
   ││││││└──── other: no access
   │││││└───── group (developers): execute
   ││││└────── group: no execute
   │││└─────── group: read
   ││└──────── owner (alice): execute
   │└───────── owner: write
   └────────── owner: read
```

| Category          | Who                         | Bits                  |
| ----------------- | --------------------------- | --------------------- |
| **Owner (user)**  | The file's creator/owner    | `rwx` (first triple)  |
| **Group**         | Members of the file's group | `r-x` (second triple) |
| **Other (world)** | Everyone else               | `---` (third triple)  |

### Numeric Permissions

| Permission    | Value | Meaning                                     |
| ------------- | ----- | ------------------------------------------- |
| `r` (read)    | 4     | View file contents or list directory        |
| `w` (write)   | 2     | Modify file or add/remove directory entries |
| `x` (execute) | 1     | Run as program or traverse directory        |

Example: `chmod 750 project.c` sets `rwxr-x---`

$$750_{8} = (7)(5)(0) = (4+2+1)(4+0+1)(0+0+0) = rwx\;r\text{-}x\;\text{-{}-{}-}$$

### Access Control Lists (ACLs)

For finer-grained control beyond the basic three categories:

| Feature         | Traditional UNIX    | ACLs                           |
| --------------- | ------------------- | ------------------------------ |
| **Granularity** | Owner, group, other | Per-user and per-group entries |
| **Flexibility** | Limited             | Very flexible                  |
| **Complexity**  | Simple              | More complex to manage         |
| **Commands**    | `chmod`, `chown`    | `setfacl`, `getfacl`           |

```text
# Set ACL: give user bob read access, user carol read+write
$ setfacl -m u:bob:r-- project.c
$ setfacl -m u:carol:rw- project.c
$ getfacl project.c
# file: project.c
# owner: alice
# group: developers
user::rwx
user:bob:r--
user:carol:rw-
group::r-x
mask::rwx
other::---
```

---

## Consistency Semantics

When multiple processes share a file, the OS must define **when** changes by one process become visible to others.

| Semantics                  | Visibility Rule                                         | Used By                  |
| -------------------------- | ------------------------------------------------------- | ------------------------ |
| **UNIX semantics**         | Writes are visible to all other readers **immediately** | Local UNIX file systems  |
| **Session semantics**      | Writes visible only **when file is closed**             | Andrew File System (AFS) |
| **Immutable shared files** | Once created, file **cannot be modified**               | Read-only shared data    |

### UNIX Semantics in Detail

```text
Process A                    Process B
────────                    ────────
open("f.txt", O_RDWR)      open("f.txt", O_RDONLY)
write("Hello")
                            read() → "Hello"    ← visible immediately!
write(" World")
                            read() → " World"   ← visible immediately!
close()                     close()
```

### Session Semantics (AFS)

```text
Process A                    Process B
────────                    ────────
open("f.txt", O_RDWR)      open("f.txt", O_RDONLY)
write("Hello")
                            read() → ""          ← still sees OLD content!
write(" World")
close()                     ← A's close triggers upload
                            close()
                            open("f.txt", O_RDONLY)
                            read() → "Hello World" ← NOW sees A's changes
```

---

## Network File Systems

### NFS (Network File System)

NFS allows users to access files over a network as if they were local. It was developed by Sun Microsystems in 1984 and uses a **client-server** architecture with **Remote Procedure Calls (RPC)**.

```text
  ┌────────────────┐                    ┌────────────────────┐
  │   NFS Client   │                    │   NFS Server       │
  │                │                    │                    │
  │  Application   │                    │  /export/shared/   │
  │     │          │                    │  ├── data.csv      │
  │     ▼          │                    │  ├── config.yml    │
  │  VFS Layer     │     Network        │  └── logs/         │
  │     │          │                    │                    │
  │     ▼          │   RPC/XDR over     │  NFS Daemon        │
  │  NFS Client    │◄──────────────────►│  (nfsd)            │
  │  Module        │   TCP/UDP          │     │              │
  │     │          │                    │     ▼              │
  │     ▼          │                    │  Local FS (ext4)   │
  │  /mnt/nfs/     │                    │                    │
  │  (mount point) │                    │                    │
  └────────────────┘                    └────────────────────┘
```

### NFS Key Features

| Feature            | Description                                            |
| ------------------ | ------------------------------------------------------ |
| **Transparency**   | Remote files appear as local files                     |
| **Protocol**       | Originally stateless (NFSv2, v3); stateful in NFSv4    |
| **Authentication** | Kerberos in NFSv4; UID/GID mapping in earlier versions |
| **Caching**        | Client-side caching with close-to-open consistency     |
| **Port**           | TCP/UDP port 2049                                      |

### Stateless vs Stateful Protocols

| Property             | Stateless (NFSv3)                     | Stateful (NFSv4)                  |
| -------------------- | ------------------------------------- | --------------------------------- |
| **Server remembers** | Nothing between requests              | Open files, locks, delegations    |
| **Crash recovery**   | Client retries; server restarts fresh | Server replays state from journal |
| **Locking**          | Separate lock manager (NLM)           | Integrated lock support           |
| **Complexity**       | Simple server, complex client         | More complex server               |
| **Idempotent ops**   | Required (client may resend)          | Not strictly required             |

### Client-Side Caching

| Cache Type          | What Is Cached                   | Consistency              |
| ------------------- | -------------------------------- | ------------------------ |
| **Attribute cache** | File metadata (size, timestamps) | TTL-based (3–30 seconds) |
| **Data cache**      | File content blocks              | Close-to-open check      |
| **Directory cache** | Directory listings               | TTL-based                |

> [!TIP]
> Close-to-open consistency means: when a client opens a file, it checks with the server whether its cached copy is still valid. This balances performance (caching) with correctness (seeing recent changes).

### SMB/CIFS (Windows File Sharing)

| Feature            | NFS                           | SMB/CIFS                                    |
| ------------------ | ----------------------------- | ------------------------------------------- |
| **Origin**         | Sun Microsystems (UNIX)       | Microsoft (Windows)                         |
| **Protocol**       | RPC/XDR                       | SMB packets over TCP 445                    |
| **Authentication** | Kerberos / UID mapping        | NTLM / Kerberos                             |
| **Naming**         | UNIX paths                    | UNC paths: `\\server\share`                 |
| **Locking**        | Advisory (v3), mandatory (v4) | Opportunistic locks (oplocks)               |
| **Linux support**  | Native                        | Via Samba (server) or `cifs` mount (client) |

---

## Distributed File Systems

For large-scale systems with petabytes of data across thousands of machines, traditional NFS does not scale. **Distributed file systems** were designed to handle this.

### Google File System (GFS)

| Feature           | Description                                        |
| ----------------- | -------------------------------------------------- |
| **Architecture**  | Single master + many chunkservers                  |
| **Chunk size**    | 64 MB (large to amortize metadata overhead)        |
| **Replication**   | Each chunk replicated 3× across chunkservers       |
| **Optimized for** | Large sequential reads and appends                 |
| **Consistency**   | Relaxed: concurrent appends may produce duplicates |

```text
  ┌──────────┐     metadata ops      ┌──────────────────┐
  │  Client  │◄──────────────────────►│   GFS Master     │
  │          │                        │  (namespace,     │
  │          │     data transfer      │   chunk mapping) │
  │          │◄──────────────────┐    └──────────────────┘
  └──────────┘                  │
                                │
            ┌───────────────────┼───────────────────┐
            │                   │                   │
       ┌────▼─────┐       ┌────▼─────┐       ┌────▼─────┐
       │ Chunk    │       │ Chunk    │       │ Chunk    │
       │ Server 1 │       │ Server 2 │       │ Server 3 │
       │ (replica)│       │ (replica)│       │ (replica)│
       └──────────┘       └──────────┘       └──────────┘
```

### HDFS (Hadoop Distributed File System)

| Feature           | Description                            |
| ----------------- | -------------------------------------- |
| **Based on**      | GFS paper (open-source implementation) |
| **Architecture**  | NameNode (master) + DataNodes          |
| **Block size**    | 128 MB (default)                       |
| **Replication**   | 3× default, rack-aware placement       |
| **Optimized for** | Batch processing (MapReduce/Spark)     |

### Comparison: NFS vs GFS vs HDFS

| Feature              | NFS                   | GFS                     | HDFS                 |
| -------------------- | --------------------- | ----------------------- | -------------------- |
| **Scale**            | Departmental          | Datacenter              | Datacenter           |
| **File size focus**  | Small to medium       | Very large              | Very large           |
| **Chunk/block size** | 4–64 KB               | 64 MB                   | 128 MB               |
| **Replication**      | None (rely on RAID)   | 3×                      | 3×                   |
| **Consistency**      | POSIX / close-to-open | Relaxed                 | Write-once-read-many |
| **Use case**         | Shared home dirs      | Web search index        | Big data analytics   |
| **Fault tolerance**  | Limited               | High (auto-rereplicate) | High                 |

---

## Try It Yourself

**Exercise 1:** On a Linux system, the root file system is ext4 on `/dev/sda1`, and a USB drive with FAT32 is on `/dev/sdb1`. Write the commands to mount the USB at `/mnt/usb` as read-only, then list its contents.

:::details Solution

```bash
# Create mount point (if it doesn't exist)
sudo mkdir -p /mnt/usb

# Mount FAT32 USB as read-only
sudo mount -t vfat -o ro /dev/sdb1 /mnt/usb

# List contents
ls -la /mnt/usb

# When done, unmount
sudo umount /mnt/usb
```

The `-t vfat` specifies the FAT32 file system type. The `-o ro` flag sets read-only mode. After mounting, files on the USB appear under `/mnt/usb/` as if they were local files in the directory tree.
:::

**Exercise 2:** Explain why the VFS layer is essential in modern operating systems. What would happen without it?

:::details Solution
Without VFS, **every application** would need to know what type of file system it is accessing (ext4, NTFS, NFS, etc.) and call different functions for each. This would mean:

1. **No portability**: A program written for ext4 wouldn't work on NTFS.
2. **Code duplication**: Every program re-implements file system detection logic.
3. **No transparent mounting**: You couldn't seamlessly mix ext4 and FAT32 in one directory tree.
4. **No network transparency**: NFS files couldn't be accessed with the same API as local files.

The VFS provides a **single, uniform interface** (`open`, `read`, `write`, `close`) that works identically regardless of the underlying file system. File system drivers register their implementations with the VFS, and the VFS dispatches calls to the correct driver based on which file system is mounted at the relevant path.
:::

**Exercise 3:** In NFS v3 (stateless), the server crashes and restarts. A client was in the middle of reading a large file. What happens? How does stateless design help?

:::details Solution
In NFSv3's stateless design:

1. The **server maintains no state** about which files clients have open or what byte offset they've reached.
2. When the server **crashes and restarts**, it simply comes back up — no recovery protocol is needed on the server side.
3. The **client** retries its pending RPC request. Since NFSv3 operations are **idempotent** (e.g., "read bytes 4096–8191 of file handle X"), re-sending the same request produces the same result.
4. The client uses the **file handle** (an opaque token encoding the file's identity) — the server can look up the file using this handle even after a restart.

The stateless design helps because:

- The server needs **no crash recovery** or state replay.
- The client simply retries with **no coordination**.
- Scalability improves because the server doesn't consume memory tracking per-client state.

The tradeoff: locking must be handled by a separate **Network Lock Manager (NLM)**, which IS stateful, making lock recovery after a crash more complex.
:::

---

## Key Takeaways

- **Mounting** attaches a file system on a device to a mount point in the directory tree, creating a unified namespace.
- The **mount table** tracks all mounted file systems, their mount points, types, and options.
- The **Virtual File System (VFS)** provides a uniform interface (superblock, inode, dentry, file objects) that abstracts away differences between file system implementations.
- **File sharing** on UNIX uses a three-tier permission model (owner/group/other) with `rwx` bits; **ACLs** provide per-user granularity.
- **Consistency semantics** define when one process's writes become visible to others: immediately (UNIX), on close (session/AFS), or never (immutable).
- **NFS** provides transparent network file access via RPC; NFSv3 is stateless (simple recovery) while NFSv4 is stateful (integrated locking).
- **SMB/CIFS** is the Windows equivalent of NFS, using TCP port 445 and UNC path naming.
- **Distributed file systems** (GFS, HDFS) scale to petabytes by splitting files into large chunks replicated across many machines.
- The VFS layer is what makes it possible to `open()` a file without caring whether it lives on a local SSD, a USB drive, or a server across the network.
