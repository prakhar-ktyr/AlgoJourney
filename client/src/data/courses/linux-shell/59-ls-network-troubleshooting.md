---
title: Network Troubleshooting
---

# Network Troubleshooting

When network problems arise, a systematic approach saves time. This lesson covers the tools and techniques used by Linux administrators to diagnose and fix connectivity issues.

---

## Systematic Approach: The Network Layers

Work from bottom to top through the network stack:

1. **Physical** — Is the cable plugged in? Is WiFi connected?
2. **Link** — Does the interface have an IP? Is ARP working?
3. **Network** — Can you reach the gateway? Can you ping the destination?
4. **Transport** — Is the port open? Is the service listening?
5. **Application** — Does the service respond correctly?

```bash
# Quick systematic check (run in order):
ip link show                    # 1. Interface up?
ip addr show                    # 2. IP assigned?
ip route show                   # 3. Default route?
ping -c 3 gateway_ip            # 3. Gateway reachable?
ping -c 3 8.8.8.8              # 3. Internet reachable?
ping -c 3 google.com           # 4. DNS working?
curl -I http://target:port     # 5. Service responding?
```

---

## ping — Is the Host Reachable?

`ping` sends ICMP echo requests to test basic connectivity.

### Basic usage

```bash
# Ping a host (runs until you press Ctrl+C)
ping google.com

# Ping with a count limit
ping -c 5 google.com

# Ping with a timeout (seconds)
ping -W 3 -c 3 192.168.1.1

# Ping with interval (seconds between pings)
ping -i 0.5 -c 10 google.com

# Ping with specific packet size
ping -s 1400 -c 3 google.com
```

### Interpreting ping output

```bash
# Successful ping:
# PING google.com (142.250.80.46): 56 data bytes
# 64 bytes from 142.250.80.46: icmp_seq=0 ttl=117 time=12.3 ms
# 64 bytes from 142.250.80.46: icmp_seq=1 ttl=117 time=11.8 ms
#
# --- google.com ping statistics ---
# 2 packets transmitted, 2 received, 0% packet loss, time 1001ms
# rtt min/avg/max/mdev = 11.8/12.0/12.3/0.25 ms

# What to look for:
# - Packet loss > 0% → network issue
# - High latency (time) → congestion or distance
# - "Destination Host Unreachable" → routing problem
# - "Request timeout" → host down or firewall blocking ICMP
```

### Diagnostic ping tests

```bash
# Test localhost (is networking working at all?)
ping -c 1 127.0.0.1

# Test your gateway (is local network working?)
ping -c 3 $(ip route | grep default | awk '{print $3}')

# Test external IP (is internet working?)
ping -c 3 8.8.8.8

# Test domain (is DNS working?)
ping -c 3 google.com

# If 8.8.8.8 works but google.com doesn't → DNS problem!
```

---

## traceroute — Where Does the Path Break?

`traceroute` shows every hop (router) between you and the destination, helping identify where connectivity fails.

### Basic usage

```bash
# Trace route to a host
traceroute google.com

# Use ICMP instead of UDP (works through more firewalls)
traceroute -I google.com

# Use TCP (most likely to work through firewalls)
traceroute -T -p 443 google.com

# Set maximum hops
traceroute -m 20 google.com

# Faster (don't resolve hostnames)
traceroute -n google.com
```

### Interpreting traceroute output

```bash
# traceroute to google.com (142.250.80.46), 30 hops max
#  1  192.168.1.1 (192.168.1.1)  1.234 ms  1.123 ms  1.089 ms
#  2  10.0.0.1 (10.0.0.1)  5.432 ms  5.321 ms  5.234 ms
#  3  isp-router.example.com (203.0.113.1)  12.345 ms  12.234 ms  12.123 ms
#  4  * * *                    ← This hop doesn't respond (may be filtered)
#  5  142.250.80.46  15.678 ms  15.567 ms  15.456 ms

# * * * means the router doesn't send ICMP replies (not necessarily a problem)
# If all hops after a certain point are * * *, that's where the break is
```

---

## ss / netstat — Is the Service Listening?

`ss` (Socket Statistics) shows network connections and listening ports. It's the modern replacement for `netstat`.

### Check listening ports

```bash
# Show all listening TCP ports
ss -tlnp

# Show all listening UDP ports
ss -ulnp

# Show all listening ports (TCP + UDP)
ss -tulnp

# Filter by port number
ss -tlnp | grep :80
ss -tlnp | grep :443
ss -tlnp | grep :3000
```

