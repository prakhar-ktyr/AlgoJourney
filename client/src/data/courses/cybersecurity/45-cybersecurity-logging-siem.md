---
title: Logging & SIEM
---

# Logging & SIEM

Effective logging and Security Information and Event Management (SIEM) are the backbone of threat detection. Without proper logs and analysis, attacks go unnoticed until damage is done.

---

## Why Logging Matters

| Without Logging | With Logging |
|---|---|
| Attacks go undetected | Anomalies trigger alerts |
| No forensic evidence | Full audit trail for investigation |
| Compliance failures | Meets regulatory requirements |
| Blind spots in infrastructure | Visibility across all systems |

---

## What to Log

Not everything needs to be logged, but critical security events must be captured.

### Must-Log Events

| Category | Events |
|---|---|
| Authentication | Login success/failure, MFA events, password changes |
| Authorization | Access denied, privilege escalation, role changes |
| Data access | File reads/writes, database queries on sensitive tables |
| System changes | Config modifications, service starts/stops, patches |
| Network | Firewall allow/deny, DNS queries, connection attempts |
| Application | Errors, input validation failures, API calls |
| Admin actions | User creation, permission grants, policy changes |

### What NOT to Log

| Avoid Logging | Reason |
|---|---|
| Passwords/secrets | Security risk if logs are exposed |
| Full credit card numbers | PCI-DSS violation |
| Health information | HIPAA violation |
| Excessive debug data | Storage costs, noise |

---

## Log Formats

### Structured vs Unstructured

```
# Unstructured (hard to parse)
May 02 10:23:45 webserver sshd[1234]: Failed password for admin from 192.168.1.100 port 4567

# Structured JSON (easy to parse and query)
{
  "timestamp": "2026-05-02T10:23:45Z",
  "source": "webserver",
  "service": "sshd",
  "pid": 1234,
  "event": "authentication_failure",
  "user": "admin",
  "source_ip": "192.168.1.100",
  "source_port": 4567,
  "severity": "warning"
}
```

### Common Log Formats

| Format | Use Case |
|---|---|
| Syslog (RFC 5424) | Linux/Unix system logs |
| CEF (Common Event Format) | Security device logs |
| JSON/NDJSON | Application logs, cloud services |
| Windows Event Log (EVTX) | Windows system/security events |
| CLF/Combined | Web server access logs |

### Application Logging Best Practice

```javascript
// Structured logging with context
const logger = require("pino")();

logger.info({
  event: "user_login",
  userId: user.id,
  sourceIp: req.ip,
  userAgent: req.headers["user-agent"],
  mfaUsed: true,
  timestamp: new Date().toISOString()
});

// Security event logging
logger.warn({
  event: "authorization_failure",
  userId: user.id,
  resource: "/api/admin/users",
  action: "DELETE",
  reason: "insufficient_permissions"
});
```

---

## Centralized Logging

Sending logs to a central location enables correlation, long-term retention, and tamper resistance.

### Architecture

```
┌──────────┐     ┌──────────────┐     ┌───────────────┐
│  Servers  │────▶│  Log Shipper  │────▶│  Central Store │
│  Apps     │     │  (Filebeat,   │     │  (Elasticsearch│
│  Network  │     │   Fluentd)    │     │   Splunk, S3)  │
└──────────┘     └──────────────┘     └───────────────┘
                                              │
                                              ▼
                                      ┌───────────────┐
                                      │  SIEM / Kibana │
                                      │  (Analysis &   │
                                      │   Alerting)    │
                                      └───────────────┘
```

### Popular Stacks

| Stack | Components | Best For |
|---|---|---|
| ELK/Elastic | Elasticsearch + Logstash + Kibana | Open source, flexible |
| Splunk | Splunk Enterprise/Cloud | Enterprise, powerful SPL |
| Graylog | Graylog + MongoDB + Elasticsearch | Mid-size organizations |
| Loki + Grafana | Loki + Promtail + Grafana | Cloud-native, cost-effective |
| AWS native | CloudWatch Logs + Athena | AWS environments |

### Filebeat Configuration Example

