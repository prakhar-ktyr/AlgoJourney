---
title: Cybersecurity Frameworks
---

# Cybersecurity Frameworks

Frameworks provide structured approaches to managing cybersecurity. They offer guidelines, best practices, and standards.

---

## Why Use a Framework?

- Provides a **common language** for security discussions
- Ensures **comprehensive coverage** (don't miss important areas)
- Helps with **compliance** and regulatory requirements
- Enables **benchmarking** against industry standards
- Guides **prioritization** of security investments

---

## NIST Cybersecurity Framework (CSF)

The most widely adopted framework in the US, developed by the National Institute of Standards and Technology.

### Five Core Functions:

| Function | Purpose | Examples |
|----------|---------|---------|
| **Identify** | Know your assets and risks | Asset inventory, risk assessment |
| **Protect** | Safeguard critical services | Access control, training, encryption |
| **Detect** | Discover security events | Monitoring, anomaly detection |
| **Respond** | Take action on incidents | Incident response plan, communication |
| **Recover** | Restore capabilities | Backup restoration, lessons learned |

### Implementation Tiers:
1. **Partial** — Ad hoc, reactive
2. **Risk Informed** — Some processes, not organization-wide
3. **Repeatable** — Formal policies, consistently applied
4. **Adaptive** — Continuous improvement, adapts to threats

---

## ISO 27001

International standard for Information Security Management Systems (ISMS).

### Key features:
- **Certifiable** — organizations can be audited and certified
- **Risk-based** — build controls based on assessed risks
- **Plan-Do-Check-Act** cycle for continuous improvement
- **Annex A** — 93 controls across 4 themes:
  - Organizational (37 controls)
  - People (8 controls)
  - Physical (14 controls)
  - Technological (34 controls)

### Common controls:
- Access control policies
- Cryptography usage
- Physical security
- Operations security
- Supplier relationships
- Incident management

---

## CIS Controls

The **Center for Internet Security** provides 18 prioritized security controls:

| # | Control | Priority |
|---|---------|----------|
| 1 | Inventory of Enterprise Assets | Basic |
| 2 | Inventory of Software Assets | Basic |
| 3 | Data Protection | Basic |
| 4 | Secure Configuration | Basic |
| 5 | Account Management | Basic |
| 6 | Access Control Management | Basic |
| 7 | Continuous Vulnerability Management | Foundational |
| 8 | Audit Log Management | Foundational |
| 9 | Email & Web Browser Protection | Foundational |
| 10 | Malware Defenses | Foundational |
| 11 | Data Recovery | Foundational |
| 12 | Network Infrastructure Management | Foundational |
| 13 | Network Monitoring & Defense | Foundational |
| 14 | Security Awareness Training | Foundational |
| 15 | Service Provider Management | Organizational |
| 16 | Application Software Security | Organizational |
| 17 | Incident Response Management | Organizational |
| 18 | Penetration Testing | Organizational |

---

## Other Notable Frameworks

| Framework | Focus | Used By |
|-----------|-------|---------|
| **SOC 2** | Service organization controls | SaaS companies |
| **PCI DSS** | Payment card data | Any business accepting cards |
| **HIPAA** | Healthcare data | Healthcare providers (US) |
| **GDPR** | Personal data privacy | Organizations handling EU data |
| **COBIT** | IT governance | Enterprises |
| **MITRE ATT&CK** | Adversary tactics & techniques | Threat hunters, red teams |

---

## Choosing a Framework

| Criteria | Recommendation |
|----------|---------------|
| US organization, general | NIST CSF |
| International, wants certification | ISO 27001 |
| Practical implementation steps | CIS Controls |
| Handles payment data | PCI DSS |
| Healthcare (US) | HIPAA |
| EU customer data | GDPR |

Many organizations use **multiple frameworks** together.

---

## Key Takeaways

- Frameworks provide structure and consistency for security programs
- **NIST CSF**: Identify, Protect, Detect, Respond, Recover
- **ISO 27001**: Certifiable international standard with 93 controls
- **CIS Controls**: Prioritized, actionable security steps
- Choose based on industry, geography, and regulatory requirements
- Frameworks guide effort — they don't replace thinking about your specific risks

---

Next, we move to **Network Security** — starting with **Networking Basics for Security** →
