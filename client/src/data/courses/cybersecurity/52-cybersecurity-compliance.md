---
title: Compliance & Regulations
---

**Compliance** in cybersecurity means adhering to laws, regulations, and standards that govern how organizations protect sensitive data. While security is about protecting assets, compliance is about proving you meet specific legal and industry requirements.

---

## Compliance vs Security

| Aspect | Compliance | Security |
|--------|-----------|----------|
| Goal | Meet regulatory requirements | Protect assets from threats |
| Scope | Defined by external standards | Defined by risk assessment |
| Measurement | Pass/fail audits | Continuous improvement |
| Motivation | Avoid penalties and fines | Reduce actual risk |
| Focus | Documentation and controls | Detection and response |

Being compliant does not guarantee being secure — and being secure does not guarantee compliance. A mature organization aims for both.

---

## Major Regulations & Standards

### GDPR — General Data Protection Regulation

**Applies to:** Any organization handling EU citizens' personal data, regardless of location.

| Requirement | Description |
|-------------|-------------|
| Lawful Basis | Must have legal grounds to process data (consent, contract, etc.) |
| Data Minimization | Collect only what is necessary |
| Right to Access | Individuals can request their data |
| Right to Erasure | "Right to be forgotten" — delete data on request |
| Breach Notification | Report breaches to authorities within 72 hours |
| Data Protection Officer | Required for large-scale data processors |
| Privacy by Design | Build privacy into systems from the start |

**Penalties:** Up to €20 million or 4% of global annual revenue (whichever is higher).

---

### HIPAA — Health Insurance Portability and Accountability Act

**Applies to:** Healthcare providers, health plans, clearinghouses, and business associates in the United States.

| Rule | Key Requirements |
|------|-----------------|
| Privacy Rule | Controls who can access Protected Health Information (PHI) |
| Security Rule | Administrative, physical, and technical safeguards for ePHI |
| Breach Notification Rule | Notify individuals and HHS of breaches |
| Enforcement Rule | Procedures for investigations and penalties |

**Penalties:** $100 to $50,000 per violation; up to $1.5 million per year for repeated violations. Criminal penalties possible.

---

### PCI-DSS — Payment Card Industry Data Security Standard

**Applies to:** Any organization that stores, processes, or transmits cardholder data.

PCI-DSS has 12 core requirements organized into 6 goals:

| Goal | Requirements |
|------|-------------|
| Build Secure Network | 1. Install firewalls 2. Change default passwords |
| Protect Cardholder Data | 3. Protect stored data 4. Encrypt transmission |
| Vulnerability Management | 5. Use antivirus 6. Develop secure systems |
| Access Control | 7. Restrict access 8. Unique IDs 9. Physical access |
| Monitoring & Testing | 10. Track access 11. Test systems regularly |
| Security Policy | 12. Maintain an information security policy |

**Penalties:** Fines from $5,000 to $100,000/month until compliant; potential loss of ability to process cards.

---

### SOX — Sarbanes-Oxley Act

**Applies to:** Publicly traded companies in the United States.

| Section | Requirement |
|---------|-------------|
| Section 302 | CEO/CFO certify accuracy of financial reports |
| Section 404 | Internal controls over financial reporting must be assessed annually |
| Section 802 | Criminal penalties for altering/destroying records |
| Section 906 | Criminal penalties for false financial certifications |

SOX focuses on financial data integrity, but IT controls are critical since financial systems are digital.

**Penalties:** Up to $5 million in fines and 20 years imprisonment for willful violations.

---

### CCPA — California Consumer Privacy Act

**Applies to:** Businesses collecting personal information of California residents (with revenue > $25M, or handling data of 50,000+ consumers).

| Right | Description |
|-------|-------------|
| Right to Know | What data is collected and how it's used |
| Right to Delete | Request deletion of personal information |
| Right to Opt-Out | Opt out of sale of personal information |
| Right to Non-Discrimination | Equal service regardless of privacy choices |

**Penalties:** $2,500 per unintentional violation; $7,500 per intentional violation. Consumers can seek $100–$750 per incident in data breaches.

---

## Compliance Comparison

| Feature | GDPR | HIPAA | PCI-DSS | SOX | CCPA |
|---------|------|-------|---------|-----|------|
| Region | EU/Global | USA | Global | USA | California |
| Data Type | Personal data | Health data (PHI) | Payment card data | Financial data | Personal info |
| Breach Reporting | 72 hours | 60 days | Immediately | Varies | 45 days |
| Encryption Required | Recommended | Required for ePHI | Required in transit | Not specified | Recommended |
| Audit Frequency | Ongoing | Annual | Annual (or quarterly scans) | Annual | Ongoing |

---

## Audit Preparation

Preparing for a compliance audit involves systematic planning:

### 1. Scope Definition

Identify which systems, data, and processes are in scope for the regulation.

### 2. Gap Analysis

Compare current controls against requirements:

```text
Current State → Required State → Gap → Remediation Plan
```

### 3. Documentation

Maintain up-to-date records of:

- Security policies and procedures
- Risk assessments
- Incident response plans
- Access control lists
- Training records
- Vendor assessments

### 4. Evidence Collection

Gather proof that controls are operating effectively:

- System logs and audit trails
- Configuration screenshots
- Penetration test reports
- Employee training certificates

### 5. Remediation

Address any gaps before the audit:

- Prioritize by risk level
- Assign owners and deadlines
- Test fixes before the auditor arrives

### 6. Audit Execution

- Assign a point of contact for auditors
- Provide requested evidence promptly
- Document any findings and corrective actions

---

## Key Takeaways

- Compliance ensures organizations meet legal requirements for data protection
- Major frameworks include GDPR, HIPAA, PCI-DSS, SOX, and CCPA
- Each regulation targets specific data types and industries with different penalties
- Compliance does not equal security — both must be pursued together
- Audit preparation requires documentation, gap analysis, and remediation
- Breach notification timelines vary by regulation (72 hours to 60 days)

---

[Next: Secure Software Development Lifecycle](53-cybersecurity-ssdlc)
