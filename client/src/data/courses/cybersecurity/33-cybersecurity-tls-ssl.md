---
title: TLS/SSL & HTTPS
---

# TLS/SSL & HTTPS

**TLS (Transport Layer Security)** encrypts communication between clients and servers, ensuring privacy and data integrity. HTTPS is simply HTTP over TLS. SSL is the deprecated predecessor — modern systems use TLS 1.2 or 1.3.

---

## TLS Handshake (TLS 1.2)

The handshake establishes a secure connection before any application data is exchanged:

| Step | Client | Server |
|------|--------|--------|
| 1 | ClientHello (supported ciphers, random) | |
| 2 | | ServerHello (chosen cipher, random) |
| 3 | | Certificate (server's X.509 cert) |
| 4 | | ServerHelloDone |
| 5 | ClientKeyExchange (pre-master secret) | |
| 6 | ChangeCipherSpec | |
| 7 | Finished (encrypted) | |
| 8 | | ChangeCipherSpec |
| 9 | | Finished (encrypted) |

After the handshake, both sides derive symmetric session keys and communicate using fast symmetric encryption.

---

## TLS 1.3 Improvements

TLS 1.3 (2018) is faster and more secure:

| Feature | TLS 1.2 | TLS 1.3 |
|---------|----------|----------|
| Handshake round-trips | 2 RTT | 1 RTT (0-RTT resumption) |
| Cipher suites | Many (including weak ones) | Only strong AEAD ciphers |
| Forward secrecy | Optional | Mandatory |
| RSA key exchange | Allowed | Removed |
| Algorithms removed | — | RC4, 3DES, SHA-1, static RSA |

---

## Cipher Suites

A cipher suite defines the algorithms used during a TLS session:

```
TLS_ECDHE_RSA_WITH_AES_256_GCM_SHA384
 │      │        │       │       │
 │      │        │       │       └── Hash for PRF
 │      │        │       └────────── AEAD mode
 │      │        └────────────────── Symmetric cipher
 │      └─────────────────────────── Authentication
 └────────────────────────────────── Key exchange
```

### TLS 1.3 Cipher Suites (simplified)

```
TLS_AES_256_GCM_SHA384
TLS_CHACHA20_POLY1305_SHA256
TLS_AES_128_GCM_SHA256
```

---

## Certificate Verification

When a browser connects via HTTPS, it verifies:

1. **Chain of trust** — certificate is signed by a trusted CA
2. **Domain match** — certificate's Subject Alternative Name (SAN) matches the URL
3. **Validity** — certificate is not expired
4. **Revocation** — certificate has not been revoked (OCSP/CRL)

```bash
# Test a server's TLS configuration
openssl s_client -connect example.com:443 -tls1_3

# Check certificate expiry
echo | openssl s_client -connect example.com:443 2>/dev/null | \
  openssl x509 -noout -dates
```

---

## Common TLS/SSL Attacks

| Attack | Description | Mitigation |
|--------|-------------|------------|
| **BEAST** (2011) | Exploits CBC mode in TLS 1.0 | Use TLS 1.2+ with AEAD ciphers |
| **POODLE** (2014) | Downgrades to SSL 3.0 to exploit CBC padding | Disable SSL 3.0 entirely |
| **Heartbleed** (2014) | OpenSSL buffer over-read leaks server memory | Patch OpenSSL, rotate keys |
| **DROWN** (2016) | Uses SSLv2 to decrypt TLS sessions | Disable SSLv2 on all servers |
| **ROBOT** (2017) | Bleichenbacher attack on RSA key exchange | Disable RSA key exchange |
| **Downgrade attacks** | Forces weaker protocol version | Enable TLS_FALLBACK_SCSV |

---

## HSTS (HTTP Strict Transport Security)

HSTS tells browsers to **always** use HTTPS for a domain, preventing protocol downgrade attacks.

```http
Strict-Transport-Security: max-age=31536000; includeSubDomains; preload
```

| Directive | Meaning |
|-----------|---------|
| `max-age` | Duration (seconds) browser remembers to force HTTPS |
| `includeSubDomains` | Applies to all subdomains |
| `preload` | Eligible for browser preload list (hardcoded HTTPS) |

---

## Testing TLS Configuration

```bash
# Using nmap
nmap --script ssl-enum-ciphers -p 443 example.com

# Using testssl.sh
./testssl.sh example.com

# Using curl to enforce TLS 1.3
curl --tlsv1.3 https://example.com
```

### Recommended Server Configuration (Nginx)

```nginx
server {
    listen 443 ssl;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers 'ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384';
    ssl_prefer_server_ciphers on;
    ssl_session_timeout 1d;
    ssl_session_cache shared:SSL:10m;
    add_header Strict-Transport-Security "max-age=63072000" always;
}
```

---

## Key Takeaways

- TLS encrypts data in transit; HTTPS = HTTP + TLS. Always use TLS 1.2 or 1.3.
- TLS 1.3 reduces handshake latency to 1 RTT and removes all legacy weak algorithms.
- The TLS handshake authenticates the server, negotiates ciphers, and derives session keys.
- Historical attacks (BEAST, POODLE, Heartbleed) highlight why keeping TLS updated matters.
- Enable HSTS to prevent protocol downgrade attacks and enforce HTTPS usage.

---

[Next: Public Key Infrastructure](34-cybersecurity-pki)
