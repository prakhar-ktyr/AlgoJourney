---
title: Digital Signatures & Certificates
---

# Digital Signatures & Certificates

Digital signatures prove that a message or document was created by a known sender and has not been altered. Certificates bind a public key to an identity, enabling trust on the internet.

---

## How Digital Signatures Work

Digital signatures use **asymmetric cryptography** (public/private key pairs):

1. The sender hashes the message (e.g., with SHA-256).
2. The sender encrypts the hash with their **private key** — this is the signature.
3. The receiver decrypts the signature with the sender's **public key**.
4. The receiver hashes the message independently and compares the two hashes.

```
Sender:
  message → SHA-256 → hash → encrypt(hash, private_key) → signature

Receiver:
  signature → decrypt(signature, public_key) → hash₁
  message → SHA-256 → hash₂
  If hash₁ == hash₂ → signature is VALID
```

---

## Properties of Digital Signatures

| Property | Description |
|----------|-------------|
| **Authentication** | Proves the signer's identity |
| **Integrity** | Detects any modification to the signed data |
| **Non-repudiation** | Signer cannot deny having signed the document |

---

## Common Signature Algorithms

| Algorithm | Key Type | Notes |
|-----------|----------|-------|
| RSA (PKCS#1 v1.5, PSS) | RSA | Widely supported, use 2048+ bit keys |
| ECDSA | Elliptic Curve | Shorter keys, faster, used in TLS/Bitcoin |
| EdDSA (Ed25519) | Edwards Curve | Modern, fast, deterministic |

### Signing with OpenSSL

```bash
# Generate a private key
openssl genpkey -algorithm RSA -out private.pem -pkeyopt rsa_keygen_bits:2048

# Sign a file
openssl dgst -sha256 -sign private.pem -out signature.bin document.pdf

# Verify the signature
openssl dgst -sha256 -verify public.pem -signature signature.bin document.pdf
```

---

## X.509 Certificates

An **X.509 certificate** is a digital document that binds a public key to an identity. It is the standard format used in TLS/HTTPS.

### Certificate Fields

| Field | Description |
|-------|-------------|
| Subject | Entity the certificate identifies (e.g., `CN=example.com`) |
| Issuer | CA that signed the certificate |
| Serial Number | Unique identifier assigned by the CA |
| Validity Period | Not Before / Not After dates |
| Public Key | The subject's public key |
| Signature | CA's digital signature over the certificate |
| Extensions | Key usage, SANs, constraints |

### Viewing a Certificate

```bash
# View a website's certificate
openssl s_client -connect example.com:443 | openssl x509 -text -noout
```

---

## Certificate Authorities (CAs)

A **Certificate Authority** is a trusted organization that issues and signs certificates.

| CA Type | Role |
|---------|------|
| Root CA | Self-signed, stored in OS/browser trust stores |
| Intermediate CA | Signed by root CA, issues end-entity certificates |
| End-entity | The actual website/server certificate |

Browsers and operating systems ship with a pre-installed list of trusted root CAs (~100–150 roots).

---

## Certificate Chain of Trust

```
Root CA (self-signed, in trust store)
  └── Intermediate CA (signed by Root)
        └── Server Certificate (signed by Intermediate)
```

When your browser connects to a site, it verifies the entire chain:
1. Is the server cert signed by a known intermediate?
2. Is the intermediate signed by a trusted root?
3. Are all certificates within their validity period?

---

## Certificate Revocation

Sometimes certificates must be invalidated before expiry (compromised key, misissuance).

| Method | How It Works | Pros | Cons |
|--------|-------------|------|------|
| **CRL** (Certificate Revocation List) | CA publishes a list of revoked serial numbers | Simple | Large files, infrequent updates |
| **OCSP** (Online Certificate Status Protocol) | Client queries CA for real-time status | Current info | Privacy concern (CA sees which sites you visit) |
| **OCSP Stapling** | Server fetches its own OCSP response and includes it in TLS handshake | Fast, private | Requires server support |

---

## Practical Example: Verifying a Certificate Chain

```bash
# Download the certificate chain
openssl s_client -showcerts -connect example.com:443 < /dev/null > chain.pem

# Verify the chain against system trust store
openssl verify -CAfile /etc/ssl/certs/ca-certificates.crt chain.pem
```

---

## Key Takeaways

- Digital signatures provide authentication, integrity, and non-repudiation using asymmetric cryptography.
- X.509 certificates bind public keys to identities and form the basis of internet trust.
- Certificate chains create a hierarchy from root CAs down to individual server certificates.
- Revocation (CRL/OCSP) handles compromised or invalid certificates before expiry.
- Always verify the full certificate chain when validating TLS connections.

---

[Next: TLS/SSL & HTTPS](33-cybersecurity-tls-ssl)
