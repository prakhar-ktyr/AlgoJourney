---
title: System Monitoring & Performance
---

# System Monitoring & Performance

As a Linux user or administrator, you need to understand what your system is doing — how much CPU and memory are being used, which processes are consuming resources, and whether disks are bottlenecked. This lesson covers the essential monitoring tools.

---

## top — Real-Time Process Monitor

`top` provides a live, updating view of system processes:

```bash
# Launch top
top

# Common top output header:
# top - 14:30:22 up 5 days, 3:22, 2 users, load average: 0.52, 0.48, 0.41
# Tasks: 213 total, 1 running, 212 sleeping, 0 stopped, 0 zombie
# %Cpu(s): 12.3 us, 3.1 sy, 0.0 ni, 83.4 id, 1.0 wa, 0.0 hi, 0.2 si
# MiB Mem:  16384.0 total, 8192.0 free, 5120.0 used, 3072.0 buff/cache
# MiB Swap:  4096.0 total, 4096.0 free,    0.0 used. 10240.0 avail Mem
```

### Understanding top Columns

| Column | Meaning |
|--------|---------|
| PID    | Process ID |
| USER   | Process owner |
| PR     | Priority |
| NI     | Nice value (-20 to 19) |
| VIRT   | Virtual memory (total) |
| RES    | Resident memory (physical RAM used) |
| SHR    | Shared memory |
| S      | State (R=running, S=sleeping, Z=zombie) |
| %CPU   | CPU usage percentage |
| %MEM   | Memory usage percentage |
| TIME+  | Total CPU time used |
| COMMAND| Command name |

### Interactive top Commands

```bash
# While top is running:
# P — Sort by CPU usage
# M — Sort by memory usage
# T — Sort by time
# k — Kill a process (enter PID)
# r — Renice a process
# f — Choose display fields
# c — Show full command line
# 1 — Toggle per-CPU display
# q — Quit
```

### top Command-Line Options

```bash
# Show specific user's processes
top -u username

# Batch mode (for scripts — single snapshot)
top -bn1

# Show only 10 processes
top -bn1 | head -17

# Update every 2 seconds
top -d 2

# Monitor specific PIDs
top -p 1234,5678
```

---

## htop — Interactive Process Viewer

`htop` is an improved version of `top` with color, mouse support, and easier navigation:

```bash
# Install htop
# macOS: brew install htop
# Ubuntu: sudo apt install htop

# Launch htop
htop
```

### htop Features

- Color-coded CPU and memory bars
- Scroll through process list (arrow keys)
- Tree view of process hierarchy (F5)
- Search processes (F3)
- Filter processes (F4)
- Sort by any column (F6)
- Kill processes (F9)
- Change nice value (F7/F8)
- Setup display options (F2)

```bash
# htop with options
htop -u username      # Show user's processes
htop -p 1234,5678    # Monitor specific PIDs
htop -t              # Tree view by default
htop -d 10           # Update every second (tenths)
```

---

## free — Memory Usage

`free` shows how much memory is in use:

```bash
# Human-readable output
free -h

# Example output:
#               total        used        free      shared  buff/cache   available
# Mem:           16Gi       5.2Gi       7.8Gi       256Mi       3.0Gi        10Gi
# Swap:         4.0Gi          0B       4.0Gi
```

### Understanding free Output

```bash
# Key values:
# total     — Total physical RAM
# used      — RAM in use (includes buffers/cache in some views)
# free      — Completely unused RAM
# shared    — Memory used by tmpfs
# buff/cache — Disk cache (can be freed if needed)
# available — Memory available for new processes (free + reclaimable cache)

# Show in megabytes
free -m

# Show in gigabytes
free -g

# Continuous updates every 2 seconds
free -h -s 2

# Show totals
free -h -t

# Wide output (separates buffers and cache)
free -hw
```

### Memory in Scripts

