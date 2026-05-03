---
title: Linux & Shell Scripting
---

# Linux & Shell Scripting

Welcome to the **Linux & Shell Scripting** course! This comprehensive course will take you from zero to confident Linux user and shell scripter. Whether you want to manage servers, automate tasks, or simply understand how the most widely-used operating system in the world works — you're in the right place.

---

## What You'll Learn

In this course, you will learn:

- What Linux is and why it powers most of the internet
- How to navigate the Linux file system with confidence
- Essential commands for everyday tasks
- How to manage files, directories, and permissions
- Process management and system monitoring
- Text processing with powerful command-line tools
- Shell scripting to automate repetitive tasks
- Networking basics from the command line
- How to set up and manage a Linux server

---

## Who This Course Is For

This course is designed for **complete beginners**. You don't need any prior experience with Linux or programming.

This course is perfect for you if you are:

- A student learning computer science
- A developer wanting to understand servers
- A system administrator starting your career
- A DevOps engineer in training
- Anyone curious about how Linux works
- A Windows or macOS user ready to expand your skills

---

## Course Structure

This course is organized into **9 sections**, progressing from fundamentals to advanced topics:

| # | Section | Lessons | Description |
|---|---------|---------|-------------|
| 1 | Introduction to Linux | 5 | What Linux is, distributions, installation |
| 2 | File System & Navigation | 6 | Directory structure, paths, navigation commands |
| 3 | File Operations | 7 | Creating, copying, moving, deleting files |
| 4 | Users & Permissions | 6 | User management, file permissions, sudo |
| 5 | Text Processing | 7 | grep, sed, awk, pipes, redirection |
| 6 | Process Management | 5 | Running processes, jobs, monitoring |
| 7 | Shell Scripting Basics | 8 | Variables, conditionals, loops, functions |
| 8 | Advanced Shell Scripting | 6 | Arrays, string manipulation, debugging |
| 9 | Networking & System Admin | 5 | SSH, networking commands, cron jobs |

**Total: 55 lessons** covering everything you need to become proficient with Linux.

---

## Prerequisites

You need:

- **A computer** (Windows, macOS, or Linux)
- **Curiosity** and willingness to learn
- **An internet connection** for downloading tools

That's it! No prior programming experience required. No special hardware needed. If you can read this page, you're ready to start.

---

## Why Learn Linux?

Linux is **everywhere**. Here's why learning it is one of the best investments you can make:

### Servers & Web Hosting

```bash
# Over 96% of the world's top web servers run Linux
# Every time you visit a website, you're likely talking to a Linux server
echo "Google, Facebook, Amazon, Netflix — all run on Linux"
```

More than **96% of the world's top 1 million web servers** run Linux. When you visit Google, Amazon, Netflix, or almost any website — you're connecting to a Linux server.

### DevOps & Cloud Computing

```bash
# Major cloud platforms are Linux-based
# AWS, Google Cloud, Azure — all offer Linux instances
echo "Cloud computing runs on Linux"
```

Every major cloud provider (AWS, Google Cloud, Microsoft Azure) uses Linux as the foundation. DevOps engineers work with Linux daily — it's a non-negotiable skill.

### Embedded Systems & IoT

```bash
# Linux runs on everything from routers to smart TVs
echo "Your router probably runs Linux"
echo "Your smart TV might run Linux"
echo "Many cars use Linux-based systems"
```

Linux powers billions of embedded devices: routers, smart TVs, refrigerators, cars, medical devices, and more.

### Android

```bash
# Android is built on the Linux kernel
echo "3+ billion Android devices run a Linux kernel"
```

Every Android phone runs the Linux kernel. With over 3 billion active devices, Linux is the most-used operating system in the world.

### Career Opportunities

Linux skills are in high demand:

- System Administrator: $70,000 – $120,000/year
- DevOps Engineer: $90,000 – $150,000/year
- Cloud Engineer: $100,000 – $160,000/year
- Site Reliability Engineer: $120,000 – $180,000/year

---

## A Brief History of Unix/Linux

### The Unix Era (1969–1990)

```bash
# Timeline of Unix/Linux
echo "1969 — Unix created at AT&T Bell Labs"
echo "1971 — First edition of Unix released"
echo "1973 — Unix rewritten in C (portable!)"
echo "1983 — Richard Stallman starts GNU Project"
echo "1987 — MINIX created by Andrew Tanenbaum"
```

