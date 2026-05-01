---
title: Ethical Hacking Methodology
---

# Ethical Hacking Methodology

Ethical hacking uses the same techniques as malicious hackers but with **authorization**, **defined scope**, and the goal of improving security. Structured methodologies ensure thoroughness, professionalism, and reproducibility.

---

## Ethical Hacking Frameworks

| Framework | Full Name | Focus |
|---|---|---|
| PTES | Penetration Testing Execution Standard | Full pentest lifecycle |
| OSSTMM | Open Source Security Testing Methodology Manual | Measurable security testing |
| OWASP Testing Guide | OWASP Web Security Testing Guide | Web application testing |
| NIST SP 800-115 | Technical Guide to Information Security Testing | Government/enterprise testing |
| ISSAF | Information Systems Security Assessment Framework | Comprehensive assessment |

### PTES Phases

```
┌─────────────────┐
│ Pre-engagement   │  ← Scoping, RoE, legal agreements
├─────────────────┤
│ Intelligence     │  ← OSINT, passive/active recon
│ Gathering        │
├─────────────────┤
│ Threat Modeling  │  ← Identify assets, attack surfaces
├─────────────────┤
│ Vulnerability    │  ← Discover and verify weaknesses
│ Analysis         │
├─────────────────┤
│ Exploitation     │  ← Prove impact through controlled attack
├─────────────────┤
│ Post-Exploitation│  ← Assess breach depth and data access
├─────────────────┤
│ Reporting        │  ← Document findings and recommendations
└─────────────────┘
```

---

## Phase 1: Information Gathering

The foundation of any ethical hack. The more you know about the target, the more effective your attacks.

### Passive Reconnaissance

No direct interaction with the target — the target cannot detect you.

| Technique | Tools | Information Gathered |
|---|---|---|
| WHOIS queries | whois, DomainTools | Registration details, name servers |
| DNS records | dig, nslookup | Subdomains, mail servers, IPs |
| Search engines | Google, Shodan, Censys | Exposed services, documents |
| Social media | LinkedIn, Twitter | Employee names, roles, technology stack |
| Code repositories | GitHub, GitLab | Leaked credentials, architecture |
| Certificate transparency | crt.sh | Subdomain discovery |
| Archive search | Wayback Machine | Historical site content |

```bash
# Passive recon commands
whois target.com
dig target.com ANY
dig +short target.com MX
curl -s "https://crt.sh/?q=%.target.com&output=json" | jq '.[].name_value' | sort -u

# theHarvester - comprehensive OSINT
theHarvester -d target.com -b google,linkedin,dnsdumpster -l 500
```

### Active Reconnaissance

Direct interaction with the target — may be detected by IDS/IPS.

```bash
# Host discovery
nmap -sn 192.168.1.0/24

# Aggressive service scan with script detection
nmap -A -T4 -p- target.com

# Web technology fingerprinting
whatweb https://target.com
wappalyzer https://target.com

# Virtual host enumeration
gobuster vhost -u https://target.com -w /usr/share/wordlists/subdomains.txt
```

---

## Phase 2: Vulnerability Analysis

Systematically identify weaknesses that could be exploited.

### Automated Scanning

```bash
# Network vulnerability scan
nmap --script vuln -p 80,443,22,3306 target.com

# Web vulnerability scan with Nikto
nikto -h https://target.com

# SQL injection testing with sqlmap
sqlmap -u "https://target.com/page?id=1" --batch --risk=3 --level=5
```

### Manual Analysis

| Area | What to Look For |
|---|---|
| Authentication | Default creds, weak passwords, no lockout |
| Authorization | IDOR, privilege escalation paths |
| Input handling | Injection points, file uploads |
| Session management | Predictable tokens, fixation |
| Error handling | Verbose errors exposing internals |
| Configuration | Debug modes, default settings |
| Cryptography | Weak algorithms, improper implementation |

### Vulnerability Classification

| Category | Examples |
|---|---|
| Configuration | Default credentials, unnecessary services |
| Missing patches | Known CVEs, outdated software |
| Design flaws | Insecure architecture decisions |
| Implementation bugs | Buffer overflow, injection |
| Operational | Weak processes, social engineering vectors |

---

## Phase 3: Exploitation

Turn discovered vulnerabilities into demonstrated impact. Always operate within scope and document every action.

### Common Exploitation Techniques

| Technique | Target | Impact |
|---|---|---|
| SQL Injection | Database | Data extraction, auth bypass |
| Command Injection | Operating system | Remote code execution |
| File inclusion | Web server | Code execution, data access |
| Buffer overflow | Application/service | Code execution, crash |
| Credential attacks | Authentication | Account takeover |
| Deserialization | Application | Remote code execution |

