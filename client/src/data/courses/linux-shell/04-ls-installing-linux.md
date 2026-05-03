---
title: Installing Linux
---

# Installing Linux

Ready to get Linux on your machine? In this lesson, we'll cover **multiple ways to get a Linux environment**, from the easiest (takes 5 minutes) to the most involved (dual boot). Pick the option that works best for your situation.

---

## Overview of Options

```bash
# Choose the best option for your setup
echo "Option 1: WSL (Windows users)      — Easiest, 5 minutes"
echo "Option 2: Virtual Machine           — Safe, isolated"
echo "Option 3: Dual Boot                 — Full performance"
echo "Option 4: Live USB                  — Try without installing"
echo "Option 5: Cloud VM                  — Nothing to install locally"
echo "Option 6: macOS Terminal            — Already Unix-based!"
```

| Option | OS | Difficulty | Performance | Risk |
|--------|-----|-----------|------------|------|
| WSL | Windows 10/11 | Very Easy | Good | None |
| Virtual Machine | Any | Easy | Moderate | None |
| Dual Boot | Windows | Medium | Full | Low |
| Live USB | Any | Easy | Full | None |
| Cloud VM | Any | Easy | Depends | None |
| macOS Terminal | macOS | None | Full | None |

---

## Option 1: Windows Subsystem for Linux (WSL)

**Recommended for Windows users.** WSL lets you run a full Linux environment directly inside Windows — no virtual machine, no dual boot, no hassle.

### Requirements

```bash
# WSL Requirements
echo "Windows 10 version 2004+ (Build 19041+) or Windows 11"
echo "64-bit processor"
echo "At least 4 GB RAM (8 GB recommended)"
echo "Virtualization enabled in BIOS (usually on by default)"
```

### Step 1: Open PowerShell as Administrator

```bash
# Right-click Start menu → "Terminal (Admin)" or "PowerShell (Admin)"
# Or press Windows key, type "PowerShell", right-click → Run as administrator
echo "Make sure you see 'Administrator' in the title bar"
```

### Step 2: Install WSL

```bash
# This single command installs WSL + Ubuntu (default distro)
wsl --install
```

That's it! One command installs everything:
- WSL 2 (the latest version)
- Ubuntu (the default distribution)
- Linux kernel
- All necessary components

### Step 3: Restart Your Computer

```bash
# After running wsl --install, restart when prompted
echo "Restart your computer to complete installation"
```

### Step 4: Set Up Ubuntu

```bash
# After restart, Ubuntu will open automatically (or search "Ubuntu" in Start)
# It will ask you to create a username and password

# Enter a username (lowercase, no spaces)
echo "Enter new UNIX username: yourname"

# Enter a password (won't show characters as you type — this is normal!)
echo "New password: ********"
echo "Retype new password: ********"
```

### Step 5: Verify Installation

```bash
# You're now in a Linux terminal! Try these commands:
whoami
# Output: yourname

uname -a
# Output: Linux DESKTOP-XXXXX 5.15.x-microsoft-standard-WSL2 ... GNU/Linux

cat /etc/os-release
# Output: Shows Ubuntu version info

lsb_release -a
# Output: Ubuntu 24.04 LTS

# Update your system (do this first!)
sudo apt update && sudo apt upgrade -y
```

### Step 6: Access Files Between Windows and WSL

```bash
# Access Windows files from Linux
ls /mnt/c/Users/YourName/Desktop/
# This is your Windows C: drive!

# Access Linux files from Windows
# In Windows Explorer, type: \\wsl$
# Or in terminal:
explorer.exe .
# Opens current Linux directory in Windows Explorer
```

### WSL Tips

```bash
# List available distros to install
wsl --list --online

# Install a different distro
wsl --install -d Debian
wsl --install -d Fedora

# List installed distros
wsl --list --verbose

# Set default distro
wsl --set-default Ubuntu

# Shut down WSL
wsl --shutdown

# Open Ubuntu from anywhere
wsl
# Or just type "ubuntu" in Start menu
```

---

## Option 2: Virtual Machine (VirtualBox/VMware)

A virtual machine runs Linux **inside a window** on your current OS. It's completely isolated — you can't break anything on your main system.

