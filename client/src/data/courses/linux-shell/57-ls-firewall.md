---
title: Firewall & Security Basics
---

# Firewall & Security Basics

A firewall controls incoming and outgoing network traffic based on security rules. It acts as a barrier between your system and untrusted networks, protecting against unauthorized access and attacks.

---

## Why Firewalls Matter

Without a firewall, every network service on your system is exposed to the internet:

- **Open ports** can be discovered by attackers using port scanners
- **Vulnerable services** can be exploited for unauthorized access
- **DDoS attacks** can overwhelm unprotected services
- **Data exfiltration** can go undetected without outbound filtering

A properly configured firewall:
- Blocks unauthorized inbound connections
- Limits which services are publicly accessible
- Can restrict outbound connections (prevent data leaks)
- Logs suspicious traffic for analysis

---

## ufw — Uncomplicated Firewall (Ubuntu/Debian)

`ufw` is a user-friendly frontend for iptables. It's the recommended firewall tool for Ubuntu and Debian-based systems.

### Enable and Disable

```bash
# Check firewall status
sudo ufw status
sudo ufw status verbose
sudo ufw status numbered    # Show rule numbers

# Enable the firewall
sudo ufw enable

# Disable the firewall
sudo ufw disable

# Reset all rules to defaults
sudo ufw reset
```

### Default Policies

```bash
# Set default policies (recommended starting point)
sudo ufw default deny incoming
sudo ufw default allow outgoing

# Check current defaults
sudo ufw status verbose
```

### Allow and Deny Rules

```bash
# Allow a specific port
sudo ufw allow 22        # SSH
sudo ufw allow 80        # HTTP
sudo ufw allow 443       # HTTPS
sudo ufw allow 3000      # Custom app port

# Allow a port with protocol specified
sudo ufw allow 22/tcp
sudo ufw allow 53/udp

# Allow a port range
sudo ufw allow 6000:6007/tcp

# Deny a specific port
sudo ufw deny 23         # Block Telnet
sudo ufw deny 3306       # Block MySQL from outside
```

### Allow from Specific IP

```bash
# Allow all traffic from a trusted IP
sudo ufw allow from 192.168.1.100

# Allow specific port from specific IP
sudo ufw allow from 192.168.1.100 to any port 22

# Allow from a subnet
sudo ufw allow from 10.0.0.0/24

# Allow from subnet to specific port
sudo ufw allow from 10.0.0.0/24 to any port 3306
```

### Delete Rules

```bash
# Delete by rule specification
sudo ufw delete allow 80

# Delete by rule number (use 'status numbered' first)
sudo ufw status numbered
sudo ufw delete 3

# Delete deny rules
sudo ufw delete deny 23
```

### Application Profiles

```bash
# List available application profiles
sudo ufw app list

# Get info about a profile
sudo ufw app info "Nginx Full"
sudo ufw app info "OpenSSH"

# Allow by application name
sudo ufw allow "Nginx Full"
sudo ufw allow "OpenSSH"
sudo ufw allow "Nginx HTTP"
sudo ufw allow "Nginx HTTPS"

# Deny by application name
sudo ufw deny "Samba"
```

### Rate Limiting

```bash
# Rate limit SSH (deny connections if 6+ attempts in 30 seconds)
sudo ufw limit 22/tcp
sudo ufw limit ssh

# This helps protect against brute-force attacks
```

### Logging

```bash
# Enable logging
sudo ufw logging on

# Set logging level (low, medium, high, full)
sudo ufw logging medium

# Logs are written to /var/log/ufw.log
sudo tail -f /var/log/ufw.log
```

### Common ufw Configuration

```bash
# Typical web server setup
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow ssh
sudo ufw allow http
sudo ufw allow https
sudo ufw enable

# Typical database server (only accessible from app server)
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow from 10.0.1.5 to any port 5432   # PostgreSQL from app server
sudo ufw allow ssh
sudo ufw enable
```

---

## iptables — The Classic Firewall

`iptables` is the traditional Linux firewall tool. It's more powerful but more complex than ufw.

### Chains

iptables uses three main chains:
- **INPUT** — rules for incoming traffic
- **OUTPUT** — rules for outgoing traffic
- **FORWARD** — rules for traffic passing through (routing)

### View Current Rules

```bash
# List all rules
sudo iptables -L

# List with line numbers and verbose output
sudo iptables -L -n -v --line-numbers

# List a specific chain
sudo iptables -L INPUT -n -v
```

### Basic Rules

