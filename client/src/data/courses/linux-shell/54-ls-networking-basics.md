---
title: Networking Basics
---

# Networking Basics

Every server and workstation communicates over a network. This lesson covers the essential Linux networking tools — from checking your IP address to diagnosing connectivity issues and downloading files.

---

## ip Command — Modern Network Configuration

The `ip` command is the modern replacement for `ifconfig`. It manages network interfaces, addresses, and routes.

### Show IP Addresses

```bash
$ ip addr show
1: lo: <LOOPBACK,UP,LOWER_UP> mtu 65536
    inet 127.0.0.1/8 scope host lo
    inet6 ::1/128 scope host
2: eth0: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500
    inet 192.168.1.100/24 brd 192.168.1.255 scope global eth0
    inet6 fe80::1234:5678:abcd:ef01/64 scope link
```

### Short Form

```bash
# Abbreviated — same output
$ ip a

# Show only IPv4 addresses
$ ip -4 addr show
2: eth0: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500
    inet 192.168.1.100/24 brd 192.168.1.255 scope global eth0

# Show a specific interface
$ ip addr show eth0
```

### Show Routing Table

```bash
$ ip route show
default via 192.168.1.1 dev eth0 proto dhcp metric 100
192.168.1.0/24 dev eth0 proto kernel scope link src 192.168.1.100

# Short form
$ ip r
```

### Show Link (Interface) Status

```bash
$ ip link show
1: lo: <LOOPBACK,UP,LOWER_UP> mtu 65536 state UNKNOWN
2: eth0: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500 state UP
3: wlan0: <BROADCAST,MULTICAST> mtu 1500 state DOWN
```

### Bring Interface Up/Down

```bash
# Disable network interface
$ sudo ip link set eth0 down

# Enable network interface
$ sudo ip link set eth0 up
```

### Add/Remove IP Address

```bash
# Add an IP address
$ sudo ip addr add 192.168.1.200/24 dev eth0

# Remove an IP address
$ sudo ip addr del 192.168.1.200/24 dev eth0
```

---

## ifconfig — Legacy (Still Useful)

`ifconfig` is the older network configuration tool. Many tutorials and scripts still use it.

```bash
$ ifconfig
eth0: flags=4163<UP,BROADCAST,RUNNING,MULTICAST>  mtu 1500
        inet 192.168.1.100  netmask 255.255.255.0  broadcast 192.168.1.255
        inet6 fe80::1234:5678:abcd:ef01  prefixlen 64  scopeid 0x20<link>
        ether 00:11:22:33:44:55  txqueuelen 1000  (Ethernet)
        RX packets 123456  bytes 98765432 (98.7 MB)
        TX packets 654321  bytes 87654321 (87.6 MB)

lo: flags=73<UP,LOOPBACK,RUNNING>  mtu 65536
        inet 127.0.0.1  netmask 255.0.0.0
```

```bash
# Show specific interface
$ ifconfig eth0

# Install if not available
$ sudo apt install net-tools
```

---

## ping — Test Connectivity

`ping` sends ICMP echo requests to test if a host is reachable and measure latency.

### Basic Ping

```bash
$ ping google.com
PING google.com (142.250.80.46) 56(84) bytes of data.
64 bytes from lax17s62-in-f14.1e100.net (142.250.80.46): icmp_seq=1 ttl=118 time=5.42 ms
64 bytes from lax17s62-in-f14.1e100.net (142.250.80.46): icmp_seq=2 ttl=118 time=5.38 ms
64 bytes from lax17s62-in-f14.1e100.net (142.250.80.46): icmp_seq=3 ttl=118 time=5.51 ms
^C
--- google.com ping statistics ---
3 packets transmitted, 3 received, 0% packet loss, time 2003ms
rtt min/avg/max/mdev = 5.380/5.437/5.510/0.053 ms
```

### Limited Number of Pings

```bash
# Send exactly 4 pings then stop
$ ping -c 4 192.168.1.1
PING 192.168.1.1 (192.168.1.1) 56(84) bytes of data.
64 bytes from 192.168.1.1: icmp_seq=1 ttl=64 time=1.23 ms
64 bytes from 192.168.1.1: icmp_seq=2 ttl=64 time=1.18 ms
64 bytes from 192.168.1.1: icmp_seq=3 ttl=64 time=1.21 ms
64 bytes from 192.168.1.1: icmp_seq=4 ttl=64 time=1.19 ms

--- 192.168.1.1 ping statistics ---
4 packets transmitted, 4 received, 0% packet loss, time 3004ms
```

