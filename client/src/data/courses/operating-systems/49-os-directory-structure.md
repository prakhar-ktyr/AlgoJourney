---
title: Directory Structure
section: "File Systems"
---

# Directory Structure

Files don't exist in isolation — they are organized into **directories** that give structure to the file system. A directory is like the table of contents in a book or the folder system in a filing cabinet. Without directories, a system with millions of files would be utterly unmanageable. In this lesson, we explore the various ways directories can be structured, from the simplest single-level approach to complex graph structures used in modern operating systems.

---

## What Is a Directory?

> A **directory** is a special file that contains a mapping (symbol table) of human-readable file names to internal file identifiers — such as inode numbers on UNIX or MFT record numbers on NTFS.

A directory itself is stored on disk just like any other file, but its contents have a specific structure defined by the file system.

### Directory Operations

| Operation               | Description                            | UNIX Command       |
| ----------------------- | -------------------------------------- | ------------------ |
| **Search**              | Find a file by name                    | `ls`, `find`       |
| **Create file**         | Add a new entry to the directory       | `touch`, `creat()` |
| **Delete file**         | Remove an entry from the directory     | `rm`, `unlink()`   |
| **List**                | Show all entries in the directory      | `ls`               |
| **Rename**              | Change a file's name                   | `mv`               |
| **Traverse**            | Visit every file in the directory tree | `find /`, `du`     |
| **Create subdirectory** | Make a new directory                   | `mkdir`            |
| **Delete subdirectory** | Remove an empty directory              | `rmdir`            |

---

## Single-Level Directory

The simplest structure: **all files live in one directory**.

```text
            Root Directory
  ┌─────┬─────┬─────┬─────┬─────┬─────┐
  │ cat │ bo  │ a   │ test│ data│ mail│
  │ .c  │ .f  │     │ .py │ .db │     │
  └──┬──┴──┬──┴──┬──┴──┬──┴──┬──┴──┬──┘
     │     │     │     │     │     │
     ▼     ▼     ▼     ▼     ▼     ▼
  (files on disk — all at the same level)
```

### Characteristics

| Advantage                     | Disadvantage                                              |
| ----------------------------- | --------------------------------------------------------- |
| Simple to implement           | **Naming collisions**: no two files can share a name      |
| Easy to understand            | **No logical grouping**: can't organize related files     |
| Fast lookup for small systems | **Unusable at scale**: thousands of files become chaos    |
|                               | **No per-user separation**: all users share one namespace |

> [!WARNING]
> The single-level directory was used in very early systems but is completely impractical for modern multi-user operating systems.

---

## Two-Level Directory

**Each user gets their own private directory**, but there is no further nesting.

```text
                    Master File Directory (MFD)
                 ┌──────────┬──────────┬──────────┐
                 │  User 1  │  User 2  │  User 3  │
                 └────┬─────┴────┬─────┴────┬─────┘
                      │          │          │
              ┌───────┴───┐  ┌──┴──────┐  ┌┴─────────┐
              │  UFD 1    │  │  UFD 2  │  │  UFD 3   │
              ├───────────┤  ├─────────┤  ├──────────┤
              │ cat.c     │  │ cat.c   │  │ prog.py  │
              │ data.txt  │  │ bo.f    │  │ data.txt │
              │ test.py   │  │ list.c  │  │ notes.md │
              └───────────┘  └─────────┘  └──────────┘
```

### Path Names

With two levels, we introduce the concept of **path names**:

```text
/user1/cat.c        — Full path to user1's cat.c
/user2/cat.c        — Different file! Belongs to user2
```

| Advantage                                         | Disadvantage                               |
| ------------------------------------------------- | ------------------------------------------ |
| Different users can have files with the same name | Only one level of organization per user    |
| Provides basic user isolation                     | Users cannot create subdirectories         |
| Efficient search (small per-user directories)     | Sharing files between users is complicated |

---

