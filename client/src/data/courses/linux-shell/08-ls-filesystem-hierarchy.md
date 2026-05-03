---
title: Linux File System Hierarchy
---

# Linux File System Hierarchy

Understanding how Linux organizes its files is fundamental. Unlike Windows with its C:\ drive and D:\ drive, Linux has a single tree structure starting from one root.

---

## Everything Is a File

In Linux, **everything is a file**. This is a core philosophy:

```bash
# Regular files (documents, scripts, images)
/home/alice/report.txt

# Directories (special files that contain other files)
/home/alice/Documents/

# Device files (your hard drive, USB, etc.)
/dev/sda

# Process information (running programs)
/proc/1234/status

# Sockets and pipes (communication channels)
/var/run/docker.sock
```

This unified approach means the same tools (`cat`, `ls`, `echo`) work everywhere — reading files, checking hardware, inspecting processes.

```bash
# Read a regular file
cat /etc/hostname

# Read device info (it's a "file")
cat /proc/cpuinfo

# Read process info (also a "file")
cat /proc/meminfo

# Even your terminal is a file!
echo "Hello" > /dev/pts/0
```

---

## The Root Directory /

Everything starts at `/` — the **root directory**. It's the top of the tree.

```bash
# List the top-level directories
ls /
```

**Output:**

```bash
bin   dev  home  lib    media  opt   root  sbin  sys  usr
boot  etc  init  lib64  mnt    proc  run   srv   tmp  var
```

Every file and directory on your system lives somewhere under `/`.

```bash
# The tree looks like this:
/
├── bin/
├── boot/
├── dev/
├── etc/
├── home/
│   ├── alice/
│   └── bob/
├── opt/
├── proc/
├── root/
├── tmp/
├── usr/
│   ├── bin/
│   ├── lib/
│   └── share/
└── var/
    ├── log/
    └── tmp/
```

---

## FHS Standard Directories

The **Filesystem Hierarchy Standard (FHS)** defines what goes where. Here's every important directory:

### /bin — Essential User Binaries

Contains commands needed for basic system operation, available to all users.

```bash
ls /bin
# ls  cp  mv  rm  cat  echo  grep  mkdir  bash  sh ...

# These are the commands you use every day
which ls
# /usr/bin/ls (or /bin/ls on older systems)

# On modern systems, /bin is often a symlink to /usr/bin
ls -la /bin
# lrwxrwxrwx 1 root root 7 /bin -> usr/bin
```

### /sbin — System Binaries

Commands for system administration (usually need root/sudo).

```bash
ls /sbin
# fdisk  mkfs  iptables  reboot  shutdown  ifconfig ...

# These are admin tools
which fdisk
# /usr/sbin/fdisk

# You typically need sudo to run these
sudo fdisk -l
```

### /etc — Configuration Files

**All** system-wide configuration lives here. "etc" = "editable text configuration."

```bash
ls /etc
```

**Common files:**

```bash
# User accounts
cat /etc/passwd

# Network configuration
cat /etc/hostname
cat /etc/hosts

# Shell configuration
cat /etc/bash.bashrc

# Package sources (Debian/Ubuntu)
cat /etc/apt/sources.list

# System services
ls /etc/systemd/system/

# Cron jobs
ls /etc/cron.d/
```

### Try It Yourself

```bash
# See your computer's name
cat /etc/hostname

# See the hosts file
cat /etc/hosts

# See your user entry
grep $USER /etc/passwd

# List all config directories
ls /etc/ | head -20
```

### /home — User Home Directories

Each user gets their own directory under `/home`.

```bash
ls /home
# alice  bob  charlie

# Your home directory
echo $HOME
# /home/alice

# What's in a typical home directory
ls -la ~/
# .bashrc      — shell configuration
# .profile     — login configuration
# .ssh/        — SSH keys
# Desktop/     — desktop files
# Documents/   — your documents
# Downloads/   — downloaded files
```

### /var — Variable Data

Data that changes frequently during system operation.

```bash
# System logs (very important!)
ls /var/log/
# syslog  auth.log  kern.log  apt/  nginx/

# Read recent system messages
sudo tail -20 /var/log/syslog

# Mail spool
ls /var/mail/

# Web server files (if installed)
ls /var/www/html/

# Package manager cache
ls /var/cache/apt/
```

### Try It Yourself

```bash
# Check the last few system log entries
sudo tail -5 /var/log/syslog

# See how much space logs are using
du -sh /var/log/

# List log files
ls -lh /var/log/ | head -10
```

### /tmp — Temporary Files

A place for temporary files. Usually cleared on reboot.

```bash
# Anyone can create files here
echo "test" > /tmp/myfile.txt
cat /tmp/myfile.txt

# See what's in /tmp
ls /tmp

# Files here are auto-deleted (usually on reboot)
# Don't store anything important here!
```

### /usr — User Programs

The majority of installed programs and their supporting files live here.

