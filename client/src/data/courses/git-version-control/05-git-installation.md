---
title: Installation
section: Setup & Configuration
---

# Installing Git

Before you can configure and use Git, you must install the binaries on your operating system. Because Git was originally built for the Linux Kernel, it is heavily integrated into Unix-like systems, but excellent ports exist for Windows.

## Installing on Windows

The official and most reliable way to use Git on Windows is via **Git for Windows**.

1. Download the installer from the official website: [git-scm.com/download/win](https://git-scm.com/download/win).
2. Run the executable.
3. During installation, you will be prompted with several configuration options. For most beginners, leaving all the default options checked is perfectly fine.

**What you get:**

- **Git Bash**: A terminal emulator that provides a Unix-style command line environment (running bash) on Windows. **You should always use Git Bash for your Git commands on Windows**, rather than the default Command Prompt or PowerShell, to ensure compatibility with standard tutorials.
- **Git GUI**: A rudimentary graphical interface for Git (though most developers prefer terminal usage or advanced IDE integrations).

## Installing on macOS

Apple ships macOS with a pre-installed version of Git, but it is often an older, customized version maintained by Apple. To get the latest version, you have two primary options:

**Option 1: Homebrew (Recommended)**
If you use the [Homebrew](https://brew.sh/) package manager (which is highly recommended for macOS developers), installing Git is trivial:

```bash
brew install git
```

**Option 2: Xcode Command Line Tools**
If you open your Terminal and simply type `git --version`, macOS will check if the developer tools are installed. If they aren't, it will trigger a prompt asking if you want to install them. Clicking "Install" will download Apple's version of Git.

## Installing on Linux

If you are on Linux, Git is likely available in your distribution's default package manager.

**For Debian / Ubuntu:**

```bash
sudo apt update
sudo apt install git
```

**For Fedora / RHEL / CentOS:**

```bash
sudo dnf install git
```

**For Arch Linux:**

```bash
sudo pacman -S git
```

## Verifying the Installation

Regardless of your operating system, once installation is complete, open your terminal (or Git Bash on Windows) and run:

```bash
git --version
```

If the installation was successful, it will print the installed version, such as:

```text
git version 2.42.0
```

With the binaries installed, the next critical step is configuring your identity before making your first commit.
