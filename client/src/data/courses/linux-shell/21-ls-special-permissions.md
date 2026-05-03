---
title: Special Permissions
---

# Special Permissions

Beyond the standard read, write, and execute permissions, Linux has three **special permissions** that provide additional security and functionality.

These special permissions are:

- **SUID** (Set User ID)
- **SGID** (Set Group ID)
- **Sticky Bit**

Understanding these is essential for system administration and security.

---

## SUID — Set User ID

**SUID** allows a file to be **executed as the file's owner**, regardless of who runs it.

This is useful when a program needs elevated privileges to perform its task.

---

### How SUID Works

Normally, when you run a program, it runs with **your** permissions.

With SUID set, the program runs with the **owner's** permissions instead.

**Example:** The `passwd` command needs to modify `/etc/shadow`, which is owned by root. SUID allows regular users to change their own password:

```bash
ls -l /usr/bin/passwd
```

Output:

```bash
-rwsr-xr-x 1 root root 68208 Mar 14 11:31 /usr/bin/passwd
```

Notice the `s` in the owner's execute position — that's the SUID bit!

---

### Setting SUID

You can set SUID using either symbolic or numeric notation:

**Symbolic:**

```bash
chmod u+s filename
```

**Numeric (prepend 4):**

```bash
chmod 4755 filename
```

The `4` in `4755` represents the SUID bit.

---

### Example: Creating a SUID Program

```bash
# Create a simple script
echo '#!/bin/bash' > /tmp/showid.sh
echo 'echo "Real UID: $(id -r -u)"' >> /tmp/showid.sh
echo 'echo "Effective UID: $(id -u)"' >> /tmp/showid.sh

# Make it executable
chmod 755 /tmp/showid.sh

# Set SUID bit
chmod u+s /tmp/showid.sh

# Verify
ls -l /tmp/showid.sh
```

Output:

```bash
-rwsr-xr-x 1 root root 87 May  3 10:00 /tmp/showid.sh
```

---

### SUID on Directories

SUID on directories is **ignored** on most Linux systems. It has no practical effect on directories.

---

### Identifying SUID in ls Output

```bash
# SUID set + owner has execute permission
-rwsr-xr-x    # lowercase 's' means SUID + execute

# SUID set + owner does NOT have execute permission
-rwSr-xr-x    # uppercase 'S' means SUID without execute
```

The uppercase `S` indicates a potential misconfiguration — SUID without execute permission is unusual.

---

## SGID — Set Group ID

**SGID** works differently depending on whether it's applied to a file or a directory.

---

### SGID on Files

When SGID is set on an **executable file**, the program runs with the **group's** permissions:

```bash
ls -l /usr/bin/wall
```

Output:

```bash
-rwxr-sr-x 1 root tty 19024 Mar 14 11:31 /usr/bin/wall
```

Notice the `s` in the group's execute position.

---

### SGID on Directories

When SGID is set on a **directory**, new files and subdirectories created inside it **inherit the directory's group** (instead of the creator's primary group).

This is extremely useful for shared project directories!

---

### Setting SGID

**Symbolic:**

```bash
chmod g+s filename_or_directory
```

**Numeric (prepend 2):**

```bash
chmod 2755 directory_name
```

The `2` in `2755` represents the SGID bit.

---

### Example: Shared Directory with SGID

```bash
# Create a shared project directory
sudo mkdir /opt/project

# Create a project group
sudo groupadd developers

# Set group ownership
sudo chown :developers /opt/project

# Set SGID so all new files inherit the 'developers' group
sudo chmod 2775 /opt/project

# Verify
ls -ld /opt/project
```

Output:

```bash
drwxrwsr-x 2 root developers 4096 May  3 10:00 /opt/project
```

Now test it:

```bash
# Add a user to the developers group
sudo usermod -aG developers alice

# As alice, create a file in the shared directory
touch /opt/project/shared-file.txt

# Check ownership
ls -l /opt/project/shared-file.txt
```

Output:

```bash
-rw-rw-r-- 1 alice developers 0 May  3 10:01 /opt/project/shared-file.txt
```

The file's group is `developers`, not alice's primary group!

---

### Identifying SGID in ls Output

```bash
# SGID set + group has execute permission
drwxrwsr-x    # lowercase 's'

# SGID set + group does NOT have execute permission
drwxrwSr-x    # uppercase 'S'
```

---

## Sticky Bit

The **Sticky Bit** is used on directories to prevent users from deleting files they don't own.

Even if a directory is world-writable, users can only delete **their own** files.

---

### The Classic Example: /tmp

```bash
ls -ld /tmp
```

Output:

```bash
drwxrwxrwt 15 root root 4096 May  3 10:00 /tmp
```

Notice the `t` in the others' execute position — that's the sticky bit!

Everyone can write to `/tmp`, but you can only delete files you created.

---

### Setting the Sticky Bit

**Symbolic:**

```bash
chmod +t directory_name
```

**Numeric (prepend 1):**

```bash
chmod 1755 directory_name
```

The `1` in `1755` represents the sticky bit.

---

### Example: Shared Directory with Sticky Bit

```bash
# Create a shared directory
sudo mkdir /opt/shared

# Make it world-writable with sticky bit
sudo chmod 1777 /opt/shared

# Verify
ls -ld /opt/shared
```

Output:

```bash
drwxrwxrwt 2 root root 4096 May  3 10:00 /opt/shared
```

