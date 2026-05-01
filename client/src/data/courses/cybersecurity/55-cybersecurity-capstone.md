---
title: Capstone - Security Audit Project
---

In this capstone lesson, you will perform a complete **security audit** on a sample web application. This project ties together everything you have learned throughout the course — from reconnaissance to vulnerability scanning to report writing.

---

## Project Overview

You will act as a security consultant hired to audit a fictional web application called **"ShopEasy"** — a small e-commerce platform. Your goal is to identify vulnerabilities, assess risk, and deliver a professional security report.

### Audit Phases

| Phase | Activity | Tools |
|-------|----------|-------|
| 1. Planning | Define scope, rules of engagement | Documentation |
| 2. Reconnaissance | Gather information about the target | Nmap, WHOIS, Google Dorks |
| 3. Vulnerability Scanning | Automated scanning for known issues | Nessus, OpenVAS, Nikto |
| 4. Web Application Testing | Manual testing for OWASP Top 10 | Burp Suite, OWASP ZAP |
| 5. Exploitation (if authorized) | Prove vulnerabilities are exploitable | Metasploit, custom scripts |
| 6. Reporting | Document findings and recommendations | Report template |

---

## Phase 1: Planning & Scoping

Before any testing, define the boundaries:

### Rules of Engagement Document

```text
Project:        ShopEasy Security Audit
Client:         ShopEasy Inc.
Scope:          https://shop-easy.example.com (web app only)
Out of Scope:   Internal network, third-party APIs, DDoS testing
Testing Window: Monday–Friday, 9am–6pm
Authorization:  Written approval from CTO (attached)
Emergency Contact: security@shopeasy.example.com
```

### Scope Checklist

- [ ] Target URLs and IP ranges defined
- [ ] Testing window agreed upon
- [ ] Written authorization obtained
- [ ] Emergency contacts documented
- [ ] Out-of-scope items clearly listed
- [ ] Data handling procedures agreed (no real customer data)

---

## Phase 2: Reconnaissance

Gather as much information as possible about the target.

### Passive Reconnaissance

No direct contact with the target:

```bash
# WHOIS lookup
whois shop-easy.example.com

# DNS records
dig shop-easy.example.com ANY

# Search for exposed files
# Google Dorks (use on real engagements, not against others' systems)
site:shop-easy.example.com filetype:pdf
site:shop-easy.example.com inurl:admin

# Check for data breaches
# Search haveibeenpwned.com for company emails
```

### Active Reconnaissance

Direct interaction with the target:

```bash
# Port scanning
nmap -sV -sC -oN scan_results.txt shop-easy.example.com

# Web technology fingerprinting
whatweb shop-easy.example.com

# Directory enumeration
gobuster dir -u https://shop-easy.example.com -w /usr/share/wordlists/dirb/common.txt
```

### Reconnaissance Findings Template

| Finding | Details |
|---------|---------|
| IP Address | 203.0.113.42 |
| Open Ports | 22 (SSH), 80 (HTTP), 443 (HTTPS), 3306 (MySQL) |
| Web Server | Nginx 1.18.0 |
| Framework | Node.js + Express |
| CMS/Platform | Custom e-commerce |
| Exposed Directories | /admin, /api/docs, /backup |

---

## Phase 3: Vulnerability Scanning

Use automated tools to identify known vulnerabilities:

```bash
# Nikto web server scan
nikto -h https://shop-easy.example.com -o nikto_report.html -Format html

# OpenVAS scan (if network is in scope)
# Run via Greenbone Security Assistant (web interface)

# SSL/TLS configuration check
testssl.sh shop-easy.example.com

# Check for outdated dependencies
# If you have access to package.json:
npm audit
```

### Scan Results Summary

| Vulnerability | Severity | Category |
|--------------|----------|----------|
| TLS 1.0 enabled | Medium | Configuration |
| Missing security headers | Low | Configuration |
| Exposed admin panel | High | Access Control |
| Outdated jQuery (3.3.1) | Medium | Dependencies |
| Directory listing enabled | Low | Configuration |
| MySQL port exposed | High | Network |

---

## Phase 4: Web Application Testing

Manually test for OWASP Top 10 vulnerabilities:

### Testing Checklist

| Vulnerability | Test Method | Status |
|--------------|-------------|--------|
| SQL Injection | Send `' OR 1=1--` in input fields | ☐ |
| XSS (Reflected) | Inject `<script>alert(1)</script>` in parameters | ☐ |
| XSS (Stored) | Submit script in profile/comment fields | ☐ |
| Broken Authentication | Test weak passwords, session fixation | ☐ |
| IDOR | Change user IDs in URLs/API calls | ☐ |
| CSRF | Submit forms from external page | ☐ |
| Security Misconfiguration | Check default credentials, error pages | ☐ |
| Sensitive Data Exposure | Check for data in responses, URLs | ☐ |

