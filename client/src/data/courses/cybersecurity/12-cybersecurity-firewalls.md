---
title: Firewalls & Network Segmentation
---

# Firewalls & Network Segmentation

Firewalls are the first line of defense, controlling traffic between networks.

---

## What is a Firewall?

A firewall monitors and controls incoming/outgoing network traffic based on predefined rules.

```
Internet → [Firewall] → Internal Network
              │
         Allow/Deny based on rules
```

---

## Types of Firewalls

| Type | How It Works | Pros/Cons |
|------|-------------|-----------|
| **Packet Filter** | Inspects headers (IP, port) | Fast but no context |
| **Stateful** | Tracks connection state | Better context, standard today |
| **Application (Layer 7)** | Inspects payload content | Deep inspection, slower |
| **Next-Gen (NGFW)** | IPS + app awareness + threat intel | Comprehensive, expensive |
| **WAF** | Protects web applications | Stops XSS, SQLi specifically |
| **Host-based** | Runs on individual machines | Per-device protection |

---

## Firewall Rules

Rules are processed **top-to-bottom**, first match wins:

```
# Rule#  Action  Source         Dest           Port    Protocol
1        ALLOW   10.1.1.0/24   10.1.2.0/24    443     TCP
2        ALLOW   ANY            10.1.4.0/24    80,443  TCP
3        DENY    ANY            10.1.3.0/24    ANY     ANY
4        ALLOW   10.1.0.0/16   ANY            53      UDP
5        DENY    ANY            ANY            ANY     ANY  ← Default deny
```

### Best practices:
- **Default deny** — block everything, then allow what's needed
- Most specific rules first
- Log denied traffic for monitoring
- Review rules regularly (remove outdated ones)
- Document why each rule exists

---

## DMZ (Demilitarized Zone)

A network segment between the public internet and private network:

```
Internet → [External Firewall] → DMZ → [Internal Firewall] → LAN
                                   │
                          Web servers, mail servers
                          (public-facing services)
```

- Public-facing servers live in the DMZ
- If compromised, attacker still can't reach internal network
- Internal firewall restricts DMZ → LAN traffic

---

## Network Segmentation

Divide the network into isolated zones:

### Micro-segmentation:
- Each workload/application in its own segment
- Zero trust between segments
- Policies enforced at each boundary

### Common segments:
| Segment | Contains | Access Rules |
|---------|----------|-------------|
| **DMZ** | Public servers | Internet → DMZ allowed (specific ports) |
| **Corporate** | Employee workstations | Internal access only |
| **Production** | Application servers | Limited admin access |
| **Database** | Data stores | Only from app servers |
| **Management** | Admin tools | Highly restricted |

---

## VLANs

Virtual LANs segment a physical network logically:

- Devices on different VLANs can't communicate directly
- Traffic between VLANs must pass through a router/firewall
- Cost-effective segmentation without additional hardware

---

## Key Takeaways

- Firewalls control traffic flow based on rules
- **Default deny** is the safest starting point
- **Next-gen firewalls** combine multiple security functions
- **DMZ** isolates public-facing servers from internal networks
- **Network segmentation** limits lateral movement after a breach
- Segment by function, sensitivity, and trust level

---

Next, we'll learn about **VPNs & Tunneling** →
