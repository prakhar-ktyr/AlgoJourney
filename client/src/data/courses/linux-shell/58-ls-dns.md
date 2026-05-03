---
title: DNS & Hostname Configuration
---

# DNS & Hostname Configuration

DNS (Domain Name System) translates human-readable domain names like `example.com` into IP addresses like `93.184.216.34`. Understanding DNS is essential for troubleshooting network issues and configuring servers.

---

## How DNS Works

When you type a URL in your browser, this happens:

1. **Browser cache** — checks if it already knows the IP
2. **OS cache** — checks `/etc/hosts` and local resolver cache
3. **Recursive resolver** — your ISP's DNS server (or 8.8.8.8, 1.1.1.1)
4. **Root nameserver** — directs to TLD server (.com, .org, etc.)
5. **TLD nameserver** — directs to authoritative server
6. **Authoritative nameserver** — returns the actual IP address

```bash
# Simplified DNS resolution flow:
# You → "What is example.com?"
# Local cache → miss
# /etc/hosts → miss
# Resolver (8.8.8.8) → asks root → asks .com → asks example.com NS
# Answer: 93.184.216.34
```

---

## /etc/hosts — Local Static Resolution

The `/etc/hosts` file maps hostnames to IP addresses locally. It's checked before DNS servers, making it useful for overrides and local development.

### View the hosts file

```bash
cat /etc/hosts
```

### Typical /etc/hosts file

```bash
# Standard entries
127.0.0.1       localhost
127.0.1.1       my-hostname
::1             localhost ip6-localhost

# Custom entries
192.168.1.10    fileserver fileserver.local
192.168.1.20    db-server database
10.0.0.5        api.dev.local
10.0.0.6        frontend.dev.local
```

### Add entries

```bash
# Add a custom hostname mapping
echo "192.168.1.50  myapp.local" | sudo tee -a /etc/hosts

# Block a domain (redirect to nowhere)
echo "0.0.0.0  ads.example.com" | sudo tee -a /etc/hosts

# Edit manually
sudo nano /etc/hosts
```

### Use cases for /etc/hosts

```bash
# Local development — point domains to localhost
127.0.0.1   myapp.local
127.0.0.1   api.myapp.local

# Testing before DNS propagation
203.0.113.50   newserver.example.com

# Block unwanted domains
0.0.0.0   malware-site.com
0.0.0.0   tracking.example.com
```

---

## /etc/resolv.conf — DNS Server Configuration

This file tells your system which DNS servers to use for name resolution.

### View current DNS configuration

```bash
cat /etc/resolv.conf
```

### Typical resolv.conf

```bash
# DNS servers (queried in order)
nameserver 8.8.8.8        # Google DNS
nameserver 8.8.4.4        # Google DNS secondary
nameserver 1.1.1.1        # Cloudflare DNS

# Search domains (appended to short hostnames)
search example.com local
# With this, "ping server1" tries "server1.example.com" first

# Domain (default domain for unqualified names)
domain example.com

# Options
options timeout:2 attempts:3
```

### Modify DNS servers

```bash
# Edit directly (may be overwritten by NetworkManager)
sudo nano /etc/resolv.conf

# On systems with systemd-resolved, use resolvectl instead
resolvectl status
resolvectl dns eth0 8.8.8.8 8.8.4.4

# On NetworkManager systems, configure via nmcli
nmcli con mod "Wired connection 1" ipv4.dns "8.8.8.8 1.1.1.1"
nmcli con up "Wired connection 1"
```

### Prevent resolv.conf from being overwritten

```bash
# Make it immutable (use with caution)
sudo chattr +i /etc/resolv.conf

# Remove immutable flag
sudo chattr -i /etc/resolv.conf

# Better approach: configure your network manager properly
# For systemd-resolved, edit /etc/systemd/resolved.conf
sudo nano /etc/systemd/resolved.conf
# [Resolve]
# DNS=8.8.8.8 1.1.1.1
# FallbackDNS=8.8.4.4
sudo systemctl restart systemd-resolved
```

