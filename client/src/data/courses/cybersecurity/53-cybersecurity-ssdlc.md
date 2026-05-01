---
title: Secure Software Development Lifecycle
---

The **Secure Software Development Lifecycle (SSDLC)** integrates security practices into every phase of software development. Instead of treating security as an afterthought, SSDLC ensures vulnerabilities are caught early — when they are cheapest and easiest to fix.

---

## Why SSDLC Matters

The cost of fixing a security flaw increases dramatically the later it is discovered:

| Phase Discovered | Relative Cost to Fix |
|-----------------|---------------------|
| Requirements | 1x |
| Design | 5x |
| Implementation | 10x |
| Testing | 20x |
| Production | 100x+ |

SSDLC shifts security left — addressing it early in the development process.

---

## SSDLC Phases

Each traditional SDLC phase has corresponding security activities:

| SDLC Phase | Security Activity |
|-----------|-------------------|
| Requirements | Security requirements, abuse cases, compliance needs |
| Design | Threat modeling, secure architecture review |
| Implementation | Secure coding, SAST, peer code review |
| Testing | DAST, penetration testing, fuzzing |
| Deployment | Security configuration, hardening |
| Maintenance | Patch management, monitoring, incident response |

---

## Threat Modeling with STRIDE

**Threat modeling** identifies potential threats to a system before code is written. STRIDE is the most popular framework:

| Threat | Description | Example | Mitigation |
|--------|-------------|---------|------------|
| **S**poofing | Pretending to be someone else | Stolen credentials | Multi-factor authentication |
| **T**ampering | Modifying data without authorization | SQL injection | Input validation, integrity checks |
| **R**epudiation | Denying an action occurred | Deleting logs | Audit logging, digital signatures |
| **I**nformation Disclosure | Exposing data to unauthorized parties | Data breach | Encryption, access controls |
| **D**enial of Service | Making a system unavailable | DDoS attack | Rate limiting, CDN, scaling |
| **E**levation of Privilege | Gaining unauthorized access levels | Privilege escalation | Least privilege, RBAC |

### Threat Modeling Process

1. **Diagram** — Create a data flow diagram (DFD) of the system
2. **Identify** — Apply STRIDE to each component and data flow
3. **Mitigate** — Design controls for each identified threat
4. **Validate** — Verify mitigations are implemented correctly

```text
System DFD → Apply STRIDE → List Threats → Design Mitigations → Verify
```

---

## Secure Coding Practices

Follow these principles when writing code:

### Input Validation

Always validate and sanitize user input:

```javascript
// Bad - directly using user input
const query = `SELECT * FROM users WHERE id = ${req.params.id}`;

// Good - parameterized query
const query = "SELECT * FROM users WHERE id = ?";
db.execute(query, [req.params.id]);
```

### Output Encoding

Encode output to prevent injection attacks:

```javascript
// Bad - raw user content in HTML
element.innerHTML = userInput;

// Good - encode before rendering
element.textContent = userInput;
```

### Authentication & Session Management

- Use proven libraries (never roll your own crypto)
- Enforce strong password policies
- Implement account lockout after failed attempts
- Regenerate session IDs after login

### Error Handling

- Never expose stack traces or internal details to users
- Log errors securely for debugging
- Return generic error messages to clients

### Principle of Least Privilege

- Grant minimum permissions needed
- Use separate database accounts for read vs write operations
- Run services with non-root accounts

---

## Security Testing Tools

### SAST — Static Application Security Testing

Analyzes source code **without executing** it. Runs early in development.

| Tool | Language Support | Type |
|------|-----------------|------|
| SonarQube | Multi-language | Open Source / Commercial |
| Semgrep | Multi-language | Open Source |
| Checkmarx | Multi-language | Commercial |
| Bandit | Python | Open Source |
| ESLint Security | JavaScript | Open Source |

**Pros:** Fast, finds issues early, integrates into CI/CD
**Cons:** High false positive rate, cannot find runtime issues

### DAST — Dynamic Application Security Testing

Tests the **running application** from the outside, simulating attacks.

| Tool | Description | Type |
|------|-------------|------|
| OWASP ZAP | Web app scanner | Open Source |
| Burp Suite | Web security testing | Commercial |
| Nikto | Web server scanner | Open Source |
| Nuclei | Template-based scanner | Open Source |

**Pros:** Finds runtime vulnerabilities, low false positive rate
**Cons:** Slower, requires running application, limited code coverage

### IAST — Interactive Application Security Testing

Combines SAST and DAST by instrumenting the application during testing.

| Tool | Description |
|------|-------------|
| Contrast Security | Runtime agent-based analysis |
| Hdiv Security | Real-time protection and testing |

**Pros:** Accurate results, low false positives, provides code-level detail
**Cons:** Requires instrumentation, performance overhead

---

## Code Review for Security

Security-focused code review looks for:

- Hardcoded secrets (API keys, passwords)
- Missing input validation
- Improper error handling
- Insecure cryptographic usage
- SQL injection, XSS, CSRF vulnerabilities
- Improper access control checks

### Code Review Checklist

```text
[ ] All inputs validated and sanitized
[ ] Parameterized queries used for database access
[ ] Authentication and authorization checks in place
[ ] Sensitive data encrypted at rest and in transit
[ ] No hardcoded secrets or credentials
[ ] Proper error handling without information leakage
[ ] Dependencies checked for known vulnerabilities
[ ] Logging implemented without sensitive data
```

---

## DevSecOps & Shift-Left Security

**DevSecOps** embeds security into the DevOps pipeline, making it everyone's responsibility — not just the security team's.

### CI/CD Security Integration

```text
Code Commit → SAST Scan → Build → DAST Scan → Deploy → Monitor
     ↓            ↓          ↓         ↓          ↓        ↓
  Pre-commit   Static     Dependency  Dynamic   Config   Runtime
   hooks      analysis    scanning    testing   audit    protection
```

### Shift-Left Principles

| Traditional | Shift-Left |
|------------|------------|
| Security tested at end | Security tested throughout |
| Security team owns it | Everyone owns security |
| Manual reviews only | Automated + manual |
| Reactive (fix after breach) | Proactive (prevent breaches) |
| Expensive fixes | Cheap, early fixes |

### Practical DevSecOps Steps

1. **Pre-commit hooks** — Scan for secrets before code is committed
2. **CI pipeline** — Run SAST on every pull request
3. **Dependency scanning** — Check for vulnerable libraries (Dependabot, Snyk)
4. **Container scanning** — Scan Docker images for vulnerabilities
5. **Infrastructure as Code** — Scan Terraform/CloudFormation for misconfigurations
6. **Runtime protection** — WAF, RASP, and monitoring in production

---

## Key Takeaways

- SSDLC integrates security into every phase of development
- Threat modeling (STRIDE) helps identify risks before writing code
- Secure coding practices prevent the most common vulnerability classes
- SAST finds issues in source code; DAST finds issues in running apps; IAST combines both
- DevSecOps automates security in CI/CD pipelines
- Shift-left means catching security issues early when they are cheapest to fix

---

[Next: Career Paths in Cybersecurity](54-cybersecurity-career-paths)
