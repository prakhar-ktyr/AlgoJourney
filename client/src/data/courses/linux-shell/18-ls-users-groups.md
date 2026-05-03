---
title: Users & Groups
---

# Users & Groups

Linux is a multi-user operating system. Multiple users can use the system simultaneously, each with their own files, processes, and permissions. Groups organize users for shared access management.

---

## Multi-User Operating System Concept

Linux was designed from the ground up to support multiple users:

- Each user has a unique identity (username + UID)
- Users have private home directories
- File permissions control access between users
- Processes run under a specific user's identity
- The system tracks who is logged in and what they do

```bash
# See who is currently logged in
who

# See your own identity
whoami
```

---

## /etc/passwd — User Database

The `/etc/passwd` file contains information about every user on the system.

### View the File

```bash
cat /etc/passwd
```

### Structure

Each line represents one user with fields separated by colons:

```bash
username:x:UID:GID:comment:home_directory:shell
```

### Field Breakdown

| Field | Description | Example |
|-------|-------------|---------|
| username | Login name | alice |
| x | Password placeholder (actual password in /etc/shadow) | x |
| UID | User ID number | 1000 |
| GID | Primary group ID | 1000 |
| comment | Full name or description (GECOS field) | Alice Smith |
| home_directory | User's home directory path | /home/alice |
| shell | Default login shell | /bin/bash |

### Example Entries

```bash
root:x:0:0:root:/root:/bin/bash
daemon:x:1:1:daemon:/usr/sbin:/usr/sbin/nologin
alice:x:1000:1000:Alice Smith:/home/alice:/bin/bash
bob:x:1001:1001:Bob Jones:/home/bob:/bin/zsh
www-data:x:33:33:www-data:/var/www:/usr/sbin/nologin
nobody:x:65534:65534:nobody:/nonexistent:/usr/sbin/nologin
```

### Search for a Specific User

```bash
grep "alice" /etc/passwd
# alice:x:1000:1000:Alice Smith:/home/alice:/bin/bash
```

### Count Total Users

```bash
wc -l /etc/passwd
# 35 /etc/passwd
```

### List Only Usernames

```bash
cut -d: -f1 /etc/passwd
```

### Show Users with Login Shells

```bash
grep -v "nologin\|false" /etc/passwd
```

### Using getent (Preferred Method)

```bash
# getent also checks network user databases (LDAP, NIS)
getent passwd alice
# alice:x:1000:1000:Alice Smith:/home/alice:/bin/bash
```

---

## /etc/shadow — Encrypted Passwords

The `/etc/shadow` file stores encrypted password information. Only root can read it.

### View the File (requires root)

```bash
sudo cat /etc/shadow
```

### Structure

```bash
username:encrypted_password:last_changed:min:max:warn:inactive:expire:reserved
```

### Example Entries

```bash
root:$6$xyz...hashed...:19000:0:99999:7:::
alice:$6$abc...hashed...:19050:0:90:14:30::
bob:!:19000:0:99999:7:::
daemon:*:18500:0:99999:7:::
```

### Password Field Meanings

| Value | Meaning |
|-------|---------|
| $6$... | SHA-512 hashed password |
| ! | Account locked (cannot login) |
| * | Password never set (system account) |
| !! | Password expired/not set |

### File Permissions

```bash
ls -l /etc/shadow
# -rw-r----- 1 root shadow 1536 Jan 15 10:30 /etc/shadow
```

> **Security**: Never edit `/etc/shadow` directly. Use `passwd`, `chage`, or `usermod` commands.

---

## /etc/group — Group Database

The `/etc/group` file defines all groups on the system.

### View the File

```bash
cat /etc/group
```

### Structure

```bash
groupname:x:GID:member_list
```

### Field Breakdown

| Field | Description | Example |
|-------|-------------|---------|
| groupname | Name of the group | developers |
| x | Password placeholder (rarely used) | x |
| GID | Group ID number | 1001 |
| member_list | Comma-separated list of members | alice,bob,charlie |

### Example Entries

```bash
root:x:0:
sudo:x:27:alice,bob
developers:x:1001:alice,bob,charlie
webteam:x:1002:alice,dave
www-data:x:33:
docker:x:999:alice
```

### Search for a Group

```bash
grep "developers" /etc/group
# developers:x:1001:alice,bob,charlie
```

### List All Group Names

```bash
cut -d: -f1 /etc/group
```

### Show Members of a Group

```bash
getent group developers
# developers:x:1001:alice,bob,charlie
```

### Count Groups

```bash
wc -l /etc/group
# 65 /etc/group
```

> **Note**: The member list only shows supplementary members. Users whose primary group is this group won't appear here — check `/etc/passwd` for their GID.

---

## UID Ranges

User IDs (UIDs) are organized into ranges by convention:

| UID Range | Type | Description |
|-----------|------|-------------|
| 0 | Root | The superuser with all privileges |
| 1–999 | System | Service and daemon accounts |
| 1000+ | Regular | Normal human users |

### Check UID Ranges on Your System

```bash
# View UID range configuration
grep -E "UID_MIN|UID_MAX" /etc/login.defs
```

Output:

```bash
UID_MIN          1000
UID_MAX         60000
SYS_UID_MIN       201
SYS_UID_MAX       999
```

### Examples

```bash
# Root — UID 0
id root
# uid=0(root) gid=0(root) groups=0(root)

# System user — UID in 1-999
id www-data
# uid=33(www-data) gid=33(www-data) groups=33(www-data)

# Regular user — UID 1000+
id alice
# uid=1000(alice) gid=1000(alice) groups=1000(alice),27(sudo)
```

### List Regular Users Only

