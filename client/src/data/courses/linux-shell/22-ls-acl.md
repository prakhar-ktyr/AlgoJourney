---
title: Access Control Lists
---

# Access Control Lists (ACLs)

Standard Linux permissions (rwx for owner/group/others) are sometimes **not enough**.

What if you need to give a specific user read access to a file without changing the owner or group? That's where **ACLs** come in.

---

## Why ACLs?

Consider this scenario:

- A file is owned by `alice` (group: `engineering`)
- You want `bob` (who is NOT in `engineering`) to have read access
- You don't want to give **everyone** read access

Standard permissions can't solve this. ACLs can!

---

## What Are ACLs?

**Access Control Lists** provide fine-grained permissions beyond the traditional owner/group/others model.

With ACLs, you can:

- Grant permissions to **specific users**
- Grant permissions to **specific groups**
- Set **default permissions** for new files in a directory

---

## getfacl — View ACLs

The `getfacl` command displays the full ACL of a file or directory.

### Basic Usage

```bash
getfacl filename
```

### Example: File Without ACLs

```bash
# Create a test file
touch /tmp/testfile.txt
chmod 640 /tmp/testfile.txt

# View its ACL
getfacl /tmp/testfile.txt
```

Output:

```bash
# file: tmp/testfile.txt
# owner: alice
# group: alice
user::rw-
group::r--
other::---
```

This shows the standard permissions — no extra ACL entries yet.

---

### Example: File With ACLs

```bash
# Add an ACL entry for user bob
setfacl -m u:bob:r /tmp/testfile.txt

# Now view the ACL
getfacl /tmp/testfile.txt
```

Output:

```bash
# file: tmp/testfile.txt
# owner: alice
# group: alice
user::rw-
user:bob:r--
group::r--
mask::r--
other::---
```

Notice the new `user:bob:r--` line — bob now has read access!

---

## setfacl — Set ACLs

The `setfacl` command modifies ACLs on files and directories.

### Syntax

```bash
setfacl [options] [action] file
```

Common options:

| Option | Description |
|--------|-------------|
| `-m` | Modify (add or change) ACL entries |
| `-x` | Remove specific ACL entries |
| `-b` | Remove all ACL entries |
| `-d` | Set default ACL (for directories) |
| `-R` | Apply recursively |
| `-k` | Remove default ACLs |

---

### Granting User Permissions

```bash
# Give user 'bob' read and write access
setfacl -m u:bob:rw /tmp/testfile.txt

# Give user 'carol' read-only access
setfacl -m u:carol:r /tmp/testfile.txt

# Give user 'dave' full access (read, write, execute)
setfacl -m u:dave:rwx /tmp/testfile.txt

# Verify
getfacl /tmp/testfile.txt
```

Output:

```bash
# file: tmp/testfile.txt
# owner: alice
# group: alice
user::rw-
user:bob:rw-
user:carol:r--
user:dave:rwx
group::r--
mask::rwx
other::---
```

---

### Granting Group Permissions

```bash
# Give group 'marketing' read access
setfacl -m g:marketing:r /tmp/testfile.txt

# Give group 'devops' read and execute access
setfacl -m g:devops:rx /tmp/testfile.txt

# Verify
getfacl /tmp/testfile.txt
```

Output:

```bash
# file: tmp/testfile.txt
# owner: alice
# group: alice
user::rw-
user:bob:rw-
group::r--
group:marketing:r--
group:devops:r-x
mask::rwx
other::---
```

---

### Multiple ACL Entries at Once

You can set multiple entries in a single command:

```bash
# Set multiple ACLs at once
setfacl -m u:bob:rw,u:carol:r,g:devops:rx /tmp/testfile.txt
```

---

## Default ACLs for Directories

**Default ACLs** define what permissions new files and subdirectories will inherit when created inside a directory.

### Setting Default ACLs

```bash
# Create a project directory
mkdir /tmp/project

# Set default ACL: new files give user 'bob' read/write
setfacl -d -m u:bob:rw /tmp/project

# Set default ACL: new files give group 'team' read/execute
setfacl -d -m g:team:rx /tmp/project

# View the ACL (shows both access and default ACLs)
getfacl /tmp/project
```

Output:

```bash
# file: tmp/project
# owner: alice
# group: alice
user::rwx
group::r-x
other::r-x
default:user::rwx
default:user:bob:rw-
default:group::r-x
default:group:team:r-x
default:mask::rwx
default:other::r-x
```

---

### Testing Default ACLs

```bash
# Create a new file in the directory
touch /tmp/project/newfile.txt

# Check its ACL — it inherited the defaults!
getfacl /tmp/project/newfile.txt
```

Output:

```bash
# file: tmp/project/newfile.txt
# owner: alice
# group: alice
user::rw-
user:bob:rw-
group::r-x          #effective:r--
group:team:r-x      #effective:r--
mask::rw-
other::r--
```

The new file automatically got ACL entries for `bob` and `team`!

---

### Default ACLs for Subdirectories

```bash
# Create a subdirectory
mkdir /tmp/project/subdir

# It inherits default ACLs AND gets them as its own defaults
getfacl /tmp/project/subdir
```

Subdirectories inherit the default ACLs and pass them to their children too.

---

## The ACL Mask

The **mask** defines the **maximum effective permissions** for ACL users and groups (not the owner).

### How the Mask Works

```bash
# Set an ACL giving bob full access
setfacl -m u:bob:rwx /tmp/testfile.txt

# Set the mask to read-only
setfacl -m m::r /tmp/testfile.txt

# View the result
getfacl /tmp/testfile.txt
```

Output:

```bash
# file: tmp/testfile.txt
# owner: alice
# group: alice
user::rw-
user:bob:rwx         #effective:r--
group::r--
mask::r--
other::---
```

Even though bob has `rwx`, the mask limits his **effective** permissions to `r--`!

---

### The Mask and chmod

**Important:** Using `chmod` on a file with ACLs changes the mask, not the group permissions!

```bash
# File has ACL with mask rwx
chmod 640 /tmp/testfile.txt

# This sets the mask to r-- (the group permission bits become the mask)
getfacl /tmp/testfile.txt
```

Be careful with `chmod` on files that have ACLs — it can silently reduce effective permissions.

---

### Recalculating the Mask

```bash
# Recalculate mask to allow all granted permissions
setfacl -m m::rwx /tmp/testfile.txt

# Or let the system recalculate automatically
setfacl --recalculate /tmp/testfile.txt
```

---

## Removing ACLs

### Remove a Specific User's ACL

```bash
# Remove bob's ACL entry
setfacl -x u:bob /tmp/testfile.txt

# Verify
getfacl /tmp/testfile.txt
```

---

### Remove a Specific Group's ACL

```bash
# Remove marketing group's ACL entry
setfacl -x g:marketing /tmp/testfile.txt
```

---

### Remove All ACLs

```bash
# Remove all ACL entries (revert to standard permissions)
setfacl -b /tmp/testfile.txt

# Verify — back to standard permissions only
getfacl /tmp/testfile.txt
```

---

### Remove Default ACLs

```bash
# Remove only default ACLs from a directory
setfacl -k /tmp/project

# Remove all ACLs including defaults
setfacl -b /tmp/project
```

---

## Detecting ACLs with ls

When a file has ACLs, `ls -l` shows a **`+`** sign after the permission string:

```bash
ls -l /tmp/testfile.txt
```

Output:

```bash
-rw-r-----+ 1 alice alice 0 May  3 10:00 /tmp/testfile.txt
```

The `+` tells you "this file has extended ACLs — use `getfacl` to see them."

Without ACLs:

```bash
-rw-r----- 1 alice alice 0 May  3 10:00 /tmp/regular-file.txt
```

No `+` sign means standard permissions only.

---

## ACLs vs Standard Permissions

| Feature | Standard Permissions | ACLs |
|---------|---------------------|------|
| Users | Owner + others | Any specific user |
| Groups | One group | Any specific group |
| Complexity | Simple | More complex |
| Performance | Faster | Slightly slower |
| Compatibility | Universal | Most modern filesystems |
| Visibility | `ls -l` | `getfacl` needed |

### When to Use ACLs

- Multiple users need different access levels to the same file
- Complex project directories with varied team access
- Cannot use group memberships (e.g., too many groups needed)
- Fine-grained access control required

### When Standard Permissions Suffice

- Simple owner/group/world model is enough
- Performance is critical (minor difference)
- Maximum compatibility needed
- Simple single-user scenarios

---

## Practice Exercises

```bash
# Exercise 1: View ACLs of your home directory
getfacl ~

# Exercise 2: Create a file and add ACL for a specific user
touch /tmp/acl-test.txt
setfacl -m u:nobody:r /tmp/acl-test.txt
getfacl /tmp/acl-test.txt
ls -l /tmp/acl-test.txt    # Notice the + sign

# Exercise 3: Create a shared directory with default ACLs
mkdir /tmp/shared-acl
setfacl -d -m g:users:rw /tmp/shared-acl
touch /tmp/shared-acl/new-file.txt
getfacl /tmp/shared-acl/new-file.txt

# Exercise 4: Set mask to limit effective permissions
setfacl -m u:nobody:rwx /tmp/acl-test.txt
setfacl -m m::r /tmp/acl-test.txt
getfacl /tmp/acl-test.txt
# What are nobody's effective permissions?

# Exercise 5: Remove all ACLs
setfacl -b /tmp/acl-test.txt
getfacl /tmp/acl-test.txt
ls -l /tmp/acl-test.txt    # No more + sign
```

---

## Common Mistakes

```bash
# WRONG: Forgetting the permission type (u: or g:)
setfacl -m bob:rw file.txt          # Error!

# RIGHT: Specify user or group
setfacl -m u:bob:rw file.txt        # Correct

# WRONG: Using chmod carelessly on ACL files
chmod 750 file-with-acls.txt        # Changes the mask!

# RIGHT: Use setfacl to modify ACL permissions
setfacl -m m::rwx file-with-acls.txt

# WRONG: Forgetting -d for default ACLs
setfacl -m u:bob:rw /tmp/dir/       # Only sets access ACL

# RIGHT: Use -d for inheritance
setfacl -d -m u:bob:rw /tmp/dir/    # Sets default ACL
```

---

## Quick Reference

```bash
# View ACLs
getfacl file

# Add user ACL
setfacl -m u:username:permissions file

# Add group ACL
setfacl -m g:groupname:permissions file

# Set default ACL (directory)
setfacl -d -m u:username:permissions directory

# Remove user ACL
setfacl -x u:username file

# Remove all ACLs
setfacl -b file

# Remove default ACLs
setfacl -k directory

# Recursive
setfacl -R -m u:username:permissions directory

# Set mask
setfacl -m m::permissions file
```

---

## Summary

- ACLs extend standard Linux permissions for fine-grained access control
- `getfacl` shows ACLs; `setfacl` modifies them
- Default ACLs on directories are inherited by new files
- The mask limits effective permissions for ACL entries
- `ls -l` shows `+` when ACLs are present
- Use ACLs when standard owner/group/others isn't flexible enough