### Check established connections

```bash
# Show all established connections
ss -tnp

# Show connections to a specific port
ss -tnp | grep :22

# Count connections by state
ss -s

# Show all sockets (including UNIX)
ss -a
```

### Legacy: netstat

```bash
# netstat is deprecated but still common
# Show listening ports
netstat -tlnp

# Show all connections
netstat -anp

# Show routing table
netstat -r
```

### Common ss filters

```bash
# Filter by state
ss state established
ss state listening
ss state time-wait

# Filter by port
ss -tn dport = :443
ss -tn sport = :80

# Filter by IP
ss -tn dst 192.168.1.100
ss -tn src 10.0.0.5
```

---

## curl / wget — Does the Application Respond?

Once you know the port is open, test if the application layer works.

### Test HTTP services

```bash
# Check if a web server responds
curl -I http://example.com
curl -I https://example.com

# Check specific response code
curl -s -o /dev/null -w "%{http_code}" http://example.com

# Test with timeout
curl --connect-timeout 5 --max-time 10 http://example.com

# Test a specific port
curl http://localhost:3000/health
curl http://localhost:8080/api/status

# Verbose output for debugging
curl -v https://example.com 2>&1 | head -30
```

### Test non-HTTP services

```bash
# Test if a TCP port is open (using curl)
curl -v telnet://host:port

# Test using netcat (nc)
nc -zv host port
nc -zv 192.168.1.100 22
nc -zv 192.168.1.100 80

# Test with timeout
nc -zv -w 3 host port
```

---

## tcpdump — Packet Capture

`tcpdump` captures raw network packets. It's invaluable for deep troubleshooting when higher-level tools aren't enough.

### Basic captures

```bash
# Capture all traffic on an interface
sudo tcpdump -i eth0

# Capture with readable output
sudo tcpdump -i eth0 -nn

# Limit to N packets
sudo tcpdump -i eth0 -c 100

# Save capture to file (for Wireshark analysis)
sudo tcpdump -i eth0 -w capture.pcap

# Read a capture file
sudo tcpdump -r capture.pcap
```

### Filter by protocol and port

```bash
# Capture only HTTP traffic
sudo tcpdump -i eth0 port 80

# Capture only HTTPS traffic
sudo tcpdump -i eth0 port 443

# Capture only DNS traffic
sudo tcpdump -i eth0 port 53

# Capture only SSH traffic
sudo tcpdump -i eth0 port 22

# Capture a specific protocol
sudo tcpdump -i eth0 icmp
sudo tcpdump -i eth0 tcp
sudo tcpdump -i eth0 udp
```

### Filter by host

```bash
# Capture traffic to/from a specific host
sudo tcpdump -i eth0 host 192.168.1.100

# Capture only traffic FROM a host
sudo tcpdump -i eth0 src host 192.168.1.100

# Capture only traffic TO a host
sudo tcpdump -i eth0 dst host 192.168.1.100

# Combine filters
sudo tcpdump -i eth0 host 192.168.1.100 and port 80
sudo tcpdump -i eth0 'host 10.0.0.5 and (port 80 or port 443)'
```

### Show packet contents

```bash
# Show packet contents in ASCII
sudo tcpdump -i eth0 -A port 80 -c 10

# Show in hex and ASCII
sudo tcpdump -i eth0 -X port 80 -c 10
```

---

## nmap — Port Scanning

`nmap` discovers open ports and services on a host. Use it to verify what's actually accessible from the network.

### Basic scans

```bash
# Scan common ports on a host
nmap 192.168.1.100

# Scan specific ports
nmap -p 22,80,443 192.168.1.100

# Scan a range of ports
nmap -p 1-1000 192.168.1.100

# Scan all 65535 ports
nmap -p- 192.168.1.100

# Fast scan (top 100 ports)
nmap -F 192.168.1.100
```

### Service detection

```bash
# Detect service versions
nmap -sV 192.168.1.100

# Detect OS
nmap -O 192.168.1.100

# Aggressive scan (OS + version + scripts + traceroute)
nmap -A 192.168.1.100
```

### Scan a subnet

```bash
# Discover live hosts on the network
nmap -sn 192.168.1.0/24

# Scan multiple hosts
nmap 192.168.1.1-50

# Scan from a file
nmap -iL targets.txt
```