```bash
#!/bin/bash

# Get available memory in MB
available_mb=$(free -m | awk '/^Mem:/ {print $7}')
total_mb=$(free -m | awk '/^Mem:/ {print $2}')
used_percent=$(( (total_mb - available_mb) * 100 / total_mb ))

echo "Memory: ${used_percent}% used (${available_mb}MB available of ${total_mb}MB)"

if (( used_percent > 90 )); then
    echo "WARNING: Memory usage critical!"
fi
```

---

## vmstat — Virtual Memory Statistics

`vmstat` reports on processes, memory, paging, block I/O, and CPU:

```bash
# Single snapshot
vmstat

# Update every 2 seconds, 5 times
vmstat 2 5

# Example output:
# procs -----------memory---------- ---swap-- -----io---- -system-- ------cpu-----
#  r  b   swpd   free   buff  cache   si   so    bi    bo   in   cs us sy id wa st
#  1  0      0 8012340 234560 3145728  0    0     5    12  150  300 12  3 84  1  0
```

### vmstat Columns Explained

```bash
# procs:
#   r — Processes waiting for CPU (run queue)
#   b — Processes in uninterruptible sleep (blocked on I/O)

# memory (KB):
#   swpd  — Virtual memory used (swap)
#   free  — Idle memory
#   buff  — Memory used as buffers
#   cache — Memory used as cache

# swap:
#   si — Swap in (from disk to memory) per second
#   so — Swap out (from memory to disk) per second

# io (blocks/s):
#   bi — Blocks received from disk
#   bo — Blocks sent to disk

# system:
#   in — Interrupts per second
#   cs — Context switches per second

# cpu (%):
#   us — User time
#   sy — System (kernel) time
#   id — Idle time
#   wa — I/O wait time
#   st — Stolen time (VMs)
```

### Reading vmstat

```bash
# High 'r' value → CPU bottleneck (processes waiting for CPU)
# High 'b' value → I/O bottleneck (processes waiting for disk)
# High 'si'/'so' → System is swapping (needs more RAM)
# High 'wa' → Disk is slow
# High 'cs' → Many context switches (too many processes?)

# Useful options
vmstat -S M        # Show in megabytes
vmstat -d          # Disk statistics
vmstat -p /dev/sda1  # Partition statistics
```

---

## iostat — Disk I/O Statistics

`iostat` reports CPU and disk I/O statistics:

```bash
# Install (part of sysstat package)
# Ubuntu: sudo apt install sysstat

# Basic usage
iostat

# Human-readable, extended statistics
iostat -xh 2

# Example output:
# Device  r/s   rkB/s  rrqm/s %rrqm r_await rareq-sz  w/s  wkB/s ...  %util
# sda    15.20  480.00   2.30 13.14%   1.20    31.58  8.40  320.00  ...  4.20%
```

### Key iostat Metrics

```bash
# %util — Percentage of time disk was busy
#          100% = fully saturated (bottleneck!)
# r_await — Average read latency (ms)
# w_await — Average write latency (ms)
# r/s, w/s — Reads/writes per second

# Monitor specific device every 2 seconds
iostat -xh /dev/sda 2

# CPU statistics only
iostat -c

# Show only disk statistics
iostat -d -h 2
```

---

## sar — System Activity Reporter

`sar` collects and reports system activity over time:

```bash
# CPU usage (every 2 seconds, 5 samples)
sar -u 2 5

# Memory usage
sar -r 2 5

# Disk I/O
sar -d 2 5

# Network statistics
sar -n DEV 2 5

# Load average
sar -q 2 5

# All statistics
sar -A 2 5
```

### Historical Data with sar

```bash
# View today's historical data
sar -u    # CPU for today
sar -r    # Memory for today

# View data from a specific date (stored in /var/log/sysstat/)
sar -u -f /var/log/sysstat/sa15    # 15th of month

# Collect data to a file
sar -o /tmp/sar_data 2 100

# Replay collected data
sar -f /tmp/sar_data -u
```

---

## uptime — System Load

`uptime` shows how long the system has been running and load averages:

```bash
uptime
# Output: 14:30:22 up 5 days, 3:22, 2 users, load average: 0.52, 0.48, 0.41

# The three load average numbers represent:
# 1-minute average, 5-minute average, 15-minute average
```

