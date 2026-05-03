---
title: Package Management
---

# Package Management

Installing software on Linux is handled by **package managers** — tools that download, install, update, and remove software automatically, resolving dependencies for you.

---

## What Are Packages?

A **package** is a bundled archive containing:
- The software binaries (compiled programs)
- Configuration files
- Documentation
- Metadata (version, dependencies, description)

### Key Concepts

| Concept | Description |
|---------|-------------|
| **Repository** | A server hosting packages (like an app store) |
| **Dependency** | Another package required for software to work |
| **Package manager** | Tool that handles install/update/remove |
| **Package format** | `.deb` (Debian), `.rpm` (Red Hat), etc. |

---

## Why Use a Package Manager?

Without a package manager:
```bash
# Manual install nightmare
wget https://example.com/software-2.3.tar.gz
tar xzf software-2.3.tar.gz
cd software-2.3
./configure
make
sudo make install
# Now manually track and update it forever...
```

With a package manager:
```bash
# One command!
sudo apt install software
```

Package managers handle:
- Automatic dependency resolution
- Security updates
- Clean removal
- Version tracking

---

## APT — Debian / Ubuntu

APT (Advanced Package Tool) is the package manager for Debian-based systems (Ubuntu, Linux Mint, Pop!_OS, etc.).

### Update Package Lists

Always update before installing:

```bash
# Refresh the list of available packages
sudo apt update
```

This downloads the latest package information from repositories — it does **not** install anything.

---

### Upgrade Installed Packages

```bash
# Upgrade all installed packages
sudo apt upgrade

# Upgrade with auto-handling of dependencies
sudo apt full-upgrade
```

### Combine Update + Upgrade

```bash
sudo apt update && sudo apt upgrade -y
```

The `-y` flag auto-confirms the upgrade.

---

### Install Packages

```bash
# Install a single package
sudo apt install nginx

# Install multiple packages
sudo apt install git curl wget vim

# Install without prompting
sudo apt install -y nodejs

# Install a specific version
sudo apt install nginx=1.18.0-0ubuntu1
```

---

### Remove Packages

```bash
# Remove a package (keep config files)
sudo apt remove nginx

# Remove package AND config files
sudo apt purge nginx

# Remove unused dependencies
sudo apt autoremove

# Remove and clean up
sudo apt purge nginx && sudo apt autoremove -y
```

---

### Search and Information

```bash
# Search for packages by name/description
apt search "web server"

# Show package details
apt show nginx

# List installed packages
apt list --installed

# List upgradable packages
apt list --upgradable

# Check if a package is installed
dpkg -l | grep nginx
```

---

### APT Cache Management

```bash
# Remove downloaded .deb files (free disk space)
sudo apt clean

# Remove only outdated cached packages
sudo apt autoclean
```

---

### Practical APT Workflow

```bash
#!/bin/bash

# Complete system update workflow
echo "=== Updating package lists ==="
sudo apt update

echo ""
echo "=== Upgradable packages ==="
apt list --upgradable

echo ""
echo "=== Upgrading all packages ==="
sudo apt upgrade -y

echo ""
echo "=== Removing unused packages ==="
sudo apt autoremove -y

echo ""
echo "=== Cleaning package cache ==="
sudo apt clean

echo "Done! System is up to date."
```

---

## DNF — Fedora / RHEL / CentOS

DNF (Dandified YUM) is the package manager for Red Hat-based systems.

> **Note:** DNF replaced YUM in Fedora 22+ and RHEL 8+. The commands are very similar.

### Install Packages

```bash
# Install a package
sudo dnf install nginx

# Install without confirmation
sudo dnf install -y git

# Install multiple packages
sudo dnf install vim curl wget
```

---

### Remove Packages

```bash
# Remove a package
sudo dnf remove nginx

# Remove with unused dependencies
sudo dnf autoremove
```

---

### Update Packages

```bash
# Check for updates
dnf check-update

# Update all packages
sudo dnf update

# Update a specific package
sudo dnf update nginx
```

---

### Search and Information