### Ping with Interval and Timeout

```bash
# Ping every 0.5 seconds
$ ping -i 0.5 -c 10 192.168.1.1

# Timeout after 5 seconds
$ ping -W 5 -c 1 unreachable-host.com
```

### Quick Connectivity Check

```bash
# Returns 0 (success) or non-zero (failure)
$ ping -c 1 -W 2 google.com > /dev/null 2>&1 && echo "Online" || echo "Offline"
Online
```

---

## traceroute / tracepath — Trace Network Path

Shows every router (hop) between you and a destination.

### traceroute

```bash
$ traceroute google.com
traceroute to google.com (142.250.80.46), 30 hops max, 60 byte packets
 1  router.local (192.168.1.1)  1.234 ms  1.122 ms  1.098 ms
 2  isp-gateway (10.0.0.1)  5.678 ms  5.543 ms  5.501 ms
 3  core-router (72.14.233.85)  10.234 ms  10.123 ms  10.098 ms
 4  lax17s62-in-f14.1e100.net (142.250.80.46)  5.456 ms  5.412 ms  5.398 ms
```

### tracepath (no root required)

```bash
$ tracepath google.com
 1?: [LOCALHOST]                     pmtu 1500
 1:  router.local                    1.234ms
 2:  isp-gateway                     5.678ms
 3:  core-router                    10.234ms
 4:  lax17s62-in-f14.1e100.net       5.456ms reached
     Resume: pmtu 1500 hops 4 back 4
```

---

## netstat / ss — Network Connections

### ss — Modern Tool (Faster)

`ss` displays socket statistics — what's listening, what's connected.

```bash
# Show all listening TCP ports with process info
$ ss -tlnp
State    Recv-Q   Send-Q   Local Address:Port   Peer Address:Port   Process
LISTEN   0        128      0.0.0.0:22           0.0.0.0:*           users:(("sshd",pid=1234))
LISTEN   0        511      0.0.0.0:80           0.0.0.0:*           users:(("nginx",pid=5678))
LISTEN   0        128      127.0.0.1:5432       0.0.0.0:*           users:(("postgres",pid=9012))
LISTEN   0        128      0.0.0.0:443          0.0.0.0:*           users:(("nginx",pid=5678))
```