### Understanding Load Average

```bash
# Load average = number of processes wanting CPU time
# On a single-core system:
#   1.0 = fully loaded
#   > 1.0 = overloaded (processes waiting)
# On a 4-core system:
#   4.0 = fully loaded
#   > 4.0 = overloaded

# Check number of CPU cores
nproc
# or
grep -c processor /proc/cpuinfo

# Rule of thumb: load average should be < number of cores
```

---

## The /proc Filesystem

`/proc` is a virtual filesystem exposing kernel and process information:

### System Information

```bash
# CPU information
cat /proc/cpuinfo
# Key fields: model name, cpu MHz, cache size, cpu cores

# Count CPU cores
grep -c "^processor" /proc/cpuinfo

# Memory information
cat /proc/meminfo
# Key fields: MemTotal, MemFree, MemAvailable, Buffers, Cached

# Available memory in KB
awk '/MemAvailable/ {print $2}' /proc/meminfo

# System load averages
cat /proc/loadavg
# Output: 0.52 0.48 0.41 1/213 12345
# (1min 5min 15min running/total lastPID)

# Kernel version
cat /proc/version

# System uptime (seconds)
cat /proc/uptime
# Output: 432180.45 1625400.22
# (uptime_seconds idle_seconds)
```

### Process Information

```bash
# Every running process has a directory: /proc/PID/

# Process command line
cat /proc/1234/cmdline | tr '\0' ' '

# Process status
cat /proc/1234/status

# Process memory map
cat /proc/1234/maps

# Process file descriptors
ls -la /proc/1234/fd/

# Process environment variables
cat /proc/1234/environ | tr '\0' '\n'

# Process current working directory
readlink /proc/1234/cwd
```

---

## dmesg — Kernel Messages

`dmesg` displays kernel ring buffer messages (hardware, drivers, boot):

```bash
# View kernel messages
dmesg

# Human-readable timestamps
dmesg -T

# Follow new messages (like tail -f)
dmesg -w

# Show only errors and warnings
dmesg --level=err,warn

# Filter by facility
dmesg --facility=kern

# Clear the ring buffer (requires root)
sudo dmesg -c

# Show last 20 messages
dmesg | tail -20
```

### Common dmesg Use Cases

```bash
# Check for disk errors
dmesg | grep -i "error\|fail\|warn" | grep -i "sd\|disk\|ata"

# Check USB device connections
dmesg | grep -i usb

# Check network interface messages
dmesg | grep -i "eth\|wlan\|network"

# Check out-of-memory events
dmesg | grep -i "oom\|out of memory"

# Recent messages (last 5 minutes)
dmesg -T | awk -v date="$(date -d '5 minutes ago' '+%a %b %e %H:%M')" '$0 >= date'
```

---

## strace — Trace System Calls

`strace` shows every system call a process makes — useful for debugging:

```bash
# Trace a command
strace ls /tmp

# Trace a running process
strace -p 1234

# Show only file operations
strace -e trace=file ls /tmp

# Show only network operations
strace -e trace=network curl https://example.com

# Count system calls (summary)
strace -c ls /tmp

# Save output to file
strace -o /tmp/trace.log ls /tmp

# Show timestamps
strace -t ls /tmp

# Follow child processes
strace -f bash script.sh
```

### strace Trace Categories

```bash
# -e trace=file     — File operations (open, stat, chmod)
# -e trace=process  — Process management (fork, exec, exit)
# -e trace=network  — Network operations (socket, connect, send)
# -e trace=signal   — Signal operations (kill, sigaction)
# -e trace=ipc      — IPC operations (shared memory, semaphores)
# -e trace=memory   — Memory operations (mmap, brk)
```

---

## Monitoring Scripts

### Disk Usage Alert