### Step 1: Download VirtualBox

```bash
# VirtualBox is free and works on Windows, macOS, and Linux
echo "Download from: https://www.virtualbox.org/wiki/Downloads"
echo "Choose the installer for your operating system"
echo "Install with default settings"
```

### Step 2: Download Ubuntu ISO

```bash
# Download the Ubuntu Desktop ISO image
echo "Download from: https://ubuntu.com/download/desktop"
echo "Choose the latest LTS version (e.g., Ubuntu 24.04 LTS)"
echo "File size: approximately 5–6 GB"
echo "File type: .iso (disk image)"
```

### Step 3: Create a New Virtual Machine

```bash
# In VirtualBox, click "New" and configure:
echo "Name: Ubuntu"
echo "Type: Linux"
echo "Version: Ubuntu (64-bit)"
echo ""
echo "Memory: 4096 MB (4 GB) minimum, 8192 MB (8 GB) recommended"
echo "Processors: 2 or more"
echo "Hard disk: Create a virtual hard disk now"
echo "Size: 25 GB minimum, 50 GB recommended"
echo "Type: VDI (VirtualBox Disk Image)"
echo "Storage: Dynamically allocated"
```

### Step 4: Mount the ISO and Install

```bash
# Before starting the VM:
echo "1. Select your VM → Settings → Storage"
echo "2. Click the empty disk icon under 'Controller: IDE'"
echo "3. Click the disk icon on the right → 'Choose a disk file'"
echo "4. Select the Ubuntu .iso file you downloaded"
echo "5. Click OK"
echo ""
echo "Now click 'Start' to boot the VM"
echo "Follow Ubuntu's graphical installer:"
echo "  - Choose language"
echo "  - Click 'Install Ubuntu'"
echo "  - Choose keyboard layout"
echo "  - Select 'Normal installation'"
echo "  - Select 'Erase disk and install Ubuntu' (safe — it's virtual!)"
echo "  - Set timezone, create user account"
echo "  - Wait for installation to complete"
echo "  - Restart when prompted"
```

### Step 5: Install Guest Additions (Recommended)

```bash
# After Ubuntu is installed and running in VirtualBox:
# Install VirtualBox Guest Additions for better performance

# In Ubuntu terminal:
sudo apt update
sudo apt install -y build-essential dkms linux-headers-$(uname -r)

# Then in VirtualBox menu: Devices → Insert Guest Additions CD image
# In Ubuntu, open the CD and run:
sudo ./VBoxLinuxAdditions.run

# Restart the VM
sudo reboot

# Now you have:
echo "✓ Better screen resolution"
echo "✓ Shared clipboard (copy/paste between host and VM)"
echo "✓ Shared folders"
echo "✓ Better mouse integration"
echo "✓ Improved graphics performance"
```

### VirtualBox Tips

```bash
# Useful VirtualBox settings
echo "Enable bidirectional clipboard: Settings → General → Advanced"
echo "Shared folders: Settings → Shared Folders → Add"
echo "Snapshots: Take before risky changes (Machine → Take Snapshot)"
echo "Full screen: Right Ctrl + F (or Host key + F)"
```

---

## Option 3: Dual Boot

Dual booting installs Linux alongside Windows on the same computer. You choose which OS to boot at startup.

> **Warning:** While generally safe, dual booting modifies your disk partitions. Back up important data first. Not recommended for absolute beginners.

### Brief Overview

```bash
# Dual boot steps (advanced)
echo "1. Back up all important data"
echo "2. Download Ubuntu ISO"
echo "3. Create bootable USB (using Rufus on Windows or balenaEtcher)"
echo "4. Shrink Windows partition (Disk Management → Shrink Volume)"
echo "   - Free up at least 50 GB for Linux"
echo "5. Boot from USB (change boot order in BIOS/UEFI)"
echo "6. Install Ubuntu alongside Windows"
echo "   - Ubuntu installer will detect Windows automatically"
echo "   - Choose 'Install alongside Windows'"
echo "7. GRUB bootloader will let you choose OS at startup"
```

### Creating a Bootable USB

