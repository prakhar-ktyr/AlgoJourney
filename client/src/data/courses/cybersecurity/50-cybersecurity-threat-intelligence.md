---
title: Threat Intelligence
---

# Threat Intelligence

Threat intelligence is evidence-based knowledge about threats — including context, mechanisms, indicators, and actionable advice — that helps organizations make informed security decisions.

---

## What is Threat Intelligence?

Threat intelligence transforms raw data into actionable information:

```
Raw Data → Information → Intelligence → Action

Example:
IP 203.0.113.50 → Seen in malware C2 → APT29 campaign targeting finance sector → Block IP, hunt for related IOCs
```

---

## Types of Threat Intelligence

| Type | Audience | Timeframe | Example |
|---|---|---|---|
| Strategic | Executives, board | Long-term (months/years) | "Nation-state actors are targeting our industry" |
| Tactical | Security architects | Medium-term (weeks/months) | "Attackers are using spear-phishing with .iso attachments" |
| Operational | IR teams, SOC | Short-term (hours/days) | "APT group X is actively exploiting CVE-2024-1234" |
| Technical | SOC analysts, tools | Immediate (minutes/hours) | "Block hash abc123..., domain evil.com, IP 1.2.3.4" |

### Intelligence Lifecycle

```
┌────────────┐    ┌────────────┐    ┌────────────┐
│  Direction  │──▶│ Collection  │──▶│ Processing  │
│  (Planning) │   │  (Gather)   │   │  (Normalize)│
└────────────┘    └────────────┘    └────────────┘
       ▲                                    │
       │                                    ▼
┌────────────┐    ┌────────────┐    ┌────────────┐
│  Feedback   │◀──│Dissemination│◀──│  Analysis   │
│             │   │ (Share)     │   │ (Interpret) │
└────────────┘    └────────────┘    └────────────┘
```

---

## Intelligence Sources

### Open Source Intelligence (OSINT)

| Source | Examples | Intelligence Type |
|---|---|---|
| Threat feeds | AlienVault OTX, Abuse.ch, VirusTotal | IOCs (IPs, hashes, domains) |
| Vulnerability databases | NVD, CVE, Exploit-DB | Vulnerability intelligence |
| Vendor reports | CrowdStrike, Mandiant, Microsoft | Campaign details, TTPs |
| Government advisories | CISA, NCSC, CERT | Critical vulnerability alerts |
| Security blogs | Krebs on Security, The DFIR Report | Incident analysis |
| Social media | Twitter/X (security researchers) | Early warnings, zero-days |

### Commercial Intelligence

| Provider | Strength |
|---|---|
| CrowdStrike | APT tracking, adversary intelligence |
| Recorded Future | Large-scale collection, risk scoring |
| Mandiant | Incident-derived intelligence |
| Intel 471 | Underground/criminal intelligence |

### Dark Web Monitoring

| Source | Intelligence Value |
|---|---|
| Forums | Exploit sales, leaked data, attack planning |
| Marketplaces | Stolen credentials, access brokers |
| Paste sites | Dumped databases, leaked documents |
| Telegram channels | Tool sharing, attack coordination |

---

## Indicators of Compromise (IOCs)

IOCs are forensic artifacts that identify malicious activity.

### IOC Types (Pyramid of Pain)

```
            ┌─────────┐
            │  TTPs    │  ← Hardest to change (most valuable)
           ┌┴─────────┴┐
           │   Tools    │
          ┌┴───────────┴┐
          │  Procedures  │
         ┌┴─────────────┴┐
         │ Network/Host   │
         │  Artifacts     │
        ┌┴───────────────┴┐
        │  Domain Names    │
       ┌┴─────────────────┴┐
       │    IP Addresses    │
      ┌┴───────────────────┴┐
      │     Hash Values      │  ← Easiest to change (least valuable)
      └─────────────────────┘
```

| IOC Type | Example | Difficulty for Attacker to Change |
|---|---|---|
| File hash | `sha256:a1b2c3d4...` | Trivial (recompile) |
| IP address | `203.0.113.50` | Easy (new server) |
| Domain | `evil-update.com` | Easy (new domain) |
| Network artifact | User-Agent string, JA3 hash | Moderate |
| Host artifact | Registry keys, file paths | Moderate |
| Tools | Custom malware family | Hard |
| TTPs | Spear-phishing → PowerShell → lateral movement | Very hard |

### Using IOCs Operationally

```bash
# Search firewall logs for known malicious IPs
grep -f malicious_ips.txt /var/log/firewall.log

# Search for malicious file hashes
find / -type f -exec sha256sum {} \; | grep -f malicious_hashes.txt

# YARA rule for detecting malware family
rule APT29_Dropper {
    meta:
        description = "Detects APT29 initial dropper"
        author = "Threat Intel Team"
        date = "2026-05-02"
    strings:
        $s1 = "WinHttpConnect" ascii
        $s2 = {48 8B 05 ?? ?? ?? ?? 48 89 44 24}
        $s3 = "Mozilla/5.0" ascii
    condition:
        uint16(0) == 0x5A4D and all of them
}
```

---

## Threat Hunting

Threat hunting is the proactive search for threats that have evaded automated detection.

### Hunting Approaches

| Approach | Description | Example |
|---|---|---|
| Hypothesis-driven | Start with a theory based on intelligence | "APT28 targets our sector via OAuth phishing" |
| IOC-based | Search for known indicators | "Has hash X appeared on any endpoint?" |
| Anomaly-based | Look for deviations from baseline | "Which accounts logged in from unusual locations?" |
| TTP-based | Search for attacker techniques | "Which processes spawned PowerShell with encoded commands?" |

### Hunt Example: Living Off the Land