> **Note:** Only scan systems you own or have permission to scan. Unauthorized port scanning may be illegal.

---

## mtr — Combined Ping + Traceroute

`mtr` combines ping and traceroute into a single real-time display, showing packet loss and latency at each hop.

```bash
# Basic mtr (interactive, updates in real-time)
mtr google.com

# Report mode (run and exit)
mtr -r -c 10 google.com

# No DNS resolution (faster)
mtr -n google.com

# Use TCP instead of ICMP
mtr -T -P 443 google.com

# Wide report (shows both IPs and hostnames)
mtr -rw -c 10 google.com

# JSON output (for scripts)
mtr -j -c 5 google.com
```

### Interpreting mtr output

```bash
#                          Loss%   Snt   Last   Avg  Best  Wrst StDev
# 1. gateway (192.168.1.1)  0.0%    10    1.2   1.1   0.9   1.5   0.2
# 2. isp-node (10.0.0.1)   0.0%    10    5.3   5.1   4.8   5.8   0.3
# 3. ???                   100.0%    10    0.0   0.0   0.0   0.0   0.0  ← Problem!
# 4. target (93.184.216.34) 0.0%    10   15.2  15.0  14.5  16.1   0.5

# Loss% > 0 at a hop means that hop (or beyond) is dropping packets
# High StDev means inconsistent latency (jitter)
# 100% loss at an intermediate hop but 0% at final → hop just doesn't reply to ICMP
```

---

## ARP and Neighbor Tables

### arp — View ARP table

```bash
# Show ARP table (IP to MAC mapping)
arp -n
arp -a

# Delete an ARP entry
sudo arp -d 192.168.1.100
```

### ip neigh — Modern neighbor table

```bash
# Show neighbor table
ip neigh show
ip neigh

# Flush neighbor cache
sudo ip neigh flush all

# Add a static entry
sudo ip neigh add 192.168.1.100 lladdr aa:bb:cc:dd:ee:ff dev eth0
```

---

## Checking Logs

System logs often reveal the root cause of network issues.

```bash
# General system log
sudo tail -f /var/log/syslog

# Kernel messages (network driver issues)
sudo dmesg | grep -i "eth\|network\|link"

# Journalctl for network-related services
sudo journalctl -u NetworkManager -f
sudo journalctl -u systemd-networkd -f
sudo journalctl -u sshd -f
sudo journalctl -u nginx -f

# Check for firewall drops
sudo journalctl -k | grep "UFW BLOCK"
sudo grep "DROP" /var/log/ufw.log | tail -20

# Authentication failures (SSH issues)
sudo grep "Failed" /var/log/auth.log | tail -20
```

---

## Common Network Issues and Fixes

### DNS Failure

```bash
# Symptoms: Can ping 8.8.8.8 but not google.com
# Fix: Check /etc/resolv.conf

# Temporary fix:
echo "nameserver 8.8.8.8" | sudo tee /etc/resolv.conf

# Test:
dig google.com @8.8.8.8
```

### Firewall Blocking

```bash
# Symptoms: Service is running but not accessible remotely
# Check if firewall is blocking:
sudo ufw status
sudo iptables -L -n | grep DROP

# Fix: Allow the port
sudo ufw allow 3000/tcp
```

### Service Not Running

```bash
# Symptoms: Port not listening
# Check:
ss -tlnp | grep :80
systemctl status nginx

# Fix:
sudo systemctl start nginx
sudo systemctl enable nginx
```

### IP Address Not Assigned

```bash
# Symptoms: No IP address on interface
# Check:
ip addr show

# Fix (DHCP):
sudo dhclient eth0

# Fix (static):
sudo ip addr add 192.168.1.50/24 dev eth0
sudo ip route add default via 192.168.1.1
```

### Default Route Missing

```bash
# Symptoms: Can't reach anything outside local network
# Check:
ip route show

# Fix:
sudo ip route add default via 192.168.1.1 dev eth0
```

---

## Network Troubleshooting Script