```bash
# Using balenaEtcher (works on Windows, macOS, Linux)
echo "1. Download balenaEtcher: https://etcher.balena.io/"
echo "2. Insert USB drive (8 GB minimum)"
echo "3. Open Etcher"
echo "4. Select the Ubuntu .iso file"
echo "5. Select your USB drive"
echo "6. Click 'Flash!'"
echo "7. Wait for completion"
echo ""
echo "WARNING: This will erase everything on the USB drive!"
```

---

## Option 4: Live USB (Try Without Installing)

A Live USB lets you **boot directly into Linux without installing anything**. Your hard drive is untouched — everything runs from the USB.

```bash
# Steps for Live USB
echo "1. Download Ubuntu ISO"
echo "2. Create bootable USB with balenaEtcher (same as dual boot)"
echo "3. Restart computer"
echo "4. Boot from USB (usually F12, F2, or Del during startup)"
echo "5. Choose 'Try Ubuntu without installing'"
echo "6. Explore Linux! (changes won't be saved after reboot)"
```

### Pros and Cons

```bash
echo "Pros:"
echo "  + Zero risk — nothing is installed"
echo "  + Test hardware compatibility"
echo "  + Try different distros easily"
echo "  + Useful for data recovery"
echo ""
echo "Cons:"
echo "  - Slower than installed OS (USB speed limit)"
echo "  - Changes are lost on reboot"
echo "  - Limited RAM (shared with OS)"
```

---

## Option 5: Cloud VM

If you don't want to install anything locally, you can rent a Linux server in the cloud. Most providers offer free tiers.

### AWS Free Tier

```bash
# Amazon Web Services — 12 months free
echo "1. Sign up at https://aws.amazon.com/free/"
echo "2. Launch EC2 instance"
echo "   - Choose: Ubuntu Server 24.04 LTS"
echo "   - Instance type: t2.micro (free tier)"
echo "   - Storage: 30 GB (free tier max)"
echo "3. Create key pair (for SSH access)"
echo "4. Connect via SSH:"
ssh -i your-key.pem ubuntu@your-instance-ip
```

### DigitalOcean

```bash
# DigitalOcean — Simple cloud VMs (Droplets)
echo "1. Sign up at https://www.digitalocean.com"
echo "2. Create Droplet"
echo "   - Choose: Ubuntu 24.04"
echo "   - Plan: Basic ($4–6/month)"
echo "   - Region: Closest to you"
echo "3. Connect via SSH:"
ssh root@your-droplet-ip
```

### Google Cloud Shell (Free!)

```bash
# Google Cloud Shell — Free Linux terminal in your browser
echo "1. Go to https://shell.cloud.google.com"
echo "2. Sign in with Google account"
echo "3. You get a free Linux terminal instantly!"
echo "   - 5 GB persistent storage"
echo "   - Pre-installed tools (git, docker, python, node)"
echo "   - Completely free, no credit card needed"
```

### Other Free Options

```bash
echo "GitHub Codespaces  — Free hours each month"
echo "Replit            — Free online Linux terminal"
echo "JSLinux           — Linux in the browser (bellard.org/jslinux)"
echo "CoCalc            — Free online Linux environment"
```

---

## Option 6: macOS (Already Unix-Based!)

If you're on macOS, great news — **macOS is already Unix-based!** Most Linux commands work in the macOS Terminal.

```bash
# macOS uses a Unix-certified operating system (Darwin)
# The Terminal app gives you a bash/zsh shell

# Open Terminal:
echo "Applications → Utilities → Terminal"
echo "Or: Spotlight (Cmd+Space) → type 'Terminal'"

# Check your shell
echo $SHELL
# Output: /bin/zsh (default on modern macOS)

# Most Linux commands work identically
ls -la
pwd
whoami
cat /etc/shells
```

### Differences from Linux

```bash
# macOS uses slightly different tools
echo "Package manager: Homebrew (brew) — not apt/dnf"
echo "Default shell: zsh (same as many Linux distros now)"
echo "Some GNU tools differ from macOS BSD tools"
echo ""
# Install Homebrew (macOS package manager)
echo "Install: /bin/bash -c \"\$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)\""
echo ""
# Install GNU coreutils for full Linux compatibility
echo "brew install coreutils"
echo "brew install gnu-sed"
echo "brew install grep"
```

