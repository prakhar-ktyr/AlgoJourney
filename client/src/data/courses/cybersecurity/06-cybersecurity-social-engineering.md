---
title: Social Engineering & Phishing
---

# Social Engineering & Phishing

Social engineering exploits **human psychology** rather than technical vulnerabilities. It's the most common attack vector.

---

## What is Social Engineering?

The art of manipulating people into:
- Revealing confidential information
- Clicking malicious links
- Transferring money
- Granting system access
- Bypassing security controls

**82% of data breaches involve the human element** (Verizon DBIR 2022).

---

## Psychological Principles Exploited

| Principle | How It's Used |
|-----------|--------------|
| **Authority** | "I'm from IT, I need your password" |
| **Urgency** | "Your account will be locked in 1 hour!" |
| **Fear** | "You'll be fired if you don't comply" |
| **Curiosity** | "Click here to see who viewed your profile" |
| **Trust** | Impersonating a known colleague |
| **Reciprocity** | "I helped you, now help me with this access" |
| **Scarcity** | "Only 2 spots left — act now!" |

---

## Phishing

Fraudulent communications (usually email) designed to steal credentials or deliver malware.

### Types of Phishing:

| Type | Target | Sophistication |
|------|--------|---------------|
| **Mass phishing** | Anyone | Low — generic messages |
| **Spear phishing** | Specific individuals | High — personalized |
| **Whaling** | Executives/C-suite | Very high — tailored to VIPs |
| **Clone phishing** | Previous email recipients | Medium — copies a real email |
| **Vishing** | Phone calls | Medium — voice impersonation |
| **Smishing** | SMS messages | Low to medium |

### Anatomy of a Phishing Email:

```
From: security@amaz0n-support.com  ← Spoofed/lookalike domain
Subject: Urgent: Your account has been compromised!

Dear Customer,

We detected unusual activity on your account.
Please verify your identity immediately or your account
will be permanently suspended within 24 hours.

[Verify Now]  ← Links to fake login page

Amazon Security Team
```

### Red flags:
- Sender address doesn't match the organization
- Urgency and threats
- Generic greeting ("Dear Customer")
- Suspicious links (hover to check URL)
- Grammar/spelling errors
- Requests for sensitive information

---

## Spear Phishing

Targeted attacks using personal information about the victim.

### Example:
```
From: john.smith@company.com (spoofed)
To: jane.doe@company.com
Subject: Re: Q4 Budget Review

Hi Jane,

Following up on our meeting yesterday. Can you review the
attached budget spreadsheet and approve the vendor payment?

[Q4_Budget_Final.xlsx]  ← Contains malicious macro

Thanks,
John
```

The attacker researched:
- Jane's role and responsibilities
- Her relationship with John
- Recent company events (Q4 review)
- Email format and tone

---

## Other Social Engineering Attacks

### Pretexting
Creating a fabricated scenario to gain trust:
- "Hi, I'm from the help desk. We're upgrading systems and need your login to test."
- "I'm the new contractor — can you hold the door?"

### Baiting
Leaving infected USB drives or offering enticing downloads:
- USB drives labeled "Employee Salaries 2024" left in a parking lot
- Free software that contains hidden malware

### Tailgating / Piggybacking
Following an authorized person through a secure door:
- "Can you hold the door? My hands are full."
- Wearing a delivery uniform to look legitimate

### Quid Pro Quo
Offering something in exchange:
- "Free tech support" that installs remote access tools
- "Complete this survey for a gift card" that harvests credentials

### Watering Hole
Compromising a website frequently visited by targets:
- Infecting an industry forum with malware
- Injecting malicious code into a vendor's website

---

## Business Email Compromise (BEC)

One of the most financially damaging attacks:

1. Attacker compromises or spoofs an executive's email
2. Sends urgent request to finance department
3. "Wire $250,000 to this account for the acquisition deal"
4. Money is transferred and gone

**BEC caused $2.7 billion in losses** in 2022 (FBI IC3 report).

---

## Defenses Against Social Engineering

### Technical Controls:
- Email filtering and anti-phishing gateways
- Multi-factor authentication (even if password is stolen)
- DMARC/SPF/DKIM for email authentication
- URL scanning and sandboxing
- Browser isolation

### Human Controls:
- Security awareness training (regular, engaging)
- Phishing simulations (test employees)
- Clear reporting procedures ("Report Phish" button)
- Verification policies (call back on a known number)
- Culture of security (it's OK to question requests)

### Process Controls:
- Dual authorization for financial transfers
- Verbal confirmation for unusual requests
- Defined procedures for password resets
- Visitor policies and badge requirements

---

## Key Takeaways

- Social engineering targets **people**, not technology
- **Phishing** is the #1 attack vector for data breaches
- Attacks exploit urgency, authority, fear, and curiosity
- **Spear phishing** is personalized and much harder to detect
- Defense requires training, technical controls, AND process controls
- When in doubt: **verify through a separate channel**

---

Next, we'll study **Attack Vectors & the Kill Chain** →
