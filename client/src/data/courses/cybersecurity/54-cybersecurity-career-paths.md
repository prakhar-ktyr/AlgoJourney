---
title: Career Paths in Cybersecurity
---

Cybersecurity offers a wide range of career paths suited to different interests and skill levels. Whether you enjoy breaking into systems, building defenses, analyzing data, or managing risk — there is a role for you.

---

## Career Roles Overview

| Role | Focus Area | Avg Salary (USD) |
|------|-----------|-----------------|
| SOC Analyst | Monitoring & incident response | $55K–$85K |
| Penetration Tester | Offensive security & ethical hacking | $80K–$130K |
| Security Engineer | Building secure systems & infrastructure | $90K–$150K |
| Security Architect | Designing security frameworks | $120K–$180K |
| Incident Responder | Investigating breaches & forensics | $70K–$120K |
| Threat Intelligence Analyst | Research & threat analysis | $75K–$115K |
| GRC Analyst | Governance, risk & compliance | $65K–$110K |
| Cloud Security Engineer | Securing cloud infrastructure | $100K–$160K |
| Application Security Engineer | Securing software & code review | $95K–$150K |
| CISO | Executive leadership in security | $150K–$300K+ |

---

## Career Progression Path

A typical career progression in cybersecurity:

```text
Entry Level (0-2 years)
├── SOC Analyst (Tier 1)
├── IT Support / Help Desk
└── Junior Security Analyst

Mid Level (2-5 years)
├── SOC Analyst (Tier 2-3)
├── Penetration Tester
├── Security Engineer
└── Incident Responder

Senior Level (5-10 years)
├── Senior Security Engineer
├── Security Architect
├── Red/Blue Team Lead
└── Security Manager

Executive (10+ years)
├── Director of Security
├── VP of Information Security
└── CISO
```

---

## Key Certifications

Certifications validate your knowledge and open doors in the industry:

### Entry-Level Certifications

| Certification | Provider | Focus | Prerequisites |
|--------------|----------|-------|---------------|
| CompTIA Security+ | CompTIA | Broad security fundamentals | None (Network+ recommended) |
| CompTIA CySA+ | CompTIA | Security analytics & monitoring | Security+ recommended |
| CC (Certified in Cybersecurity) | (ISC)² | Foundational security concepts | None |
| Google Cybersecurity Certificate | Google/Coursera | Entry-level SOC skills | None |

### Mid-Level Certifications

| Certification | Provider | Focus | Prerequisites |
|--------------|----------|-------|---------------|
| CEH (Certified Ethical Hacker) | EC-Council | Ethical hacking techniques | 2 years IT security experience |
| SSCP | (ISC)² | Security administration | 1 year experience |
| GIAC GSEC | SANS | Security essentials | None |
| AWS Security Specialty | AWS | Cloud security on AWS | AWS experience |

### Advanced Certifications

| Certification | Provider | Focus | Prerequisites |
|--------------|----------|-------|---------------|
| CISSP | (ISC)² | Security management & architecture | 5 years experience |
| OSCP | OffSec | Hands-on penetration testing | Strong technical skills |
| CISM | ISACA | Security management | 5 years in IS management |
| GIAC GPEN | SANS | Penetration testing | None |

### Certification Roadmap

```text
Beginner:    Security+ → CySA+
Offensive:   Security+ → CEH → OSCP → GXPN
Defensive:   Security+ → CySA+ → GCIH → GCIA
Management:  Security+ → CISSP → CISM → CISO
Cloud:       Security+ → AWS Security → CCSP
```

---

## Building a Home Lab

A home lab lets you practice real-world skills safely. Here is a basic setup:

### Hardware Options

| Option | Cost | Good For |
|--------|------|----------|
| Old PC/Laptop | Free–$200 | Basic VMs and practice |
| Mini PC (Intel NUC) | $200–$500 | Multiple VMs, portable |
| Cloud VMs (AWS/Azure) | $0–$50/month | Scalable, no hardware needed |
| Raspberry Pi Cluster | $100–$300 | Networking, IoT security |

### Recommended Lab Components

1. **Hypervisor** — VirtualBox (free) or VMware Workstation
2. **Attacker Machine** — Kali Linux or Parrot OS
3. **Vulnerable Targets** — Metasploitable, DVWA, VulnHub VMs, HackTheBox
4. **Network Simulation** — pfSense firewall, multiple virtual networks
5. **SIEM** — Security Onion or Wazuh (for blue team practice)
6. **Active Directory** — Windows Server evaluation + workstations

### Lab Project Ideas

- Set up a vulnerable web app and find all OWASP Top 10 issues
- Build a SIEM and create detection rules for common attacks
- Configure a firewall and test traffic filtering
- Practice Active Directory attacks and defenses
- Analyze malware samples in an isolated VM

---

## CTF Competitions

**Capture The Flag (CTF)** competitions are gamified security challenges that sharpen your skills.

### CTF Types

| Type | Description | Example |
|------|-------------|---------|
| Jeopardy | Solve challenges in categories (web, crypto, forensics) | picoCTF, CTFtime |
| Attack-Defense | Teams attack/defend live infrastructure | DEF CON CTF |
| King of the Hill | Maintain control of a target machine | TryHackMe KoTH |
| Boot2Root | Hack a single machine from scratch | HackTheBox, VulnHub |

### CTF Platforms

| Platform | Difficulty | Cost |
|----------|-----------|------|
| picoCTF | Beginner | Free |
| TryHackMe | Beginner–Intermediate | Free / $10/month |
| HackTheBox | Intermediate–Advanced | Free / $14/month |
| OverTheWire | Beginner (Linux/networking) | Free |
| PortSwigger Web Security Academy | Web-focused | Free |
| CyberDefenders | Blue team/forensics | Free |

---

## Continuous Learning Resources

### Free Resources

| Resource | Type | Focus |
|----------|------|-------|
| OWASP | Documentation | Web application security |
| MITRE ATT&CK | Framework | Adversary tactics and techniques |
| NIST Cybersecurity Framework | Framework | Organizational security program |
| Cybrary | Video courses | Broad cybersecurity topics |
| Professor Messer | YouTube | CompTIA certification prep |
| SANS Reading Room | White papers | Advanced research |

### Communities

- **Reddit**: r/cybersecurity, r/netsec, r/AskNetsec
- **Discord**: TryHackMe, HackTheBox, John Hammond's server
- **Twitter/X**: Follow researchers, CVE updates, threat intel
- **Conferences**: DEF CON, Black Hat, BSides (many free/virtual)

### Staying Current

Cybersecurity evolves daily. Build habits for staying updated:

1. Subscribe to security newsletters (tl;dr sec, SANS NewsBites)
2. Follow CVE databases for new vulnerabilities
3. Read incident reports and post-mortems
4. Practice regularly on CTF platforms
5. Join local security meetups or OWASP chapters
6. Contribute to open-source security tools

---

## Key Takeaways

- Cybersecurity has diverse roles from offensive (red team) to defensive (blue team) to management
- Certifications like Security+, CEH, CISSP, and OSCP are industry-recognized milestones
- A home lab is essential for hands-on practice without risk
- CTF competitions gamify learning and build practical skills
- Continuous learning is non-negotiable in a field that changes daily
- Start with fundamentals, specialize based on your interests, and never stop practicing

---

[Next: Capstone - Security Audit Project](55-cybersecurity-capstone)
