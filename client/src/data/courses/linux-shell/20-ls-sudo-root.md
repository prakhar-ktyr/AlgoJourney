---
title: sudo & Root Access
---

# sudo & Root Access

The root user is the most powerful account on a Linux system. Understanding how to use root privileges safely — through `sudo` — is one of the most important skills for any Linux user or administrator.

---

## What Is Root? The Superuser (UID 0)

Root is the superuser account with User ID 0. It has unrestricted access to the entire system:

- Can read, write, and execute any file
- Can create and delete any user account
- Can install and remove software
- Can change any system configuration
- Can kill any process
- Can access any device
- Bypasses all permission checks

```bash
# Check root's identity
id root
# uid=0(root) gid=0(root) groups=0(root)
```

### The Root Home Directory

```bash
# Root's home is /root (not /home/root)
echo ~root
# /root
```

### Root Prompt

By convention, the root prompt ends with `#` instead of `$`:

```bash
alice@server:~$     # Regular user prompt
root@server:~#      # Root user prompt
```

---

## Why Not Log In as Root Directly

Working as root all the time is dangerous:

1. **No safety net** — typos can be catastrophic (`rm -rf / tmp` with a space deletes everything)
2. **No audit trail** — multiple admins sharing root means no accountability
3. **Every program runs with full power** — malware or bugs as root can destroy the system
4. **Accidental damage** — root can overwrite critical files without warning

### The Principle of Least Privilege

> Only use the minimum permissions needed for the task at hand.

- Work as a regular user by default
- Elevate to root only when necessary
- Return to regular user immediately after

---

## sudo — Execute as Root

The `sudo` (superuser do) command runs a single command with root privileges:

```bash
sudo command
```

### Basic Usage

```bash
# Install a package (requires root)
sudo apt update

# Edit a system file
sudo nano /etc/hosts

# Restart a service
sudo systemctl restart nginx

# View a protected file
sudo cat /etc/shadow
```

### How sudo Works