Unix was born in 1969 at AT&T Bell Labs, created by Ken Thompson and Dennis Ritchie. It introduced revolutionary concepts that we still use today: everything is a file, small programs that do one thing well, and pipes to connect them.

### The Birth of Linux (1991)

```bash
# Linus Torvalds' famous message to comp.os.minix
echo "From: torvalds@klaava.Helsinki.FI (Linus Benedict Torvalds)"
echo "Subject: What would you like to see most in minix?"
echo "Date: 25 Aug 91"
echo ""
echo "I'm doing a (free) operating system (just a hobby, won't be"
echo "big and professional like gnu) for 386(486) AT clones."
```

In 1991, a 21-year-old Finnish student named **Linus Torvalds** posted a message saying he was working on a free operating system "just as a hobby." That hobby became Linux — now the most important operating system in computing.

### Linux Today (2024+)

```bash
echo "Linux kernel contributors: 15,000+"
echo "Lines of code in the kernel: 30+ million"
echo "Companies contributing: Microsoft, Google, Intel, Red Hat..."
echo "Market share: 96%+ servers, 72%+ mobile (Android)"
```

Today, Linux is developed by thousands of contributors from hundreds of companies. It's the backbone of the internet, cloud computing, and mobile devices.

---

## What You'll Be Able to Do After This Course

After completing this course, you will be able to:

```bash
# Navigate the file system like a pro
cd /var/log && ls -la && grep "error" syslog

# Manage files and permissions
chmod 755 script.sh && chown user:group file.txt

# Write shell scripts to automate tasks
./backup.sh --source /home --dest /backup

# Monitor system resources
top -b -n 1 | head -20

# Process text files efficiently
cat access.log | awk '{print $1}' | sort | uniq -c | sort -rn

# Manage users and services
sudo systemctl restart nginx

# Connect to remote servers
ssh user@server.example.com

# Schedule automated tasks
crontab -e  # Edit cron jobs
```

Specifically, you'll be able to:

1. **Navigate** any Linux system with confidence
2. **Manage** files, directories, and permissions
3. **Write** shell scripts to automate repetitive tasks
4. **Monitor** system performance and troubleshoot issues
5. **Process** text and data using command-line tools
6. **Administer** users, services, and scheduled tasks
7. **Connect** to remote servers via SSH
8. **Understand** Linux well enough to ace job interviews

---

## How to Use This Course

### Practice Along

```bash
# Don't just read — type every command yourself!
# Open a terminal and follow along
echo "Practice makes perfect"
```

The best way to learn Linux is by **doing**. Open a terminal and type every command you see. Experiment. Break things (in a safe environment). Fix them. That's how you learn.

### Take Notes

Keep a personal cheat sheet of commands you find useful. By the end of this course, you'll have built your own reference guide.

### Don't Memorize — Understand

```bash
# You don't need to memorize everything
# Linux has built-in help for every command
man ls        # Read the manual for 'ls'
ls --help     # Quick help for 'ls'
whatis ls     # One-line description
```

You don't need to memorize hundreds of commands. Focus on understanding concepts. Linux provides built-in help (`man`, `--help`, `info`) for every command.

---

## Let's Get Started!

Ready to begin your Linux journey? Head to the next lesson where we'll explore **what Linux actually is** and why it's different from other operating systems.

```bash
echo "Welcome to the world of Linux!"
echo "Let's begin..."
```

---

## Quick Reference: Course Sections

| Section | Topics Covered |
|---------|---------------|
| **Introduction** | Linux basics, distros, installation, terminal |
| **File System** | Directories, paths, ls, cd, pwd, find |
| **File Operations** | cp, mv, rm, mkdir, touch, cat, nano, vim |
| **Users & Permissions** | chmod, chown, users, groups, sudo |
| **Text Processing** | grep, sed, awk, sort, cut, pipes |
| **Processes** | ps, top, kill, jobs, bg, fg, nohup |
| **Scripting Basics** | Variables, if/else, loops, functions, input |
| **Advanced Scripting** | Arrays, regex, debugging, error handling |
| **Networking & Admin** | SSH, curl, wget, cron, systemd, firewall |

---

*Next lesson: What is Linux? →*
