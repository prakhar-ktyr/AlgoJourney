---
title: Security Operations Center
---

A **Security Operations Center (SOC)** is the centralized team responsible for monitoring, detecting, analyzing, and responding to cybersecurity incidents around the clock. Think of it as the "nerve center" of an organization's security posture.

---

## What Is a SOC?

A SOC combines people, processes, and technology to continuously monitor and improve an organization's security. The primary goals are:

- Detect threats in real time
- Respond to and contain incidents
- Minimize damage and recovery time
- Improve defenses over time

---

## SOC Roles & Tiers

SOC teams are typically organized into tiers based on skill level and responsibility:

| Role | Tier | Responsibilities |
|------|------|-----------------|
| SOC Analyst (Tier 1) | L1 | Monitor alerts, initial triage, escalate confirmed incidents |
| SOC Analyst (Tier 2) | L2 | Deep-dive investigation, correlate events, determine scope |
| SOC Analyst (Tier 3) | L3 | Threat hunting, advanced forensics, malware analysis |
| SOC Manager | — | Oversee operations, staffing, reporting to leadership |
| SOC Engineer | — | Maintain and tune tools, build detection rules, automate workflows |

### Tier 1 — Alert Monitoring & Triage

- Review incoming alerts from SIEM and IDS/IPS
- Determine if alerts are true or false positives
- Document findings and escalate confirmed threats

### Tier 2 — Incident Investigation

- Perform deeper analysis of escalated alerts
- Correlate data across multiple sources (logs, network traffic, endpoints)
- Determine the root cause and scope of an incident

### Tier 3 — Threat Hunting & Advanced Analysis

- Proactively search for hidden threats
- Reverse-engineer malware samples
- Develop new detection signatures and rules

---

## SOC Tools

| Tool Category | Examples | Purpose |
|--------------|----------|---------|
| SIEM | Splunk, Microsoft Sentinel, QRadar | Log aggregation, correlation, alerting |
| EDR | CrowdStrike, SentinelOne, Carbon Black | Endpoint detection and response |
| SOAR | Palo Alto XSOAR, Swimlane | Automate playbooks and response |
| Threat Intel | MISP, VirusTotal, AlienVault OTX | Enrich alerts with context |
| Ticketing | Jira, ServiceNow | Track incidents through resolution |
| Network Monitoring | Zeek, Wireshark, Suricata | Inspect network traffic |

---

## Alert Triage Process

When an alert fires, analysts follow a structured triage workflow:

1. **Receive** — Alert appears in the SIEM dashboard
2. **Classify** — Determine severity (Critical, High, Medium, Low)
3. **Validate** — Check if it's a true positive or false positive
4. **Enrich** — Add context (threat intel, asset info, user behavior)
5. **Escalate or Close** — Pass to Tier 2 or mark as resolved

```text
Alert Fired → Classify Severity → Validate (T/F Positive)
    → Enrich with Context → Escalate / Close
```

---

## Playbooks

A **playbook** is a predefined set of steps for handling a specific type of incident. They ensure consistent, repeatable responses.

Example — Phishing Playbook:

1. Quarantine the email
2. Identify all recipients
3. Check if any user clicked the link
4. Block the malicious URL/domain
5. Reset credentials for affected users
6. Document and report

Playbooks can be manual or automated using SOAR tools.

---

## SOC Metrics

Measuring SOC performance helps identify gaps and justify investments:

| Metric | Full Name | What It Measures |
|--------|-----------|-----------------|
| MTTD | Mean Time to Detect | Average time from breach to detection |
| MTTR | Mean Time to Respond | Average time from detection to containment |
| MTTC | Mean Time to Contain | Average time to fully contain a threat |
| False Positive Rate | — | Percentage of alerts that are not real threats |
| Alert Volume | — | Total alerts processed per day/week |
| Escalation Rate | — | Percentage of alerts escalated to Tier 2+ |

Lower MTTD and MTTR values indicate a more effective SOC.

---

## Building vs Outsourcing a SOC

| Factor | In-House SOC | Outsourced (MSSP) |
|--------|-------------|-------------------|
| Cost | High upfront (staff, tools, infrastructure) | Predictable monthly fee |
| Control | Full control over operations | Less direct control |
| Customization | Tailored to organization | Standardized offerings |
| Staffing | Must recruit and retain talent | Provider handles staffing |
| 24/7 Coverage | Expensive to maintain | Included in service |
| Best For | Large enterprises with budget | SMBs or as a supplement |

Many organizations use a **hybrid model** — handling critical operations in-house while outsourcing Tier 1 monitoring to a Managed Security Service Provider (MSSP).

---

## Key Takeaways

- A SOC is the centralized hub for detecting and responding to security incidents
- Analysts are organized into tiers (L1–L3) with increasing expertise
- SIEM, EDR, and SOAR are the core technology pillars of a modern SOC
- Playbooks ensure consistent incident response across the team
- MTTD and MTTR are the most critical performance metrics
- Organizations can build, outsource, or use a hybrid SOC model

---

[Next: Compliance & Regulations](52-cybersecurity-compliance)