```bash
awk -F: '$3 >= 1000 && $3 < 65534 {print $1}' /etc/passwd
```

### List System Users Only

```bash
awk -F: '$3 > 0 && $3 < 1000 {print $1}' /etc/passwd
```

---

## Primary Group vs Supplementary Groups

Every user has exactly one **primary group** and can belong to multiple **supplementary groups**.

### Primary Group

- Defined in `/etc/passwd` (GID field)
- New files are created with this group by default
- Usually has the same name as the username

```bash
# Show primary group
id -gn alice
# alice
```

### Supplementary Groups

- Listed in `/etc/group` (member list field)
- Provide additional access without changing file defaults
- Used for shared resource access

```bash
# Show all groups (primary + supplementary)
id -Gn alice
# alice sudo developers webteam docker
```

### How Groups Affect File Access

```bash
# alice's groups: alice, developers, webteam

# File owned by developers group:
# -rw-rw-r-- 1 bob developers 4096 file.txt
# alice CAN read and write (she's in developers group)

# File owned by marketing group:
# -rw-rw-r-- 1 carol marketing 4096 report.txt
# alice CANNOT write (she's not in marketing group)
# alice CAN read (others have read permission)
```

---

## who — Who Is Logged In

The `who` command shows currently logged-in users:

```bash
who
```

Output:

```bash
alice    pts/0        2024-01-15 08:30 (192.168.1.10)
bob      pts/1        2024-01-15 09:45 (192.168.1.11)
alice    pts/2        2024-01-15 10:00 (192.168.1.10)
```

### Columns

| Column | Description |
|--------|-------------|
| Username | Who is logged in |
| Terminal | Their terminal device |
| Login time | When they logged in |
| Remote host | Where they connected from |

### Useful who Options

```bash
# Show only your own sessions
who am i

# Show heading line
who -H

# Show idle time
who -u

# Count logged-in users
who | wc -l
```

---

## w — Detailed User Activity

The `w` command shows who is logged in AND what they are doing:

```bash
w
```

Output:

```bash
 10:30:00 up 5 days,  3:15,  3 users,  load average: 0.15, 0.10, 0.05
USER     TTY      FROM             LOGIN@   IDLE   JCPU   PCPU WHAT
alice    pts/0    192.168.1.10     08:30    0.00s  0.50s  0.01s vim project.py
bob      pts/1    192.168.1.11     09:45    2:30   0.10s  0.02s -bash
```

The header shows current time, uptime, user count, and load average. Columns show the user, terminal, origin, login time, idle time, and current command.

---

## last — Login History

The `last` command shows recent login history:

```bash
last
```

Output:

```bash
alice    pts/0    192.168.1.10  Mon Jan 15 08:30   still logged in
bob      pts/1    192.168.1.11  Mon Jan 15 09:45   still logged in
alice    pts/0    192.168.1.10  Sun Jan 14 10:00 - 18:30  (08:30)
```

### Useful last Options

```bash
last alice              # Logins for specific user
last -n 5              # Last 5 entries only
last reboot            # Reboot history
sudo lastb             # Failed login attempts
lastlog                # Last login for all users
```

---

## groups — Show User's Groups

The `groups` command shows group membership:

```bash
groups
```

Output:

```bash
alice sudo developers webteam docker
```

### Show Groups for Another User

```bash
groups bob
# bob : bob developers
```

### Compare with id Command

```bash
groups alice
# alice : alice sudo developers webteam docker

id alice
# uid=1000(alice) gid=1000(alice) groups=1000(alice),27(sudo),1001(developers),1002(webteam),999(docker)
```

---

## Examining User/Group Files

### Exercise 1: Explore Your Identity

```bash
# Who am I?
whoami

# Full identity
id

# My groups
groups

# My primary group
id -gn

# My UID
id -u
```

### Exercise 2: Read /etc/passwd

```bash
# View your entry
grep "$(whoami)" /etc/passwd

# Count regular users (UID >= 1000)
awk -F: '$3 >= 1000 && $3 < 65534' /etc/passwd | wc -l

# List users with bash shell
grep "/bin/bash" /etc/passwd | cut -d: -f1

# Show users sorted by UID
sort -t: -k3 -n /etc/passwd | awk -F: '{print $3, $1}'
```

### Exercise 3: Explore Groups

```bash
# How many groups exist?
wc -l /etc/group

# List groups with members
awk -F: '$4 != "" {print $1": "$4}' /etc/group

# Find which groups a user belongs to
grep "alice" /etc/group
```

### Exercise 4: Check Who Is Active

```bash
# Simple logged-in users
who

# Detailed activity
w

# Recent logins
last -n 10

# Last login for each user
lastlog | grep -v "Never"
```

---

## Quick Reference

```bash
# Identity
whoami                  # Current username
id                      # Full identity (UID, GID, groups)
id -u                   # UID only
id -gn                  # Primary group name
groups                  # All group memberships

# User database
cat /etc/passwd         # All users
getent passwd username  # Specific user
grep username /etc/passwd

# Group database
cat /etc/group          # All groups
getent group groupname  # Specific group
grep groupname /etc/group

# Who is logged in
who                     # Basic login info
w                       # Detailed activity
last                    # Login history
lastlog                 # Last login per user
```

---

## Summary

- Linux is a multi-user OS where each user has a unique UID
- `/etc/passwd` stores user account information (username, UID, home, shell)
- `/etc/shadow` stores encrypted passwords (readable only by root)
- `/etc/group` defines groups and their members
- UIDs 0 = root, 1-999 = system accounts, 1000+ = regular users
- Every user has one primary group and can have multiple supplementary groups
- Use `who`, `w`, and `last` to monitor user activity
- Use `groups` and `id` to check group memberships
