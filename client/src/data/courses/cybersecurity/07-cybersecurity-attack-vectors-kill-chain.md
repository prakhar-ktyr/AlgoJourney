---
title: Attack Vectors & Kill Chain
---

# Attack Vectors & Kill Chain

Understand how attackers gain access and the stages of a cyber attack.

---

## What is an Attack Vector?

An **attack vector** is the path or method an attacker uses to gain access to a system.

| Vector | Description | Example |
|--------|-------------|---------|
| **Email** | Phishing, malicious attachments | Emotet distribution |
| **Web** | Exploit kits, drive-by downloads | Watering hole attacks |
| **Network** | Exploiting open ports, services | EternalBlue exploit |
| **Physical** | USB drops, tailgating | Stuxnet via USB |
| **Supply chain** | Compromising vendors/updates | SolarWinds |
| **Credentials** | Stolen/brute-forced passwords | Credential stuffing |
| **Insider** | Malicious or negligent employees | Data theft |
| **Wireless** | Rogue access points, evil twin | Wi-Fi eavesdropping |
| **Cloud** | Misconfigured services | Exposed S3 buckets |

---

## Attack Surface

The **attack surface** is the total number of points where an attacker can try to enter.

### Reducing attack surface:
- Close unnecessary ports and services
- Remove unused software
- Minimize user permissions
- Disable default accounts
- Segment networks
- Keep systems patched

---

## The Cyber Kill Chain

Developed by **Lockheed Martin**, the Kill Chain describes 7 stages of a cyber attack:

### 1. Reconnaissance
Attacker gathers information about the target.

- **Passive**: OSINT (LinkedIn, company website, DNS records, Shodan)
- **Active**: Port scanning, vulnerability scanning

### 2. Weaponization
Create or obtain the attack tool.

- Craft malicious PDF, Office macro, or exploit
- Pair an exploit with a backdoor (payload)
- Purchase malware from dark web markets

### 3. Delivery
Send the weapon to the target.

- Phishing email with attachment
- Compromised website (watering hole)
- Infected USB drive
- Malicious ad (malvertising)

### 4. Exploitation
Trigger the vulnerability.

- User opens malicious attachment
- Browser vulnerability executes code
- Unpatched server is exploited remotely

### 5. Installation
Install persistent access.

- Backdoor, RAT, or web shell
- Registry modification for persistence
- Scheduled task or service creation
- Rootkit installation

### 6. Command & Control (C2)
Establish communication with attacker's server.

- HTTP/HTTPS callbacks (blends with normal traffic)
- DNS tunneling
- Social media channels
- Encrypted channels

### 7. Actions on Objectives
The attacker achieves their goal.

- Data exfiltration
- Ransomware deployment
- Lateral movement to other systems
- Destruction or sabotage
- Espionage (long-term monitoring)

---

## Defending at Each Stage

| Kill Chain Stage | Defensive Actions |
|-----------------|-------------------|
| Reconnaissance | Limit public info, honeypots, monitor for scanning |
| Weaponization | Threat intelligence, keep informed about new exploits |
| Delivery | Email filtering, web proxies, endpoint protection |
| Exploitation | Patch management, application whitelisting |
| Installation | Endpoint detection, file integrity monitoring |
| C2 | Network monitoring, DNS filtering, egress filtering |
| Actions | Data loss prevention, network segmentation, backups |

**Breaking the chain at ANY stage stops the attack.**

---

## MITRE ATT&CK Framework

A more detailed alternative to the Kill Chain:

| Tactic | Description |
|--------|-------------|
| Reconnaissance | Gathering target info |
| Resource Development | Building attack infrastructure |
| Initial Access | Getting in (phishing, exploits) |
| Execution | Running malicious code |
| Persistence | Maintaining access |
| Privilege Escalation | Gaining higher permissions |
| Defense Evasion | Avoiding detection |
| Credential Access | Stealing passwords/tokens |
| Discovery | Learning the environment |
| Lateral Movement | Moving to other systems |
| Collection | Gathering target data |
| Exfiltration | Stealing data out |
| Impact | Disruption/destruction |

MITRE ATT&CK catalogs specific **techniques** under each tactic (hundreds of them).

---

## Real-World Example: NotPetya (2017)

```
1. Reconnaissance → Identified Ukrainian tax software (M.E.Doc)
2. Weaponization → Modified legitimate software update
3. Delivery → Pushed via software update mechanism
4. Exploitation → EternalBlue + credential harvesting
5. Installation → Replaced MBR, encrypted files
6. C2 → None needed (self-propagating worm)
7. Actions → Destruction (disguised as ransomware)

Damage: $10+ billion worldwide
```

---

## Key Takeaways

- **Attack vectors** are the paths attackers use to enter systems
- **Reduce attack surface** by minimizing exposed services and access
- The **Kill Chain** breaks attacks into 7 stages — defend at each
- **MITRE ATT&CK** provides a detailed taxonomy of attacker techniques
- Stopping an attack at ANY stage prevents the final objective
- Layered defense (defense in depth) is essential

---

Next, we'll learn about **Security Principles & Defense in Depth** →
