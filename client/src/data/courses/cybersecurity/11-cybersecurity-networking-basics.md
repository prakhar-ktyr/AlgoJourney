---
title: Networking Basics for Security
---

# Networking Basics for Security

Understanding networking fundamentals is essential for cybersecurity — you can't protect what you don't understand.

---

## The OSI Model

7 layers of network communication:

| Layer | Name | Function | Security Relevance |
|-------|------|----------|-------------------|
| 7 | Application | User-facing protocols (HTTP, DNS) | WAF, input validation |
| 6 | Presentation | Data formatting, encryption | TLS/SSL |
| 5 | Session | Session management | Session hijacking |
| 4 | Transport | End-to-end delivery (TCP/UDP) | Port scanning, firewalls |
| 3 | Network | Routing (IP addresses) | IP spoofing, ACLs |
| 2 | Data Link | Local delivery (MAC addresses) | ARP spoofing |
| 1 | Physical | Bits on the wire | Physical tapping |

---

## TCP/IP Model

Simplified 4-layer model used in practice:

| Layer | Protocols | Security Concerns |
|-------|-----------|-------------------|
| Application | HTTP, DNS, SMTP, FTP | Protocol exploits, data exposure |
| Transport | TCP, UDP | SYN floods, port scanning |
| Internet | IP, ICMP | IP spoofing, routing attacks |
| Network Access | Ethernet, Wi-Fi | MAC spoofing, sniffing |

---

## IP Addresses

### IPv4
- 32-bit address: `192.168.1.100`
- Private ranges: `10.0.0.0/8`, `172.16.0.0/12`, `192.168.0.0/16`
- NAT translates private → public addresses

### IPv6
- 128-bit address: `2001:0db8:85a3:0000:0000:8a2e:0370:7334`
- No NAT needed (enough addresses for everything)
- Built-in IPsec support

### Security considerations:
- Private IPs shouldn't be exposed to the internet
- IP addresses can be spoofed
- Geolocation can be inaccurate

---

## Ports & Services

| Port | Service | Risk |
|------|---------|------|
| 20-21 | FTP | Unencrypted, credentials in plaintext |
| 22 | SSH | Brute force if weak passwords |
| 23 | Telnet | Completely unencrypted — never use |
| 25 | SMTP | Email spoofing |
| 53 | DNS | DNS poisoning, tunneling |
| 80 | HTTP | Unencrypted web traffic |
| 443 | HTTPS | Encrypted (but still vulnerable to app attacks) |
| 3306 | MySQL | Database exposure |
| 3389 | RDP | Brute force, ransomware entry point |

**Rule**: Only open ports that are absolutely necessary.

---

## TCP Three-Way Handshake

```
Client          Server
  |--- SYN ------->|
  |<-- SYN-ACK ----|
  |--- ACK ------->|
  |   Connected    |
```

**SYN Flood attack**: Send thousands of SYN packets without completing the handshake — overwhelms the server.

---

## DNS (Domain Name System)

Translates domain names to IP addresses.

```
Browser → "What's the IP for google.com?"
DNS Resolver → Root → TLD (.com) → Authoritative → "142.250.80.46"
```

### DNS attacks:
- **DNS Spoofing/Poisoning** — Fake DNS responses redirect users
- **DNS Tunneling** — Hide data inside DNS queries to bypass firewalls
- **DNS Amplification** — DDoS using DNS servers as amplifiers

---

## Subnetting & Network Segmentation

Divide a network into smaller segments:

```
Corporate Network
├── HR Subnet (10.1.1.0/24)
├── Engineering Subnet (10.1.2.0/24)
├── Finance Subnet (10.1.3.0/24)
└── DMZ (10.1.4.0/24) — public-facing servers
```

**Why segment?**
- Limits blast radius of a breach
- Reduces lateral movement
- Enables granular access control
- Required by compliance (PCI DSS)

---

## Key Takeaways

- Know the **OSI/TCP-IP layers** — attacks target every level
- **Close unnecessary ports** — each open port is an attack surface
- **DNS** is critical infrastructure and a common attack target
- **Network segmentation** limits the damage of a breach
- Understanding networking is foundational to all security work

---

Next, we'll explore **Firewalls & Network Segmentation** →