---

## Hostname Configuration

### View current hostname

```bash
# Display hostname
hostname

# Display FQDN (Fully Qualified Domain Name)
hostname -f

# Display all hostnames
hostname -A

# Display IP addresses
hostname -I
```

### /etc/hostname

```bash
# This file contains the system's hostname
cat /etc/hostname
# Output: my-server

# Change hostname by editing this file
echo "new-hostname" | sudo tee /etc/hostname
```

### hostnamectl — Modern Hostname Management

```bash
# View all hostname information
hostnamectl

# Output:
#    Static hostname: my-server
#          Icon name: computer-vm
#            Chassis: vm
#         Machine ID: abc123...
#            Boot ID: def456...
#   Operating System: Ubuntu 22.04.3 LTS
#             Kernel: Linux 5.15.0-91-generic
#       Architecture: x86-64

# Set static hostname
sudo hostnamectl set-hostname web-server-01

# Set pretty hostname (can include special characters)
sudo hostnamectl set-hostname "Web Server 01" --pretty

# Set transient hostname (lost on reboot)
sudo hostnamectl set-hostname temp-name --transient
```

### Update /etc/hosts after hostname change

```bash
# After changing hostname, update /etc/hosts to match
sudo nano /etc/hosts

# Change:
# 127.0.1.1    old-hostname
# To:
# 127.0.1.1    new-hostname

# Verify the change
hostname
hostname -f
```

---

## nslookup — Query DNS Servers

`nslookup` performs DNS lookups interactively or non-interactively.

### Basic queries

```bash
# Look up a domain's IP address
nslookup example.com

# Output:
# Server:    127.0.0.53
# Address:   127.0.0.53#53
#
# Non-authoritative answer:
# Name:      example.com
# Address:   93.184.216.34

# Look up using a specific DNS server
nslookup example.com 8.8.8.8

# Reverse lookup (IP to hostname)
nslookup 8.8.8.8
```

### Query specific record types

```bash
# MX records (mail servers)
nslookup -type=MX gmail.com

# NS records (name servers)
nslookup -type=NS example.com

# TXT records (SPF, DKIM, verification)
nslookup -type=TXT example.com

# AAAA records (IPv6)
nslookup -type=AAAA example.com

# SOA record (Start of Authority)
nslookup -type=SOA example.com
```

---

## dig — Detailed DNS Queries

`dig` (Domain Information Groper) is the most powerful DNS query tool. It provides detailed information about DNS responses.

### Basic queries

```bash
# Look up a domain
dig example.com

# Get just the answer (short format)
dig +short example.com

# Query a specific DNS server
dig @8.8.8.8 example.com

# Get just the answer section
dig example.com +noall +answer
```

### Query specific record types

```bash
# A record (IPv4 address)
dig example.com A

# AAAA record (IPv6 address)
dig example.com AAAA

# MX records (mail servers)
dig example.com MX

# NS records (name servers)
dig example.com NS

# TXT records
dig example.com TXT

# CNAME records
dig www.example.com CNAME

# ANY — all records (may be limited by some servers)
dig example.com ANY

# PTR record (reverse lookup)
dig -x 8.8.8.8
```

### Trace DNS resolution

```bash
# Trace the full resolution path
dig +trace example.com

# This shows:
# 1. Root servers → .com NS
# 2. .com servers → example.com NS
# 3. example.com NS → final answer
```

### Useful dig options

```bash
# Show only the answer section
dig +noall +answer example.com

# Show statistics (query time, server, etc.)
dig +stats example.com

# Check if DNSSEC is enabled
dig +dnssec example.com

# Get TTL (Time To Live) values
dig +noall +answer +ttlid example.com

# Batch queries from a file
dig -f domains.txt +short
```

### Check specific nameserver

