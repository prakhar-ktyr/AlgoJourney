---
title: Process Management
---

# Process Management

Every program running on a Linux system is a **process**. Understanding how to view, control, and manage processes is a core skill for any Linux user or administrator.

---

## What Is a Process?

A **process** is a running instance of a program. When you type a command, the shell creates a new process to execute it.

Every process has:

| Property | Description |
|----------|-------------|
| **PID**  | Process ID — a unique number |
| **PPID** | Parent Process ID — who started it |
| **UID**  | User who owns the process |
| **State** | Current status (running, sleeping, etc.) |

---

## Process States

A process can be in one of these states:

| State | Symbol | Description |
|-------|--------|-------------|
| Running | `R` | Currently executing on CPU |
| Sleeping | `S` | Waiting for an event (interruptible) |
| Uninterruptible Sleep | `D` | Waiting for I/O (cannot be interrupted) |
| Stopped | `T` | Suspended (e.g., Ctrl+Z) |
| Zombie | `Z` | Finished but not yet cleaned up by parent |

---

## ps — List Processes

The `ps` command shows a snapshot of current processes.

### Basic Usage

```bash
$ ps
  PID TTY          TIME CMD
 1234 pts/0    00:00:00 bash
 5678 pts/0    00:00:00 ps
```

### Show All Processes (BSD Style)

```bash
$ ps aux
USER       PID %CPU %MEM    VSZ   RSS TTY   STAT START   TIME COMMAND
root         1  0.0  0.1 169344 13296 ?     Ss   Apr01   0:05 /sbin/init
root         2  0.0  0.0      0     0 ?     S    Apr01   0:00 [kthreadd]
alice     1234  0.1  0.5 234568 45632 pts/0 Ss   10:30   0:02 bash
alice     5678  0.0  0.0  12345  1234 pts/0 R+   10:45   0:00 ps aux
```

| Column | Meaning |
|--------|---------|
| `USER` | Process owner |
| `PID`  | Process ID |
| `%CPU` | CPU usage percentage |
| `%MEM` | Memory usage percentage |
| `VSZ`  | Virtual memory size (KB) |
| `RSS`  | Resident set size — actual RAM used (KB) |
| `STAT` | Process state |
| `TIME` | Total CPU time consumed |
| `COMMAND` | The command that started the process |

### Show All Processes (System V Style)

```bash
$ ps -ef
UID        PID  PPID  C STIME TTY          TIME CMD
root         1     0  0 Apr01 ?        00:00:05 /sbin/init
alice     1234  1200  0 10:30 pts/0    00:00:02 bash
```

### Useful ps Filters

```bash
# Find a specific process
ps aux | grep nginx

# Show processes for a specific user
ps -u alice

# Show process tree
ps auxf

# Show only PID, user, and command
ps -eo pid,user,comm
```

---

## top — Real-Time Process Monitoring

`top` shows processes updating in real time:

```bash
$ top
```

### top Display

```bash
top - 10:45:32 up 5 days,  3:22,  2 users,  load average: 0.52, 0.48, 0.41
Tasks: 245 total,   1 running, 244 sleeping,   0 stopped,   0 zombie
%Cpu(s):  5.2 us,  2.1 sy,  0.0 ni, 92.1 id,  0.3 wa,  0.0 hi,  0.3 si
MiB Mem :  16384.0 total,   8234.5 free,   4521.3 used,   3628.2 buff/cache
MiB Swap:   8192.0 total,   8192.0 free,      0.0 used.  11234.7 avail Mem

  PID USER      PR  NI    VIRT    RES    SHR S  %CPU  %MEM     TIME+ COMMAND
 2345 alice     20   0 1234568 234567  45678 S   5.3   1.4   2:34.56 node
 3456 root      20   0  567890 123456  23456 S   2.1   0.8   1:12.34 nginx
```

### Interactive Commands in top

| Key | Action |
|-----|--------|
| `q` | Quit |
| `k` | Kill a process (prompts for PID) |
| `r` | Renice a process |
| `M` | Sort by memory usage |
| `P` | Sort by CPU usage |
| `1` | Show individual CPU cores |
| `h` | Help |

---

## htop — A Better top

`htop` is an enhanced, colorful process viewer:

```bash
$ htop
```