```bash
# Search for packages
dnf search "web server"

# Show package info
dnf info nginx

# List installed packages
dnf list installed

# Find which package provides a file
dnf provides /usr/bin/curl
```

---

### DNF Groups

```bash
# List available groups
dnf group list

# Install a group (e.g., development tools)
sudo dnf group install "Development Tools"

# Remove a group
sudo dnf group remove "Development Tools"
```

---

### DNF History

```bash
# View transaction history
dnf history

# Undo the last transaction
sudo dnf history undo last
```

---

## Pacman — Arch Linux

Pacman is the package manager for Arch-based systems (Arch, Manjaro, EndeavourOS).

### Install Packages

```bash
# Install a package
sudo pacman -S nginx

# Install without confirmation
sudo pacman -S --noconfirm git

# Install multiple packages
sudo pacman -S vim curl wget
```

---

### Remove Packages

```bash
# Remove a package only
sudo pacman -R nginx

# Remove package + unused dependencies
sudo pacman -Rs nginx

# Remove package + deps + config files
sudo pacman -Rns nginx
```

---

### Update System

```bash
# Sync databases and update all packages
sudo pacman -Syu

# Force refresh databases
sudo pacman -Syyu
```

---

### Search and Information

```bash
# Search remote repositories
pacman -Ss "web server"

# Search installed packages
pacman -Qs nginx

# Show package info (remote)
pacman -Si nginx

# Show package info (installed)
pacman -Qi nginx

# List files owned by a package
pacman -Ql nginx

# Find which package owns a file
pacman -Qo /usr/bin/curl
```

---

### Pacman Cache

```bash
# Remove all cached packages except latest
sudo pacman -Sc

# Remove ALL cached packages
sudo pacman -Scc
```

---

## Quick Comparison

| Action | APT (Debian) | DNF (Fedora) | Pacman (Arch) |
|--------|-------------|--------------|---------------|
| Update repos | `apt update` | `dnf check-update` | `pacman -Sy` |
| Upgrade all | `apt upgrade` | `dnf update` | `pacman -Syu` |
| Install | `apt install pkg` | `dnf install pkg` | `pacman -S pkg` |
| Remove | `apt remove pkg` | `dnf remove pkg` | `pacman -R pkg` |
| Search | `apt search term` | `dnf search term` | `pacman -Ss term` |
| Info | `apt show pkg` | `dnf info pkg` | `pacman -Si pkg` |
| Clean | `apt autoremove` | `dnf autoremove` | `pacman -Sc` |

---

## Snap — Universal Packages

Snap packages work across distributions:

```bash
# Install snapd (if not already installed)
sudo apt install snapd

# Search for snaps
snap find "code editor"

# Install a snap
sudo snap install code --classic

# List installed snaps
snap list

# Update all snaps
sudo snap refresh

# Remove a snap
sudo snap remove code

# Show snap info
snap info code
```

### Classic vs Strict Confinement

```bash
# Strict — sandboxed (default)
sudo snap install firefox

# Classic — full system access
sudo snap install code --classic
```

---

## Flatpak — Another Universal Format

```bash
# Install Flatpak
sudo apt install flatpak

# Add Flathub repository
flatpak remote-add --if-not-exists flathub https://flathub.org/repo/flathub.flatpakrepo

# Search for apps
flatpak search firefox

# Install an app
flatpak install flathub org.mozilla.firefox

# Run a Flatpak app
flatpak run org.mozilla.firefox

# List installed Flatpaks
flatpak list

# Update all Flatpaks
flatpak update

# Remove a Flatpak
flatpak uninstall org.mozilla.firefox
```

---

## AppImage — Portable Applications

AppImages are single-file executables — no installation needed:

```bash
# Download an AppImage
wget https://example.com/MyApp.AppImage

# Make it executable
chmod +x MyApp.AppImage

# Run it directly
./MyApp.AppImage

# Or move to a standard location
mv MyApp.AppImage ~/.local/bin/
```

No package manager needed — just download and run!

---

## Compiling from Source

Sometimes software isn't available as a package. Here's the traditional approach:

```bash
# 1. Install build dependencies
sudo apt install build-essential

# 2. Download source code
wget https://example.com/software-2.3.tar.gz
tar xzf software-2.3.tar.gz
cd software-2.3

# 3. Configure (checks dependencies, generates Makefile)
./configure --prefix=/usr/local

# 4. Compile
make

# 5. Install
sudo make install
```

### Using checkinstall (Better than make install)

```bash
# Instead of 'sudo make install', use checkinstall
# It creates a .deb package so you can remove it cleanly later
sudo apt install checkinstall
sudo checkinstall
```

---

## Package Management Workflows

### Workflow 1: Set Up a Development Machine

```bash
#!/bin/bash

# Development environment setup script (Ubuntu/Debian)

echo "=== Setting up development environment ==="

# Update system
sudo apt update && sudo apt upgrade -y

# Essential tools
sudo apt install -y \
  git \
  curl \
  wget \
  vim \
  htop \
  tree \
  jq \
  unzip

# Development tools
sudo apt install -y \
  build-essential \
  python3 \
  python3-pip \
  nodejs \
  npm

# Docker
sudo apt install -y docker.io docker-compose
sudo usermod -aG docker "$USER"

echo "=== Setup complete! ==="
echo "Log out and back in for Docker group to take effect."
```

### Workflow 2: Check Package Status

```bash
#!/bin/bash

# Check if required packages are installed

REQUIRED_PACKAGES=(
  "git"
  "curl"
  "nginx"
  "docker.io"
  "nodejs"
)

echo "Checking required packages..."
echo ""

for pkg in "${REQUIRED_PACKAGES[@]}"; do
  if dpkg -l "$pkg" 2>/dev/null | grep -q "^ii"; then
    VERSION=$(dpkg -l "$pkg" | awk '/^ii/{print $3}')
    echo "  [OK] $pkg ($VERSION)"
  else
    echo "  [MISSING] $pkg"
  fi
done
```

### Workflow 3: System Cleanup

```bash
#!/bin/bash

# Clean up unused packages and cache

echo "=== System Cleanup ==="

echo ""
echo "--- Removing orphaned packages ---"
sudo apt autoremove -y

echo ""
echo "--- Cleaning package cache ---"
BEFORE=$(du -sh /var/cache/apt/archives/ | awk '{print $1}')
sudo apt clean
AFTER=$(du -sh /var/cache/apt/archives/ | awk '{print $1}')
echo "  Cache: $BEFORE -> $AFTER"

echo ""
echo "--- Removing old kernels ---"
sudo apt autoremove --purge -y

echo ""
echo "=== Cleanup complete ==="
```

---

## Adding Repositories

Sometimes you need software from third-party repositories:

### APT — Add a PPA

```bash
# Add a PPA (Personal Package Archive)
sudo add-apt-repository ppa:deadsnakes/ppa
sudo apt update
sudo apt install python3.12
```

### APT — Add a Custom Repository

```bash
# Add repository GPG key
curl -fsSL https://example.com/key.gpg | sudo gpg --dearmor -o /usr/share/keyrings/example.gpg

# Add repository
echo "deb [signed-by=/usr/share/keyrings/example.gpg] https://repo.example.com stable main" | \
  sudo tee /etc/apt/sources.list.d/example.list

sudo apt update
```

### DNF — Add a Repository

```bash
# Add a repo config file
sudo dnf config-manager --add-repo https://example.com/repo.repo

# Enable a disabled repo
sudo dnf config-manager --set-enabled repo-name
```

---

## Summary

| Package Manager | Distro Family | Install | Remove | Update |
|----------------|---------------|---------|--------|--------|
| APT | Debian/Ubuntu | `apt install` | `apt remove` | `apt upgrade` |
| DNF | Fedora/RHEL | `dnf install` | `dnf remove` | `dnf update` |
| Pacman | Arch | `pacman -S` | `pacman -R` | `pacman -Syu` |
| Snap | Universal | `snap install` | `snap remove` | `snap refresh` |
| Flatpak | Universal | `flatpak install` | `flatpak uninstall` | `flatpak update` |

**Next up:** Learn how to manage background services and daemons with **Service Management**!
