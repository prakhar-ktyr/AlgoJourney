---
title: File Ownership
---

# File Ownership

Every file and directory in Linux has an owner and a group. Ownership determines which permission set applies to each user. Understanding ownership is crucial for managing access to files on multi-user systems.

---

## Every File Has an Owner and a Group

When a file is created, it gets:

- **Owner**: The user who created the file
- **Group**: Usually the primary group of the user who created the file

```bash
touch myfile.txt
ls -l myfile.txt
```

Output:

```bash
-rw-r--r-- 1 alice developers 0 Jan 15 10:30 myfile.txt
              │     │
              │     └── Group owner
              └──────── User owner
```

---

## ls -l Showing Owner and Group

The `ls -l` command displays ownership information:

```bash
ls -l /home/alice/
```

Output:

```bash
-rw-r--r-- 1 alice  developers  4096 Jan 15 10:30 project.txt
-rwxr-xr-x 1 alice  developers  2048 Jan 14 09:15 script.sh
-rw-r----- 1 root   admin       1024 Jan 13 14:00 config.conf
drwxr-xr-x 2 alice  developers  4096 Jan 12 08:45 documents/
```

### Understanding the Columns

```bash
-rw-r--r--  1  alice  developers  4096  Jan 15 10:30  project.txt
│           │  │      │           │     │              │
│           │  │      │           │     │              └── Filename
│           │  │      │           │     └── Modification date
│           │  │      │           └── File size (bytes)
│           │  │      └── Group owner
│           │  └── User owner
│           └── Hard link count
└── Permissions
```

### Show Only Owner

```bash
ls -l | awk '{print $3, $NF}'
```

---

## chown — Change Owner

The `chown` (change owner) command changes the user owner of a file.

### Basic Syntax

```bash
chown new_owner file
```

### Change Owner of a File

```bash
# Change owner to bob
sudo chown bob myfile.txt

# Verify
ls -l myfile.txt
# -rw-r--r-- 1 bob developers 0 Jan 15 10:30 myfile.txt
```

### Change Owner of Multiple Files

```bash
sudo chown bob file1.txt file2.txt file3.txt
```

### Using Wildcards

```bash
sudo chown bob *.txt
```

> **Note**: You typically need `sudo` to change file ownership, unless you are the current owner changing to yourself.

---

## chown user:group — Change Both

You can change both owner and group in a single command:

```bash
chown user:group file
```

### Change Owner and Group

```bash
sudo chown bob:webteam index.html

ls -l index.html
# -rw-r--r-- 1 bob webteam 4096 Jan 15 10:30 index.html
```

### Change Only Group (with colon)

```bash
# Leave owner unchanged, change group only
sudo chown :webteam index.html

ls -l index.html
# -rw-r--r-- 1 alice webteam 4096 Jan 15 10:30 index.html
```

### Change Owner, Keep Current Group

```bash
sudo chown bob: file.txt
# Changes owner to bob, group to bob's primary group
```

### Alternative Separator (dot)

```bash
# Some systems support dot instead of colon
sudo chown bob.webteam file.txt
```

> **Best practice**: Use the colon `:` separator — it works reliably on all systems.

---

## chown -R — Recursive

Change ownership for a directory and all its contents:

```bash
sudo chown -R bob:webteam /var/www/html
```

### Examples

```bash
# Change entire project ownership
sudo chown -R alice:developers /home/alice/project/

# Verify
ls -lR /home/alice/project/
```

### Careful with Recursive chown

```bash
# DANGEROUS — changes ownership of everything!
sudo chown -R bob /

# Safe — specify the target directory clearly
sudo chown -R bob:developers /opt/myapp/
```

### Combine with find for Selective Changes

```bash
# Change only files (not directories)
find /var/www -type f -exec sudo chown www-data:www-data {} \;

# Change only directories
find /var/www -type d -exec sudo chown www-data:www-data {} \;
```

---

## chgrp — Change Group Only

The `chgrp` command changes only the group owner:

```bash
chgrp new_group file
```

### Change Group

```bash
sudo chgrp webteam website.html

ls -l website.html
# -rw-r--r-- 1 alice webteam 4096 Jan 15 10:30 website.html
```

### Change Group Recursively

```bash
sudo chgrp -R developers /home/alice/project/
```

### Change Group of Multiple Files

```bash
sudo chgrp webteam *.html *.css *.js
```

### When to Use chgrp vs chown

```bash
# These are equivalent:
sudo chgrp webteam file.txt
sudo chown :webteam file.txt
```

Use `chgrp` when you only need to change the group and want a simpler command.

---

## newgrp — Switch Active Group

The `newgrp` command switches your active (primary) group for the current session:

```bash
newgrp groupname
```

### How It Works

```bash
# Check current group
id -gn
# alice

# Switch to developers group
newgrp developers

# Now new files will be created with 'developers' group
touch newfile.txt
ls -l newfile.txt
# -rw-r--r-- 1 alice developers 0 Jan 15 10:30 newfile.txt
```

### Exit newgrp Session

```bash
# newgrp starts a new shell — exit to return
exit
```

### Check Available Groups

```bash
# See which groups you belong to
groups
# alice developers webteam sudo
```

---

## When to Change Ownership

### After Copying Files