### Install Linux Tools on macOS

```bash
# Use Homebrew to install common Linux tools
brew install wget        # Download files
brew install tree        # Directory tree view
brew install htop        # Process viewer
brew install tmux        # Terminal multiplexer
brew install neovim      # Text editor
brew install bat         # Better 'cat'
brew install fd          # Better 'find'
brew install ripgrep     # Better 'grep'
```

---

## Verifying Your Installation

No matter which option you chose, verify everything works:

```bash
# Basic verification commands

# 1. Check the OS
uname -a
# Shows: kernel name, hostname, kernel version, architecture

# 2. Check the distribution
cat /etc/os-release
# Shows: distro name, version, ID

# 3. Check your user
whoami
# Shows: your username

# 4. Check your shell
echo $SHELL
# Shows: /bin/bash or /bin/zsh

# 5. Check your home directory
echo $HOME
# Shows: /home/yourname (or /Users/yourname on macOS)

# 6. Check available disk space
df -h /
# Shows: filesystem, size, used, available

# 7. Check memory
free -h
# Shows: total, used, free, available RAM (Linux only)

# 8. Check internet connectivity
ping -c 3 google.com
# Should show successful pings
```

### Update Your System (First Thing to Do!)

```bash
# Ubuntu/Debian
sudo apt update && sudo apt upgrade -y

# Fedora
sudo dnf upgrade -y

# Arch
sudo pacman -Syu
```

### Install Essential Tools

```bash
# On Ubuntu/Debian, install useful tools
sudo apt install -y \
  curl \
  wget \
  git \
  vim \
  htop \
  tree \
  unzip \
  build-essential

# Verify installations
git --version
curl --version
vim --version | head -1
```

---

## Troubleshooting Common Issues

### WSL Won't Install

```bash
# Error: "WSL 2 requires an update to its kernel component"
# Solution: Download WSL2 kernel update from Microsoft
echo "https://aka.ms/wsl2kernel"

# Error: "Virtual Machine Platform not enabled"
# Solution: Enable in Windows Features
echo "Control Panel → Programs → Turn Windows features on/off"
echo "Check: Virtual Machine Platform"
echo "Check: Windows Subsystem for Linux"

# Error: Virtualization not enabled
echo "Restart → Enter BIOS (Del, F2, or F10 during boot)"
echo "Find: Intel VT-x or AMD-V setting"
echo "Enable it → Save and restart"
```

### VirtualBox Issues

```bash
# VM won't start — "VT-x is not available"
echo "Solution: Enable virtualization in BIOS (same as above)"

# VM is very slow
echo "Solution 1: Allocate more RAM (at least 4 GB)"
echo "Solution 2: Allocate more CPU cores (at least 2)"
echo "Solution 3: Install Guest Additions"
echo "Solution 4: Use SSD storage for VM files"

# Screen resolution is wrong
echo "Solution: Install VirtualBox Guest Additions"
```

### General Tips

```bash
# If a command says "Permission denied"
sudo your-command-here    # Run as administrator

# If a package is not found
sudo apt update           # Refresh package list first

# If terminal seems frozen
# Press Ctrl+C             # Cancel current command
# Press Ctrl+Q             # Resume output (if Ctrl+S was pressed)
# Press Enter              # Sometimes just needs a newline

# If you're completely lost
pwd                       # Print where you are
cd ~                      # Go home
```

---

## Summary

```bash
echo "=== Key Takeaways ==="
echo ""
echo "1. WSL is the easiest option for Windows users"
echo "2. VirtualBox is safe and isolated (any OS)"
echo "3. Dual boot gives full performance but has some risk"
echo "4. Live USB lets you try without installing"
echo "5. Cloud VMs require nothing locally"
echo "6. macOS already has a Unix terminal"
echo "7. Always update your system after installing"
echo "8. Install essential tools: git, curl, vim, htop"
```

---

## What's Next?

Now that you have a Linux environment, it's time to learn about the **terminal and shell** — your primary interface to Linux.

```bash
# Ready to continue? Open your terminal and type:
echo "I have Linux installed and I'm ready to learn!"
```

---

*Next lesson: The Terminal & Shell →*
