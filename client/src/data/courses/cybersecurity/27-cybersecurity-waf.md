---
title: Web Application Firewalls
---

# Web Application Firewalls (WAF)

A Web Application Firewall (WAF) is a security solution that monitors, filters, and blocks HTTP/HTTPS traffic to and from a web application. It sits between users and the web server, inspecting requests for malicious patterns.

---

## How a WAF Works

```
User Request → [WAF] → Web Server
                 ↓
         Inspect request:
         - Headers
         - URL/Query parameters
         - POST body
         - Cookies
                 ↓
         Match against rules:
         - Known attack signatures
         - Anomaly detection
         - Custom rules
                 ↓
         Decision: ALLOW / BLOCK / LOG
```

---

## WAF vs Traditional Firewall

| Feature | Network Firewall | WAF |
|---------|-----------------|-----|
| **Layer** | Network (L3/L4) | Application (L7) |
| **Inspects** | IP addresses, ports | HTTP content, headers, body |
| **Blocks** | Port scans, IP ranges | SQL injection, XSS, CSRF |
| **Understands** | TCP/UDP packets | HTML, JSON, cookies, sessions |
| **Deployment** | Network perimeter | In front of web apps |

---

## Types of WAF Rules

### 1. Signature-Based (Blocklist)

Match known attack patterns:

```
# Example ModSecurity rule — block SQL injection
SecRule ARGS "@rx (union|select|insert|update|delete|drop)" \
  "id:1001,phase:2,deny,status:403,msg:'SQL Injection Attempt'"

# Block XSS patterns
SecRule ARGS "@rx (<script|javascript:|onerror=)" \
  "id:1002,phase:2,deny,status:403,msg:'XSS Attempt'"
```

| Pros | Cons |
|------|------|
| Low false positives | Can be bypassed with encoding |
| Fast pattern matching | Doesn't catch zero-day attacks |
| Easy to understand | Requires constant updates |

### 2. Anomaly-Based (Scoring)

Assign scores to suspicious behaviors — block when threshold exceeded:

```
Request characteristics:
  - Contains SQL keywords:        +3 points
  - Unusual Content-Type:         +2 points
  - Missing User-Agent:           +2 points
  - Request from known bad IP:    +5 points
  - Exceeds normal parameter length: +3 points

Threshold: 8 points → BLOCK
```

### 3. Allowlist-Based (Positive Security)

Only allow known-good patterns:

```
# Only allow expected parameters for /login
SecRule &ARGS "@gt 2" "deny"  # Block if more than 2 parameters
SecRule ARGS:username "!@rx ^[a-zA-Z0-9_]{3,30}$" "deny"
SecRule ARGS:password "!@rx ^.{8,128}$" "deny"
```

| Pros | Cons |
|------|------|
| Very secure | Hard to maintain |
| Catches unknown attacks | High initial false positives |
| Minimal bypasses | Requires deep app knowledge |

---

## Deployment Modes

### 1. Reverse Proxy (Inline)

WAF sits between the internet and your servers:

```
Internet → WAF (Reverse Proxy) → Web Server
```

- Inspects and can modify all traffic
- Can terminate SSL/TLS
- Adds slight latency
- Most common deployment

### 2. Transparent Proxy (Bridge)

WAF is invisible to both client and server:

```
Internet → [WAF Bridge] → Web Server
```

- No network reconfiguration needed
- Limited ability to modify responses
- Simpler deployment

### 3. Out-of-Band (Monitoring Only)

WAF receives a copy of traffic — doesn't block in real-time:

```
Internet → Web Server
    ↓ (copy)
   WAF → Alerts
```

- No latency impact
- Cannot block attacks in real-time
- Good for learning/tuning phase

---

## Popular WAF Solutions

### Open Source