## Tree-Structured Directory

The most natural and widely used structure: directories can contain both **files and subdirectories**, forming a tree (hierarchy).

```text
                           / (root)
                    ┌──────┼──────────┐
                    │      │          │
                  home    etc       usr
                 ┌──┴──┐   │      ┌──┴──┐
               alice  bob  │    bin    lib
               ┌─┴─┐  │   │     │      │
             docs  .c  │ passwd  ls   libc.so
              │       code
            report     │
                     main.py
```

### Absolute vs Relative Paths

| Path Type         | Description                           | Example                                 |
| ----------------- | ------------------------------------- | --------------------------------------- |
| **Absolute path** | Starts from root `/`                  | `/home/alice/docs/report`               |
| **Relative path** | Starts from current working directory | `docs/report` (if CWD is `/home/alice`) |
| **`.`**           | Current directory                     | `./main.py`                             |
| **`..`**          | Parent directory                      | `../bob/code/main.py`                   |

### Current Working Directory (CWD)

Every process has a **current working directory** — the default directory for relative path resolution.

```c
#include <unistd.h>
#include <stdio.h>

int main() {
    char cwd[1024];
    getcwd(cwd, sizeof(cwd));
    printf("Current directory: %s\n", cwd);

    // Change directory
    chdir("/home/alice/docs");
    getcwd(cwd, sizeof(cwd));
    printf("New directory: %s\n", cwd);
    return 0;
}
```

| Advantage                         | Disadvantage                                        |
| --------------------------------- | --------------------------------------------------- |
| Natural hierarchical organization | No file or directory sharing (pure tree)            |
| Arbitrary nesting depth           | Deleting a directory requires deleting all contents |
| Absolute and relative paths       | Each file has exactly one path                      |
| Scales to millions of files       | No way to have a file appear in two directories     |

---

## Acyclic-Graph Directory

To enable **file sharing** without duplication, we extend the tree to an **acyclic graph**. A single file or directory can appear in multiple parent directories via **links**.

```text
                           / (root)
                    ┌──────┼──────────┐
                    │      │          │
                  home    etc       shared
                 ┌──┴──┐              │
               alice  bob         project/
               │      │          ┌───┤
             docs   docs      code  data.csv
              │       │          │
           report  ───┘       main.py
              │
           data.csv ─────────── (same file as /shared/data.csv)
```

### Hard Links vs Symbolic (Soft) Links

| Feature                     | Hard Link                    | Symbolic Link                |
| --------------------------- | ---------------------------- | ---------------------------- |
| **Points to**               | Inode (direct reference)     | Pathname (indirect)          |
| **Cross file systems**      | No                           | Yes                          |
| **Cross to directories**    | Usually no (prevents cycles) | Yes                          |
| **Detects target deletion** | Automatic (link count)       | No — becomes **dangling**    |
| **Storage overhead**        | Just a directory entry       | Small file storing the path  |
| **Speed**                   | Same as original             | Extra lookup to resolve path |
| **Command**                 | `ln target link`             | `ln -s target link`          |

### Creating Links

```c
#include <unistd.h>

int main() {
    // Hard link: new name for same inode
    link("/home/alice/data.csv", "/shared/data.csv");

    // Symbolic link: stores path as data
    symlink("/home/alice/data.csv", "/home/bob/data.csv");

    return 0;
}
```

```python
import os

# Hard link
os.link("/home/alice/data.csv", "/shared/data.csv")

# Symbolic link
os.symlink("/home/alice/data.csv", "/home/bob/data.csv")
```

### The Dangling Pointer Problem

When the target of a symbolic link is deleted, the symlink still exists but points to nothing:

```text
Before deletion:
  /home/bob/data.csv  →  (symlink)  →  /home/alice/data.csv  →  inode 5032

After alice deletes her file:
  /home/bob/data.csv  →  (symlink)  →  /home/alice/data.csv  →  ??? (DANGLING!)
```

