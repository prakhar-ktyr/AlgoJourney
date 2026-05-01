---
title: Incident Response & Forensics
---

# Incident Response & Forensics

When a security incident occurs, the speed and quality of the response determines the extent of damage. Incident Response (IR) is the structured approach to handling security breaches, while digital forensics provides the evidence for understanding what happened.

---

## What is a Security Incident?

A security incident is any event that compromises the confidentiality, integrity, or availability of information or systems.

| Event Type | Example |
|---|---|
| Data breach | Unauthorized access to customer database |
| Malware infection | Ransomware encrypting critical files |
| Account compromise | Attacker using stolen credentials |
| Denial of service | DDoS flooding web servers |
| Insider threat | Employee exfiltrating intellectual property |
| System compromise | Web shell deployed on production server |

---

## The NIST Incident Response Lifecycle

The NIST SP 800-61 framework defines four phases of incident response:

```
┌───────────────┐    ┌───────────────────┐    ┌─────────────────────────┐
│  Preparation   │──▶│  Detection &       │──▶│  Containment,            │
│                │   │  Analysis          │   │  Eradication & Recovery  │
└───────────────┘    └───────────────────┘    └─────────────────────────┘
       ▲                                                   │
       │              ┌───────────────────┐                │
       └──────────────│  Post-Incident     │◀───────────────┘
                      │  Activity          │
                      └───────────────────┘
```

---

## Phase 1: Preparation

Preparation happens **before** an incident. It ensures the team can respond effectively under pressure.

| Activity | Description |
|---|---|
| IR Plan | Documented procedures, roles, communication templates |
| IR Team (CSIRT) | Designated responders with defined responsibilities |
| Tools & Resources | Forensic workstations, imaging tools, jump bags |
| Contact Lists | Legal, PR, management, law enforcement, vendors |
| Playbooks | Step-by-step guides for common incident types |
| Training | Tabletop exercises, simulations, skill development |
| Logging | Ensure adequate logging is in place across systems |

### IR Team Roles

| Role | Responsibility |
|---|---|
| Incident Commander | Overall coordination and decision-making |
| Lead Analyst | Technical investigation and triage |
| Communications | Internal/external notifications |
| Legal Counsel | Compliance obligations, evidence preservation |
| System Owners | Provide context on affected systems |
| Forensics Analyst | Evidence collection and analysis |

---

## Phase 2: Detection and Analysis

### Detection Sources

| Source | What It Detects |
|---|---|
| SIEM alerts | Correlation-based anomalies |
| EDR alerts | Endpoint behavioral detections |
| IDS/IPS | Network-based attack signatures |
| User reports | Phishing, suspicious activity |
| Threat intelligence | IOCs matching internal telemetry |
| Log analysis | Authentication anomalies, data access patterns |

### Incident Classification

| Severity | Criteria | Response Time |
|---|---|---|
| Critical (P1) | Active data breach, ransomware, complete system compromise | Immediate (< 1 hour) |
| High (P2) | Account compromise, malware outbreak, targeted attack | < 4 hours |
| Medium (P3) | Isolated malware, policy violation, phishing success | < 24 hours |
| Low (P4) | Attempted attack blocked, minor policy violation | Next business day |

### Analysis Checklist

```markdown
## Initial Triage Questions
- [ ] What systems are affected?
- [ ] What type of incident is this? (malware, breach, DoS, etc.)
- [ ] When did it start? (earliest known indicator)
- [ ] Is the attack still active?
- [ ] What data/systems are at risk?
- [ ] What is the business impact?
- [ ] Are there IOCs to search across other systems?
```

---

## Phase 3: Containment

Stop the bleeding without destroying evidence.

### Short-Term Containment

| Action | Purpose |
|---|---|
| Isolate affected host | Prevent lateral movement |
| Block malicious IPs/domains | Stop C2 communication |
| Disable compromised accounts | Prevent further unauthorized access |
| DNS sinkhole | Redirect malicious domains |
| Network segmentation | Limit attacker's reach |

### Long-Term Containment

| Action | Purpose |
|---|---|
| Rebuild from known-good state | Ensure clean systems |
| Patch exploited vulnerability | Close the entry point |
| Enhance monitoring | Detect if attacker returns |
| Credential rotation | Invalidate stolen credentials |

### Containment Decision Matrix

| Factor | Isolate Immediately | Monitor First |
|---|---|---|
| Active data exfiltration | ✅ | |
| Ransomware spreading | ✅ | |
| Single compromised user | | ✅ (assess scope) |
| Suspected APT | | ✅ (understand full footprint) |
| Critical production system | Case-by-case | Case-by-case |

---

## Phase 4: Eradication

Remove all traces of the attacker and vulnerability from the environment.

