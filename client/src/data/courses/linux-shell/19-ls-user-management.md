---
title: User Management
---

# User Management

Linux provides powerful commands for creating, modifying, and deleting user accounts and groups. These operations typically require root (sudo) access and are essential skills for system administration.

---

## useradd — Create User

The `useradd` command creates a new user account.

### Basic Syntax

```bash
sudo useradd [options] username
```

### Create a User with Home Directory and Shell

```bash
sudo useradd -m -s /bin/bash alice
```

| Option | Description |
|--------|-------------|
| -m | Create home directory (/home/username) |
| -s /bin/bash | Set login shell |

### Commonly Used Options

| Option | Description | Example |
|--------|-------------|---------|
| -m | Create home directory | useradd -m alice |
| -s | Set login shell | useradd -s /bin/zsh alice |
| -d | Custom home directory | useradd -d /opt/alice alice |
| -g | Set primary group | useradd -g developers alice |
| -G | Set supplementary groups | useradd -G sudo,docker alice |
| -c | Comment (full name) | useradd -c "Alice Smith" alice |
| -u | Set specific UID | useradd -u 1500 alice |
| -e | Account expiry date | useradd -e 2025-12-31 alice |
| -r | Create system user (no home) | useradd -r myservice |

### Create a Full User Account

```bash
sudo useradd -m -s /bin/bash -c "Alice Smith" -G sudo,developers alice
```

This creates:
- Username: alice
- Home directory: /home/alice
- Shell: /bin/bash
- Comment: Alice Smith
- Groups: alice (primary), sudo and developers (supplementary)

### Create a System (Service) User

```bash
sudo useradd -r -s /usr/sbin/nologin myservice
```

- `-r` — system account (UID below 1000, no home directory)
- `-s /usr/sbin/nologin` — cannot log in interactively

### Verify User Was Created

```bash
grep alice /etc/passwd
# alice:x:1000:1000:Alice Smith:/home/alice:/bin/bash

id alice
# uid=1000(alice) gid=1000(alice) groups=1000(alice),27(sudo),1001(developers)

ls -la /home/alice/
```

### adduser (Debian/Ubuntu Alternative)

On Debian-based systems, `adduser` is a friendlier interactive wrapper:

```bash
sudo adduser alice
```

It prompts for password, full name, and other details automatically.

---

## passwd — Set/Change Password

The `passwd` command sets or changes a user's password.

### Set Password for a New User

```bash
sudo passwd alice
# Prompts for new password twice
```

### Change Your Own Password

```bash
passwd
# Prompts for current password, then new password twice
```

### Password Options

| Option | Description | Example |
|--------|-------------|---------|
| -l | Lock account | sudo passwd -l alice |
| -u | Unlock account | sudo passwd -u alice |
| -d | Delete password (no password needed) | sudo passwd -d alice |
| -e | Expire password (force change on next login) | sudo passwd -e alice |
| -S | Show password status | sudo passwd -S alice |
| -n | Minimum days between changes | sudo passwd -n 7 alice |
| -x | Maximum days before change required | sudo passwd -x 90 alice |
| -w | Days before expiry to warn | sudo passwd -w 14 alice |

### Check Password Status

```bash
sudo passwd -S alice
# alice P 01/15/2024 0 90 14 -1
```

Status codes: P = usable password, L = locked, NP = no password

### Force Password Change on Next Login

```bash
sudo passwd -e alice
```

### Lock/Unlock Account

```bash
# Lock account (disable login)
sudo passwd -l alice

# Unlock account
sudo passwd -u alice
```

---

## usermod — Modify User

The `usermod` command changes existing user account properties.

### Add User to a Group

```bash
sudo usermod -aG groupname username
```

> **Critical**: Always use `-a` (append) with `-G`. Without `-a`, the user is removed from all other supplementary groups!

```bash
# CORRECT — add to docker group while keeping others
sudo usermod -aG docker alice

# WRONG — replaces ALL supplementary groups with only docker!
sudo usermod -G docker alice
```

### Common usermod Options

