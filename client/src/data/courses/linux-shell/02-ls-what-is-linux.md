---
title: What is Linux?
---

# What is Linux?

You've probably heard the name "Linux" before — but what exactly is it? In this lesson, we'll break down what Linux is, how it differs from other operating systems, and why it's become the most important operating system in modern computing.

---

## Linux = A Kernel

Let's start with the most important distinction:

**Linux is technically just a kernel** — the core of an operating system.

```bash
# Check your Linux kernel version
uname -r
# Example output: 6.5.0-35-generic

# More detailed kernel information
uname -a
# Example output: Linux mypc 6.5.0-35-generic #35-Ubuntu SMP x86_64 GNU/Linux
```

### What is a Kernel?

A kernel is the **bridge between hardware and software**. It handles:

- **Memory management** — allocating RAM to programs
- **Process scheduling** — deciding which program runs when
- **Device drivers** — communicating with hardware (disk, network, USB)
- **System calls** — providing an interface for programs to request services
- **File systems** — organizing data on storage devices

Think of it like this:

```bash
# The kernel is like a translator between you and your computer hardware
echo "Application → Kernel → Hardware"
echo "Firefox → Linux Kernel → CPU, RAM, Disk, Network"
```

---

## GNU/Linux = The Complete Operating System

When people say "Linux," they usually mean **GNU/Linux** — a complete operating system that combines:

- **Linux kernel** (created by Linus Torvalds, 1991)
- **GNU tools** (created by Richard Stallman's GNU Project, 1983)
- **Additional software** (package managers, desktop environments, etc.)

```bash
# The GNU tools you use every day
ls      # GNU coreutils
grep    # GNU grep
bash    # GNU Bourne Again Shell
gcc     # GNU Compiler Collection
make    # GNU Make
tar     # GNU tar

# These are all part of the GNU Project, not the Linux kernel
echo "Linux kernel + GNU tools = a complete OS"
```

### Why Does This Matter?

The GNU Project created essential tools (compilers, shells, utilities) years before the Linux kernel existed. When Linus Torvalds created the kernel in 1991, the GNU tools were combined with it to create a full operating system.

Some people insist on calling it "GNU/Linux" to credit both projects. In practice, most people just say "Linux" — and that's what we'll do in this course.

---

## The Open Source Philosophy

Linux is **open source** software. This means:

```bash
# You can view the Linux kernel source code right now
echo "https://github.com/torvalds/linux"

# The kernel is licensed under GPL v2
# This means:
echo "✓ Anyone can view the source code"
echo "✓ Anyone can modify the code"
echo "✓ Anyone can distribute their modifications"
echo "✓ Modifications must also be open source (copyleft)"
```

### What Open Source Means in Practice

| Aspect | Proprietary (Windows) | Open Source (Linux) |
|--------|----------------------|---------------------|
| Source code | Hidden | Publicly available |
| Cost | Paid license | Free (as in freedom AND beer) |
| Modifications | Not allowed | Encouraged |
| Distribution | Restricted | Free to share |
| Bug fixes | Wait for vendor | Fix it yourself (or community will) |
| Security audit | Trust the vendor | Anyone can audit |

### The Four Freedoms (Free Software Foundation)

```bash
echo "Freedom 0: Run the program for any purpose"
echo "Freedom 1: Study how the program works (access source code)"
echo "Freedom 2: Redistribute copies to help others"
echo "Freedom 3: Distribute modified versions to benefit the community"
```

---

## Unix Origins → Linus Torvalds, 1991

### The Unix Family Tree

```bash
# The history of Unix and Linux
echo "1969 — Unix born at AT&T Bell Labs (Thompson & Ritchie)"
echo "1973 — Unix rewritten in C language"
echo "1977 — BSD (Berkeley Software Distribution) forks from Unix"
echo "1983 — Richard Stallman announces GNU Project"
echo "1987 — MINIX created (educational Unix-like OS)"
echo "1991 — Linus Torvalds creates Linux kernel (age 21)"
echo "1992 — Linux released under GPL license"
echo "1993 — Debian and Slackware distributions created"
echo "1994 — Linux 1.0 released"
echo "2004 — Ubuntu 4.10 released (made Linux accessible)"
echo "2024 — Linux dominates servers, cloud, mobile, embedded"
```

### Linus Torvalds and the Birth of Linux

In August 1991, Linus Torvalds — a 21-year-old computer science student at the University of Helsinki — posted this message:

```bash
# The famous Usenet post (comp.os.minix, August 25, 1991)
cat << 'EOF'
Hello everybody out there using minix -

I'm doing a (free) operating system (just a hobby, won't be big and
professional like gnu) for 386(486) AT clones. This has been brewing
since april, and is starting to get ready. I'd like any feedback on
things people like/dislike in minix, as my OS resembles it somewhat.

I've currently ported bash(1.08) and gcc(1.40), and things seem to work.
This implies that I'll get something practical within a few months.

      Linus (torvalds@kruuna.helsinki.fi)
EOF
```

Little did he know that this "hobby" would become the most important operating system in the world.

---

## Kernel vs OS vs Distribution

Understanding these three layers is crucial:

```bash
# Layer 1: The Kernel (Linux)
echo "Kernel = Core of the OS"
echo "Handles: hardware, memory, processes, file systems"

# Layer 2: The Operating System (GNU/Linux)
echo "OS = Kernel + System Tools + Libraries"
echo "Adds: shell, compilers, file utilities, network tools"

# Layer 3: The Distribution (Ubuntu, Fedora, etc.)
echo "Distro = OS + Package Manager + Desktop + Default Apps"
echo "Adds: installer, software store, themes, configuration"
```

### Visual Breakdown

| Layer | What It Is | Examples |
|-------|-----------|----------|
| **Kernel** | Core system software | Linux 6.5, Linux 6.1 |
| **OS** | Kernel + essential tools | GNU/Linux |
| **Distribution** | Complete, ready-to-use system | Ubuntu, Fedora, Arch |
| **Desktop Environment** | Graphical interface | GNOME, KDE, XFCE |
| **Applications** | End-user software | Firefox, LibreOffice, VS Code |

```bash
# Think of it like a car:
echo "Kernel     = Engine"
echo "OS         = Engine + Frame + Wheels"
echo "Distro     = Complete car, ready to drive"
echo "Desktop    = Interior & Dashboard"
echo "Apps       = Passengers & Cargo"
```

---

## Where Linux Is Used

Linux is the **most widely deployed operating system** in the world. Here's where:

### Web Servers (96%+)

```bash
# The world's biggest websites run on Linux
echo "Google     — Linux (custom distro)"
echo "Facebook   — Linux (CentOS-based)"
echo "Amazon     — Linux (Amazon Linux)"
echo "Netflix    — Linux (FreeBSD for CDN, Linux for backend)"
echo "Wikipedia  — Linux (Ubuntu)"
echo "Twitter/X  — Linux"
echo "Reddit     — Linux"
```

Over **96% of the top 1 million web servers** run Linux. When you browse the internet, almost every page is served by a Linux machine.

### Cloud Computing (90%+)

```bash
# Major cloud platforms
echo "Amazon Web Services (AWS)  — Linux instances dominate"
echo "Google Cloud Platform      — Built on Linux"
echo "Microsoft Azure            — 60%+ of VMs run Linux"
echo "DigitalOcean              — Linux droplets"
echo "Linode/Akamai             — Linux servers"
```

Even Microsoft (creator of Windows) runs more Linux than Windows on their Azure cloud platform!

### Mobile Devices — Android (72% market share)

```bash
# Android uses the Linux kernel
echo "Android phones: 3+ billion active devices"
echo "Android is the #1 mobile OS worldwide"
echo "Based on Linux kernel with modifications"
```

### Supercomputers (100%)

```bash
# ALL of the world's top 500 supercomputers run Linux
echo "Top500 supercomputers running Linux: 500/500 (100%)"
echo "This has been true since November 2017"
```

### IoT & Embedded Systems

```bash
echo "Smart TVs          — Many run Linux (Samsung Tizen, LG webOS)"
echo "Routers/Modems     — Most run Linux (OpenWrt)"
echo "Cars               — Tesla, Toyota, many others use Linux"
echo "Spacecraft         — Mars Helicopter Ingenuity runs Linux"
echo "Medical devices    — Many use embedded Linux"
echo "Smart home devices — Raspberry Pi, many IoT devices"
```

### Other Uses

```bash
echo "Gaming     — Steam Deck runs Linux (SteamOS)"
echo "Film/VFX   — Industrial Light & Magic, Pixar, DreamWorks"
echo "Finance    — Stock exchanges (NYSE, NASDAQ)"
echo "Science    — CERN, NASA, research labs worldwide"
echo "Government — US DoD, French Gendarmerie, Munich"
```

---

## Linux vs Windows vs macOS

| Feature | Linux | Windows | macOS |
|---------|-------|---------|-------|
| **Cost** | Free | $100–$200+ | Free (with Apple hardware) |
| **Source Code** | Open | Closed | Partially open (Darwin kernel) |
| **Customization** | Extremely high | Limited | Limited |
| **Security** | Excellent | Good (improving) | Very good |
| **Hardware Support** | Very good | Excellent | Apple hardware only |
| **Gaming** | Good (improving) | Excellent | Limited |
| **Server Use** | Dominant (96%+) | Declining (~4%) | Rare |
| **Desktop Use** | ~4% | ~72% | ~15% |
| **Learning Curve** | Steeper initially | Familiar to most | Easy for Apple users |
| **Updates** | User-controlled | Forced | Semi-forced |
| **Package Manager** | Yes (apt, dnf, etc.) | winget (newer) | Homebrew (third-party) |
| **Terminal** | Powerful, central | PowerShell (improving) | Good (Unix-based) |
| **Privacy** | Excellent | Questionable telemetry | Good |

---

## Key Advantages of Linux

### 1. Free (Zero Cost)

```bash
# Download, install, use — completely free
echo "Ubuntu: free"
echo "Fedora: free"
echo "Debian: free"
echo "Arch Linux: free"
echo "Every update: free"
echo "Forever: free"
```

### 2. Secure

```bash
# Linux security advantages
echo "✓ Fewer viruses/malware (small desktop target + better design)"
echo "✓ Built-in firewall (iptables/nftables)"
echo "✓ File permission system (user/group/other)"
echo "✓ No admin by default (must explicitly use sudo)"
echo "✓ Regular security updates"
echo "✓ Open source = thousands of eyes reviewing code"
echo "✓ SELinux/AppArmor for mandatory access control"
```

### 3. Customizable

```bash
# You can change EVERYTHING
echo "Desktop environment — choose GNOME, KDE, XFCE, i3, and more"
echo "Window manager — floating, tiling, stacking"
echo "Shell — bash, zsh, fish"
echo "File manager — Nautilus, Dolphin, Thunar, ranger"
echo "Text editor — vim, emacs, nano, VS Code"
echo "Init system — systemd, OpenRC, runit"
echo "Literally everything is replaceable"
```

### 4. Stable

```bash
# Linux servers run for years without rebooting
uptime
# Example output: up 847 days, 3:22, 1 user

echo "Linux servers routinely achieve 99.99%+ uptime"
echo "No forced restarts for updates"
echo "No 'Updating... please don't turn off your computer'"
```

### 5. Community

```bash
# The Linux community is massive and helpful
echo "Forums: Ask Ubuntu, Arch Wiki, Stack Overflow"
echo "Chat: IRC, Discord, Matrix, Reddit"
echo "Documentation: man pages, info pages, wikis"
echo "Conferences: LinuxCon, FOSDEM, All Things Open"
echo "Code: GitHub, GitLab — contribute to any project"
```

---

## The Linux Mascot: Tux

Linux's mascot is **Tux**, a friendly penguin. Linus Torvalds chose a penguin because:

```bash
echo "According to Linus:"
echo "'I was bitten by a penguin at a zoo in Australia.'"
echo "'I just think penguins are fun.'"
echo ""
echo "The name 'Tux' comes from:"
echo "  - (T)orvalds + (U)ni(X) = TUX"
echo "  - Also looks like a tuxedo (which penguins seem to wear)"
```

Tux was designed by Larry Ewing in 1996 using GIMP (a free, open-source image editor that runs on Linux, of course).

You'll see Tux on Linux websites, merchandise, and even in the kernel source code!

---

## Summary

```bash
echo "=== Key Takeaways ==="
echo ""
echo "1. Linux is a kernel — the core of the OS"
echo "2. GNU/Linux is the complete operating system"
echo "3. A distribution packages everything for end users"
echo "4. Linux is open source — free to use, study, modify, share"
echo "5. Created by Linus Torvalds in 1991 (still maintains it!)"
echo "6. Powers 96%+ of web servers, all supercomputers, Android"
echo "7. Key advantages: free, secure, customizable, stable"
echo "8. Learning Linux = investing in your career"
```

---

## Try It Yourself

If you already have access to a Linux terminal, try these commands:

```bash
# What kernel version are you running?
uname -r

# What distribution are you using?
cat /etc/os-release

# How long has your system been running?
uptime

# What's your username?
whoami

# What shell are you using?
echo $SHELL
```

---

*Next lesson: Linux Distributions →*