> [!WARNING]
> Accessing a dangling symlink produces an error: `No such file or directory`. The symlink itself still exists and consumes a directory entry — it must be explicitly removed with `rm` or `unlink()`.

### Reference Counting for Hard Links

Hard links use **reference counting** to track how many directory entries point to the same inode:

```text
  Directory Entry 1: "report.txt" → inode 5032 (link_count = 2)
  Directory Entry 2: "final.txt"  → inode 5032
                                           │
                                     ┌─────┴─────┐
                                     │  Inode 5032│
                                     │  links: 2  │
                                     │  size: 4096│
                                     │  blocks: 8 │
                                     └────────────┘

  After: unlink("report.txt")
  Directory Entry 2: "final.txt"  → inode 5032 (link_count = 1)
                                           │
                                     ┌─────┴─────┐
                                     │  Inode 5032│
                                     │  links: 1  │  ← decremented, file NOT deleted
                                     └────────────┘

  After: unlink("final.txt")
    link_count = 0 → OS frees inode and data blocks
```

---

## General Graph Directory

If we allow **arbitrary links including to ancestor directories**, we get a **general graph** that may contain **cycles**.

```text
                        / (root)
                   ┌────┼────┐
                   │    │    │
                  A     B    C
                  │     │    │
                  D     E    F
                  │     │  ╱ │
                  └─────┼─╱──┘
                        │╱
                        G ───► B   (cycle! G points back to B)
```

### Problems with Cycles

| Problem                       | Description                                                                        |
| ----------------------------- | ---------------------------------------------------------------------------------- |
| **Infinite traversal**        | `find /` or backup programs loop forever                                           |
| **Deletion complexity**       | Cannot use simple reference counting — self-referencing cycles never reach count 0 |
| **Garbage collection needed** | Must use mark-and-sweep or similar to detect unreachable structures                |

### How Systems Prevent Cycles

| Strategy                               | Description                                                     |
| -------------------------------------- | --------------------------------------------------------------- |
| **Restrict hard links to files only**  | UNIX: hard links to directories forbidden (except `.` and `..`) |
| **Allow only symlinks to directories** | Symlinks can cause cycles but traversal tools skip them         |
| **Cycle detection**                    | Check for cycles on every new link (expensive)                  |
| **Garbage collection**                 | Periodically scan for unreachable file system structures        |

> [!IMPORTANT]
> Modern UNIX systems prevent cycles by forbidding hard links to directories. Only the kernel creates the `.` and `..` entries. Symbolic links may form cycles, but tools like `find` use `-L` carefully and track visited inodes.

---

## Path Resolution Algorithm

When you access a file like `/home/alice/docs/report.txt`, the OS resolves the path step by step:

```text
Path: /home/alice/docs/report.txt

Step 1: Start at root inode (inode 2)
        Read root directory: find "home" → inode 45

Step 2: Read inode 45 (directory /home)
        Read directory: find "alice" → inode 1001

Step 3: Read inode 1001 (directory /home/alice)
        Read directory: find "docs" → inode 1042

Step 4: Read inode 1042 (directory /home/alice/docs)
        Read directory: find "report.txt" → inode 3078

Step 5: Read inode 3078 — this is the target file!
        Return file attributes and data block locations.
```

### Path Resolution Detail

| Step | Inode Read | Directory Searched | Entry Found  | Next Inode |
| ---- | ---------- | ------------------ | ------------ | ---------- |
| 1    | 2 (root)   | `/`                | `home`       | 45         |
| 2    | 45         | `/home`            | `alice`      | 1001       |
| 3    | 1001       | `/home/alice`      | `docs`       | 1042       |
| 4    | 1042       | `/home/alice/docs` | `report.txt` | 3078       |
| 5    | 3078       | (target file)      | —            | —          |