### Example: Testing for SQL Injection

```text
Target: Login form at /login
Input field: username

Test payloads:
1. admin' --
2. admin' OR '1'='1
3. ' UNION SELECT null, null, null --
4. '; DROP TABLE users; --

Result: Payload #2 bypassed authentication
Severity: CRITICAL
```

### Example: Testing for XSS

```text
Target: Product search at /search?q=
Input: Search parameter

Test payloads:
1. <script>alert('XSS')</script>
2. <img src=x onerror=alert(1)>
3. "><svg onload=alert(1)>

Result: Payload #1 executed in browser (reflected XSS)
Severity: HIGH
```

---

## Phase 5: Writing the Security Report

A professional security audit report is the primary deliverable.

### Report Structure

```text
1. Executive Summary (1 page)
   - High-level findings for management
   - Overall risk rating
   - Top recommendations

2. Methodology
   - Tools used
   - Testing approach
   - Scope and limitations

3. Findings (detailed)
   - Each vulnerability documented
   - Severity rating (CVSS score)
   - Steps to reproduce
   - Evidence (screenshots, logs)
   - Remediation recommendations

4. Risk Summary
   - Findings by severity
   - Risk matrix

5. Recommendations
   - Prioritized action items
   - Quick wins vs long-term fixes

6. Appendices
   - Raw scan outputs
   - Tool configurations
   - Testing timeline
```

### Vulnerability Report Template

For each finding, document:

| Field | Example |
|-------|---------|
| Title | SQL Injection in Login Form |
| Severity | Critical (CVSS 9.8) |
| Location | POST /api/login — username parameter |
| Description | The username field is vulnerable to SQL injection due to unsanitized input being concatenated into a SQL query |
| Impact | Attacker can bypass authentication, extract entire database, modify or delete data |
| Steps to Reproduce | 1. Navigate to /login 2. Enter `admin' OR '1'='1` as username 3. Enter any password 4. Observe successful login as admin |
| Evidence | [Screenshot of successful bypass] |
| Remediation | Use parameterized queries/prepared statements. Implement input validation. Apply WAF rules |
| Priority | Immediate — fix within 24 hours |

### Risk Matrix

| Severity | Count | Examples |
|----------|-------|---------|
| Critical | 2 | SQL Injection, Exposed MySQL port |
| High | 3 | XSS, Exposed admin panel, Broken auth |
| Medium | 4 | Outdated TLS, Old jQuery, CSRF, Weak headers |
| Low | 3 | Directory listing, Verbose errors, Missing HSTS |

---

## Delivering Recommendations

Prioritize remediation by severity and effort:

| Priority | Action | Effort | Timeline |
|----------|--------|--------|----------|
| 1 | Fix SQL injection with parameterized queries | Low | Immediate |
| 2 | Close MySQL port to public internet | Low | Immediate |
| 3 | Add authentication to admin panel | Medium | 1 week |
| 4 | Implement Content Security Policy headers | Low | 1 week |
| 5 | Update all dependencies to latest versions | Medium | 2 weeks |
| 6 | Implement rate limiting and account lockout | Medium | 2 weeks |
| 7 | Enable TLS 1.3, disable TLS 1.0/1.1 | Low | 1 week |
| 8 | Deploy Web Application Firewall | High | 1 month |

---

## Key Takeaways

- A professional security audit follows a structured methodology: plan, recon, scan, test, report
- Always obtain written authorization before testing any system
- Reconnaissance (both passive and active) reveals the attack surface
- Automated scanners find known issues; manual testing finds logic flaws
- The security report is the most important deliverable — clear, actionable, and professional
- Prioritize findings by risk so the client knows what to fix first
- Document everything: reproduction steps, evidence, and remediation guidance

---

## Congratulations!

You have completed the **Cybersecurity Course**! Throughout this journey, you have learned:

- Fundamental security concepts and the CIA triad
- Network security, cryptography, and secure protocols
- Web application vulnerabilities and the OWASP Top 10
- Defensive tools: firewalls, IDS/IPS, SIEM, and endpoint protection
- Offensive techniques: reconnaissance, scanning, and exploitation
- Incident response and digital forensics
- Security operations, compliance, and secure development
- Career paths, certifications, and how to keep learning

You now have the knowledge foundation to pursue any cybersecurity specialization. Build your home lab, earn your first certification, compete in CTFs, and never stop learning. The security community needs you!