| Option | Description | Example |
|--------|-------------|---------|
| -aG | Append to supplementary group | usermod -aG sudo alice |
| -g | Change primary group | usermod -g developers alice |
| -s | Change login shell | usermod -s /bin/zsh alice |
| -d | Change home directory | usermod -d /new/home alice |
| -d -m | Change and move home directory | usermod -d /new/home -m alice |
| -l | Change username | usermod -l newname oldname |
| -c | Change comment | usermod -c "New Name" alice |
| -L | Lock account | usermod -L alice |
| -U | Unlock account | usermod -U alice |
| -e | Set expiry date | usermod -e 2025-12-31 alice |

### Change Login Shell

```bash
sudo usermod -s /bin/zsh alice

# Verify
grep alice /etc/passwd
# alice:x:1000:1000:Alice Smith:/home/alice:/bin/zsh
```

### Move Home Directory

```bash
sudo usermod -d /home/newalice -m alice
```

### Add to Multiple Groups

```bash
sudo usermod -aG sudo,docker,developers alice
```

### Rename a User

```bash
sudo usermod -l newname oldname
```

---

## userdel — Delete User

The `userdel` command removes a user account.

### Delete User (Keep Home Directory)

```bash
sudo userdel alice
```

### Delete User and Home Directory

```bash
sudo userdel -r alice
```

| Option | Description |
|--------|-------------|
| -r | Remove home directory and mail spool |
| -f | Force deletion even if user is logged in |

### Before Deleting a User

```bash
# Check if user is logged in
who | grep alice

# Backup user's home directory
sudo tar czf /backup/alice-home.tar.gz /home/alice/

# Kill processes and delete
sudo pkill -u alice
sudo userdel -r alice

# Find orphaned files
sudo find / -nouser 2>/dev/null
```

---

## groupadd — Create Group

The `groupadd` command creates a new group.

### Create a Group

```bash
sudo groupadd developers
```

### Create with Specific GID

```bash
sudo groupadd -g 2000 webteam
```

### Options

| Option | Description | Example |
|--------|-------------|---------|
| -g | Set specific GID | groupadd -g 2000 mygroup |
| -r | Create system group (GID < 1000) | groupadd -r myservice |

### Verify Group Creation

```bash
grep developers /etc/group
# developers:x:1001:

getent group developers
# developers:x:1001:
```

---

## groupdel — Delete Group

The `groupdel` command removes a group.

### Delete a Group

```bash
sudo groupdel developers
```

### Limitations

- Cannot delete a group that is any user's primary group
- Must reassign users to another primary group first

```bash
# Error: cannot remove primary group
sudo groupdel alice
# groupdel: cannot remove the primary group of user 'alice'

# Solution: change user's primary group first
sudo usermod -g users alice
sudo groupdel alice
```

### Verify Deletion

```bash
getent group developers
# (no output = group deleted)
```

---

## gpasswd — Manage Group Membership

The `gpasswd` command provides another way to manage group members.

```bash
# Add user to group
sudo gpasswd -a alice developers

# Remove user from group
sudo gpasswd -d alice developers

# Set group administrators
sudo gpasswd -A alice developers

# Set complete member list (replaces all)
sudo gpasswd -M alice,bob,charlie developers
```

---

## /etc/skel — Skeleton Directory

The `/etc/skel` directory is a template for new user home directories. When `useradd -m` creates a home directory, it copies everything from `/etc/skel`.

### View Skeleton Contents

```bash
ls -la /etc/skel/
```

Output:

```bash
drwxr-xr-x  2 root root 4096 Jan 10 00:00 .
drwxr-xr-x 80 root root 4096 Jan 15 10:30 ..
-rw-r--r--  1 root root  220 Jan 10 00:00 .bash_logout
-rw-r--r--  1 root root 3771 Jan 10 00:00 .bashrc
-rw-r--r--  1 root root  807 Jan 10 00:00 .profile
```

### Customize Skeleton for New Users

```bash
# Add custom .bashrc additions
sudo bash -c 'echo "alias ll=\"ls -la\"" >> /etc/skel/.bashrc'

# Create default directories
sudo mkdir -p /etc/skel/{Documents,Projects,Downloads}

# Add SSH directory template
sudo mkdir -p /etc/skel/.ssh
sudo chmod 700 /etc/skel/.ssh
```

Any new user created with `useradd -m` will get these files and directories in their home.

---

## Creating a New User — Step by Step