| WAF | Description |
|-----|-------------|
| **ModSecurity** | Industry-standard open-source WAF engine |
| **OWASP CRS** | Core Rule Set for ModSecurity |
| **Coraza** | Modern ModSecurity-compatible WAF (Go) |
| **Naxsi** | Lightweight Nginx WAF module |

### Cloud WAFs

| Provider | Service |
|----------|---------|
| **AWS** | AWS WAF |
| **Cloudflare** | Cloudflare WAF |
| **Azure** | Azure WAF |
| **Akamai** | Kona Site Defender |
| **Fastly** | Next-Gen WAF (Signal Sciences) |

### ModSecurity Example

```nginx
# Nginx with ModSecurity
server {
    listen 443 ssl;

    modsecurity on;
    modsecurity_rules_file /etc/nginx/modsecurity/main.conf;

    location / {
        proxy_pass http://backend;
    }
}
```

```
# modsecurity/main.conf
Include /etc/nginx/modsecurity/modsecurity.conf
Include /etc/nginx/modsecurity/crs/crs-setup.conf
Include /etc/nginx/modsecurity/crs/rules/*.conf
```

### AWS WAF Example

```json
{
  "Name": "BlockSQLInjection",
  "Priority": 1,
  "Statement": {
    "SqliMatchStatement": {
      "FieldToMatch": { "Body": {} },
      "TextTransformations": [
        { "Priority": 0, "Type": "URL_DECODE" },
        { "Priority": 1, "Type": "HTML_ENTITY_DECODE" }
      ]
    }
  },
  "Action": { "Block": {} }
}
```

---

## WAF Limitations

| Limitation | Explanation |
|------------|-------------|
| **Not a silver bullet** | Cannot fix underlying application vulnerabilities |
| **Bypass techniques** | Encoding, fragmentation, polymorphism |
| **False positives** | Legitimate requests blocked |
| **False negatives** | Novel attacks slip through |
| **Performance impact** | Deep inspection adds latency |
| **Logic flaws** | Cannot detect business logic vulnerabilities |
| **Encrypted payloads** | Cannot inspect end-to-end encrypted data |

### Common Bypass Techniques

```
# Original attack (blocked)
<script>alert('XSS')</script>

# Bypass attempts:
<ScRiPt>alert('XSS')</ScRiPt>          # Mixed case
<scr<script>ipt>alert('XSS')</script>   # Nested tags
%3Cscript%3Ealert('XSS')%3C/script%3E   # URL encoding
<svg/onload=alert('XSS')>               # Alternative tags
```

---

## WAF Best Practices

- Start in **monitoring mode** before blocking — learn your traffic patterns
- Use WAF as **defense in depth**, not a replacement for secure coding
- Keep rules **updated** — subscribe to threat intelligence feeds
- **Tune regularly** — review and fix false positives
- Enable **logging** for all blocked and flagged requests
- Combine with other security measures (rate limiting, authentication)
- Test your WAF rules with known attack patterns

---

## WAF Deployment Checklist

- [ ] Deploy in monitoring mode first (2-4 weeks)
- [ ] Review and tune false positives
- [ ] Enable OWASP CRS or equivalent managed rules
- [ ] Add custom rules for application-specific patterns
- [ ] Configure rate limiting rules
- [ ] Set up alerting for high-severity blocks
- [ ] Plan for regular rule updates
- [ ] Switch to blocking mode after tuning

---

## Key Takeaways

- A WAF inspects HTTP traffic at the **application layer** (Layer 7)
- WAFs use **signatures**, **anomaly scoring**, and **allowlists** to detect attacks
- **Reverse proxy** is the most common and effective deployment mode
- WAFs **cannot replace** secure coding — they add defense in depth
- **ModSecurity** with OWASP CRS is the industry-standard open-source option
- Cloud WAFs (AWS, Cloudflare) offer managed rules and easy deployment
- Always start in **monitoring mode** and tune before blocking
- WAFs can be **bypassed** — never rely on them as your only defense

---

Next, we'll learn about **Cryptography Fundamentals** →