```bash
# User binaries (most commands live here)
ls /usr/bin/ | wc -l
# Often 2000+ commands!

# Libraries
ls /usr/lib/

# Shared data (icons, docs, etc.)
ls /usr/share/

# Local installations (compiled from source)
ls /usr/local/bin/

# Header files (for compiling C programs)
ls /usr/include/
```

### /opt — Optional/Third-Party Software

Large third-party applications install here (separate from the system).

```bash
# Examples of what lives in /opt
ls /opt/
# google/         — Google Chrome
# discord/        — Discord
# visual-studio-code/  — VS Code (sometimes)

# Each app gets its own directory
ls /opt/google/chrome/
```

### /dev — Device Files

Special files that represent hardware devices and virtual devices.

```bash
# Hard drives and partitions
ls /dev/sd*
# /dev/sda   /dev/sda1   /dev/sda2

# Terminal devices
ls /dev/pts/

# Special devices
ls -la /dev/null    # Black hole — discards everything
ls -la /dev/zero    # Infinite source of zeros
ls -la /dev/random  # Random number generator
ls -la /dev/urandom # Faster random numbers
```

### Try It Yourself

```bash
# Send output to the black hole
echo "this disappears" > /dev/null

# Generate random data (press Ctrl+C to stop)
cat /dev/urandom | head -c 32 | base64

# Check your disk devices
ls /dev/sd* 2>/dev/null || ls /dev/nvme* 2>/dev/null
```

### /proc — Process Information (Virtual)

A virtual filesystem that provides information about running processes and the kernel. Nothing is stored on disk — it's generated on the fly.

```bash
# CPU information
cat /proc/cpuinfo | head -20

# Memory information
cat /proc/meminfo | head -10

# Currently running processes (by PID)
ls /proc/ | grep -E "^[0-9]" | head -10

# Info about process with PID 1 (init/systemd)
ls /proc/1/
# cmdline  status  fd/  maps  ...

# Kernel version
cat /proc/version

# System uptime (in seconds)
cat /proc/uptime
```

### /sys — System Information (Virtual)

Another virtual filesystem providing information about devices, drivers, and kernel features.

```bash
# Hardware information
ls /sys/class/
# block/  net/  power/  thermal/  ...

# Network interfaces
ls /sys/class/net/
# eth0  lo  wlan0

# Battery info (laptops)
cat /sys/class/power_supply/BAT0/capacity 2>/dev/null

# CPU frequency
cat /sys/devices/system/cpu/cpu0/cpufreq/scaling_cur_freq 2>/dev/null

# Brightness control
ls /sys/class/backlight/ 2>/dev/null
```

### /boot — Boot Loader

Contains files needed to start the system (kernel, bootloader config).

```bash
ls /boot/
# vmlinuz-5.15.0-91-generic    — Linux kernel
# initrd.img-5.15.0-91-generic — Initial RAM disk
# grub/                        — GRUB bootloader config

# Don't modify these files unless you know what you're doing!
```

### /mnt and /media — Mount Points

Where external storage (USB drives, CDs, network drives) gets attached.

```bash
# Manual mounts go here
ls /mnt/

# Auto-mounted media (USB drives, etc.)
ls /media/$USER/

# Example: USB drive mounted
ls /media/alice/USB_DRIVE/
```

---

## Directory Comparison Table

| Directory | Purpose | Example Contents |
|-----------|---------|-----------------|
| `/bin` | Essential commands | `ls`, `cp`, `cat`, `bash` |
| `/sbin` | System admin commands | `fdisk`, `iptables`, `reboot` |
| `/etc` | Configuration files | `passwd`, `hostname`, `fstab` |
| `/home` | User personal files | `/home/alice/Documents/` |
| `/var` | Variable/changing data | logs, mail, web content |
| `/tmp` | Temporary files | cleared on reboot |
| `/usr` | User programs & libraries | most installed software |
| `/opt` | Third-party software | Chrome, Discord, etc. |
| `/dev` | Device files | `sda`, `null`, `random` |
| `/proc` | Process info (virtual) | CPU info, memory, PIDs |
| `/sys` | System info (virtual) | hardware, drivers |
| `/boot` | Boot files | kernel, initramfs |
| `/mnt` | Manual mount point | mounted drives |
| `/media` | Auto-mount point | USB drives, CDs |
| `/root` | Root user's home | admin's personal files |
| `/srv` | Service data | web/FTP server data |
| `/run` | Runtime data | PID files, sockets |
| `/lib` | Shared libraries | `.so` files for `/bin` |

---

## Path Types: Absolute vs Relative

### Absolute Paths

An absolute path starts from the root `/` and gives the complete location:

```bash
# Absolute paths always start with /
/home/alice/Documents/report.txt
/etc/nginx/nginx.conf
/var/log/syslog
/usr/bin/python3

# They work from anywhere
cat /etc/hostname    # Works no matter where you are
```

### Relative Paths

A relative path starts from your **current directory**:

```bash
# If you're in /home/alice:
pwd
# /home/alice

# Relative path (from current directory)
cat Documents/report.txt
# Same as: cat /home/alice/Documents/report.txt

# Go up and into another directory
cat ../bob/notes.txt
# Same as: cat /home/bob/notes.txt
```

### Comparison

```bash
# You are in /home/alice/Documents

# Absolute (full path from root):
cat /home/alice/Documents/report.txt

# Relative (from where you are):
cat report.txt

# Both reference the same file!
```

### When to Use Which

```bash
# Use ABSOLUTE when:
# - Writing scripts (predictable, doesn't depend on pwd)
# - Referencing system files
# - Being explicit is important

# Use RELATIVE when:
# - Navigating interactively
# - Referencing nearby files
# - Working within a project
```

---

## Special Path Shortcuts

### ~ (Tilde) — Home Directory

```bash
# These are equivalent:
cd ~
cd /home/alice
cd $HOME

# Reference files in home
cat ~/.bashrc
# Same as: cat /home/alice/.bashrc

# Other users' homes
ls ~bob
# Same as: ls /home/bob
```

### . (Dot) — Current Directory

```bash
# The current directory
pwd
# /home/alice

ls .
# Same as: ls

# Useful for running scripts
./my_script.sh
# Runs the script in the current directory
```

### .. (Double Dot) — Parent Directory

```bash
# Go up one level
cd ..

# Go up two levels
cd ../..

# Reference a file in parent directory
cat ../config.txt

# Go to sibling directory
cd ../bob
# If you were in /home/alice, now you're in /home/bob
```

### Combining Shortcuts

```bash
# Complex path navigation
cd ~/Documents/../Downloads
# Goes to: /home/alice/Downloads

# Multiple levels up
ls ../../etc/hosts
# From /home/alice: goes to /etc/hosts

# Current directory explicitly
cp /tmp/file.txt ./
# Copies to current directory
```

---

## Exploring the Filesystem

### Visual Overview

```bash
# Install tree for visual directory listing
sudo apt install tree    # Debian/Ubuntu
brew install tree        # macOS

# Show directory tree (limit depth)
tree / -L 1

# Output:
# /
# ├── bin -> usr/bin
# ├── boot
# ├── dev
# ├── etc
# ├── home
# ├── lib -> usr/lib
# ├── media
# ├── mnt
# ├── opt
# ├── proc
# ├── root
# ├── run
# ├── sbin -> usr/sbin
# ├── srv
# ├── sys
# ├── tmp
# ├── usr
# └── var
```

### Check Directory Sizes

```bash
# Size of top-level directories
sudo du -sh /* 2>/dev/null | sort -rh | head -10

# Output might look like:
# 5.2G    /usr
# 2.1G    /var
# 1.8G    /home
# 500M    /opt
# 200M    /boot
# 50M     /etc
# 0       /proc
# 0       /sys
```

---

## Exercises

### Exercise 1: Explore Key Directories

```bash
# 1. Check what's in /etc
ls /etc | wc -l
# How many config files/dirs are there?

# 2. Look at your home directory
ls -la ~
# What hidden files do you see?

# 3. Check /tmp
ls /tmp
# Is there anything there?

# 4. See your devices
ls /dev | head -20
```

### Exercise 2: Practice Paths

```bash
# Starting from your home directory:
cd ~

# Use an absolute path to get to /var/log
cd /var/log
pwd

# Use a relative path to get to /var
cd ..
pwd

# Go back home with ~
cd ~
pwd

# Use a relative path to reach /etc/hosts
cat ../../etc/hosts
```

### Exercise 3: Investigate Your System

```bash
# How much RAM does your system have?
cat /proc/meminfo | grep MemTotal

# How many CPU cores?
cat /proc/cpuinfo | grep "processor" | wc -l

# What's your kernel version?
cat /proc/version

# How long has the system been running?
cat /proc/uptime

# What's the hostname?
cat /etc/hostname
```

### Exercise 4: Identify Absolute vs Relative

```bash
# Which of these are absolute? Which are relative?
# /home/alice/file.txt     → Absolute (starts with /)
# Documents/file.txt       → Relative (starts with dir name)
# ./script.sh              → Relative (starts with .)
# ../parent/file.txt       → Relative (starts with ..)
# ~/Downloads/pic.jpg      → Absolute (~ expands to /home/user)
# /etc/hosts               → Absolute (starts with /)
```

---

## Summary

Key takeaways:

- Linux has a **single directory tree** starting at `/`
- **Everything is treated as a file** — documents, devices, processes
- The **FHS standard** defines where things go
- **Absolute paths** start from `/`, **relative paths** start from your current directory
- **Shortcuts**: `~` (home), `.` (current), `..` (parent)
- **Don't worry about memorizing** — use `ls` and `man hier` to explore!

```bash
# Pro tip: Read the filesystem hierarchy manual
man hier
```

In the next lesson, you'll learn advanced techniques for navigating the file system efficiently!
