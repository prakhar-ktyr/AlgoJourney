---
title: CIA Triad
---

# CIA Triad

The CIA Triad is the foundational model for cybersecurity — **Confidentiality**, **Integrity**, and **Availability**.

---

## Overview

Every security decision, control, and policy aims to protect one or more of these three pillars:

| Principle | Goal | Threat Example |
|-----------|------|---------------|
| **Confidentiality** | Keep data private | Data breach exposes passwords |
| **Integrity** | Keep data accurate | Attacker modifies bank records |
| **Availability** | Keep systems running | DDoS attack takes down a website |

---

## Confidentiality

**Confidentiality** ensures that information is accessible only to those authorized to access it.

### How to protect confidentiality:

- **Encryption** — Scramble data so only key holders can read it
- **Access controls** — Restrict who can view what (RBAC, ACLs)
- **Authentication** — Verify identity before granting access
- **Data classification** — Label data (public, internal, confidential, secret)
- **Physical security** — Lock server rooms, secure laptops

### Real-world examples:

| Scenario | Confidentiality Measure |
|----------|----------------------|
| Medical records | Only doctors/patients can view |
| Bank account | Login required, encrypted in transit |
| Trade secrets | Need-to-know access, NDAs |
| Email | End-to-end encryption |

### Confidentiality breaches:

- An employee emails a spreadsheet of customer SSNs to the wrong person
- A hacker intercepts unencrypted Wi-Fi traffic
- A database with plaintext passwords is leaked

---

## Integrity

**Integrity** ensures that data is accurate, complete, and hasn't been modified by unauthorized parties.

### How to protect integrity:

- **Hashing** — Detect any changes to data (SHA-256, MD5)
- **Digital signatures** — Prove data came from a trusted source
- **Version control** — Track all changes with history
- **Checksums** — Verify file integrity during downloads
- **Access controls** — Limit who can modify data
- **Audit logs** — Record all changes for accountability

### Real-world examples:

| Scenario | Integrity Measure |
|----------|-----------------|
| Software download | SHA-256 checksum verification |
| Bank transaction | Digital signatures, audit trail |
| Legal documents | Tamper-evident seals, blockchain |
| Database records | Write permissions, change logs |

### Integrity breaches:

- An attacker modifies a wire transfer amount
- Malware alters system log files to hide its tracks
- A disgruntled employee changes financial records

---

## Availability

**Availability** ensures that systems and data are accessible when authorized users need them.

### How to protect availability:

- **Redundancy** — Multiple servers, data centers, backup systems
- **Load balancing** — Distribute traffic across servers
- **DDoS protection** — Filter malicious traffic
- **Backup & recovery** — Regular backups, tested restore procedures
- **Failover systems** — Automatic switchover on failure
- **Patch management** — Keep systems updated to prevent crashes

### Real-world examples:

| Scenario | Availability Measure |
|----------|---------------------|
| E-commerce site | Load balancers, CDN, auto-scaling |
| Hospital systems | Redundant power, backup generators |
| Banking app | 99.99% uptime SLA, failover clusters |
| Email service | Multiple data centers, replication |

### Availability breaches:

- A DDoS attack overwhelms a website's servers
- Ransomware encrypts all files, making them inaccessible
- A natural disaster destroys the only data center
- A misconfigured update crashes production servers

---

## Balancing the Triad

The three principles can conflict:

| Conflict | Example |
|----------|---------|
| Confidentiality vs. Availability | Strict encryption slows access |
| Integrity vs. Availability | Verification checks add latency |
| Confidentiality vs. Integrity | Encrypted data is harder to audit |

The goal is **balance** — not maximizing one at the expense of others.

### Example: Hospital system

- **Confidentiality**: Patient records are private (HIPAA)
- **Integrity**: Dosage data must be accurate (lives depend on it)
- **Availability**: Doctors need records immediately in emergencies

A system that's too locked-down (high confidentiality) might prevent a doctor from accessing records in an emergency (low availability). Good security finds the right balance.

---

## Beyond CIA: Additional Principles

Some frameworks extend the triad:

| Principle | Meaning |
|-----------|---------|
| **Authentication** | Verify who someone is |
| **Authorization** | Verify what they can do |
| **Non-repudiation** | Prove an action occurred (can't deny it) |
| **Accountability** | Track actions to individuals |

---

## Key Takeaways

- The **CIA Triad** is the foundation of all cybersecurity decisions
- **Confidentiality** = keep data private
- **Integrity** = keep data accurate and unmodified
- **Availability** = keep systems accessible
- Real-world security requires **balancing** all three
- Every security control maps back to one or more of these principles

---

Next, we'll explore **Types of Cyber Threats** →