| Activity | Details |
|---|---|
| Remove malware | Delete malicious files, clean registry entries |
| Close entry point | Patch vulnerability, fix misconfiguration |
| Remove persistence | Delete backdoor accounts, SSH keys, scheduled tasks |
| Verify removal | Scan with multiple tools, review logs |
| Harden | Apply additional security controls |

---

## Phase 5: Recovery

Restore systems to normal operation with confidence they are clean.

| Step | Description |
|---|---|
| Restore from backup | Use verified clean backups |
| Rebuild systems | Reimage from gold standard |
| Gradual reconnection | Bring systems back online in phases |
| Enhanced monitoring | Watch for indicators of reinfection |
| Validation testing | Verify all services function correctly |
| User communication | Notify affected parties when services resume |

---

## Phase 6: Lessons Learned

Conduct a post-incident review within 1-2 weeks of resolution.

### Post-Incident Review Questions

| Question | Purpose |
|---|---|
| What happened and when? | Build accurate timeline |
| How was it detected? | Improve detection capabilities |
| What worked well? | Reinforce successful practices |
| What failed or was slow? | Identify improvement areas |
| What was the root cause? | Address systemic issues |
| What changes are needed? | Assign action items |

---

## Digital Forensics Basics

Digital forensics is the scientific collection, preservation, and analysis of digital evidence.

### Forensic Principles

| Principle | Description |
|---|---|
| Preservation | Maintain evidence integrity |
| Chain of custody | Document who handled evidence and when |
| Reproducibility | Others must be able to verify findings |
| Minimal impact | Avoid modifying original evidence |
| Documentation | Record every action taken |

### Order of Volatility

Collect evidence from most volatile to least volatile:

| Priority | Source | Volatility |
|---|---|---|
| 1 | CPU registers, cache | Seconds |
| 2 | RAM (running processes, network connections) | Power loss |
| 3 | Network state (routing tables, ARP cache) | Minutes |
| 4 | Running processes | Minutes |
| 5 | Disk (filesystem, deleted files) | Persistent |
| 6 | Backup media | Persistent |
| 7 | External logs (SIEM, network captures) | Persistent |

### Evidence Collection

```bash
# Capture volatile data FIRST (Linux)

# Memory dump
sudo avml /evidence/memory_dump.lime
# or
sudo dd if=/dev/mem of=/evidence/memory.raw bs=1M

# Running processes
ps auxf > /evidence/processes.txt

# Network connections
netstat -tlnp > /evidence/network_connections.txt
ss -tulnp >> /evidence/network_connections.txt

# Active users
w > /evidence/active_users.txt
last -a > /evidence/login_history.txt

# Then create forensic disk image
sudo dc3dd if=/dev/sda of=/evidence/disk.img hash=sha256 log=/evidence/dc3dd.log
```

### Evidence Handling

```
┌────────────────────────────────────────────────┐
│            Chain of Custody Form                 │
├─────────────┬──────────────────────────────────┤
│ Case ID     │ INC-2026-0502-001                │
│ Evidence    │ Dell Latitude 5520 (SN: ABC123)  │
│ Collected   │ 2026-05-02 14:30 UTC             │
│ Collected by│ Jane Smith (Forensic Analyst)     │
│ Hash (SHA256)│ a3f2b1c9d8e7...                  │
│ Storage     │ Evidence locker #3, Shelf B      │
├─────────────┼──────────────────────────────────┤
│ Transfer Log│                                  │
│ 2026-05-02  │ Smith → Evidence Locker          │
│ 2026-05-03  │ Evidence Locker → Lab Station 2  │
│ 2026-05-05  │ Lab Station 2 → Evidence Locker  │
└─────────────┴──────────────────────────────────┘
```

---

## Common Forensic Tools

| Tool | Purpose | License |
|---|---|---|
| Autopsy/Sleuth Kit | Disk forensics, file recovery | Open source |
| Volatility | Memory forensics | Open source |
| FTK Imager | Disk imaging | Free |
| Wireshark | Network packet analysis | Open source |
| KAPE | Artifact collection (Windows) | Free |
| Velociraptor | Endpoint forensics at scale | Open source |
| Plaso/log2timeline | Timeline creation from artifacts | Open source |

---

## Key Takeaways

- Incident response follows a lifecycle: Preparation → Detection → Containment → Eradication → Recovery → Lessons Learned
- Preparation is the most important phase — you cannot build a process during a crisis
- Containment must balance stopping the attack with preserving forensic evidence
- Follow the order of volatility when collecting evidence — RAM before disk
- Chain of custody must be maintained for evidence to hold legal value
- Post-incident reviews drive continuous improvement of security posture
- Document everything during an incident — timestamps, actions, decisions, and rationale

---

[Next: Threat Intelligence](50-cybersecurity-threat-intelligence)