> [!NOTE]
> Each step requires at least **one disk read** for the inode and possibly another for the directory data blocks. This is why the OS caches directory entries in the **dentry cache** (dcache) to speed up path lookups.

---

## UNIX Directory Implementation

### The Inode

On UNIX, every file (including directories) has an **inode** containing all metadata except the file name:

| Inode Field       | Description                         |
| ----------------- | ----------------------------------- |
| `i_mode`          | File type and permissions           |
| `i_uid` / `i_gid` | Owner and group                     |
| `i_size`          | File size in bytes                  |
| `i_atime`         | Last access time                    |
| `i_mtime`         | Last modification time              |
| `i_ctime`         | Last status change time             |
| `i_links_count`   | Number of hard links                |
| `i_blocks`        | Number of 512-byte blocks allocated |
| `i_block[15]`     | Pointers to data blocks             |

### Directory Entry (dirent)

A UNIX directory is a file whose data blocks contain a list of **directory entries**:

```text
Directory /home/alice (inode 1001):

  ┌────────────┬────────────────┬────────┐
  │ Inode Num  │    Name        │ Length │
  ├────────────┼────────────────┼────────┤
  │   1001     │    .           │   12   │  ← current directory
  │     45     │    ..          │   12   │  ← parent directory
  │   1042     │    docs        │   16   │
  │   1050     │    .bashrc     │   20   │
  │   1051     │    hello.c     │   20   │
  │   1060     │    notes.md    │   20   │
  └────────────┴────────────────┴────────┘
```

### The `.` and `..` Entries

| Entry | Points To                     | Purpose               |
| ----- | ----------------------------- | --------------------- |
| `.`   | Current directory's own inode | Enables `./script.sh` |
| `..`  | Parent directory's inode      | Enables `cd ..`       |

For the root directory, `..` points to itself (inode 2 → inode 2).

### Verifying with `ls -lai`

```text
$ ls -lai /home/alice/
total 24
1001 drwxr-xr-x 4 alice alice 4096 Jun  1 10:00 .
  45 drwxr-xr-x 5 root  root  4096 May 15 08:00 ..
1042 drwxr-xr-x 2 alice alice 4096 Jun  1 09:30 docs
1050 -rw-r--r-- 1 alice alice  220 May 10 12:00 .bashrc
1051 -rw-r--r-- 1 alice alice  152 Jun  1 09:45 hello.c
1060 -rw-r--r-- 1 alice alice  890 Jun  1 10:00 notes.md
```

The first column shows inode numbers. Note that `.` is inode 1001 (the directory itself) and `..` is inode 45 (`/home`).

---

## Comparison of Directory Structures

| Feature               | Single-Level            | Two-Level       | Tree                 | Acyclic Graph             | General Graph      |
| --------------------- | ----------------------- | --------------- | -------------------- | ------------------------- | ------------------ |
| **Nesting**           | None                    | 1 level (users) | Unlimited            | Unlimited                 | Unlimited          |
| **Naming**            | Must be unique globally | Unique per user | Unique per directory | Same file, multiple names | Same + cycles      |
| **Sharing**           | None                    | None            | None                 | Yes (links)               | Yes (links)        |
| **Cycle risk**        | No                      | No              | No                   | No (acyclic enforced)     | Yes                |
| **Search efficiency** | O(n)                    | O(n/users)      | O(path length)       | O(path length)            | O(path length)     |
| **Deletion**          | Simple                  | Simple          | Recursive            | Reference counting/GC     | Garbage collection |
| **Used by**           | CP/M                    | Early UNIX      | DOS                  | Modern UNIX, macOS        | Theoretical        |
| **Complexity**        | Trivial                 | Low             | Moderate             | Moderate                  | High               |

> _"The directory structure is the user's interface to the file system. The choice of directory structure fundamentally affects the usability and efficiency of the system."_ — Andrew S. Tanenbaum

---

## Try It Yourself

**Exercise 1:** Given the following directory tree, list all absolute paths and determine the inode link count for directory `/home`:

```text
         / (root, inode 2)
        ├── home (inode 10)
        │   ├── alice (inode 20)
        │   │   ├── file1.txt (inode 30)
        │   │   └── file2.txt (inode 31)
        │   └── bob (inode 21)
        │       └── code (inode 40)
        └── etc (inode 11)
            └── passwd (inode 50)
```

:::details Solution
**Absolute paths:**

- `/home`
- `/home/alice`
- `/home/alice/file1.txt`
- `/home/alice/file2.txt`
- `/home/bob`
- `/home/bob/code`
- `/etc`
- `/etc/passwd`

**Link count for `/home` (inode 10):**
Each directory has at least 2 links: its entry in the parent directory and its own `.` entry. Each subdirectory adds one more via its `..` entry.

- Parent entry: `/home` in root → 1
- Self entry: `/home/.` → 1
- Child `..` from alice: `/home/alice/..` → 1
- Child `..` from bob: `/home/bob/..` → 1

**Total link count: 4**
:::

**Exercise 2:** A file `/data/report.csv` has inode 8080 and link count 1. You create a hard link and a symbolic link:

```
ln /data/report.csv /backup/report_copy.csv
ln -s /data/report.csv /home/user/report_link.csv
```

What is the new link count of inode 8080? What happens if you delete the original file?

:::details Solution
After creating the hard link:

- Inode 8080's link count becomes **2** (original + hard link).
- The symbolic link does NOT affect the link count (it's a separate inode storing the path string).

If you delete `/data/report.csv`:

- Link count drops from 2 to **1** (the hard link `/backup/report_copy.csv` still exists).
- The file is NOT deleted because the link count is still > 0.
- `/backup/report_copy.csv` works perfectly — it's the same inode.
- `/home/user/report_link.csv` becomes a **dangling symlink** — accessing it gives "No such file or directory."
  :::

**Exercise 3:** How many disk reads (inode reads + directory block reads) are required to resolve the path `/home/alice/docs/report.txt` from scratch (cold cache)?

:::details Solution
For each path component, we need:

1. Read the inode of the current directory
2. Read the directory's data block(s) to find the next component

| Step | Read inode     | Read directory block         | Find entry                |
| ---- | -------------- | ---------------------------- | ------------------------- |
| 1    | Inode 2 (root) | Root dir block               | `home` → inode 45         |
| 2    | Inode 45       | `/home` dir block            | `alice` → inode 1001      |
| 3    | Inode 1001     | `/home/alice` dir block      | `docs` → inode 1042       |
| 4    | Inode 1042     | `/home/alice/docs` dir block | `report.txt` → inode 3078 |
| 5    | Inode 3078     | (target file — no dir read)  | —                         |

Total: **5 inode reads + 4 directory block reads = 9 disk reads** (minimum, assuming single-block directories and inode table not cached).

In practice, the OS caches frequently accessed inodes and directory entries (dcache), so subsequent lookups are much faster.
:::

---

## Key Takeaways

- A **directory** is a file containing a symbol table that maps file names to file identifiers (inode numbers).
- **Single-level** directories are simple but impractical — naming collisions and no organization.
- **Two-level** directories add per-user separation but no hierarchy within a user's space.
- **Tree-structured** directories provide unlimited nesting with absolute and relative paths — the foundation of modern file systems.
- **Acyclic-graph** directories enable file sharing through **hard links** (same inode) and **symbolic links** (path pointer).
- Hard links use **reference counting** — the file is freed only when the last link is removed. Symbolic links can become **dangling** if the target is deleted.
- **General graph** directories allow cycles, which complicate traversal and require **garbage collection** for deletion — avoided by modern UNIX systems.
- Path resolution walks the directory tree component by component, reading inodes and directory blocks at each step.
- UNIX directories store entries as `(inode_number, name)` pairs, with special `.` and `..` entries for self-reference and parent navigation.