**Flags:**
- `-t` — TCP connections only
- `-l` — listening sockets only
- `-n` — show port numbers (don't resolve names)
- `-p` — show process using the socket

```bash
# Show all established connections
$ ss -tn
State    Recv-Q   Send-Q   Local Address:Port   Peer Address:Port
ESTAB    0        0        192.168.1.100:22     192.168.1.50:54321
ESTAB    0        0        192.168.1.100:80     203.0.113.42:12345

# Show UDP sockets
$ ss -ulnp

# Show summary statistics
$ ss -s
Total: 168
TCP:   12 (estab 3, closed 2, orphaned 0, timewait 2)
```

### netstat — Legacy (Still Common)

```bash
# Listening ports with process info
$ netstat -tlnp
Proto Recv-Q Send-Q Local Address   Foreign Address  State   PID/Program
tcp        0      0 0.0.0.0:22      0.0.0.0:*        LISTEN  1234/sshd
tcp        0      0 0.0.0.0:80      0.0.0.0:*        LISTEN  5678/nginx

# All connections
$ netstat -an

# Install if needed
$ sudo apt install net-tools
```

---

## hostname — Show/Set Hostname

```bash
# Display current hostname
$ hostname
myserver

# Display FQDN (fully qualified domain name)
$ hostname -f
myserver.example.com

# Display IP address
$ hostname -I
192.168.1.100

# Set hostname (temporary — until reboot)
$ sudo hostname new-hostname

# Set hostname permanently (systemd)
$ sudo hostnamectl set-hostname new-hostname
$ hostnamectl
   Static hostname: new-hostname
         Icon name: computer-vm
           Chassis: vm
  Operating System: Ubuntu 24.04 LTS
            Kernel: Linux 6.8.0-generic
```

---

## /etc/hosts — Local DNS

The `/etc/hosts` file maps hostnames to IP addresses locally, before DNS is queried.

```bash
$ cat /etc/hosts
127.0.0.1       localhost
127.0.1.1       myserver
::1             localhost ip6-localhost

# Custom entries
192.168.1.50    devserver
192.168.1.51    database.local
10.0.0.100      api.internal
```

### Use Cases

```bash
# Block a website (redirect to nowhere)
$ sudo sh -c 'echo "127.0.0.1 distracting-site.com" >> /etc/hosts'

# Point a domain to a local dev server
$ sudo sh -c 'echo "127.0.0.1 myapp.local" >> /etc/hosts'

# Test a new server before changing DNS
$ sudo sh -c 'echo "203.0.113.50 www.example.com" >> /etc/hosts'
```

---

## /etc/resolv.conf — DNS Configuration

This file tells the system which DNS servers to use.

```bash
$ cat /etc/resolv.conf
# Generated by NetworkManager
nameserver 8.8.8.8
nameserver 8.8.4.4
nameserver 1.1.1.1
search example.com
```

| Directive    | Purpose                                    |
|-------------|---------------------------------------------|
| `nameserver`| DNS server IP (up to 3)                     |
| `search`    | Domain suffix for short hostnames           |
| `domain`    | Default domain name                         |

> **Note:** On modern systems, `resolv.conf` is often managed by `systemd-resolved` or NetworkManager. Edit with caution.

---

## nslookup / dig — DNS Queries

### nslookup — Simple DNS Lookup

```bash
$ nslookup google.com
Server:     8.8.8.8
Address:    8.8.8.8#53

Non-authoritative answer:
Name:   google.com
Address: 142.250.80.46
Name:   google.com
Address: 2607:f8b0:4004:800::200e
```

### dig — Detailed DNS Queries

```bash
# Basic query
$ dig google.com
;; ANSWER SECTION:
google.com.     300     IN      A       142.250.80.46

;; Query time: 12 msec
;; SERVER: 8.8.8.8#53(8.8.8.8)

# Short answer only
$ dig +short google.com
142.250.80.46

# Query specific record type
$ dig google.com MX
;; ANSWER SECTION:
google.com.     600     IN      MX      10 smtp.google.com.

# Query a specific DNS server
$ dig @1.1.1.1 example.com

# Reverse DNS lookup
$ dig -x 8.8.8.8
;; ANSWER SECTION:
8.8.8.8.in-addr.arpa.  3600  IN  PTR  dns.google.

# Trace the full resolution path
$ dig +trace example.com
```

### Common DNS Record Types

| Type   | Purpose                        | Example                    |
|--------|--------------------------------|----------------------------|
| A      | IPv4 address                   | `93.184.216.34`            |
| AAAA   | IPv6 address                   | `2606:2800:220:1:...`      |
| MX     | Mail server                    | `10 mail.example.com`      |
| CNAME  | Alias for another domain       | `www → example.com`        |
| NS     | Nameserver                     | `ns1.example.com`          |
| TXT    | Text records (SPF, DKIM, etc.) | `"v=spf1 include:..."`    |

---

## curl — Transfer Data from URLs

`curl` is a versatile tool for making HTTP requests, downloading files, and testing APIs.

### Basic GET Request

```bash
$ curl https://httpbin.org/get
{
  "args": {},
  "headers": {
    "Accept": "*/*",
    "Host": "httpbin.org",
    "User-Agent": "curl/8.5.0"
  },
  "url": "https://httpbin.org/get"
}
```

### Headers Only

```bash
$ curl -I https://example.com
HTTP/2 200
content-type: text/html; charset=UTF-8
content-length: 1256
last-modified: Thu, 17 Oct 2024 05:20:00 GMT
server: ECAcc (lax/12AB)
```

### Download a File

```bash
# Save with remote filename
$ curl -O https://example.com/file.tar.gz

# Save with custom filename
$ curl -o myfile.tar.gz https://example.com/file.tar.gz

# Resume interrupted download
$ curl -C - -O https://example.com/large-file.iso
```

### Follow Redirects

```bash
# -L follows HTTP redirects (301, 302)
$ curl -L https://short.url/abc123
```

### POST Request

```bash
# Send form data
$ curl -X POST -d "name=John&email=john@example.com" https://httpbin.org/post

# Send JSON
$ curl -X POST \
    -H "Content-Type: application/json" \
    -d '{"name": "John", "email": "john@example.com"}' \
    https://httpbin.org/post
```

### Authentication

```bash
# Basic auth
$ curl -u username:password https://api.example.com/data

# Bearer token
$ curl -H "Authorization: Bearer YOUR_TOKEN" https://api.example.com/data
```

### Verbose Output for Debugging

```bash
$ curl -v https://example.com
*   Trying 93.184.216.34:443...
* Connected to example.com
> GET / HTTP/2
> Host: example.com
> User-Agent: curl/8.5.0
< HTTP/2 200
< content-type: text/html
...
```

---

## wget — Download Files

`wget` is designed specifically for downloading. It handles retries, recursion, and background downloads better than curl.

### Basic Download

```bash
$ wget https://example.com/file.tar.gz
--2025-03-15 10:00:00--  https://example.com/file.tar.gz
Resolving example.com... 93.184.216.34
Connecting to example.com|93.184.216.34|:443... connected.
HTTP request sent, awaiting response... 200 OK
Length: 10485760 (10M) [application/gzip]
Saving to: 'file.tar.gz'

file.tar.gz     100%[=========>]  10.00M  5.00MB/s    in 2.0s

2025-03-15 10:00:02 (5.00 MB/s) - 'file.tar.gz' saved [10485760/10485760]
```

### Save with Custom Name

```bash
$ wget -O custom-name.tar.gz https://example.com/file.tar.gz
```

### Download in Background

```bash
$ wget -b https://example.com/large-file.iso
Continuing in background, pid 12345.
Output will be written to 'wget-log'.
```

### Resume Interrupted Download

```bash
$ wget -c https://example.com/large-file.iso
```

### Download Multiple Files

```bash
# From a list file
$ cat urls.txt
https://example.com/file1.tar.gz
https://example.com/file2.tar.gz
https://example.com/file3.tar.gz

$ wget -i urls.txt
```

### Mirror a Website

```bash
# Download an entire website for offline browsing
$ wget --mirror --convert-links --page-requisites https://example.com
```

---

## Network Diagnostics Script

```bash
#!/bin/bash
# network-check.sh — Quick network diagnostics

echo "=== Network Diagnostics ==="
echo ""

# 1. Show IP address
echo "--- IP Address ---"
ip -4 addr show | grep inet | grep -v 127.0.0.1
echo ""

# 2. Default gateway
echo "--- Default Gateway ---"
ip route | grep default
echo ""

# 3. DNS servers
echo "--- DNS Servers ---"
grep nameserver /etc/resolv.conf
echo ""

# 4. Test local network (gateway)
GATEWAY=$(ip route | grep default | awk '{print $3}')
echo "--- Ping Gateway ($GATEWAY) ---"
ping -c 2 "$GATEWAY" 2>/dev/null | tail -1
echo ""

# 5. Test internet connectivity
echo "--- Ping Internet (8.8.8.8) ---"
ping -c 2 8.8.8.8 2>/dev/null | tail -1
echo ""

# 6. Test DNS resolution
echo "--- DNS Resolution ---"
dig +short google.com | head -1
echo ""

# 7. Listening ports
echo "--- Listening Ports ---"
ss -tlnp 2>/dev/null | head -10
echo ""

echo "=== Diagnostics Complete ==="
```

---

## Quick Reference

| Task                        | Command                             |
|-----------------------------|-------------------------------------|
| Show IP addresses           | `ip addr show` or `ip a`            |
| Show routing table          | `ip route show` or `ip r`           |
| Test connectivity           | `ping -c 4 host`                    |
| Trace route to host         | `traceroute host`                   |
| Show listening ports        | `ss -tlnp`                          |
| Show all connections        | `ss -tn`                            |
| Show hostname               | `hostname`                          |
| DNS lookup                  | `dig +short domain.com`             |
| Get HTTP headers            | `curl -I url`                       |
| Download file               | `wget url` or `curl -O url`         |
| POST JSON                   | `curl -X POST -H "Content-Type: application/json" -d '{}' url` |
| Check open port             | `ss -tlnp \| grep :80`             |

---

## Summary

- **ip** is the modern tool for network configuration — replaces ifconfig.
- **ping** tests basic connectivity; **traceroute** shows the path packets take.
- **ss** displays sockets and listening ports (replaces netstat).
- **/etc/hosts** provides local DNS overrides; **/etc/resolv.conf** configures DNS servers.
- **dig** gives detailed DNS information; use `+short` for quick lookups.
- **curl** is your Swiss Army knife for HTTP requests and API testing.
- **wget** excels at downloading files with retry and resume support.
