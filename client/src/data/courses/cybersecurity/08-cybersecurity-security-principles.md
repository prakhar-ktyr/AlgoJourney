---
title: Security Principles & Defense in Depth
---

# Security Principles & Defense in Depth

Core principles that guide all cybersecurity decisions and architectures.

---

## Fundamental Security Principles

### 1. Least Privilege
Give users and systems **only the minimum access** needed to do their job.

- A developer doesn't need admin access to production databases
- A web server doesn't need access to the HR file share
- An intern doesn't need access to financial records

### 2. Defense in Depth
**Multiple layers** of security — if one fails, others still protect.

```
┌─────────────────────────────────────┐
│  Physical Security (locks, guards)  │
│  ┌───────────────────────────────┐  │
│  │  Network Security (firewalls) │  │
│  │  ┌─────────────────────────┐  │  │
│  │  │  Host Security (AV, EDR)│  │  │
│  │  │  ┌───────────────────┐  │  │  │
│  │  │  │ Application (WAF) │  │  │  │
│  │  │  │  ┌─────────────┐  │  │  │  │
│  │  │  │  │   DATA       │  │  │  │  │
│  │  │  │  │ (encryption) │  │  │  │  │
│  │  │  │  └─────────────┘  │  │  │  │
│  │  │  └───────────────────┘  │  │  │
│  │  └─────────────────────────┘  │  │
│  └───────────────────────────────┘  │
└─────────────────────────────────────┘
```

### 3. Separation of Duties
No single person should control all parts of a critical process.

- One person approves payments, another executes them
- Developers can't deploy their own code to production without review
- Database admins can't also be the auditors

### 4. Need to Know
Access information only when required for your role.

### 5. Fail Secure (Fail Closed)
When a system fails, it should default to a **secure state**.

- If a firewall crashes → block all traffic (don't allow all)
- If authentication fails → deny access (don't grant)
- If a WAF goes down → reject requests (don't bypass)

### 6. Open Design
Security should not depend on secrecy of the design (Kerckhoffs' principle).

- Encryption algorithms are public (AES, RSA)
- Security comes from the **key**, not the algorithm
- "Security through obscurity" alone is never sufficient

### 7. Complete Mediation
**Every** access request must be checked — no bypasses or cached decisions.

### 8. Psychological Acceptability
Security controls must be usable — overly complex security gets bypassed.

---

## Defense in Depth Layers

| Layer | Controls |
|-------|----------|
| **Policies & Procedures** | Security policies, training, compliance |
| **Physical** | Locks, cameras, badges, fencing |
| **Perimeter** | Firewalls, DMZ, IDS/IPS |
| **Network** | Segmentation, VLANs, VPNs |
| **Host** | Antivirus, EDR, host firewall, patching |
| **Application** | Input validation, WAF, secure coding |
| **Data** | Encryption, DLP, access controls, backups |

---

## Security Models

### Bell-LaPadula (Confidentiality)
- "No read up, no write down"
- Prevents information flowing to lower classification levels

### Biba (Integrity)
- "No read down, no write up"
- Prevents untrusted data from corrupting trusted data

### Clark-Wilson (Integrity)
- Well-formed transactions
- Separation of duties enforced by the system

---

## Practical Application

### Example: Securing a Web Application

| Principle | Implementation |
|-----------|---------------|
| Least privilege | App runs as non-root user, minimal DB permissions |
| Defense in depth | WAF + input validation + prepared statements |
| Fail secure | Invalid input → reject request |
| Separation of duties | Deploy requires 2 approvals |
| Complete mediation | Check auth on every API request |

---

## Key Takeaways

- **Least privilege** — minimize access for all users and systems
- **Defense in depth** — no single point of failure
- **Fail secure** — defaults to denying access on failure
- **Separation of duties** — prevents single-person compromise
- These principles guide every security architecture decision
- Apply them at every layer: physical, network, host, application, data

---

Next, we'll explore **Risk Management Basics** →