```bash
# Find authoritative nameservers
dig NS example.com +short

# Query the authoritative server directly
dig @ns1.example.com example.com
```

---

## host — Simple DNS Lookup

`host` is a simpler alternative to dig for quick lookups.

```bash
# Basic lookup
host example.com
# Output: example.com has address 93.184.216.34

# Reverse lookup
host 8.8.8.8
# Output: 8.8.8.8.in-addr.arpa domain name pointer dns.google.

# MX records
host -t MX gmail.com

# NS records
host -t NS example.com

# All records
host -a example.com

# Use a specific DNS server
host example.com 1.1.1.1

# Verbose output
host -v example.com
```

---

## DNS Record Types

| Type | Name | Purpose | Example |
|------|------|---------|---------|
| A | Address | Maps domain to IPv4 | `example.com → 93.184.216.34` |
| AAAA | IPv6 Address | Maps domain to IPv6 | `example.com → 2606:2800:...` |
| CNAME | Canonical Name | Alias for another domain | `www.example.com → example.com` |
| MX | Mail Exchange | Mail server for domain | `example.com → mail.example.com` |
| NS | Name Server | Authoritative DNS servers | `example.com → ns1.example.com` |
| TXT | Text | Arbitrary text (SPF, DKIM) | `"v=spf1 include:..."` |
| PTR | Pointer | Reverse lookup (IP → name) | `34.216.184.93 → example.com` |
| SOA | Start of Authority | Zone information | Serial, refresh, retry, expire |
| SRV | Service | Service location | `_sip._tcp.example.com` |
| CAA | Cert Authority Auth | Which CAs can issue certs | `example.com → letsencrypt.org` |

---

## Setting Up a Local DNS Cache

A local DNS cache speeds up repeated lookups and provides DNS when your upstream resolver is slow.

### Using systemd-resolved (Modern Ubuntu)

```bash
# Check if systemd-resolved is running
systemctl status systemd-resolved

# View current DNS configuration
resolvectl status

# View cache statistics
resolvectl statistics

# Flush DNS cache
resolvectl flush-caches

# Set DNS servers
sudo nano /etc/systemd/resolved.conf
# [Resolve]
# DNS=1.1.1.1 8.8.8.8
# FallbackDNS=8.8.4.4 1.0.0.1
# DNSOverTLS=yes

sudo systemctl restart systemd-resolved
```

### Using dnsmasq (Lightweight)

```bash
# Install dnsmasq
sudo apt install dnsmasq

# Configure
sudo nano /etc/dnsmasq.conf

# Key settings:
# listen-address=127.0.0.1
# cache-size=1000
# no-resolv
# server=8.8.8.8
# server=1.1.1.1

# Start
sudo systemctl start dnsmasq
sudo systemctl enable dnsmasq

# Point resolv.conf to local dnsmasq
echo "nameserver 127.0.0.1" | sudo tee /etc/resolv.conf
```

---

## DNS Troubleshooting Script