```bash
# Files copied as root keep root ownership
sudo cp /root/config.conf /home/alice/

ls -l /home/alice/config.conf
# -rw-r--r-- 1 root root 1024 Jan 15 10:30 config.conf

# Fix ownership
sudo chown alice:alice /home/alice/config.conf
```

### Setting Up a Web Server

```bash
# Web server files should be owned by the web server user
sudo chown -R www-data:www-data /var/www/html/

# Verify
ls -l /var/www/html/
# -rw-r--r-- 1 www-data www-data 4096 Jan 15 10:30 index.html
```

### After Extracting Archives

```bash
# Archives may preserve original ownership
sudo tar xzf backup.tar.gz -C /opt/app/

# Fix ownership for the application user
sudo chown -R appuser:appgroup /opt/app/
```

### Shared Project Directory

```bash
# Set up shared directory for a team
sudo mkdir /opt/project
sudo chown root:developers /opt/project
sudo chmod 2775 /opt/project

# The setgid bit (2) ensures new files inherit the group
```

### After Creating a New User

```bash
# Ensure home directory is properly owned
sudo chown -R newuser:newuser /home/newuser/
```

### After Moving Files Between Users

```bash
# Move file to another user's directory
sudo mv /home/alice/report.pdf /home/bob/
sudo chown bob:bob /home/bob/report.pdf
```

---

## id — Show User's UID, GID, Groups

The `id` command displays user identity information:

```bash
id
```

Output:

```bash
uid=1000(alice) gid=1000(alice) groups=1000(alice),27(sudo),1001(developers),1002(webteam)
```

### Show Only UID

```bash
id -u
# 1000
```

### Show Only Username

```bash
id -un
# alice
```

### Show Only Primary GID

```bash
id -g
# 1000
```

### Show Only Primary Group Name

```bash
id -gn
# alice
```

### Show All Group Names

```bash
id -Gn
# alice sudo developers webteam
```

### Check Another User's ID

```bash
id bob
# uid=1001(bob) gid=1001(bob) groups=1001(bob),1001(developers)
```

### Useful id Shortcuts

```bash
# Am I root?
if [ "$(id -u)" -eq 0 ]; then
    echo "Running as root"
else
    echo "Not root"
fi
```

---

## Ownership Scenarios

### Scenario 1: Setting Up a Web Application

```bash
# Create application directory
sudo mkdir -p /var/www/myapp

# Set ownership to web server user
sudo chown -R www-data:www-data /var/www/myapp

# Set permissions
sudo chmod -R 755 /var/www/myapp
sudo chmod -R 644 /var/www/myapp/*.html

# Allow your user to deploy (add to www-data group)
sudo usermod -aG www-data alice

# Set group write permission for deployment
sudo chmod -R g+w /var/www/myapp
```

### Scenario 2: Shared Development Directory

```bash
# Create project directory
sudo mkdir /opt/team-project

# Set ownership
sudo chown root:developers /opt/team-project

# Set setgid so new files inherit group
sudo chmod 2775 /opt/team-project

# Verify
ls -ld /opt/team-project
# drwxrwsr-x 2 root developers 4096 Jan 15 10:30 /opt/team-project

# New files created here will have group 'developers'
cd /opt/team-project
touch newfile.txt
ls -l newfile.txt
# -rw-r--r-- 1 alice developers 0 Jan 15 10:30 newfile.txt
```

### Scenario 3: Fixing Broken Permissions After sudo

```bash
# Oops! Accidentally created files as root in user home
sudo ls /home/alice/
# Some files are owned by root

# Find files owned by root in alice's home
find /home/alice -user root

# Fix them all
sudo find /home/alice -user root -exec chown alice:alice {} \;

# Verify
find /home/alice -user root
# (no output = all fixed)
```

### Scenario 4: Service Account Setup

```bash
# Create a service user
sudo useradd -r -s /usr/sbin/nologin myservice

# Create service directories
sudo mkdir -p /opt/myservice/{bin,data,logs}

# Set ownership
sudo chown -R myservice:myservice /opt/myservice

# Only service user can access data
sudo chmod 700 /opt/myservice/data

# Logs readable by group
sudo chmod 750 /opt/myservice/logs
```

### Scenario 5: Checking Who Owns System Files

```bash
# Check important system files
ls -l /etc/passwd /etc/shadow /etc/group

# Find all files owned by a specific user
find / -user bob 2>/dev/null

# Find files with no valid owner (orphaned)
find / -nouser 2>/dev/null
```

---

## Quick Reference

```bash
# View ownership
ls -l file.txt              # Show owner and group
ls -ln file.txt             # Show UID and GID numbers
id                          # Show current user info
id username                 # Show another user's info

# Change owner
sudo chown bob file.txt           # Change owner
sudo chown bob:group file.txt     # Change owner and group
sudo chown :group file.txt        # Change group only
sudo chown -R bob:group dir/      # Recursive

# Change group
sudo chgrp group file.txt         # Change group
sudo chgrp -R group dir/          # Recursive

# Switch active group
newgrp groupname                  # Switch primary group
groups                            # Show your groups
```

---

## Summary

- Every file has a user owner and a group owner
- `ls -l` shows ownership in the third and fourth columns
- `chown` changes the owner (and optionally the group)
- `chown -R` applies changes recursively to directories
- `chgrp` changes only the group
- `newgrp` switches your active group for creating files
- `id` shows your UID, GID, and group memberships
- Always fix ownership after copying files as root or setting up services
- Use the principle of least privilege when assigning ownership
