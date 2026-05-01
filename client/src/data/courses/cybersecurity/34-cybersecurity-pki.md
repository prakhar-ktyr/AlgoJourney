---
title: Public Key Infrastructure
---

# Public Key Infrastructure

**Public Key Infrastructure (PKI)** is the framework of policies, hardware, software, and procedures that manage digital certificates and public keys. PKI enables secure communication, authentication, and trust across the internet.

---

## PKI Components

| Component | Role |
|-----------|------|
| **Certificate Authority (CA)** | Issues and signs certificates |
| **Registration Authority (RA)** | Verifies identity before CA issues a cert |
| **Certificate Repository** | Stores issued certificates and CRLs |
| **Certificate Revocation List (CRL)** | List of revoked certificates |
| **End Entity** | User, server, or device that holds a certificate |

---

## CA Hierarchy

PKI uses a hierarchical trust model:

```
Root CA (offline, self-signed)
├── Intermediate CA 1 (online, signs end-entity certs)
│   ├── web.example.com
│   └── api.example.com
└── Intermediate CA 2
    ├── mail.example.com
    └── vpn.example.com
```

### Why Intermediate CAs?

| Reason | Explanation |
|--------|-------------|
| Security | Root CA stays offline; compromise of intermediate doesn't destroy all trust |
| Flexibility | Different intermediates for different purposes (TLS, email, code signing) |
| Revocation | Can revoke an intermediate without replacing the root |

---

## Certificate Lifecycle

| Phase | Description |
|-------|-------------|
| **Request (CSR)** | Entity generates a key pair and submits a Certificate Signing Request |
| **Validation** | CA/RA verifies the requester's identity |
| **Issuance** | CA signs the certificate and returns it |
| **Usage** | Certificate is deployed on servers/clients |
| **Renewal** | New cert issued before expiry (usually automated) |
| **Revocation** | Certificate invalidated before expiry if compromised |
| **Expiry** | Certificate becomes invalid after Not After date |

### Generating a CSR

```bash
# Generate private key and CSR
openssl req -new -newkey rsa:2048 -nodes \
  -keyout server.key -out server.csr \
  -subj "/C=US/ST=California/L=SF/O=MyOrg/CN=example.com"

# View CSR contents
openssl req -in server.csr -text -noout
```

---

## Let's Encrypt

**Let's Encrypt** is a free, automated, open CA that issues Domain Validation (DV) certificates.

| Feature | Details |
|---------|---------|
| Cost | Free |
| Validation | Domain Validation only (proves domain control) |
| Validity | 90 days (encourages automation) |
| Protocol | ACME (Automated Certificate Management Environment) |
| Wildcard | Supported via DNS-01 challenge |

### Using Certbot

```bash
# Install and obtain a certificate
sudo certbot --nginx -d example.com -d www.example.com

# Auto-renewal (usually set up as a cron/systemd timer)
sudo certbot renew --dry-run
```

### ACME Challenge Types

| Challenge | Method | Use Case |
|-----------|--------|----------|
| HTTP-01 | Place a file at `/.well-known/acme-challenge/` | Standard web servers |
| DNS-01 | Add a TXT record to DNS | Wildcards, non-web services |
| TLS-ALPN-01 | Respond on port 443 with special TLS extension | When only port 443 is available |

---

## Certificate Pinning

**Certificate pinning** restricts which certificates a client accepts for a specific domain, preventing CA compromise or misissuance attacks.

| Pinning Method | Description |
|----------------|-------------|
| **HPKP** (deprecated) | HTTP header specifying expected public key hashes |
| **App-level pinning** | Mobile apps embed expected cert/key hashes |
| **DANE/TLSA** | DNS records specify expected certificates |

### Example: Pin in a Mobile App

```javascript
// React Native / fetch with pinning
const response = await fetch("https://api.example.com/data", {
  pinning: {
    certs: ["sha256/AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA="],
  },
});
```

> **Warning**: Pinning can cause outages if certificates rotate without updating pins. Use with caution and always pin the backup key.

---

## Key Management Best Practices

| Practice | Why It Matters |
|----------|---------------|
| Keep root CA keys offline | Prevents remote compromise |
| Use HSMs (Hardware Security Modules) | Tamper-resistant key storage |
| Rotate keys regularly | Limits exposure window if compromised |
| Use separate keys for different purposes | Signing key ≠ encryption key |
| Enforce minimum key sizes | RSA ≥ 2048 bits, ECDSA ≥ 256 bits |
| Automate certificate renewal | Prevents expiry-related outages |
| Monitor Certificate Transparency logs | Detect unauthorized issuance |

---

## Certificate Transparency (CT)

CT is a public logging system where CAs must publish all issued certificates. This allows domain owners to detect misissuance.

```bash
# Search CT logs for your domain
# Visit https://crt.sh/?q=example.com
# or use command line
curl "https://crt.sh/?q=example.com&output=json" | jq '.[0:5]'
```

---

## Key Takeaways

- PKI provides the trust framework for digital certificates through a hierarchy of CAs.
- Root CAs should remain offline; intermediate CAs handle day-to-day certificate issuance.
- Let's Encrypt democratized TLS with free, automated certificates using the ACME protocol.
- Certificate pinning adds defense-in-depth but requires careful key rotation planning.
- Good key management (HSMs, rotation, minimum sizes, CT monitoring) is essential for PKI security.

---

[Next: Authentication Methods](35-cybersecurity-authentication)