```yaml
# /etc/filebeat/filebeat.yml
filebeat.inputs:
- type: log
  enabled: true
  paths:
    - /var/log/auth.log
    - /var/log/syslog
  fields:
    log_type: system

- type: log
  enabled: true
  paths:
    - /var/log/nginx/access.log
  fields:
    log_type: webserver

output.elasticsearch:
  hosts: ["https://elk.internal:9200"]
  username: "filebeat_writer"
  password: "${ES_PASSWORD}"
  ssl.certificate_authorities: ["/etc/pki/ca.pem"]
```

---

## SIEM (Security Information and Event Management)

A SIEM collects, normalizes, correlates, and analyzes security events from across the organization.

### Core SIEM Functions

| Function | Description |
|---|---|
| Collection | Ingest logs from all sources |
| Normalization | Convert diverse formats to common schema |
| Correlation | Link related events across sources |
| Alerting | Notify analysts of suspicious patterns |
| Dashboards | Visualize security posture |
| Retention | Store logs for compliance/investigation |

### Correlation Rules

Correlation rules detect attack patterns by combining multiple events:

```
# Brute force detection
RULE: brute_force_login
  IF count(authentication_failure) > 10
  WHERE source_ip = same
  AND target_user = same
  WITHIN 5 minutes
  THEN alert(severity=HIGH, message="Possible brute force attack")

# Impossible travel
RULE: impossible_travel
  IF authentication_success FROM location_A
  AND authentication_success FROM location_B
  WHERE user = same
  AND geo_distance(location_A, location_B) > 500km
  AND time_diff < 1 hour
  THEN alert(severity=CRITICAL, message="Impossible travel detected")

# Lateral movement
RULE: lateral_movement
  IF authentication_success TO multiple_hosts > 5
  WHERE source_user = same
  AND source_host = internal
  WITHIN 10 minutes
  THEN alert(severity=HIGH, message="Potential lateral movement")
```

### Splunk SPL Example

```spl
# Find failed logins followed by success (credential stuffing)
index=auth sourcetype=linux_secure
| transaction user maxspan=10m
| where eventcount > 5
| search "Failed password" AND "Accepted password"
| table _time, user, src_ip, eventcount
```

---

## Alert Tuning

Raw SIEM alerts generate excessive noise. Tuning reduces false positives so analysts focus on real threats.

| Problem | Solution |
|---|---|
| Too many alerts (alert fatigue) | Tune thresholds based on baseline |
| Known-good activity triggering | Add whitelist/exclusion rules |
| Low-value alerts | Suppress or reduce severity |
| Missing context | Enrich alerts with asset/user data |
| No prioritization | Map alerts to risk scores |

### Tuning Process

1. **Baseline** — Understand normal behavior for your environment
2. **Threshold adjustment** — Set detection thresholds above normal noise
3. **Whitelist** — Exclude known-good IPs, users, services
4. **Enrichment** — Add asset criticality, user role, threat intel context
5. **Review** — Continuously review false positive rates weekly

---

## SOC Operations

A Security Operations Center (SOC) is the team that monitors, detects, and responds to security incidents using the SIEM.

### SOC Tiers

| Tier | Role | Responsibilities |
|---|---|---|
| Tier 1 | Alert Analyst | Triage alerts, escalate true positives |
| Tier 2 | Incident Responder | Investigate, contain, remediate |
| Tier 3 | Threat Hunter | Proactive hunting, advanced analysis |
| SOC Manager | Leadership | Metrics, process improvement, staffing |

### Key SOC Metrics

| Metric | Description | Target |
|---|---|---|
| MTTD | Mean Time to Detect | < 24 hours |
| MTTR | Mean Time to Respond | < 4 hours |
| Alert-to-Incident ratio | True positives vs total alerts | > 20% |
| False positive rate | Alerts that aren't real threats | < 80% |

---

## Key Takeaways

- Log authentication, authorization, data access, and administrative actions at minimum
- Use structured logging (JSON) for easy parsing and correlation
- Centralize logs to prevent tampering and enable cross-source analysis
- SIEM correlation rules detect complex attack patterns from individual events
- Alert tuning is critical — untuned SIEMs create alert fatigue that causes real threats to be missed
- SOC teams operate in tiers, with metrics-driven improvement cycles

---

[Next: Vulnerability Scanning & Patch Management](46-cybersecurity-vulnerability-management)