### Exploitation Best Practices

1. **Verify before exploiting** — confirm the vulnerability exists with minimal impact
2. **Use the gentlest exploit** — avoid destructive exploits (DoS, disk wipers)
3. **Document everything** — timestamp, screenshot, save command output
4. **Have a rollback plan** — know how to undo changes you make
5. **Communicate** — notify the client if something unexpected happens

---

## Phase 4: Post-Exploitation

After initial access, determine what an attacker could achieve from this foothold.

### Objectives

| Objective | Description |
|---|---|
| Privilege escalation | Gain higher-level access (user → root/admin) |
| Lateral movement | Move to other systems in the network |
| Data identification | Find sensitive data (PII, financial, IP) |
| Persistence demonstration | Show how an attacker would maintain access |
| Impact assessment | Quantify the business damage possible |

### Common Post-Exploitation Actions

```bash
# System information gathering
uname -a && id && hostname
cat /etc/passwd
cat /etc/shadow  # if root

# Network information
ip addr show
netstat -tlnp
arp -a

# Credential harvesting (Linux)
find / -name "*.conf" -exec grep -l "password" {} \; 2>/dev/null
cat ~/.bash_history | grep -i "pass\|key\|token"

# Lateral movement discovery
nmap -sn 192.168.1.0/24  # from compromised host
crackmapexec smb 192.168.1.0/24  # Windows network
```

### Maintaining Access (Documentation Only)

Document how persistence could be achieved, but **only implement with explicit authorization**:

| Technique | Method |
|---|---|
| Backdoor user | Create hidden admin account |
| SSH key | Add authorized key to user account |
| Scheduled task | Cron job / Windows Task Scheduler |
| Web shell | Upload to accessible web directory |
| Service | Install malicious service/daemon |

---

## Phase 5: Reporting

### Report Structure

| Section | Audience | Content |
|---|---|---|
| Executive Summary | C-suite, managers | Business risk, overall posture, top 3 critical issues |
| Technical Summary | Security team | Attack path narrative, methodology |
| Detailed Findings | Engineers | Each vulnerability with CVSS, evidence, remediation |
| Risk Matrix | All | Heat map of findings by severity and likelihood |
| Recommendations | Security/IT teams | Prioritized remediation roadmap |
| Appendices | Technical staff | Raw output, PoC scripts, tool configurations |

### Finding Template

```markdown
## Finding: SQL Injection in Login Form

**Severity:** Critical (CVSS 9.8)
**Location:** https://target.com/api/login
**Parameter:** username

**Description:**
The login endpoint is vulnerable to SQL injection via the username
parameter, allowing authentication bypass and full database extraction.

**Evidence:**
- Payload: `admin' OR '1'='1' --`
- Result: Authenticated as admin without valid password
- [Screenshot: successful_bypass.png]

**Impact:**
- Complete authentication bypass
- Access to all 50,000 user records including PII
- Ability to modify or delete database contents

**Remediation:**
1. Use parameterized queries / prepared statements
2. Implement input validation (whitelist approach)
3. Apply least-privilege database user for the application
4. Deploy WAF rules as immediate mitigation
```

---

## Legal Considerations

| Requirement | Description |
|---|---|
| Written authorization | Signed scope agreement from asset owner |
| Scope boundaries | Clear definition of in/out of scope systems |
| Data handling | Agreement on how discovered data is managed |
| Third-party systems | Cannot test infrastructure you don't own (cloud, CDN) |
| Compliance | Some regulations require specific testing approaches |
| Jurisdiction | Laws vary by country (CFAA, CMA, etc.) |
| Disclosure | Responsible disclosure timelines for found vulnerabilities |

### Relevant Laws

| Law | Jurisdiction | Key Provision |
|---|---|---|
| CFAA | United States | Unauthorized computer access is a federal crime |
| CMA | United Kingdom | Unauthorized access/modification is criminal |
| IT Act | India | Sections 43, 66 cover unauthorized access |
| StGB §202a | Germany | Data espionage criminalized |

---

## Key Takeaways

- Ethical hacking follows structured methodologies (PTES, OSSTMM) for consistency and completeness
- Information gathering is the most critical phase — thorough recon leads to better results
- Always operate within authorized scope and document every action with timestamps
- Post-exploitation demonstrates real business impact, not just technical vulnerabilities
- The report is the primary deliverable — it must communicate risk to both technical and business audiences
- Legal authorization is non-negotiable — testing without permission is a criminal offense

---

[Next: Incident Response & Forensics](49-cybersecurity-incident-response)
