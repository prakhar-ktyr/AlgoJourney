---
title: Hard Links & Symbolic Links
---

# Hard Links & Symbolic Links

In this lesson, you will learn about two types of links in Linux: hard links and symbolic (soft) links.

Links let you create multiple references to the same file — a powerful concept used throughout the Linux system.

---

## Understanding Inodes

Before learning about links, you need to understand **inodes**.

### What Is an Inode?

An **inode** (index node) is a data structure on the filesystem that stores metadata about a file:

- File size
- Ownership (user and group)
- Permissions
- Timestamps (created, modified, accessed)
- Location of data blocks on disk
- Number of hard links

### What an Inode Does NOT Store

- The filename
- The file contents (it stores pointers to the content)

### The Relationship

```
Filename → Inode → Data on disk
```

A filename is just a "label" that points to an inode. The inode then points to the actual data.

### View a File's Inode

```bash
ls -i filename.txt
# 1234567 filename.txt
```

The number `1234567` is the inode number.

### View Detailed Inode Information

```bash
stat filename.txt
```

Look for the "Inode" field in the output.

### Why This Matters for Links

Since a filename is just a pointer to an inode, **multiple filenames can point to the same inode**. That's what a hard link is!

---

## Hard Links

A hard link creates another filename that points to the **same inode** (and therefore the same data).

### Creating a Hard Link

```bash
ln source_file link_name
```

### Example

```bash
# Create a file
echo "Hello, World!" > original.txt

# Create a hard link
ln original.txt hardlink.txt

# Both files exist and have the same content
cat original.txt
# Hello, World!

cat hardlink.txt
# Hello, World!
```

### Verifying Hard Links Share an Inode

```bash
ls -i original.txt hardlink.txt
# 1234567 original.txt
# 1234567 hardlink.txt
```

Same inode number! They're literally the same file with two names.

### The Link Count

```bash
ls -l original.txt
# -rw-r--r-- 2 user group 14 Mar 15 10:00 original.txt
```

The `2` after the permissions is the **link count** — how many filenames point to this inode.

### Modifying Through Either Name

Since both names point to the same data, changes through one appear in the other:

```bash
echo "New content" > original.txt
cat hardlink.txt
# New content
```

```bash
echo "Changed via link" > hardlink.txt
cat original.txt
# Changed via link
```

### Deleting the Original

This is the key advantage of hard links — deleting the "original" does NOT delete the data:

```bash
rm original.txt
cat hardlink.txt
# Changed via link  ← Still works!
```

The data is only deleted when the **last** hard link is removed (link count reaches 0).

### Hard Link Limitations

1. **Cannot cross filesystems:** Both names must be on the same filesystem/partition.

```bash
ln /home/user/file.txt /mnt/usb/link.txt
# ln: failed to create hard link: Invalid cross-device link
```

2. **Cannot link to directories:** To prevent filesystem loops.

```bash
ln /home/user/projects/ /tmp/projects_link
# ln: /home/user/projects/: hard link not allowed for directory
```

3. **Cannot tell which is the "original":** All hard links are equal — there's no "original" and "copy."

---

## Symbolic Links (Symlinks)

A symbolic link (or soft link) is a special file that **points to the path** of another file.

### Creating a Symbolic Link

```bash
ln -s target_path link_name
```

The `-s` flag is what makes it symbolic instead of hard.

### Example

```bash
# Create a file
echo "Hello, World!" > original.txt

# Create a symbolic link
ln -s original.txt symlink.txt

# Read through the symlink
cat symlink.txt
# Hello, World!
```

### Verifying Symlinks

```bash
ls -l symlink.txt
# lrwxrwxrwx 1 user group 12 Mar 15 10:00 symlink.txt -> original.txt
```

