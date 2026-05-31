---
title: What is Git?
section: Introduction & Theory
---

# What is Git?

Git is a **Distributed Version Control System (DVCS)** created in 2005 by Linus Torvalds, the creator of the Linux operating system.

It was designed with specific goals in mind:

- **Speed**: Operations must be lightning fast, even on massive repositories like the Linux Kernel.
- **Data Integrity**: Cryptographic assurance that history cannot be corrupted or altered without detection.
- **Non-linear Development**: Unprecedented support for thousands of parallel branches.

## The Problem: Why Version Control?

Before formal version control systems, developers managed code changes manually:

```text
project_final/
project_final_v2/
project_final_USE_THIS_ONE/
project_final_v2_USE_THIS_ONE_fixed_bug/
```

This "copy-paste" methodology is fragile. If two developers edit the same file, someone's work gets overwritten. If a critical bug is introduced, pinpointing exactly _when_ and _why_ it was introduced is nearly impossible.

A **Version Control System (VCS)** solves this by tracking the exact history of every file in your project. It acts like a time machine, allowing you to instantly revert the entire project to a specific state in the past.

## Centralized vs Distributed

To understand why Git is so powerful, you must understand the generation of tools that came before it.

### Centralized Version Control (CVCS)

Older tools like **Subversion (SVN)** and **CVS** use a centralized architecture.

There is a single central server that holds the entire history of the project. Developers download a "working copy" (just the current snapshot of the code) to their local machine. When they make changes, they must connect to the central server to commit them.

**The Flaws:**

1. **Single Point of Failure**: If the central server goes down, nobody can commit code or view history. If the server's hard drive dies and there are no backups, the entire history of the project is lost.
2. **Network Dependency**: You cannot view log history, switch branches, or commit changes while offline (e.g., on an airplane).

### Distributed Version Control (DVCS)

Git is distributed. This means there is no single central server that holds the "master copy" in an architectural sense.

When you use Git, you do not just check out the latest snapshot. You **fully mirror the entire repository**. Every developer's local computer holds a 100% complete, independent copy of the project, including its entire history, every branch, and every commit.

**The Benefits:**

1. **Incredible Speed**: Because the entire history is on your local SSD, operations like `git log` or `git diff` happen instantly. There is no network latency.
2. **Offline Work**: You can commit, branch, merge, and inspect history while entirely offline. You only need a network connection when you explicitly want to share your commits with others.
3. **Redundancy**: If a server dies, any developer's local repository can be copied back up to restore the server completely. Every clone is a full backup.

## Git vs GitHub

This is the most common point of confusion for beginners: **Git and GitHub are not the same thing.**

- **Git** is the actual command-line software that runs on your local computer to manage versions of your files. You do not need the internet to use Git.
- **GitHub** is a commercial website and hosting service. It acts as a cloud server where you can store a copy of your Git repository so others can collaborate on it.

Other popular alternatives to GitHub include **GitLab** and **Bitbucket**. They are all competing hosting services built on top of the exact same open-source Git software.

> [!NOTE]
> An analogy: Git is to GitHub what the concept of Video is to YouTube. You can create, edit, and watch videos on your computer without ever touching YouTube.

In the next section, we will pop the hood and look at exactly how Git manages to store this history locally without taking up massive amounts of hard drive space.