```bash
# Allow established connections (important — add first!)
sudo iptables -A INPUT -m state --state ESTABLISHED,RELATED -j ACCEPT

# Allow loopback interface
sudo iptables -A INPUT -i lo -j ACCEPT

# Allow SSH (port 22)
sudo iptables -A INPUT -p tcp --dport 22 -j ACCEPT

# Allow HTTP and HTTPS
sudo iptables -A INPUT -p tcp --dport 80 -j ACCEPT
sudo iptables -A INPUT -p tcp --dport 443 -j ACCEPT

# Allow ping
sudo iptables -A INPUT -p icmp --icmp-type echo-request -j ACCEPT

# Drop all other incoming traffic (set as last rule)
sudo iptables -A INPUT -j DROP
```

### Delete and Insert Rules

```bash
# Delete a rule by number
sudo iptables -D INPUT 3

# Insert a rule at position 1
sudo iptables -I INPUT 1 -p tcp --dport 8080 -j ACCEPT

# Flush all rules (WARNING: removes everything!)
sudo iptables -F
```

### Save and Restore Rules

```bash
# Save current rules
sudo iptables-save > /etc/iptables/rules.v4

# Restore saved rules
sudo iptables-restore < /etc/iptables/rules.v4

# On Ubuntu, install iptables-persistent to auto-load on boot
sudo apt install iptables-persistent
sudo netfilter-persistent save
```

### Block a Specific IP

```bash
# Block all traffic from an IP
sudo iptables -A INPUT -s 203.0.113.100 -j DROP

# Block a subnet
sudo iptables -A INPUT -s 203.0.113.0/24 -j DROP

# Block an IP from a specific port
sudo iptables -A INPUT -s 203.0.113.100 -p tcp --dport 22 -j DROP
```

---

## firewalld (RHEL/CentOS/Fedora)

`firewalld` is the default firewall on Red Hat-based systems. It uses zones to group network interfaces and manage rules.

### Basic Commands

```bash
# Check status
sudo firewall-cmd --state
sudo systemctl status firewalld

# Start/stop/enable
sudo systemctl start firewalld
sudo systemctl enable firewalld

# List all zones
sudo firewall-cmd --get-zones

# Get active zone
sudo firewall-cmd --get-active-zones

# List rules in default zone
sudo firewall-cmd --list-all
```

### Add and Remove Rules

```bash
# Allow a service (permanent)
sudo firewall-cmd --permanent --add-service=http
sudo firewall-cmd --permanent --add-service=https
sudo firewall-cmd --permanent --add-service=ssh

# Allow a port
sudo firewall-cmd --permanent --add-port=3000/tcp

# Remove a rule
sudo firewall-cmd --permanent --remove-service=ftp

# Reload to apply permanent changes
sudo firewall-cmd --reload
```

---

## Security Hardening Basics

### Keep Your System Updated

```bash
# Ubuntu/Debian
sudo apt update && sudo apt upgrade -y

# Enable automatic security updates
sudo apt install unattended-upgrades
sudo dpkg-reconfigure unattended-upgrades

# RHEL/CentOS
sudo yum update -y
# or
sudo dnf upgrade -y
```

### Disable Unused Services

```bash
# List all running services
systemctl list-units --type=service --state=running

# Stop and disable unnecessary services
sudo systemctl stop cups
sudo systemctl disable cups

sudo systemctl stop avahi-daemon
sudo systemctl disable avahi-daemon

# Check which ports are listening
sudo ss -tlnp
```

### SSH Security

```bash
# Edit SSH configuration
sudo nano /etc/ssh/sshd_config

# Recommended settings:
# PermitRootLogin no              — Disable root login
# PasswordAuthentication no       — Use keys only
# MaxAuthTries 3                  — Limit login attempts
# Port 2222                       — Change default port (optional)
# AllowUsers deployer admin       — Whitelist users
# Protocol 2                      — Use SSH protocol 2 only

# Restart SSH after changes
sudo systemctl restart sshd
```

### Set Up SSH Key Authentication

```bash
# Generate SSH key pair (on your local machine)
ssh-keygen -t ed25519 -C "your@email.com"

# Copy public key to server
ssh-copy-id user@server

# Now disable password authentication in sshd_config
# PasswordAuthentication no
```

### Monitor Logs

```bash
# Check authentication logs
sudo tail -f /var/log/auth.log         # Ubuntu/Debian
sudo tail -f /var/log/secure           # RHEL/CentOS

# Check system logs
sudo journalctl -f

# Check for failed login attempts
sudo grep "Failed password" /var/log/auth.log | tail -20

# Check who is logged in
who
w
last | head -20
```