Notice:
- The `l` at the start indicates it's a link
- The `->` shows what it points to
- The permissions are always `rwxrwxrwx` (the target's permissions apply)

### Different Inodes

Unlike hard links, symlinks have their own inode:

```bash
ls -i original.txt symlink.txt
# 1234567 original.txt
# 7654321 symlink.txt
```

Different inode numbers — these are different filesystem objects.

### Symlinks Can Cross Filesystems

```bash
ln -s /home/user/file.txt /mnt/usb/link.txt
# Works!
```

### Symlinks Can Link to Directories

```bash
ln -s /home/user/projects/ /tmp/projects_link
# Works!

cd /tmp/projects_link
ls  # Shows contents of /home/user/projects/
```

### Dangling Symlinks

If the target is deleted, the symlink becomes "dangling" (broken):

```bash
# Create file and symlink
echo "data" > target.txt
ln -s target.txt link.txt

# Delete the target
rm target.txt

# The symlink still exists but is broken
cat link.txt
# cat: link.txt: No such file or directory

ls -l link.txt
# lrwxrwxrwx 1 user group 10 Mar 15 10:00 link.txt -> target.txt
# (shown in red on most terminals)
```

### Finding Dangling Symlinks

```bash
# Find all broken symlinks in current directory
find . -xtype l

# Find broken symlinks in a specific path
find /path/to/search -xtype l
```

---

## Hard Links vs Symbolic Links

| Feature | Hard Link | Symbolic Link |
|---------|-----------|---------------|
| Points to | Inode (data) | Path (filename) |
| Own inode | No (shares inode) | Yes (separate inode) |
| Cross filesystems | No | Yes |
| Link to directories | No | Yes |
| Target deleted | Still works | Becomes dangling |
| Shows as link in ls -l | No | Yes (l prefix, ->) |
| File size | Same as original | Size of path string |
| Creation command | `ln source link` | `ln -s target link` |
| Relative/absolute path | N/A | Matters |

### When to Use Hard Links

- Backup systems (save space, data persists even if one name deleted)
- When you need guaranteed access to data regardless of other deletions
- When both files must be on the same filesystem

### When to Use Symbolic Links

- Linking to directories
- Linking across filesystems
- Creating shortcuts to deeply nested paths
- Version management (link to current version)
- Configuration management

---

## Relative vs Absolute Symlinks

Symlinks can use relative or absolute paths:

### Absolute Symlink

```bash
ln -s /home/user/documents/report.txt /tmp/report_link
```

Always works regardless of where you are, but breaks if the target is moved.

### Relative Symlink

```bash
cd /home/user/
ln -s documents/report.txt report_link
```

Relative to the **link's location**, not your current directory.

### Example: Relative Link in Same Directory

```bash
cd /home/user/projects/
ln -s app.py current_app
# current_app -> app.py (relative to /home/user/projects/)
```

### Example: Relative Link in Different Directory

```bash
# Link in /tmp pointing to /home/user/projects/app.py
ln -s ../home/user/projects/app.py /tmp/app_link
# This only works if the relative path from /tmp to the target is correct
```

**Best Practice:** Use absolute paths for symlinks unless the link and target will always maintain the same relative position (e.g., within the same project).

---

## Real-World Uses of Links

### 1. Versioned Deployments

```bash
# Deploy versions in numbered directories
/opt/myapp/releases/v1.0/
/opt/myapp/releases/v1.1/
/opt/myapp/releases/v2.0/

# Symlink "current" to the active version
ln -s /opt/myapp/releases/v2.0 /opt/myapp/current

# To roll back:
rm /opt/myapp/current
ln -s /opt/myapp/releases/v1.1 /opt/myapp/current
```

### 2. Configuration Management

```bash
# Enable a site in Nginx
ln -s /etc/nginx/sites-available/mysite.conf /etc/nginx/sites-enabled/

# Disable it
rm /etc/nginx/sites-enabled/mysite.conf
```

### 3. Shared Libraries

```bash
ls -l /usr/lib/libssl*
# libssl.so -> libssl.so.3
# libssl.so.3 -> libssl.so.3.0.0
# libssl.so.3.0.0 (actual file)
```

### 4. Dotfile Management

```bash
# Keep dotfiles in a git repo, symlink to home
ln -s ~/dotfiles/.bashrc ~/.bashrc
ln -s ~/dotfiles/.vimrc ~/.vimrc
ln -s ~/dotfiles/.gitconfig ~/.gitconfig
```

---

## Managing Links

### Removing Links

```bash
# Remove a symlink (doesn't affect target)
rm symlink_name
# or
unlink symlink_name

# Remove a hard link (doesn't affect data unless last link)
rm hardlink_name
```

**Important:** When removing a symlink to a directory, do NOT add a trailing slash:

```bash
# CORRECT — removes the symlink
rm link_to_dir

# WRONG — might try to remove contents of the target directory!
rm -r link_to_dir/
```

### Updating a Symlink

You can't edit a symlink. Remove and recreate it:

```bash
rm current_version
ln -s /opt/app/v2.0 current_version
```

Or use `-f` to force overwrite:

```bash
ln -sf /opt/app/v2.0 current_version
```

---

## Practical Exercises

### Exercise 1: Creating and Testing Hard Links

```bash
# Create a file
echo "Original content" > data.txt

# Create a hard link
ln data.txt data_link.txt

# Verify same inode
ls -i data.txt data_link.txt

# Check link count
ls -l data.txt

# Modify through the link
echo "Modified via link" >> data_link.txt
cat data.txt

# Delete the original
rm data.txt
cat data_link.txt  # Still works!
```

### Exercise 2: Creating and Testing Symlinks

```bash
# Create a file
echo "Target file content" > target.txt

# Create a symbolic link
ln -s target.txt my_link

# Verify it's a symlink
ls -l my_link

# Check different inodes
ls -i target.txt my_link

# Delete target — link breaks
rm target.txt
cat my_link  # Error: No such file or directory
ls -l my_link  # Shows broken link

# Recreate target — link works again!
echo "New content" > target.txt
cat my_link  # Works!
```

### Exercise 3: Version Switching with Symlinks

```bash
# Simulate versioned releases
mkdir -p releases/v1 releases/v2 releases/v3
echo "Version 1" > releases/v1/app.txt
echo "Version 2" > releases/v2/app.txt
echo "Version 3" > releases/v3/app.txt

# Set current version
ln -s releases/v3 current

# Check current
cat current/app.txt
# Version 3

# Switch to v2 (rollback)
ln -sf releases/v2 current
cat current/app.txt
# Version 2
```

### Exercise 4: Identifying Link Types

```bash
# Create both types
echo "test data" > source.txt
ln source.txt hard_link.txt
ln -s source.txt soft_link.txt

# Compare using ls -l
ls -li source.txt hard_link.txt soft_link.txt
# Note: hard_link.txt shares inode with source.txt
# Note: soft_link.txt has 'l' prefix and shows ->

# Compare using stat
stat source.txt hard_link.txt soft_link.txt

# Check with file command
file hard_link.txt   # Shows regular file
file soft_link.txt   # Shows symbolic link
```

---

## Quick Reference

| Command | Description |
|---------|-------------|
| `ln source link` | Create hard link |
| `ln -s target link` | Create symbolic link |
| `ln -sf target link` | Create/overwrite symbolic link |
| `ls -i file` | Show inode number |
| `ls -l file` | Show link info (l prefix, ->) |
| `stat file` | Show detailed inode info |
| `find . -type l` | Find all symlinks |
| `find . -xtype l` | Find broken symlinks |
| `find / -inum N` | Find all hard links to inode N |
| `readlink link` | Show symlink target |
| `unlink link` | Remove a link |

---

## Summary

In this lesson, you learned:

- An inode stores file metadata and points to data on disk
- A filename is just a label pointing to an inode
- Hard links share the same inode (same data, different names)
- Deleting a hard link doesn't delete data until the last link is removed
- Hard links can't cross filesystems or link to directories
- Symbolic links point to a path (not an inode)
- Symlinks can cross filesystems and link to directories
- Dangling symlinks occur when the target is deleted
- Symlinks are used for versioning, configuration, and shortcuts
- Use `ln` for hard links and `ln -s` for symbolic links

---