Features over `top`:
- Color-coded output
- Mouse support
- Horizontal and vertical scrolling
- Tree view (F5)
- Easy process killing (F9)
- Search (F3) and filter (F4)

> **Install:** `sudo apt install htop` or `sudo dnf install htop`

---

## Background Processes

### Running a Command in the Background

Add `&` at the end to run a command in the background:

```bash
$ sleep 60 &
[1] 12345
```

The shell prints:
- `[1]` — Job number
- `12345` — PID of the background process

### You Can Keep Working

```bash
$ sleep 100 &
[1] 11111
$ echo "I can still type!"
I can still type!
$ sleep 200 &
[2] 22222
```

---

## jobs — List Background Jobs

```bash
$ jobs
[1]-  Running                 sleep 100 &
[2]+  Running                 sleep 200 &
```

| Symbol | Meaning |
|--------|---------|
| `+`    | Current job (default for `fg`/`bg`) |
| `-`    | Previous job |

### jobs Options

```bash
# Show PIDs
jobs -l

# Show only running jobs
jobs -r

# Show only stopped jobs
jobs -s
```

---

## fg — Bring to Foreground

Bring a background job to the foreground:

```bash
# Bring the current job (+) to foreground
$ fg

# Bring job number 2 to foreground
$ fg %2

# Bring job by name
$ fg %sleep
```

---

## bg — Resume in Background

Resume a stopped job in the background:

```bash
# Stop a running foreground process
$ sleep 300
^Z
[1]+  Stopped                 sleep 300

# Resume it in the background
$ bg %1
[1]+ sleep 300 &
```

---

## Ctrl+Z and Ctrl+C

| Shortcut | Action | Signal |
|----------|--------|--------|
| `Ctrl+C` | **Terminate** the foreground process | SIGINT (2) |
| `Ctrl+Z` | **Suspend** (pause) the foreground process | SIGTSTP (20) |

### Workflow Example

```bash
# Start a long process
$ find / -name "*.log" 2>/dev/null

# Oops, taking too long! Suspend it
^Z
[1]+  Stopped                 find / -name "*.log" 2>/dev/null

# Resume in background
$ bg %1
[1]+ find / -name "*.log" 2>/dev/null &

# Continue working...
```

---

## kill — Send Signals to Processes

The `kill` command sends signals to processes:

```bash
# Send SIGTERM (graceful shutdown) — default
kill 12345

# Send SIGKILL (force kill — cannot be caught)
kill -9 12345

# Send SIGTERM explicitly
kill -15 12345

# Send SIGHUP (often used to reload config)
kill -1 12345
```

### Kill by Job Number

```bash
kill %1
kill -9 %2
```

---

## Signal Types

| Signal | Number | Description | Can Be Caught? |
|--------|--------|-------------|----------------|
| `SIGHUP`  | 1  | Hangup — terminal closed | Yes |
| `SIGINT`  | 2  | Interrupt — Ctrl+C | Yes |
| `SIGQUIT` | 3  | Quit — core dump | Yes |
| `SIGKILL` | 9  | Kill — **force terminate** | **No** |
| `SIGTERM` | 15 | Terminate — graceful shutdown | Yes |
| `SIGSTOP` | 19 | Stop — pause process | **No** |
| `SIGCONT` | 18 | Continue — resume paused process | Yes |
| `SIGTSTP` | 20 | Terminal stop — Ctrl+Z | Yes |

### List All Signals

```bash
$ kill -l
 1) SIGHUP       2) SIGINT       3) SIGQUIT      4) SIGILL
 5) SIGTRAP      6) SIGABRT      7) SIGBUS       8) SIGFPE
 9) SIGKILL     10) SIGUSR1     11) SIGSEGV     12) SIGUSR2
13) SIGPIPE     14) SIGALRM     15) SIGTERM     ...
```

---

## killall — Kill Processes by Name

```bash
# Kill all processes named "firefox"
killall firefox

# Force kill all node processes
killall -9 node

# Interactive — ask before each kill
killall -i python3

# Kill processes owned by a specific user
killall -u alice python3
```

---

## pkill — Kill by Pattern

```bash
# Kill processes matching a pattern
pkill -f "python server.py"

# Kill by user
pkill -u bob

# Send SIGHUP to all nginx processes
pkill -HUP nginx
```

---

## nohup — Keep Running After Logout

Normally, background processes are killed when you log out. `nohup` prevents this:

```bash
# Run in background, immune to hangup signal
nohup long_running_script.sh &

# Output goes to nohup.out by default
$ cat nohup.out

# Redirect output explicitly
nohup ./backup.sh > backup.log 2>&1 &
```

### Alternative: disown

```bash
# Start a process in background
$ ./server.sh &
[1] 12345

# Remove it from the shell's job table
$ disown %1
```

---

## nice / renice — Process Priority

Every process has a **nice value** from -20 (highest priority) to 19 (lowest priority). Default is 0.

### Start a Process with Custom Priority

```bash
# Lower priority (be "nicer" to other processes)
nice -n 10 ./heavy_task.sh

# Higher priority (requires root)
sudo nice -n -5 ./important_task.sh
```

### Change Priority of a Running Process

```bash
# Make process 12345 lower priority
renice 10 -p 12345

# Make all of alice's processes lower priority
renice 5 -u alice

# Increase priority (requires root)
sudo renice -5 -p 12345
```

---

## Trapping Signals in Scripts

You can handle signals in your scripts with `trap`:

```bash
#!/bin/bash

# Cleanup function
cleanup() {
  echo "Caught signal! Cleaning up..."
  rm -f /tmp/myapp.lock
  exit 0
}

# Set trap for SIGINT and SIGTERM
trap cleanup SIGINT SIGTERM

# Create lock file
touch /tmp/myapp.lock

echo "Running... (PID: $$)"
echo "Press Ctrl+C to stop"

# Simulate work
while true; do
  sleep 1
done
```

```bash
$ ./server.sh
Running... (PID: 54321)
Press Ctrl+C to stop
^CCaught signal! Cleaning up...
```

---

## Process Management Exercises

### Exercise 1: Monitor and Kill

```bash
#!/bin/bash

# Start some background processes
sleep 300 &
PID1=$!
sleep 400 &
PID2=$!
sleep 500 &
PID3=$!

echo "Started processes: $PID1, $PID2, $PID3"

# List them
echo ""
echo "Background jobs:"
jobs -l

# Kill the first one
echo ""
echo "Killing PID $PID1..."
kill $PID1
wait $PID1 2>/dev/null

echo "Remaining jobs:"
jobs -l

# Kill all remaining
echo ""
echo "Killing all remaining..."
kill $PID2 $PID3
wait 2>/dev/null

echo "All done. Jobs:"
jobs -l
```

### Exercise 2: Process Watcher

```bash
#!/bin/bash

# Watch a process and alert when it finishes
TARGET="${1:?Usage: $0 <PID>}"

if ! kill -0 "$TARGET" 2>/dev/null; then
  echo "Process $TARGET does not exist!"
  exit 1
fi

COMMAND=$(ps -p "$TARGET" -o comm= 2>/dev/null)
echo "Watching process $TARGET ($COMMAND)..."

while kill -0 "$TARGET" 2>/dev/null; do
  sleep 2
done

echo "Process $TARGET ($COMMAND) has finished!"
echo "Finished at: $(date)"
```

### Exercise 3: Resource Monitor

```bash
#!/bin/bash

# Simple resource monitor
echo "=== System Resource Monitor ==="
echo "Date: $(date)"
echo ""

echo "--- Top 5 CPU Consumers ---"
ps aux --sort=-%cpu | head -6

echo ""
echo "--- Top 5 Memory Consumers ---"
ps aux --sort=-%mem | head -6

echo ""
echo "--- Process Count by User ---"
ps aux | awk 'NR>1 {print $1}' | sort | uniq -c | sort -rn | head -5

echo ""
echo "--- Process States ---"
ps aux | awk 'NR>1 {print $8}' | sort | uniq -c | sort -rn
```

---

## Summary

| Command | Purpose |
|---------|---------|
| `ps aux` | List all processes |
| `top` / `htop` | Real-time monitoring |
| `command &` | Run in background |
| `jobs` | List background jobs |
| `fg %n` | Bring job to foreground |
| `bg %n` | Resume job in background |
| `kill PID` | Send signal to process |
| `kill -9 PID` | Force kill |
| `killall name` | Kill by name |
| `nohup` | Survive logout |
| `nice` / `renice` | Adjust priority |
| `trap` | Handle signals in scripts |

**Next up:** Learn how to install and manage software with **Package Management**!
