---
title: HTTPS & TLS
---

# HTTPS & TLS

**HTTPS** encrypts all communication between client and server, protecting data from eavesdropping and tampering. Every production API must use HTTPS.

---

## What HTTPS Protects

| Without HTTPS | With HTTPS |
|---------------|------------|
| Anyone on the network can read requests | All data is encrypted |
| Headers (including auth tokens) visible | Headers encrypted |
| Request bodies visible | Bodies encrypted |
| URLs partially visible | Path encrypted (host visible via SNI) |
| Data can be tampered with | Integrity verified |

---

## TLS/SSL Certificates

HTTPS uses **TLS** (Transport Layer Security) certificates to encrypt connections:

```
1. Client connects to server
2. Server presents its TLS certificate
3. Client verifies certificate (trusted CA?)
4. Client and server negotiate encryption keys
5. All subsequent data is encrypted
```

### Getting a Certificate

**Development:**
```bash
# Self-signed (for local testing only)
openssl req -x509 -newkey rsa:4096 -keyout key.pem -out cert.pem -days 365 -nodes
```

**Production:**
- **Let's Encrypt**: Free, automated certificates
- **Cloud providers**: AWS ACM, Cloudflare — handle certificates for you
- **Reverse proxy**: Nginx or Caddy terminates TLS

---

## HTTPS in Express

### Direct (Development)

```javascript
import https from "https";
import fs from "fs";
import express from "express";

const app = express();

const options = {
  key: fs.readFileSync("key.pem"),
  cert: fs.readFileSync("cert.pem"),
};

https.createServer(options, app).listen(443);
```

### Via Reverse Proxy (Production)

In production, a reverse proxy (Nginx, Caddy) handles TLS:

```
Client ──HTTPS──▶ Nginx ──HTTP──▶ Express (port 3000)
                   TLS              (internal network)
                 termination
```

Express just handles HTTP. Force HTTPS by redirecting:

```javascript
app.use((req, res, next) => {
  if (req.headers["x-forwarded-proto"] !== "https" && process.env.NODE_ENV === "production") {
    return res.redirect(301, `https://${req.headers.host}${req.url}`);
  }
  next();
});
```

---

## HSTS Header

Tell browsers to always use HTTPS:

```javascript
app.use((req, res, next) => {
  res.set("Strict-Transport-Security", "max-age=31536000; includeSubDomains");
  next();
});

// Or use helmet:
import helmet from "helmet";
app.use(helmet());
```

---

## Key Takeaways

- **HTTPS is mandatory** for all production APIs
- Use a **reverse proxy** (Nginx, Caddy) for TLS termination in production
- Use **Let's Encrypt** or cloud provider certificates
- Set **HSTS header** to enforce HTTPS in browsers
- Never send credentials, tokens, or sensitive data over plain HTTP

---

Next, we'll learn about **Middleware** — building reusable request processing layers →
