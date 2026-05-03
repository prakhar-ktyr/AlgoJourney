---
title: File Permissions
---

# File Permissions

Linux uses a powerful permission system to control who can read, write, or execute files. Understanding permissions is essential for system security and proper file management.

---

## The Permission Model

Every file and directory in Linux has three types of permissions:

| Permission | Symbol | Numeric Value | Meaning |
|-----------|--------|---------------|---------|
| Read | r | 4 | View file contents / list directory |
| Write | w | 2 | Modify file / add/remove files in directory |
| Execute | x | 1 | Run file as program / enter directory |

---

## Permission Groups

Permissions are assigned to three groups of users:

| Group | Symbol | Description |
|-------|--------|-------------|
| Owner | u | The user who owns the file |
| Group | g | Users in the file's group |
| Others | o | Everyone else on the system |

There is also a shortcut:

| Symbol | Description |
|--------|-------------|
| a | All (owner + group + others) |

---

## Reading ls -l Output

The `ls -l` command shows file permissions in detail:

```bash
ls -l myfile.txt
```

Output:

```bash
-rwxr-xr-- 1 alice developers 4096 Jan 15 10:30 myfile.txt
```

Let's break down the permission string `-rwxr-xr--`:

```bash
-  rwx  r-x  r--
│  │    │    │
│  │    │    └── Others: read only
│  │    └─────── Group: read + execute
│  └──────────── Owner: read + write + execute
└─────────────── File type: - = regular file
```

### File Type Characters

| Character | Meaning |
|-----------|---------|
| - | Regular file |
| d | Directory |
| l | Symbolic link |
| b | Block device |
| c | Character device |

### Character-by-Character Breakdown

```bash
Position 1:    File type (- d l b c)
Position 2-4:  Owner permissions (rwx)
Position 5-7:  Group permissions (rwx)
Position 8-10: Others permissions (rwx)
```

### More Examples

```bash
drwxr-xr-x   # Directory, owner=rwx, group=r-x, others=r-x
-rw-r--r--   # File, owner=rw-, group=r--, others=r--
-rwx------   # File, owner=rwx, group=none, others=none
lrwxrwxrwx   # Symbolic link (always shows full permissions)
```

---

## chmod — Changing Permissions

The `chmod` (change mode) command modifies file permissions. It supports two modes: symbolic and numeric.

---

## Symbolic Mode

Symbolic mode uses letters and operators to change permissions.

### Operators

| Operator | Meaning |
|----------|---------|
| + | Add permission |
| - | Remove permission |
| = | Set exact permission |

### Add Execute for Owner

```bash
chmod u+x script.sh
```

Before: `-rw-r--r--`
After: `-rwxr--r--`

### Remove Write from Group and Others

```bash
chmod go-w shared.txt
```

Before: `-rw-rw-rw-`
After: `-rw-r--r--`

### Add Read for All

```bash
chmod a+r document.txt
```

Before: `-rw-------`
After: `-rw-r--r--`

### Set Exact Permissions

```bash
chmod u=rwx,g=rx,o=r myfile.txt
```

Result: `-rwxr-xr--`

### Multiple Changes at Once

```bash
chmod u+x,g-w,o-r file.txt
```

### Remove All Permissions for Others

```bash
chmod o= private.txt
```

Before: `-rw-r--r--`
After: `-rw-r-----`

### Add Execute for Owner and Group

```bash
chmod ug+x script.sh
```

---

## Numeric (Octal) Mode

Numeric mode uses a three-digit number. Each digit is the sum of permissions:

```bash
r = 4
w = 2
x = 1
```

### Calculate Permission Number

| Permissions | Calculation | Number |
|-------------|-------------|--------|
| rwx | 4+2+1 | 7 |
| rw- | 4+2+0 | 6 |
| r-x | 4+0+1 | 5 |
| r-- | 4+0+0 | 4 |
| -wx | 0+2+1 | 3 |
| -w- | 0+2+0 | 2 |
| --x | 0+0+1 | 1 |
| --- | 0+0+0 | 0 |

### chmod 755

```bash
chmod 755 script.sh
```

- Owner: 7 (rwx) — full access
- Group: 5 (r-x) — read and execute
- Others: 5 (r-x) — read and execute

Result: `-rwxr-xr-x`

### chmod 644

```bash
chmod 644 document.txt
```

- Owner: 6 (rw-) — read and write
- Group: 4 (r--) — read only
- Others: 4 (r--) — read only

Result: `-rw-r--r--`

### chmod 700

```bash
chmod 700 private_script.sh
```

- Owner: 7 (rwx) — full access
- Group: 0 (---) — no access
- Others: 0 (---) — no access

Result: `-rwx------`

---

## Common Permission Patterns

| Octal | Symbolic | Use Case |
|-------|----------|----------|
| 755 | rwxr-xr-x | Executable scripts, directories |
| 644 | rw-r--r-- | Regular files, documents |
| 700 | rwx------ | Private scripts |
| 600 | rw------- | Private files (SSH keys) |
| 777 | rwxrwxrwx | Full access for everyone (avoid!) |
| 750 | rwxr-x--- | Group-shared executables |
| 640 | rw-r----- | Group-readable files |
| 444 | r--r--r-- | Read-only for everyone |

---

## chmod -R — Recursive Permissions

Change permissions for a directory and all its contents:

```bash
chmod -R 755 /var/www/html
```

### Be Careful with Recursive chmod

```bash
# This makes ALL files executable (usually wrong)
chmod -R 755 project/

# Better: set directories and files separately
find project/ -type d -exec chmod 755 {} \;
find project/ -type f -exec chmod 644 {} \;
```