```bash
#!/bin/bash
set -euo pipefail

THRESHOLD=80
ALERT_EMAIL="admin@example.com"

check_disk() {
    echo "=== Disk Usage Report ($(date)) ==="
    echo ""

    local alert_needed=false

    while IFS= read -r line; do
        # Skip header
        [[ "$line" == Filesystem* ]] && continue

        local usage
        usage=$(echo "$line" | awk '{print $5}' | tr -d '%')
        local mount
        mount=$(echo "$line" | awk '{print $6}')
        local device
        device=$(echo "$line" | awk '{print $1}')

        if (( usage >= THRESHOLD )); then
            echo "WARNING: $mount is ${usage}% full ($device)"
            alert_needed=true
        else
            echo "  OK:    $mount is ${usage}% full"
        fi
    done <<< "$(df -h --type=ext4 --type=xfs 2>/dev/null || df -h)"

    echo ""
    if $alert_needed; then
        echo "ALERT: One or more filesystems above ${THRESHOLD}% threshold!"
        return 1
    else
        echo "All filesystems OK (threshold: ${THRESHOLD}%)"
        return 0
    fi
}

check_disk
```

### Memory Alert Script

```bash
#!/bin/bash
set -euo pipefail

WARN_THRESHOLD=80
CRIT_THRESHOLD=95

get_memory_percent() {
    free | awk '/^Mem:/ {printf "%.0f", ($3/$2)*100}'
}

get_swap_percent() {
    free | awk '/^Swap:/ {if($2>0) printf "%.0f", ($3/$2)*100; else print "0"}'
}

mem_percent=$(get_memory_percent)
swap_percent=$(get_swap_percent)

echo "Memory Usage: ${mem_percent}%"
echo "Swap Usage:   ${swap_percent}%"

if (( mem_percent >= CRIT_THRESHOLD )); then
    echo "CRITICAL: Memory usage at ${mem_percent}%!"
    echo ""
    echo "Top memory consumers:"
    ps aux --sort=-%mem | head -6
    exit 2
elif (( mem_percent >= WARN_THRESHOLD )); then
    echo "WARNING: Memory usage at ${mem_percent}%"
    echo ""
    echo "Top memory consumers:"
    ps aux --sort=-%mem | head -6
    exit 1
else
    echo "OK: Memory usage normal"
    exit 0
fi
```

---

## Full Example: System Health Check Script