Now test it:

```bash
# As user alice, create a file
touch /opt/shared/alice-file.txt

# As user bob, try to delete alice's file
rm /opt/shared/alice-file.txt
```

Output:

```bash
rm: cannot remove '/opt/shared/alice-file.txt': Operation not permitted
```

Bob cannot delete alice's file, even though the directory is world-writable!

---

### Identifying Sticky Bit in ls Output

```bash
# Sticky bit set + others have execute permission
drwxrwxrwt    # lowercase 't'

# Sticky bit set + others do NOT have execute permission
drwxrwxrwT    # uppercase 'T'
```

---

## Numeric Summary

All three special permissions can be combined in the first digit:

| Bit | Value | Permission |
|-----|-------|------------|
| SUID | 4 | Set User ID |
| SGID | 2 | Set Group ID |
| Sticky | 1 | Sticky Bit |

**Examples:**

```bash
# SUID only
chmod 4755 file

# SGID only
chmod 2755 directory

# Sticky bit only
chmod 1755 directory

# SUID + SGID
chmod 6755 file

# SGID + Sticky bit
chmod 3755 directory

# All three (unusual)
chmod 7755 file
```

---

## Finding SUID and SGID Files

Finding files with special permissions is an important security task:

```bash
# Find all SUID files on the system
find / -perm -4000 -type f 2>/dev/null

# Find all SGID files on the system
find / -perm -2000 -type f 2>/dev/null

# Find files with either SUID or SGID
find / -perm /6000 -type f 2>/dev/null

# Find SUID files owned by root (most security-sensitive)
find / -perm -4000 -user root -type f 2>/dev/null

# Find world-writable directories without sticky bit (security risk!)
find / -type d -perm -0002 ! -perm -1000 2>/dev/null
```

---

### Common SUID Programs

These programs legitimately need SUID:

```bash
# List common SUID programs
find /usr/bin -perm -4000 -type f 2>/dev/null | sort
```

Typical results:

```bash
/usr/bin/chfn
/usr/bin/chsh
/usr/bin/gpasswd
/usr/bin/mount
/usr/bin/newgrp
/usr/bin/passwd
/usr/bin/su
/usr/bin/sudo
/usr/bin/umount
```

---

## Security Implications

Special permissions can be **security risks** if misused:

### SUID Risks

```bash
# DANGER: Never set SUID on editors or shells!
# This would give anyone root access:
chmod u+s /bin/bash     # NEVER DO THIS!
chmod u+s /usr/bin/vim  # NEVER DO THIS!
```

### Best Practices

```bash
# Regularly audit SUID/SGID files
find / -perm /6000 -type f -ls 2>/dev/null > /tmp/suid_audit.txt

# Compare with a known-good baseline
diff /tmp/suid_baseline.txt /tmp/suid_audit.txt

# Remove SUID/SGID from files that don't need it
chmod u-s /path/to/unnecessary/suid/file
chmod g-s /path/to/unnecessary/sgid/file
```

### Security Checklist

1. **Minimize SUID/SGID files** — remove special permissions from anything that doesn't need them
2. **Audit regularly** — check for new or unexpected SUID/SGID files
3. **Use sticky bit** on shared writable directories
4. **Never set SUID on scripts** — it's a security risk (many systems ignore SUID on scripts)
5. **Mount filesystems with `nosuid`** — prevents SUID from working on that filesystem

```bash
# Mount a filesystem with nosuid (no SUID allowed)
mount -o nosuid /dev/sdb1 /mnt/external

# Check /etc/fstab for nosuid option
cat /etc/fstab | grep nosuid
```

---

## Practice Exercises

```bash
# Exercise 1: Check special permissions on /tmp
ls -ld /tmp
# What special permission does it have? Why?

# Exercise 2: Find all SUID files in /usr/bin
find /usr/bin -perm -4000 -type f

# Exercise 3: Create a shared directory with SGID
mkdir /tmp/team-project
chmod 2775 /tmp/team-project
ls -ld /tmp/team-project

# Exercise 4: Set sticky bit on a directory
mkdir /tmp/sticky-test
chmod 1777 /tmp/sticky-test
ls -ld /tmp/sticky-test

# Exercise 5: Decode this permission string
# -rwsr-sr-t
# Answer: SUID + SGID + Sticky bit, rwx for owner, r-x for group, r-x for others

# Exercise 6: What does chmod 6750 do?
# Answer: SUID(4) + SGID(2) = 6, rwx for owner, r-x for group, --- for others
```

---

## Quick Reference

| Permission | On Files | On Directories |
|-----------|----------|----------------|
| SUID (4) | Execute as owner | Ignored |
| SGID (2) | Execute as group | New files inherit group |
| Sticky (1) | (No effect) | Only owner can delete |

| Symbol | Meaning |
|--------|---------|
| `s` (lowercase, owner) | SUID + execute |
| `S` (uppercase, owner) | SUID without execute |
| `s` (lowercase, group) | SGID + execute |
| `S` (uppercase, group) | SGID without execute |
| `t` (lowercase, others) | Sticky + execute |
| `T` (uppercase, others) | Sticky without execute |

---

## Summary

- **SUID** lets programs run as the file owner (commonly root)
- **SGID** on files runs as the group; on directories, inherits group ownership
- **Sticky Bit** prevents users from deleting others' files in shared directories
- Use `find -perm` to audit special permissions
- Always minimize SUID/SGID files for security
