---
title: Risk Management Basics
---

# Risk Management Basics

Risk management is the process of identifying, assessing, and mitigating threats to an organization's assets.

---

## Key Terminology

| Term | Definition |
|------|-----------|
| **Asset** | Anything of value (data, systems, people, reputation) |
| **Threat** | Potential cause of harm (hacker, natural disaster) |
| **Vulnerability** | Weakness that can be exploited |
| **Risk** | Likelihood × Impact of a threat exploiting a vulnerability |
| **Control** | Measure to reduce risk (firewall, policy, training) |
| **Exploit** | Method of taking advantage of a vulnerability |

---

## The Risk Equation

```
Risk = Threat × Vulnerability × Impact
```

- **High threat** + **High vulnerability** + **High impact** = Critical risk
- **High threat** + **Low vulnerability** + **High impact** = Moderate risk (good controls)
- **Low threat** + **High vulnerability** + **Low impact** = Low risk

---

## Risk Management Process

### 1. Identify Assets
What needs protecting?
- Customer data (PII, payment info)
- Intellectual property
- Systems and infrastructure
- Reputation and brand

### 2. Identify Threats
What could go wrong?
- External attackers, insider threats
- Natural disasters, power failures
- Software bugs, hardware failure
- Human error

### 3. Identify Vulnerabilities
What weaknesses exist?
- Unpatched software
- Weak passwords
- Misconfigured services
- Lack of training

### 4. Assess Risk
Evaluate likelihood and impact:

| Likelihood | Impact | Risk Level |
|-----------|--------|-----------|
| High | High | Critical |
| High | Medium | High |
| Medium | High | High |
| Medium | Medium | Medium |
| Low | High | Medium |
| Low | Low | Low |

### 5. Treat Risk
Decide what to do:

| Strategy | Description | Example |
|----------|-------------|---------|
| **Mitigate** | Reduce the risk | Install firewall, patch systems |
| **Accept** | Live with the risk | Low-impact risk not worth fixing |
| **Transfer** | Shift risk elsewhere | Buy cyber insurance |
| **Avoid** | Eliminate the activity | Don't collect data you don't need |

### 6. Monitor & Review
- Continuously reassess as threats evolve
- Update risk register regularly
- Test controls for effectiveness

---

## Risk Assessment Methods

### Qualitative
- Uses categories: Low, Medium, High, Critical
- Faster, easier to communicate
- Subjective

### Quantitative
- Uses dollar values and probabilities
- **ALE** = Annual Loss Expectancy = SLE × ARO
  - SLE (Single Loss Expectancy) = Asset Value × Exposure Factor
  - ARO (Annual Rate of Occurrence) = How often per year

Example:
```
Server value: $100,000
Exposure factor (data breach): 40%
SLE = $100,000 × 0.4 = $40,000
ARO (breach frequency): 0.1 (once every 10 years)
ALE = $40,000 × 0.1 = $4,000/year

If a control costs $3,000/year and eliminates the risk → worth it
```

---

## Risk Register

A document tracking all identified risks:

| ID | Risk | Likelihood | Impact | Level | Treatment | Owner |
|----|------|-----------|--------|-------|-----------|-------|
| R1 | Ransomware attack | High | Critical | Critical | Mitigate (backups, EDR) | CISO |
| R2 | Insider data theft | Medium | High | High | Mitigate (DLP, monitoring) | Security Team |
| R3 | Office flood | Low | Medium | Low | Transfer (insurance) | Facilities |

---

## Key Takeaways

- **Risk = Threat × Vulnerability × Impact**
- Four risk treatment options: mitigate, accept, transfer, avoid
- Not all risks need fixing — prioritize based on impact and likelihood
- Use a **risk register** to track and manage risks over time
- Risk management is ongoing — threats and assets change constantly

---

Next, we'll explore **Cybersecurity Frameworks** →