### File Permissions Security

```bash
# Ensure sensitive files have correct permissions
sudo chmod 600 /etc/shadow
sudo chmod 644 /etc/passwd
sudo chmod 700 /root
sudo chmod 600 ~/.ssh/id_ed25519
sudo chmod 644 ~/.ssh/id_ed25519.pub
sudo chmod 700 ~/.ssh

# Find world-writable files (potential security risk)
find / -type f -perm -o+w 2>/dev/null

# Find SUID files (potential privilege escalation)
find / -type f -perm -4000 2>/dev/null
```

---

## fail2ban — Intrusion Prevention

`fail2ban` monitors log files and automatically bans IPs that show malicious behavior (like repeated failed login attempts).

### Install and Configure

```bash
# Install
sudo apt install fail2ban    # Ubuntu/Debian
sudo yum install fail2ban    # RHEL/CentOS

# Start and enable
sudo systemctl start fail2ban
sudo systemctl enable fail2ban
```

### Basic Configuration

```bash
# Create local config (don't edit the main config)
sudo cp /etc/fail2ban/jail.conf /etc/fail2ban/jail.local
sudo nano /etc/fail2ban/jail.local
```

Key settings in `jail.local`:

```bash
[DEFAULT]
bantime  = 3600        # Ban for 1 hour (seconds)
findtime = 600         # Look at last 10 minutes
maxretry = 5           # Ban after 5 failures
ignoreip = 127.0.0.1/8 ::1 192.168.1.0/24  # Never ban these

[sshd]
enabled = true
port    = ssh
filter  = sshd
logpath = /var/log/auth.log
maxretry = 3           # Stricter for SSH
```

### Manage fail2ban

```bash
# Check status
sudo fail2ban-client status
sudo fail2ban-client status sshd

# Manually ban an IP
sudo fail2ban-client set sshd banip 203.0.113.100

# Unban an IP
sudo fail2ban-client set sshd unbanip 203.0.113.100

# Check banned IPs
sudo fail2ban-client get sshd banned
```

---

## Firewall Setup Script

```bash
#!/bin/bash
# firewall-setup.sh — Configure ufw firewall for a web server

set -euo pipefail

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

log_info()  { echo -e "${GREEN}[INFO]${NC} $1"; }
log_warn()  { echo -e "${YELLOW}[WARN]${NC} $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1"; }

# Check if running as root
if [ "$EUID" -ne 0 ]; then
    log_error "This script must be run as root (use sudo)"
    exit 1
fi

echo "======================================"
echo "  Firewall Configuration Script"
echo "======================================"
echo ""

# Reset firewall
log_info "Resetting firewall rules..."
ufw --force reset

# Set default policies
log_info "Setting default policies..."
ufw default deny incoming
ufw default allow outgoing

# Allow SSH (critical — do this first!)
log_info "Allowing SSH (port 22)..."
ufw allow ssh

# Rate limit SSH to prevent brute force
log_info "Enabling SSH rate limiting..."
ufw limit ssh

# Allow HTTP and HTTPS
log_info "Allowing HTTP (port 80)..."
ufw allow http

log_info "Allowing HTTPS (port 443)..."
ufw allow https

# Allow from specific trusted networks (customize these)
TRUSTED_NETWORK="10.0.0.0/24"
log_info "Allowing traffic from trusted network: $TRUSTED_NETWORK"
ufw allow from "$TRUSTED_NETWORK"

# Enable logging
log_info "Enabling logging (medium level)..."
ufw logging medium

# Enable firewall
log_info "Enabling firewall..."
ufw --force enable

# Show final status
echo ""
echo "======================================"
echo "  Firewall Status"
echo "======================================"
ufw status verbose

echo ""
log_info "Firewall configured successfully!"
log_warn "Make sure you can still SSH in before closing this session!"
```

---

## Summary

| Tool | Platform | Complexity | Best For |
|------|----------|-----------|----------|
| `ufw` | Ubuntu/Debian | Easy | Most users, quick setup |
| `iptables` | All Linux | Advanced | Fine-grained control |
| `firewalld` | RHEL/CentOS | Medium | Zone-based management |
| `fail2ban` | All Linux | Easy | Automated intrusion prevention |

**Security Checklist:**
- Enable a firewall and deny incoming by default
- Keep your system updated (enable auto-updates)
- Use SSH keys, disable password auth and root login
- Disable unused services and close unnecessary ports
- Monitor logs regularly
- Use fail2ban to block brute-force attacks
- Apply principle of least privilege everywhere