```bash
#!/bin/bash
# net-troubleshoot.sh — Systematic network troubleshooting

set -u

TARGET="${1:-8.8.8.8}"
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

pass() { echo -e "  ${GREEN}✓ PASS${NC}: $1"; }
fail() { echo -e "  ${RED}✗ FAIL${NC}: $1"; }
warn() { echo -e "  ${YELLOW}! WARN${NC}: $1"; }
info() { echo -e "  $1"; }

echo "======================================"
echo "  Network Troubleshooting"
echo "  Target: $TARGET"
echo "======================================"
echo ""

# Step 1: Check interfaces
echo "--- Step 1: Network Interfaces ---"
IFACE=$(ip route | grep default | awk '{print $5}' | head -1)
if [ -n "$IFACE" ]; then
    pass "Default interface: $IFACE"
    STATE=$(ip link show "$IFACE" | grep -o "state [A-Z]*" | awk '{print $2}')
    if [ "$STATE" = "UP" ]; then
        pass "Interface state: UP"
    else
        fail "Interface state: $STATE"
    fi
else
    fail "No default interface found"
fi
echo ""

# Step 2: Check IP address
echo "--- Step 2: IP Address ---"
IP=$(ip -4 addr show "$IFACE" 2>/dev/null | grep inet | awk '{print $2}')
if [ -n "$IP" ]; then
    pass "IP address: $IP"
else
    fail "No IPv4 address on $IFACE"
    info "Try: sudo dhclient $IFACE"
fi
echo ""

# Step 3: Check gateway
echo "--- Step 3: Default Gateway ---"
GATEWAY=$(ip route | grep default | awk '{print $3}' | head -1)
if [ -n "$GATEWAY" ]; then
    pass "Gateway: $GATEWAY"
    if ping -c 1 -W 3 "$GATEWAY" &>/dev/null; then
        pass "Gateway reachable"
    else
        fail "Gateway not reachable"
        info "Check: cable, switch, router"
    fi
else
    fail "No default gateway"
    info "Try: sudo ip route add default via <gateway_ip>"
fi
echo ""

# Step 4: Check internet connectivity
echo "--- Step 4: Internet Connectivity ---"
if ping -c 2 -W 5 8.8.8.8 &>/dev/null; then
    pass "Internet reachable (8.8.8.8)"
else
    fail "Cannot reach internet"
    info "Check: ISP, router, firewall"
fi
echo ""

# Step 5: Check DNS
echo "--- Step 5: DNS Resolution ---"
if ping -c 1 -W 5 google.com &>/dev/null; then
    pass "DNS working (google.com resolves)"
elif dig +short google.com &>/dev/null && [ -n "$(dig +short google.com)" ]; then
    pass "DNS resolves but host unreachable"
else
    fail "DNS not working"
    info "Check: /etc/resolv.conf"
    info "Current nameservers:"
    grep nameserver /etc/resolv.conf 2>/dev/null | while read -r line; do
        info "  $line"
    done
    info "Try: echo 'nameserver 8.8.8.8' | sudo tee /etc/resolv.conf"
fi
echo ""

# Step 6: Check target
echo "--- Step 6: Target Reachability ---"
if ping -c 2 -W 5 "$TARGET" &>/dev/null; then
    pass "Target $TARGET is reachable"
else
    warn "Target $TARGET not reachable (might block ICMP)"
fi
echo ""

# Step 7: Check listening services
echo "--- Step 7: Local Listening Services ---"
echo "  Top listening ports:"
ss -tlnp 2>/dev/null | head -10 | while IFS= read -r line; do
    info "  $line"
done
echo ""

# Step 8: Check firewall
echo "--- Step 8: Firewall Status ---"
if command -v ufw &>/dev/null; then
    UFW_STATUS=$(sudo ufw status 2>/dev/null | head -1)
    info "UFW: $UFW_STATUS"
elif command -v firewall-cmd &>/dev/null; then
    FW_STATE=$(sudo firewall-cmd --state 2>/dev/null)
    info "firewalld: $FW_STATE"
else
    info "No common firewall tool found"
fi
echo ""

echo "======================================"
echo "  Troubleshooting complete"
echo "======================================"
```

---

## Quick Reference

| Problem | Command to Diagnose |
|---------|-------------------|
| Is host reachable? | `ping -c 3 host` |
| Where does it fail? | `traceroute host` or `mtr host` |
| Is the port open? | `ss -tlnp \| grep :port` |
| Is DNS working? | `dig +short domain` |
| What's blocking? | `sudo tcpdump -i eth0 port X` |
| Firewall issue? | `sudo ufw status` / `iptables -L` |
| Service down? | `systemctl status service` |
| No IP address? | `ip addr show` |
| No route? | `ip route show` |
| Who's connected? | `ss -tnp` |