1. You type `sudo command`
2. System checks if you're in the sudoers file
3. You enter YOUR password (not root's password)
4. The command runs as root
5. You return to your normal user

### sudo Remembers Your Password

After entering your password, sudo caches it for a short time (usually 15 minutes):

```bash
# First command — asks for password
sudo apt update
# [sudo] password for alice: ****

# Second command within timeout — no password needed
sudo apt upgrade
# (runs immediately)
```

### Run as a Different User

```bash
# Run command as bob (not root)
sudo -u bob command

# Example: run a command as www-data
sudo -u www-data touch /var/www/html/test.html
```

### Useful sudo Options

| Option | Description | Example |
|--------|-------------|---------|
| -u user | Run as specified user | sudo -u bob ls /home/bob |
| -i | Start root login shell | sudo -i |
| -s | Start root shell (keep environment) | sudo -s |
| -l | List allowed commands | sudo -l |
| -k | Forget cached password | sudo -k |
| -v | Extend password timeout | sudo -v |
| -n | Non-interactive (fail if password needed) | sudo -n command |
| -E | Preserve environment variables | sudo -E command |

### Check What You Can sudo

```bash
sudo -l
```

Output:

```bash
User alice may run the following commands on server:
    (ALL : ALL) ALL
```

---

## sudo -i — Root Shell

When you need to run multiple commands as root, open a root shell:

```bash
sudo -i
```

This starts a full login shell as root:

```bash
alice@server:~$ sudo -i
root@server:~# whoami
root
root@server:~# pwd
/root
root@server:~# exit
alice@server:~$
```

### sudo -i vs sudo -s

| Command | Description | Home Dir |
|---------|-------------|----------|
| sudo -i | Login shell (like "su -") | /root |
| sudo -s | Non-login shell | Stays in current dir |

### Always Exit When Done

```bash
root@server:~# exit
# or press Ctrl+D
```

> **Best practice**: Use `sudo command` for single commands. Only use `sudo -i` when you need an extended root session, and exit immediately when done.

---

## su — Switch User

The `su` (switch user) command changes your identity to another user.

```bash
su              # Switch to root (asks for root's password)
su -            # Switch to root with full login environment
su - bob        # Switch to bob (asks for bob's password)
su -c "cmd" bob # Run single command as bob
```

### Differences Between su and sudo

| Feature | su | sudo |
|---------|-----|------|
| Password needed | Target user's password | Your own password |
| Audit trail | Minimal | Full (logged) |
| Granularity | All or nothing | Per-command control |
| Session | Opens new shell | Runs single command |

---

## /etc/sudoers — Who Can sudo

The `/etc/sudoers` file controls which users can use sudo and what they can do.

### View sudoers (Never Edit Directly!)

```bash
sudo cat /etc/sudoers
```

### sudoers Format

```bash
# user    host=(run_as_user:run_as_group) commands
alice     ALL=(ALL:ALL) ALL
```

### Breaking Down the Format

```bash
alice     ALL=(ALL:ALL) ALL
│         │   │    │    │
│         │   │    │    └── Can run: ALL commands
│         │   │    └─────── As any group
│         │   └──────────── As any user
│         └────────────────── On any host
└──────────────────────────── User
```

### Common sudoers Entries

```bash
# User alice can do anything
alice   ALL=(ALL:ALL) ALL

# Group sudo can do anything (% prefix = group)
%sudo   ALL=(ALL:ALL) ALL

# bob can only restart nginx
bob     ALL=(root) /usr/bin/systemctl restart nginx

# charlie can run commands without password
charlie ALL=(ALL:ALL) NOPASSWD: ALL

# dave can only manage users
dave    ALL=(root) /usr/sbin/useradd, /usr/sbin/userdel, /usr/bin/passwd
```

### Grant sudo Access to a User

The easiest way is to add them to the sudo group:

```bash
sudo usermod -aG sudo alice
```

### sudoers.d Directory

Modern systems use drop-in files in `/etc/sudoers.d/`:

```bash
# Create a custom sudo rule
sudo visudo -f /etc/sudoers.d/alice
```

Content:

```bash
alice ALL=(ALL:ALL) NOPASSWD: /usr/bin/apt update, /usr/bin/apt upgrade
```

---

## visudo — Safely Edit sudoers

**Never** edit `/etc/sudoers` with a regular text editor. Use `visudo`:

```bash
sudo visudo
```

### Why visudo?

- Locks the file to prevent simultaneous edits
- Validates syntax before saving
- Prevents you from locking yourself out with a typo

### Edit a Drop-In File

```bash
sudo visudo -f /etc/sudoers.d/myconfig
```

### Check Syntax Without Editing

```bash
sudo visudo -c
```

### Change visudo Editor

```bash
sudo EDITOR=nano visudo
```

---

## sudo Timeout and Configuration

### Default Timeout

After entering your password, sudo remembers it for 15 minutes by default.

### Reset Timeout (Forget Password)

```bash
sudo -k
```

### Extend Timeout

```bash
# Refresh the timeout without running a command
sudo -v
```

### Configure Timeout in sudoers

```bash
sudo visudo
```

```bash
# Set timeout to 30 minutes
Defaults    timestamp_timeout=30

# Require password every time (no caching)
Defaults    timestamp_timeout=0

# Never timeout (not recommended!)
Defaults    timestamp_timeout=-1
```

### Other sudoers Settings

```bash
# Log all sudo commands to a file
Defaults    logfile="/var/log/sudo.log"

# Show asterisks when typing password
Defaults    pwfeedback

# Set number of password attempts
Defaults    passwd_tries=5
```

---

## Best Practices: Principle of Least Privilege

```bash
# DO: Use sudo for individual commands
sudo apt update
sudo systemctl restart nginx

# DON'T: Stay in root shell unnecessarily
# sudo -i → forget to exit for hours

# DO: Limit sudo access per command (in sudoers)
# bob ALL=(root) /usr/bin/systemctl restart *

# DON'T: Give NOPASSWD broadly
# alice ALL=(ALL) NOPASSWD: ALL          # Bad
# alice ALL=(ALL) NOPASSWD: /usr/bin/apt update  # Better

# DO: Use groups for sudo access
sudo usermod -aG sudo newadmin

# DO: Review sudo logs
sudo grep "sudo" /var/log/auth.log | tail -20
```

---

## Common Mistakes with sudo

### Mistake 1: Redirecting Output

```bash
# FAILS — redirect runs as regular user
sudo echo "127.0.0.1 myhost" > /etc/hosts
# Permission denied!

# WORKS — use tee
echo "127.0.0.1 myhost" | sudo tee -a /etc/hosts
```

### Mistake 2: Using sudo with Pipes

```bash
# Only the first command runs as root
sudo cat /etc/shadow | grep alice    # Works (cat is root)
cat /etc/shadow | sudo grep alice    # Fails (cat is not root)
```

### Mistake 3: sudo with Environment Variables

```bash
# Your environment is not passed by default
export MY_VAR="hello"
sudo echo $MY_VAR    # May be empty!

# Use -E to preserve environment
sudo -E printenv MY_VAR
```

### Mistake 4: Forgetting sudo on Subsequent Commands

```bash
# sudo doesn't carry over to the next command!
sudo mkdir /opt/myapp
cp config.conf /opt/myapp/    # Permission denied!
sudo cp config.conf /opt/myapp/  # Fix
```

### Mistake 5: sudo rm -rf with Typos

```bash
# EXTREMELY DANGEROUS
sudo rm -rf / tmp/old    # Deletes entire system!

# Always double-check paths
sudo rm -rf -- /tmp/old
```

---

## Using sudo Safely

### Example 1: Package Management

```bash
# Update package list
sudo apt update

# Upgrade packages
sudo apt upgrade -y

# Install a package
sudo apt install nginx
```

### Example 2: Service Management

```bash
# Check service status (no sudo needed)
systemctl status nginx

# Start/stop/restart (sudo needed)
sudo systemctl start nginx
sudo systemctl stop nginx
sudo systemctl restart nginx
sudo systemctl enable nginx
```

### Example 3: Editing System Files Safely

```bash
# Use sudoedit (safer than sudo vim)
sudoedit /etc/nginx/nginx.conf

# This creates a temp copy, lets you edit, then copies back
# If your editor crashes, the original file is safe
```

### Example 4: Writing to Protected Files

```bash
# Use tee for appending/writing
echo "127.0.0.1 myhost" | sudo tee -a /etc/hosts

# Overwrite a protected file
echo "new content" | sudo tee /etc/motd
```

### Example 5: Root Session Script

```bash
#!/bin/bash
# Run administrative tasks with proper checks

if [ "$(id -u)" -ne 0 ]; then
    echo "This script must be run with sudo"
    echo "Usage: sudo $0"
    exit 1
fi

echo "Updating system..."
apt update && apt upgrade -y
echo "Done!"
```

---

## Quick Reference

```bash
# sudo basics
sudo command              # Run command as root
sudo -u user command      # Run as specific user
sudo -i                   # Root login shell
sudo -s                   # Root shell (keep env)
sudo -l                   # List allowed commands
sudo -k                   # Forget cached password
sudo -v                   # Extend timeout

# su (switch user)
su                        # Switch to root (needs root password)
su -                      # Switch to root with login env
su - username             # Switch to another user

# sudoers management
sudo visudo               # Edit sudoers safely
sudo visudo -f /etc/sudoers.d/file  # Edit drop-in file
sudo visudo -c            # Check syntax

# Safe patterns
echo "text" | sudo tee file          # Write to protected file
echo "text" | sudo tee -a file       # Append to protected file
sudoedit /path/to/file               # Safely edit system file
```

---

## Summary

- Root (UID 0) is the superuser with unrestricted system access
- Never log in as root directly — use `sudo` for individual commands
- `sudo` uses YOUR password and provides an audit trail
- `sudo -i` opens a root shell when you need extended root access
- `su` switches user identity (requires the target user's password)
- `/etc/sudoers` controls who can use sudo — always edit with `visudo`
- Use the principle of least privilege: minimum access for the task
- Common pitfall: output redirection doesn't inherit sudo — use `tee`
- Review sudo logs regularly for security monitoring
