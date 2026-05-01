---
title: DNS Security
---

# DNS Security

DNS is critical infrastructure — if DNS is compromised, attackers control where your traffic goes.

---

## DNS Attacks

### DNS Spoofing / Cache Poisoning
Inject false DNS records into a resolver's cache:
- User types `bank.com` → gets attacker's IP
- All traffic goes to a fake site
- Credentials are stolen

### DNS Hijacking
Change DNS settings on a device or router:
- Modify router DNS settings (via malware or default credentials)
- Change system DNS configuration
- Compromise domain registrar account

### DNS Tunneling
Encode data within DNS queries to bypass firewalls:
- C2 communication hidden in DNS
- Data exfiltration through DNS queries
- Bypasses firewalls that allow DNS (port 53)

### DNS Amplification DDoS
Use DNS servers to amplify attack traffic:
- Attacker sends small query with spoofed source IP
- DNS server sends large response to victim
- Amplification factor: 28-54x

### Domain Hijacking
Take control of a domain registration:
- Compromise registrar account
- Social engineer registrar support
- Exploit registrar vulnerabilities

---

## DNSSEC

**DNS Security Extensions** add authentication to DNS:

- Digitally signs DNS records
- Clients can verify responses are authentic
- Prevents spoofing and cache poisoning
- Does NOT encrypt queries (just authenticates)

```
Resolver asks: "What's the IP for example.com?"
Authoritative server responds: "93.184.216.34" + digital signature
Resolver verifies: Signature matches → trust the answer
```

---

## DNS over HTTPS (DoH) & DNS over TLS (DoT)

Encrypt DNS queries to prevent eavesdropping:

| Feature | Traditional DNS | DoH | DoT |
|---------|----------------|-----|-----|
| Port | 53 (UDP) | 443 (HTTPS) | 853 (TCP) |
| Encrypted | No | Yes | Yes |
| Inspectable | Yes | Looks like HTTPS | Identifiable |
| Adopted by | Everything | Browsers, apps | OS-level |

### Controversy:
- **Privacy benefit**: ISPs can't see your DNS queries
- **Security concern**: Bypasses enterprise DNS monitoring
- **Enterprise**: May block DoH to maintain visibility

---

## Protective DNS

Use DNS as a security control:

- **Block malicious domains** at the DNS level
- Prevent connections to known C2 servers
- Block phishing domains before the page loads
- Services: Cisco Umbrella, Cloudflare Gateway, Quad9

---

## DNS Monitoring

Watch for:
- Unusually long domain names (tunneling indicator)
- High volume of DNS queries to a single domain
- Queries to newly registered domains
- TXT record queries (often used in tunneling)
- DNS queries to non-standard ports

---

## Key Takeaways

- DNS is a prime attack target — controls where traffic goes
- **DNSSEC** authenticates responses (prevents spoofing)
- **DoH/DoT** encrypts queries (prevents eavesdropping)
- Use **protective DNS** to block malicious domains
- Monitor DNS for tunneling and exfiltration indicators
- Secure your domain registrar account with MFA

---

Next, we'll learn about **Wireless Network Security** →