### Make Scripts Executable Recursively

```bash
find scripts/ -name "*.sh" -exec chmod +x {} \;
```

---

## Default Permissions & umask

When you create a new file or directory, the default permissions are determined by `umask`.

### View Current umask

```bash
umask
```

Output: `0022`

### How umask Works

The umask is subtracted from the maximum permissions:

```bash
# Files maximum: 666 (no execute by default)
# Directories maximum: 777

# With umask 022:
# New file: 666 - 022 = 644 (rw-r--r--)
# New directory: 777 - 022 = 755 (rwxr-xr-x)
```

### Common umask Values

| umask | File Permissions | Directory Permissions | Use Case |
|-------|-----------------|----------------------|----------|
| 022 | 644 (rw-r--r--) | 755 (rwxr-xr-x) | Default |
| 027 | 640 (rw-r-----) | 750 (rwxr-x---) | Group-friendly |
| 077 | 600 (rw-------) | 700 (rwx------) | Private |
| 002 | 664 (rw-rw-r--) | 775 (rwxrwxr-x) | Collaborative |

### Set umask

```bash
# Set restrictive umask
umask 077

# Create a file — it will be 600
touch secret.txt
ls -l secret.txt
# -rw------- 1 alice alice 0 Jan 15 10:30 secret.txt
```

### Permanent umask

Add to `~/.bashrc` or `~/.profile`:

```bash
echo "umask 027" >> ~/.bashrc
```

---

## Directory Permissions

Permissions mean different things for directories:

| Permission | For Files | For Directories |
|-----------|-----------|-----------------|
| r (read) | View content | List files (ls) |
| w (write) | Modify content | Create/delete files |
| x (execute) | Run as program | Enter directory (cd) |

### Examples

```bash
# Can list but not enter
chmod 744 mydir/     # drwxr--r--
ls mydir/            # Works
cd mydir/            # Permission denied!

# Can enter but not list
chmod 711 mydir/     # drwx--x--x
cd mydir/            # Works
ls mydir/            # Permission denied!
# But: cat mydir/known-file.txt  # Works if you know the name

# Can enter and list
chmod 755 mydir/     # drwxr-xr-x
cd mydir/            # Works
ls mydir/            # Works
```

### The Sticky Bit

The sticky bit on a directory means only the file owner can delete their files:

```bash
# Set sticky bit
chmod +t /tmp

# Or with numeric mode (leading 1)
chmod 1777 /tmp

ls -ld /tmp
# drwxrwxrwt 10 root root 4096 Jan 15 10:30 /tmp
#         ^ t = sticky bit
```

---

## Practical Permission Exercises

### Exercise 1: Secure a Script

```bash
# Create a script
echo '#!/bin/bash' > backup.sh
echo 'echo "Running backup..."' >> backup.sh

# Make it executable only by owner
chmod 700 backup.sh

# Verify
ls -l backup.sh
# -rwx------ 1 alice alice 42 Jan 15 10:30 backup.sh
```

### Exercise 2: Set Up a Shared Directory

```bash
# Create shared directory
mkdir shared_project

# Set permissions: owner full, group read+execute
chmod 750 shared_project

# Verify
ls -ld shared_project
# drwxr-x--- 2 alice developers 4096 Jan 15 10:30 shared_project
```

### Exercise 3: Protect SSH Keys

```bash
# SSH requires strict permissions
chmod 700 ~/.ssh
chmod 600 ~/.ssh/id_rsa
chmod 644 ~/.ssh/id_rsa.pub
chmod 600 ~/.ssh/config

# Verify
ls -la ~/.ssh/
```

### Exercise 4: Web Server Files

```bash
# Typical web server setup
chmod 755 /var/www/html
chmod 644 /var/www/html/index.html
chmod 755 /var/www/html/cgi-bin
chmod 755 /var/www/html/cgi-bin/script.cgi
```

### Exercise 5: Find Permission Issues

```bash
# Find files with world-writable permissions
find /home -perm -o+w -type f

# Find directories without execute permission
find . -type d ! -perm -u+x

# Find files with no owner read permission
find . -type f ! -perm -u+r
```

### Exercise 6: Bulk Permission Fix

```bash
# Fix a project directory
# Directories need 755, files need 644, scripts need 755
find myproject/ -type d -exec chmod 755 {} \;
find myproject/ -type f -exec chmod 644 {} \;
find myproject/ -name "*.sh" -exec chmod 755 {} \;

# Verify
ls -lR myproject/
```

---

## Quick Reference

```bash
# View permissions
ls -l file.txt
ls -ld directory/

# Symbolic mode
chmod u+x file        # Add execute for owner
chmod g-w file        # Remove write for group
chmod o=r file        # Set others to read only
chmod a+r file        # Add read for all
chmod ug+x file       # Add execute for owner and group

# Numeric mode
chmod 755 file        # rwxr-xr-x
chmod 644 file        # rw-r--r--
chmod 600 file        # rw-------

# Recursive
chmod -R 755 dir/     # Change dir and all contents

# umask
umask                 # Show current umask
umask 022             # Set umask
```

---

## Summary

- Linux has three permission types: read (4), write (2), execute (1)
- Permissions apply to three groups: owner, group, others
- Use `chmod` to change permissions (symbolic or numeric mode)
- Common patterns: 755 for executables, 644 for files, 700 for private
- `umask` controls default permissions for new files
- Directory permissions control listing, modifying, and entering
- Always use the principle of least privilege — grant minimum needed access
