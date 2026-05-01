---
title: Penetration Testing Basics
---

# Penetration Testing Basics

A **penetration test** (pentest) is an authorized simulated attack against a system to evaluate its security. Unlike vulnerability scanning, pentesting involves active exploitation to demonstrate real-world impact.

---

## Types of Penetration Tests

### By Knowledge Level

| Type | Tester Knowledge | Simulates |
|---|---|---|
| Black Box | No internal knowledge | External attacker |
| White Box | Full access (source code, architecture, credentials) | Insider threat or advanced attacker |
| Gray Box | Partial knowledge (user credentials, some documentation) | Compromised user or partner |

### By Target

| Target | Scope |
|---|---|
| Network | External/internal infrastructure, services, devices |
| Web Application | OWASP Top 10, business logic flaws |
| Mobile | iOS/Android apps, API calls, local storage |
| Wireless | Wi-Fi, Bluetooth, NFC attacks |
| Social Engineering | Phishing, vishing, physical access |
| Cloud | Misconfigurations, IAM, serverless |
| Red Team | Full-scope attack simulation (people + process + technology) |

---

## Penetration Testing Methodology

### Phase 1: Reconnaissance (Information Gathering)

Collect as much information as possible about the target.

| Technique | Type | Tools |
|---|---|---|
| WHOIS lookup | Passive | whois, ARIN |
| DNS enumeration | Passive/Active | dig, dnsenum, subfinder |
| Google dorking | Passive | Google search operators |
| Social media OSINT | Passive | LinkedIn, theHarvester |
| Port scanning | Active | Nmap |
| Service fingerprinting | Active | Nmap, Wappalyzer |

```bash
# Subdomain enumeration
subfinder -d target.com -silent | sort -u > subdomains.txt

# DNS zone transfer attempt
dig axfr target.com @ns1.target.com

# Google dorking for exposed files
# site:target.com filetype:pdf
# site:target.com inurl:admin
# site:target.com intitle:"index of"
```

### Phase 2: Scanning and Enumeration

Actively probe discovered targets for services and vulnerabilities.

```bash
# Comprehensive Nmap scan
nmap -sC -sV -O -p- --min-rate=1000 -oA full_scan 192.168.1.0/24

# Flags explained:
# -sC: Default scripts (service detection, vuln checks)
# -sV: Version detection
# -O:  OS detection
# -p-: All 65535 ports
# --min-rate=1000: Speed up scan
# -oA: Output in all formats

# Web directory enumeration
gobuster dir -u https://target.com -w /usr/share/wordlists/dirb/common.txt -t 50

# SMB enumeration
enum4linux -a 192.168.1.50
```

### Phase 3: Exploitation

Attempt to exploit discovered vulnerabilities to gain unauthorized access.

| Vulnerability | Exploitation Method |
|---|---|
| SQL Injection | Extract data, bypass authentication |
| Unpatched service | Use known exploit (Metasploit/manual) |
| Weak credentials | Brute force, credential stuffing |
| Misconfiguration | Exploit default settings |
| File upload flaw | Upload web shell |

```bash
# Metasploit framework example
msfconsole

# Search for an exploit
msf6> search type:exploit name:apache

# Use an exploit module
msf6> use exploit/multi/http/apache_mod_cgi_bash_env_exec
msf6> set RHOSTS 192.168.1.50
msf6> set LHOST 192.168.1.100
msf6> run
```

### Phase 4: Post-Exploitation

After gaining access, determine the impact and attempt to expand access.

| Activity | Purpose |
|---|---|
| Privilege escalation | Gain admin/root access |
| Lateral movement | Access other systems |
| Data exfiltration | Demonstrate data breach impact |
| Persistence | Show how an attacker would maintain access |
| Credential harvesting | Extract stored passwords/tokens |

```bash
# Linux privilege escalation enumeration
# Check sudo permissions
sudo -l

# Find SUID binaries
find / -perm -4000 -type f 2>/dev/null

# Check for writable cron jobs
ls -la /etc/cron*

# Windows privilege escalation
# Check current privileges
whoami /priv

# Find unquoted service paths
wmic service get name,pathname,startmode | findstr /i "auto" | findstr /v "C:\Windows"
```