```bash
#!/bin/bash
set -uo pipefail

# === Configuration ===
DISK_WARN=80
MEM_WARN=85
LOAD_WARN_FACTOR=2  # Alert if load > cores * factor
SWAP_WARN=50

# === Output ===
RED='\033[0;31m'
YEL='\033[0;33m'
GRN='\033[0;32m'
NC='\033[0m'

ok()   { echo -e "  ${GRN}[OK]${NC}   $*"; }
warn() { echo -e "  ${YEL}[WARN]${NC} $*"; }
crit() { echo -e "  ${RED}[CRIT]${NC} $*"; }

ISSUES=0

echo "========================================="
echo "  System Health Check — $(hostname)"
echo "  $(date)"
echo "========================================="
echo ""

# --- Uptime & Load ---
echo "--- Load Average ---"
read -r load1 load5 load15 _ < /proc/loadavg
cores=$(nproc 2>/dev/null || echo 1)
threshold=$(echo "$cores * $LOAD_WARN_FACTOR" | bc)

if (( $(echo "$load1 > $threshold" | bc -l) )); then
    crit "Load: $load1 / $load5 / $load15 (cores: $cores)"
    ((ISSUES++))
elif (( $(echo "$load1 > $cores" | bc -l) )); then
    warn "Load: $load1 / $load5 / $load15 (cores: $cores)"
    ((ISSUES++))
else
    ok "Load: $load1 / $load5 / $load15 (cores: $cores)"
fi
echo ""

# --- Memory ---
echo "--- Memory ---"
mem_total=$(awk '/MemTotal/ {print $2}' /proc/meminfo)
mem_avail=$(awk '/MemAvailable/ {print $2}' /proc/meminfo)
mem_used_pct=$(( (mem_total - mem_avail) * 100 / mem_total ))

if (( mem_used_pct >= MEM_WARN )); then
    warn "RAM: ${mem_used_pct}% used ($(( mem_avail / 1024 ))MB available)"
    ((ISSUES++))
else
    ok "RAM: ${mem_used_pct}% used ($(( mem_avail / 1024 ))MB available)"
fi

# Swap
swap_total=$(awk '/SwapTotal/ {print $2}' /proc/meminfo)
swap_free=$(awk '/SwapFree/ {print $2}' /proc/meminfo)
if (( swap_total > 0 )); then
    swap_used_pct=$(( (swap_total - swap_free) * 100 / swap_total ))
    if (( swap_used_pct >= SWAP_WARN )); then
        warn "Swap: ${swap_used_pct}% used"
        ((ISSUES++))
    else
        ok "Swap: ${swap_used_pct}% used"
    fi
else
    ok "Swap: Not configured"
fi
echo ""

# --- Disk ---
echo "--- Disk Usage ---"
while IFS= read -r line; do
    usage=$(echo "$line" | awk '{print $5}' | tr -d '%')
    mount=$(echo "$line" | awk '{print $6}')
    size=$(echo "$line" | awk '{print $2}')

    if (( usage >= 95 )); then
        crit "$mount: ${usage}% (size: $size)"
        ((ISSUES++))
    elif (( usage >= DISK_WARN )); then
        warn "$mount: ${usage}% (size: $size)"
        ((ISSUES++))
    else
        ok "$mount: ${usage}% (size: $size)"
    fi
done <<< "$(df -h --output=source,size,used,avail,pcent,target -x tmpfs -x devtmpfs 2>/dev/null | tail -n +2 || df -h | tail -n +2)"
echo ""

# --- Processes ---
echo "--- Processes ---"
zombie_count=$(ps aux | awk '$8 ~ /Z/ {count++} END {print count+0}')
total_procs=$(ps aux | wc -l)

if (( zombie_count > 0 )); then
    warn "Zombies: $zombie_count found"
    ((ISSUES++))
else
    ok "No zombie processes"
fi
ok "Total processes: $total_procs"
echo ""

# --- Top CPU Consumers ---
echo "--- Top CPU Consumers ---"
ps aux --sort=-%cpu 2>/dev/null | head -4 | tail -3 | \
    awk '{printf "  %-10s %5s%% CPU  %5s%% MEM  %s\n", $1, $3, $4, $11}'
echo ""

# --- Top Memory Consumers ---
echo "--- Top Memory Consumers ---"
ps aux --sort=-%mem 2>/dev/null | head -4 | tail -3 | \
    awk '{printf "  %-10s %5s%% MEM  %6s RSS  %s\n", $1, $4, $6, $11}'
echo ""

# --- Summary ---
echo "========================================="
if (( ISSUES == 0 )); then
    echo -e "  ${GRN}All checks passed!${NC}"
else
    echo -e "  ${YEL}Issues found: $ISSUES${NC}"
fi
echo "========================================="

exit $ISSUES
```

---

## Summary

| Tool | Purpose | Key Usage |
|------|---------|-----------|
| `top` | Real-time processes | `top -u user` |
| `htop` | Interactive processes | `htop -t` (tree) |
| `free` | Memory usage | `free -h` |
| `vmstat` | System statistics | `vmstat 2 5` |
| `iostat` | Disk I/O | `iostat -xh 2` |
| `sar` | Historical data | `sar -u 2 5` |
| `uptime` | Load averages | `uptime` |
| `/proc` | Kernel info | `cat /proc/meminfo` |
| `dmesg` | Kernel messages | `dmesg -T \| tail` |
| `strace` | System call trace | `strace -e file cmd` |

### Quick Reference

```bash
# "Is the system overloaded?"
uptime

# "What's using all the CPU?"
top -bn1 | head -20

# "What's using all the memory?"
free -h && ps aux --sort=-%mem | head -5

# "Is the disk a bottleneck?"
iostat -xh 2 3

# "What happened recently?"
dmesg -T | tail -30
```

---