```bash
#!/bin/bash
# dns-check.sh — Diagnose DNS issues

DOMAIN="${1:-example.com}"

echo "======================================"
echo "  DNS Diagnostics for: $DOMAIN"
echo "======================================"
echo ""

# Check /etc/resolv.conf
echo "--- /etc/resolv.conf ---"
cat /etc/resolv.conf
echo ""

# Check /etc/hosts for the domain
echo "--- /etc/hosts entries ---"
grep -i "$DOMAIN" /etc/hosts 2>/dev/null || echo "No entries found"
echo ""

# Check current DNS server
echo "--- Current DNS Server ---"
if command -v resolvectl &>/dev/null; then
    resolvectl status 2>/dev/null | grep "DNS Servers" | head -3
else
    grep "nameserver" /etc/resolv.conf
fi
echo ""

# Perform DNS lookup
echo "--- DNS Lookup (dig) ---"
if command -v dig &>/dev/null; then
    dig +short "$DOMAIN"
    echo ""
    echo "Full answer:"
    dig "$DOMAIN" +noall +answer +stats
else
    echo "dig not installed, using nslookup..."
    nslookup "$DOMAIN"
fi
echo ""

# Check with different DNS servers
echo "--- Cross-checking with public DNS ---"
echo -n "Google (8.8.8.8):     "
dig +short "$DOMAIN" @8.8.8.8 2>/dev/null || nslookup "$DOMAIN" 8.8.8.8 2>/dev/null | grep "Address" | tail -1

echo -n "Cloudflare (1.1.1.1): "
dig +short "$DOMAIN" @1.1.1.1 2>/dev/null || nslookup "$DOMAIN" 1.1.1.1 2>/dev/null | grep "Address" | tail -1
echo ""

# Check MX records
echo "--- MX Records ---"
if command -v dig &>/dev/null; then
    dig +short MX "$DOMAIN"
else
    nslookup -type=MX "$DOMAIN" 2>/dev/null | grep "mail"
fi
echo ""

# Check NS records
echo "--- Name Servers ---"
if command -v dig &>/dev/null; then
    dig +short NS "$DOMAIN"
else
    nslookup -type=NS "$DOMAIN" 2>/dev/null | grep "nameserver"
fi
echo ""

# Test connectivity to resolved IP
echo "--- Connectivity Test ---"
IP=$(dig +short "$DOMAIN" 2>/dev/null | head -1)
if [ -n "$IP" ] && [[ "$IP" =~ ^[0-9]+\.[0-9]+\.[0-9]+\.[0-9]+$ ]]; then
    echo "Resolved IP: $IP"
    echo -n "Ping test: "
    if ping -c 1 -W 3 "$IP" &>/dev/null; then
        echo "✓ Reachable"
    else
        echo "✗ Not reachable (might block ICMP)"
    fi
    
    echo -n "HTTP test:  "
    if curl -sS --connect-timeout 5 -o /dev/null -w "%{http_code}" "http://$DOMAIN" 2>/dev/null | grep -q "^[23]"; then
        echo "✓ HTTP responding"
    else
        echo "✗ HTTP not responding"
    fi
else
    echo "Could not resolve domain to an IP address"
    echo ""
    echo "Possible issues:"
    echo "  1. Domain doesn't exist"
    echo "  2. DNS server is unreachable"
    echo "  3. DNS server doesn't have the record"
fi

echo ""
echo "--- Resolution Time ---"
if command -v dig &>/dev/null; then
    dig "$DOMAIN" | grep "Query time"
fi

echo ""
echo "======================================"
echo "  Diagnostics complete"
echo "======================================"
```

---

## Common DNS Commands Quick Reference

```bash
# Quick lookups
dig +short example.com          # Get IP
dig +short -x 8.8.8.8          # Reverse lookup
host example.com                # Simple lookup
nslookup example.com            # Interactive style

# Check all record types
dig example.com ANY +noall +answer

# Flush DNS cache
sudo resolvectl flush-caches    # systemd-resolved
sudo systemd-resolve --flush-caches  # older systems
sudo killall -HUP dnsmasq      # dnsmasq

# Change DNS temporarily
echo "nameserver 1.1.1.1" | sudo tee /etc/resolv.conf

# Test DNS response time
time dig example.com +short
```

---

## Summary

| Tool | Purpose |
|------|---------|
| `/etc/hosts` | Local hostname-to-IP mapping |
| `/etc/resolv.conf` | Configure DNS servers |
| `hostnamectl` | Manage system hostname |
| `nslookup` | Simple DNS queries |
| `dig` | Detailed DNS queries and debugging |
| `host` | Quick DNS lookups |
| `resolvectl` | Manage systemd-resolved |

**Key Points:**
- `/etc/hosts` is checked before DNS servers
- Use `dig +trace` to debug resolution failures
- Always have a fallback DNS server configured
- Flush DNS cache after making changes
- Use `dig +short` for scripting
