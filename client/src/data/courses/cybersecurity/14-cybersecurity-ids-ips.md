---
title: Intrusion Detection & Prevention
---

# Intrusion Detection & Prevention (IDS/IPS)

IDS/IPS systems monitor network traffic for malicious activity and policy violations.

---

## IDS vs IPS

| Feature | IDS | IPS |
|---------|-----|-----|
| **Function** | Detects and alerts | Detects and blocks |
| **Position** | Passive (monitors copy of traffic) | Inline (traffic passes through) |
| **Action** | Sends alerts to admin | Drops malicious packets |
| **Risk** | Attacks succeed before response | False positives block legitimate traffic |

---

## Detection Methods

### Signature-Based
- Matches traffic against known attack patterns
- Like antivirus for network traffic
- Pros: Low false positives for known attacks
- Cons: Can't detect new/unknown attacks (zero-days)

### Anomaly-Based
- Learns "normal" baseline behavior
- Alerts on deviations from normal
- Pros: Can detect unknown attacks
- Cons: Higher false positive rate, needs training period

### Heuristic/Behavioral
- Analyzes behavior patterns
- Looks for suspicious sequences of actions
- Example: Multiple failed logins → port scan → exploit attempt

---

## Types of IDS/IPS

| Type | Monitors | Deployment |
|------|----------|-----------|
| **NIDS** (Network) | All network traffic | At network boundaries |
| **HIDS** (Host) | Single host's activity | On individual servers |
| **WIDS** (Wireless) | Wireless traffic | Near access points |

---

## Common IDS/IPS Tools

| Tool | Type | Notes |
|------|------|-------|
| **Snort** | NIDS/NIPS | Open source, widely used |
| **Suricata** | NIDS/NIPS | Multi-threaded, modern |
| **OSSEC** | HIDS | Log analysis, file integrity |
| **Zeek (Bro)** | Network monitor | Detailed protocol analysis |
| **Wazuh** | HIDS + SIEM | Open source, cloud-ready |

---

## Snort Rule Example

```
alert tcp any any -> 192.168.1.0/24 80 (
  msg:"SQL Injection Attempt";
  content:"' OR '1'='1";
  nocase;
  sid:1000001;
  rev:1;
)
```

This rule:
- Monitors TCP traffic to port 80
- Looks for SQL injection patterns
- Generates an alert with message

---

## Deployment Architecture

```
Internet → [Firewall] → [IPS (inline)] → [Switch] → Internal Network
                                              │
                                         [IDS (mirror port)]
                                              │
                                         [SIEM/Alerts]
```

---

## Challenges

| Challenge | Solution |
|-----------|----------|
| False positives | Tune rules, whitelist known-good traffic |
| Encrypted traffic | TLS inspection (with privacy considerations) |
| High bandwidth | Hardware acceleration, sampling |
| Evasion techniques | Multiple detection methods, update signatures |
| Alert fatigue | Prioritize, correlate with SIEM |

---

## Key Takeaways

- **IDS** detects and alerts; **IPS** detects and blocks
- **Signature-based** catches known attacks; **anomaly-based** catches novel ones
- Deploy both network (NIDS) and host-based (HIDS) solutions
- Tune rules carefully to reduce false positives
- IDS/IPS is one layer — combine with firewalls, SIEM, and EDR

---

Next, we'll explore **DNS Security** →