```sql
-- Hunt for suspicious PowerShell execution (Splunk SPL)
index=endpoint sourcetype=sysmon EventCode=1
| where process_name="powershell.exe" OR process_name="pwsh.exe"
| where match(command_line, "(?i)(encodedcommand|bypass|hidden|downloadstring|invoke-expression)")
| stats count by host, user, command_line, parent_process
| where count < 3
| sort -count
```

```sql
-- Hunt for unusual service creation (potential persistence)
index=windows sourcetype=WinEventLog:Security EventCode=7045
| where NOT match(service_name, "(Windows|Microsoft|Dell|Intel)")
| stats count by host, service_name, service_file_name
| sort -count
```

---

## STIX and TAXII

### STIX (Structured Threat Information Expression)

STIX is a standardized language for describing cyber threat intelligence in a machine-readable format.

```json
{
  "type": "indicator",
  "spec_version": "2.1",
  "id": "indicator--a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "created": "2026-05-02T10:00:00Z",
  "modified": "2026-05-02T10:00:00Z",
  "name": "Malicious IP - APT29 C2 Server",
  "description": "Command and control server used in APT29 campaign targeting financial sector",
  "pattern": "[ipv4-addr:value = '203.0.113.50']",
  "pattern_type": "stix",
  "valid_from": "2026-05-01T00:00:00Z",
  "indicator_types": ["malicious-activity"],
  "kill_chain_phases": [
    {
      "kill_chain_name": "mitre-attack",
      "phase_name": "command-and-control"
    }
  ]
}
```

### STIX Domain Objects

| Object | Purpose |
|---|---|
| Attack Pattern | Describes a TTP |
| Campaign | Named set of malicious activities |
| Indicator | Pattern to detect threat activity |
| Malware | Describes malicious software |
| Threat Actor | Individuals or groups |
| Vulnerability | CVE reference with context |
| Relationship | Links between objects |

### TAXII (Trusted Automated Exchange of Intelligence Information)

TAXII is the transport protocol for sharing STIX intelligence between systems.

| TAXII Concept | Description |
|---|---|
| Server | Hosts threat intelligence collections |
| Collection | A set of STIX objects (e.g., "APT Indicators") |
| Channel | Publish/subscribe model for real-time sharing |
| API Root | Base URL for TAXII services |

```bash
# Discover TAXII server collections
curl -H "Accept: application/taxii+json;version=2.1" \
     https://taxii.example.com/taxii2/

# Get objects from a collection
curl -H "Accept: application/stix+json;version=2.1" \
     https://taxii.example.com/taxii2/collections/abc123/objects/
```

---

## MITRE ATT&CK Framework

ATT&CK catalogs adversary tactics, techniques, and procedures based on real-world observations.

### ATT&CK Matrix Structure

| Tactic (WHY) | Techniques (HOW) | Examples |
|---|---|---|
| Initial Access | Phishing, exploit public-facing app | Spear-phishing link |
| Execution | PowerShell, command-line | Encoded PowerShell |
| Persistence | Registry run keys, scheduled tasks | New service creation |
| Privilege Escalation | Exploit vulnerability, token manipulation | UAC bypass |
| Defense Evasion | Obfuscation, disable security tools | Process injection |
| Credential Access | Credential dumping, keylogging | Mimikatz |
| Discovery | Network scanning, account discovery | `net user /domain` |
| Lateral Movement | Remote services, pass-the-hash | PsExec, RDP |
| Collection | Data staged, screen capture | Archive collected data |
| Exfiltration | Over C2 channel, cloud storage | Encrypted exfil |
| Command & Control | Web protocols, DNS tunneling | HTTPS beaconing |
| Impact | Data encryption, wiper | Ransomware |

### Mapping Intelligence to ATT&CK

```
Threat Report: "APT29 uses spear-phishing with ISO attachments containing
LNK files that execute PowerShell to download Cobalt Strike beacons
communicating over HTTPS"

ATT&CK Mapping:
├── T1566.001 - Phishing: Spear-Phishing Attachment (Initial Access)
├── T1204.002 - User Execution: Malicious File (Execution)
├── T1059.001 - PowerShell (Execution)
├── T1105     - Ingress Tool Transfer (Command and Control)
├── T1071.001 - Web Protocols: HTTPS (Command and Control)
└── T1573.002 - Encrypted Channel: Asymmetric Crypto (Command and Control)
```

### Using ATT&CK for Defense

| Use Case | How |
|---|---|
| Gap analysis | Map current detections to ATT&CK — find uncovered techniques |
| Detection engineering | Write rules for techniques used by relevant threat actors |
| Red team planning | Emulate specific adversary TTPs |
| Vendor evaluation | Compare product coverage against ATT&CK |
| Reporting | Communicate threats using common language |

---

## Building a Threat Intelligence Program

| Maturity Level | Characteristics |
|---|---|
| Level 1 | Consume free feeds, block IOCs reactively |
| Level 2 | Integrate feeds into SIEM, basic correlation |
| Level 3 | Proactive hunting, CTI team, custom intelligence |
| Level 4 | Intelligence-driven defense, share intelligence, influence strategy |

---

## Key Takeaways

- Threat intelligence turns raw data into actionable insights for decision-making at all organizational levels
- The Pyramid of Pain shows that TTPs are more valuable than simple IOCs like hashes or IPs
- STIX/TAXII provide standardized formats for machine-readable intelligence sharing
- MITRE ATT&CK maps real-world adversary behavior to a common framework for detection and defense
- Threat hunting proactively searches for threats that bypass automated detection
- Start with free OSINT feeds and mature toward proactive, intelligence-driven security operations

---

[Next: Course Complete — Continue practicing with hands-on labs and CTF challenges!]