### Phase 5: Reporting

The report is the most important deliverable. It translates technical findings into actionable information.

| Report Section | Content |
|---|---|
| Executive Summary | Business impact in non-technical language |
| Scope and Methodology | What was tested and how |
| Findings | Each vulnerability with evidence |
| Risk Rating | Severity and business impact |
| Recommendations | Specific remediation steps |
| Appendices | Raw scan data, screenshots, proof-of-concept |

---

## Essential Penetration Testing Tools

| Category | Tool | Purpose |
|---|---|---|
| Scanning | Nmap | Port scanning, service detection |
| Web Testing | Burp Suite | Web app proxy, scanner, repeater |
| Exploitation | Metasploit | Exploit framework, payloads |
| Password | Hashcat / John | Password cracking |
| Wireless | Aircrack-ng | Wi-Fi auditing |
| OSINT | theHarvester | Email, subdomain discovery |
| Web Dirs | Gobuster / ffuf | Directory/file brute forcing |
| Enumeration | enum4linux | SMB/NetBIOS enumeration |
| Privilege Esc | LinPEAS / WinPEAS | Priv esc enumeration |
| Proxy | Burp Suite / ZAP | HTTP(S) interception |

### Burp Suite Workflow

```
┌──────────┐     ┌──────────────┐     ┌──────────────┐
│  Browser  │────▶│  Burp Proxy   │────▶│  Web Server   │
│           │◀────│  (Intercept)  │◀────│               │
└──────────┘     └──────────────┘     └──────────────┘
                        │
              ┌─────────┼─────────┐
              ▼         ▼         ▼
         ┌────────┐ ┌────────┐ ┌────────┐
         │Repeater│ │Intruder│ │Scanner │
         │(Manual)│ │(Fuzzing)│ │(Auto) │
         └────────┘ └────────┘ └────────┘
```

---

## Rules of Engagement (RoE)

Before any pentest, a formal agreement defines boundaries and expectations.

### RoE Must Include

| Element | Description |
|---|---|
| Scope | IP ranges, domains, applications in/out of scope |
| Timing | Testing window (business hours, weekends) |
| Boundaries | Systems/actions explicitly excluded |
| Communication | Emergency contacts, escalation procedures |
| Authorization | Signed written authorization from asset owner |
| Data handling | How sensitive data found during test is managed |
| Deliverables | Report format, presentation, retesting |
| Legal protection | Hold harmless clause, NDA |

### Critical Rules

- **Never test without written authorization** — unauthorized testing is illegal
- **Stay within scope** — accessing out-of-scope systems is a breach of contract
- **Stop and report** — if you find evidence of a real compromise, stop and report immediately
- **Handle data carefully** — if you access real user data, report it but don't exfiltrate it
- **Document everything** — timestamps, screenshots, commands for reproducibility

---

## Pentest vs Vulnerability Scan vs Red Team

| Aspect | Vulnerability Scan | Penetration Test | Red Team |
|---|---|---|---|
| Approach | Automated | Manual + Automated | Full adversary simulation |
| Goal | Find known vulnerabilities | Prove exploitability | Test detection & response |
| Duration | Hours | Days to weeks | Weeks to months |
| Scope | Broad | Focused | Entire organization |
| Stealth | None | Limited | Maximum |
| Output | List of CVEs | Exploited findings + impact | Attack narrative + gaps |

---

## Key Takeaways

- Penetration testing validates security by simulating real attacks with authorization
- Black/white/gray box approaches simulate different attacker knowledge levels
- The methodology follows: Recon → Scanning → Exploitation → Post-Exploitation → Reporting
- Always operate under a signed Rules of Engagement document — unauthorized testing is illegal
- The final report should translate technical findings into business risk for executives
- Pentesting complements (but does not replace) continuous vulnerability scanning

---

[Next: Ethical Hacking Methodology](48-cybersecurity-ethical-hacking)
