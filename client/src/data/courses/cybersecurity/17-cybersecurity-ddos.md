---
title: DDoS Attacks & Mitigation
---

# DDoS Attacks & Mitigation

Distributed Denial of Service attacks overwhelm systems with traffic, making them unavailable to legitimate users.

---

## DoS vs DDoS

| | DoS | DDoS |
|--|-----|------|
| Source | Single machine | Many machines (botnet) |
| Scale | Limited | Massive (Tbps) |
| Difficulty to stop | Block one IP | Thousands of IPs |
| Sophistication | Low | High |

---

## Types of DDoS Attacks

### Volume-Based (Layer 3/4)
Flood the network with traffic:
- **UDP Flood** — Massive UDP packets to random ports
- **ICMP Flood** — Ping flood
- **DNS Amplification** — Small queries, large responses reflected to victim
- **NTP Amplification** — Abuses NTP monlist command (556x amplification)

### Protocol Attacks (Layer 3/4)
Exploit protocol weaknesses:
- **SYN Flood** — Exhaust connection table with half-open connections
- **Smurf Attack** — ICMP broadcast with spoofed source
- **Fragmentation** — Overlapping fragments crash systems

### Application Layer (Layer 7)
Target specific services:
- **HTTP Flood** — Legitimate-looking requests overwhelming web server
- **Slowloris** — Hold connections open with slow, incomplete requests
- **DNS Query Flood** — Overwhelm DNS servers with queries

---

## Scale of Modern DDoS

| Year | Largest Attack | Target |
|------|---------------|--------|
| 2018 | 1.7 Tbps | GitHub (memcached amplification) |
| 2020 | 2.3 Tbps | AWS customer |
| 2022 | 3.47 Tbps | Azure customer |
| 2023 | 71M rps | Cloudflare customer (HTTP/2 Rapid Reset) |

---

## DDoS Mitigation Strategies

### Upstream Filtering
- ISP-level blackholing (drops ALL traffic to target IP)
- Scrubbing centers filter malicious traffic

### CDN/Edge Protection
- **Cloudflare**, **AWS Shield**, **Akamai**
- Absorb attacks across global network
- Only clean traffic reaches origin

### Rate Limiting
- Limit requests per IP per second
- Challenge suspicious clients (CAPTCHA, JS challenge)

### Anycast
- Distribute traffic across multiple data centers
- Attack traffic spread globally instead of hitting one server

### Application-Level Defenses
- Connection rate limiting
- Request validation
- Geographic blocking
- Bot detection (fingerprinting, behavior analysis)

---

## DDoS Response Plan

1. **Detect** — Monitoring alerts on traffic spike
2. **Classify** — Identify attack type and vector
3. **Mitigate** — Activate scrubbing, adjust rules
4. **Communicate** — Notify stakeholders, update status page
5. **Recover** — Verify service restoration
6. **Review** — Post-incident analysis, improve defenses

---

## Key Takeaways

- DDoS attacks target **availability** — the A in CIA
- Three categories: **volumetric**, **protocol**, **application layer**
- Modern attacks can exceed **terabits per second**
- Mitigation requires **upstream protection** (CDN, scrubbing centers)
- No single server can absorb a large DDoS — distribute and filter
- Have a **response plan** before an attack happens

---

Next, we'll explore **Network Monitoring & Packet Analysis** →
