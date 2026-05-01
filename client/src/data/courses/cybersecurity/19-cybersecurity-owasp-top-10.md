---
title: OWASP Top 10 Overview
---

# OWASP Top 10 Overview

The OWASP Top 10 is the most widely recognized list of critical web application security risks.

---

## What is OWASP?

The **Open Worldwide Application Security Project** is a nonprofit foundation that works to improve software security through open-source projects, tools, and documentation.

---

## OWASP Top 10 (2021)

| # | Category | Description |
|---|----------|-------------|
| A01 | **Broken Access Control** | Users act outside intended permissions |
| A02 | **Cryptographic Failures** | Sensitive data exposed due to weak crypto |
| A03 | **Injection** | Hostile data sent to interpreters (SQL, OS, LDAP) |
| A04 | **Insecure Design** | Flaws in architecture, missing threat modeling |
| A05 | **Security Misconfiguration** | Default configs, open cloud storage, verbose errors |
| A06 | **Vulnerable Components** | Using libraries with known vulnerabilities |
| A07 | **Authentication Failures** | Broken login, session management |
| A08 | **Software & Data Integrity Failures** | Untrusted updates, CI/CD compromise |
| A09 | **Logging & Monitoring Failures** | Insufficient logging, no alerting |
| A10 | **Server-Side Request Forgery (SSRF)** | Server fetches attacker-controlled URLs |

---

## A01: Broken Access Control

The #1 vulnerability. Users can access resources they shouldn't.

### Examples:
- Changing `/user/123/profile` to `/user/456/profile` (IDOR)
- Accessing admin panel without admin role
- API returns data for all users, not just the requester
- Modifying JWT claims to escalate privileges

### Prevention:
- Deny access by default
- Check authorization on every request (server-side)
- Disable directory listing
- Log access control failures and alert

---

## A02: Cryptographic Failures

Sensitive data exposed due to missing or weak encryption.

### Examples:
- Passwords stored in plaintext or MD5
- HTTP used instead of HTTPS
- Weak encryption keys
- Sensitive data in URLs (logged by proxies)

### Prevention:
- Encrypt data at rest and in transit
- Use strong algorithms (AES-256, bcrypt, Argon2)
- Don't store sensitive data you don't need
- Enforce HTTPS everywhere

---

## A03: Injection

Untrusted data sent to an interpreter as part of a command or query.

### Examples:
- SQL: `SELECT * FROM users WHERE id = '${userInput}'`
- OS command: `exec("ping " + userInput)`
- LDAP, XPath, NoSQL injection

### Prevention:
- Use parameterized queries / prepared statements
- Input validation (allowlist)
- Escape special characters
- Use ORMs carefully

---

## A05: Security Misconfiguration

Insecure default configurations or incomplete setup.

### Examples:
- Default admin credentials left unchanged
- Unnecessary features enabled (directory listing, debug mode)
- Missing security headers
- Cloud storage publicly accessible
- Verbose error messages showing stack traces

### Prevention:
- Hardening checklist for all deployments
- Remove unused features, frameworks, accounts
- Automate configuration verification
- Review cloud permissions regularly

---

## A06: Vulnerable Components

Using libraries, frameworks, or modules with known vulnerabilities.

### Examples:
- Log4Shell (Log4j) — RCE in a logging library
- Old jQuery versions with XSS vulnerabilities
- Unpatched WordPress plugins

### Prevention:
- Maintain inventory of all dependencies
- Monitor CVE databases and advisories
- Use `npm audit`, `snyk`, `dependabot`
- Update dependencies regularly
- Remove unused dependencies

---

## Key Takeaways

- OWASP Top 10 covers the most critical web security risks
- **Broken Access Control** is #1 — always check authorization server-side
- **Injection** is preventable with parameterized queries
- **Keep dependencies updated** — known vulnerabilities are easy targets
- Use the OWASP Top 10 as a **checklist** for security reviews
- Each category is covered in depth in upcoming lessons

---

Next, we'll dive deep into **Injection Attacks** →
