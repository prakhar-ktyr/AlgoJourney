---
title: VPNs & Tunneling
---

# VPNs & Tunneling

VPNs create encrypted tunnels over untrusted networks, enabling secure remote access.

---

## What is a VPN?

A **Virtual Private Network** extends a private network across a public network (internet), encrypting all traffic between endpoints.

```
[Remote User] ←──encrypted tunnel──→ [VPN Gateway] → [Corporate Network]
       │                                                        │
    Public Internet                                    Private Resources
```

---

## VPN Types

| Type | Use Case | Description |
|------|----------|-------------|
| **Remote Access** | Employees working from home | Client connects to corporate VPN |
| **Site-to-Site** | Connect branch offices | Permanent tunnel between networks |
| **Client-to-Client** | Peer-to-peer | Direct encrypted connection |
| **SSL/TLS VPN** | Browser-based access | No client software needed |

---

## VPN Protocols

| Protocol | Security | Speed | Notes |
|----------|----------|-------|-------|
| **WireGuard** | Strong | Very fast | Modern, simple, recommended |
| **OpenVPN** | Strong | Good | Mature, widely supported |
| **IPSec/IKEv2** | Strong | Fast | Built into most OS |
| **L2TP/IPSec** | Moderate | Moderate | Legacy, being phased out |
| **PPTP** | Weak | Fast | Broken — never use |

---

## How IPSec Works

Two modes:

### Transport Mode
- Encrypts only the payload (data)
- Original IP headers remain
- Used for host-to-host communication

### Tunnel Mode
- Encrypts the entire original packet
- New IP headers added
- Used for site-to-site VPNs

### IPSec protocols:
- **AH** (Authentication Header) — integrity only, no encryption
- **ESP** (Encapsulating Security Payload) — encryption + integrity
- **IKE** (Internet Key Exchange) — negotiates keys

---

## Split Tunneling

| Mode | Behavior | Security |
|------|----------|----------|
| **Full tunnel** | ALL traffic goes through VPN | More secure, slower |
| **Split tunnel** | Only corporate traffic via VPN | Faster, but exposes personal traffic |

Split tunneling risk: If a user's device is compromised, the attacker can reach the corporate network through the VPN while also accessing the internet directly.

---

## VPN Security Considerations

- **Authentication**: Use MFA, not just passwords
- **Encryption**: AES-256 minimum
- **Kill switch**: Block internet if VPN disconnects
- **DNS leaks**: Ensure DNS queries go through the VPN
- **Logging**: Some VPN providers log user activity
- **Endpoint security**: VPN doesn't help if the device is compromised

---

## Tunneling Techniques (Attacker Perspective)

Attackers use tunneling to bypass security:

| Technique | How It Works |
|-----------|-------------|
| **DNS tunneling** | Encode data in DNS queries/responses |
| **ICMP tunneling** | Hide data in ping packets |
| **HTTP tunneling** | Wrap traffic in HTTP to bypass firewalls |
| **SSH tunneling** | Forward ports through SSH connections |

### Detection:
- Monitor for unusually large DNS queries
- Look for high-volume ICMP traffic
- Inspect HTTP traffic for anomalies
- Baseline normal traffic patterns

---

## Key Takeaways

- VPNs encrypt traffic over untrusted networks
- **WireGuard** and **OpenVPN** are the recommended protocols today
- Never use PPTP — it's cryptographically broken
- **Full tunnel** is more secure than split tunnel
- VPNs protect data in transit but don't secure endpoints
- Attackers use tunneling to exfiltrate data — monitor for anomalies

---

Next, we'll learn about **Intrusion Detection & Prevention** →