```bash
# Step 1: Create the user
sudo useradd -m -s /bin/bash -c "Bob Jones" bob

# Step 2: Set a password
sudo passwd bob

# Step 3: Add to groups
sudo usermod -aG developers,docker bob

# Step 4: Verify the account
id bob
# uid=1001(bob) gid=1001(bob) groups=1001(bob),1001(developers),999(docker)

# Step 5: Test login
su - bob
whoami   # bob
pwd      # /home/bob
exit

# Step 6: Set password policy (optional)
sudo chage -M 90 -W 14 bob
sudo chage -l bob
```

---

## Full User Lifecycle Examples

### Example 1: Create Developer Account

```bash
#!/bin/bash
# Create a developer user with full setup

USERNAME="newdev"
FULLNAME="New Developer"

# Create user
sudo useradd -m -s /bin/bash -c "$FULLNAME" "$USERNAME"

# Set initial password
echo "$USERNAME:TempPass123!" | sudo chpasswd

# Force password change on first login
sudo passwd -e "$USERNAME"

# Add to groups
sudo usermod -aG developers,docker,sudo "$USERNAME"

# Create project directory
sudo -u "$USERNAME" mkdir -p "/home/$USERNAME/projects"

# Verify
echo "User created:"
id "$USERNAME"
```

### Example 2: Create Service Account

```bash
#!/bin/bash
# Create a service account for an application

SERVICE="myapp"

# Create system user (no home, no login)
sudo useradd -r -s /usr/sbin/nologin "$SERVICE"

# Create application directories
sudo mkdir -p "/opt/$SERVICE"/{bin,data,logs,config}

# Set ownership
sudo chown -R "$SERVICE:$SERVICE" "/opt/$SERVICE"

# Set permissions
sudo chmod 750 "/opt/$SERVICE"
sudo chmod 700 "/opt/$SERVICE/data"

echo "Service account created:"
id "$SERVICE"
ls -la "/opt/$SERVICE/"
```

### Example 3: Deactivate and Remove a User

```bash
#!/bin/bash
# Safely deactivate and remove a user

USERNAME="departing_user"

# Lock the account
sudo passwd -l "$USERNAME"

# Kill any active sessions
sudo pkill -u "$USERNAME" 2>/dev/null

# Backup home directory
sudo tar czf "/backup/${USERNAME}-$(date +%Y%m%d).tar.gz" "/home/$USERNAME/"

# Remove cron jobs
sudo crontab -r -u "$USERNAME" 2>/dev/null

# Delete user and home directory
sudo userdel -r "$USERNAME"

# Find orphaned files
echo "Orphaned files (if any):"
sudo find / -nouser -print 2>/dev/null
```

---

## Quick Reference

```bash
# Create user
sudo useradd -m -s /bin/bash username    # Create with home + shell
sudo useradd -r -s /usr/sbin/nologin svc # Create service account
sudo adduser username                     # Interactive (Debian/Ubuntu)

# Password management
sudo passwd username          # Set password
sudo passwd -e username       # Force change on next login
sudo passwd -l username       # Lock account
sudo passwd -u username       # Unlock account

# Modify user
sudo usermod -aG group user   # Add to group (ALWAYS use -a!)
sudo usermod -s /bin/zsh user # Change shell
sudo usermod -d /new -m user  # Move home directory
sudo usermod -l new old       # Rename user

# Delete user
sudo userdel username         # Delete (keep home)
sudo userdel -r username      # Delete (remove home)

# Group management
sudo groupadd groupname       # Create group
sudo groupdel groupname       # Delete group
sudo gpasswd -a user group    # Add user to group
sudo gpasswd -d user group    # Remove user from group

# Skeleton
ls -la /etc/skel/             # View template for new users
```

---

## Summary

- `useradd` creates new user accounts; always use `-m` for home directory
- `passwd` manages passwords — set, lock, expire, and enforce policies
- `usermod -aG` adds users to groups (never forget the `-a`!)
- `userdel -r` removes a user and their home directory
- `groupadd` and `groupdel` manage groups
- `gpasswd` provides fine-grained group membership control
- `/etc/skel` is the template for new user home directories
- Always backup before deleting users; use lockout before deletion for audit trails
